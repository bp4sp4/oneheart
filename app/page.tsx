import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 760, width: '100%' }}>
        <h1>엄마 유형 테스트</h1>
        <p>테스트에 오신 것을 환영합니다. 간단한 질문지를 통해 유형을 확인할 수 있습니다.</p>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <Link href="/payment"><button style={{ padding: '10px 14px' }}>결제 후 테스트 시작</button></Link>
          <Link href="/quiz"><button style={{ padding: '10px 14px' }}>결제 없이 바로 보기 (개발용)</button></Link>
        </div>

        <section style={{ marginTop: 28 }}>
          <h3>간단 안내</h3>
          <ul>
            <li>결제 후 테스트를 시작하실 수 있습니다 (토스 연동 예정).</li>
            <li>개발 중인 환경에서는 바로 시작 버튼으로 테스트 페이지로 이동합니다.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
