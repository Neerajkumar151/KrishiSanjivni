import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, XCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

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
    const { user, profile } = useAuth();
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
            let fileUrl: string | null = null;
            if (fileToUpload) {
                const fileName = `${user.id}/${Date.now()}-${fileToUpload.name}`;
                const { data, error: uploadError } = await supabase.storage.from('chat_uploads').upload(fileName, fileToUpload);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('chat_uploads').getPublicUrl(data.path);
                fileUrl = publicUrl;
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

        } catch (error: any) {
            console.error("Detailed send error:", error);
            toast({ title: 'Failed to Send Message', description: error.message, variant: 'destructive' });
        } finally {
            setIsSending(false);
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
                            const isCurrentUser = msg.user_id === user?.id;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                                    {!isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.profiles?.avatar_url} />
                                            <AvatarFallback>{msg.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {!isCurrentUser && <p className="text-xs font-bold mb-1">{msg.profiles?.full_name || 'User'}</p>}
                                        {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}
                                        {msg.file_url && renderFileContent(msg.file_url)}
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
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
                            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setFileToUpload(e.target.files[0])} className="hidden" />
                            <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message or upload a file..." disabled={isSending} autoComplete="off" />
                            <Button type="submit" size="icon" disabled={isSending}>
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center text-muted-foreground pt-4 border-t">{t('chat.login_to_chat', 'Please log in to join the chat.')}</p>
                )}
            </div>
        </Layout>
    );
};