import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// GET /api/admin/editweb - fetch web profile
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('profilweb')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profil: data });
}

// POST /api/admin/editweb - update web profile (with file uploads)
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const formData = await request.formData();

    // Text fields
    const textFields = [
      'site_title', 'meta_description',
      'og_type', 'og_title', 'og_description', 'og_url', 'og_site_name', 'og_locale',
      'og_image_width', 'og_image_height', 'og_image_alt',
      'twitter_card', 'twitter_title', 'twitter_description',
      'theme_color', 'apple_webapp_capable', 'apple_webapp_statusbar',
    ];

    const uploadFields = ['favicon', 'apple_touch_icon', 'og_image', 'twitter_image'];
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'ico', 'svg'];

    const updates = {};

    // Process text fields
    for (const f of textFields) {
      const val = formData.get(f);
      if (val !== null) {
        updates[f] = val.toString().trim();
      }
    }

    // Process file uploads
    for (const f of uploadFields) {
      const deleteFlag = formData.get(`hapus_${f}`);
      if (deleteFlag === 'true' || deleteFlag === '1') {
        updates[f] = '';
        continue;
      }

      const file = formData.get(f);
      if (file && file instanceof Blob && file.size > 0) {
        const name = file.name || `${f}.png`;
        const ext = name.split('.').pop().toLowerCase();

        if (!allowedExts.includes(ext)) {
          return NextResponse.json(
            { error: `Ekstensi .${ext} tidak diizinkan untuk ${f}` },
            { status: 400 }
          );
        }
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: `File ${f} terlalu besar (maks 5MB)` },
            { status: 400 }
          );
        }

        const randomHex = Math.random().toString(16).slice(2, 18);
        const fileName = `${f}_${randomHex}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('uploads')
          .upload(fileName, file, { contentType: file.type, upsert: false });

        if (uploadErr) {
          return NextResponse.json(
            { error: `Upload ${f} gagal: ${uploadErr.message}` },
            { status: 500 }
          );
        }

        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        updates[f] = urlData?.publicUrl || '';
      }
    }

    // Update database
    const { error } = await supabase
      .from('profilweb')
      .update(updates)
      .eq('id', 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal simpan: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: 'PROFIL WEB BERHASIL DIUPDATE' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
