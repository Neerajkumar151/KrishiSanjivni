import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { AdminMessage } from '@/components/chat/types';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const UserAdminChatPage: React.FC = () => {
    const { user, profile, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // We need to find an admin ID to send messages to
    const [adminId, setAdminId] = useState<string | null>(null);

    useEffect(() => {
        const initChat = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                // Find an admin user (we can check profiles if user_roles fails)
                let mainAdminId = null;
                const { data: admins, error: adminErr } = await supabase
                    .from('user_roles')
                    .select('user_id')
                    .eq('role', 'admin')
                    .limit(1);

                if (!adminErr && admins && admins.length > 0) {
                    mainAdminId = admins[0].user_id;
                } else {
                    // Fallback to checking profiles table if user_roles is empty
                    const { data: profileAdmins } = await supabase
                        .from('profiles')
                        .select('user_id')
                        .eq('role', 'admin')
                        .limit(1);
                    if (profileAdmins && profileAdmins.length > 0) {
                        mainAdminId = profileAdmins[0].user_id;
                    }
                }

                // If still no admin found, just pick the oldest active user as a fallback (for demo purposes)
                if (!mainAdminId) {
                    const { data: anyUser } = await supabase.from('profiles').select('user_id').order('created_at', { ascending: true }).limit(1);
                    if (anyUser && anyUser.length > 0) {
                        mainAdminId = anyUser[0].user_id;
                    }
                }

                if (mainAdminId) {
                    setAdminId(mainAdminId);
                }

                // Fetch user's conversation history with ANY admin or broadcasts
                // A user sees messages they sent to anyone (admins) or received from anyone (admins/broadcasts)
                const { data: msgs, error: msgErr } = await (supabase as any)
                    .from('admin_messages')
                    .select('*')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: true });

                if (msgErr) throw msgErr;
                setMessages(msgs as AdminMessage[]);

                // Mark unread as read immediately
                const unreadIds = (msgs as AdminMessage[])
                    .filter(m => m.receiver_id === user.id && !m.is_read)
                    .map(m => m.id);

                if (unreadIds.length > 0) {
                    await (supabase as any)
                        .from('admin_messages')
                        .update({ is_read: true })
                        .in('id', unreadIds);
                }

            } catch (e) {
                console.error("Error fetching chat", e);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();

        // Subscribe to incoming messages
        const channel = supabase
            .channel('user_admin_chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'admin_messages',
                    filter: `receiver_id=eq.${user?.id}`
                },
                (payload) => {
                    const newMsg = payload.new as AdminMessage;
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });

                    // Mark as read immediately
                    if (newMsg.receiver_id === user?.id) {
                        (supabase as any).from('admin_messages').update({ is_read: true }).eq('id', newMsg.id).then();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        // Auto scroll to bottom
        if (scrollRef.current) {
            const scrollViewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollViewport) {
                scrollViewport.scrollTop = scrollViewport.scrollHeight;
            }
        }
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!user || !text.trim() || !adminId) return;

        // Optimistic UI update
        const optimisticMsg: AdminMessage = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: adminId,
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
                    receiver_id: adminId,
                    message: text.trim(),
                    is_broadcast: false,
                    is_read: false
                }).select().single();

            if (error) {
                // rollback optimistic update on failure
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                throw error;
            } else if (data) {
                // replace optimistic with real
                setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data as AdminMessage : m));
            }

            // We don't need to append here if we trust the real-time sub.

            // But actually, we don't subscribe to our ALREADY SENT messages in this channel setup
            // since the filter is receiver=user.id. So optimistic update is perfect.

        } catch (e) {
            console.error("Error sending message", e);
        }
    };

    const broadcastMessages = messages.filter(m => m.is_broadcast);
    const privateMessages = messages.filter(m => !m.is_broadcast);

    if (isAdmin) {
        return (
            <Layout>
                <div className="container max-w-5xl mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="bg-white dark:bg-card p-10 rounded-2xl shadow-sm border border-border text-center max-w-lg w-full flex flex-col items-center">
                        <div className="bg-primary/10 p-5 rounded-full mb-6">
                            <ShieldCheck className="w-16 h-16 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3 tracking-tight text-foreground">{t('adminChat.adminModeTitle')}</h2>
                        <p className="text-muted-foreground mb-8 text-base leading-relaxed whitespace-pre-wrap">
                            {t('adminChat.adminModeDesc')}
                        </p>
                        <button
                            onClick={() => navigate('/admin/messages')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-8 rounded-xl transition-all shadow-md w-full flex items-center justify-center gap-2 group"
                        >
                            {t('adminChat.openAdminArea')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container max-w-5xl mx-auto py-4 md:py-8 px-4 flex flex-col md:h-[calc(100vh-80px)] min-h-[calc(100vh-80px)]">

                <div className="flex items-center gap-3 mb-4 md:mb-6 bg-white dark:bg-card p-4 rounded-xl shadow-sm border shrink-0">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('adminChat.title')}</h1>
                        <p className="text-muted-foreground text-sm">
                            {t('adminChat.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 pb-6 md:pb-0">

                    {/* Broadcast Panel */}
                    <div className="w-full md:w-1/3 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden h-[400px] md:h-full shrink-0">
                        <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-foreground">{t('adminChat.officialAnnouncements')}</h2>
                            <div className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {broadcastMessages.length}
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-4 bg-muted/5">
                            {broadcastMessages.length === 0 ? (
                                <div className="text-center text-sm text-muted-foreground my-8">
                                    {t('adminChat.noAnnouncements')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {broadcastMessages.reverse().map((msg) => (
                                        <div key={msg.id} className="bg-background border-l-4 border-l-primary rounded-r-lg p-3 shadow-sm text-sm">
                                            <div className="font-semibold text-primary mb-1 text-xs uppercase tracking-wider">{t('adminChat.systemBroadcast')}</div>
                                            <p className="whitespace-pre-wrap text-foreground/90">{msg.message}</p>
                                            <div className="text-[10px] text-muted-foreground mt-2 text-right">
                                                {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Private Chat Panel */}
                    <div className="w-full md:w-2/3 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden h-[500px] md:h-full shrink-0">
                        <div className="p-3 bg-muted/30 border-b text-center text-xs text-muted-foreground">
                            {t('adminChat.privateChatWarning')}
                        </div>

                        <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-muted/5">
                            <div className="max-w-2xl mx-auto space-y-2 pb-4">
                                {isLoading ? (
                                    <div className="text-center text-sm text-muted-foreground my-8">
                                        {t('adminChat.loadingHistory')}
                                    </div>
                                ) : privateMessages.length === 0 ? (
                                    <div className="text-center text-sm text-muted-foreground my-12">
                                        {t('adminChat.noMessages')}
                                    </div>
                                ) : (
                                    privateMessages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg.message}
                                            isOwnMessage={msg.sender_id === user?.id}
                                            timestamp={msg.created_at}
                                            isBroadcast={msg.is_broadcast}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        <div className="border-t bg-background">
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                isLoading={isLoading || !adminId}
                                placeholder={!adminId ? t('adminChat.initializing') : t('adminChat.typeMessage')}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};
