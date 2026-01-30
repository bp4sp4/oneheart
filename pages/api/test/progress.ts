import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/db'; // updated import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'A valid token is required' });
    }

    try {
      const { data, error } = await supabase
        .from('test_progress')
        .select('last_question_index, answers, question_order')
        .eq('test_access_token', token)
        .single();

      if (error) {
        // .single() throws an error if more than one row is found.
        // If no row is found, it returns null data but doesn't error, so we treat that as 'not found'.
        console.error('Supabase GET error:', error);
        return res.status(404).json({ error: 'Progress not found or multiple entries exist.' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Progress not found.' });
      }

      return res.json(data);
    } catch (error: any) {
      console.error('API /api/test/progress GET Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { test_access_token, last_question_index, answers, question_order } = req.body;
      if (!test_access_token) return res.status(400).json({ error: 'test_access_token required' });
      if (!question_order) return res.status(400).json({ error: 'question_order required' });

      const { error } = await supabase
        .from('test_progress')
        .upsert({
          test_access_token,
          last_question_index,
          answers,
          question_order,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'test_access_token',
        });
      
      if (error) {
        console.error('Supabase upsert error:', error);
        return res.status(500).json({ error: 'Failed to save progress', details: error.message });
      }

      return res.json({ ok: true });
    } catch (error: any) {
      console.error('API /api/test/progress POST Error:', error);
      return res.status(500).json({ error: 'Failed to save progress', details: error.message });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
