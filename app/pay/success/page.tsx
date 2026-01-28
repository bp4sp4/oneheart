"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

export default function SuccessPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  useEffect(() => {
    async function confirm() {
      const params = new URLSearchParams(window.location.search);
      const requestData = {
        orderId: params.get("orderId"),
        amount: params.get("amount") ? Number(params.get("amount")) : undefined,
        paymentKey: params.get("paymentKey"),
      };

      try {
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        const json = await res.json();
        if (!res.ok) {
          setStatus("error");
          setDetail(json);
          return;
        }

        setStatus("success");
        setDetail(json);

        // localStorage에서 결과 가져와 서버에 저장 (클라이언트에서 서비스 키 사용 금지)
        const storedResult = localStorage.getItem('quizResult');
        if (storedResult) {
          const result = JSON.parse(storedResult);
          try {
            const resp = await fetch('/api/save-result', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ result, orderId: requestData.orderId, quizOrder: result.quizOrder }),
            })
            const j = await resp.json()
            console.log('save-result response', j)
            if (resp.ok && j?.recoveryCode) {
              setRecoveryCode(j.recoveryCode)
              localStorage.removeItem('quizResult')
              localStorage.removeItem('quizOrder')
            } else {
              console.error('save-result failed', j)
            }
          } catch (e) {
            console.error('save-result network error', e)
          }
        }
      } catch (err) {
        setStatus("error");
        setDetail({ message: (err as any).message });
      }
    }

    confirm();
  }, []);

  return (
    <div className="wrapper">
      <div className="box_section">
        <h2>결제 성공</h2>
        {status === null && <p>결제 확인 중...</p>}
        {status === "success" && (
          <>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(detail, null, 2)}</pre>
            {recoveryCode && (
              <div style={{ marginTop: 20, padding: 20, background: "#f0f0f0", borderRadius: 8 }}>
                <h3>결과 복원 코드</h3>
                <p>나중에 결과를 다시 보려면 이 코드를 저장하세요: <strong>{recoveryCode}</strong></p>
                <p>문의 시 이 코드를 알려주시면 도와드리겠습니다.</p>
              </div>
            )}
          </>
        )}
        {status === "error" && (
          <>
            <p>결제 확인에 실패했습니다.</p>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(detail, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
}
