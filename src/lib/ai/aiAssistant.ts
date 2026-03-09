import { HfInference } from "@huggingface/inference";

export async function generateAIResponse(question: string): Promise<string> {
    const apiKey = import.meta.env.VITE_HF_API_KEY;

    if (!apiKey) {
        console.error("VITE_HF_API_KEY is not defined.");
        return "I am currently unable to provide farm assistance. Please contact the administrator.";
    }

    const hf = new HfInference(apiKey);

    try {
        const response = await hf.chatCompletion({
            model: "Qwen/Qwen2.5-72B-Instruct",
            messages: [
                {
                    role: "system",
                    content: `You are KrishiSanjivni AI Assistant.

You help farmers with:
• crop selection
• fertilizers
• pesticides
• plant diseases
• irrigation
• agricultural tools
• government farming schemes

Rules:
* give practical advice
* keep answer short and directly to the point
* avoid dangerous chemical misuse
* always add a safety disclaimer at the end
* CRITICAL: ALWAYS reply in the EXACT same language the user asked the question in (e.g. if question is in English reply in English, if in Hindi reply in Hindi, if in Hinglish reply in Hinglish).`
                },
                { role: "user", content: question }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        let aiReply = response.choices[0]?.message?.content || "Unable to generate response at this time.";

        // Trim any extra whitespace
        return aiReply.trim();
    } catch (error: any) {
        console.error("Failed to generate AI response via SDK:", error);

        // Handle common HF SDK error strings
        const errMsg = error.message || String(error);
        if (errMsg.includes('503') || errMsg.toLowerCase().includes('loading')) {
            return `My AI engine is currently waking up from sleep mode. Please ask your question again in half a minute! 🌾`;
        }

        return "Sorry, I am having trouble connecting to my knowledge base right now. Please try again later.";
    }
}
