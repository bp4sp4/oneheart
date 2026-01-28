import { NextResponse } from 'next/server'
import { getSupabase } from '../../../lib/supabase'

export async function GET() {
  try {
    const sb = getSupabase()
    if (!sb) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })

    console.log('Debug Supabase: client obtained')

    // Check by selecting counts from payments and mothers
    const paymentsRes = await (sb as any).from('payments').select('id', { count: 'exact', head: false }).limit(1)
    const mothersRes = await (sb as any).from('mothers').select('id', { count: 'exact', head: false }).limit(1)

    return NextResponse.json({ ok: true, payments: { data: paymentsRes?.data ?? null, error: paymentsRes?.error ?? null }, mothers: { data: mothersRes?.data ?? null, error: mothersRes?.error ?? null } })
  } catch (err: any) {
    console.error('/api/debug-supabase error:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
