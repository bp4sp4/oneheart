"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PayPage() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  const startPayment = () => {
    // 결제위젯 페이지로 이동 (로컬에서 바로 테스트 가능)
    router.push('/pay/checkout')
  }

  return (
    <main style={{ padding: 40 }}>
      <h2>결제</h2>
      <p>테스트를 진행하려면 결제가 필요합니다. (샘플 금액: 1,000원)</p>
      <div style={{ marginTop: 16 }}>
        <button onClick={startPayment} disabled={loading} style={{ padding: '10px 14px' }}>{loading ? '처리중...' : '토스로 결제하기'}</button>
        <button onClick={() => router.push('/quiz')} style={{ marginLeft: 12 }}>결제 없이 바로가기 (개발용)</button>
      </div>
      {err && <div style={{ marginTop: 12, color: 'crimson' }}>{err}</div>}
    </main>
  )
}
