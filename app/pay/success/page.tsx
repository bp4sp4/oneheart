"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

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
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(detail, null, 2)}</pre>
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
