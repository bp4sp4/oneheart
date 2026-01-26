import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSupabase } from '../../../../lib/supabase'

const PAYMENTS_FILE = path.resolve(process.cwd(), 'data', 'payments.json')

function readPayments() {
  try {
    const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8')
    return JSON.parse(raw || '{}')
  } catch (e) {
    return {}
  }
}

function writePayments(obj: any) {
  try {
    fs.mkdirSync(path.dirname(PAYMENTS_FILE), { recursive: true })
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(obj, null, 2), 'utf-8')
  } catch (e) {
    // ignore
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const amount = body?.amount ?? 1000

    const apiKey = process.env.TOSS_API_KEY
    if (!apiKey) {
      // dev fallback or env not configured
      if (process.env.TOSS_CHECKOUT_URL) {
        return NextResponse.json({ url: process.env.TOSS_CHECKOUT_URL })
      }
      return NextResponse.json({ url: '/quiz' })
    }

    const orderNo = `oneheart-${Date.now()}`
    // Basic payload and validation
    const origin = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000'

    function isValidUrl(s: string) {
      try {
        // eslint-disable-next-line no-new
        new URL(s)
        return true
      } catch (e) {
        return false
      }
    }

    const resultCallback = `${origin}/api/toss/callback`
    const retUrl = `${origin}/quiz?pay=success&orderNo=${orderNo}`
    const retCancelUrl = `${origin}/pay?canceled=1&orderNo=${orderNo}`

    if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'invalid_amount', message: 'amount must be a positive integer', payload: { amount } }, { status: 400 })
    }

    if (![resultCallback, retUrl, retCancelUrl].every(isValidUrl)) {
      return NextResponse.json({ error: 'invalid_urls', message: 'resultCallback/retUrl/retCancelUrl must be valid absolute URLs', payload: { resultCallback, retUrl, retCancelUrl } }, { status: 400 })
    }

    const payload = {
      orderNo,
      amount: Number(amount),
      amountTaxFree: 0,
      productDesc: '엄마 유형 테스트',
      autoExecute: true,
      resultCallback,
      retUrl,
      retCancelUrl,
    }

    // Toss API expects Authorization header with the secret key (Basic base64(secretKey:))
    const basic = 'Basic ' + Buffer.from(apiKey + ':').toString('base64')

    let resp
    let json
    try {
      resp = await fetch('https://pay.toss.im/api/v2/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: basic },
        body: JSON.stringify(payload),
      })

      // try to parse JSON safely
      const text = await resp.text()
      try {
        json = text ? JSON.parse(text) : null
      } catch (e) {
        json = { raw: text }
      }
    } catch (fetchErr) {
      console.error('Toss create fetch error:', fetchErr)
      return NextResponse.json({ error: 'toss_fetch_failed', message: String(fetchErr) }, { status: 500 })
    }

    if (!resp.ok || json?.code !== 0) {
      console.error('Toss create failed; sent payload:', JSON.stringify(payload))
      console.error('Toss response status:', resp.status, 'body:', json)
      // include Toss response for easier debugging
      return NextResponse.json({ error: 'toss_create_failed', toss: json, sentPayload: payload }, { status: resp.status || 500 })
    }

    // persist the created payment record (Supabase if configured, else file)
    try {
      const sb = getSupabase()
      if (sb) {
        // upsert into payments table
        await (sb.from('payments') as any).upsert({ order_no: orderNo, pay_token: json.payToken, amount, status: 'CREATED', checkout_page: json.checkoutPage, raw: json, created_at: new Date().toISOString() }, { onConflict: 'order_no' })
      } else {
        const payments = readPayments()
        payments[orderNo] = {
          createdAt: new Date().toISOString(),
          orderNo,
          amount,
          status: 'CREATED',
          payToken: json.payToken,
          checkoutPage: json.checkoutPage,
          raw: json,
        }
        writePayments(payments)
      }
    } catch (e) {
      // ignore persistence errors
    }

    // return the checkout page URL from Toss
    return NextResponse.json({ url: json.checkoutPage, payToken: json.payToken, orderNo })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}
