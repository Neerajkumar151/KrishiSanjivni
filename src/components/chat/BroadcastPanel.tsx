import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const BroadcastPanel: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { toast } = useToast();

    const handleBroadcast = async () => {
        if (!message.trim()) return;

        try {
            setIsSending(true);

            const { data: userData } = await supabase.auth.getUser();
            const adminId = userData.user?.id;

            if (!adminId) throw new Error('Not authenticated');

            // Insert single broadcast message with receiver_id as null
            const { error: insertError } = await (supabase as any)
                .from('admin_messages')
                .insert({
                    sender_id: adminId,
                    receiver_id: null,
                    message: message.trim(),
                    is_broadcast: true,
                    is_read: false
                });

            if (insertError) throw insertError;

            toast({
                title: 'Broadcast Sent',
                description: 'Announcement successfully posted to all users.',
            });

            setMessage('');
            setIsExpanded(false);
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
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-background to-primary/5 transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-primary/5 transition-colors text-left"
            >
                <div className="flex items-center gap-3 text-primary">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Megaphone className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-semibold">Broadcast Announcement</CardTitle>
                        {!isExpanded && (
                            <p className="text-[10px] text-muted-foreground">Click to send a message to all users</p>
                        )}
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4">
                    <div className="flex flex-col gap-3">
                        <Textarea
                            placeholder="Type your announcement here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[80px] text-sm resize-none bg-background focus-visible:ring-primary/30"
                            disabled={isSending}
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-muted-foreground">This message will reach every registered user.</p>
                            <Button
                                size="sm"
                                className="gap-2 shadow-sm px-4"
                                onClick={handleBroadcast}
                                disabled={!message.trim() || isSending}
                            >
                                {isSending ? 'Sending...' : 'Send Broadcast'}
                                <Send className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};