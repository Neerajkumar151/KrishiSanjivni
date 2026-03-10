import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserList } from '@/components/chat/UserList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { BroadcastPanel } from '@/components/chat/BroadcastPanel';
import { AdminMessage, ChatUser } from '@/components/chat/types';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const AdminMessagesPage: React.FC = () => {
    const { user, profile } = useAuth();
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | undefined>();
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Fetch all users for the side panel
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select(`
          user_id, full_name, avatar_url, role
        `)
                .neq('user_id', user?.id || '');

            if (profileError) throw profileError;

            // Manually find unread counts and last messages
            const { data: messagesData, error: msgError } = await (supabase as any)
                .from('admin_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (msgError) throw msgError;

            // Process raw data into ChatUser shapes
            const userList: ChatUser[] = (profiles as any[]).map((p) => {
                // Find messages involving this user
                const userMsgs = (messagesData as AdminMessage[]).filter(
                    m => m.sender_id === p.user_id || m.receiver_id === p.user_id
                );

                let unread = 0;
                let lastMsg = '';
                let lastTime = '';

                if (userMsgs.length > 0) {
                    // messages are ordered by desc, so userMsgs[0] is the latest
                    lastMsg = userMsgs[0].message;
                    lastTime = userMsgs[0].created_at;

                    // unread count: we are receiver and it's not read
                    unread = userMsgs.filter(m => m.receiver_id === user?.id && !m.is_read).length;
                }

                return {
                    user_id: p.user_id,
                    full_name: p.full_name,
                    avatar_url: p.avatar_url,
                    role: p.role || 'farmer',
                    last_message: lastMsg,
                    last_message_time: lastTime,
                    unread_count: unread
                };
            });

            // Sort by last message time (descending)
            userList.sort((a, b) => {
                if (!a.last_message_time) return 1;
                if (!b.last_message_time) return -1;
                return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
            });

            setUsers(userList);
        } catch (e) {
            console.error("Error fetching users:", e);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Fetch specific conversation
    const fetchMessages = async (recipientId: string) => {
        if (!user) return;
        setIsLoadingMessages(true);
        try {
            const { data, error } = await (supabase as any)
                .from('admin_messages')
                .select('*')
                .eq('is_broadcast', false)
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data as AdminMessage[]);

            // Mark unread as read immediately
            const unreadIds = data
                .filter(m => m.receiver_id === user.id && !m.is_read)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                await (supabase as any)
                    .from('admin_messages')
                    .update({ is_read: true })
                    .in('id', unreadIds);

                // Update local user list to clear badge
                setUsers(prev => prev.map(u =>
                    u.user_id === recipientId ? { ...u, unread_count: 0 } : u
                ));
            }

        } catch (e) {
            console.error("Error fetching messages", e);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        // Subscribe to all incoming admin messages
        const channel = supabase
            .channel('admin_messages_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'admin_messages'
                },
                (payload) => {
                    const newMsg = payload.new as AdminMessage;

                    // If message belongs to currently open chat, append it.
                    // IMPORTANT: Avoid duplicates (e.g., from our own optimistic updates)
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;

                        if (
                            selectedUser && !newMsg.is_broadcast &&
                            ((newMsg.sender_id === user?.id && newMsg.receiver_id === selectedUser.user_id) ||
                                (newMsg.sender_id === selectedUser.user_id && newMsg.receiver_id === user?.id))
                        ) {
                            // If we are receiving it while open, mark as read immediately
                            if (newMsg.receiver_id === user?.id) {
                                (supabase as any).from('admin_messages').update({ is_read: true }).eq('id', newMsg.id).then();
                            }
                            return [...prev, newMsg];
                        }
                        return prev;
                    });

                    // In all cases, refresh user list to update last message & badges
                    // (Can be optimized, but fetchUsers() is simple enough for now)
                    fetchUsers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, selectedUser]);

    const handleSelectUser = (u: ChatUser) => {
        setSelectedUser(u);
        fetchMessages(u.user_id);
    };

    const handleSendMessage = async (text: string) => {
        if (!user || !selectedUser || !text.trim()) return;

        // Optimistic UI update
        const optimisticMsg: AdminMessage = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: selectedUser.user_id,
            message: text.trim(),
            is_broadcast: false,
            is_read: false,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data, error } = await (supabase as any)
                .from('admin_messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: selectedUser.user_id,
                    message: text.trim(),
                    is_broadcast: false,
                    is_read: false
                }).select().single();

            if (error) {
                // rollback
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                throw error;
            } else if (data) {
                // replace optimistic with real (so ID matches for realtime)
                setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data as AdminMessage : m));
            }
        } catch (e) {
            console.error("Error sending message", e);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4 relative w-full overflow-hidden">
            <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">Messages</h1>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Manage private chats and broadcast announcements.</p>
                </div>

                <div className="w-full sm:flex-1 sm:max-w-md">
                    <BroadcastPanel />
                </div>
            </div>

            <div className="flex flex-1 rounded-xl border bg-card shadow-sm overflow-hidden min-h-0 min-w-0 relative">
                {/* Left Sidebar - Users List - Hidden on mobile if user is selected */}
                <div className={cn(
                    "w-full lg:w-[300px] shrink-0 border-r h-full flex flex-col min-w-0 transition-all duration-300",
                    selectedUser ? "hidden lg:flex" : "flex"
                )}>
                    <UserList
                        users={users}
                        selectedUserId={selectedUser?.user_id}
                        onSelectUser={handleSelectUser}
                        isLoading={isLoadingUsers}
                    />
                </div>

                {/* Right Content - Chat Window - Hidden on mobile if no user is selected */}
                <div className={cn(
                    "flex-1 h-full overflow-hidden min-w-0 flex flex-col",
                    !selectedUser ? "hidden lg:flex" : "flex"
                )}>
                    {selectedUser && (
                        <div className="lg:hidden p-2 border-b bg-muted/30">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => setSelectedUser(null)}
                            >
                                <ChevronDown className="h-4 w-4 rotate-90" />
                                Back to Messages
                            </Button>
                        </div>
                    )}
                    <ChatWindow
                        currentUser={user}
                        currentUserProfile={profile}
                        recipientUser={selectedUser}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoadingMessages}
                    />
                </div>
            </div>
        </div>
    );
};
