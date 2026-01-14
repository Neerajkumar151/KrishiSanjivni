import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, MicOff, Trash2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatBotProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    // New State for the Custom Delete Popup
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [sessionId] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedSessionId = sessionStorage.getItem('chat_session_id');
            if (storedSessionId) return storedSessionId;
            const newSessionId = `session_${Date.now()}_${Math.random()}`;
            sessionStorage.setItem('chat_session_id', newSessionId);
            return newSessionId;
        }
        return `session_${Date.now()}_${Math.random()}`;
    });

    const [conversationId, setConversationId] = useState<string | null>(null);
    const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
    const [user, setUser] = useState<any>(null);

    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null); 
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setMessages([]);
                setConversationId(null);
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('chat_session_id');
                }
                setUser(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                 setUser(session?.user ?? null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isOpen]);

    useEffect(() => {
        const loadConversationHistory = async () => {
            if (!isOpen) return;

            try {
                let query = supabase
                    .from('chat_conversations')
                    .select('id')
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (user) {
                    query = query.eq('user_id', user.id);
                } else {
                    query = query.eq('session_id', sessionId);
                }

                const { data: conversations, error } = await query;

                if (error) throw error;

                if (conversations && conversations.length > 0) {
                    const convId = conversations[0].id;
                    setConversationId(convId);

                    const { data: history } = await supabase
                        .from('chat_messages')
                        .select('role, content')
                        .eq('conversation_id', convId)
                        .order('created_at', { ascending: true });

                    if (history) {
                        setMessages(history as Message[]);
                    }
                }
            } catch (error) {
                console.error('Error loading history:', error);
            }
        };

        loadConversationHistory();
    }, [isOpen, sessionId, user]);

    // 4. UPDATED: Delete Logic (No longer uses confirm() alert)
    const handleConfirmDelete = async () => {
        if (!user) return;
        
        // Close the popup immediately for better UX
        setShowDeleteConfirm(false); 
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('chat_conversations')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setMessages([]);
            setConversationId(null);
            toast({
                title: "History Cleared",
                description: "Your chat history has been permanently deleted.",
            });
        } catch (err) {
            console.error("Failed to delete history:", err);
            toast({
                title: "Error",
                description: "Could not delete history.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (text: string, language?: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('farming-chat', {
                body: {
                    messages: [...messages, userMessage],
                    sessionId,
                    conversationId,
                    language: language || detectedLanguage || 'hi'
                }
            });

            if (error) throw error;

            if (data.conversationId) {
                setConversationId(data.conversationId);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message
            };
            setMessages(prev => [...prev, assistantMessage]);

            if (language) {
                await playTextToSpeech(data.message, language);
            }

        } catch (error: any) {
            console.error('Error sending message:', error);
            toast({
                title: t('chatbot.error_title', 'Error'),
                description: error.message || t('chatbot.error_send_failed', 'Failed to send message'),
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const playTextToSpeech = async (text: string, language: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('text-to-speech', {
                body: { text, language }
            });

            if (error) throw error;

            if (data.audio) {
                const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                audioRef.current = audio;
                await audio.play();
            }
        } catch (error: any) {
            console.error('Error playing audio:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            let recordingStartTime = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const recordingDuration = Date.now() - recordingStartTime;
                
                if (recordingDuration < 500) {
                    toast({
                        title: t('chatbot.error_title', 'Error'),
                        description: 'Please speak for at least 1 second',
                        variant: 'destructive'
                    });
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();

                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];

                    try {
                        const langCode = detectedLanguage === 'hi-IN' ? 'hi-IN' : 'en-IN';
                        
                        const { data, error } = await supabase.functions.invoke('speech-to-text', {
                            body: { audio: base64Audio, language: langCode }
                        });

                        if (error) throw error;

                        if (data.error) {
                            toast({
                                title: t('chatbot.error_title', 'Error'),
                                description: data.error,
                                variant: 'destructive'
                            });
                            return;
                        }

                        if (data.text && data.detectedLanguage) {
                            setDetectedLanguage(data.detectedLanguage);
                            await sendMessage(data.text, data.detectedLanguage);
                        }
                    } catch (error: any) {
                        toast({
                            title: t('chatbot.error_title', 'Error'),
                            description: error.message || t('chatbot.error_transcribe_failed', 'Failed to transcribe audio'),
                            variant: 'destructive'
                        });
                    }
                };

                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            toast({
                title: t('chatbot.error_title', 'Error'),
                description: t('chatbot.error_microphone_access', 'Could not access microphone'),
                variant: 'destructive'
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
                    
                    {/* --- NEW CUSTOM DELETE OVERLAY --- */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                            <div className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-sm w-full space-y-4">
                                <div className="flex items-center gap-3 text-destructive">
                                    <AlertTriangle className="h-6 w-6" />
                                    <h3 className="font-semibold text-lg">Delete History?</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Are you sure you want to delete all conversation history? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end pt-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        onClick={handleConfirmDelete}
                                        className="w-full"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* ---------------------------------- */}

                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-white">{t('chatbot.bot_name', 'KrishiSanjivni Assistant')}</div>
                                <div className="text-xs text-green-100 flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                                    {t('chatbot.bot_status', 'Online')}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            {user && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    // CHANGED: Now opens the custom UI instead of alert()
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="hover:bg-primary-foreground/20 text-white/80 hover:text-white"
                                    title="Clear Chat History"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-primary-foreground/20 text-white/80 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p className="text-sm">{t('chatbot.intro_line1', "Hi! I'm your KrishiSanjivni assistant.")}</p>
                                <p className="text-xs mt-2">{t('chatbot.intro_line2', "Ask me about farming tools, warehouses, soil analysis, or any farming questions!")}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        ) : (
                                            <div className="chatbot-markdown text-sm">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-lg p-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border">
                        <div className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(input);
                                    }
                                }}
                                placeholder={t('chatbot.input_placeholder', 'Type your message...')}
                                className="resize-none"
                                rows={2}
                                disabled={isLoading}
                            />
                            <div className="flex flex-col gap-2 ">
                                <Button className="bg-gradient-to-r from-green-600 to-emerald-700"
                                    onClick={() => sendMessage(input)}
                                    disabled={isLoading || !input.trim()}
                                    size="icon"
                                >
                                    <Send className="h-4 w-4 " />
                                </Button>
                                <Button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    variant={isRecording ? 'destructive' : 'outline'}
                                    size="icon"
                                >
                                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};