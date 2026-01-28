"use client";

import Link from 'next/link'
import { useState } from 'react'
import Header from './components/Header'
import styles from './page.module.css'

export default function HomePage() {
  const [emailStatus, setEmailStatus] = useState<string>('')
  const [sending, setSending] = useState(false)

  const testEmail = async () => {
    setSending(true)
    setEmailStatus('전송 중...')
    
    try {
      const res = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'bp4sp4@naver.com',
          subject: '엄마유형테스트 - 테스트 이메일',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #2B7FFF; text-align: center;">엄마유형테스트</h1>
                <p style="font-size: 16px; line-height: 1.6;">안녕하세요,</p>
                <p style="font-size: 16px; line-height: 1.6;">이메일 시스템 테스트 메일입니다.</p>
                <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>발송 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                  <p><strong>시스템 상태:</strong> 정상 작동</p>
                </div>
              </div>
            </div>
          `
        })
      })

      const data = await res.json()
      
      if (data.ok) {
        setEmailStatus('✅ 이메일 전송 성공!')
      } else {
        setEmailStatus(`❌ 전송 실패: ${data.error}`)
      }
    } catch (error) {
      setEmailStatus(`❌ 에러: ${error}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroLogo}></div>
        <p className={styles.heroText}>
          엄마의 걱정을<br/>
          한마음연구소가 정리해드릴게요
        </p>
      </section>
      <section className={styles.intro}>
        <h2 className={styles.introTitle}>엄마니까,</h2>
        <p className={styles.introDescription}>
          아이를 키우면서 특별한 문제가 없어도<br/>마음의 걸림돌을 느끼는 순간들이 있습니다.
        </p>
      </section>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>엄마 유형 테스트</h1>
          <p className={styles.description}>테스트에 오신 것을 환영합니다. 간단한 질문지를 통해 유형을 확인할 수 있습니다.</p>

          <div className={styles.buttonGroup}>
            <Link href="/payment"><button className={styles.button}>결제 후 테스트 시작</button></Link>
            <Link href="/quiz"><button className={styles.button}>결제 없이 바로 보기 (개발용)</button></Link>
            <button 
              onClick={testEmail} 
              disabled={sending}
              className={styles.emailButton}
            >
              {sending ? '전송 중...' : '📧 이메일 테스트'}
            </button>
          </div>

          {emailStatus && (
            <div className={`${styles.statusMessage} ${emailStatus.includes('✅') ? styles.statusSuccess : styles.statusError}`}>
              {emailStatus}
            </div>
          )}

          <section className={styles.section}>
            <h3>간단 안내</h3>
            <ul>
              <li>결제 후 테스트를 시작하실 수 있습니다 (토스 연동 예정).</li>
              <li>개발 중인 환경에서는 바로 시작 버튼으로 테스트 페이지로 이동합니다.</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}
