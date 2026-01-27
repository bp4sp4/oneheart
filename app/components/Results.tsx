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
        <strong>유형:</strong> {mapping.code} — {mapping.label}
      </p>
      <p>{mapping.summary}</p>
    </div>
  )
}
