import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");

    if (!paymentKey || !orderId) {
      return NextResponse.json(
        { message: "paymentKey and orderId are required" },
        { status: 400 }
      );
    }

    const TOSS_API_KEY = process.env.TOSS_API_KEY;
    if (!TOSS_API_KEY) {
      return NextResponse.json(
        { message: "TOSS_API_KEY not configured on server" },
        { status: 500 }
      );
    }

    const basic = "Basic " + Buffer.from(TOSS_API_KEY + ":").toString("base64");

    // Query Toss Payments API for the specific payment status
    const res = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        method: "GET",
        headers: {
          Authorization: basic,
          "Content-Type": "application/json",
        },
      }
    );

    const json = await res.json();
    console.log("Toss payment-status API response:", json); // Add logging here

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }

    // Check if the payment is DONE and update DB if not already
    if (json.status === "DONE") {
      try {
        // Check current status in DB
        const { data: order, error: fetchError } = await supabase
          .from("orders")
          .select("status")
          .eq("order_id", orderId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error(`Supabase fetch failed for orderId ${orderId}:`, fetchError);
        }

        if (order && order.status !== 'PAID') {
            const { error: dbError } = await supabase
              .from("orders")
              .update({
                status: "PAID",
                // test_access_token should already be set by the confirm route
                updated_at: new Date().toISOString(),
              })
              .eq("order_id", orderId);

            if (dbError) {
              console.error(
                `Supabase update failed during status check for orderId ${orderId}:`,
                dbError
              );
            } else {
              console.log(`Order ${orderId} status updated to PAID via status check.`);
            }
        }
      } catch (dbError: any) {
        console.error(`Database operation failed for orderId ${orderId} during status check:`, dbError);
      }
    }

    return NextResponse.json(json, { status: res.status });
  } catch (err: any) {
    console.error("/api/toss/payment-status error:", err);
    return NextResponse.json(
      { message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
