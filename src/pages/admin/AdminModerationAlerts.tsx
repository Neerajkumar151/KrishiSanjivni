import React, { useEffect, useState } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Shield, Ban, UserCircle, Check } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ModerationItem {
    id: string;
    user_id: string;
    message: string;
    reason: string;
    is_reviewed: boolean;
    created_at: string;
    user_name?: string;
    user_status?: 'active' | 'banned';
}

export const AdminModerationAlerts: React.FC = () => {
    const { loading: authLoading } = useAdminCheck();
    const [items, setItems] = useState<ModerationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Cache of user_id -> { name, status }
    const [userProfiles, setUserProfiles] = useState<Record<string, { name: string, status: 'active' | 'banned' }>>({});

    const resolveUserProfiles = async (logs: ModerationItem[]) => {
        const uniqueUserIds = [...new Set(logs.map(l => l.user_id))];
        const unknownIds = uniqueUserIds.filter(id => !userProfiles[id]);

        if (unknownIds.length === 0) {
            return logs.map(l => ({
                ...l,
                user_name: userProfiles[l.user_id]?.name || 'Unknown',
                user_status: userProfiles[l.user_id]?.status || 'active'
            }));
        }

        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name, status')
            .in('user_id', unknownIds);

        const newProfiles = { ...userProfiles };
        profiles?.forEach((p: any) => {
            newProfiles[p.user_id] = { name: p.full_name || 'Unknown', status: p.status || 'active' };
        });
        setUserProfiles(newProfiles);

        return logs.map(l => ({
            ...l,
            user_name: newProfiles[l.user_id]?.name || 'Unknown',
            user_status: newProfiles[l.user_id]?.status || 'active'
        }));
    };

    useEffect(() => {
        fetchLogs();

        const channel = supabase
            .channel('moderation_logs_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moderation_logs' }, async (payload) => {
                const newItem = payload.new as ModerationItem;
                const resolved = await resolveUserProfiles([newItem]);
                setItems(current => [resolved[0], ...current]);
                toast({
                    title: '🚫 Message Blocked',
                    description: `${resolved[0].user_name} tried to send a blocked message.`,
                    variant: 'destructive',
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'moderation_logs' }, (payload) => {
                setItems(current =>
                    current.map(item => item.id === payload.new.id
                        ? { ...item, ...(payload.new as ModerationItem) }
                        : item
                    )
                );
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('moderation_logs' as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: 'Error', description: 'Failed to fetch logs', variant: 'destructive' });
            setLoading(false);
            return;
        }

        const logs = (data as any as ModerationItem[]) || [];
        const resolved = await resolveUserProfiles(logs);
        setItems(resolved);
        setLoading(false);
    };

    const handleMarkReviewed = async (id: string) => {
        const { error } = await supabase
            .from('moderation_logs' as any)
            .update({ is_reviewed: true })
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            setItems(current =>
                current.map(item => item.id === id ? { ...item, is_reviewed: true } : item)
            );
            toast({ title: 'Log marked as reviewed' });
        }
    };

    const handleUpdateUserStatus = async (userId: string, userName: string, status: 'active' | 'banned') => {
        // Optimistic UI Update: update the status for all logs belonging to this user
        setItems(current => current.map(item =>
            item.user_id === userId ? { ...item, user_status: status } : item
        ));

        // Also update cache
        setUserProfiles(current => ({
            ...current,
            [userId]: { ...current[userId], status }
        }));

        try {
            const { error: banError } = await supabase
                .from('profiles')
                .update({ status } as any)
                .eq('user_id', userId);

            if (banError) throw banError;

            if (status === 'banned') {
                // Delete all their messages
                await supabase.from('messages').delete().eq('user_id', userId);
                toast({ title: `🔨 ${userName} has been banned`, description: 'All their messages have been deleted.' });
            } else {
                toast({ title: `✅ ${userName} has been unbanned` });
            }
        } catch (error: any) {
            // Revert optimistic update
            setItems(current => current.map(item =>
                item.user_id === userId ? { ...item, user_status: status === 'banned' ? 'active' : 'banned' } : item
            ));
            setUserProfiles(current => ({
                ...current,
                [userId]: { ...current[userId], status: status === 'banned' ? 'active' : 'banned' }
            }));
            toast({ title: 'Status update failed', description: error.message, variant: 'destructive' });
        }
    };

    if (authLoading || loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const unreviewedCount = items.filter(a => !a.is_reviewed).length;

    const getBadgeType = (reason: string) => {
        if (reason.includes('Profanity')) return 'destructive';
        if (reason.includes('AI')) return 'warning';
        if (reason.includes('Rate limit')) return 'secondary';
        return 'outline';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    Community Moderation
                </h1>
                <p className="text-muted-foreground">
                    History of all blocked messages — see who sent them and take action.
                    {unreviewedCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {unreviewedCount} pending review
                        </Badge>
                    )}
                </p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No moderation logs yet. The community is clean! 🌱</p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Status</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Blocked Message</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} className={!item.is_reviewed ? 'bg-destructive/5' : ''}>
                                    <TableCell>
                                        {item.is_reviewed ? (
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-destructive" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-medium text-sm whitespace-nowrap">
                                                {item.user_name || 'Unknown'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs font-mono text-sm break-words">
                                        {item.message}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getBadgeType(item.reason) as any}
                                            className="text-xs whitespace-nowrap"
                                        >
                                            {item.reason.split(':')[0]}
                                        </Badge>
                                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                                            {item.reason.includes(':') ? item.reason.split(':')[1].trim() : ''}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(item.created_at).toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!item.is_reviewed && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMarkReviewed(item.id)}
                                                >
                                                    Mark Reviewed
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    {item.user_status === 'banned' ? (
                                                        <Button variant="outline" size="sm" className="gap-1 border-primary text-primary hover:bg-primary/10">
                                                            <Check className="h-3 w-3" />
                                                            Unban
                                                        </Button>
                                                    ) : (
                                                        <Button variant="destructive" size="sm" className="gap-1">
                                                            <Ban className="h-3 w-3" />
                                                            Ban
                                                        </Button>
                                                    )}
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            {item.user_status === 'banned' ? `Unban ${item.user_name}?` : `Ban ${item.user_name || 'this user'}?`}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {item.user_status === 'banned'
                                                                ? `This will unban ${item.user_name} and allow them to send messages in the community chat again.`
                                                                : `This will ban ${item.user_name} from the community chat and delete all their messages. They can still access the rest of the website.`}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleUpdateUserStatus(item.user_id, item.user_name || 'Unknown', item.user_status === 'banned' ? 'active' : 'banned')}
                                                            className={item.user_status === 'banned' ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
                                                        >
                                                            {item.user_status === 'banned' ? 'Yes, Unban User' : 'Yes, Ban User'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};
