"use client";

import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

// NOTE: 결제위젯은 "결제위젯 클라이언트 키"(test_gck_...)가 필요합니다. API 개별연동 키(test_ck_...)는 사용 불가!
// Toss 대시보드 > 결제위젯 > 클라이언트 키를 복사해서 NEXT_PUBLIC_TOSS_CLIENT_KEY에 설정하세요.
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const CUSTOMER_KEY = process.env.NEXT_PUBLIC_TOSS_CUSTOMER_KEY || ANONYMOUS;

export default function CheckoutPage() {
  const [amount, setAmount] = useState({ currency: "KRW", value: 50000 });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPaymentWidgets() {
      try {
        console.log("[toss] CLIENT_KEY:", CLIENT_KEY)
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: CUSTOMER_KEY });
        if (!mounted) return;
        setWidgets(widgets);
        console.log('[toss] widgets initialized')
        setLoadError(null)
      } catch (err: any) {
        console.error('[toss] load error', err)
        // provide user-friendly message
        const msg = err?.message || String(err)
        setLoadError(msg.includes('클라이언트 키') ? '클라이언트 키가 잘못되었습니다. NEXT_PUBLIC_TOSS_CLIENT_KEY에 대시보드의 클라이언트 키(test_ck_...)를 설정하세요.' : `위젯 로드 실패: ${msg}`)
      }
    }

    fetchPaymentWidgets();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (widgets == null) return;

    async function render() {
      await widgets.setAmount(amount);

      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);

      setReady(true);
    }

    render();
  }, [widgets]);

  useEffect(() => {
    if (widgets == null) return;
    widgets.setAmount(amount);
  }, [widgets, amount]);

  return (
    <div className="wrapper">
      <div className="box_section">
        <h2>결제 테스트 (Toss Payments 위젯)</h2>

        <div id="payment-method" />
        <div id="agreement" />

        <div style={{ marginTop: 12 }}>
          <label>
            <input
              type="checkbox"
              disabled={!ready}
              onChange={(e) => {
                const checked = e.currentTarget ? e.currentTarget.checked : false;
                setAmount((prev: any) => ({ ...prev, value: checked ? prev.value - 5000 : prev.value + 5000 }));
              }}
            />
            <span style={{ marginLeft: 8 }}>5,000원 쿠폰 적용</span>
          </label>
        </div>

        <button
          className="button"
          disabled={!ready}
          style={{ marginTop: 16 }}
          onClick={async () => {
            if (!widgets) return;
            try {
              // 실제 서비스에서는 orderId/amount를 서버에 먼저 저장하세요.
              const orderId = `order_${Date.now()}`;
              await widgets.requestPayment({
                orderId,
                orderName: "엄마 유형 테스트 결제",
                successUrl: window.location.origin + "/pay/success",
                failUrl: window.location.origin + "/pay/fail",
                customerEmail: "customer@example.com",
                customerName: "테스트 고객",
                customerMobilePhone: "01000000000",
              });
            } catch (err) {
              console.error(err);
              alert("결제 요청 중 오류가 발생했습니다.");
            }
          }}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}
