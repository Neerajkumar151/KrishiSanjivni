import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Mic, MicOff, Trash2, AlertTriangle, Check } from 'lucide-react';
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

    const [sessionId, setSessionId] = useState(() => {
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
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isCancelledRef = useRef(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
                setMessages([]);
                setConversationId(null);
                let newSessionId = `session_${Date.now()}_${Math.random()}`;
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('chat_session_id');
                    sessionStorage.setItem('chat_session_id', newSessionId);
                }
                setSessionId(newSessionId);
                setUser(event === 'SIGNED_IN' ? (session?.user ?? null) : null);
            } else if (event === 'TOKEN_REFRESHED') {
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
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: false })
                    .limit(1);

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
        // Close the popup immediately for better UX
        setShowDeleteConfirm(false);
        setIsLoading(true);

        try {
            // Find all conversations belonging to this session or user
            let query = supabase.from('chat_conversations').select('id');
            if (user) {
                query = query.or(`user_id.eq.${user.id},session_id.eq.${sessionId}`);
            } else {
                query = query.eq('session_id', sessionId);
            }

            const { data: convs, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            // Collect all unique IDs to delete
            const convIdsToClear = new Set<string>();
            if (conversationId) convIdsToClear.add(conversationId);
            if (convs) {
                convs.forEach(c => convIdsToClear.add(c.id));
            }

            if (convIdsToClear.size > 0) {
                const convIds = Array.from(convIdsToClear);

                // 1. Explicitly delete messages first to avoid cascade failure
                const { error: msgError } = await supabase
                    .from('chat_messages')
                    .delete()
                    .in('conversation_id', convIds);
                if (msgError) throw msgError;

                // 2. Then delete the conversations
                const { error: convError } = await supabase
                    .from('chat_conversations')
                    .delete()
                    .in('id', convIds);
                if (convError) throw convError;
            }

            setMessages([]);
            setConversationId(null);

            let newSessionId = `session_${Date.now()}_${Math.random()}`;
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('chat_session_id');
                sessionStorage.setItem('chat_session_id', newSessionId);
            }
            setSessionId(newSessionId);

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

    // --- Waveform drawing ---
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = '#2d2d2d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };

        draw();
    }, []);

    const cleanupRecording = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        analyserRef.current = null;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startRecording = async () => {
        try {
            isCancelledRef.current = false;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Set up audio analyser for waveform
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            let recordingStartTime = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                // If cancelled, just cleanup and return
                if (isCancelledRef.current) {
                    cleanupRecording();
                    return;
                }

                const recordingDuration = Date.now() - recordingStartTime;

                if (recordingDuration < 500) {
                    toast({
                        title: t('chatbot.error_title', 'Error'),
                        description: 'Please speak for at least 1 second',
                        variant: 'destructive'
                    });
                    cleanupRecording();
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
                cleanupRecording();
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start waveform drawing after a small delay for canvas to mount
            setTimeout(() => drawWaveform(), 100);
        } catch (error) {
            toast({
                title: t('chatbot.error_title', 'Error'),
                description: t('chatbot.error_microphone_access', 'Could not access microphone'),
                variant: 'destructive'
            });
        }
    };

    const cancelRecording = () => {
        isCancelledRef.current = true;
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        cleanupRecording();
        setIsRecording(false);
    };

    const submitRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            isCancelledRef.current = false;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupRecording();
        };
    }, [cleanupRecording]);

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
                                        className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
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
                        {isRecording ? (
                            /* --- ChatGPT-style recording UI --- */
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    backgroundColor: '#2d2d2d',
                                    borderRadius: '12px',
                                    padding: '10px 14px',
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    width={220}
                                    height={40}
                                    style={{
                                        flex: 1,
                                        borderRadius: '6px',
                                        display: 'block',
                                    }}
                                />
                                <button
                                    onClick={cancelRecording}
                                    title="Cancel recording"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#ccc',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff5555')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ccc')}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={submitRecording}
                                    title="Submit recording"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#ccc',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#50fa7b')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ccc')}
                                >
                                    <Check className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            /* --- Normal input UI --- */
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
                                <div className="flex flex-col gap-2">
                                    <Button className="bg-gradient-to-r from-green-600 to-emerald-700"
                                        onClick={() => sendMessage(input)}
                                        disabled={isLoading || !input.trim()}
                                        size="icon"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={startRecording}
                                        variant="outline"
                                        size="icon"
                                        disabled={isLoading}
                                    >
                                        <Mic className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};