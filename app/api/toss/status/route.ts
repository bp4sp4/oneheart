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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { orderNo, payToken } = body || {}

    const payments = readPayments()

    // check by orderNo in persisted records
    if (orderNo && payments[orderNo]) {
      const rec = payments[orderNo]
      const sb = getSupabase()
      // if created but not completed, try to verify with Toss if possible
      if (rec.status === 'CREATED' && rec.payToken && process.env.TOSS_API_KEY) {
        try {
          const resp = await fetch(`https://pay.toss.im/api/v2/payments/${encodeURIComponent(rec.payToken)}`, { headers: { 'Content-Type': 'application/json' } })
          const external = await resp.json().catch(() => null)
          if (external && external.status === 'PAY_COMPLETE') {
            rec.status = 'PAY_COMPLETE'
            rec.external = external
            payments[orderNo] = rec
            try { fs.mkdirSync(path.dirname(PAYMENTS_FILE), { recursive: true }); fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8') } catch(e){}
            return NextResponse.json({ ok: true, found: true, record: rec })
          }
        } catch (e) {
          // fall through
        }
      }
      return NextResponse.json({ ok: true, found: true, record: rec })
    }

    // search by payToken within persisted records
    if (payToken) {
      const keys = Object.keys(payments)
      for (const k of keys) {
        const p = payments[k]
        if (p && p.payToken === payToken) {
          return NextResponse.json({ ok: true, found: true, record: p })
        }
      }
      // fallback: query supabase by pay_token
      const sb = getSupabase()
      if (sb) {
        const { data } = await sb.from('payments').select('*').eq('pay_token', payToken).limit(1)
        if (data && data.length > 0) return NextResponse.json({ ok: true, found: true, record: data[0] })
      }
    }

    // if Toss API key present and payToken provided, try to fetch status from Toss
    const apiKey = process.env.TOSS_API_KEY
    if (apiKey && payToken) {
      const resp = await fetch(`https://pay.toss.im/api/v2/payments/${encodeURIComponent(payToken)}`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await resp.json().catch(() => null)
      return NextResponse.json({ ok: true, found: !!json, external: json })
    }

    return NextResponse.json({ ok: true, found: false })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}
