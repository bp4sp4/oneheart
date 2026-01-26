import type { NextApiRequest, NextApiResponse } from 'next';
import { MotherResponse } from '../../types/mother';

export default function handler(req: NextApiRequest, res: NextApiResponse<MotherResponse>) {
  const example: MotherResponse = {
    id: 'sample-1',
    name: '테스트 응답',
    scores: { R: 10, E: 8, P: 12, L: 6 },
    total: 36,
    typeCode: 'RSPC',
    typeName: '알스피씨 (차분한 준비형 엄마)',
    summary: '혼자 정리하며 미리 대비하는 성향입니다.',
    details: '예시 데이터입니다. 실제 문항 점수에 따라 결과가 매겨집니다.',
    emailSent: false,
    createdAt: new Date().toISOString()
  };

  res.status(200).json(example);
}
