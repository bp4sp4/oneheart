"use client"
import { useEffect, useRef, useState } from 'react'
import styles from './QuestionList.module.css'

type Q = { text: string; axis?: string; reversed?: boolean }

export default function QuestionList({
  questions,
  answers,
  offset = 0,
  onAnswer,
}: {
  questions: Q[]
  answers: Record<number, number | null>
  offset?: number
  onAnswer: (index: number, value: number) => void
}) {
  const options = [-2, -1, 0, 1, 2]
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

  return (
    <div className={styles.list}>
      {questions.map((q, i) => {
        const idx = offset + i
        const unanswered = answers[idx] === null || answers[idx] === undefined
        const answered = !unanswered
        const isActive = activeIdx === idx
        return (
          <div key={idx} ref={isActive ? undefined : undefined} className={`${styles.item} ${unanswered ? styles.unanswered : ''} ${answered ? styles.answered : ''} ${isActive ? styles.active : ''}`} data-rev={q.reversed ? 'rev' : ''}>
            <div className={styles.row}>
              <div className={styles.qtext}>{q.text}</div>
            </div>

            <div className={styles.options}>
              {options.map((opt) => (
                <label key={opt} className={styles.option}>
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={opt}
                    checked={answers[idx] === opt}
                    onChange={() => onAnswer(idx, opt)}
                  />
                  <span className={styles.optLabel}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
      
  )
}
