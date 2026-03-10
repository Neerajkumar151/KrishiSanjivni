import React from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
    message: string;
    isOwnMessage: boolean;
    timestamp: string;
    isBroadcast?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwnMessage,
    timestamp,
    isBroadcast
}) => {
    return (
        <div className={cn("flex w-full mb-4", isOwnMessage ? "justify-end" : "justify-start")}>
            <div className={cn(
                "max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative",
                isOwnMessage
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none",
                isBroadcast && !isOwnMessage && "border-2 border-primary/50"
            )}>
                {isBroadcast && !isOwnMessage && (
                    <div className="text-[10px] uppercase font-bold text-primary mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Broadcast
                    </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
                <span className={cn(
                    "text-[10px] mt-1 block text-right",
                    isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};
