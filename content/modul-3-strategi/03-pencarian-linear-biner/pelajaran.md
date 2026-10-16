---
judul: Pencarian linear & biner
urutan: 3
ringkasan: Mencari sebuah nilai dengan memeriksa satu per satu, lalu dengan membuang separuh data terurut di setiap langkah.
tujuan:
  - Menjelaskan cara kerja pencarian linear beserta kasus terbaik dan terburuknya
  - Menelusuri pencarian biner dengan penunjuk kiri, kanan, dan tengah
  - Menjelaskan mengapa pencarian biner hanya benar pada data yang terurut
  - Membandingkan pertumbuhan O(n) dan O(log n) di tab Pertumbuhan
visual:
  - jenis: array
    variabel: data
    penunjuk: [i, tengah]
    rentang: [kiri, kanan]
  - jenis: evaluasi
  - jenis: memori
pantau: [perbandingan]
pertumbuhan:
  variabel: n
  nilai: [8, 16, 32, 64, 128, 256]
  ukur: perbandingan
  seri:
    - nama: biner
      ganti: { biner: true }
    - nama: linear
      ganti: { biner: false }
---

## Mencari nama di daftar absen

Untuk menemukan namamu di daftar absen yang tidak berurutan, tidak ada pilihan lain selain membaca dari atas ke bawah satu per satu. Lain halnya dengan kamus: kamu membukanya kira-kira di tengah, melihat bahwa kata yang dicari ada di belakang, lalu langsung mengabaikan separuh halaman di depan. Setiap kali melirik, separuh sisa halaman terbuang.

Cara kedua jauh lebih cepat, tetapi hanya bisa dipakai karena isi kamus **terurut**. Program di editor memuat kedua cara itu: `cariLinear` (baris 22–28) dan `cariBiner` (baris 30–44). Variabel `biner` di baris 6 menentukan mana yang dijalankan. Datanya terurut naik: 2, 5, 8, …, 20, dan yang dicari adalah elemen terakhir, 20.

## Pencarian linear

**Pencarian linear** (*sequential search*) memeriksa `data[0]`, `data[1]`, dan seterusnya sampai nilai yang dicari ketemu atau data habis.

- **Kasus terbaik:** nilai yang dicari ada di indeks 0, cukup 1 perbandingan.
- **Kasus terburuk:** nilai yang dicari ada di indeks terakhir atau tidak ada sama sekali, sehingga butuh n perbandingan. Jadi pencarian linear berkompleksitas **O(n)**.

Kelebihannya, pencarian linear bekerja pada data apa pun, terurut maupun tidak.

> **Coba sendiri:** ubah baris 6 menjadi `boolean biner = false;`. Geser slider: panah **i** berjalan dari indeks 0 sampai 6, dan output menjadi `Perbandingan: 7`.

## Pencarian biner

**Pencarian biner** (*binary search*) menjaga sebuah rentang `kiri..kanan` yang pasti memuat nilai yang dicari, bila nilai itu memang ada:

1. Mulai dari seluruh array: `kiri = 0` dan `kanan = n - 1`.
2. Selama `kiri <= kanan`, ambil elemen tengahnya: `tengah = (kiri + kanan) / 2`.
3. Bila `data[tengah] == cari`, nilai ditemukan.
4. Bila `data[tengah] < cari`, nilai itu pasti ada di sebelah kanan `tengah`, jadi buang separuh kiri: `kiri = tengah + 1`.
5. Bila tidak, buang separuh kanan: `kanan = tengah - 1`.
6. Bila rentangnya habis (`kiri > kanan`), nilai itu tidak ada, jadi kembalikan −1.

Geser slider dan perhatikan array. Elemen di luar rentang `kiri..kanan` dipudarkan, dan judul array menulis rentangnya, misalnya `rentang kiri..kanan = 4..6`. Panah **tengah** menunjuk elemen yang sedang diperiksa, sementara panel evaluasi menulis ulang `data[tengah] < cari` menjadi `11 < 20` → `true`. Rentangnya menyusut dari 7 elemen menjadi 3, lalu 1, sehingga hanya butuh 3 perbandingan.

> **Coba sendiri:** ubah baris 11 menjadi `int cari = 13;`, nilai yang tidak ada di data. Geser slider sampai mendekati akhir: rentangnya terus menyempit sampai judul array menulis **rentang kosong** (`kiri = 4 > kanan = 3`), lalu output menjadi `Indeks 13: -1`. Nilai −1 adalah tanda "tidak ditemukan".

Pencarian biner hanya benar bila datanya terurut. Pada data acak, membuang separuh array bisa ikut membuang nilai yang dicari.

> **Coba sendiri:** ubah baris 9 menjadi `data[i] = (i * 37 + 11) % 50;` agar datanya acak. Pencarian biner kini gagal menemukan 33, padahal 33 ada di indeks 6: output `Indeks 33: -1`. Ubah `biner` menjadi `false`, maka pencarian linear tetap menemukannya.

## O(n) lawan O(log n)

Setiap perbandingan dalam pencarian biner membuang separuh rentang. Setelah k perbandingan, rentangnya tinggal sekitar n/2ᵏ elemen, dan pencarian pasti selesai saat rentangnya tinggal 1 elemen. Jadi banyaknya perbandingan paling banyak ⌊log₂ n⌋ + 1, atau **O(log n)**.

| n | Linear (terburuk) | Biner (terburuk) |
|---|---|---|
| 7 | 7 | 3 |
| 1.000 | 1.000 | 10 |
| 1.000.000 | 1.000.000 | 20 |

Tab **Pertumbuhan** menjalankan program untuk n = 8 sampai 256, masing-masing dengan `biner = true` dan `biner = false`, sehingga mengubah baris 6 tidak mengubah grafiknya. Garis linear naik 2× setiap kali n naik 2×, sedangkan garis biner hanya bertambah 1 dan tampak hampir datar di dasar grafik.

Kasus terbaik tidak selalu memihak pencarian biner.

> **Coba sendiri:** ubah baris 11 menjadi `int cari = data[0];`. Pencarian biner butuh 3 perbandingan, sedangkan pencarian linear hanya 1. Lihat juga tab Pertumbuhan: seri linear kini menjadi O(1), karena untuk n berapa pun elemen pertama langsung cocok.

Harga yang harus dibayar pencarian biner adalah data yang terurut. Mengurutkan data juga butuh waktu, dan cara-caranya menjadi topik beberapa pelajaran berikutnya. Bila data yang sama dicari berkali-kali, mengurutkannya sekali di awal jelas sepadan.

## Catatan #cari
Kita sengaja mencari elemen **terakhir**. Ini kasus terburuk bagi pencarian linear, yang harus melewati semua elemen.

## Catatan #tengah
`tengah` adalah indeks di tengah rentang `kiri..kanan`. Pembagian `int` membulatkan ke bawah: untuk rentang 4..7, misalnya, `(4 + 7) / 2` bernilai **5**, bukan 5,5.

## Catatan #buang
Karena data terurut, semua elemen di kiri `tengah` juga lebih kecil dari `cari`. Separuh rentang itu dibuang **sekaligus** hanya dengan menggeser `kiri`.
