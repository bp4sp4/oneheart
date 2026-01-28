"use client";

import Link from 'next/link'
import Header from '../components/Header'
import styles from './page.module.css'

export default function AboutPage() {
  return (
    <>
      <Header />
      <section className={styles.banner}>
        <h1 className={styles.bannerTitle}>엄마 유형 테스트</h1>
        <p className={styles.bannerSubtitle}>아이를 키우면서 생기는 걱정과 불안을 정리해보세요</p>
      </section>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* 추가 콘텐츠는 여기에 배치하세요. */}

          <section className={styles.aboutBlock}>
            <div className={styles.aboutHeader}>
              <h2 className={styles.aboutTitle}>엄마유형 테스트란?</h2>
              <p className={styles.aboutSubtitle}>Mom Type Test</p>
            </div>

            <div className={styles.aboutContent}>
              <div className={styles.textWrapper}>
                <p className={styles.bodyText}>
                  한마음 엄마 유형 테스트는 옳고 그름을 따지지 않고,
                  <br />지금 내가 어떤 마음으로 아이를 바라보는지 100가지 질문을 통해
                  스스로 알아볼 수 있는 과정입니다.
                </p>
              </div>

              <div className={styles.aboutCardImage} />
            </div>
          </section>

        </div>
      </main>
      <section className={styles.principlesSection}>
        <div className={styles.principlesHeader}>
          <h2 className={styles.principlesTitle}>테스트 원칙</h2>
          <p className={styles.principlesSubtitle}>Testing Principles</p>
        </div>

        <div className={styles.principlesList}>
          <div className={styles.principleItem}>
            <div className={styles.principleTitle}>1. 비진단 원칙</div>
            <div className={styles.principleDesc}>어떤 결과도 ‘정상/비정상’으로 구분하지 않습니다.</div>
          </div>
          <div className={styles.principleItem}>
            <div className={styles.principleTitle}>2. 비판 없는 관찰</div>
            <div className={styles.principleDesc}>결과는 평가가 아니라, 마음을 이해하기 위한 설명으로만 제공됩니다.</div>
          </div>
          <div className={styles.principleItem}>
            <div className={styles.principleTitle}>3. 데이터 최소 수집</div>
            <div className={styles.principleDesc}>서비스 운영에 필요한 최소한의 정보만 수집·암호화합니다.</div>
          </div>
        </div>
      </section>
      <section className={styles.resultSampleSection}>
        <div className={styles.resultSampleHeader}>
          <h2 className={styles.resultSampleTitle}>결과표 샘플</h2>
          <p className={styles.resultSampleSubtitle}>Result Sample</p>
        </div>

        <div className={styles.resultSampleContent}>
          <img src="/images/about/about_dataimg.png" alt="결과표 샘플" className={styles.resultImage} />
        </div>
      </section>
      <section className={styles.priceSection}>
        <div className={styles.priceInner}>
          <div className={styles.priceHeader}>
            <h2 className={styles.priceTitle}>가격 안내</h2>
            <p className={styles.priceSubtitle}>Price</p>
          </div>

          <div className={styles.priceBody}>
            <div className={styles.priceAmount}>9,900원 (1회 결제)</div>

            <ul className={styles.priceList}>
              <li>결과는 테스트 종료 직후 이메일로 바로 전송</li>
              <li>반복되는 고민 상황에서 즉시 참고 가능한 가이드</li>
              <li>한 번 결제로 평생 활용 가능한 리포트</li>
            </ul>
          </div>
        </div>
      </section>

      <div className={styles.disclaimer}>
        <p>
          * 본 콘텐츠는 의료·심리·교육·상담 전문 서비스가 아니며,
          <br />결과는 참고용으로만 활용해 주세요.
        </p>
      </div>
            <section className={styles.ctaStartSection}>
        <div className={styles.ctaInner}>
          <Link href="/payment">
            <button className={styles.ctaButtonStart}>유형 테스트 시작하기</button>
          </Link>
        </div>
      </section>
    </>
  )
}
