// Cooldown to prevent API spam (10 seconds)
let lastAIReply = 0;
export const COOLDOWN_MS = 10000;

export function canAIReply(): boolean {
    const now = Date.now();

    if (now - lastAIReply < COOLDOWN_MS) {
        return false;
    }

    lastAIReply = now;
    return true;
}

export function getCooldownRemaining(): number {
    const now = Date.now();
    const elapsed = now - lastAIReply;
    return Math.max(0, COOLDOWN_MS - elapsed);
}
