import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, XCircle, Loader2, Trash2, UserX } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
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
import { moderateMessage } from '@/lib/moderationPipeline';
import { preloadModel } from '@/lib/toxicityDetector';
import { shouldAIRespond } from '@/lib/ai/intentDetection';
import { canAIReply } from '@/lib/ai/aiCooldown';
import { generateAIResponse } from '@/lib/ai/aiAssistant';

// Define the data structure for a message
interface Message {
    id: number;
    created_at: string;
    message: string;
    user_id: string;
    file_url?: string;
    profiles: {
        full_name: string;
        avatar_url?: string;
    } | null;
    is_ai_message?: boolean;
}

// Helper component to render uploaded files
const renderFileContent = (url: string) => {
    const fileType = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
        return <img src={url} alt="Uploaded content" loading="lazy" className="mt-2 rounded-lg max-w-xs md:max-w-sm cursor-pointer" onClick={() => window.open(url, '_blank')} />;
    }
    if (['mp4', 'webm', 'mov'].includes(fileType)) {
        return <video src={url} controls className="mt-2 rounded-lg max-w-xs md:max-w-sm" />;
    }
    return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 block">Download File</a>;
};

export const ChatPage: React.FC = () => {
    const { t } = useTranslation();
    const { user, profile, isAdmin, isBanned } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Function to scroll to the bottom of the chat
    const scrollToBottom = () => {
        const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    };

    // Preload the AI toxicity model in background
    useEffect(() => {
        preloadModel().catch(() => console.warn('Toxicity model preload skipped'));
    }, []);

    // Fetch initial messages and subscribe to real-time updates
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select(`*, profiles (full_name, avatar_url)`)
                .eq('channel_id', 1)
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
            } else {
                setMessages(data as Message[]);
            }
            setLoading(false);
        };

        fetchMessages();

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                // To prevent duplicates, only add messages from other users via real-time
                if (payload.new.user_id !== user?.id) {
                    // Fetch profile for the new message to display it correctly
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('user_id', payload.new.user_id)
                        .single();

                    const incomingMessage = { ...payload.new, profiles: profileData } as Message;
                    setMessages(currentMessages => [...currentMessages, incomingMessage]);
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
                setMessages(currentMessages => currentMessages.filter(msg => msg.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !fileToUpload) || !user || !profile) {
            toast({ title: 'Cannot send message', description: 'You must be logged in to chat.', variant: 'destructive' });
            return;
        }

        setIsSending(true);
        try {
            // === MODERATION PIPELINE ===
            if (newMessage.trim()) {
                const modResult = await moderateMessage(user.id, newMessage.trim());
                if (!modResult.allowed) {
                    toast({
                        title: modResult.type === 'rate_limit'
                            ? '⏳ Slow down!'
                            : modResult.type === 'profanity'
                                ? '🚫 Message Blocked'
                                : '⚠️ Message Flagged',
                        description: modResult.reason || 'Your message violates community guidelines.',
                        variant: 'destructive',
                    });
                    setIsSending(false);
                    return;
                }
            }

            let fileUrl: string | null = null;
            if (fileToUpload) {
                // Check file size (2MB limit)
                if (fileToUpload.size > 2 * 1024 * 1024) {
                    toast({
                        title: "File too large",
                        description: "Maximum file size allowed is 2MB.",
                        variant: "destructive"
                    });
                    setIsSending(false);
                    return;
                }

                try {
                    const fileName = `${user.id}/${Date.now()}-${fileToUpload.name}`;
                    const { data, error: uploadError } = await supabase.storage.from('chat_uploads').upload(fileName, fileToUpload);
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from('chat_uploads').getPublicUrl(data.path);
                    fileUrl = publicUrl;
                } catch (uploadErr) {
                    console.error("Upload Error:", uploadErr);
                    toast({ title: "Upload Failed", description: "Could not upload file. Make sure it's not too large.", variant: "destructive" });
                    setIsSending(false);
                    return;
                }
            }

            // **Simplified Insert:** The database now handles the 'profile_id' automatically.
            const messageToInsert = {
                message: newMessage.trim(),
                user_id: user.id,
                channel_id: 1,
                file_url: fileUrl
            };

            const { data: insertedMessage, error: insertError } = await supabase
                .from('messages')
                .insert(messageToInsert)
                .select()
                .single();

            if (insertError) throw insertError;

            // **Instant UI Update:** Add the new message to the screen immediately.
            const optimisticMessage: Message = {
                ...insertedMessage,
                profiles: {
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                },
            };
            setMessages(currentMessages => [...currentMessages, optimisticMessage]);

            // Clear the input fields on success
            setNewMessage('');
            setFileToUpload(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // === AI ASSISTANT PIPELINE ===
            // Run asynchronously without blocking the user
            setTimeout(async () => {
                if (!messageToInsert.message) return; // Only AI respond to text
                if (!shouldAIRespond(messageToInsert.message)) return;
                if (!canAIReply()) return;

                try {
                    const aiReply = await generateAIResponse(messageToInsert.message);

                    const aiMessageToInsert = {
                        message: aiReply,
                        user_id: user.id, // Using the user's ID as the "sender" context, but flagged as AI
                        channel_id: 1,
                        is_ai_message: true
                    };

                    const { data: insertedAIMessage, error: aiInsertError } = await supabase
                        .from('messages')
                        .insert(aiMessageToInsert)
                        .select()
                        .single();

                    if (aiInsertError) console.error("AI Insert Error:", aiInsertError);

                    if (insertedAIMessage) {
                        setMessages(currentMessages => [...currentMessages, {
                            ...insertedAIMessage,
                            profiles: { full_name: 'KrishiSanjivni AI', avatar_url: undefined }
                        } as Message]);
                    }

                } catch (error) {
                    console.error("AI Assistant Error:", error);
                }
            }, 500);

        } catch (error: any) {
            console.error("Failed to send message:", error);
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong while sending your message.',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            const { error } = await supabase.from('messages').delete().eq('id', messageId);
            if (error) throw error;
            setMessages(currentMessages => currentMessages.filter(msg => msg.id !== messageId));
            toast({ title: t('chat.message_deleted', 'Message deleted') });
        } catch (error: any) {
            toast({ title: t('error.delete_failed', 'Failed to delete message'), description: error.message, variant: 'destructive' });
        }
    };

    const handleBanUser = async (targetUserId: string, targetUserName: string) => {
        try {
            // 1. Ban the user in profiles
            const { error: banError } = await supabase
                .from('profiles')
                .update({ status: 'banned' })
                .eq('user_id', targetUserId);

            if (banError) throw banError;

            // 2. Delete all their messages
            const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('user_id', targetUserId);

            if (deleteError) throw deleteError;

            // 3. Update UI
            setMessages(currentMessages => currentMessages.filter(msg => msg.user_id !== targetUserId));
            toast({ title: t('chat.user_banned', 'User has been banned') });
        } catch (error: any) {
            toast({ title: t('error.ban_failed', 'Failed to ban user'), description: error.message, variant: 'destructive' });
        }
    };

    return (
        <Layout>
            <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-4">
                <h1 className="text-2xl font-bold mb-4 border-b pb-2">{t('chat.general_chat', 'General Chat')}</h1>
                <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {loading && <p className="text-center text-muted-foreground">{t('common.loading', 'Loading chat...')}</p>}
                        {messages.map((msg) => {
                            const isCurrentUser = msg.user_id === user?.id && !msg.is_ai_message;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                                    {!isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.profiles?.avatar_url} />
                                            <AvatarFallback>{msg.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.is_ai_message ? 'bg-green-100 text-green-900 border border-green-300' : isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} relative group`}>
                                        {msg.is_ai_message && (
                                            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-green-200 font-semibold text-green-800 text-sm">
                                                <span className="text-lg">🌾</span> KrishiSanjivni AI
                                            </div>
                                        )}
                                        {!isCurrentUser && !msg.is_ai_message && <p className="text-xs font-bold mb-1">{msg.profiles?.full_name || 'User'}</p>}
                                        {msg.message && (
                                            msg.is_ai_message ? (
                                                <div className="prose prose-sm prose-green max-w-none break-words">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.message}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                            )
                                        )}
                                        {msg.file_url && renderFileContent(msg.file_url)}

                                        <div className="flex items-center justify-between mt-2 gap-2">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(isAdmin || isCurrentUser) && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className={`h-5 w-5 ${isCurrentUser ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground hover:text-destructive'}`}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('chat.confirm_delete_title', 'Delete Message')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('chat.confirm_delete_desc', 'Are you sure you want to delete this message? This action cannot be undone.')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    {t('common.delete', 'Delete')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                                {isAdmin && !isCurrentUser && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive">
                                                                <UserX className="h-3 w-3" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('chat.confirm_ban_title', 'Ban User')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('chat.confirm_ban_desc', 'Are you sure you want to ban')} {msg.profiles?.full_name || 'User'}? {t('chat.ban_consequence', 'This will also delete all their messages and prevent them from chatting again.')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleBanUser(msg.user_id, msg.profiles?.full_name || 'User')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    {t('chat.ban', 'Ban User')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                            <p className={`text-xs ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={profile?.avatar_url} />
                                            <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase() || 'Me'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
                {user ? (
                    isBanned ? (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center text-destructive">
                            {t('chat.banned_message', 'Your account has been banned from participating in the chat.')}
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex flex-col gap-2 pt-2 border-t">
                            {fileToUpload && (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="flex-grow truncate">{fileToUpload.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFileToUpload(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 2 * 1024 * 1024) {
                                                toast({ title: "File too large", description: "Please select a file smaller than 2MB.", variant: "destructive" });
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                                return;
                                            }
                                            setFileToUpload(file);
                                        }
                                    }}
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message or upload a file..." disabled={isSending} autoComplete="off" />
                                <Button type="submit" size="icon" disabled={isSending}>
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    )
                ) : (
                    <p className="text-center text-muted-foreground pt-4 border-t">{t('chat.login_to_chat', 'Please log in to join the chat.')}</p>
                )}
            </div>
        </Layout>
    );
};