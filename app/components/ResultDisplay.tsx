'use client'

import React from 'react';
import { MotherType } from '../../data/motherTypes';
import RadarChart from './RadarChart';
import styles from './ResultDisplay.module.css';
import { highlightPhraseInText } from './highlightPhraseInText';

interface ResultDisplayProps {
  motherType: MotherType
  axisSums: number[]
  counts?: { positive: number; negative: number; sum: number }[]
}

export default function ResultDisplay({ motherType, axisSums, counts }: ResultDisplayProps) {
  return (
    <div className={styles.container}>
      {/* 통합 섹션 - 1-5페이지 */}
      <div className={styles.page}>
        {/* 1페이지 - 유형카드 */}
        <div className={styles.badge}>
          <span className={styles.badgeText}>
            내 엄마유형 카드
          </span>
        </div>
        
        <div className={styles.imageArea}>
          {motherType.cardImage ? (
            <img 
              src={motherType.cardImage} 
              alt={`${motherType.code} 유형 이미지`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              이미지 영역
            </div>
          )}
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.button}>
            유형카드 저장
          </button>
          <button className={styles.button}>
            유형카드 공유
          </button>
        </div>

        {/* 2페이지 - 선호 지표 결과 */}
        <div className={styles.badge}>내 선호 지표 결과</div>
        <div className={styles.chartContainer}>
          <RadarChart 
            counts={counts || []}
          />
        </div>
        <div className={styles.axisSection}>
          {/* 걱정처리 방식 */}
          <div className={styles.axisCard}>
            <h3 className={styles.axisCardTitle}>걱정처리 방식: <span className={styles.axisCardResult}>{axisSums[0] > 0 ? 'R' : 'E'}</span></h3>
            <div className={styles.axisOptions}>
              <div className={styles.axisOption}>
                <h4 className={axisSums[0] > 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>R (Reflect)</h4>
                <p className={axisSums[0] > 0 ? styles.axisOptionActive : styles.axisOptionLabel}>마음 속으로 정리하며 혼자 소화하는 편</p>
              </div>
              <div className={styles.axisOption}>
                <h4 className={axisSums[0] <= 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>E (Express)</h4>
                <p className={axisSums[0] <= 0 ? styles.axisOptionActive : styles.axisOptionLabel}>말·글·공유로 풀어야 안정되는 편</p>
              </div>
            </div>
          </div>

          {/* 판단 기준의 중심 */}
          <div className={styles.axisCard}>
            <h3 className={styles.axisCardTitle}>판단 기준의 중심: <span className={styles.axisCardResult}>{axisSums[1] > 0 ? 'S' : 'O'}</span></h3>
            <div className={styles.axisOptions}>
              <div className={styles.axisOption}>
                <h4 className={axisSums[1] > 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>S (Self)</h4>
                <p className={axisSums[1] > 0 ? styles.axisOptionActive : styles.axisOptionLabel}>내 기준-직감이 중요</p>
              </div>
              <div className={styles.axisOption}>
                <h4 className={axisSums[1] <= 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>O (Others)</h4>
                <p className={axisSums[1] <= 0 ? styles.axisOptionActive : styles.axisOptionLabel}>주변 의견-비교를 참고</p>
              </div>
            </div>
          </div>

          {/* 불안 대응 방향 */}
          <div className={styles.axisCard}>
            <h3 className={styles.axisCardTitle}>불안 대응 방향: <span className={styles.axisCardResult}>{axisSums[2] > 0 ? 'P' : 'L'}</span></h3>
            <div className={styles.axisOptions}>
              <div className={styles.axisOption}>
                <h4 className={axisSums[2] > 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>P (Prepare)</h4>
                <p className={axisSums[2] > 0 ? styles.axisOptionActive : styles.axisOptionLabel}>미리 대비하여 마음이 놓임</p>
              </div>
              <div className={styles.axisOption}>
                <h4 className={axisSums[2] <= 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>L (Let-go)</h4>
                <p className={axisSums[2] <= 0 ? styles.axisOptionActive : styles.axisOptionLabel}>상황을 보며 흘러보내는 편</p>
              </div>
            </div>
          </div>

          {/* 통제 성향 */}
          <div className={styles.axisCard}>
            <h3 className={styles.axisCardTitle}>통제 성향: <span className={styles.axisCardResult}>{axisSums[3] > 0 ? 'C' : 'T'}</span></h3>
            <div className={styles.axisOptions}>
              <div className={styles.axisOption}>
                <h4 className={axisSums[3] > 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>C (Control)</h4>
                <p className={axisSums[3] > 0 ? styles.axisOptionActive : styles.axisOptionLabel}>내가 챙기고 있어야 안심</p>
              </div>
              <div className={styles.axisOption}>
                <h4 className={axisSums[3] <= 0 ? styles.axisOptionActiveTitle : styles.axisOptionLabel}>T (Trust)</h4>
                <p className={axisSums[3] <= 0 ? styles.axisOptionActive : styles.axisOptionLabel}>아이·상황을 믿으려는 편</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3페이지 - 강점과 특징 */}
        {/* 성향 인사이트 (독립 섹션) */}
        <div className={styles.personalitySection}>
        <div className={styles.personalityText}>
          {motherType.highlightPhrase
            ? highlightPhraseInText(motherType.personalityInsight, motherType.highlightPhrase, styles.strengthsHighlight)
            : motherType.personalityInsight}
        </div>
        </div>
        {/* 강점과 특징 카드 묶음 */}
        <div className={styles.strengthsContainer}>
          {/* 당신의 강점 */}
            <div className={styles.badge}>강점과 특징</div>
          <div className={styles.strengthsBox}>
            <div className={styles.strengthsTitle}>당신의 강점</div>
            <div className={styles.strengthsDescription}>
              {motherType.coreStrengths.details[0]}
            </div>
          </div>
          {/* 핵심 특징 */}
          <div className={styles.coreStrengthsSection}>
            <div className={styles.coreStrengthsTitle}>핵심 특징</div>
            <div className={styles.coreStrengthsDescription}>{motherType.coreStrengths.details[1]}</div>
            <ul className={styles.coreStrengthsList}>
              {motherType.coreStrengths.details.slice(2).map((detail: string, idx: number) => (
                <li key={idx} className={styles.strengthDetail}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 4페이지 - 갈등 포인트 */}
        <div className={styles.badge}>걱정 포인트</div>
        
        <div className={styles.conflictSection}>
          {/* 자주 걱정하는 상황 TOP 5 */}
          <div className={styles.conflictCard}>
            <div className={styles.conflictCardTitle}>자주 걱정하는 상황 TOP 5</div>
            <ul className={styles.conflictList}>
              {motherType.conflictPoints.frequentSituations && motherType.conflictPoints.frequentSituations.map((situation: string, idx: number) => (
                <li key={idx} className={styles.conflictListItem}>{situation}</li>
              ))}
            </ul>
          </div>
          {/* 자주 하는 걱정 */}
          <div className={styles.conflictCard}>
            <div className={styles.conflictCardTitle}>자주 하는 걱정</div>
            <ul className={styles.conflictList}>
              {motherType.conflictPoints.commonWorries && motherType.conflictPoints.commonWorries.map((worry: string, idx: number) => (
                <li key={idx} className={styles.conflictListItem}>{worry}</li>
              ))}
            </ul>
          </div>
                    
    
          <div className={styles.emotionCard}>
            <div className={styles.emotionCardTitle}>엄마로써 자주 느끼는 감정</div>
            <div className={styles.emotionTagsRow}>
              {motherType.conflictPoints.emotionTags.map((tag: string, idx: number) => (
                <span 
                  key={idx} 
                  className={styles.emotionTag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* 5페이지 - 방향 제안 */}
        <div className={styles.badge}>방향 제안</div>
        
        <div className={styles.tipsSection}>
          <div className={styles.tipsCard}>
            <div className={styles.tipsCardTitle}>생각 정리 포인트</div>
            <ul className={styles.tipsList}>
              {motherType.directionAdvice.dailyTips.map((tip: string, idx: number) => (
                <li key={idx} className={styles.tipsListItem}>{tip.replace(/^•?\s*/, '· ')}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className={styles.messageBox}>
          <div className={styles.messageTitle}>당신을 위한 한줄 메세지</div>
          <div className={styles.messageText}>
            {motherType.directionAdvice.mindsetMessage}
          </div>
        </div>
      </div>
      <div className={styles.dividerWrapper}>
        <svg xmlns="http://www.w3.org/2000/svg" width="328" height="1" viewBox="0 0 328 1" fill="none">
          <path d="M0 0.5H328" stroke="#E4E4E4"/>
        </svg>
      </div>
      {/* 6페이지 - 이메일 입력 */}
      <div className={styles.pageLast}>
        <div className={styles.emailInputs}>
          <input 
            type="email"
            placeholder="이메일 주소"
            className={styles.emailInput}
          />
          <input 
            type="text"
            placeholder="이메일 확인"
            className={styles.emailInputConfirm}
          />
        </div>
        
        <p className={styles.emailNotice}>
          *이메일은 최초 1회만 전송가능하므로,<br/>
          입력하신 이메일 주소의 정확성을 꼭 확인해주세요.
        </p>
        
        <button className={styles.emailButton}>
          이메일로 결과 받기
        </button>
      </div>
    </div>
  )
}