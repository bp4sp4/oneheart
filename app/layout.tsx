import type { Metadata } from 'next'
import '../styles/normalize.css'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/layout.css'
import '../styles/components.css'
import FooterWrapper from './components/FooterWrapper'

export const metadata: Metadata = {
  title: '한마음연구소 - 엄마유형 테스트로 알아보는 나의 성향',
  description: '엄마유형 테스트로 내 성향과 유형을 쉽고 재미있게 알아보세요. 검사하는 분이 직접 자신의 엄마유형을 확인하고, 결과를 친구들과 공유할 수 있습니다. 다양한 유형별 해설도 제공합니다.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '한마음연구소 - 엄마유형 테스트로 알아보는 나의 성향',
    description: '엄마유형 테스트로 내 성향과 유형을 쉽고 재미있게 알아보세요. 검사하는 분이 직접 자신의 엄마유형을 확인하고, 결과를 친구들과 공유할 수 있습니다. 다양한 유형별 해설도 제공합니다.',
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
        <link rel="preload" href="/images/loading.gif" as="image" />
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
