import { useState } from 'react'
import styles from './ShareControls.module.css'

export default function ShareControls({
  score,
  mapping,
}: {
  score: number | null
  mapping: { code: string; label: string; summary: string } | null
}) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleDownload = () => {
    const payload = {
      score,
      mapping,
      time: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mother-test-result.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v)

  const sendEmail = async () => {
    if (!email || !validateEmail(email)) {
      setMessage('유효한 이메일을 입력하세요.')
      return
    }
    if (score === null || !mapping) {
      setMessage('먼저 점수를 계산하세요.')
      return
    }

    setSending(true)
    setMessage(null)

    const subject = `엄마 유형 테스트 결과: ${mapping.label} (${mapping.code})`
    const html = `<h3>엄마 유형 테스트 결과</h3><p>점수: ${score}</p><p>유형: ${mapping.code} - ${mapping.label}</p><p>${mapping.summary}</p>`

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
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="email"
          placeholder="받는 사람 이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}
        />
        <button onClick={sendEmail} disabled={score === null || sending} className={styles.btn}>
          {sending ? '전송 중...' : '이메일 전송'}
        </button>
        <button onClick={handleDownload} disabled={score === null} className={styles.btn}>
          결과 다운로드
        </button>
      </div>
      {message && <div style={{ marginTop: 8, color: '#111' }}>{message}</div>}
    </div>
  )
}
