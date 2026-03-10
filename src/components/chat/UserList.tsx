import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatUser } from './types';

interface UserListProps {
    users: ChatUser[];
    selectedUserId?: string;
    onSelectUser: (user: ChatUser) => void;
    isLoading?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
    users,
    selectedUserId,
    onSelectUser,
    isLoading
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background border-r">
            <div className="p-4 border-b space-y-4">
                <h2 className="font-semibold text-lg">Chats</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No users found.
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredUsers.map((user) => (
                            <button
                                key={user.user_id}
                                onClick={() => onSelectUser(user)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                                    selectedUserId === user.user_id
                                        ? "bg-primary/10 hover:bg-primary/15"
                                        : "hover:bg-muted"
                                )}
                            >
                                <Avatar className="h-10 w-10 border border-border/50">
                                    <AvatarImage src={user.avatar_url || ''} />
                                    <AvatarFallback className="bg-primary/5 text-primary">
                                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-medium truncate pr-2">
                                            {user.full_name || 'Anonymous'}
                                        </span>
                                        {user.last_message_time && (
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {new Date(user.last_message_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate pr-2">
                                            {user.last_message || 'No messages yet'}
                                        </p>
                                        {user.unread_count && user.unread_count > 0 ? (
                                            <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-[10px]">
                                                {user.unread_count}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] bg-background">
                                                {user.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
