import { supabase } from '@/integrations/supabase/client';

const MAX_MESSAGES_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

export interface RateLimitResult {
    isLimited: boolean;
    reason: string;
    remaining?: number;
}

/**
 * Check if a user has exceeded the message rate limit.
 * Queries the messages table for the count of messages sent
 * by this user in the last 60 seconds.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
    try {
        const cutoffTime = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();

        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', cutoffTime);

        if (error) {
            console.error('Rate limit check error:', error);
            // On error, allow the message to avoid blocking legitimate users
            return { isLimited: false, reason: '', remaining: MAX_MESSAGES_PER_MINUTE };
        }

        const messageCount = count ?? 0;
        const remaining = Math.max(0, MAX_MESSAGES_PER_MINUTE - messageCount);

        if (messageCount >= MAX_MESSAGES_PER_MINUTE) {
            return {
                isLimited: true,
                reason: `Message limit reached (${MAX_MESSAGES_PER_MINUTE} per minute). Please wait before sending more messages.`,
                remaining: 0,
            };
        }

        return { isLimited: false, reason: '', remaining };
    } catch {
        // On unexpected error, allow the message
        return { isLimited: false, reason: '', remaining: MAX_MESSAGES_PER_MINUTE };
    }
}
