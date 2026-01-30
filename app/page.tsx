"use client";

import Link from 'next/link'
import { useState } from 'react'
import Header from './components/Header'
import styles from './page.module.css'

export default function HomePage() {
  const [emailStatus, setEmailStatus] = useState<string>('')
  const [sending, setSending] = useState(false)

  const testEmail = async () => {
    setSending(true)
    setEmailStatus('전송 중...')
    
    try {
      const res = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'bp4sp4@naver.com',
          subject: '엄마유형테스트 - 테스트 이메일',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #2B7FFF; text-align: center;">엄마유형테스트</h1>
                <p style="font-size: 16px; line-height: 1.6;">안녕하세요,</p>
                <p style="font-size: 16px; line-height: 1.6;">이메일 시스템 테스트 메일입니다.</p>
                <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>발송 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                  <p><strong>시스템 상태:</strong> 정상 작동</p>
                </div>
              </div>
            </div>
          `
        })
      })

      const data = await res.json()
      
      if (data.ok) {
        setEmailStatus('✅ 이메일 전송 성공!')
      } else {
        setEmailStatus(`❌ 전송 실패: ${data.error}`)
      }
    } catch (error) {
      setEmailStatus(`❌ 에러: ${error}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroLogo}></div>
        <p className={styles.heroText}>
          엄마의 걱정을<br/>
          한마음연구소가 정리해드릴게요
        </p>
       
      </section>
      <section className={styles.intro}>
        <h2 className={styles.introTitle}>엄마니까,</h2>
        <p className={styles.introDescription}>
          아이를 키우면서 특별한 문제가 없어도<br/>마음의 걸림돌을 느끼는 순간들이 있습니다.
        </p>
         <svg className={styles.heroArrow} xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 32 28" fill="none">
          <path d="M0.703369 0.710815L15.7034 15.5528L30.7034 0.710815" stroke="#A65661" strokeWidth="2"/>
          <path d="M0.703369 10.8688L15.7034 25.7108L30.7034 10.8688" stroke="#A65661" strokeWidth="2"/>
        </svg>
      </section>
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutTextGroup}>
            <h2 className={styles.aboutTitle}>한마음 연구소</h2>
            <p className={styles.aboutSubtitle}>Hanmaum Lab</p>
            <p className={styles.aboutDescription}>
              육아과정에서의 자연스럽게 생기는 걱정을<br/>
              한마음 연구소에서는 문제가 아닌 관찰 대상으로 정의합니다.
            </p>
          </div>
          <div className={styles.aboutImage}></div>
        </div>
      </section>
      <section className={styles.tenMinutes}>
        <h2 className={styles.tenMinutesTitle}>10분이면,</h2>
        <p className={styles.tenMinutesDescription}>
          아이 앞에서 특히 반복되는 나만의 유형을<br/>
          객관적으로 확인할 수 있습니다.
        </p>
      </section>
      <section className={styles.testSequence}>
        <div className={styles.sequenceContent}>
          <div className={styles.sequenceTextGroup}>
            <h2 className={styles.sequenceTitle}>엄마 유형 테스트 순서</h2>
            <p className={styles.sequenceSubtitle}>Test Sequence</p>
          </div>
          <div className={styles.sequenceSteps}>
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>유형 테스트 시작</h3>
              </div>
              <p className={styles.stepDescription}>
                결제 후 자가점검 테스트를 진행하실 수 있습니다. 이 테스트는 누군가의 평가가 아닌, 엄마가 느기는 감정 반응을 기준점으로 설계되었습니다.
              </p>
            </div>
            
            <svg className={styles.stepArrow} xmlns="http://www.w3.org/2000/svg" width="17" height="46" viewBox="0 0 17 46" fill="none">
              <path d="M8.3501 0.00305176L8.07772 45.0809" stroke="#A65661" strokeDasharray="3 2"/>
              <path d="M0.0776367 38.3392C4.2687 38.9972 6.12034 40.3173 7.78381 44.5556C7.88662 44.8175 8.26866 44.8175 8.37146 44.5556C10.0349 40.3173 11.8866 38.9972 16.0776 38.3392" stroke="#A65661"/>
            </svg>
            
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>질문 100개 답변하기</h3>
              </div>
              <p className={styles.stepDescription}>
                총 100개의 질문에 매우 그렇다, 그렇다, 보통이다, 그렇지 않다, 매우 그렇지 않다 방식으로 답변해 주세요. 아이와 엄마 일상에서 실제로 자주 마주치는 상황으로 구성되어 있으며, 반복되는 선택 패턴을 통해 감정 반응의 흐름을 확인하도록 설계되었습니다.
              </p>
            </div>
            
            <svg className={styles.stepArrow} xmlns="http://www.w3.org/2000/svg" width="17" height="46" viewBox="0 0 17 46" fill="none">
              <path d="M8.3501 0.00305176L8.07772 45.0809" stroke="#A65661" strokeDasharray="3 2"/>
              <path d="M0.0776367 38.3392C4.2687 38.9972 6.12034 40.3173 7.78381 44.5556C7.88662 44.8175 8.26866 44.8175 8.37146 44.5556C10.0349 40.3173 11.8866 38.9972 16.0776 38.3392" stroke="#A65661"/>
            </svg>
            
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>분석 및 결과 제공</h3>
              </div>
              <p className={styles.stepDescription}>
                모든 응답을 종합해 아이를 대하는 엄마의 감정 반응 경향성과 반복 패턴을 중심으로 분석합니다. 결과는 테스트 종료 후 화면으로 확인 가능하며, 추후 계속 확인할 수 있도록 이메일 입력 시 정리된 형태로 전달됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.testResult}>
        <div className={styles.resultContent}>
          <div className={styles.resultTextGroup}>
            <h2 className={styles.resultTitle}>테스트 결과</h2>
            <p className={styles.resultSubtitle}>Test Result</p>
            <p className={styles.resultDescription}>
              수치화 된 점수 대신 '엄마의 반응 성향 유형'을 제공합니다. 이는 고민의 반복 패턴과 인지적 반응 경향을 구조화하여
              자기 관찰의 기준점으로 활용할 수 있도록 구성되어있습니다.
            </p>
          </div>
          <div className={styles.resultImage}></div>
        </div>
      </section>
      <section className={styles.expectedEffect}>
        <div className={styles.effectContent}>
          <div className={styles.effectHeader}>
            <h2 className={styles.effectTitle}>기대 효과</h2>
            <p className={styles.effectSubtitle}>Expected Effect</p>
            <p className={styles.effectDescription}>자가점검 후 관찰 가능한 마음의 변화</p>
          </div>
          <div className={styles.effectCards}>
            <div className={styles.effectCard}>
              <div className={styles.effectCardImage} style={{backgroundImage: "url('/images/effect_001.jpg')"}}></div>
              <p className={styles.effectCardText}>감정적 반응의 객관적 관찰 연습</p>
            </div>
            <div className={styles.effectCard}>
              <div className={styles.effectCardImage} style={{backgroundImage: "url('/images/effect_002.jpg')"}}></div>
              <p className={styles.effectCardText}>반복적인 고민 패턴의 자각</p>
            </div>
            <div className={styles.effectCard}>
              <div className={styles.effectCardImage} style={{backgroundImage: "url('/images/effect_003.jpg')"}}></div>
              <p className={styles.effectCardText}>고민을 단계적으로 풀어내는 시작</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.goalSection}>
        <p className={styles.goalText}>
          혼자 하는 걱정을, 생각을 정리할 수 있는<br/>
          <span className={styles.goalHighlight}>“기준점 하나”</span>
          <span className={styles.goalMid}>로 바꾸는 것이 점</span>
          <span className={styles.goalEnd}>검의 목표입니다.</span>
        </p>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <Link href="/about"><button className={styles.ctaButtonPrimary}>엄마유형 테스트 더 알아보기</button></Link>
          <Link href="/payment"><button className={styles.ctaButtonSecondary}>내 유형 바로 점검하기</button></Link>
          <p className={styles.ctaDisclaimer}>
            본 콘텐츠는 의료·심리·교육·상담 서비스가 아니며,<br/>
            결과는 참고용으로만 활용해 주세요.
          </p>
        </div>
      </section>
            <section className={styles.coffeeSection}>
        <h2 className={styles.coffeeTitle}>커피 두잔 값으로,</h2>
        <p className={styles.coffeeDescription}>
          아이를 키우면서 반복되는 걱정에 대해<br/>
          흘들리지 않을 나만의 기준점을 세워보세요.
        </p>
      </section>
            <section className={styles.faqSection}>
              <div className={styles.faqContent}>
                <h2 className={styles.faqTitle}>자주 묻는 질문</h2>
                <h3 className={styles.faqSubtitle}>FAQ</h3>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>1. 테스트는 얼마나 걸리나요?</div>
                  <div className={styles.faqAnswer}>
                    테스트는 약 10분 내외로 소요되며, 총 100개의 질문에 매우 그렇다, 그렇다, 보통이다, 그렇지 않다, 매우 그렇지 않다 방식으로 답변하시면 됩니다.
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>2. 결과는 안전하게 보관되나요?</div>
                  <div className={styles.faqAnswer}>
                    네, 안전하게 관리됩니다. 검사 결과는 결과 전달을 위해 테스트 분석 및 결과 제공 외의 목적으로 활용되지 않습니다.
                    개인 응답 내용은 외부에 공개되거나 제 3자에게 제공되지 않으니 편안한 마음으로 솔직하게 답변해 주셔도 됩니다.
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>3. 아이 문제를 진단하는 테스트인가요?</div>
                  <div className={styles.faqAnswer}>
                    아닙니다. 이 테스트는 아이를 평가하거나 문제를 찾기 위한 것이 아니라, 아이 앞에서 반응하던 엄마 자신의 감정 패턴을 돌아보기 위한 자가점검 테스트입니다.
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>4. 유료인가요?</div>
                  <div className={styles.faqAnswer}>
                    이 테스트는 아이와 엄마의 다양한 상황을 반영한 문항을 통해 반복되는 감정 반응의 패턴을 종합적으로 확인하는 구조로 설계되었습니다.
                    이러한 방식은 단순한 무료 테스트 형태로 제공하기 어려워, 유료로 운영되고 있습니다.
                  </div>
                </div>

              </div>
            </section>

    </>
  )
}
