import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      throw new Error("Unauthorized");
    }

    const userId = authData.user.id;

    const {
      bookingId,
      bookingType,
      razorpay_payment_id,
      razorpay_order_id,
      amount,
    } = await req.json();

    if (!bookingId || !razorpay_payment_id || !amount) {
      throw new Error("Missing required payment data");
    }

    const type =
      bookingType === "tool" ? "Tool Booking" : "Warehouse Booking";

    // 1️⃣ Insert payment history (MATCHES TABLE EXACTLY)
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

    if (paymentError) throw paymentError;

    // 2️⃣ Update booking status
    const table =
      bookingType === "tool" ? "tool_bookings" : "warehouse_bookings";

    const { error: bookingError } = await supabase
      .from(table)
      .update({ status: "paid" })
      .eq("id", bookingId);

    if (bookingError) throw bookingError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Record payment error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
