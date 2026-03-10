import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    isLoading,
    placeholder = "Type a message..."
}) => {
    const [message, setMessage] = useState('');

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <form
            onSubmit={handleSend}
            className="flex items-center gap-2 p-4 bg-background border-t mt-auto"
        >
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 rounded-full bg-muted/50 focus-visible:ring-primary/20"
            />
            <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || isLoading}
                className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm"
            >
                <Send className="h-4 w-4 ml-0.5" />
            </Button>
        </form>
    );
};
