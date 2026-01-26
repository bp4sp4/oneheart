import React from 'react'
import styles from './QuestionPlaceholder.module.css'

export default function QuestionPlaceholder() {
  return (
    <div className={styles.box}>
      <p>질문 리스트는 아직 비어있습니다. 나중에 질문을 추가하세요.</p>
      <ul>
        <li>• 질문 추가 예정</li>
        <li>• 점수 합산으로 유형 판정</li>
        <li>• 이메일 전송, 다운로드 기능 준비</li>
      </ul>
    </div>
  )
}
