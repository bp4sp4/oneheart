"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

import RadarChart, { RadarChartRef } from '../components/RadarChart'

// 동적 import로 ResultDisplay 컴포넌트 로드
const ResultDisplay = dynamic(() => import('../components/ResultDisplay'), {
  loading: () => <p>컴포넌트를 로드하는 중...</p>
})

import { motherTypes } from '../../data/motherTypes'
import styles from './result.module.css'

// supabase import 제거, MotherResponse 타입은 아래에서 직접 정의

type MotherResponse = {
  total: number
  typeCode: string
  typeName: string
  summary: string
  scores: Record<string, number>
  quizOrder?: number[]
}

export default function ResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const chartRef = useRef<RadarChartRef>(null)
  const [result, setResult] = useState<{
    score: number
    mapping: { code: string; label: string; summary: string }
    axisSums: number[]
    counts?: { positive: number; negative: number; sum: number }[]
  } | null>(null)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handlePayment = async () => {
    // 결과를 localStorage에 저장
    const storedOrder = localStorage.getItem('quizOrder')
    const quizOrder = storedOrder ? JSON.parse(storedOrder) : null
    localStorage.setItem('quizResult', JSON.stringify({ ...result, quizOrder }));
    // 결제 위젯 페이지로 이동
    router.push('/pay/checkout');
  }

  useEffect(() => {
    try {
      const scoreParam = searchParams?.get('score')
      const codeParam = searchParams?.get('code')
      const labelParam = searchParams?.get('label')
      const summaryParam = searchParams?.get('summary')
      const axisParam = searchParams?.get('axis')
      const countsParam = searchParams?.get('counts')

      console.log('Result page params:', { scoreParam, codeParam, labelParam, summaryParam, axisParam, countsParam })

      if (scoreParam && codeParam && labelParam && axisParam) {
        const parsedAxisSums = JSON.parse(decodeURIComponent(axisParam))
        const parsedCounts = countsParam ? JSON.parse(decodeURIComponent(countsParam)) : null
        const totalScore = parseInt(scoreParam)
        
        // 토스 검수용: 모든 결과를 EOPC로 강제 설정
        setResult({
          score: totalScore,
          mapping: motherTypes['EOPC'],
          axisSums: parsedAxisSums,
          counts: parsedCounts,
        })

        // 콘솔에 상세 점수 출력
        console.group('📊 테스트 결과 상세 (비율 방식)')
        console.log('유형 코드:', codeParam)
        console.log('유형 이름:', labelParam)
        console.log('---')
        console.log('축별 결과 (개수 비율로 판단 + 점수 합계):')
        const axisPairs = [
          ['R (Reserved)', 'E (Expressive)'],
          ['S (Structured)', 'L (Laid-back)'],
          ['P (Proactive)', 'O (Observant)'],
          ['C (Concerned)', 'T (Trusting)']
        ]
        
        if (parsedCounts) {
          parsedCounts.forEach((count: any, i: number) => {
            let chosen: string
            let reason: string
            
            if (count.positive > count.negative) {
              chosen = axisPairs[i][0]
              reason = '개수 더 많음'
            } else if (count.negative > count.positive) {
              chosen = axisPairs[i][1]
              reason = '개수 더 많음'
            } else {
              // 동점일 때
              const scoreSum = count.sum || 0
              chosen = scoreSum >= 0 ? axisPairs[i][0] : axisPairs[i][1]
              reason = `동점 → 점수합계(${scoreSum > 0 ? '+' : ''}${scoreSum})로 판단`
            }
            
            const total = count.positive + count.negative
            const neutral = 25 - total
            const ratio = total > 0 ? Math.round((Math.max(count.positive, count.negative) / total) * 100) : 0
            const scoreSum = count.sum || 0
            console.log(`  ${String.fromCharCode(65 + i)}축: ${count.positive}개 vs ${count.negative}개 (보통: ${neutral}개, 총 25개) | 점수합계: ${scoreSum > 0 ? '+' : ''}${scoreSum} → ${chosen} (${reason})`)
          })
        } else {
          parsedAxisSums.forEach((sum: number, i: number) => {
            const chosen = sum > 0 ? axisPairs[i][0] : axisPairs[i][1]
            console.log(`  ${String.fromCharCode(65 + i)}축: ${sum > 0 ? '+' : ''}${sum} → ${chosen}`)
          })
        }
        console.groupEnd()
      } else {
        // 결과가 없으면 코드 입력 폼 표시
      }
    } catch (error) {
      console.error('Error loading result:', error)
    }
  }, [searchParams, router])

  const handleRecovery = async () => {
    if (!recoveryCode.trim()) {
      setError('복원 코드를 입력하세요.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryCode })
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.mother) {
        setError(data.message || '유효하지 않은 복원 코드입니다.')
        return
      }
      const mother: MotherResponse = data.mother
      // 결과 설정
      const axisSums: number[] = []
      const axisPairs = [
        ['R', 'E'],
        ['S', 'L'],
        ['P', 'O'],
        ['C', 'T']
      ]
      axisPairs.forEach(([pos, neg]) => {
        axisSums.push(mother.scores[pos] || -(mother.scores[neg] || 0))
      })
      // 퀴즈 순서 복원
      if (mother.quizOrder) {
        localStorage.setItem('quizOrder', JSON.stringify(mother.quizOrder))
      }
      setResult({
        score: mother.total,
        mapping: {
          code: mother.typeCode,
          label: mother.typeName,
          summary: mother.summary,
        },
        axisSums,
      })
    } catch (err) {
      setError('조회 중 오류 발생.')
    } finally {
      setLoading(false)
    }
  }

  if (!result) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>결과를 불러오는 중...</p>
        <div style={{ marginTop: 20 }}>
          <h3>결과 복원</h3>
          <p>결제 시 받은 복원 코드를 입력하세요.</p>
          <input
            type="text"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="복원 코드 입력"
            style={{ padding: 10, marginRight: 10 }}
          />
          <button onClick={handleRecovery} disabled={loading} style={{ padding: 10 }}>
            {loading ? '조회 중...' : '조회'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      {/* 토스 검수용: EOPC 유형만 표시 */}
      <ResultDisplay 
        motherType={motherTypes['EOPC']}
        axisSums={result.axisSums}
        counts={result.counts}
      />
    </main>
  )
}
