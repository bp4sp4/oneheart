import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { amount, email, phone } = req.body;
  const order_id = 'ORD-' + Date.now();
  const temp_token = uuidv4();
  try {
    const { error } = await supabase
      .from('orders')
      .insert([{ order_id, amount, temp_token, email: email || null, phone: phone || null, status: 'PENDING' }]);
    if (error) throw error;
    res.json({ order_id, temp_token });
  } catch (e: any) {
    let message = 'Unknown error';
    if (e && typeof e === 'object' && 'message' in e) message = (e as any).message;
    res.status(500).json({ error: 'DB error', detail: message });
  }
}
