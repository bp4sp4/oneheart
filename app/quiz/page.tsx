"use client"
import { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../components/Header'
import QuestionList from '../components/QuestionList'
import Results from '../components/Results'
import ShareControls from '../components/ShareControls'

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

  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [axisSums, setAxisSums] = useState<number[] | null>(null)
  const [mappingState, setMappingState] = useState<{ code: string; label: string; summary: string } | null>(null)

  const questions = allQuestions
  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize))
  const pageQuestions = questions.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  const handleAnswer = (index: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.clearTimeout((showToast as any)._t)
    ;(showToast as any)._t = window.setTimeout(() => setToastMessage(null), 3000)
  }

  const hasUnansweredOnPage = (page: number) => {
    const start = page * pageSize
    const end = start + pageSize
    for (let i = start; i < end && i < questions.length; i++) {
      if (answers[i] === null || answers[i] === undefined) return true
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

  const calculateScore = () => {
    if (hasAnyUnanswered()) {
      showToast('모든 문항에 응답해 주세요.')
      return
    }

    const sums = [0, 0, 0, 0]
    const axisIndex: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 }

    const total = questions.reduce((acc, q, idx) => {
      const val = answers[idx] ?? 0
      const isRev = !!q.reversed
      const v = isRev ? -val : val
      const a = (q.axis && axisIndex[q.axis.toLowerCase()]) ?? Math.floor(idx / 25)
      const axis = typeof a === 'number' ? a : Math.floor(idx / 25)
      sums[axis] += v
      return acc + v
    }, 0)

    const letters = sums.map((s, i) => (s > 0 ? axisPairs[i][0] : axisPairs[i][1]))
    const code = letters.join('')
    const mapping = codeMap[code] ?? { code, label: code, summary: '' }

    setAxisSums(sums)
    setScore(total)
    setMappingState(mapping)
  }

  return (
    <main>
      <Header />

      <section style={{ padding: '24px' }}>
        <h2>엄마 유형 테스트</h2>
        <p>아래에 100문항 스켈레톤이 보입니다. 각 문항에 응답한 뒤 '점수 계산'을 눌러 결과를 확인하세요.</p>

        <QuestionList questions={pageQuestions} answers={answers} offset={currentPage * pageSize} onAnswer={handleAnswer} />

        {toastMessage && (
          <div style={{ position: 'fixed', right: 20, bottom: 24, background: '#111827', color: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.18)' }}>
            {toastMessage}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <div>페이지 {currentPage + 1} / {totalPages}</div>
          <button
            onClick={() => {
              if (hasUnansweredOnPage(currentPage)) {
                showToast('이 페이지에 응답하지 않은 문항이 있습니다. 먼저 모두 응답해 주세요.')
                return
              }
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }}
            disabled={currentPage >= totalPages - 1}
          >
            다음
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

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [score, mapping])

  return (
    <div ref={controlsRef} style={{ marginTop: 18 }}>
      <div>
        <button onClick={calculateScore} style={{ marginRight: 8 }}>점수 계산</button>
        <button onClick={reset}>초기화</button>
      </div>

      {score !== null && mapping && axisSums && (
        <Results score={score} mapping={mapping} axisSums={axisSums} />
      )}

      <div style={{ marginTop: 12 }}>
        <ShareControls score={score} mapping={mapping} />
      </div>
    </div>
  )
}
