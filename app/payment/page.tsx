"use client";
import { logger } from '../logger';

import { useState, Suspense, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSearchParams } from "next/navigation";
import styles from "./payment.module.css";

// 로딩 컴포넌트
function PaymentLoading() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '100px 20px'
    }}>
      <p>로딩 중...</p>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function PaymentPage() {
  return (
    <>
      <Header />
        <Suspense fallback={<PaymentLoading />}>
          <PaymentContent />
        </Suspense>
    </>
  );
}




// 메인 컴포넌트
function PaymentContent() {
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const price = 9900;
  const title = "엄마유형테스트 결과";

  // 토스페이먼츠 초기화
  useEffect(() => {
    async function initializeTossPayments() {
      try {
        logger.log("토스페이먼츠 초기화 시작...");

        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error("클라이언트 키가 설정되지 않았습니다.");
        }

        // Script 동적 로드
        if (!document.getElementById('toss-payments-script')) {
          const script = document.createElement('script');
          script.id = 'toss-payments-script';
          script.src = 'https://js.tosspayments.com/v2/standard';
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // TossPayments 전역 객체 대기 (로드 후 약간의 시간 필요)
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        const TossPayments = (window as any).TossPayments;
        if (!TossPayments) {
          throw new Error("TossPayments SDK를 로드할 수 없습니다.");
        }

        const tossPayments = TossPayments(clientKey);
        const payment = tossPayments.payment({
          customerKey: TossPayments.ANONYMOUS,
        });

        // 결제 요청 함수를 전역으로 저장
        (window as unknown as Record<string, unknown>).tossPayment = payment;

        logger.log("토스페이먼츠 초기화 완료");
        setIsPaymentReady(true);
        setPaymentError(null);
      } catch (error) {
        console.error("토스페이먼츠 초기화 실패:", error);
        setPaymentError(`토스페이먼츠 초기화에 실패했습니다: ${error}`);
      }
    }

    initializeTossPayments();
  }, []);

  // 결제 요청
  const handlePayment = async () => {
    if (!isPaymentReady) {
      alert("결제 시스템을 준비 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      const payment = (window as unknown as Record<string, unknown>)
        .tossPayment as any;

      if (!payment) {
        throw new Error("결제 시스템이 준비되지 않았습니다.");
      }

      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      logger.log("결제 요청:", {
        orderId,
        orderName: title,
        amount: price,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: price,
        },
        orderId,
        orderName: title,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: "customer@example.com",
        customerName: "고객",
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.paymentLayout}>
      
        <div className={styles.paymentTitle}>엄마 <span className={styles.paymentSubtitle}>유형 테스트</span></div>
        <div className={styles.paymentEngSubtitle}>MOTHER TYPE TEST</div>
        <img src="/payment.png" alt="엄마유형 카드 예시" className={styles.paymentCardImage} />
        <div className={styles.paymentDesc}>
          16가지의 유형 중, 나는 <span className={styles.paymentDescBold}>아이에게 어떤 엄마</span>일까요?<br />
          내 감정 반응의 패턴을 종합적으로 확인해보세요.
        </div>
        {paymentError && (
          <div style={{ color: 'red', marginBottom: '20px', padding: '10px', background: '#fee', borderRadius: '4px' }}>
            <p>{paymentError}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '10px', padding: '8px 16px', background: '#2B7FFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              다시 시도
            </button>
          </div>
        )}
        {!paymentError && !isPaymentReady && (
          <p style={{ color: '#666', textAlign: 'center' }}>결제 시스템을 준비하고 있습니다...</p>
        )}
        {isPaymentReady && !paymentError && (
          <div className={styles.paymentButtonWrap}>
            <button 
              className={styles.paymentButton}
              onClick={handlePayment}
            >
              9,900원으로 바로 테스트하기
            </button>
          </div>
        )}
      </div>
    
  );
}
