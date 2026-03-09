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
* Brevity: Be brief. Maximum 10-15 lines total (disclaimer excluded).
* Long topics: Use small points and ### headings but DO NOT provide detailed explanations for every single thing. Keep it practical and fast to read.
* Formatting: Use simple lists if needed.
* Use emojis: Use a few relevant farming emojis (🌾, 🚜).
* MANDATORY Disclaimer: You MUST ALWAYS end with: "⚠️ **Safety Disclaimer:** [Short warning here]".
* Language: Reply in the EXACT same language as the user (English, Hindi, or Hinglish).`
                },
                { role: "user", content: question }
            ],
            max_tokens: 600,
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
