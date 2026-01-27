"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// 로딩 컴포넌트
function CheckoutLoading() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '100px 20px' 
    }}>
      <p>로딩 중...</p>
    </div>
  );
}

// 메인 체크아웃 컴포넌트
function CheckoutContent() {
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const courseData = {
    basic: {
      title: "엄마유형테스트 결과",
      instructor: "엄마유형테스트",
      price: 1000,
      type: "테스트 결과",
    },
  };

  const currentData = courseData[type as keyof typeof courseData] || courseData.basic;

  // 토스페이먼츠 초기화
  useEffect(() => {
    async function initializeTossPayments() {
      try {
        console.log("토스페이먼츠 초기화 시작...");

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

        console.log("토스페이먼츠 초기화 완료");
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

      console.log("결제 요청:", {
        orderId,
        orderName: currentData.title,
        amount: currentData.price,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: currentData.price,
        },
        orderId,
        orderName: currentData.title,
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
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        marginBottom: '20px',
        color: '#333'
      }}>
        {currentData.title}
      </h1>
      
      <p style={{ 
        fontSize: '32px', 
        fontWeight: 'bold',
        marginBottom: '40px',
        color: '#2B7FFF'
      }}>
        ₩{currentData.price.toLocaleString()}
      </p>

      {paymentError && (
        <div style={{ 
          color: 'red', 
          marginBottom: '20px',
          padding: '10px',
          background: '#fee',
          borderRadius: '4px'
        }}>
          <p>{paymentError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#2B7FFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {!paymentError && !isPaymentReady && (
        <p style={{ color: '#666' }}>결제 시스템을 준비하고 있습니다...</p>
      )}

      {isPaymentReady && !paymentError && (
        <button 
          onClick={handlePayment}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#2B7FFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1a6be6'}
          onMouseOut={(e) => e.currentTarget.style.background = '#2B7FFF'}
        >
          결제하기
        </button>
      )}
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
