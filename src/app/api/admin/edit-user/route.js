import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/admin/edit-user - update admin password
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'MINIMAL 6 CHARACTER' },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);
    const supabase = createServerClient();

    const { error } = await supabase
      .from('users')
      .update({ password: hash })
      .eq('id', session.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'PASSWORD UPDATED SUCCESSFULLY' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
