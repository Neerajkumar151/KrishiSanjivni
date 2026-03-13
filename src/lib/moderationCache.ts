import { moderationConfig } from '../config/moderationConfig';

type CacheEntry = {
    isProfane: boolean;
    timestamp: number;
};

class LRUCache {
    private cache: Map<string, CacheEntry>;
    private maxSize: number;

    constructor(maxSize: number) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * Helper to create a very basic hash of the message for the cache key.
     * Prevents storing giant strings in memory.
     */
    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    get(message: string): boolean | null {
        const key = this.hashString(message);
        const entry = this.cache.get(key);
        
        if (!entry) return null;

        // Check expiration
        if (Date.now() - entry.timestamp > moderationConfig.cacheTtlMs) {
            this.cache.delete(key);
            return null;
        }

        // Refresh position in LRU (delete and re-add)
        this.cache.delete(key);
        this.cache.set(key, entry);
        
        return entry.isProfane;
    }

    set(message: string, isProfane: boolean): void {
        const key = this.hashString(message);
        
        // If it exists, delete it so we can re-add it at the "newest" end
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Evict the oldest (the first item in the Map's insertion order)
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, { isProfane, timestamp: Date.now() });
    }
}

export const moderationCache = new LRUCache(moderationConfig.cacheSize);
