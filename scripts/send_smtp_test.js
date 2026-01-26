const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

function loadEnv(file) {
  const env = {}
  if (!fs.existsSync(file)) return env
  const content = fs.readFileSync(file, 'utf8')
  content.split(/\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/)
    if (!m) return
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    env[m[1]] = v
  })
  return env
}

;(async () => {
  const env = loadEnv(path.resolve(__dirname, '..', '.env'))
  const smtpLogin = env.BREVO_SMTP_LOGIN
  const smtpKey = env.BREVO_API_KEY
  const senderEmail = env.BREVO_SENDER_EMAIL
  const senderName = env.BREVO_SENDER_NAME || '엄마유형테스트'
  if (!smtpLogin || !smtpKey || !senderEmail) {
    console.error('Missing SMTP config in .env. Need BREVO_SMTP_LOGIN, BREVO_API_KEY, BREVO_SENDER_EMAIL')
    process.exit(2)
  }

  const transporter = nodemailer.createTransport({
    host: env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(env.BREVO_SMTP_PORT || 587),
    secure: false,
    auth: { user: smtpLogin, pass: smtpKey },
  })

  try {
    const to = process.argv[2] || 'bp4sp4@naver.com'
    const info = await transporter.sendMail({
      from: `${senderName} <${senderEmail}>`,
      to,
      subject: '엄마 유형 테스트 — SMTP 직접 테스트',
      html: '<p>SMTP 직접 테스트입니다.</p>',
    })
    console.log('Message sent:', info.messageId || info)
    process.exit(0)
  } catch (e) {
    console.error('Send failed:', e && e.message ? e.message : e)
    process.exit(1)
  }
})()
