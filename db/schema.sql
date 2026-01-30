-- 주문 테이블
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(32) UNIQUE NOT NULL, -- 예: ORD-1700000000000
  amount INTEGER NOT NULL,
  temp_token UUID NOT NULL,
  test_access_token UUID,
  email VARCHAR(128),
  phone VARCHAR(32),
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 테스트 진행상황 테이블
CREATE TABLE test_progress (
  id SERIAL PRIMARY KEY,
  test_access_token UUID NOT NULL,
  last_question_index INTEGER NOT NULL,
  answers JSONB NOT NULL, -- [{q: 1, a: 2}, ...]
  question_order JSONB NOT NULL, -- [25, 79, 16, ...] 등 문제 출제 순서
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(test_access_token)
);

-- 복구코드(선택, 사람이 읽기 쉬운)
CREATE TABLE recovery_codes (
  id SERIAL PRIMARY KEY,
  test_access_token UUID NOT NULL,
  code VARCHAR(16) UNIQUE NOT NULL, -- 예: ABC-123
  created_at TIMESTAMP DEFAULT NOW()
);
