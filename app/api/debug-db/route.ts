// app/api/debug-db/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/db';

export async function GET() {
  try {
    // Attempt to fetch one item from a table to verify connection and permissions.
    const { data, error } = await supabase
      .from('test_progress')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection is successful.',
      data: data,
    });
  } catch (error: any) {
    console.error('Supabase connection failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Supabase connection failed.',
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
      },
    }, { status: 500 });
  }
}
