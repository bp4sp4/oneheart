import React from 'react'
import styles from './Results.module.css'

export default function Results({
  score,
  mapping,
  axisSums,
}: {
  score: number
  mapping: { code: string; label: string; summary: string }
  axisSums: number[]
}) {
  return (
    <div className={styles.results}>
      <h3>결과</h3>
      <p>
        <strong>점수:</strong> {score}
      </p>
      <p>
        <strong>유형:</strong> {mapping.code} — {mapping.label}
      </p>
      <p>{mapping.summary}</p>

      <div style={{ marginTop: 12 }}>
        <strong>축별 결과</strong>
        <ul>
          {axisSums.map((s, i) => {
            const pairs = [['R', 'E'], ['S', 'L'], ['P', 'O'], ['C', 'T']]
            const axisNames = ['A', 'B', 'C', 'D']
            const chosen = mapping.code[i]
            return (
              <li key={i}>
                <strong>{axisNames[i]}축:</strong> {pairs[i][0]} vs {pairs[i][1]} — 합계 {s} → 선택: {chosen}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
