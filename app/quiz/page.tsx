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
    if (allQuestions.length === 0) {
      setIsMounted(true)
      return
    }

    // 클라이언트에서만 랜덤화 실행 (임시 세션 전용)
    const base = allQuestions.map((q, idx) => ({ question: q, originalIndex: idx }))
    const shuffled = base.sort(() => Math.random() - 0.5)
    console.log('Created new shuffle for session', shuffled)
    setShuffledQuestionsWithIndex(shuffled)
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
  const [questionListKey, setQuestionListKey] = useState(0)

  useEffect(() => {
    console.log('Answers changed (effect):', answers)
  }, [answers])

  const questions = allQuestions
  const shuffledQuestions = shuffledQuestionsWithIndex
  const totalPages = Math.max(1, Math.ceil(shuffledQuestions.length / pageSize))
  const pageQuestions = shuffledQuestions.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  useEffect(() => {
    // 페이지 변경 시 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleAnswer = (index: number, value: number) => {
    console.log('handleAnswer called:', index, value)
    setAnswers((prev) => {
      const newAnswers = { ...prev, [index]: value }
      console.log('New answers:', newAnswers)
      return newAnswers
    })
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

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.clearTimeout((showToast as any)._t)
    ;(showToast as any)._t = window.setTimeout(() => setToastMessage(null), 3000)
  }

  // 4 axes: A (0-24), B (25-49), C (50-74), D (75-99)
  // 축 순서: [R/E, S/O, P/L, C/T]
  const codeMap: Record<string, { code: string; label: string; summary: string }> = {
    RSPC: { code: 'RSPC', label: '알스피씨', summary: '차분한 준비형 엄마 — 혼자 생각하며 철저히 대비하고 직접 챙김' },
    RSPT: { code: 'RSPT', label: '알쓰피티', summary: '믿음형 준비 엄마 — 신중하게 계획을 세우고 아이를 믿고 맡김' },
    RSLC: { code: 'RSLC', label: '알쓸엘씨', summary: '참고형 자립 엄마 — 고민은 혼자 삭히되 필요한 건 직접 해결함' },
    RSLT: { code: 'RSLT', label: '알쓸엘티', summary: '유연한 휴식형 엄마 — 내면의 평화를 유지하며 순리에 맡기는 편' },
    ROPC: { code: 'ROPC', label: '알옵피씨', summary: '관찰형 준비 엄마 — 주변을 살피며 꼼꼼하게 대비하고 직접 관리함' },
    ROPT: { code: 'ROPT', label: '알옵티', summary: '안정 신뢰형 엄마 — 타인의 시선을 고려해 준비하되 믿음으로 기다림' },
    ROLC: { code: 'ROLC', label: '알옴엘씨', summary: '트렌드 민감형 엄마 — 주변 반응에 민감하며 상황에 맞춰 직접 챙김' },
    ROLT: { code: 'ROLT', label: '알옴엘티', summary: '유연 관찰형 엄마 — 사람들과 어우러지며 상황이 흐르는 대로 맡김' },
    ESPC: { code: 'ESPC', label: '이쓰피씨', summary: '계획 실행형 엄마 — 활발하게 소통하며 계획한 대로 직접 이끌어감' },
    ESPT: { code: 'ESPT', label: '이쓰피티', summary: '동기부여형 엄마 — 에너지를 나누며 준비하고 아이의 자율을 믿음' },
    ESLC: { code: 'ESLC', label: '이쓸엘씨', summary: '정보 수집형 엄마 — 표현이 확실하며 주관대로 직접 부딪히며 해결' },
    ESLT: { code: 'ESLT', label: '이쓸엘티', summary: '균형 소통형 엄마 — 밝게 소통하며 스트레스 없이 상황에 맡김' },
    EOPC: { code: 'EOPC', label: '이옵피씨', summary: '감정 공감형 엄마 — 함께 나누며 물건을 챙기고 세심하게 직접 관리' },
    EOPT: { code: 'EOPT', label: '이옵티', summary: '따뜻한 신뢰형 엄마 — 나정하게 대화하며 준비하고 믿음으로 지켜봄' },
    EOLC: { code: 'EOLC', label: '이옴엘씨', summary: '소통 정보형 엄마 — 주변과 소통하며 유연하게 대처하고 직접 발로 뛸' },
    EOLT: { code: 'EOLT', label: '이옴엘티', summary: '자유 공감형 엄마 — 사람들과 어울리는 것을 즐기며 편안하게 맡김' },
  }

  const axisPairs = [
    ['R', 'E'],
    ['S', 'O'],
    ['P', 'L'],
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
    const mapping = codeMap[code] ?? { code, label: code, summary: '유형 설명을 준비 중입니다' }

    // 점수 합계 배열
    const sums = axisCounts.map(c => c.sum)

    // 퀴즈 순서 저장
    localStorage.setItem('quizOrder', JSON.stringify(shuffledQuestionsWithIndex.map(item => item.originalIndex)))

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

  // 클라이언트 마운트 전에는 로딩 표시
  if (!isMounted) {
    return null
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
          <div className={styles.headerCenter}>
            <h2 className={styles.title}>엄마 유형 테스트</h2>
            <p className={styles.subtitle}>빠르게 체크하고 지금의 성향을 확인해 보세요.</p>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressRow}>
              <div className={styles.progressBarContainer}>
                  {(() => {
                    const percent = ((currentPage + 1) / totalPages) * 100
                    const minPercent = 100 / Math.max(1, totalPages)
                    const fillPercent = Math.max(percent, minPercent)
                    return (
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${fillPercent}%` }}
                      />
                    )
                  })()}
                </div>

              {/* continuous progress bar (same on mobile and desktop) */}
              <span className={styles.stepBadge}>
                {currentPage + 1} / {totalPages} 페이지
              </span>
            </div>
          </div>
        </div>

        

        <QuestionList 
          key={questionListKey}
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
                e.currentTarget.style.background = '#943e4a'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 0) {
                e.currentTarget.style.background = '#A65661'
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
                e.currentTarget.style.background = '#943e4a'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage < totalPages - 1) {
                e.currentTarget.style.background = '#A65661'
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
            background: '#A65661',
            color: '#fff',
            border: 'none',
            padding: '16px 40px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(166, 86, 97, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#943e4a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#A65661'
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
