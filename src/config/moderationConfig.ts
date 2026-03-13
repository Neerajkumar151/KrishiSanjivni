export const moderationConfig = {
    // Determine whether each layer is enabled or not
    enableNormalization: true,
    enableRegexFilter: true,
    enableDictionaryFilter: true, // Legacy fast filter
    enableAIModeration: true,

    // Performance and Limits
    minMessageLengthForAI: 5, // Don't call AI for tiny messages as requested (save HF API calls)
    aiRequestTimeoutMs: 3000, // Qwen on HF might take slightly longer than Perspective

    // Cache Configuration
    cacheSize: 500,           // Max items in LRU Cache
    cacheTtlMs: 5 * 60 * 1000, // 5 Minutes expiration

    // Hugging Face Qwen2.5-72B Moderation Thresholds (0.0 to 1.0)
    hfThresholds: {
        block: 0.75, // Confidence > 0.75 strict block/blur
        flag: 0.50   // Confidence 0.5 - 0.75 soft flag
    }
};
