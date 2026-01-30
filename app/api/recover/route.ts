import { supabase } from '../../../lib/db'

export async function POST(req: Request) {
  const { recoveryCode } = await req.json()
  const { data, error } = await supabase
    .from('mothers')
    .select('*')
    .eq('recovery_code', recoveryCode.toUpperCase())
    .maybeSingle()
  if (error) {
    return Response.json({ success: false, message: error.message || 'DB 조회 오류' }, { status: 400 })
  }
  if (!data) {
    return Response.json({ success: false, message: '해당 코드의 결과가 없습니다.' }, { status: 404 })
  }
  return Response.json({ success: true, mother: data })
}