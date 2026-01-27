"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Results from '../components/Results'
import ShareControls from '../components/ShareControls'
import styles from './result.module.css'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<{
    score: number
    mapping: { code: string; label: string; summary: string }
    axisSums: number[]
  } | null>(null)

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
        
        setResult({
          score: totalScore,
          mapping: {
            code: codeParam,
            label: labelParam,
            summary: summaryParam || '',
          },
          axisSums: parsedAxisSums,
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
            const ratio = total > 0 ? Math.round((Math.max(count.positive, count.negative) / total) * 100) : 0
            const scoreSum = count.sum || 0
            console.log(`  ${String.fromCharCode(65 + i)}축: ${count.positive}개 vs ${count.negative}개 | 점수합계: ${scoreSum > 0 ? '+' : ''}${scoreSum} → ${chosen} (${reason})`)
          })
        } else {
          parsedAxisSums.forEach((sum: number, i: number) => {
            const chosen = sum > 0 ? axisPairs[i][0] : axisPairs[i][1]
            console.log(`  ${String.fromCharCode(65 + i)}축: ${sum > 0 ? '+' : ''}${sum} → ${chosen}`)
          })
        }
        console.groupEnd()
      } else {
        // 결과가 없으면 quiz 페이지로
        console.warn('Missing parameters, redirecting to quiz')
        setTimeout(() => router.push('/quiz'), 100)
      }
    } catch (error) {
      console.error('Error loading result:', error)
      setTimeout(() => router.push('/quiz'), 100)
    }
  }, [searchParams, router])

  if (!result) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>결과를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← 이전 페이지
        </button>
      </div>

      <div className={styles.resultCard}>
        <h1 className={styles.title}>엄마 유형 테스트 결과</h1>
        
        <Results 
          score={result.score} 
          mapping={result.mapping} 
          axisSums={result.axisSums} 
        />

        <div className={styles.actions}>
          <ShareControls 
            score={result.score} 
            mapping={result.mapping} 
          />
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.retakeButton}
            onClick={() => router.push('/quiz')}
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </main>
  )
}
