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
- Mikrokontroler: **ESP32 / NodeMCU (ESP8266) / ATmega328P Combo**
- Modul RFID: **Mifare RC522** (13.56 MHz)
- Display & Indikator: **LCD 16x2 (I2C)** & **Buzzer**

---

## 🏗️ Arsitektur Sistem Singkat

Sistem menggunakan topologi Client-Server di jaringan lokal (LAN/WLAN) sekolah. 
Alat pembaca RFID membaca *Unique Identifier* (UID) dari kartu siswa, lalu mengirimkannya via HTTP GET/POST *request* ke API Next.js. Server akan memvalidasi data ke database MySQL, mengecek saldo, dan menyinkronkan status transaksi secara instan ke antarmuka kasir.

---

## 🚀 Panduan Instalasi

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
   - Buat database baru di MySQL (misal: `db_kasircashless`)
   - Copy file `.env.example` menjadi `.env`
   - Sesuaikan konfigurasi database URL di dalam `.env`:
     ```env
     DATABASE_URL="mysql://root:@localhost:3306/db_kasircashless"
     ```

4. **Migrasi Schema Database (Prisma)**
   ```bash
   npx prisma db push
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

6. Buka browser dan akses: `http://localhost:3000`

---

## 📡 Panduan Firmware IoT

Repository ini menyediakan firmware siap pakai di dalam folder `modulFlash/` yang mendukung 3 varian arsitektur hardware:

1. **ESP32 Dev Module** (`modulFlash/ESP/ESP32/`)
2. **NodeMCU V3 ESP8266** (`modulFlash/ESP/ESP8266/`)
3. **ATmega328P + ESP8266 Combo Board** (`modulFlash/ATmega/`) — menggunakan komunikasi serial inter-chip.

### 🔌 Komponen lain
- Modul RFID: **MFRC522** (13.56 MHz)
- Layar Display: **LCD 16x2 + I2C Backpack**
- Indikator Suara: **Active Buzzer**

---

### ⚡ Flashing

1. **Siapkan Library di Arduino IDE**
   Buka *Library Manager* (`Ctrl + Shift + I`) dan pasang library berikut:
   - `MFRC522` by GithubCommunity
   - `LiquidCrystal_I2C` by Frank de Brabander

2. **Buka File Program**
   Pilih sketch `.ino` yang sesuai dengan board Anda:
   - **ESP32:** `modulFlash/ESP/ESP32/ESP32.ino`
   - **ESP8266:** `modulFlash/ESP/ESP8266/ESP8266.ino`
   - **ATmega Combo:** `modulFlash/ATmega/ATmega328P/` & `ESP8266WIFI/`

3. **Sesuaikan Konfigurasi Jaringan & Server**
   Di bagian atas kode, isi data WiFi (wajib **2.4 GHz**) dan endpoint IP server web kasir Anda:
   ```cpp
   const char* ssid     = "Nama_WiFi_2.4GHz";
   const char* password = "Password_WiFi";
   const String serverUrl = "http://<IP_KOMPUTER_KASIR>:3000/api/rfid?rfid=";
   ```

4. **Wiring & Upload**
   - Panduan pinout lengkap untuk masing-masing board sudah tertulis di baris komentar atas setiap file program.
   - Pilih jenis Board dan Port COM yang sesuai di Arduino IDE, lalu klik **Upload** (`Ctrl + U`).
   - Setelah selesai, tap kartu RFID untuk mulai memproses transaksi ke web kasir.

---

## 🤝 Kontribusi (Untuk Tim Internal)

Proyek ini dikembangkan oleh siswa jurusan **Pengembangan Perangkat Lunak dan Gim (PPLG)**. 
Bagi tim developer (Front-end, Back-end, maupun IoT/Hardware), pastikan membuat *branch* baru untuk setiap fitur yang dikerjakan sebelum melakukan *Pull Request*.

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pendidikan dan operasional sekolah.
