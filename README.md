# PhoneRepair CRM App

Aplikasi CRM (Customer Relationship Management) modern untuk bisnis perbaikan ponsel dan perangkat elektronik dengan integrasi AI dan WhatsApp.

## Deskripsi

PhoneRepair CRM adalah aplikasi manajemen hubungan pelanggan yang dirancang khusus untuk bisnis perbaikan elektronik. Aplikasi ini menyediakan solusi komprehensif untuk mengelola pelanggan, tiket servis, inventaris, teknisi, dan komunikasi dengan pelanggan melalui WhatsApp dan ChatAI.

## Teknologi dan Framework

### Frontend
- **React 18** - Library JavaScript untuk membangun antarmuka pengguna
- **TypeScript** - Superset JavaScript yang menambahkan tipe statis
- **Vite** - Build tool yang cepat untuk aplikasi web modern
- **TailwindCSS** - Framework CSS utility-first untuk styling
- **React Router v7** - Routing untuk aplikasi React
- **Recharts** - Library untuk membuat grafik dan visualisasi data
- **Lucide React** - Set ikon modern untuk UI

### Backend
- **Node.js** - Runtime JavaScript untuk server
- **Express** - Framework web untuk Node.js
- **Socket.IO** - Library untuk komunikasi real-time

### AI Integration
- **OpenAI (ChatGPT-4o)** - AI untuk chat assistant
- **Qwen AI** - Model AI alternatif untuk chat assistant

### Komunikasi
- **WhatsApp API** - Integrasi untuk komunikasi dengan pelanggan
- **SMS Service** - Layanan notifikasi untuk update status servis

### Penyimpanan Data
- **localStorage** - Penyimpanan data di sisi klien
- **JSON** - Format data untuk pertukaran informasi

## Fitur Utama

- **Manajemen Pelanggan** - Simpan dan kelola data pelanggan
- **Tiket Servis** - Buat dan lacak tiket servis untuk perbaikan perangkat
- **Manajemen Teknisi** - Kelola teknisi dan distribusi beban kerja
- **Manajemen Inventaris** - Lacak stok spare part dan barang
- **Integrasi WhatsApp** - Komunikasi langsung dengan pelanggan melalui WhatsApp
- **ChatAI** - Asisten AI yang dapat memberikan informasi dari data CRM
- **Dashboard** - Visualisasi data kinerja bisnis
- **Laporan Bulanan** - Analisis kinerja bisnis secara berkala
- **Faktur** - Pembuatan faktur untuk pelanggan

## Prasyarat

- Node.js (versi 14 atau lebih tinggi)
- Akun WhatsApp Business API
- API Key untuk OpenAI/ChatGPT atau Qwen AI
- Koneksi internet

## Instalasi

1. Clone repositori ini
2. Install dependensi dengan perintah:
   ```
   npm install
   ```
3. Salin file `.env.example` ke `.env` dan isi dengan kredensial yang diperlukan:
   ```
   VITE_CHATGPT_API_KEY=your_chatgpt_api_key
   VITE_CHATGPT_API_ENDPOINT=your_chatgpt_api_endpoint
   VITE_QWEN_API_KEY=your_qwen_api_key
   VITE_QWEN_API_ENDPOINT=your_qwen_api_endpoint
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
   ```

## Menjalankan Aplikasi

1. Jalankan server Socket.IO:
   ```
   npm run server
   ```
2. Jalankan aplikasi web dalam mode development:
   ```
   npm run dev
   ```
3. Atau jalankan keduanya sekaligus:
   ```
   npm run dev:all
   ```

## Struktur Aplikasi

- `src/components/` - Komponen React untuk UI aplikasi
- `src/services/` - Layanan untuk komunikasi dengan API eksternal
- `src/types/` - Definisi tipe TypeScript
- `src/lib/` - Utilitas dan fungsi helper
- `server.ts` - Server backend untuk Socket.IO dan API

## AI Contextual Chat

CRM App dilengkapi dengan fitur ChatAI yang dapat mengakses dan menganalisis data dari:
- Data pelanggan (nama, kontak, alamat)
- Tiket servis (dengan informasi lengkap pelanggan dan teknisi)
- Inventaris
- Data dashboard dan statistik

## Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau buka issue untuk perbaikan atau fitur baru.

## Lisensi

MIT
