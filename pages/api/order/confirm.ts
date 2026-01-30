import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { order_id, temp_token } = req.body;
  // 실제로는 토스 결제 승인 로직 필요 (여기선 생략)
  const test_access_token = uuidv4();
  try {
    const { data, error } = await supabase.rpc( 
      'UPDATE orders SET status=$1, test_access_token=$2, updated_at=NOW() WHERE order_id=$3 AND temp_token=$4 RETURNING *',
      ['PAID', test_access_token, order_id, temp_token]
    );
    if (error) return res.status(404).json({ error: 'Order not found' });
    res.json({ test_access_token });
  } catch (e: any) {
    let message = 'Unknown error';
    if (e && typeof e === 'object' && 'message' in e) message = (e as any).message;
    res.status(500).json({ error: 'DB error', detail: message });
  }
}
