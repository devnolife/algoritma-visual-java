---
judul: Analisis algoritma & Big-O
urutan: 1
ringkasan: Mengukur efisiensi algoritma dengan menghitung operasi dasarnya, lalu meringkas laju pertumbuhannya dengan notasi Big-O.
tujuan:
  - Menghitung banyaknya operasi dasar sebuah program sebagai fungsi dari ukuran data n
  - Membedakan kasus terbaik dan kasus terburuk sebuah algoritma
  - Meringkas hitungan operasi menjadi notasi Big-O, misalnya O(n) dan O(n²)
  - Membaca tab Pertumbuhan untuk mengenali pola perulangan tunggal dan perulangan bersarang
visual:
  - jenis: array
    variabel: nilai
    penunjuk: [i, j]
  - jenis: evaluasi
  - jenis: memori
pantau: [operasi]
pertumbuhan:
  variabel: n
  nilai: [6, 12, 24, 48, 96]
  ukur: operasi
  acuan: [n]
---

## Mengukur tanpa stopwatch

Dua program bisa sama-sama benar, tetapi yang satu selesai seketika sementara yang lain butuh berjam-jam ketika datanya membesar. Waktu dalam detik sulit dijadikan patokan, karena bergantung pada laptop, bahasa pemrograman, dan program lain yang sedang berjalan. Karena itu kita menghitung **operasi dasar**, yaitu pekerjaan inti yang diulang-ulang (satu perbandingan, satu penjumlahan), sebagai fungsi dari **ukuran data n**. Hitungan ini disebut **kompleksitas waktu** dan ditulis T(n).

Program di editor menyimpan nilai ujian n = 6 mahasiswa, lalu mengerjakan dua tugas:

1. **Bagian 1** menjumlahkan semua nilai dengan satu perulangan.
2. **Bagian 2** memeriksa apakah ada dua nilai yang **kembar** dengan perulangan bersarang: setiap `nilai[i]` dibandingkan dengan semua nilai sesudahnya, `nilai[j]`.

Variabel `operasi` berperan sebagai stopwatch. Nilainya dinaikkan tepat sekali setiap kali operasi inti dikerjakan: di baris 14 untuk satu penjumlahan dan di baris 22 untuk satu perbandingan.

## Menghitung operasinya

Geser slider dan amati:
- Panah **i** dan **j** di bawah array menunjuk dua nilai yang sedang dibandingkan. Panel evaluasi menulis ulang `nilai[i] == nilai[j]` menjadi, misalnya, `11 == 48` → `false`.
- Tanda hijau di slider menandai langkah-langkah saat `operasi` berubah, jadi kamu bisa melompat dari satu operasi ke operasi berikutnya.

Bagian 1 selalu berjalan n kali. Di bagian 2, perulangan dalam berjalan 5 kali saat i = 0, 4 kali saat i = 1, dan seterusnya:

```text
bagian 1: n
bagian 2: (n − 1) + (n − 2) + … + 1 = n(n − 1)/2
T(n) = n + n(n − 1)/2
T(6) = 6 + 15 = 21
```

Itulah angka `Operasi: 21` di output. Baris 8 sengaja membuat dua nilai terakhir kembar, sehingga kembarnya baru ditemukan pada perbandingan paling akhir.

> **Coba sendiri:** ubah baris 3 menjadi `int n = 12;`. Menurut rumus, T(12) = 12 + 66 = 78; cocokkan dengan output. Ukuran data naik 2×, tetapi operasinya naik hampir 4×.

## Notasi Big-O

Untuk n yang besar, yang menentukan hanyalah suku yang **tumbuh paling cepat**. T(n) = n + n(n − 1)/2 = ½n² + ½n. Saat n = 1000, suku ½n² bernilai 500.000, sedangkan ½n hanya 500. Notasi **Big-O** meringkas T(n) dengan dua aturan:

1. Ambil suku yang tumbuh paling cepat: ½n² + ½n menjadi ½n².
2. Buang konstanta pengalinya: ½n² menjadi n².

Jadi program ini berkompleksitas **O(n²)**, sedangkan bagian 1 sendirian hanya O(n). Kelas-kelas yang akan sering kamu temui di modul ini:

| Big-O | Nama | Contoh | Bila n naik 2×, operasinya… |
|---|---|---|---|
| O(1) | konstan | 1 + 2 + … + n dengan rumus n(n + 1)/2 | tetap |
| O(log n) | logaritmik | pencarian biner | bertambah 1 |
| O(n) | linear | satu perulangan sepanjang data | naik 2× |
| O(n log n) | linearitmik | merge sort | naik sedikit di atas 2× |
| O(n²) | kuadratik | dua perulangan bersarang | naik 4× |
| O(n³) | kubik | tiga perulangan bersarang | naik 8× |
| O(2ⁿ) | eksponensial | Fibonacci rekursif naif | dikuadratkan |

## Membaca tab Pertumbuhan

Buka tab **Pertumbuhan** di bawah editor. Program dijalankan ulang secara otomatis untuk n = 6, 12, 24, 48, dan 96 (nilai awal `int n = 6;` diganti), lalu nilai akhir `operasi` dari setiap run digambar terhadap n.

- **Garis biru bertitik** adalah hasil pengukuran. Titik pertamanya (n = 6) adalah program yang sedang kamu lihat, yaitu 21 operasi.
- **Garis putus-putus** adalah kurva acuan seperti O(n) dan O(n²), yang diskalakan agar melewati titik terakhir. Kurva yang paling berimpit dengan garis biru menunjukkan kelasnya.
- **Kalimat di sampingnya** membandingkan dua ukuran terbesar: "Saat n naik dari 48 ke 96 (2×), nilai `operasi` naik 4×. Pola ini paling mirip O(n²)." Kelas yang sama tertulis di label tab.
- Tombol **Perbesar & tabel** menampilkan grafik besar beserta tabel angkanya, lengkap dengan kelipatan kenaikan dari baris ke baris.

Grafik dihitung ulang setiap kali kode diedit. Bila program gagal pada suatu ukuran n, misalnya karena menabrak batas langkah, titiknya diganti tanda **×** merah. Pada beberapa pelajaran berikutnya, grafik memuat dua atau tiga **seri** sekaligus, misalnya data acak dan data terurut. Setiap seri punya warna dan kesimpulannya sendiri, sedangkan label tab mengikuti seri pertama.

> **Coba sendiri:** hapus baris 22 (`operasi++` di perulangan dalam). Perulangan bersarang tetap berjalan, tetapi tidak lagi dihitung, sehingga label tab berubah menjadi O(n). Grafik hanya sejujur penghitungnya, jadi letakkan penghitung tepat di operasi inti.

## Kasus terbaik dan terburuk

Bagian 2 berhenti begitu menemukan kembar (`break` di baris 25). Akibatnya, banyaknya perbandingan bergantung pada **isi** data, bukan hanya ukurannya:

- **Kasus terbaik** (*best case*): kembarnya ada di `nilai[0]` dan `nilai[1]`, sehingga langsung ketemu pada perbandingan pertama. Bagian 2 hanya butuh 1 operasi.
- **Kasus terburuk** (*worst case*): kembarnya baru ketemu di pasangan terakhir, atau tidak ada kembar sama sekali. Semua n(n − 1)/2 pasangan diperiksa.

Analisis algoritma biasanya memakai kasus terburuk, karena kasus terburuk memberi **jaminan**: sejelek apa pun datanya, program tidak akan lebih lambat dari itu. Program di editor sedang berada di kasus terburuknya.

> **Coba sendiri:** ganti baris 8 menjadi `nilai[1] = nilai[0];`. Output berubah menjadi `Operasi: 7` (6 dari bagian 1, 1 dari bagian 2), dan perulangan bersarang berhenti setelah satu perbandingan. Tab Pertumbuhan ikut berubah dari O(n²) menjadi O(n): untuk n berapa pun, bagian 2 kini hanya butuh 1 operasi, sehingga yang tersisa hanya pertumbuhan bagian 1.

## Catatan #kembar
Baris ini sengaja membuat dua nilai **terakhir** kembar, sehingga bagian 2 baru menemukannya pada perbandingan paling akhir. Inilah **kasus terburuk**.

## Catatan #hitung
`operasi` naik tepat sekali untuk setiap penjumlahan. Perulangan ini berjalan `n` kali, jadi bagian 1 menyumbang **n operasi**.

## Catatan #dalam
Perulangan dalam dimulai dari `j = i + 1`, sehingga setiap pasangan hanya diperiksa **sekali**. Untuk `i = 0` ada 5 perbandingan, untuk `i = 1` ada 4, dan seterusnya sampai 1.
