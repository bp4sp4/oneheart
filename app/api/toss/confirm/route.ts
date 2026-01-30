import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/db"; // updated import

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentKey, orderId, amount, testAccessToken } = body;
    console.log("Incoming payment confirmation request:", { paymentKey, orderId, amount });

    // 0. Check if order is already PAID in our DB
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("status, test_access_token")
      .eq("order_id", orderId)
      .maybeSingle();
    if (orderError) {
      console.error("DB lookup error:", orderError);
      return NextResponse.json({ message: "DB 조회 오류", detail: orderError.message }, { status: 500 });
    }
    if (orderData && orderData.status === "PAID") {
      console.log("Order already paid:", { orderId, status: orderData.status });
      // 이미 결제 완료된 주문이면 Toss에 중복 confirm 요청하지 않고 바로 성공 응답
      return NextResponse.json({ success: true, alreadyPaid: true, testAccessToken: orderData.test_access_token }, { status: 200 });
    }

    const TOSS_API_KEY = process.env.TOSS_API_KEY;
    if (!TOSS_API_KEY) {
      console.error("TOSS_API_KEY not configured.");
      return NextResponse.json({ message: "TOSS_API_KEY not configured on server" }, { status: 500 });
    }

    const basic = "Basic " + Buffer.from(TOSS_API_KEY + ":").toString("base64");

    // 1. Confirm payment with Toss
    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: basic,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const json = await res.json();
    console.log("Toss API response:", json);

    if (!res.ok) {
      console.error("Toss API error response:", json);
      return NextResponse.json(json, { status: res.status });
    }

    // 2. If payment confirmation is successful, update DB via Supabase
    if (json.status === "DONE") {
      try {
        const { error: dbError } = await supabase
          .from("orders")
          .update({
            status: "PAID",
            test_access_token: testAccessToken,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);

        if (dbError) {
          console.error(
            `Supabase update failed for orderId ${orderId}:`,
            dbError
          );
          // The payment is confirmed with Toss, but our DB update failed.
          // This is a critical state that needs monitoring.
          // For now, we'll still return success to the client but log the internal error.
        } else {
          console.log(
            `Order ${orderId} updated to PAID with token ${testAccessToken}.`
          );
        }
      } catch (dbError: any) {
        console.error(`Database update failed for orderId ${orderId}:`, dbError);
      }
      // Return a clear success response only when status is DONE
      console.log("Final success response (Toss DONE):", { ...json, success: true });
      return NextResponse.json({ ...json, success: true }, { status: 200 });
    }

    // For statuses other than DONE (e.g., IN_PROGRESS, WAITING_FOR_DEPOSIT),
    // simply return the response from Toss as is.
    console.log("Returning Toss response for non-DONE status:", json);
    return NextResponse.json(json, { status: res.status });
  } catch (err: any) {
    console.error("/api/toss/confirm error:", err);
    console.error("/api/toss/confirm error (full object):", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({ message: err?.message || String(err) }, { status: 500 });
  }
}
