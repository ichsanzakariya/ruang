# Ruang

Portal reservasi ruang kampus: cari ruang yang kosong, pilih tanggal dan jam, lalu terima kode reservasi langsung di halaman. Situs statis tanpa build step dan tanpa backend. Seluruh alur berjalan di browser.

- Situs: [ruangai.web.id](https://ruangai.web.id)
- Bahasa antarmuka: Indonesia
- Status: demo front-end. Data ruang, jadwal, dan kode reservasi masih contoh di dalam kode, bukan data kampus sungguhan.

## Fitur

- **Beranda** dengan hero animasi, statistik layanan, daftar ruang, alur tiga langkah, papan ketersediaan langsung, tanya jawab, dan ajakan reservasi.
- **Alur reservasi tiga langkah**: pilih tanggal, pilih jam dan durasi, lalu isi data pemesan pada satu halaman.
- **Ketersediaan per jam** dari 08.00 sampai 18.00 WIB. Slot yang sudah lewat, terisi, bentrok dengan durasi, atau tidak cukup waktu sampai tutup otomatis dinonaktifkan.
- **Validasi form** dengan pesan kesalahan per kolom, ringkasan kesalahan, dan penanda `aria-invalid`.
- **Ringkasan pemesanan** yang ikut menempel di samping saat halaman digulir di layar lebar.
- **Dialog konfirmasi** berupa `<dialog>` bawaan browser: kode reservasi muncul huruf per huruf, detail pemesanan ditampilkan, dan fokus tetap terkontrol.
- **Enam ruang contoh**: Aria, Nusa, Sunyi, Cakra, Loka, dan Sabha, masing-masing dengan kapasitas dan fasilitas sendiri.
- **Responsif** dari 320 px sampai layar lebar, dengan dukungan `prefers-reduced-motion` dan navigasi keyboard.

## Halaman

| Alamat | Isi |
| --- | --- |
| `/` | Beranda: hero, tentang, ruang, cara kerja, jadwal, testimoni, tanya jawab, ajakan reservasi |
| `/reservasi` | Form reservasi dengan ringkasan dan dialog konfirmasi |
| `/reservasi?ruang=nusa` | Reservasi untuk ruang tertentu. Ganti `nusa` dengan `aria`, `sunyi`, `cakra`, `loka`, atau `sabha` |

Alamat pintasan seperti `/tentang`, `/ruang`, `/jadwal`, `/faq`, `/kontak`, `/reservasi/tanggal`, dan `/reservasi/kontak` diarahkan ke halaman yang sesuai lewat `vercel.json`, jadi navigasi tetap bisa memakai tautan bersih tanpa akhiran `.html`.

## Teknologi

- HTML, CSS, dan JavaScript murni. Tanpa framework, tanpa paket npm, tanpa proses build.
- Font servis sendiri: Instrument Serif dan Plus Jakarta Sans (`assets/fonts`).
- Ilustrasi hero berupa SVG inline, sedangkan foto ruang tersimpan di `assets/img`.
- Halaman di-host di Vercel dengan `cleanUrls`.

## Struktur Berkas

```text
.
├── index.html            Beranda
├── reservasi.html        Halaman reservasi
├── styles.css            Gaya beranda dan komponen bersama
├── reservasi.css         Gaya khusus halaman reservasi dan dialog konfirmasi
├── script.js             Interaksi beranda: menu, reveal, papan jadwal, hitung statistik
├── reservasi.js          Logika reservasi: tanggal, slot, validasi, ringkasan, dialog
├── vercel.json           Rewrites alamat bersih, aturan cache, header keamanan
└── assets/
    ├── favicon/          Ikon situs, termasuk build.py untuk menghasilkan ulang ukurannya
    ├── fonts/            Berkas font woff2
    └── img/              Foto ruang dan ilustrasi footer
```

Foto ruang diambil dari Unsplash. Rincian ruang, fasilitas, dan jadwal sibuk ada di objek `ROOMS` pada bagian atas `reservasi.js`.

## Menjalankan Lokal

Karena halaman memakai tautan absolut seperti `/reservasi` dan `/assets/...`, buka situs lewat server statis, bukan dengan klik dua kali pada berkas HTML. Salah satu caranya:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`. Tanpa rewrites dari Vercel, alamat pintasan seperti `/jadwal` tidak tersedia di server lokal. Gunakan `/index.html` dan `/reservasi.html` saat menguji lokal, atau tambahkan aturan serupa di server yang dipakai.

## Deploy

Setiap push ke branch `main` otomatis dideploy ke produksi lewat integrasi Vercel pada repositori ini. Tidak ada perintah build, jadi Vercel cukup menyajikan berkas statis mengikuti `vercel.json`.

Salah satu hal yang perlu diingat: `vercel.json` memberi header cache satu tahun `immutable` untuk `/styles.css`, `/reservasi.css`, `/script.js`, `/reservasi.js`, dan semua isi `/assets`. Kalau mengubah CSS atau JS, naikkan versi query pada tag `<link>` dan `<script>` di `index.html` dan `reservasi.html`, misalnya `styles.css?v=20261024f`, supaya pengunjung menerima berkas baru.

## Cara Kerja Singkat

1. **Tanggal.** Jendela tanggal dibangun dari hari ini menurut zona waktu `Asia/Jakarta`, sehingga pergantian hari mengikuti WIB, bukan jam perangkat.
2. **Jam dan durasi.** Setiap slot dicek terhadap jam buka, jam tutup, jadwal sibuk ruang, dan durasi yang dipilih.
3. **Data pemesan.** Nama, NIM atau NIDN, email kampus, jumlah peserta, agenda, dan persetujuan divalidasi sebelum dikirim.
4. **Konfirmasi.** Setelah dipilih, dialog konfirmasi terbuka tanpa menggeser posisi gulir. Kode reservasi ditampilkan, lalu tombol "Buat reservasi lain" mereset formulir dan mengembalikan fokus ke pilihan tanggal.

## Aksesibilitas

- Struktur semantik dengan landmark, judul, dan urutan tab yang wajar.
- Dialog memakai elemen `<dialog>` bawaan dengan `aria-labelledby`, `aria-describedby`, dan fokus yang dipindahkan ke judul.
- Status slot dan pesan kesalahan tidak hanya dibedakan lewat warna.
- Animasi dimatikan saat pengguna memilih "kurangi gerakan".
- Lighthouse untuk aksesibilitas, praktik terbaik, dan SEO berada di skor 100 untuk beranda dan halaman reservasi.

## Lisensi dan Kredit

Kode situs ini dibuat untuk keperluan demonstrasi. Foto ruang berasal dari Unsplash dan mengikuti lisensi Unsplash. Font Instrument Serif dan Plus Jakarta Sans bersifat open source melalui Google Fonts.
