import { moderationConfig } from '../config/moderationConfig';
import { moderationCache } from './moderationCache';
import { supabase } from '@/integrations/supabase/client';

export interface ModerationResult {
    isToxic: boolean;
    toxicCategory?: string;
    confidence?: number;
    error?: string;
    fromCache?: boolean;
    action: 'allow' | 'flag' | 'block';
    reply?: string | null;
    isOutOfScope?: boolean;
}

/**
 * Asynchronously checks a message against the Qwen2.5-72B model via Supabase Edge Functions.
 * Now supports 'assistant' mode to consolidate moderation and generation.
 */
export async function moderateWithAI(
    message: string, 
    mode: 'moderate' | 'assistant' = 'moderate'
): Promise<ModerationResult> {
    if (!moderationConfig.enableAIModeration) {
        return { isToxic: false, action: 'allow' };
    }

    if (!message || message.trim().length < moderationConfig.minMessageLengthForAI) {
        return { isToxic: false, action: 'allow' };
    }

    // 1. Check Cache First (for moderate mode only, skip for assistant)
    if (mode === 'moderate') {
        const cachedResult = moderationCache.get(message);
        if (cachedResult !== null) {
            console.debug("[Moderation] AI Cache Hit");
            return {
                isToxic: cachedResult,
                action: cachedResult ? 'flag' : 'allow',
                fromCache: true
            };
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), moderationConfig.aiRequestTimeoutMs);

    try {
        console.debug(`[Edge] Calling ${mode} Turn...`);

        const { data, error } = await supabase.functions.invoke('moderate-content', {
            body: { text: message, mode }
        });

        clearTimeout(timeoutId);

        if (error) {
            console.error("[Moderation] Edge Function Error:", error);
            throw error;
        }

        const toxic = Boolean(data?.toxic);
        const category = data?.category || 'safe';
        const confidence = typeof data?.confidence === 'number' ? data.confidence : 0;
        const reply = data?.reply || null;
        const isOutOfScope = Boolean(data?.isOutOfScope);

        // Decision Engine based on HF confidence thresholds
        let action: 'allow' | 'flag' | 'block' = 'allow';

        if (toxic) {
            if (confidence >= moderationConfig.hfThresholds.block) {
                action = 'block';
            } else if (confidence >= moderationConfig.hfThresholds.flag) {
                action = 'flag';
            }
        }

        // 3. Update Cache (Only for moderate mode)
        if (mode === 'moderate') {
            const shouldFlag = action === 'flag' || action === 'block';
            moderationCache.set(message, shouldFlag);
        }

        return {
            isToxic: toxic,
            toxicCategory: category,
            confidence: confidence,
            action,
            reply,
            isOutOfScope
        };

    } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("[Moderation] AI Pipeline Failed:", err);
        return { isToxic: false, action: 'allow', error: err.message };
    }
}
