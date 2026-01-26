"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./success.module.css";

// 로딩 컴포넌트
function SuccessLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✅</div>
        <h1 className={styles.successTitle}>결제가 완료되었습니다!</h1>
        <p className={styles.successMessage}>안전하게 결제가 처리되었습니다.</p>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>로딩 중...</p>
        </div>
      </div>
    </div>
  );
}

// 메인 컴포넌트
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentKey: string;
    orderId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    // URL 파라미터에서 결제 정보 추출
    const paymentKey = searchParams?.get("paymentKey");
    const orderId = searchParams?.get("orderId");
    const amount = searchParams?.get("amount");

    if (paymentKey && orderId && amount) {
      setPaymentInfo({
        paymentKey,
        orderId,
        amount: parseInt(amount),
      });
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✅</div>
        <h1 className={styles.successTitle}>결제가 완료되었습니다!</h1>
        <p className={styles.successMessage}>
          엄마유형테스트 결제가 완료되었습니다. 이제 결과를 확인하실 수 있습니다.
        </p>

        {paymentInfo && (
          <div className={styles.paymentDetails}>
            <div className={styles.detailItem}>
              <span>주문번호:</span>
              <span>{paymentInfo.orderId}</span>
            </div>
            <div className={styles.detailItem}>
              <span>결제금액:</span>
              <span>₩{paymentInfo.amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Link href="/quiz" className={styles.homeButton}>
            테스트 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
