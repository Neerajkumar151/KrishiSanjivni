import { profanityPatterns } from './profanityPatterns';
import { moderationConfig } from '../config/moderationConfig';
import { normalizeText } from './textNormalization';

export interface RegexProfanityResult {
    isProfane: boolean;
    matchedPattern?: string;
    reason?: string;
}

/**
 * Checks the text against a list of pre-compiled regex patterns to 
 * catch heavily obfuscated slang that dictionary filters miss.
 * 
 * Must run synchronously in under 2ms.
 */
export function checkRegexProfanity(message: string): RegexProfanityResult {
    if (!moderationConfig.enableRegexFilter || !message) {
        return { isProfane: false };
    }

    try {
        // Run regex patterns on the normalized text
        // Note: we assume the input string here is already normalized by the caller, 
        // but we'll normalize it here if passed directly for extra safety.
        const normalized = normalizeText(message);

        for (const pattern of profanityPatterns) {
            // Because we're iterating over a small, pre-compiled array, this is extremely fast
            if (pattern.test(normalized)) {
                return {
                    isProfane: true,
                    matchedPattern: pattern.source,
                    reason: 'Message matched known obfuscation patterns.'
                };
            }
        }

        return { isProfane: false };
    } catch {
        // Fallback robustly
        return { isProfane: false };
    }
}
