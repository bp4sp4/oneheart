"use client";

export default function FailPage() {
  // Simple client-side display of query params
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);

  return (
    <div className="wrapper">
      <div className="box_section">
        <h2>결제 실패</h2>
        <p>{`에러 코드: ${params.get("code") || "-"}`}</p>
        <p>{`실패 사유: ${params.get("message") || "-"}`}</p>
      </div>
    </div>
  );
}
