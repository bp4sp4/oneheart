export type MotherResponse = {
  id: string;
  name?: string;
  scores: Record<string, number>;
  total: number;
  typeCode: string; // e.g., RSPC, RSPT...
  typeName: string; // human-readable name
  summary: string; // short explanation
  details?: string; // optional long explanation
  emailSent?: boolean;
  createdAt: string;
  recoveryCode?: string; // 복원용 랜덤 코드
  orderNo?: string; // 결제 주문 번호
  quizOrder?: number[]; // 랜덤 순서의 원본 인덱스 배열
};
