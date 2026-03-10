import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const BroadcastPanel: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleBroadcast = async () => {
        if (!message.trim()) return;

        try {
            setIsSending(true);

            // Get all profile IDs
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('user_id');

            if (profileError) throw profileError;

            const { data: userData } = await supabase.auth.getUser();
            const adminId = userData.user?.id;

            if (!adminId) throw new Error('Not authenticated');

            // Create payload for all users except the admin themselves
            const payloads = profiles
                .filter(p => p.user_id !== adminId)
                .map(p => ({
                    sender_id: adminId,
                    receiver_id: p.user_id,
                    message: message.trim(),
                    is_broadcast: true,
                    is_read: false
                }));

            if (payloads.length === 0) {
                toast({ title: 'Info', description: 'No other users found to broadcast to.' });
                return;
            }

            // Batch insert broadcast messages
            const { error: insertError } = await (supabase as any)
                .from('admin_messages')
                .insert(payloads);

            if (insertError) throw insertError;

            toast({
                title: 'Broadcast Sent',
                description: `Message successfully sent to ${payloads.length} users.`,
            });

            setMessage('');
        } catch (error: any) {
            console.error('Broadcast error:', error);
            toast({
                title: 'Broadcast Failed',
                description: error.message || 'An error occurred while sending.',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                    <Megaphone className="h-5 w-5" />
                    <CardTitle className="text-lg">Broadcast Message</CardTitle>
                </div>
                <CardDescription>Send a message to all registered users simultaneously.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    <Textarea
                        placeholder="Type your announcement here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[100px] resize-y bg-background"
                        disabled={isSending}
                    />
                    <Button
                        className="self-end gap-2 shadow-sm"
                        onClick={handleBroadcast}
                        disabled={!message.trim() || isSending}
                    >
                        {isSending ? 'Sending...' : 'Send Broadcast'}
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};