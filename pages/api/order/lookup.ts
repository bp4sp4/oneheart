import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, phone, code } = req.query;
  let where = '';
  let value;
  if (email) {
    where = 'email=$1'; value = email;
  } else if (phone) {
    where = 'phone=$1'; value = phone;
  } else if (code) {
    // 복구코드로 찾기
    const { data: codeData, error: codeError } = await supabase
      .from('recovery_codes')
      .select('test_access_token')
      .eq('code', code)
      .single();
    if (codeError || !codeData) return res.status(404).json({ error: 'not found' });
    return res.json({ test_access_token: codeData.test_access_token });
  } else {
    return res.status(400).json({ error: 'email, phone, or code required' });
  }
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('test_access_token')
    .eq(where.split('=')[0], value)
    .eq('status', 'PAID')
    .single();
  if (orderError || !orderData) return res.status(404).json({ error: 'not found' });
  res.json({ test_access_token: orderData.test_access_token });
}
