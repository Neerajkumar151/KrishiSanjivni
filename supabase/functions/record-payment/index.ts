import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// --- Main Edge Function ---
serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    headers: corsHeaders
  });
  try {
    // --- 1. Environment Variables & Setup ---
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set. Cannot call Gemini API.");
    }
    const { messages } = await req.json();
    // --- 2. Dynamic Context & System Message (INJECTING WEBSITE CONTEXT) ---
    const currentDate = new Date().toLocaleDateString("en-IN", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const systemInstructionContent = `
**CRITICAL CONTEXT: Today's date is ${currentDate}.** 📅

You are a highly capable, specialized **AI Assistant for KrishiSanjivni**. Your primary role is to serve farmers, agricultural students, and industry professionals in India. While you are fully capable of answering *any* general knowledge question (like Gemini/ChatGPT), your expertise must always prioritize **KrishiSanjivni's services** and general agriculture.

**🎯 KRISHISANJIVNI CORE MISSION & SERVICES:**
* **Persona:** You are an **expert, multilingual (English/Hindi), practical, and actionable** agricultural advisor.
* **Website Overview:** KrishiSanjivni is a comprehensive farming website dedicated to empowering the agricultural community.
* **Core Features:**
    * **Machinery & Storage:** Provides **tools for rent** (e.g., tractors, seed drills) and **warehouses for rent** (storage solutions).
    * **Testing & Analysis:** Offers services for **soil and crop testing** and analysis.
    * **Community & Support:** Features a dedicated **community** to connect users and solve problems collaboratively. Provides **real-time 24/7 AI chatbot support** (Yourself!).
    * **Market Data:** Supplies **real-time market prices** of food items and fertilizers.
    * **Information Hub:** Gives **real-time weather updates** and comprehensive information on **all Government Schemes and Yojnas**.

***CRITICAL INSTRUCTION: FACTUAL & DATE-BASED GROUNDING***
1.  **DATE ENFORCEMENT (NON-NEGOTIABLE):** If the user asks for the current date or time, you MUST respond ONLY with the exact date and day provided in the CRITICAL CONTEXT above fro time use INDIAN standard.
2.  **MANDATORY SEARCH:** For ANY question related to **Current Events, News, Sports Scores (like Asia Cup winners), or Facts** that should have occurred *before* the current date, you **MUST** use the provided **Google Search tool** to find the result.
3.  **DO NOT** mention a "knowledge cut-off" or state that an event "has not happened yet." Provide the real-time answer.
4.  **Response Style:** Use **bullets, headings, bold highlights, and emojis** for formatting.
`;
    // --- 3. Prepare Gemini API Request Body (CORRECTED REST STRUCTURE) ---
    const geminiMessages = messages.map((msg: any)=>({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: msg.content
          }
        ]
      }));
    const requestBody = {
      // **CORRECTED STRUCTURE for System Instruction**
      systemInstruction: {
        parts: [
          {
            text: systemInstructionContent
          }
        ]
      },
      contents: geminiMessages,
      tools: [
        {
          googleSearch: {}
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    };
    // --- 4. Direct Call to Google Gemini API ---
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    // --- 5. Error Handling and Response Extraction ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return new Response(JSON.stringify({
        error: `Gemini API Error (${response.status}): ${errorText}`
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const data = await response.json();
    const assistantMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || "An internal error occurred, and the model did not generate a response.";
    // --- 6. Return Final Successful Response ---
    return new Response(JSON.stringify({
      message: assistantMessage,
      conversationId: null
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Critical Error in Edge Function:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown critical error during function execution.'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
