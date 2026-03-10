export interface AdminMessage {
    id: string;
    sender_id: string;
    receiver_id: string | null;
    message: string;
    is_broadcast: boolean;
    is_read: boolean;
    created_at: string;
    sender_profile?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface ChatUser {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    last_message?: string;
    unread_count?: number;
    last_message_time?: string;
}
