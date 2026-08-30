import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// GET /api/admin/dashboard - fetch all surveillance records
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    const { data: records, error } = await supabase
      .from('records')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ records: records || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
