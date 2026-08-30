import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// GET /api/admin/edit-transfer - fetch transfer settings
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('transfer_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/admin/edit-transfer - update transfer settings
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const fields = [
      'title', 'subtitle', 'amount_idr', 'amount_myr',
      'sender_bank', 'sender_name', 'sender_account',
      'receiver_bank', 'receiver_account', 'receiver_name',
    ];

    const updates = {};
    for (const f of fields) {
      if (body[f] !== undefined) {
        updates[f] = body[f];
      }
    }

    const { error } = await supabase
      .from('transfer_settings')
      .update(updates)
      .eq('id', body.id || 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
