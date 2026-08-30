import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { signToken, sessionCookieOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/auth/login
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.trim())
      .limit(1)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'ACCESS DENIED' },
        { status: 401 }
      );
    }

    // Verify bcrypt password
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: 'ACCESS DENIED' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions(token));

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
