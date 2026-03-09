import { supabase } from '@/integrations/supabase/client';
import { checkProfanity } from './profanityFilter';
import { checkRateLimit } from './rateLimiter';
import { checkToxicity } from './toxicityDetector';

export interface ModerationResult {
    allowed: boolean;
    reason?: string;
    type?: 'rate_limit' | 'profanity' | 'toxicity';
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
 * Run the full moderation pipeline on a message.
 * 
 * Pipeline order (fastest checks first):
 * 1. Rate Limit Check (DB query, fast)
 * 2. Profanity Filter (in-memory, instant)
 * 3. AI Toxicity Detection (model inference, ~200ms)
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

    // === STEP 3: AI Toxicity Detection ===
    const toxicityResult = await checkToxicity(message);
    if (toxicityResult.isToxic) {
        const reason = `AI Detection — ${toxicityResult.reason}`;
        await logViolation(userId, message, reason);
        return {
            allowed: false,
            reason: 'Your message was flagged as potentially harmful. Please keep conversations respectful.',
            type: 'toxicity',
        };
    }

    // === ALL CHECKS PASSED ===
    return { allowed: true };
}
