export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabase } from '../../../lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { recoveryCode } = body

    if (!recoveryCode) return NextResponse.json({ error: 'missing recoveryCode' }, { status: 400 })

    const sb = getSupabase()
    if (!sb) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { data, error } = await sb
      .from('mother')
      .select('quizOrder')
      .eq('recoveryCode', recoveryCode.toUpperCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Recovery code not found' }, { status: 404 })
    }

    return NextResponse.json({ quizOrder: (data as any).quizOrder })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}