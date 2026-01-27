"use client"
import { useEffect, useRef, useState } from 'react'
import styles from './QuestionList.module.css'

type Q = { text: string; axis?: string; reversed?: boolean }

export default function QuestionList({
  questions,
  answers,
  offset = 0,
  onAnswer,
  originalIndices,
}: {
  questions: Q[]
  answers: Record<number, number | null>
  offset?: number
  onAnswer: (index: number, value: number) => void
  originalIndices?: number[]
}) {
  const options = [-2, -1, 0, 1, 2]
  const labels = ['매우 그렇지 않다', '그렇지 않다', '보통이다', '그렇다', '매우 그렇다']
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  useEffect(() => {
    // focus the first unanswered question's first radio; if none, focus first question
    let target: number | null = null
    for (let i = 0; i < questions.length; i++) {
      const global = offset + i
      if (answers[global] === null || answers[global] === undefined) {
        target = global
        break
      }
    }
    if (target === null && questions.length > 0) target = offset

    setActiveIdx(target)

    // focus the first radio input for that question
    if (target !== null && containerRef.current) {
      const input = containerRef.current.querySelector<HTMLInputElement>(`input[name="q-${target}"]`)
      if (input) {
        input.focus()
      }
    }
  }, [questions, offset])

  const questionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const handleAnswer = (originalIdx: number, displayIdx: number, value: number) => {
    onAnswer(originalIdx, value)
    
    // 다음 질문으로 스크롤 (화면상 다음 인덱스)
    setTimeout(() => {
      const nextDisplayIdx = displayIdx + 1
      const nextRef = questionRefs.current[nextDisplayIdx]
      if (nextRef) {
        nextRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)
  }

  return (
    <div className={styles.list}>
      {questions.map((q, i) => {
        const idx = offset + i
        const originalIdx = originalIndices ? originalIndices[i] : idx
        const unanswered = !(originalIdx in answers) || answers[originalIdx] === null || answers[originalIdx] === undefined
        const answered = !unanswered
        const isActive = activeIdx === idx
        return (
          <div 
            key={idx} 
            ref={(el) => { questionRefs.current[idx] = el }}
            data-question-idx={idx}
            className={`${styles.item} ${unanswered ? styles.unanswered : ''} ${answered ? styles.answered : ''} ${isActive ? styles.active : ''}`} 
            data-rev={q.reversed ? 'rev' : ''}
          >
            <div className={styles.qtext}>{q.text}</div>

            <div className={styles.scaleContainer}>
              <div className={styles.scaleLabels}>
                <span className={styles.labelLeft}>{labels[0]}</span>
                <span className={styles.labelRight}>{labels[labels.length - 1]}</span>
              </div>
              <div className={styles.options}>
                {options.map((opt, optIdx) => {
                  const isChecked = (originalIdx in answers) && answers[originalIdx] === opt
                  return (
                    <label key={opt} className={`${styles.option} ${isChecked ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={opt}
                        checked={isChecked}
                        onChange={() => handleAnswer(originalIdx, idx, opt)}
                      />
                      <span className={styles.circle}></span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
      
  )
}
