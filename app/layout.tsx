import type { Metadata } from 'next'
import '../styles/normalize.css'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/layout.css'
import '../styles/components.css'

export const metadata: Metadata = {
  title: '엄마 유형 테스트',
  description: '엄마 유형 테스트 - 초기 구조와 컴포넌트',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
