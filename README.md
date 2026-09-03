# 🏫 Sistem Kasir Cashless Berbasis RFID
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
Sistem Point of Sale (POS) dan manajemen uang elektronik (Cashless) khusus untuk lingkungan sekolah. Proyek ini dikembangkan untuk Business Center dan Smart Cafe SMK guna memudahkan transaksi harian siswa menggunakan kartu pintar (RFID).
> **Status Proyek:** Tahap Pengembangan (Work in Progress) 🚧
---
## 🌟 Fitur Utama
- 💳 **Pembayaran Instan:** Transaksi hitungan detik menggunakan kartu RFID (Mifare).
- 💰 **Manajemen Saldo Tersentralisasi:** Saldo aman tersimpan di database server, bukan di dalam fisik kartu.
- 🛍️ **POS Kasir Responsif:** Antarmuka kasir yang dirancang untuk kecepatan dan kemudahan penggunaan.
- 📦 **Manajemen Inventaris:** Pengaturan stok produk makanan/minuman dan alat tulis.
- 🔄 **Sistem Top-up:** Pengisian saldo dengan pencatatan mutasi yang jelas.
- 📊 **Laporan Terintegrasi:** Pantau riwayat transaksi siswa dan omzet Business Center secara *real-time*.
## 🛠️ Teknologi yang Digunakan
### Software (Aplikasi Web)
- **Frontend & Backend API:** [Next.js](https://nextjs.org/) (React Framework)
- **Bahasa Pemrograman:** TypeScript / JavaScript
- **Styling:** Tailwind CSS
- **Database:** MySQL
- **ORM:** Prisma
- **Autentikasi:** NextAuth.js
### Hardware (Alat Pembaca)
- Mikrokontroler: **ESP32 / NodeMCU**
- Modul RFID: **Mifare RC522** (Atau modul 13.56MHz sejenis)
---
## 🏗️ Arsitektur Sistem Singkat
Sistem menggunakan topologi Client-Server di jaringan lokal (LAN/WLAN) sekolah. 
Alat pembaca RFID (ESP32) membaca *Unique Identifier* (UID) dari kartu siswa, lalu mengirimkannya via HTTP POST *request* ke API Next.js. Next.js akan mengecek ke database MySQL, memvalidasi saldo, dan mengembalikan data profil siswa ke layar komputer kasir.
---
## 🚀 Panduan Instalasi (Development)
### Persyaratan Sistem
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- MySQL Server (XAMPP/Laragon/Docker)
- Git
### Langkah Instalasi
1. **Clone repository ini**
   ```bash
   git clone https://github.com/USERNAME/aplikasiKasir.git
   cd aplikasiKasir
   ```
2. **Install dependensi**
   ```bash
   npm install
   ```
3. **Konfigurasi Database**
   - Buat database baru di MySQL (misal: `db_kasir_sekolah`)
   - Copy file `.env.example` menjadi `.env`
   - Sesuaikan konfigurasi database URL di dalam `.env`:
     ```env
     DATABASE_URL="mysql://root:password@localhost:3306/db_kasir_sekolah"
     ```
4. **Migrasi Schema Database (Prisma)**
   ```bash
   npx prisma migrate dev --name init
   ```
5. **Jalankan Seed (Opsional - untuk data dummy)**
   ```bash
   npm run seed
   ```
6. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
7. Buka browser dan akses: `http://localhost:3000`
---
## 🤝 Kontribusi (Untuk Tim Internal)
Proyek ini dikembangkan oleh siswa jurusan **Pengembangan Perangkat Lunak dan Gim (PPLG)**. 
Bagi tim developer (Front-end, Back-end, maupun IoT/Hardware), pastikan membuat *branch* baru untuk setiap fitur yang dikerjakan sebelum melakukan *Pull Request*.
## 📄 Lisensi
Proyek ini dibuat untuk keperluan pendidikan dan operasional sekolah.
