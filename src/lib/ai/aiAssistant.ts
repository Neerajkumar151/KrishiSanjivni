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
* Use rich formatting: ALWAYS organize long answers into paragraphs, bullet points, and clear headings (using ###).
* Conciseness: Give high-quality advice but keep it under 3-4 short paragraphs so it fits in the chat.
* Use emojis: Use relevant farming emojis (🌾, 🪴, 🚜, 🐛).
* Disclaimer: ALWAYS end the response with the text: "⚠️ **Safety Disclaimer:** [Your disclaimer text here]". This MUST be the very last thing in the message.
* Language: CRITICAL: ALWAYS reply in the EXACT same language the user asked the question in (English, Hindi, or Hinglish).`
                },
                { role: "user", content: question }
            ],
            max_tokens: 800,
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
