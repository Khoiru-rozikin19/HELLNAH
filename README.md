# HELIXGEO V2

Sistem monitoring dan geolokasi berbasis **Next.js App Router** + **Supabase** + **Netlify**.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (foto & aset web)
- **Auth**: Custom JWT + bcrypt
- **Deploy**: Netlify

## Fitur

- Capture foto kamera depan & belakang
- Geolokasi otomatis (GPS)
- Dashboard monitoring dengan peta OpenStreetMap
- Admin panel terproteksi JWT
- Edit profil web, transfer settings, dan password admin
- Dynamic Open Graph meta tags (SSR)

## Setup

### 1. Supabase

1. Buat project baru di supabase.com
2. Jalankan SQL schema di SQL Editor:
   - Buka file `supabase_schema.sql`
   - Copy-paste dan jalankan di Supabase SQL Editor
3. Buat Storage Buckets:
   - Buat bucket `captures` -> Set ke Public
   - Buat bucket `uploads` -> Set ke Public

### 2. Environment Variables

Salin `.env.local` dan isi dengan credentials Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
JWT_SECRET=ganti-dengan-string-rahasia-panjang-minimal-32-karakter
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Buka http://localhost:3000

### 4. Deploy ke Netlify

1. Push repository ke GitHub
2. Hubungkan repository di netlify.com
3. Set environment variables di Netlify Dashboard:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET
4. Deploy otomatis!

## Default Admin Login

- **Username**: admin
- **Password**: (sesuai hash bcrypt di schema SQL)


UPDATE users 
SET password = '$2a$12$NN0p4vlYjlo8.qTeR0wiceihwJUZ0Tdl0dy6i8SGRDF5tbufB1SAi' 
WHERE username = 'admin';