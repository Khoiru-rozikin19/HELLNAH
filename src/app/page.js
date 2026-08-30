import { createServerClient } from '@/lib/supabase';
import LandingClient from './LandingClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const supabase = createServerClient();
    const { data: web } = await supabase.from('profilweb').select('*').limit(1).single();

    if (!web) {
      return {
        title: 'DANA Rewards',
        description: 'DANA Indonesia',
      };
    }

    const title = web.site_title || web.og_title || 'DANA Rewards';
    const description = web.meta_description || web.og_description || '';
    const imageUrl = web.og_image || web.twitter_image || '';

    return {
      title: title,
      description: description,
      openGraph: {
        title: web.og_title || title,
        description: web.og_description || description,
        url: web.og_url || undefined,
        siteName: web.og_site_name || title,
        locale: web.og_locale || 'id_ID',
        type: web.og_type || 'website',
        images: imageUrl ? [
          {
            url: imageUrl,
            width: parseInt(web.og_image_width) || 1200,
            height: parseInt(web.og_image_height) || 630,
            alt: web.og_image_alt || title,
          }
        ] : [],
      },
      twitter: {
        card: web.twitter_card || 'summary_large_image',
        title: web.twitter_title || web.og_title || title,
        description: web.twitter_description || web.og_description || description,
        images: web.twitter_image ? [web.twitter_image] : (imageUrl ? [imageUrl] : []),
      },
      icons: {
        icon: web.favicon || '/favicon.ico',
        apple: web.apple_touch_icon || undefined,
      },
    };
  } catch (e) {
    return {
      title: 'DANA Rewards',
      description: 'DANA Indonesia',
    };
  }
}

export default async function Page() {
  let transfer = null;
  let profil = null;

  try {
    const supabase = createServerClient();
    const [tRes, pRes] = await Promise.all([
      supabase.from('transfer_settings').select('*').limit(1).single(),
      supabase.from('profilweb').select('*').limit(1).single(),
    ]);
    transfer = tRes.data || null;
    profil = pRes.data || null;
  } catch (e) {
    console.error('Error fetching initial settings:', e);
  }

  return <LandingClient initialSettings={transfer} initialProfil={profil} />;
}
