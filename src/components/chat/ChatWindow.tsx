import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { AdminMessage, ChatUser } from './types';
import { ShieldCheck } from 'lucide-react';

interface ChatWindowProps {
    currentUser: any;
    currentUserProfile?: any;
    recipientUser?: ChatUser;
    messages: AdminMessage[];
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    currentUser,
    currentUserProfile,
    recipientUser,
    messages,
    onSendMessage,
    isLoading
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto scroll to bottom when messages change
        if (scrollRef.current) {
            const scrollViewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollViewport) {
                scrollViewport.scrollTop = scrollViewport.scrollHeight;
            }
        }
    }, [messages]);

    if (!recipientUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full p-8 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                <p className="max-w-sm text-sm">Choose a user from the list to view your private conversation history and send new messages.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background z-10 shadow-sm">
                <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage src={recipientUser.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                        {recipientUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{recipientUser.full_name || 'Anonymous User'}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        ID: {recipientUser.user_id.substring(0, 8)}...
                        <Badge variant="outline" className="text-[10px] h-4">
                            {recipientUser.role || 'farmer'}
                        </Badge>
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-muted/5">
                <div className="max-w-3xl mx-auto space-y-2 pb-6">
                    {isLoading ? (
                        <div className="text-center text-sm text-muted-foreground my-4">
                            Loading conversation...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground my-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg.message}
                                isOwnMessage={msg.sender_id === currentUser?.id}
                                timestamp={msg.created_at}
                                isBroadcast={msg.is_broadcast}
                                avatarUrl={msg.sender_id === currentUser?.id ? currentUserProfile?.avatar_url : recipientUser?.avatar_url}
                                senderName={msg.sender_id === currentUser?.id ? currentUserProfile?.full_name : recipientUser?.full_name}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="z-10 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
                <ChatInput
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                    placeholder={`Message ${recipientUser.full_name || 'user'}...`}
                />
            </div>
        </div>
    );
};
