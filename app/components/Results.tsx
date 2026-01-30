import React, { useState, useRef } from 'react'
import styles from './Results.module.css'

export default function Results({
  mapping,
  axisSums,
}: {
  mapping: { code: string; label: string; summary: string }
  axisSums: number[]
}) {
  const [showShare, setShowShare] = useState(false);
  const [shareTimeout, setShareTimeout] = useState<NodeJS.Timeout | null>(null);
  const [shareStart, setShareStart] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const minDuration = 7000;
    const now = Date.now();
    setShareStart(now);
    setShowShare(true);
    if (shareTimeout) clearTimeout(shareTimeout);
    const hideOverlay = () => {
      setShowShare(false);
      setShareStart(null);
    };
    if (navigator.share) {
      try {
        await navigator.share({
          title: `엄마유형: ${mapping.label}`,
          text: `${mapping.summary}`,
          url: window.location.href,
        });
        // 공유 성공/취소 모두 최소 7초 보장
        setShareTimeout(setTimeout(hideOverlay, minDuration));
      } catch (e) {
        setShareTimeout(setTimeout(hideOverlay, minDuration));
      }
    } else {
      // fallback: 링크 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareTimeout(setTimeout(hideOverlay, minDuration));
      } catch (e) {
        alert('공유를 지원하지 않는 브라우저입니다. 링크가 복사되었습니다.');
        setShareTimeout(setTimeout(hideOverlay, minDuration));
      }
    }
  };

  return (
    <div className={styles.results}>
      <div className={styles.badge}>결과 리포트</div>
      <div className={styles.headline}>당신의 엄마 에너지</div>
      <div className={styles.typeRow}>
        <div className={styles.typeLabel}>{mapping.label}</div>
        <div className={styles.typeCode}>{mapping.code}</div>
      </div>
      <div className={styles.summary}>{mapping.summary}</div>

      <div className={styles.callout}>
        <div className={styles.calloutTitle}>한 줄 메시지</div>
        <div className={styles.calloutText}>"완벽보다 ‘지속 가능한 리듬’이 오래 갑니다."</div>
      </div>

      <button className={styles.shareBtn} onClick={handleShare}>
        유형카드 공유하기
      </button>

      {showShare && (
        <div className={styles.shareOverlay} ref={overlayRef}>
          <div className={styles.shareOverlayCard}>
            <div className={styles.shareOverlayText}>공유 준비 완료!<br />7초간 이 창이 보입니다.</div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>당신의 강점</div>
          <div className={styles.cardBody}>상황을 빠르게 파악하고, 아이에게 필요한 기준을 안정적으로 제공합니다.</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>주의 포인트</div>
          <div className={styles.cardBody}>모든 걸 다 책임지려는 순간, 에너지가 급격히 소모될 수 있어요.</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>추천 루틴</div>
          <div className={styles.cardBody}>오늘 단 하나만 정하고, 나머지는 “충분”으로 남겨두기.</div>
        </div>
      </div>
    </div>
  )
}
