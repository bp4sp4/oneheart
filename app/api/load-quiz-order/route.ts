import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/db' // Updated import

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('test_progress')
      .select('question_order')
      .eq('test_access_token', token)
      .maybeSingle()

    if (error) {
      console.error('Supabase fetch question order error:', error)
      return NextResponse.json({ error: 'failed to fetch question order' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'question order not found' }, { status: 404 })
    }

    return NextResponse.json({ question_order: data.question_order })
  } catch (err: any) {
    console.error('API /api/load-quiz-order POST Error:', err)
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}