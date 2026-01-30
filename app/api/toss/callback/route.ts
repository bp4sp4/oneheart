import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { supabase } from '../../../../lib/db' // Updated import

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
    // ignore write errors for now
  }
}

export async function POST(req: Request) {
  console.log('[TOSS CALLBACK] /api/toss/callback POST called');
  try {
    const body = await req.json().catch(() => ({}))
    console.log('[TOSS CALLBACK] body:', body);
    // Toss will POST result data here when autoExecute/resultCallback is used.
    // Persist the callback payload for later verification.
    const sb = supabase

    const key = body?.orderNo || body?.payToken || `callback_${Date.now()}`
    const status = body?.status || (body?.paidAmount ? 'PAY_COMPLETE' : 'UNKNOWN')

    if (sb) {
      // try upsert using a sensible conflict target (prefer pay_token, else order_no)
      try {
        const record: any = {
          order_no: body?.orderNo || null,
          pay_token: body?.payToken || null,
          status,
          payload: body,
          updated_at: new Date().toISOString(),
        }
        let upsertResult;
        if (body?.payToken) {
          upsertResult = await sb.from('payments').upsert(record, { onConflict: 'pay_token' });
        } else if (body?.orderNo) {
          upsertResult = await sb.from('payments').upsert(record, { onConflict: 'order_no' });
        } else {
          // no clear conflict target — insert instead
          upsertResult = await sb.from('payments').insert(record);
        }
        console.log('[TOSS CALLBACK] Supabase upsert result:', upsertResult);
        if (upsertResult.error) {
          console.error('[TOSS CALLBACK] Supabase upsert error:', upsertResult.error);
        }
      } catch (upsertErr) {
        // If Supabase upsert fails for any reason, fall back to file persistence below
        console.error('[TOSS CALLBACK] Supabase upsert failed, falling back to file. Error:', upsertErr)
        const payments = readPayments()
        const existing = payments[key] || {}
        payments[key] = {
          ...(existing || {}),
          orderNo: body?.orderNo || existing.orderNo,
          payToken: body?.payToken || existing.payToken,
          updatedAt: new Date().toISOString(),
          status,
          payload: body,
        }
        writePayments(payments)
      }
    } else {
      const payments = readPayments()
      const existing = payments[key] || {}
      payments[key] = {
        ...(existing || {}),
        orderNo: body?.orderNo || existing.orderNo,
        payToken: body?.payToken || existing.payToken,
        updatedAt: new Date().toISOString(),
        status,
        payload: body,
      }
      writePayments(payments)
    }

    // eslint-disable-next-line no-console
    console.log('[TOSS CALLBACK] persisted/updated:', key, status)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}
