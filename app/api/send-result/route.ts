import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type ReqBody = {
  to: string
  subject: string
  html: string
}

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json()
    const { to, subject, html } = body

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const apiKey = process.env.BREVO_API_KEY
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL
    const senderName = process.env.BREVO_SENDER_NAME || '엄마유형테스트'
    const smtpLogin = process.env.BREVO_SMTP_LOGIN
    const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com'
    const smtpPort = Number(process.env.BREVO_SMTP_PORT || '587')

    // 디버깅: 환경 변수 확인 (실제 값은 로그에만 표시, 민감 정보는 마스킹)
    console.log('[Email Debug] Config check:', {
      hasApiKey: !!apiKey,
      hasSenderEmail: !!senderEmail,
      hasSmtpLogin: !!smtpLogin,
      smtpHost,
      smtpPort,
      to,
      subject,
    })

    if (!senderEmail) {
      console.error('[Email Error] Sender email not configured')
      return NextResponse.json({ error: 'Mail sender not configured' }, { status: 500 })
    }

    // If SMTP credentials are provided (SMTP login + key), use nodemailer SMTP transport.
    if (smtpLogin && apiKey) {
      console.log('[Email] Using SMTP transport')
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpLogin,
            pass: apiKey,
          },
        })

        console.log('[Email] Sending via SMTP...')
        const info = await transporter.sendMail({
          from: `${senderName} <${senderEmail}>`,
          to,
          subject,
          html,
        })

        console.log('[Email] SMTP send success:', info.messageId)
        return NextResponse.json({ ok: true })
      } catch (e: any) {
        console.error('[Email Error] SMTP failed:', e?.message ?? String(e))
        return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
      }
    }

    // Fallback: try Brevo HTTP API (requires a REST API key, not SMTP key)
    if (!apiKey) {
      console.error('[Email Error] No API key configured for fallback')
      return NextResponse.json({ error: 'Mail service not configured' }, { status: 500 })
    }

    console.log('[Email] Using Brevo HTTP API fallback')
    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json', // 추가
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

if (!res.ok) {
      const errorData = await res.json() // text 대신 json으로 확인
      console.error('[Email Error] Brevo API failed:', errorData) // 서버 로그에서 에러 원인 확인 가능
      return NextResponse.json({ error: errorData.message || 'Unknown error' }, { status: res.status })
    }

    console.log('[Email] Brevo API send success')
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[Email Error] Unexpected error:', err?.message ?? String(err))
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
