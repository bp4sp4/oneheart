import { useState } from 'react'
import styles from './ShareControls.module.css'

export default function ShareControls({
  mapping,
}: {
  mapping: { code: string; label: string; summary: string } | null
}) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v)

  const sendEmail = async () => {
    if (!email || !validateEmail(email)) {
      setMessage('유효한 이메일을 입력하세요.')
      return
    }
    if (!mapping) {
      setMessage('먼저 테스트 결과를 확인하세요.')
      return
    }

    setSending(true)
    setMessage(null)

    const subject = `엄마 유형 테스트 결과 — ${mapping.label} (${mapping.code})`
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oneheart.kr'
    const pdfParams = new URLSearchParams({
      code: mapping.code,
      label: mapping.label,
      summary: mapping.summary,
    })
    const pdfUrl = `${origin}/api/result-pdf?${pdfParams.toString()}`

    const html = `
      <div style="margin:0;padding:0;background:#F4F6F8;">
        <div style="max-width:560px;margin:0 auto;padding:28px 16px;font-family:'Pretendard','Apple SD Gothic Neo',Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#0064FF 0%,#4DA3FF 100%);border-radius:18px;padding:22px 20px;color:#fff;">
            <div style="font-size:14px;opacity:.9;letter-spacing:.5px;">엄마유형테스트 결과 리포트</div>
            <div style="font-size:26px;font-weight:800;margin-top:8px;line-height:1.2;">당신의 ‘엄마 에너지’가
              <br/>선명하게 정리되었어요</div>
            <div style="margin-top:14px;display:inline-block;background:rgba(255,255,255,.16);padding:8px 12px;border-radius:999px;font-size:14px;">
              ${mapping.code} — ${mapping.label}
            </div>
          </div>

          <div style="background:#fff;border-radius:18px;box-shadow:0 10px 30px rgba(17,24,39,.08);padding:22px 20px;margin-top:14px;">
            <div style="font-size:16px;font-weight:800;color:#111827;">핵심 해석</div>
            <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#374151;">${mapping.summary}</div>
            <div style="margin-top:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:14px;">
              <div style="font-size:13px;color:#6B7280;">한 줄 메시지</div>
              <div style="margin-top:6px;font-size:14px;color:#111827;font-weight:700;">"완벽보다 ‘지속 가능한 리듬’이 오래 갑니다."</div>
            </div>

            <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
              <a href="${pdfUrl}" target="_blank" style="display:inline-block;background:#0064FF;color:#fff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;font-size:14px;">PDF로 결과 다운로드</a>
              <a href="${origin}" target="_blank" style="display:inline-block;background:#F3F4F6;color:#111827;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;font-size:14px;">사이트로 다시 보기</a>
            </div>
          </div>

          <div style="margin-top:12px;color:#9CA3AF;font-size:12px;line-height:1.5;text-align:center;">
            생성일: ${new Date().toLocaleString('ko-KR')}<br/>
            © 2026 oneheart.kr
          </div>
        </div>
      </div>
    `

    try {
      const res = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, html }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessage(`전송 실패: ${err?.error ?? res.statusText}`)
      } else {
        setMessage('이메일을 성공적으로 보냈습니다.')
      }
    } catch (e: any) {
      setMessage(`전송 중 오류가 발생했습니다: ${e?.message ?? String(e)}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.controls}>
      <div className={styles.row}>
        <input
          type="email"
          placeholder="받는 사람 이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button onClick={sendEmail} disabled={!mapping || sending} className={styles.btn}>
          {sending ? '전송 중...' : '이메일 전송'}
        </button>
      </div>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  )
}
