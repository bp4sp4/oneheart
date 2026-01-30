import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/db' // Use the unified Supabase client
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const amount = body?.amount ?? 1000

    const apiKey = process.env.TOSS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ url: '/quiz', error: 'Toss API key not configured' })
    }

    const orderId = `oneheart-${Date.now()}`
    const tempToken = crypto.randomUUID(); // For linking session before payment is confirmed

    const origin = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000'

    function isValidUrl(s: string) {
      try {
        new URL(s);
        return true
      } catch (e) {
        return false
      }
    }

    const successUrl = `${origin}/payment/success` // This page will handle the confirmation
    const failUrl = `${origin}/payment/fail`

    if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'invalid_amount', message: 'amount must be a positive integer' }, { status: 400 })
    }

    if (!isValidUrl(successUrl) || !isValidUrl(failUrl)) {
      return NextResponse.json({ error: 'invalid_urls', message: 'Success/Fail URLs are not valid absolute URLs' }, { status: 400 })
    }

    // First, create the pending order record in our database.
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        amount: Number(amount),
        temp_token: tempToken,
        status: 'PENDING',
      });

    if (insertError) {
      console.error('Supabase insert order failed:', insertError);
      return NextResponse.json({ error: 'database_error', message: 'Failed to create an order record.' }, { status: 500 });
    }

    // Then, create the payment with Toss
    const tossPayload = {
      method: '카드', // Example payment method
      orderId: orderId,
      amount: Number(amount),
      orderName: '엄마 유형 테스트',
      successUrl: successUrl,
      failUrl: failUrl,
    }

    const basic = 'Basic ' + Buffer.from(apiKey + ':').toString('base64')

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: basic },
      body: JSON.stringify(tossPayload),
    })

    const tossJson = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('Toss create failed; sent payload:', JSON.stringify(tossPayload))
      console.error('Toss response:', tossJson)
      // Attempt to clean up the pending order we created
      await supabase.from('orders').delete().eq('order_id', orderId);
      return NextResponse.json({ error: 'toss_create_failed', details: tossJson }, { status: tossResponse.status || 500 })
    }

    // Return the checkout URL from Toss to the client
    return NextResponse.json({ checkoutUrl: tossJson.checkout.url, orderId: orderId });

  } catch (err: any) {
    console.error('Initiate payment error:', err);
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}
