"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./payment.module.css";

// 로딩 컴포넌트
function PaymentLoading() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ←
        </Link>
        <h1 className={styles.headerTitle}>결제</h1>
        <div className={styles.headerSpacer}></div>
      </header>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>로딩 중...</p>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}

// 메인 컴포넌트
function PaymentContent() {
  const [selectedType, setSelectedType] = useState("");
  const searchParams = useSearchParams();
  const paymentType = searchParams?.get("type");

  const courseOptions = [
    {
      id: "basic",
      title: "엄마유형테스트 결제",
      price: 1000,
      description: "엄마유형테스트 결제",
      benefits: ["테스트 결과 확인", "상세 분석 리포트", "이메일 전송"],
      color: "#28a745",
    },
  ];

  const handleSelection = (type: string) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      window.location.href = `/payment/checkout?type=${selectedType}`;
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ←
        </Link>
        <h1 className={styles.headerTitle}>엄마유형테스트 결제</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      {/* 안내 메시지 */}
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>결제하고 결과 확인하기</h2>
        <p className={styles.infoDescription}>
          테스트 결과를 확인하려면 결제가 필요합니다
        </p>
      </div>

      {/* 선택 옵션 */}
      <div className={styles.optionsSection}>
        {courseOptions.map((option) => (
          <div
            key={option.id}
            className={`${styles.optionCard} ${
              selectedType === option.id ? styles.selected : ""
            }`}
            onClick={() => handleSelection(option.id)}
            onTouchStart={() => handleSelection(option.id)}
          >
            <div className={styles.optionHeader}>
              <div className={styles.optionTitle}>
                <h3>{option.title}</h3>
                <p className={styles.optionDescription}>{option.description}</p>
              </div>
              <div className={styles.optionPrice}>
                <span className={styles.priceAmount}>
                  ₩{option.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.optionBenefits}>
              <h4>포함 혜택</h4>
              <ul>
                {option.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className={styles.optionBadge}>
              {selectedType === option.id && (
                <span className={styles.selectedBadge}>✓ 선택됨</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 고정 버튼 */}
      <div className={styles.stickyButtonBar}>
        <button
          className={`${styles.continueButton} ${
            selectedType ? styles.active : styles.disabled
          }`}
          onClick={handleContinue}
          disabled={!selectedType}
        >
          {selectedType ? "다음 단계로" : "결제 유형을 선택해주세요"}
        </button>
      </div>
    </div>
  );
}
