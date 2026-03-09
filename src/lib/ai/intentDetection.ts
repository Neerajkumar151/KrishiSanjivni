const questionIndicators = [
    "what", "which", "how", "when", "why", "best", "recommend",
    "kaise", "kaunsa", "kya", "kab"
];

const agricultureTopics = [
    "fertilizer", "fertiliser", "crop", "crops", "seed", "seeds",
    "pesticide", "pest", "disease", "soil", "irrigation",
    "harvest", "tractor", "tool", "yield", "farming", "agriculture",
    "kheti", "fasal", "beej", "khaad", "urvarak",
    "gehu", "dhaan", "chawal", "makka", "sarson",
    "subsidy", "scheme", "yojna", "pm kisan"
];

export function shouldAIRespond(message: string): boolean {
    const text = message.toLowerCase();

    const isQuestion =
        questionIndicators.some(word => text.includes(word)) ||
        text.includes("?");

    const isFarmingTopic =
        agricultureTopics.some(word => text.includes(word));

    return isQuestion && isFarmingTopic;
}
