# ☕ Stay Awake Coffee - Aplikasi E-Commerce

Selamat datang di repositori E-Commerce Stay Awake Coffee! Ini adalah proyek aplikasi web full-stack yang dibangun dengan Node.js, Express, dan MySQL, dengan fokus pada fungsionalitas e-commerce yang lengkap, keamanan, dan pengalaman pengguna yang modern.

#### Preview  
![Stay Awake Coffee Screenshot](src\public\assets\img\preview\homepage.jpeg)
![Stay Awake Coffee Screenshot](src\public\assets\img\preview\homepage_product.jpeg)

## Deskripsi Proyek

Stay Awake Coffee adalah platform e-commerce fungsional yang memungkinkan pengguna untuk melakukan registrasi, login, menjelajahi berbagai produk kopi, mengelola keranjang belanja, dan menyelesaikan alur checkout yang aman. Proyek ini dibangun dengan arsitektur backend yang terstruktur (Service-Model-Controller) dan mengimplementasikan otentikasi berbasis JWT (JSON Web Token) yang disimpan dalam `HttpOnly` cookie untuk keamanan maksimal.

## Fitur Utama

-   **Otentikasi & Keamanan**:
    -   Registrasi, Login, dan Logout pengguna yang aman.
    -   Penggunaan `HttpOnly` cookie untuk menyimpan token JWT, mencegah serangan XSS.
    -   Hashing password menggunakan `Argon2`.
    -   Middleware otentikasi (`protect`) dan otorisasi (`adminMiddleware`) untuk melindungi rute.

-   **Fungsionalitas E-Commerce**:
    -   **Katalog Produk**: Menampilkan daftar produk dari database dengan gambar dan harga.
    -   **Halaman Detail Produk**: Menampilkan detail lengkap, galeri gambar produk yang interaktif, dan pilihan kuantitas.
    -   **Keranjang Belanja (Shopping Cart)**: Menambah, memperbarui, dan menghapus item dari keranjang menggunakan AJAX tanpa perlu me-reload halaman.
    -   **Alur Checkout**:
        -   Form checkout multi-langkah yang rapi.
        -   Manajemen alamat (pilih alamat tersimpan atau buat alamat baru secara dinamis).
        -   Kalkulasi total harga dinamis berdasarkan ongkos kirim dan pajak.
    -   **Manajemen Pesanan**: Pengguna dapat melihat riwayat dan detail pesanan mereka.
    -   **Pembayaran**: Alur untuk memproses dan mencatat pembayaran untuk sebuah pesanan.

-   **Manajemen Akun Pengguna**:
    -   Dashboard "Akun Saya" yang terstruktur dengan baik.
    -   CRUD (Create, Read, Update, Delete) untuk alamat pengiriman.
    -   Fungsi untuk memperbarui profil (nama, email) dan mengganti password.

## Tumpukan Teknologi

| Kategori      | Teknologi                                                              |
| ------------- | ---------------------------------------------------------------------- |
| **Backend** | Node.js, Express.js                                                      |
| **Database** | MySQL                                                                   |
| **Frontend** | EJS (Server-Side Rendering), JavaScript, JQuery, Bootstrap 5, SASS/CSS  |
| **Keamanan** | JWT, HttpOnly Cookies, Argon2, CORS                                     |
| **Lainnya** | SweetAlert2, Swiper.js, AOS.js, Joi (Validasi)                           |
| **DevOps** | Docker, Docker Compose                                                    |

## Instalasi & Cara Menjalankan

Metode yang paling direkomendasikan adalah menggunakan Docker, karena semua konfigurasi sudah disiapkan untuk Anda.

### Menggunakan Docker (Sangat Direkomendasikan)

**Prasyarat**: Docker dan Docker Compose sudah terpasang dan berjalan.

1.  **Buat File `.env`**
    Di dalam folder utama proyek (di level yang sama dengan `docker-compose.yml`), buat sebuah file baru dengan nama persis `.env` dan salin semua teks di bawah ini ke dalamnya. Ganti nilai-nilai `your_..._password` dengan password yang aman.

    ```env
    # Konfigurasi Aplikasi Node.js
    NODE_ENV=development
    APP_PORT=3000
    JWT_SECRET=kunci_rahasia_jwt_yang_sangat_aman_dan_panjang
    JWT_EXPIRES_IN=7d

    # Koneksi Database dari Aplikasi (ini untuk komunikasi di dalam Docker)
    DB_HOST=db
    DB_USER=stayawake_user
    DB_PASSWORD=your_strong_app_password
    DB_NAME=stay_awake_db
    DB_PORT=3306

    # Konfigurasi Service Database MySQL di Docker
    MYSQL_ROOT_PASSWORD=your_strong_root_password
    MYSQL_DATABASE=stay_awake_db
    MYSQL_USER=stayawake_user
    # PASTIKAN PASSWORD INI SAMA DENGAN DB_PASSWORD DI ATAS
    MYSQL_PASSWORD=your_strong_app_password
    ```

2.  **Build dan Jalankan Container**
    Buka terminal di direktori utama proyek dan jalankan perintah berikut:
    ```bash
    docker-compose up --build -d
    ```
    Perintah ini akan menjalankan aplikasi dan database di latar belakang.

3.  **Setup Database **
    - Buka aplikasi database client (DBeaver, TablePlus, MySQL Workbench).
    - Buat koneksi baru ke database dengan detail:
        - **Host**: `localhost` atau `127.0.0.1`
        - **Port**: `3306`
        - **User**: `root`
        - **Password**: Password yang Anda atur di `MYSQL_ROOT_PASSWORD`.
    - Setelah terhubung, jalankan dua file SQL ini secara berurutan:
        a. Jalankan seluruh isi file `src/database/schema.sql` untuk membuat semua tabel.
        b. Jalankan seluruh isi file `src/database/dummyData.sql` untuk mengisi tabel dengan data contoh.

4.  **Akses Aplikasi**
    Buka browser : **`http://localhost:3000`**

### Menjalankan Secara Lokal (Alternatif)

1.  **Setup Database**: Pastikan memiliki server MySQL yang berjalan. Buat database bernama `stay_awake_db`. Jalankan script dari `schema.sql` dan `dummyData.sql`.
2.  **Install Dependencies**: Buka terminal di dalam folder `src` dan jalankan `npm install`.
3.  **Konfigurasi `.env`**: Buat file `.env` di dalam folder `src`. Isi dengan `DB_HOST=localhost` serta username/password database lokal.
4.  **Jalankan Aplikasi**: Dari dalam folder `src`, jalankan `npm run start`.
5.  **Akses Aplikasi**: Buka browser dan kunjungi `http://localhost:3000`.

## Struktur Proyek

Struktur folder utama pada direktori `src` diatur sebagai berikut untuk memisahkan setiap concern:
```
/src
├── config/             # Konfigurasi database (db.js)
├── controllers/        # Menghubungkan rute dengan logika bisnis (services)
├── database/           # File .sql untuk skema dan data awal
├── middlewares/        # Middleware Express (otentikasi, error handling, dll)
├── models/             # Berinteraksi langsung dengan database (query SQL)
├── public/             # Aset statis (CSS, JS frontend, gambar)
├── routes/             # Definisi semua rute API dan halaman
├── services/           # Logika bisnis inti aplikasi
├── utils/              # Fungsi-fungsi bantuan (helpers)
├── views/              # File-file template EJS
│   └── partials/       # Komponen EJS yang bisa digunakan kembali
└── app.js              # Titik masuk utama aplikasi Express
```

## Kontribusi

Kami menyambut kontribusi! Jika memiliki saran, perbaikan, atau ingin menambahkan fitur baru, silakan buka *issue* atau *pull request*.

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://opensource.org/licenses/MIT).
