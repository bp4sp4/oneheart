"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./success.module.css";

// 로딩 오버레이 (gif + 프로그레스바)
function SuccessLoadingOverlay({ visible }: { visible: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!visible) return;
    setProgress(0);
    let step = 0;
    const steps = 60; // 3초 (60*50ms)
    const interval = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [visible]);
  if (!visible) return null;
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingCard}>
        <img src="/images/loading.gif" alt="로딩중" className={styles.loadingGif} />
        <div className={styles.loadingText}>결제 정보를 확인 중입니다...</div>
        <div className={styles.loadingProgressBarWrap}>
          <div className={styles.loadingProgressBarBg}>
            <div className={styles.loadingProgressBarFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 결제 대기 컴포넌트
function SuccessPending() {
  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>⏳</div>
        <h1 className={styles.successTitle}>결제 처리 중...</h1>
        <p className={styles.successMessage}>결제가 아직 완료되지 않았습니다. 잠시만 기다려주세요. 자동으로 확인 중입니다.</p>
      </div>
    </div>
  );
}

// 메인 컴포넌트
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading');
  const [showLoading, setShowLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [testAccessToken, setTestAccessToken] = useState<string | null>(null);
  const confirmingRef = useRef(false);

  const paymentKey = searchParams?.get("paymentKey");
  const orderId = searchParams?.get("orderId");
  const amount = searchParams?.get("amount");

  // 최소 3초간 로딩 오버레이 보장
  useEffect(() => {
    let cancelled = false;
    setShowLoading(true);
    const minTime = 3000;
    const start = Date.now();
    const confirmPayment = async () => {
      if (confirmingRef.current) return;
      confirmingRef.current = true;
      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setErrorDetails({ message: 'URL에서 결제 정보를 찾을 수 없습니다.' });
        confirmingRef.current = false;
        setShowLoading(false);
        return;
      }
      const token = localStorage.getItem("testAccessToken");
      setTestAccessToken(token);
      try {
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            testAccessToken: token,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw json;
        if (json.success === true || json.status === "DONE") {
          setStatus('success');
        } else {
          setStatus('pending');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorDetails(err);
        }
      } finally {
        confirmingRef.current = false;
        // 최소 3초 보장
        const elapsed = Date.now() - start;
        if (elapsed < minTime) {
          setTimeout(() => setShowLoading(false), minTime - elapsed);
        } else {
          setShowLoading(false);
        }
      }
    };
    confirmPayment();
    return () => { cancelled = true; };
  }, [paymentKey, orderId, amount]);

  // Polling for payment status if pending
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'pending' && paymentKey && orderId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/toss/payment-status?paymentKey=${paymentKey}&orderId=${orderId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const json = await res.json();

          if (json.status === "DONE") {
            setStatus('success');
            clearInterval(interval);
          } else if (json.status === "CANCELED" || json.status === "PARTIAL_CANCELED" || json.status === "ABORTED" || json.status === "EXPIRED") {
            setStatus('error');
            setErrorDetails({ message: `결제가 ${json.status} 상태입니다.`, tossResponse: json });
            clearInterval(interval);
          }
          // If status is still IN_PROGRESS or WAITING_FOR_DEPOSIT, continue polling
        } catch (err) {
          console.error("Error during polling:", err);
          // Don't set error status immediately for transient network errors, keep polling.
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => clearInterval(interval); // Cleanup on unmount or status change
  }, [status, paymentKey, orderId]);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("복원 코드가 클립보드에 복사되었습니다!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert("복사에 실패했습니다.");
    });
  };
  
  // 로딩 오버레이 항상 위에 렌더링
  // 모바일에서 빠르게 사라지지 않도록 showLoading이 true면 오버레이만 보여줌
  if (showLoading) {
    return <SuccessLoadingOverlay visible={showLoading} />;
  }

  if (status === 'pending') {
    return <SuccessPending />;
  }

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <div className={`${styles.successCard} ${styles.errorCard}`}>
          <div className={styles.successIcon}>❌</div>
          <h1 className={styles.successTitle}>결제 확인 실패</h1>
          <p className={styles.successMessage}>
            결제를 확인하는 중 오류가 발생했습니다.
          </p>
          {errorDetails && (
            <pre className={styles.errorDetails}>
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        {/* <div className={styles.successIcon}>✅</div> */} {/* 체크 아이콘 제거 */}
        <h1 className={styles.successTitle}>결제가 완료되었습니다!</h1>
        <p className={styles.successMessage}>
          엄마유형테스트를 진행하고 결과를 확인하실 수 있습니다.
        </p>

        {testAccessToken && (
          <div className={styles.recoveryCodeSection}>
            <p className={styles.recoveryCodePrompt}>
              나중에 결과를 다시 보거나 테스트를 이어하려면 아래 복원 코드를 저장하세요.
            </p>
            <div className={styles.recoveryCodeContainer}>
              <span className={styles.recoveryCodeText}>{testAccessToken}</span>
              <button
                onClick={() => handleCopy(`${window.location.origin}/quiz?token=${testAccessToken}`)}
                className={styles.copyButton}
                style={{ marginLeft: 8 }}
              >
                링크 복사
              </button>
            </div>
            <p className={styles.recoveryCodeHint}>
              * 복원 코드는 고유하며, 결과를 복원하는 데 사용됩니다. 분실하지 않도록 주의하세요.
            </p>
          </div>
        )}

        <div className={styles.buttonGroup}>
          {testAccessToken ? (
            <Link
              href={`/quiz?token=${testAccessToken}`}
              className={styles.homeButton}
              onClick={() => {
                // 결제 후 첫 입장임을 표시
                if (typeof window !== 'undefined') {
                  localStorage.setItem('justPaid', '1');
                }
              }}
            >
              테스트 이어하기
            </Link>
          ) : (
            <Link
              href="/quiz"
              className={styles.homeButton}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('justPaid', '1');
                }
              }}
            >
              테스트 시작하기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
