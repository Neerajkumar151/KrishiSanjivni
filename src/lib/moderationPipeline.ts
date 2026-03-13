import { supabase } from '@/integrations/supabase/client';
import { checkProfanity } from './profanityFilter';
import { checkRateLimit } from './rateLimiter';

export interface ModerationResult {
    allowed: boolean;
    reason?: string;
    type?: 'rate_limit' | 'profanity';
}

/**
 * Log a moderation violation to the moderation_logs table.
 */
async function logViolation(userId: string, message: string, reason: string) {
    try {
        await supabase
            .from('moderation_logs' as any)
            .insert({ user_id: userId, message, reason });
    } catch (error) {
        console.error('Failed to log moderation violation:', error);
    }
}

// createAlert function removed as everything is now unified in moderation_logs.
/**
 * Run the synchronous moderation pipeline before a message is allowed to be sent.
 * 
 * Pipeline order (fastest checks first):
 * 1. Rate Limit Check (DB query, fast)
 * 2. Profanity Filter (Regex + Dictionary, < 2ms)
 * 
 * Note: AI Toxicity (Perspective API) is handled asynchronously AFTER the message is sent
 * to prevent blocking the UI.
 * 
 * Returns whether the message is allowed or blocked.
 */
export async function moderateMessage(
    userId: string,
    message: string
): Promise<ModerationResult> {
    // Skip moderation for empty messages
    if (!message.trim()) {
        return { allowed: true };
    }

    // === STEP 1: Rate Limit Check ===
    const rateResult = await checkRateLimit(userId);
    if (rateResult.isLimited) {
        await logViolation(userId, message, `Rate limit: ${rateResult.reason}`);
        return {
            allowed: false,
            reason: rateResult.reason,
            type: 'rate_limit',
        };
    }

    // === STEP 2: Profanity Filter ===
    const profanityResult = checkProfanity(message);
    if (profanityResult.isProfane) {
        await logViolation(userId, message, `Profanity: ${profanityResult.reason}`);
        return {
            allowed: false,
            reason: 'Your message violates community guidelines. Please use appropriate language.',
            type: 'profanity',
        };
    }

    // === ALL SYNCHRONOUS CHECKS PASSED ===
    // Message will be allowed to send. The View layer will then 
    // fire an async check to the Perspective API if it passes these.
    return { allowed: true };
}
