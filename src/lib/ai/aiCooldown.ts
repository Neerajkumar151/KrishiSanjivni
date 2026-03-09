// Cooldown to prevent API spam (30 seconds)
let lastAIReply = 0;
const COOLDOWN_MS = 10000;

export function canAIReply(): boolean {
    const now = Date.now();

    if (now - lastAIReply < COOLDOWN_MS) {
        return false;
    }

    lastAIReply = now;
    return true;
}
