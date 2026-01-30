import type { Metadata } from 'next'
import '../styles/normalize.css'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/layout.css'
import '../styles/components.css'
import FooterWrapper from './components/FooterWrapper'

export const metadata: Metadata = {
  title: '엄마 유형 테스트',
  description: '엄마 유형 테스트 - 초기 구조와 컴포넌트',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '엄마 유형 테스트',
    description: '엄마 유형 테스트 - 초기 구조와 컴포넌트',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: '엄마 유형 테스트 OG 이미지',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '엄마 유형 테스트',
    description: '엄마 유형 테스트 - 초기 구조와 컴포넌트',
    images: ['/og_image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:image" content="/og_image.png" />
        <meta property="og:title" content="엄마 유형 테스트" />
        <meta property="og:description" content="엄마 유형 테스트 - 초기 구조와 컴포넌트" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="엄마 유형 테스트" />
        <meta name="twitter:description" content="엄마 유형 테스트 - 초기 구조와 컴포넌트" />
        <meta name="twitter:image" content="/og_image.png" />
      </head>
      <body>{children}
        <FooterWrapper />
      </body>
    </html>
  )
}
