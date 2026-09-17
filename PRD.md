# Product Requirements Document (PRD)
**Nama Proyek:** Sistem Kasir Cashless Berbasis RFID
**Klien/Target:** Business Center & Smart Cafe SMK
**Versi:** 1.0

---

## 1. Pendahuluan

### 1.1 Latar Belakang
SMK memiliki unit usaha berupa Business Center dan Smart Cafe yang melayani transaksi pembelian oleh siswa setiap hari. Saat ini, transaksi kemungkinan masih menggunakan uang tunai yang berisiko pada kehilangan, ketidakakuratan kembalian, dan antrean panjang. Di sisi lain, siswa jurusan PPLG (Pengembangan Perangkat Lunak dan Gim) memiliki kapasitas untuk mengembangkan solusi teknologi mandiri.

### 1.2 Tujuan Produk
Membangun sistem *Point of Sale* (POS) / kasir yang terintegrasi dengan kartu pelajar berbasis RFID untuk menciptakan ekosistem pembayaran *cashless* (nontunai) di lingkungan sekolah.

### 1.3 Metrik Keberhasilan
- Mempercepat waktu transaksi di kasir (target: < 10 detik per transaksi).
- Menghilangkan selisih perhitungan uang tunai di kasir.
- Tingkat adopsi 100% pada siswa (semua siswa menggunakan kartu RFID untuk jajan).
- Sistem berjalan stabil tanpa *downtime* selama jam istirahat sekolah.

---

## 2. Target Pengguna (User Personas)

| Persona | Deskripsi & Kebutuhan |
|---------|-----------------------|
| **Siswa (Cardholder)** | Pemegang kartu RFID. Membutuhkan proses pembayaran yang cepat dan ingin tahu sisa saldo mereka. |
| **Kasir (Business Center/Cafe)** | Operator harian. Membutuhkan antarmuka yang sangat responsif, cepat untuk memilih produk, dan proses *checkout* yang instan. |
| **Admin** | Pengelola sistem operasional. Bertugas melakukan *top-up* (isi ulang) saldo siswa dan mengelola daftar produk (harga, stok). |
| **Supervisor/Kepala Unit** | Pemantau jalannya usaha. Membutuhkan laporan penjualan harian/bulanan yang akurat dan manajemen akun pegawai. |

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Modul Kasir (Point of Sale)
- **F1.1 Integrasi RFID:** Sistem harus dapat menerima *input* UID (Unique Identifier) dari perangkat keras ESP32 secara *real-time*.
- **F1.2 Tampilan Identitas:** Saat kartu di-*tap*, sistem harus menampilkan nama siswa, foto (jika ada), dan saldo saat ini.
- **F1.3 Keranjang Belanja (Cart):** Kasir dapat menambahkan, mengubah jumlah, atau menghapus item produk sebelum pembayaran.
- **F1.4 Validasi Saldo:** Sistem harus menolak transaksi jika total belanja melebihi saldo siswa.
- **F1.5 Checkout Cepat:** Proses deduksi saldo dan pengurangan stok produk terjadi seketika (*atomic transaction*).
- **F1.6 Cetak/Tampil Struk:** Sistem dapat menampilkan struk digital pasca-transaksi.

### 3.2 Modul Manajemen Produk (Inventory)
- **F2.1 CRUD Produk:** Admin dapat menambah, mengubah, menghapus (soft delete), dan melihat daftar produk.
- **F2.2 Kategori & Outlet:** Produk dapat dikategorikan (makanan/minuman) dan dipisahkan berdasarkan outlet (Smart Cafe vs Business Center).
- **F2.3 Manajemen Stok:** Stok produk berkurang otomatis saat terjadi transaksi pembelian.

### 3.3 Modul Top-up Saldo
- **F3.1 Scan & Input:** Admin men-scan kartu siswa dan memasukkan nominal uang tunai yang diterima untuk ditambahkan ke saldo.
- **F3.2 Batasan Top-up:** Sistem memiliki batas minimum (misal: Rp 5.000) dan maksimum saldo maksimal (misal: Rp 500.000) per siswa untuk keamanan.

### 3.4 Modul Laporan & Riwayat
- **F4.1 Riwayat Siswa:** Sistem dapat menampilkan riwayat mutasi saldo (masuk dan keluar) dari seorang siswa.
- **F4.2 Laporan Penjualan:** Supervisor dapat melihat total pendapatan per hari/bulan dan produk paling laris.

### 3.5 Modul Autentikasi & Otorisasi
- **F5.1 Login Multi-role:** Sistem memiliki pembatasan akses berdasarkan peran (Kasir, Admin, Supervisor).

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

- **Keamanan Saldo:** Data saldo disimpan secara terpusat di server (MySQL), bukan di fisik kartu, untuk mencegah manipulasi data dari luar.
- **Keamanan API:** Komunikasi antara perangkat ESP32 dan Server menggunakan autentikasi sederhana (seperti API Key atau IP Whitelisting) agar tidak sembarang perangkat bisa menembak API.
- **Ketersediaan (Availability):** Sistem di-deploy di server lokal (*Local Area Network* sekolah) sehingga tetap dapat beroperasi meskipun koneksi internet eksternal terputus.
- **Kinerja (Performance):** Respon API dari saat kartu di-*tap* hingga profil muncul di layar kasir harus di bawah 1 detik.
- **Integritas Data:** Menggunakan mekanisme *Database Transaction* untuk memastikan saldo tidak terpotong ganda saat terjadi kegagalan jaringan (*race conditions*).

---

## 5. Spesifikasi Teknis

- **Frontend & Backend API:** Next.js (React + TypeScript)
- **Antarmuka Pengguna (UI):** Tailwind CSS (didesain agar ramah untuk layar sentuh / monitor kasir)
- **Database:** MySQL
- **ORM:** Prisma
- **Perangkat Keras Pembaca:** RFID Reader (Mifare RC522 atau setara) + Mikrokontroler ESP32/NodeMCU.
- **Protokol Komunikasi Hardware:** HTTP POST request via jaringan WiFi lokal.

---

## 6. Asumsi & Ketergantungan (Dependencies)
1. **Penyediaan Kartu:** Sekolah memiliki stok kartu RFID kosong dan printer ID card jika diperlukan.
2. **Koneksi Jaringan:** Terdapat router WiFi khusus di area Business Center dan Smart Cafe yang menghubungkan ESP32 dengan komputer Server Lokal.
3. **Data Master Siswa:** Tersedia data awal berupa *spreadsheet* (Excel/CSV) berisi NIS dan Nama Siswa untuk diimpor ke sistem, sehingga tidak perlu input manual satu per satu.

---

## 7. Pertanyaan Terbuka untuk Tim (Open Items)
- Apakah struk pembayaran perlu dicetak menggunakan *thermal printer* fisik, atau cukup struk digital di layar?
- Apakah perlu ada fitur "pengembalian dana" (Refund) jika kasir salah melakukan input transaksi?
- Bagaimana skenario jika siswa menghilangkan kartunya? (Rencana mitigasi: Fitur blokir kartu di dashboard admin dan pendaftaran UID kartu baru ke siswa yang sama).
