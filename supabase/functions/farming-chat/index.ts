

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, conversationId } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const insertData: any = { session_id: sessionId };
      if (userId) insertData.user_id = userId;

      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .insert(insertData)
        .select()
        .single();
      if (convError) throw convError;
      convId = conv.id;
    }

    // Fetch dynamic tools and warehouses
    const { data: tools } = await supabase
      .from('tools')
      .select('*')
      .eq('availability', true);

    const { data: warehouses } = await supabase
      .from('warehouses')
      .select('*, warehouse_storage_options(*)');

    // Fetch user-specific context if logged in
    let userContext = '';
    if (userId) {
      const [soilChecks, paymentHistory, toolBookings, warehouseBookings, recentMessages] = await Promise.all([
        supabase.from('soil_checks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('payment_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('tool_bookings').select('*, tools(name)').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('warehouse_bookings').select('*, warehouse_storage_options(*, warehouses(name))').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('messages').select('*, profiles(full_name)').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
      ]);

      userContext = `

USER CONTEXT (PRIVATE - Only share with this specific user):
${soilChecks.data?.length ? `
Recent Soil Checks:
${soilChecks.data.map((s: any) => `- ${s.location}: pH ${s.ph_level}, Status: ${s.status}, Recommendations: ${s.recommendations || 'Pending'}`).join('\n')}
` : ''}
${paymentHistory.data?.length ? `
Payment History:
${paymentHistory.data.map((p: any) => `- ₹${p.amount} for ${p.type} (${p.payment_status}) on ${new Date(p.created_at).toLocaleDateString()}`).join('\n')}
` : ''}
${toolBookings.data?.length ? `
Tool Bookings:
${toolBookings.data
            .slice()
            .reverse()
            .map((b) => `- ${b.tools?.name}: ${b.start_date} to ${b.end_date} (${b.status}) - ₹${b.total_cost}`)
            .join('\n')}
` : ''}

${warehouseBookings.data?.length ? `
Warehouse Bookings:
${warehouseBookings.data.map((b: any) => `- ${b.warehouse_storage_options?.warehouses?.name}: ${b.space_sqft} sqft, ${b.start_date} to ${b.end_date} (${b.status}) - ₹${b.total_cost}`).join('\n')}
` : ''}
${recentMessages.data?.length ? `
Recent Community Messages:
${recentMessages.data.map((m: any) => `- ${m.profiles?.full_name || 'User'}: ${m.message.substring(0, 100)}...`).join('\n')}
` : ''}`;
    }

    // Store user message
    const userMessage = messages[messages.length - 1];
    await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        role: 'user',
        content: userMessage.content
      });

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are KrishiSanjivni's AI assistant - a helpful, knowledgeable guide for Indian farmers. You help with farming tools, warehouses, soil health, government schemes, and agricultural news.

CORE CAPABILITIES:
✓ Answer questions about available tools and warehouses
✓ Provide information on Indian government schemes (PM-KISAN, Kisan Credit Card, Pradhan Mantri Fasal Bima Yojana, etc.)
✓ Share agricultural news and government announcements
✓ Help with soil health and crop recommendations
✓ Assist with bookings and payment queries (ONLY for the logged-in user's own data)

IMPORTANT SECURITY RULES:
🔒 NEVER share other users' private information
🔒 Only discuss the logged-in user's own bookings, payments, soil checks, and messages
🔒 If asked about other users' data, politely decline and explain privacy

INDIAN GOVERNMENT SCHEMES KNOWLEDGE:
- PM-KISAN (Pradhan Mantri Kisan Samman Nidhi): ₹6000/year direct benefit transfer to farmers
- Kisan Credit Card (KCC): Low-interest loans for farmers
- Pradhan Mantri Fasal Bima Yojana (PMFBY): Crop insurance scheme
- Soil Health Card Scheme: Free soil testing and recommendations
- Paramparagat Krishi Vikas Yojana (PKVY): Organic farming support
- National Agriculture Market (e-NAM): Online trading platform
- Pradhan Mantri Krishi Sinchai Yojana: Irrigation support

RESPONSE FORMAT:
- Use bullet points for lists
- Keep paragraphs short and clear
- Include locations and prices for tools/warehouses
- Support Hindi and regional languages when asked
- Be friendly and conversational

Available Tools:
${tools?.map(t => `- ${t.name} (${t.category}): ${t.description || 'No description'} | Location: ${t.location || 'Not specified'} | Price: ₹${t.price_per_day}/day, ₹${t.price_per_month}/month, ₹${t.price_per_season}/season`).join("\n")}

Available Warehouses:
${warehouses?.map((w: any) => `- ${w.name} at ${w.location}: ${w.description || 'No description'} | Total Space: ${w.total_space_sqft} sqft, Available: ${w.available_space_sqft} sqft | Storage Options: ${w.warehouse_storage_options?.map((o: any) => `${o.storage_type} (${o.size_category})`).join(", ") || "None"}`).join("\n")}
${userContext}
`
              }
            ]
          },
          ...messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    // Store assistant response
    await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        role: 'assistant',
        content: assistantMessage
      });

    return new Response(
      JSON.stringify({ message: assistantMessage, conversationId: convId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in farming-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
