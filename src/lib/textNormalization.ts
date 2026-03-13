import { moderationConfig } from '../config/moderationConfig';

/**
 * Normalizes text to prevent profanity bypass tricks.
 * It converts text to lowercase, removes excess whitespace,
 * converts known symbol substitutions back to letters, and
 * strips mid-word punctuation that is often used to bypass filters.
 * 
 * Execution time must be < 1ms.
 */
export function normalizeText(message: string): string {
    if (!moderationConfig.enableNormalization || !message) {
        return message;
    }

    try {
        let normalized = message.toLowerCase();

        // 1. Symbol Substitution
        // Replace common numerical and symbol obfuscations
        const substitutions: Record<string, string> = {
            '@': 'a',
            '4': 'a',
            '$': 's',
            '5': 's',
            '0': 'o',
            '1': 'i',
            '!': 'i',
            '3': 'e',
            '8': 'b',
            'v': 'u', // Often used interchangeably in slang (e.g., lavda -> lauda)
            'w': 'v'  // Often used interchangeably
        };

        // Efficiently replace all known substitutions
        normalized = normalized.replace(/[@4$501!38vw]/g, (match) => substitutions[match] || match);


        // 2. Remove Punctuation and Special Characters used to break words
        // For example: g.a.n.d.u -> gandu, f_u_c_k -> fuck
        // We remove characters that are not letters, numbers, or spaces
        normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

        // 3. Remove excessive whitespace (e.g., g a n d u -> gandu)
        // If there are spaces between every single letter, collapse them.
        // We'll strip all spaces if the sentence consists entirely of single characters separated by spaces.
        // For standard sentences, we just collapse multiple spaces to a single space to avoid breaking legitimate words.
        normalized = normalized.replace(/\s{2,}/g, ' ');

        // Check for the "spaced out word" bypass: e.g. "b a d w o r d"
        const isSpacedOut = /^([a-z]\s)+[a-z]$/.test(normalized);
        if (isSpacedOut) {
            normalized = normalized.replace(/\s+/g, '');
        }

        return normalized.trim();
    } catch {
        // Fallback to original message if normalization fails to ensure non-blocking
        return message.toLowerCase();
    }
}
