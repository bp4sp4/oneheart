"use client"
import { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../components/Header'
import QuestionList from '../components/QuestionList'
import Results from '../components/Results'
import ShareControls from '../components/ShareControls'
import { motherTypes } from '../../data/motherTypes'
import styles from './quiz.module.css'
import ConfirmModal from '../components/ConfirmModal';
import { width } from 'pdfkit/js/page'

export default function QuizPage() {
  // ...existing code...
  // (모든 state 선언 이후에 위치해야 함)
  // ...state declarations...

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

  // 문제 순서 복구/생성 관련 상태
  const [shuffledQuestionsWithIndex, setShuffledQuestionsWithIndex] = useState<Array<{ question: any; originalIndex: number }>>([])
  const [isMounted, setIsMounted] = useState(false)
  const [questionOrder, setQuestionOrder] = useState<number[] | null>(null)
  const [testAccessToken, setTestAccessToken] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  // 진행상황 자동 저장 useEffect (answers, questionOrder, testAccessToken 선언 이후)
  useEffect(() => {
    if (!testAccessToken || !questionOrder || shuffledQuestionsWithIndex.length === 0) return;
    if (Object.keys(answers).length === 0) return;

    // answers를 항상 로컬 스토리지에 백업 (토큰이 바뀌어도 유지)
    localStorage.setItem('answers', JSON.stringify(answers));

    fetch('/api/test/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_access_token: testAccessToken,
        last_question_index: 0, // This can be enhanced to save the current page
        answers,
        question_order: questionOrder
      })
    });
  }, [answers, questionOrder, testAccessToken, shuffledQuestionsWithIndex]);

  const startNewQuiz = () => {
    // 새로운 토큰 생성
    const newToken = crypto.randomUUID();
    setTestAccessToken(newToken);
    localStorage.setItem('testAccessToken', newToken);

    // 새로운 문제 순서 생성
    const base = allQuestions.map((q, idx) => ({ question: q, originalIndex: idx }))
    const shuffled = base.sort(() => Math.random() - 0.5)
    const newOrder = shuffled.map(item => item.originalIndex)
    setQuestionOrder(newOrder);

    // URL에 새 토큰 반영 (페이지 리프레시나 새 탭에서 복구 가능하도록)
    router.replace(`/quiz?token=${newToken}`, undefined);
    setAnswers({});
    setCurrentPage(0);
    setQuestionListKey(prev => prev + 1); // QuestionList를 강제로 리셋
    showToast('새로운 테스트를 시작합니다.');
  }

  const initializeQuiz = (token: string | null, resume = false) => {
    if (resume && token) {
      // 복구 시도
      fetch(`/api/test/progress?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.question_order) {
            setQuestionOrder(data.question_order)
            if (data.answers) setAnswers(data.answers)
            showToast('이전 진행상황을 복구했습니다.')
          } else {
            // 복구 실패 시 새로 생성
            startNewQuiz();
          }
        })
        .catch(() => {
          showToast('진행상황 복구에 실패했습니다. 새로운 테스트를 시작합니다.')
          startNewQuiz();
        })
    } else {
      // 새 퀴즈 시작
      startNewQuiz();
    }
  };


  // 세션 관리, 문제 순서 복구/생성
  useEffect(() => {
    if (allQuestions.length === 0) return;

    const savedToken = localStorage.getItem('testAccessToken');
    const tokenFromUrl = new URLSearchParams(window.location.search).get('token');
    const justPaidFlag = localStorage.getItem('justPaid');

    // 1. 결제 직후 (최우선)
    if (justPaidFlag) {
      localStorage.removeItem('justPaid');
      setShowConfirmModal(false);
      // (기존 결제 로직 유지...)
      if (tokenFromUrl) {
        setTestAccessToken(tokenFromUrl);
        localStorage.setItem('testAccessToken', tokenFromUrl);
        fetch('/api/load-quiz-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenFromUrl })
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.question_order) {
            setQuestionOrder(data.question_order);
          } else {
            startNewQuiz();
          }
        })
        .catch(() => startNewQuiz());
      } else {
        startNewQuiz();
      }
    } 
    // 2. 저장된 토큰이 있는 경우
    else if (savedToken) {
      let hasAnyAnswer = false;
      try {
        // 로컬 스토리지의 answers를 확인 (setAnswers와 연동되는 키값 확인 필요)
        const savedAnswers = localStorage.getItem('answers'); 
        if (savedAnswers) {
          const parsed = JSON.parse(savedAnswers);
          if (Object.keys(parsed).length > 0) hasAnyAnswer = true;
        }
      } catch (e) {}

      if (hasAnyAnswer) {
        // 응답이 있으면 모달을 띄워 물어봄
        setSessionToken(savedToken);
        setShowConfirmModal(true);
      } else {
        // 저장된 토큰은 있지만 응답한 문항이 없으면 그냥 새로 시작 (여기서 문항이 로드됨)
        startNewQuiz();
      }
    } 
    // 3. URL 토큰만 있는 경우
    else if (tokenFromUrl) {
      setTestAccessToken(tokenFromUrl);
      localStorage.setItem('testAccessToken', tokenFromUrl);
      initializeQuiz(tokenFromUrl, true);
    } 
    // 4. 아무것도 없는 경우
    else {
      startNewQuiz();
    }
    
    setIsMounted(true);
  }, [allQuestions]);

  const handleConfirmResume = () => {
    setShowConfirmModal(false);
    if(sessionToken) {
      setTestAccessToken(sessionToken);
      router.replace(`/quiz?token=${sessionToken}`, undefined);
      initializeQuiz(sessionToken, true);
    }
  }

  const handleCancelResume = () => {
    setShowConfirmModal(false);
    localStorage.removeItem('testAccessToken');
    startNewQuiz();
  }

  // questionOrder가 정해지면 실제 문제 배열 생성
  useEffect(() => {
    if (!questionOrder || allQuestions.length === 0) return
    const arr = questionOrder.map(idx => ({ question: allQuestions[idx], originalIndex: idx }))
    setShuffledQuestionsWithIndex(arr)
  }, [questionOrder, allQuestions])

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
  // motherTypes 데이터 활용

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

    // 로딩 오버레이를 즉시 보여주기 위해 setTimeout 0으로 분리
    setIsCalculating(true)
    setCalculatingProgress(0)

    // 다음 tick에 바로 애니메이션 시작 (오버레이가 렌더된 후)
    setTimeout(() => {
      // 3.5초 고정 (모바일에서도 확실히 보이도록)
      const duration = 3500; // 3.5초
      const interval = 50;
      const steps = duration / interval;
      let step = 0;

      const progressInterval = setInterval(() => {
        step++;
        setCalculatingProgress((step / steps) * 100);
        if (step >= steps) {
          clearInterval(progressInterval);
        }
      }, interval);

      // duration 대기 후 점수 계산
      setTimeout(async () => {
        // ...existing score calculation logic below...
        const axisCounts = [
          { positive: 0, negative: 0, sum: 0 }, // A축: R vs E
          { positive: 0, negative: 0, sum: 0 }, // B축: S vs L
          { positive: 0, negative: 0, sum: 0 }, // C축: P vs O
          { positive: 0, negative: 0, sum: 0 }, // D축: C vs T
        ];
        const axisIndex: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

        questions.forEach((q, idx) => {
          const val = answers[idx] ?? 0;
          const isRev = !!q.reversed;
          const v = isRev ? -val : val;
          const a = (q.axis && axisIndex[q.axis.toLowerCase()]) ?? Math.floor(idx / 25);
          const axis = typeof a === 'number' ? a : Math.floor(idx / 25);
          axisCounts[axis].sum += v;
          if (v > 0) {
            axisCounts[axis].positive++;
          } else if (v < 0) {
            axisCounts[axis].negative++;
          }
        });

        const letters = axisCounts.map((counts, i) => {
          if (counts.positive > counts.negative) {
            return axisPairs[i][0];
          } else if (counts.negative > counts.positive) {
            return axisPairs[i][1];
          } else {
            return counts.sum >= 0 ? axisPairs[i][0] : axisPairs[i][1];
          }
        });
        const code = letters.join('');
        const mapping = motherTypes[code] ?? {
          code,
          label: code,
          summary: '유형 설명을 준비 중입니다',
          description: '',
          traits: [],
          strengths: [],
          challenges: [],
          tips: [],
          color: '#A65661',
        };
        const sums = axisCounts.map((c) => c.sum);
        localStorage.setItem('quizOrder', JSON.stringify(shuffledQuestionsWithIndex.map((item) => item.originalIndex)));
        const params = new URLSearchParams({
          score: '0',
          code: mapping.code,
          label: mapping.label,
          summary: mapping.summary,
          axis: JSON.stringify(sums),
          counts: JSON.stringify(axisCounts),
        });
        await router.push(`/result?${params.toString()}`);
        setIsCalculating(false); // 반드시 라우팅 후에 오버레이 해제
      }, duration);
    }, 0);

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
    const mapping = motherTypes[code] ?? { 
      code, 
      label: code, 
      summary: '유형 설명을 준비 중입니다',
      description: '',
      traits: [],
      strengths: [],
      challenges: [],
      tips: [],
      color: '#A65661'
    }

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
    return null;
  }

  // justPaidFlag로 인해 모달이 뜨면 안 되는 경우 강제 비활성화
  const justPaidFlag = typeof window !== 'undefined' ? localStorage.getItem('justPaid') : null;
  // showConfirmModal은 useEffect에서 answers가 1개 이상일 때만 true로 설정됨
  const shouldShowModal = showConfirmModal && !justPaidFlag;

  // 항상 퀴즈 리스트는 렌더링, 모달은 조건부로만 렌더링
  return (
    <main>
      {/* 이어하기 모달: 조건에 맞을 때만 */}
      <ConfirmModal
        isOpen={shouldShowModal}
        message="이전 테스트를 이어서 진행하시겠습니까?"
        onConfirm={handleConfirmResume}
        onCancel={handleCancelResume}
      />

      {/* 결과 계산 중 오버레이 */}
      {isCalculating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(0deg, #020301 0%, #020301 100%), radial-gradient(50.27% 50% at 50% 50%, #FFF 0%, #FFE8E8 100%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            width: '100%',
            height: '100%'
          }}>
            <div style={{
              color: '#FCFCFC',
              textAlign: 'center',
              fontFamily: 'Pretendard',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              marginBottom: '24px'
            }}>
              결과를 분석중입니다
            </div>
            <img src="/images/loading.gif" alt="로딩중" style={{ width: '236px', height: '236px', marginBottom: '32px' }} />
            <div style={{ width: '100%', maxWidth: 360, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${calculatingProgress}%` }}
                />
              </div>
              <span className={styles.progressBarPercent} style={{ position: 'static', marginLeft: 12 }}>{Math.round(calculatingProgress)}%</span>
            </div>
          </div>
        </div>
      )}
      {/* <Header /> */}

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
                  const percent = ((currentPage + 1) / totalPages) * 100;
                  const minPercent = 100 / Math.max(1, totalPages);
                  const fillPercent = Math.max(percent, minPercent);
                  return (
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${fillPercent}%` }}
                    />
                  );
                })()}
              </div>

              {/* continuous progress bar (same on mobile and desktop) */}
              <span className={styles.stepBadge}>
                {currentPage + 1} / {totalPages} 페이지
              </span>
            </div>
          </div>
        </div>

        {/* 퀴즈 리스트는 항상 렌더링 */}
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
            background: '#fff',
            color: '#1f2937',
            padding: '16px 24px', 
            borderRadius: 12, 
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', 
            zIndex: 1000,
            fontSize: '15px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideInDown 0.3s ease-out',
            border: '1px solid #e5e7eb',
            maxWidth: '300px'
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
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
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
      padding: '32px',
      borderRadius: '16px',
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '360px', margin: '0 auto' }}>
        <button 
          onClick={calculateScore} 
          style={{ 
            background: '#A65661',
            color: '#fff',
            border: 'none',
            padding: '16px 40px',
            borderRadius: '4px',
             width: '100%',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
  
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
     
      </div>
    </div>
  )
}
