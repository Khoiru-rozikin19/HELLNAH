import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/settings - Public: fetch transfer_settings + profilweb
export async function GET() {
  try {
    const supabase = createServerClient();

    const [transferRes, profilRes] = await Promise.all([
      supabase.from('transfer_settings').select('*').limit(1).single(),
      supabase.from('profilweb').select('*').limit(1).single(),
    ]);

    return NextResponse.json({
      transfer: transferRes.data || null,
      profil: profilRes.data || null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
