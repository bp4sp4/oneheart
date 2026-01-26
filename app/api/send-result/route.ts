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

    if (!senderEmail) {
      return NextResponse.json({ error: 'Mail sender not configured' }, { status: 500 })
    }

    // If SMTP credentials are provided (SMTP login + key), use nodemailer SMTP transport.
    if (smtpLogin && apiKey) {
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

        await transporter.sendMail({
          from: `${senderName} <${senderEmail}>`,
          to,
          subject,
          html,
        })

        return NextResponse.json({ ok: true })
      } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
      }
    }

    // Fallback: try Brevo HTTP API (requires a REST API key, not SMTP key)
    if (!apiKey) {
      return NextResponse.json({ error: 'Mail service not configured' }, { status: 500 })
    }

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
