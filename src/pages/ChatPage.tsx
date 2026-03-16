import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, XCircle, Loader2, Trash2, UserX, CheckSquare, Square, Trash } from 'lucide-react';
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
import { moderateWithAI } from '@/lib/aiModeration';
import { preloadModel } from '@/lib/toxicityDetector';
import { shouldAIRespond } from '@/lib/ai/intentDetection';
import { canAIReply, getCooldownRemaining, COOLDOWN_MS } from '@/lib/ai/aiCooldown';
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
    is_flagged?: boolean; // Added to support AI toxicity blurring
}

interface QueueItem {
    message: string;
    userName: string;
    userId: string;
    wasMentioned: boolean; // Track if the user explicitly called the AI
    moderationPromise?: Promise<any>;
}

// Helper component to render uploaded files
const renderFileContent = (url: string) => {
    const fileType = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
        return <img src={url} alt="User uploaded image in chat" loading="lazy" className="mt-2 rounded-lg max-w-xs md:max-w-sm cursor-pointer" onClick={() => window.open(url, '_blank')} />;
    }
    if (['mp4', 'webm', 'mov'].includes(fileType)) {
        return <video src={url} controls className="mt-2 rounded-lg max-w-xs md:max-w-sm" />;
    }
    return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 block">Download File</a>;
};

const AI_MENTION_PREFIX = '@KrishiSanjivni AI ';

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
    const messageInputRef = useRef<HTMLInputElement>(null);
    const [isAIMentioned, setIsAIMentioned] = useState(false);

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<Set<number>>(new Set());

    // AI Queuing State
    const [aiQueue, setAiQueue] = useState<QueueItem[]>([]);
    const [isAIProcessing, setIsAIProcessing] = useState(false);

    // Toggle AI mention in the message input
    const handleAIMention = () => {
        if (isAIMentioned) {
            // Remove the prefix
            setNewMessage(prev => prev.startsWith(AI_MENTION_PREFIX) ? prev.slice(AI_MENTION_PREFIX.length) : prev);
            setIsAIMentioned(false);
        } else {
            // Add the prefix
            setNewMessage(prev => AI_MENTION_PREFIX + prev);
            setIsAIMentioned(true);
        }
        setTimeout(() => {
            const input = messageInputRef.current;
            if (input) {
                input.focus();
                const len = input.value.length;
                input.setSelectionRange(len, len);
            }
        }, 0);
    };

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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // === AI QUEUE WORKER ===
    useEffect(() => {
        const processQueue = async () => {
            if (aiQueue.length === 0 || isAIProcessing) return;

            setIsAIProcessing(true);

            // Wait until cooldown is over
            const waitTime = getCooldownRemaining();
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime + 500)); // Buffer of 500ms
            }

            // double check gatekeeper
            if (!canAIReply()) {
                setIsAIProcessing(false);
                return;
            }

            const current = aiQueue[0];

            try {
                // 1. Wait for the consolidated Moderation/Assistant API result
                console.debug("[Assistant] Awaiting consolidated safety/reply result...");
                const modResult = await current.moderationPromise;

                if (!modResult) {
                    setIsAIProcessing(false);
                    return;
                }

                // Safety Check: If moderation flagged/blocked the message, do NOT send the assistant reply
                if (modResult.isToxic || modResult.action !== 'allow') {
                    console.warn("[Assistant] Discarding AI response: Trigger message was flagged/blocked.");
                    setAiQueue(prev => prev.slice(1));
                    setIsAIProcessing(false);
                    return;
                }

                // Scope Check: If out-of-scope AND untagged, STAY SILENT.
                if (modResult.isOutOfScope && !current.wasMentioned) {
                    console.debug("[Assistant] Silent Mode: Out-of-scope and untagged. Skipping reply.");
                    setAiQueue(prev => prev.slice(1));
                    setIsAIProcessing(false);
                    return;
                }

                // 2. Use the pre-calculated reply from the consolidated API call
                let aiReplyText = modResult.reply;

                // Fallback: If for some reason 'reply' is missing but needed, we could generate it 
                // but we prefer to save API calls.
                if (!aiReplyText) {
                    console.debug("[Assistant] Consolidated call had no reply. Saving tokens/credits by skipping.");
                    setAiQueue(prev => prev.slice(1));
                    setIsAIProcessing(false);
                    return;
                }

                const userFirstName = current.userName?.split(' ')[0] || 'User';
                const messageSnippet = current.message.length > 60
                    ? current.message.substring(0, 60) + "..."
                    : current.message;

                const taggedReply = `> **Replying to ${userFirstName}**\n> "${messageSnippet}"\n\n${aiReplyText}`;

                const aiMessageToInsert = {
                    message: taggedReply,
                    user_id: current.userId,
                    channel_id: 1,
                    is_ai_message: true
                };

                const { data: insertedAIMessage, error: aiInsertError } = await supabase
                    .from('messages')
                    .insert(aiMessageToInsert)
                    .select()
                    .single();

                if (aiInsertError) throw aiInsertError;

                // Add to UI manually for instant feedback
                const optimisticAI: Message = {
                    ...insertedAIMessage,
                    profiles: {
                        full_name: "Krishisanjivni AI",
                        avatar_url: "/ai-avatar.webp",
                    }
                };
                setMessages(prev => [...prev, optimisticAI]);

            } catch (err) {
                console.error("AI Queue Error:", err);
            } finally {
                // Remove processed item and reset processing state
                setAiQueue(prev => prev.slice(1));
                setIsAIProcessing(false);
            }
        };

        processQueue();
    }, [aiQueue, isAIProcessing]);

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
            const wasMentioned = isAIMentioned;
            setNewMessage('');
            setFileToUpload(null);
            setIsAIMentioned(false);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Refocus the input field after sending
            setTimeout(() => messageInputRef.current?.focus(), 0);

            // === CONSOLIDATED AI PIPELINE (MODERATION + ASSISTANT) ===
            const messageText = messageToInsert.message;
            if (messageText) {
                const actualQuestion = messageText.startsWith(AI_MENTION_PREFIX.trim())
                    ? messageText.slice(AI_MENTION_PREFIX.trim().length).trim()
                    : messageText;

                // Smart Assistant Logic: 
                // 1. Tagged (@KrishiSanjivni AI): AI ALWAYS processes (to answer or politely refuse).
                // 2. Untagged: AI ONLY processes if the local intent detector (shouldAIRespond) identifies a likely farming question.
                const isAssistantNeeded = wasMentioned || (actualQuestion && shouldAIRespond(actualQuestion));
                
                // Fire ONE joint moderation/assistant call to save API credits
                const apiPromise = moderateWithAI(messageText, isAssistantNeeded ? 'assistant' : 'moderate').then(async (result) => {
                    if (result.isToxic) {
                        try {
                            if (result.action === 'block') {
                                console.warn(`AI Blocked: ${result.toxicCategory}. Deleting...`);
                                await supabase.from('messages').delete().eq('id', insertedMessage.id);
                                toast({
                                    title: 'Message Removed',
                                    description: `Removed for community safety (${result.toxicCategory}).`,
                                    variant: 'destructive',
                                });
                            } else if (result.action === 'flag') {
                                console.warn(`AI Flagged: ${result.toxicCategory}. Blurring...`);
                                await supabase.from('messages').update({ is_flagged: true }).eq('id', insertedMessage.id);
                            }
                        } catch (err) {
                            console.error("Moderation action failure:", err);
                        }
                    }
                    return result;
                });

                if (isAssistantNeeded && actualQuestion) {
                    console.debug("[Assistant] Queueing shared API result...");
                    setAiQueue(prev => [...prev, {
                        message: actualQuestion,
                        userName: profile.full_name || 'User',
                        userId: user.id,
                        wasMentioned: wasMentioned, // Pass the mention status to the worker
                        moderationPromise: apiPromise // This will now contain the 'reply' too
                    }]);
                }
            }

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
            // 1. Fetch the message first to see if it has a file
            const { data: messageData, error: fetchError } = await supabase
                .from('messages')
                .select('file_url')
                .eq('id', messageId)
                .single();

            if (fetchError) throw fetchError;

            // 2. If it has a file_url, delete from storage
            if (messageData?.file_url) {
                try {
                    // Extract path from public URL
                    // URL format: .../storage/v1/object/public/chat_uploads/userId/filename
                    const urlParts = messageData.file_url.split('/chat_uploads/');
                    if (urlParts.length > 1) {
                        const filePath = urlParts[1];
                        const { error: storageError } = await supabase.storage
                            .from('chat_uploads')
                            .remove([filePath]);
                        if (storageError) console.error("Storage deletion error:", storageError);
                    }
                } catch (err) {
                    console.error("Failed to parse/delete file from storage:", err);
                }
            }

            // 3. Delete from database
            const { error } = await supabase.from('messages').delete().eq('id', messageId);
            if (error) throw error;

            setMessages(currentMessages => currentMessages.filter(msg => msg.id !== messageId));
            toast({ title: t('chat.message_deleted', 'Message deleted') });
        } catch (error: any) {
            console.error("Delete Error:", error);
            toast({ title: t('error.delete_failed', 'Failed to delete message'), description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteMultipleMessages = async () => {
        if (selectedMessageIds.size === 0) return;

        const idsToDelete = Array.from(selectedMessageIds);
        try {
            // 1. Get file URLs for storage cleanup
            const { data: messagesWithFiles } = await supabase
                .from('messages')
                .select('file_url')
                .in('id', idsToDelete)
                .not('file_url', 'is', null);

            // 2. Delete files from storage
            if (messagesWithFiles && messagesWithFiles.length > 0) {
                const filePaths = messagesWithFiles
                    .map(m => {
                        const urlParts = m.file_url?.split('/chat_uploads/');
                        return urlParts && urlParts.length > 1 ? urlParts[1] : null;
                    })
                    .filter(Boolean) as string[];

                if (filePaths.length > 0) {
                    await supabase.storage.from('chat_uploads').remove(filePaths);
                }
            }

            // 3. Delete from database
            const { error } = await supabase
                .from('messages')
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            // 4. Update UI
            setMessages(prev => prev.filter(msg => !selectedMessageIds.has(msg.id)));
            setSelectedMessageIds(new Set());
            setIsSelectionMode(false);
            toast({
                title: t('chat.messages_deleted', `Deleted ${idsToDelete.length} messages`),
                description: t('chat.batch_delete_success', 'Batch deletion completed successfully.')
            });
        } catch (error: any) {
            console.error("Batch Delete Error:", error);
            toast({
                title: t('error.batch_delete_failed', 'Failed to delete messages'),
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const toggleMessageSelection = (id: number) => {
        const next = new Set(selectedMessageIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedMessageIds(next);
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
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h1 className="text-2xl font-bold">{t('chat.general_chat', 'General Chat')}</h1>
                    {isAdmin && (
                        <div className="flex gap-2">
                            {isSelectionMode ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedMessageIds(new Set());
                                    }}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSelectionMode(true)}
                                    className="gap-2"
                                >
                                    <CheckSquare className="h-4 w-4" />
                                    {t('chat.select_messages', 'Select')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {loading && <p className="text-center text-muted-foreground">{t('common.loading', 'Loading chat...')}</p>}
                        {messages.map((msg) => {
                            const isCurrentUser = msg.user_id === user?.id && !msg.is_ai_message;
                            const isSelected = selectedMessageIds.has(msg.id);

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''} ${isSelectionMode ? 'cursor-pointer hover:bg-muted/50 rounded-lg p-1 transition-colors' : ''} ${isSelected ? 'bg-primary/10' : ''}`}
                                    onClick={() => isSelectionMode && toggleMessageSelection(msg.id)}
                                >
                                    {isSelectionMode && (
                                        <div className="flex items-center self-center mr-1">
                                            {isSelected ? (
                                                <CheckSquare className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Square className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    )}
                                    {!isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.profiles?.avatar_url} />
                                            <AvatarFallback>{msg.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.is_ai_message ? 'bg-green-100 text-green-900 border border-green-300' : isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} relative group ${msg.is_flagged ? 'blur-sm hover:blur-none transition-all duration-300' : ''}`}>
                                        {msg.is_flagged && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-10 opacity-100 pointer-events-none shadow-sm">
                                                Flagged content - Hover to view
                                            </div>
                                        )}
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
                {/* Batch Selection Action Bar */}
                {isSelectionMode && selectedMessageIds.size > 0 && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-background border border-primary/20 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                        <span className="text-sm font-medium">
                            {selectedMessageIds.size} {selectedMessageIds.size === 1 ? t('chat.message_selected', 'message selected') : t('chat.messages_selected_count', 'messages selected')}
                        </span>
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-2 rounded-full px-4">
                                    <Trash className="h-4 w-4" />
                                    {t('common.delete', 'Delete')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('chat.confirm_batch_delete_title', 'Delete Multiple Messages')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('chat.confirm_batch_delete_desc', 'Are you sure you want to delete the selected messages? This will also remove any attached files. This action cannot be undone.')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteMultipleMessages} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        {t('common.delete', 'Delete All')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                                setIsSelectionMode(false);
                                setSelectedMessageIds(new Set());
                            }}
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                    </div>
                )}

                {user ? (
                    isBanned ? (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center text-destructive">
                            {t('chat.banned_message', 'Your account has been banned from participating in the chat.')}
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex flex-col gap-2 pt-2 border-t">
                            {/* AI Mention Tag Badge */}
                            {isAIMentioned && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm animate-in slide-in-from-bottom-2 duration-200">
                                    <img src="/chat-gpt.webp" alt="KrishiSanjivni AI assistant icon" className="h-5 w-5 flex-shrink-0 rounded-full object-contain" />
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">@KrishiSanjivni AI</span>
                                    <span className="text-emerald-600/70 dark:text-emerald-400/70 text-xs">will answer your question</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full"
                                        onClick={() => {
                                            setNewMessage(prev => prev.startsWith(AI_MENTION_PREFIX) ? prev.slice(AI_MENTION_PREFIX.length) : prev);
                                            setIsAIMentioned(false);
                                        }}
                                    >
                                        <XCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </Button>
                                </div>
                            )}
                            {fileToUpload && (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="flex-grow truncate">{fileToUpload.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => { setFileToUpload(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    >
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
                                            setTimeout(() => messageInputRef.current?.focus(), 0);
                                        }
                                    }}
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant={isAIMentioned ? "default" : "outline"}
                                    size="icon"
                                    onClick={handleAIMention}
                                    disabled={isSending}
                                    className={isAIMentioned
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-md shadow-emerald-500/25"
                                        : "hover:border-emerald-400 hover:text-emerald-600"
                                    }
                                    title="Tag @KrishiSanjivni AI"
                                >
                                    <img src="/chat-gpt.webp" alt="KrishiSanjivni AI assistant icon" className="h-5 w-5 rounded-full object-contain" />
                                </Button>
                                <Input
                                    ref={messageInputRef}
                                    value={newMessage}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewMessage(val);
                                        // Sync mention state if user manually types/removes the prefix
                                        setIsAIMentioned(val.startsWith(AI_MENTION_PREFIX));
                                    }}
                                    placeholder={isAIMentioned ? "Ask KrishiSanjivni AI anything..." : "Type a message or upload a file..."}
                                    disabled={isSending}
                                    autoComplete="off"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e as unknown as React.FormEvent);
                                        }
                                    }}
                                />
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