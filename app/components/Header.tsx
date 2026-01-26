import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>엄마 유형 테스트</h1>
        <p className={styles.subtitle}>나중에 질문을 넣고 점수로 유형을 확인할 수 있습니다.</p>
      </div>
    </header>
  )
}
