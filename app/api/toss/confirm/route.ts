import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentKey, orderId, amount } = body;

    const TOSS_API_KEY = process.env.TOSS_API_KEY;
    if (!TOSS_API_KEY) {
      return NextResponse.json({ message: "TOSS_API_KEY not configured on server" }, { status: 500 });
    }

    const basic = "Basic " + Buffer.from(TOSS_API_KEY + ":").toString("base64");

    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: basic,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err: any) {
    console.error("/api/toss/confirm error:", err);
    return NextResponse.json({ message: err?.message || String(err) }, { status: 500 });
  }
}
