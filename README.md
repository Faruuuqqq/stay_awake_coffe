# Stay Awake Coffee: Platform E-commerce Kopi UMKM Lokal

## Deskripsi Proyek

**Stay Awake Coffee** adalah platform e-commerce yang dirancang untuk menjadi jembatan antara pelaku UMKM kopi lokal Indonesia dengan konsumen digital. Kami menyediakan berbagai produk kopi berkualitas tinggi seperti biji kopi pilihan dari berbagai daerah di Indonesia, kopi bubuk, dan merchandise eksklusif.

Banyak pelaku usaha kecil di bidang kopi yang belum memiliki akses untuk menjual produknya secara online. Stay Awake Coffee hadir sebagai solusi, membantu mereka memasarkan produk secara lebih luas dengan cara yang mudah dan efisien, sekaligus mendukung perkembangan industri kopi lokal dan kesejahteraan para petaninya.

Website ini dibangun menggunakan **Node.js, Express.js, dan MySQL**, dengan fokus pada kemudahan akses bagi pembeli dan efisiensi pengelolaan bagi admin.

## Fitur-Fitur Utama

Kami telah mengimplementasikan fitur-fitur esensial untuk pengalaman e-commerce yang komprehensif:

### Fitur Pengguna (Frontend & Backend):

* **Autentikasi Pengguna:**
    * **Registrasi:** Pendaftaran akun baru.
    * **Login:** Masuk ke akun pengguna dengan JWT (JSON Web Tokens) berbasis cookie.
    * **Logout:** Keluar dari sesi pengguna.
* **Manajemen Akun:**
    * **Profil Pengguna:** Melihat dan memperbarui informasi profil (nama, email).
    * **Ganti Kata Sandi:** Memperbarui kata sandi akun.
    * **Riwayat Pesanan:** Melihat daftar pesanan yang pernah dibuat, termasuk detail produk per pesanan.
    * **Alamat Saya:** Menambah, melihat, mengedit, dan menghapus alamat pengiriman yang tersimpan.
    * **Metode Pembayaran (Riwayat):** Melihat riwayat pembayaran.
* **Katalog Produk:**
    * Melihat daftar semua produk kopi dan merchandise.
    * Melihat detail produk individual (deskripsi, harga, stok, gambar utama & hover, ulasan).
    * **Rating Produk:** Menampilkan rating dummy/acak di daftar produk dan rata-rata rating di detail produk (siap untuk integrasi rating asli).
    * **Filter & Sorting:** Struktur backend siap untuk filter berdasarkan kategori, harga, dan pencarian.
* **Keranjang Belanja:**
    * Menambah produk ke keranjang.
    * Memperbarui kuantitas produk di keranjang.
    * Menghapus produk dari keranjang.
    * Mengosongkan seluruh keranjang.
* **Proses Checkout:**
    * Memilih alamat pengiriman dari daftar yang tersimpan atau menambahkan alamat baru.
    * Ringkasan order yang dinamis dari isi keranjang.
    * Membuat order baru yang terhubung dengan alamat terpilih.
* **Proses Pembayaran (Simulasi):**
    * Halaman khusus untuk konfirmasi pembayaran setelah checkout.
    * Mencatat detail pembayaran ke database.
    * Mengupdate status order setelah pembayaran.
    * Halaman konfirmasi pembayaran sukses.
* **Ulasan Produk:**
    * Menulis ulasan (rating & komentar) untuk produk tertentu.
    * Melihat daftar ulasan yang ada untuk suatu produk.
* **Notifikasi Interaktif:**
    * Sistem notifikasi **Toast kustom** yang seragam dan indah (muncul di pojok kanan bawah) untuk feedback sukses, error, info, dan warning di seluruh aplikasi.

### Fitur Admin (Backend Terlindungi):

* **Manajemen Produk:** API untuk membuat, memperbarui, dan menghapus produk.
* **Manajemen Kategori:** API untuk membuat, memperbarui, dan menghapus kategori.
* **Manajemen Pengiriman:** API untuk membuat dan memperbarui status pengiriman.
* **Otorisasi Role-Based:** Rute-rute admin dilindungi secara ketat menggunakan `adminMiddleware`, memastikan hanya pengguna dengan peran 'admin' yang dapat mengaksesnya.

## Teknologi yang Digunakan

* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Driver Database:** `mysql2` (untuk interaksi dengan MySQL)
* **Autentikasi:** JSON Web Tokens (JWT)
* **Password Hashing:** `bcryptjs`
* **Variabel Lingkungan:** `dotenv`
* **Frontend:**
    * **Templating Engine:** EJS
    * **CSS Framework:** Bootstrap 5
    * **Ikon:** Bootstrap Icons, FontAwesome 5.15.3 (untuk Toast kustom)
    * **JavaScript:** Fetch API untuk interaksi AJAX, DOM manipulation
    * **Animasi:** AOS (Animate On Scroll)
    * **Slider:** Swiper.js
    * **Layout & Filter:** Isotope.js, ImagesLoaded (untuk filter produk)
    * **Lightbox:** GLightbox
    * **Counter Animasi:** PureCounter
* **Struktur Proyek:** Arsitektur Model-View-Controller (MVC).

## Cara Menyiapkan dan Menjalankan Proyek

### Prasyarat

* [Node.js](https://nodejs.org/en/) (versi 14 atau lebih baru)
* [npm](https://www.npmjs.com/) (biasanya sudah terinstal dengan Node.js)
* [MySQL Server](https://www.mysql.com/downloads/) (versi 8.0 atau lebih baru)
* Klien MySQL (misalnya [MySQL Workbench](https://www.mysql.com/products/workbench/), [DBeaver](https://dbeaver.io/), atau [phpMyAdmin](https://www.phpmyadmin.net/))

### Langkah-langkah Setup

1.  **Clone Repositori:**
    ```bash
    git clone [URL_REPOSITORI_ANDA]
    cd project-uas-sistem-database-I/backend # Sesuaikan dengan jalur direktori backend Anda
    ```
    *(Ganti `[URL_REPOSITORI_ANDA]` dengan URL repositori Git Anda.)*

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Database MySQL:**
    * Buat database baru di MySQL server Anda, misalnya bernama `stay_awake_db`.
    * Impor skema database:
        ```bash
        mysql -u [USERNAME_MYSQL] -p [NAMA_DATABASE_ANDA] < backend/database/schemaBaru.sql
        ```
        *(Ganti `[USERNAME_MYSQL]` dengan username MySQL Anda, `[NAMA_DATABASE_ANDA]` dengan nama database yang Anda buat.)*
    * Impor data dummy (opsional, untuk mengisi data awal):
        ```bash
        mysql -u [USERNAME_MYSQL] -p [NAMA_DATABASE_ANDA] < backend/database/dummyData.sql
        ```

4.  **Konfigurasi Variabel Lingkungan:**
    * Buat file `.env` di direktori `backend` Anda.
    * Salin konten dari `.env.example` ke file `.env` dan sesuaikan nilainya:
        ```
        PORT=3000
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_mysql_password
        DB_NAME=stay_awake_db
        JWT_SECRET=your_jwt_secret_key
        JWT_EXPIRESIN=1h
        NODE_ENV=development
        ```
        *(Ganti nilai `your_mysql_password` dan `your_jwt_secret_key` dengan milik Anda.)*

5.  **Jalankan Aplikasi:**
    ```bash
    npm start
    ```
    atau
    ```bash
    node app.js
    ```
    Aplikasi akan berjalan di `http://localhost:3000` (atau port yang Anda tentukan di `.env`).

## Kontribusi

Kami menyambut kontribusi! Jika Anda memiliki saran, perbaikan, atau ingin menambahkan fitur baru, silakan buka *issue* atau *pull request*.

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://opensource.org/licenses/MIT).

---

**Saran Penting untuk Anda Setelah Ini:**

* **Pastikan `productModel.js` dan `orderModel.js` Anda adalah versi terbaru** yang sudah kita perbaiki untuk mengambil semua detail yang dibutuhkan di frontend (item order, detail alamat/pembayaran di order).
* **Pastikan `public/assets/img/stayAwakeImage/logo/logo juga.webp` ada** di lokasi tersebut, dan gambar-gambar produk/kategori juga ada di lokasi yang benar (`/assets/img/...`).

TERIMA KASIH!
