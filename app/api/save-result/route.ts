export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabase } from '../../../lib/supabase'
import nodeCrypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('/api/save-result body:', body)
    const { result, orderId, quizOrder } = body

    if (!result) return NextResponse.json({ error: 'missing result' }, { status: 400 })

    const sb = getSupabase()
    console.log('/api/save-result getSupabase type:', typeof getSupabase, 'sb:', typeof sb)
    if (!sb) {
      console.error('Supabase client not available')
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    console.log('sb.from type:', typeof (sb as any).from)

    // Use Node crypto to generate a short hex recovery code
    const recoveryCode = nodeCrypto.randomBytes(4).toString('hex').toUpperCase()
    console.log('Generated recoveryCode:', recoveryCode)

    const axisPairs = [ ['R','E'], ['S','L'], ['P','O'], ['C','T'] ]
    const scores: Record<string, number> = {}
    const axisSumsArr = Array.isArray(result.axisSums) ? result.axisSums : []
    axisSumsArr.forEach((sum: number, i: number) => {
      const key = axisPairs[i] ? (axisPairs[i][sum > 0 ? 0 : 1]) : `A${i}`
      scores[key] = Math.abs(sum)
    })

    const motherData: any = {
      id: `mother-${Date.now()}`,
      scores,
      total: result.score ?? null,
      typeCode: result.mapping?.code ?? null,
      typeName: result.mapping?.label ?? null,
      summary: result.mapping?.summary ?? null,
      details: result.details ?? null,
      recoveryCode,
      orderNo: orderId ?? null,
      quizOrder: quizOrder ?? null,
    }

    let data: any = null
    let error: any = null
    try {
      // Dump sb internals for debugging
      try {
        console.log('sb keys:', Object.keys(sb as any))
        console.dir(sb, { depth: 2 })
      } catch (dErr) {
        console.warn('Failed to dir sb:', dErr)
      }

      // Inspect return value of from('mothers')
      let fromObj: any
      try {
        fromObj = (sb as any).from('mothers')
        console.log('fromObj type:', typeof fromObj)
        try {
          console.log('fromObj keys:', Object.keys(fromObj))
          console.dir(fromObj, { depth: 2 })
        } catch (innerErr) {
          console.warn('Failed to dir fromObj:', innerErr)
        }
      } catch (fromErr) {
        console.error('calling sb.from threw:', fromErr)
        throw fromErr
      }

      if (!fromObj || typeof fromObj.insert !== 'function') {
        console.warn('fromObj.insert is not a function, will attempt REST fallback')
        // REST fallback
        const supaUrl = process.env.SUPABASE_URL
        const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supaUrl || !supaKey) {
          throw new Error('fromObj.insert not available and SUPABASE env not set for REST fallback')
        }
        const restUrl = `${supaUrl.replace(/\/$/, '')}/rest/v1/mothers`
        console.log('Attempting REST POST to', restUrl)
        const resp = await fetch(restUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supaKey,
            Authorization: `Bearer ${supaKey}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify(motherData),
        })
        const j = await resp.json().catch(() => null)
        if (!resp.ok) {
          throw new Error(`REST insert failed: ${resp.status} ${JSON.stringify(j)}`)
        }
        data = j
        error = null
      } else {
        const res = await fromObj.insert(motherData as any).select()
        // supabase-js v2 returns { data, error } or sometimes an array response; normalize
        data = res?.data ?? res
        error = res?.error ?? null
      }
    } catch (e) {
      console.error('Error while inserting to mothers:', e)
      return NextResponse.json({ error: String(e) }, { status: 500 })
    }
    if (error) {
      console.error('save-result DB error:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, recoveryCode, data })
  } catch (err: any) {
    console.error('/api/save-result error:', err)
    // Return detailed error info for debugging in dev (do not expose in prod)
    const info: any = {
      message: err?.message ?? String(err),
      name: err?.name ?? null,
      stack: err?.stack ?? null,
    }
    return NextResponse.json({ error: info }, { status: 500 })
  }
}
