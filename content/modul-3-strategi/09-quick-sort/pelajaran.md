---
judul: Quick sort
urutan: 9
ringkasan: Memilih pivot, mempartisi data menjadi bagian yang lebih kecil dan lebih besar, lalu mengurutkan kedua bagian secara rekursif.
tujuan:
  - Menjelaskan peran pivot dan cara kerja partisi Lomuto
  - Menelusuri rekursi quick sort lewat rentang kiri..kanan dan pohon panggilan
  - Membedakan kasus rata-rata O(n log n) dan kasus terburuk O(n²) pada data terurut
  - Memilih pivot yang lebih aman agar data terurut tidak lagi menjadi kasus terburuk
visual:
  - jenis: array
    variabel: data
    gaya: batang
    penunjuk: [i, j, kanan]
    rentang: [kiri, kanan]
  - jenis: evaluasi
  - jenis: pohonPanggilan
    method: quickSort
  - jenis: memori
pantau: [pivot]
pertumbuhan:
  variabel: n
  nilai: [8, 16, 32, 64, 128]
  ukur: perbandingan
  seri:
    - nama: data acak
      ganti: { terurut: false }
    - nama: data terurut
      ganti: { terurut: true }
---

## Pilih patokan, bagi dua

Bayangkan kamu menyusun setumpuk kertas ujian menurut nilainya. Ambil satu kertas, misalnya yang bernilai 34, sebagai patokan. Kertas lain kamu bagi ke dua tumpukan: nilai ≤ 34 di kiri, nilai yang lebih besar di kanan. Kertas patokan kini pasti berada di tempat yang benar, yaitu di antara kedua tumpukan. Sisanya tinggal menyusun tumpukan kiri dan tumpukan kanan dengan cara yang sama.

Itulah **quick sort**, algoritma *divide and conquer* rancangan Tony Hoare (1959). Kertas patokan disebut **pivot**, dan proses membagi tumpukan disebut **partisi**. Merge sort membagi data dengan mudah, lalu bekerja keras saat menggabungkan. Quick sort sebaliknya: kerja kerasnya ada di partisi, sehingga tidak perlu langkah penggabungan sama sekali. Semua pertukaran juga terjadi di dalam array yang sama, tanpa array bantu.

## Partisi Lomuto

Method `partisi(data, kiri, kanan)` di editor memakai **partisi Lomuto** untuk rentang indeks `kiri` sampai `kanan`:

1. Ambil elemen paling kanan sebagai pivot: `pivot = data[kanan]` (baris 26).
2. Mulai dengan `i = kiri`. Selama partisi berjalan, semua elemen di sebelah kiri `i` sudah ≤ pivot.
3. Telusuri `j` dari `kiri` sampai `kanan - 1`. Setiap kali `data[j] <= pivot` (baris 30), tukar `data[j]` ke posisi `i`, lalu majukan `i`.
4. Setelah penelusuran selesai, tukar pivot ke posisi `i` (baris 35). Pivot kini berada di **posisi akhirnya**, dan `partisi` mengembalikan posisi itu.

`quickSort` lalu memanggil dirinya sendiri dua kali: untuk bagian kiri (`kiri` sampai `p - 1`) dan bagian kanan (`p + 1` sampai `kanan`). **Base case**-nya ada di baris 19: rentang yang berisi paling banyak satu elemen sudah pasti terurut.

Variabel `perbandingan` (baris 29) menghitung berapa kali dua elemen dibandingkan. Angka inilah yang dipakai untuk mengukur kecepatan quick sort.

## Membaca visualnya

- **Batang pudar** berada di luar rentang `kiri` sampai `kanan` milik pemanggilan yang sedang berjalan. Garis di bawah indeks menandai rentang itu, dan judul array menuliskan nilainya.
- **Penunjuk** `kanan` menandai pivot, `j` menandai elemen yang sedang diperiksa, dan `i` menandai tempat elemen kecil berikutnya akan ditaruh.
- **Pohon panggilan** menggambar setiap pemanggilan `quickSort` sebagai satu simpul. Dua angka di dalamnya adalah `kiri` dan `kanan`, sedangkan `[…]` adalah array `data` yang sama. Simpul seperti `quickSort([…], 6, 5)` adalah rentang kosong yang langsung berhenti di base case.
- **Tanda hijau di slider** muncul setiap kali `pivot` baru dipilih. Lompatlah dari tanda ke tanda untuk melihat partisi satu per satu.

> **Coba sendiri:** ubah `boolean terurut = false;` di baris 8 menjadi `true`, sehingga datanya 1, 2, …, 7. Setiap pivot kini elemen terbesar di rentangnya: bagian kanan selalu kosong dan bagian kiri hanya berkurang satu elemen. Pohon panggilan berubah menjadi tangga yang dalam, dan output menjadi `Perbandingan: 21`, yaitu 7 × 6 / 2, hampir dua kali lipat data acak (12).

## Kasus terbaik dan terburuk

Partisi atas rentang berisi m elemen membutuhkan m − 1 perbandingan. Total biayanya bergantung pada **seberapa seimbang** pivot membagi rentang:

- **Kasus terbaik dan rata-rata.** Pivot membagi rentang kira-kira sama besar. Rekursi hanya sedalam sekitar log₂ n tingkat, dan setiap tingkat memeriksa paling banyak n elemen, sehingga totalnya **O(n log n)**.
- **Kasus terburuk.** Pivot selalu elemen terbesar atau terkecil, misalnya pada data yang sudah terurut. Setiap partisi hanya menyisihkan satu elemen, sehingga perbandingannya (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, yaitu **O(n²)**. Kedalaman rekursinya pun mencapai n tingkat.

Buka tab **Pertumbuhan**. Program dijalankan ulang untuk n = 8 sampai 128, dan nilai akhir `perbandingan` digambar untuk dua seri. Seri data acak tumbuh seperti O(n log n), sedangkan seri data terurut naik sekitar 4× setiap kali n menjadi dua kali lipat, ciri khas O(n²). Pada n = 128, data terurut membutuhkan 8.128 perbandingan, sekitar sembilan kali lipat data acak (896). Ukuran n berhenti di 128 karena kasus terburuk menumpuk sekitar n frame `quickSort`, sedangkan simulator membatasi kedalaman pemanggilan sampai 200.

> **Coba sendiri:** di baris 11, ganti `(k * 37 + 11) % 50 + 1` dengan `n - k`, sehingga seri "data acak" kini berisi data terurut **menurun**. Grafik dihitung ulang, dan kedua seri sekarang tumbuh O(n²): bagi pivot paling kanan, data yang terurut terbalik juga kasus terburuk.

Walaupun kasus terburuknya O(n²), quick sort dengan pemilihan pivot yang baik termasuk pengurutan tercepat dalam praktik. Versi yang disempurnakan dipakai oleh `Arrays.sort` untuk array bilangan. Kuncinya ada di pemilihan pivot, dan itulah tantanganmu berikutnya.

## Catatan #dasar

Rentang berisi **0 atau 1 elemen** sudah pasti terurut, jadi method langsung kembali. Panggilan dengan `kiri > kanan`, misalnya `quickSort([…], 6, 5)`, adalah rentang kosong yang juga berhenti di sini.

## Catatan #pivot

Pivot diambil dari elemen **paling kanan** rentang. Pilihan ini sederhana dan baik untuk data acak, tetapi menjadi kasus terburuk bila data sudah terurut.

## Catatan #taruh

Sekarang semua elemen di indeks `kiri` sampai `i - 1` bernilai ≤ pivot, sedangkan `i` sampai `kanan - 1` bernilai > pivot. Menukar pivot ke indeks `i` menaruhnya di **posisi akhirnya**; posisi ini tidak akan berubah lagi.
