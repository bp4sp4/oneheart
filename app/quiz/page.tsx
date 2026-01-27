"use client"
import { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../components/Header'
import QuestionList from '../components/QuestionList'
import Results from '../components/Results'
import ShareControls from '../components/ShareControls'
import styles from './quiz.module.css'

export default function QuizPage() {
  const search = useSearchParams()
  const router = useRouter()
  const pay = search?.get('pay')
  const orderNoQuery = search?.get('orderNo')

  useEffect(() => {
    // if redirected from Toss (pay=success), verify payment status before allowing the quiz
    if (pay === 'success') {
      const orderNo = orderNoQuery
      if (!orderNo) {
        router.push('/payment')
        return
      }

      ;(async () => {
        try {
          const res = await fetch('/api/toss/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNo }) })
          const json = await res.json()
          const rec = json?.record
          // allow only if record exists and status indicates payment complete
          if (!json?.found || !rec || !rec.status || !rec.status.includes('PAY_COMPLETE')) {
            router.push('/payment')
          }
        } catch (e) {
          router.push('/payment')
        }
      })()
    }
  }, [pay, orderNoQuery])
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  // load data-driven questions
  const allQuestions = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const qs = require('../../data/questions.json') as Array<{ text: string; axis?: string; reversed?: boolean }>
      return qs
    } catch (e) {
      return []
    }
  }, [])

  // 랜덤 순서로 문항 섞기 (원본 인덱스 유지) - 클라이언트에서만 실행
  const [shuffledQuestionsWithIndex, setShuffledQuestionsWithIndex] = useState<Array<{ question: any; originalIndex: number }>>([])
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    // 클라이언트에서만 랜덤화 실행
    setShuffledQuestionsWithIndex(
      allQuestions.map((q, idx) => ({ question: q, originalIndex: idx }))
        .sort(() => Math.random() - 0.5)
    )
    setIsMounted(true)
  }, [allQuestions])

  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [axisSums, setAxisSums] = useState<number[] | null>(null)
  const [mappingState, setMappingState] = useState<{ code: string; label: string; summary: string } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculatingProgress, setCalculatingProgress] = useState(0)

  const questions = allQuestions
  const shuffledQuestions = shuffledQuestionsWithIndex
  const totalPages = Math.max(1, Math.ceil(shuffledQuestions.length / pageSize))
  const pageQuestions = shuffledQuestions.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  useEffect(() => {
    // 페이지 변경 시 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleAnswer = (index: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.clearTimeout((showToast as any)._t)
    ;(showToast as any)._t = window.setTimeout(() => setToastMessage(null), 3000)
  }

  // 클라이언트 마운트 전에는 로딩 표시
  if (!isMounted) {
    return null
  }

  const hasUnansweredOnPage = (page: number) => {
    const start = page * pageSize
    const end = start + pageSize
    for (let i = start; i < end && i < shuffledQuestions.length; i++) {
      const originalIndex = shuffledQuestions[i].originalIndex
      if (answers[originalIndex] === null || answers[originalIndex] === undefined) return true
    }
    return false
  }

  const hasAnyUnanswered = () => {
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === null || answers[i] === undefined) return true
    }
    return false
  }

  // handleToggleReverse is intentionally not exposed to the UI; reversed is managed internally
  const handleToggleReverse = (index: number) => {
    const q = questions[index]
    if (!q) return
    q.reversed = !q.reversed
  }

  // 4 axes: A (0-24), B (25-49), C (50-74), D (75-99)
  const codeMap: Record<string, { code: string; label: string; summary: string }> = {
    RSPC: { code: 'RSPC', label: '알스피씨', summary: '차분한 준비형 엄마 — 혼자 정리하며 미리 대비' },
    RSPT: { code: 'RSPT', label: '알스피티', summary: '믿음형 준비 엄마 — 조용히 대비하고 아이를 신뢰' },
    ROPC: { code: 'ROPC', label: '알옵씨', summary: '참고형 준비 엄마 — 주변 조언을 모아 대비' },
    ROPT: { code: 'ROPT', label: '알옵티', summary: '균형형 준비 엄마 — 참고하되 과도하지 않음' },
    RLPC: { code: 'RLPC', label: '알엘피씨', summary: '관찰형 엄마 — 스스로 판단하며 지켜봄' },
    RLPT: { code: 'RLPT', label: '알엘피티', summary: '안정 신뢰형 엄마 — 크게 흔들리지 않음' },
    RLTC: { code: 'RLTC', label: '알엘티씨', summary: '비교 관찰형 엄마 — 주변을 보며 판단' },
    RLTT: { code: 'RLTT', label: '알엘티티', summary: '유연 관찰형 엄마 — 흘려보내는 힘이 있음' },
    ESPC: { code: 'ESPC', label: '엣스피씨', summary: '계획 실행형 엄마 — 말로 풀며 주도' },
    ESPT: { code: 'ESPT', label: '엣스피티', summary: '동기부여형 엄마 — 준비하지만 신뢰도 큼' },
    EOPC: { code: 'EOPC', label: '엣옵씨', summary: '정보 수집형 엄마 — 공유·비교로 대비' },
    EOPT: { code: 'EOPT', label: '엣옵티', summary: '균형 소통형 엄마 — 조언도 듣고 내려놓음' },
    ELPC: { code: 'ELPC', label: '엣엘피씨', summary: '감정 공감형 엄마 — 즉각 반응하는 편' },
    ELPT: { code: 'ELPT', label: '엣엘피티', summary: '따뜻한 신뢰형 엄마 — 공감 후 믿어줌' },
    ELTC: { code: 'ELTC', label: '엣엘티씨', summary: '공감 비교형 엄마 — 이야기 나누며 기준 형성' },
    ELTT: { code: 'ELTT', label: '엣엘티티', summary: '자유 공감형 엄마 — 걱정도 흘려보내는 편' },
  }

  const axisPairs = [
    ['R', 'E'],
    ['S', 'L'],
    ['P', 'O'],
    ['C', 'T'],
  ]

  const calculateScore = async () => {
    if (hasAnyUnanswered()) {
      showToast('모든 문항에 응답해 주세요.')
      return
    }

    // 로딩 시작
    setIsCalculating(true)
    setCalculatingProgress(0)

    // 프로그레스 바 애니메이션
    const duration = 3000 // 3초
    const interval = 50
    const steps = duration / interval
    let step = 0

    const progressInterval = setInterval(() => {
      step++
      setCalculatingProgress((step / steps) * 100)
      if (step >= steps) {
        clearInterval(progressInterval)
      }
    }, interval)

    // 3초 대기
    await new Promise(resolve => setTimeout(resolve, duration))

    // 축별 카운트와 점수 합계 (각 축별로 25문항씩)
    const axisCounts = [
      { positive: 0, negative: 0, sum: 0 }, // A축: R vs E
      { positive: 0, negative: 0, sum: 0 }, // B축: S vs L
      { positive: 0, negative: 0, sum: 0 }, // C축: P vs O
      { positive: 0, negative: 0, sum: 0 }, // D축: C vs T
    ]
    const axisIndex: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 }

    questions.forEach((q, idx) => {
      const val = answers[idx] ?? 0
      
      const isRev = !!q.reversed
      const v = isRev ? -val : val
      const a = (q.axis && axisIndex[q.axis.toLowerCase()]) ?? Math.floor(idx / 25)
      const axis = typeof a === 'number' ? a : Math.floor(idx / 25)
      
      // 점수 합계
      axisCounts[axis].sum += v
      
      // 개수 카운트 (보통이다는 제외)
      if (v > 0) {
        axisCounts[axis].positive++
      } else if (v < 0) {
        axisCounts[axis].negative++
      }
    })

    // 각 축에서 더 많은 쪽을 선택 (비율로 판단, 동점이면 점수 합계로 판단)
    const letters = axisCounts.map((counts, i) => {
      if (counts.positive > counts.negative) {
        return axisPairs[i][0] // R, S, P, C
      } else if (counts.negative > counts.positive) {
        return axisPairs[i][1] // E, L, O, T
      } else {
        // 동점일 때는 점수 합계로 판단
        return counts.sum >= 0 ? axisPairs[i][0] : axisPairs[i][1]
      }
    })
    
    const code = letters.join('')
    const mapping = codeMap[code] ?? { code, label: code, summary: '' }

    // 점수 합계 배열
    const sums = axisCounts.map(c => c.sum)

    // 결과 페이지로 이동
    const params = new URLSearchParams({
      score: '0', // 비율 방식이므로 총점은 의미 없음
      code: mapping.code,
      label: mapping.label,
      summary: mapping.summary,
      axis: JSON.stringify(sums),
      counts: JSON.stringify(axisCounts),
    })
    router.push(`/result?${params.toString()}`)
  }

  return (
    <main>
      {isCalculating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center'
          }}>
            결과 측정중입니다
          </div>
          <div style={{
            width: '400px',
            maxWidth: '80%',
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              height: '100%',
              background: '#3b82f6',
              width: `${calculatingProgress}%`,
              borderRadius: '20px',
              transition: 'width 0.05s linear',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
            }}></div>
          </div>
          <div style={{
            fontSize: '16px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {Math.round(calculatingProgress)}%
          </div>
        </div>
      )}
      <Header />

      <section className={styles.section}>
        {/* 프로그레스 바 */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <h2 className={styles.title}>엄마 유형 테스트</h2>
            <span className={styles.stepBadge}>
              {currentPage + 1} / {totalPages} 단계
            </span>
          </div>
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBarFill}
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            ></div>
          </div>
        </div>

        <p className={styles.description}>아래에 100문항 스켈레톤이 보입니다. 각 문항에 응답한 뒤 '점수 계산'을 눌러 결과를 확인하세요.</p>

        <QuestionList 
          questions={pageQuestions.map(q => q.question)} 
          answers={answers} 
          offset={currentPage * pageSize} 
          onAnswer={handleAnswer}
          originalIndices={pageQuestions.map(q => q.originalIndex)}
        />

        {toastMessage && (
          <div style={{ 
            position: 'fixed', 
            right: 20, 
            top: 24, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff', 
            padding: '16px 24px', 
            borderRadius: 16, 
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)', 
            zIndex: 1000,
            fontSize: '15px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideInDown 0.3s ease-out',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {toastMessage}
          </div>
        )}
        <style jsx>{`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div className={styles.navigationContainer}>
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(0, p - 1))
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={currentPage === 0}
            className={styles.navButton}
            onMouseEnter={(e) => {
              if (currentPage !== 0) {
                e.currentTarget.style.background = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 0) {
                e.currentTarget.style.background = '#3b82f6'
              }
            }}
          >
            ← 이전
          </button>
          <div className={styles.pageInfo}>
            페이지 {currentPage + 1} / {totalPages}
          </div>
          <button
            onClick={() => {
              if (hasUnansweredOnPage(currentPage)) {
                showToast('이 페이지에 응답하지 않은 문항이 있습니다. 먼저 모두 응답해 주세요.')
                // 미답변 문항으로 스크롤
                setTimeout(() => {
                  const start = currentPage * pageSize
                  const end = start + pageSize
                  for (let i = start; i < end && i < shuffledQuestions.length; i++) {
                    const originalIndex = shuffledQuestions[i].originalIndex
                    if (answers[originalIndex] === null || answers[originalIndex] === undefined) {
                      const displayIndex = start + (i - start)
                      const element = document.querySelector(`[data-question-idx="${displayIndex}"]`)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                      break
                    }
                  }
                }, 100)
                return
              }
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={currentPage >= totalPages - 1}
            className={styles.navButton}
            onMouseEnter={(e) => {
              if (currentPage < totalPages - 1) {
                e.currentTarget.style.background = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage < totalPages - 1) {
                e.currentTarget.style.background = '#3b82f6'
              }
            }}
          >
            다음 →
          </button>
        </div>

        {currentPage >= totalPages - 1 && (
          <FinalControls
            calculateScore={calculateScore}
            reset={() => { setAnswers({}); setScore(null); setAxisSums(null); setMappingState(null) }}
            score={score}
            mapping={mappingState}
            axisSums={axisSums}
          />
        )}
      </section>
    </main>
  )
}

function FinalControls({
  calculateScore,
  reset,
  score,
  mapping,
  axisSums,
}: {
  calculateScore: () => void
  reset: () => void
  score: number | null
  mapping: { code: string; label: string; summary: string } | null
  axisSums: number[] | null
}) {
  const controlsRef = useRef<HTMLDivElement | null>(null)

  return (
    <div ref={controlsRef} style={{ 
      marginTop: '40px',
      padding: '32px',
      background: '#f9fafb',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={calculateScore} 
          style={{ 
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '16px 40px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6'
          }}
        >
          점수 계산
        </button>
        <button 
          onClick={reset}
          style={{ 
            background: '#fff',
            color: '#6b7280',
            border: '2px solid #e5e7eb',
            padding: '16px 40px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          초기화
        </button>
      </div>
    </div>
  )
}
