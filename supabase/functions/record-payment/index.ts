import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to return a structured JSON error response with the correct HTTP status
function errorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- 1. Auth check ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing Authorization header", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return errorResponse("Unauthorized: invalid or expired token", 401);
  }

  const userId = authData.user.id;

  // --- 2. Parse + validate request body ---
  let body: {
    bookingId?: string;
    bookingType?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    amount?: number;
  };

  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const { bookingId, bookingType, razorpay_payment_id, razorpay_order_id, amount } = body;

  if (!bookingId || !razorpay_payment_id || !amount) {
    return errorResponse(
      "Missing required fields: bookingId, razorpay_payment_id, and amount are required",
      400
    );
  }

  if (!bookingType || !["tool", "warehouse"].includes(bookingType)) {
    return errorResponse(
      "Invalid bookingType: must be 'tool' or 'warehouse'",
      400
    );
  }

  // --- 3. Validate Razorpay signature (basic check — payment ID format) ---
  if (!razorpay_payment_id.startsWith("pay_")) {
    return errorResponse(
      "Invalid Razorpay payment ID format",
      400
    );
  }

  // --- 4. Record payment + update booking (in a try/catch for unexpected DB errors) ---
  try {
    const type = bookingType === "tool" ? "Tool Booking" : "Warehouse Booking";

    const { error: paymentError } = await supabase
      .from("payment_history")
      .insert({
        user_id: userId,
        booking_id: bookingId,
        type,
        amount,
        payment_status: "paid",
        transaction_id: razorpay_payment_id,
        razorpay_payment_id,
        razorpay_order_id,
      });

    if (paymentError) {
      console.error("Payment insert error:", paymentError.message);
      // Check for FK violation or constraint errors → 400, otherwise 500
      if (paymentError.code === "23503" || paymentError.code === "23505") {
        return errorResponse(`Database constraint error: ${paymentError.message}`, 400);
      }
      return errorResponse(`Failed to record payment: ${paymentError.message}`, 500);
    }

    const table = bookingType === "tool" ? "tool_bookings" : "warehouse_bookings";
    const { error: bookingError } = await supabase
      .from(table)
      .update({ status: "paid" })
      .eq("id", bookingId);

    if (bookingError) {
      console.error("Booking update error:", bookingError.message);
      return errorResponse(`Failed to update booking status: ${bookingError.message}`, 500);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("Unexpected error in record-payment:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
