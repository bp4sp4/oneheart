'use client'

import React, { useState, useRef } from 'react';
import { MotherType } from '../../data/motherTypes';
import RadarChart, { RadarChartRef } from './RadarChart';
import styles from './ResultDisplay.module.css';
import { highlightPhraseInText } from './highlightPhraseInText';

interface ResultDisplayProps {
  motherType: MotherType
  axisSums: number[]
  counts?: { positive: number; negative: number; sum: number }[]
}

export default function ResultDisplay({ motherType, axisSums, counts }: ResultDisplayProps) {
  const chartRef = useRef<RadarChartRef>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');

  // 간단한 이메일 유효성
  function validateEmail(email: string) {
    return /.+@.+\..+/.test(email);
  }

  async function handleSendEmail() {
    if (sending) return;
    if (!validateEmail(email)) {
      setToast('이메일 주소를 올바르게 입력해주세요.');
      return;
    }
    if (email !== emailConfirm) {
      setToast('이메일 주소가 일치하지 않습니다.');
      return;
    }
    setSending(true);
    setToast(null);
    try {
      // 차트 이미지 캡처
      const chartImageData = chartRef.current?.getChartImage();
      
      // 이미지 절대경로 변환 - 확실하게 처리
      const getAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        
        // /public/으로 시작하면 제거
        let cleanUrl = url.replace(/^\/public\//, '/');
        
        // 절대 경로 생성
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://oneheart.kr';
        return `${baseUrl}${cleanUrl}`;
      };
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Pretendard', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="margin:0;padding:40px 20px;background:linear-gradient(180deg, #F2E6E6 0%, #A65661 100%);min-height:100vh;">
  <div style="max-width:420px;margin:0 auto;padding:0;">
    
    <!-- 1. 유형 카드 -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;padding:10px 14px;background:#F8EFEF;border-radius:20px;font-size:14px;font-weight:700;color:#010101;">내 엄마유형 카드</span>
    </div>
    <div style="display:flex;width:360px;padding:77px 16px 82px 16px;flex-direction:column;align-items:center;margin:0 auto 32px auto;border-radius:8px;">
      ${motherType.cardImage ? `<img src="${getAbsoluteUrl(motherType.cardImage)}" alt="${motherType.label}" style="display:block;width:100%;max-width:280px;height:auto;border:0;outline:0;"/>` : '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#fff;">이미지 영역</div>'}
    </div>

    <!-- 2. 선호 지표 결과 (차트) -->
    <div style="text-align:center;margin-bottom:16px;">
      <span style="display:inline-block;padding:10px 14px;background:#F8EFEF;border-radius:20px;font-size:14px;font-weight:700;color:#010101;">내 선호 지표 결과</span>
    </div>
    ${chartImageData ? `<div style="text-align:center;margin:0 18px 20px 18px;"><img src="${chartImageData}" alt="차트" style="max-width:100%;height:auto;"/></div>` : ''}
    <div style="padding:20px;margin:0 18px 20px 18px;background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;">
      <div style="color:#1D1D1D;font-size:14px;font-weight:500;text-align:center;line-height:1.8;">
        걱정처리 방식: <strong>${axisSums[0] > 0 ? 'R (Reflect)' : 'E (Express)'}</strong><br/>
        판단 기준의 중심: <strong>${axisSums[1] > 0 ? 'S (Self)' : 'O (Others)'}</strong><br/>
        불안 대응 방향: <strong>${axisSums[2] > 0 ? 'P (Prepare)' : 'L (Let-go)'}</strong><br/>
        통제 성향: <strong>${axisSums[3] > 0 ? 'C (Control)' : 'T (Trust)'}</strong>
      </div>
    </div>

    <!-- 3. 성향 인사이트 -->
    <div style="padding:20px 18px;margin:0 18px 20px 18px;background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;">
      <div style="color:#1D1D1D;font-size:14px;font-weight:400;line-height:1.6;text-align:justify;">
        ${motherType.personalityInsight}
      </div>
    </div>

    <!-- 4. 강점과 특징 -->
    <div style="text-align:center;margin-bottom:16px;">
      <span style="display:inline-block;padding:10px 14px;background:#F8EFEF;border-radius:20px;font-size:14px;font-weight:700;color:#010101;">강점과 특징</span>
    </div>
    <div style="padding:0 18px;margin-bottom:20px;">
      <div style="background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;padding:20px 18px;margin-bottom:10px;">
        <div style="color:#919191;font-size:14px;font-weight:500;margin-bottom:8px;">당신의 강점</div>
        <div style="color:#3D3D3D;font-size:14px;font-weight:400;line-height:1.6;text-align:justify;">${motherType.coreStrengths.details[0]}</div>
      </div>
      <div style="background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;padding:20px 18px;">
        <div style="color:#919191;font-size:14px;font-weight:500;margin-bottom:8px;">핵심 특징</div>
        <div style="color:#1D1D1D;font-size:14px;font-weight:500;margin-bottom:12px;text-align:justify;">${motherType.coreStrengths.details[1]}</div>
        <ul style="margin:0;padding:0;list-style:none;">
          ${motherType.coreStrengths.details.slice(2).map(d => `<li style="color:#1D1D1D;font-size:14px;font-weight:500;margin-bottom:6px;padding-left:0;text-align:justify;">• ${d}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- 5. 걱정 포인트 -->
    <div style="text-align:center;margin-bottom:16px;">
      <span style="display:inline-block;padding:10px 14px;background:#F8EFEF;border-radius:20px;font-size:14px;font-weight:700;color:#010101;">걱정 포인트</span>
    </div>
    <div style="padding:0 18px;margin-bottom:20px;">
      <div style="background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;padding:20px 18px;margin-bottom:10px;">
        <div style="color:#919191;font-size:14px;font-weight:500;margin-bottom:8px;">자주 걱정하는 상황 TOP 5</div>
        <ul style="margin:0;padding:0;list-style:none;">
          ${motherType.conflictPoints.frequentSituations.map(s => `<li style="color:#1D1D1D;font-size:14px;font-weight:500;margin-bottom:6px;text-align:justify;">• ${s}</li>`).join('')}
        </ul>
      </div>
      <div style="background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;padding:20px 18px;margin-bottom:10px;">
        <div style="color:#919191;font-size:14px;font-weight:500;margin-bottom:8px;">자주 하는 걱정</div>
        <ul style="margin:0;padding:0;list-style:none;">
          ${motherType.conflictPoints.commonWorries?.map(w => `<li style="color:#1D1D1D;font-size:14px;font-weight:500;margin-bottom:6px;text-align:justify;">• ${w}</li>`).join('')}
        </ul>
      </div>
      <div style="background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;padding:20px 18px;">
        <div style="color:#919191;font-size:14px;font-weight:500;margin-bottom:12px;">엄마로써 자주 느끼는 감정</div>
        <div style="text-align:left;">
          ${motherType.conflictPoints.emotionTags.map(tag => `<span style="display:inline-block;padding:6px 12px;margin:0 6px 6px 0;border-radius:4px;border:1px solid #DAABAB;background:#F2E6E6;color:#1D1D1D;font-size:14px;font-weight:500;">#${tag}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- 6. 방향 제안 -->
    <div style="text-align:center;margin-bottom:16px;">
      <span style="display:inline-block;padding:10px 14px;background:#F8EFEF;border-radius:20px;font-size:14px;font-weight:700;color:#010101;">방향 제안</span>
    </div>
    <div style="padding:0 18px;margin-bottom:20px;">
      <div style="background:#FAFAFA;border:1px solid #F2F2F2;border-radius:8px;padding:20px 18px;margin-bottom:16px;">
        <div style="color:#919191;font-size:14px;font-weight:500;margin-bottom:8px;">생각 정리 포인트</div>
        <ul style="margin:0;padding:0;list-style:none;">
          ${motherType.directionAdvice.dailyTips.map(tip => `<li style="color:#1D1D1D;font-size:14px;font-weight:500;margin-bottom:6px;text-align:justify;">· ${tip.replace(/^•?\s*/, '')}</li>`).join('')}
        </ul>
      </div>
      <div style="background:#F2E6E6;border-radius:8px;padding:24px 18px;text-align:center;">
        <div style="color:#A65661;font-size:14px;font-weight:500;margin-bottom:12px;">당신을 위한 한줄 메세지</div>
        <div style="color:#1D1D1D;font-family:'Gowun Batang',serif;font-size:14px;font-weight:400;line-height:1.5;">${motherType.directionAdvice.mindsetMessage}</div>
      </div>
    </div>

  </div>
</body>
</html>
      `;
      const res = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: '엄마유형테스트 결과',
          html
        })
      });
      if (res.ok) {
        setToast('이메일이 성공적으로 전송되었습니다!');
      } else {
        const data = await res.json().catch(() => ({}));
        setToast(data.error || '이메일 전송에 실패했습니다.');
      }
    } catch (e) {
      setToast('이메일 전송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  }

  // 토스트 자동 사라짐
  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

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
            ref={chartRef}
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
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={sending}
          />
          <input 
            type="text"
            placeholder="이메일 확인"
            className={styles.emailInputConfirm}
            value={emailConfirm}
            onChange={e => setEmailConfirm(e.target.value)}
            disabled={sending}
          />
        </div>
        <p className={styles.emailNotice}>
          *이메일은 최초 1회만 전송가능하므로,<br/>
          입력하신 이메일 주소의 정확성을 꼭 확인해주세요.
        </p>
        <button className={styles.emailButton} onClick={handleSendEmail} disabled={sending}>
          {sending ? '전송 중...' : '이메일로 결과 받기'}
        </button>
        {toast && (
          <div className={styles.toast}>{toast}</div>
        )}
      </div>
    </div>
  )
}