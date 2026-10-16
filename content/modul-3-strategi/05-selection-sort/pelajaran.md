---
judul: Selection sort
urutan: 5
ringkasan: Mengurutkan dengan berulang kali memilih elemen terkecil dari bagian yang belum terurut, lalu menukarnya ke depan.
tujuan:
  - Menjelaskan ide selection sort, yaitu memilih minimum lalu menukarnya ke awal bagian yang belum terurut
  - Menelusuri peran i, j, dan idxMin dalam setiap putaran
  - Menghitung jumlah perbandingan n(n − 1)/2 dan menjelaskan mengapa selection sort selalu O(n²)
  - Membandingkan banyaknya pertukaran selection sort dengan bubble sort
visual:
  - jenis: array
    variabel: data
    gaya: batang
    penunjuk: [i, j, idxMin]
  - jenis: evaluasi
  - jenis: memori
pantau: [idxMin]
pertumbuhan:
  variabel: n
  nilai: [8, 16, 32, 64, 128]
  ukur: perbandingan
  seri:
    - nama: data acak
    - nama: data terurut
      ganti: { terurut: true }
  acuan: [n, n^2]
---

## Pilih yang terkecil lebih dulu

Bayangkan kamu menata kartu remi bernomor di atas meja dari yang terkecil. Cara yang paling alami: cari kartu terkecil di antara semua kartu, lalu tukar tempatnya dengan kartu paling kiri. Setelah itu cari kartu terkecil di antara kartu sisanya, lalu tukar ke posisi kedua. Begitu seterusnya sampai habis.

Itulah **selection sort**: dalam setiap **putaran**, pilih (*select*) elemen terkecil dari bagian yang belum terurut. Selama proses berjalan, array terbagi dua:

- **Bagian terurut** di kiri, yaitu indeks `0` sampai `i - 1`. Isinya sudah berada di tempat akhirnya dan tidak akan disentuh lagi.
- **Bagian belum terurut** di kanan, yaitu indeks `i` sampai `n - 1`.

Setiap putaran memindahkan tepat satu elemen dari bagian kanan ke ujung bagian kiri.

## Langkah-langkahnya

Untuk setiap posisi `i` dari 0 sampai `n - 2`:

1. Anggap elemen di posisi `i` sebagai yang terkecil: `idxMin = i`.
2. Periksa semua elemen sesudahnya dengan `j` dari `i + 1` sampai `n - 1`. Jika `data[j] < data[idxMin]`, catat posisinya: `idxMin = j`.
3. **Tukar** (*swap*) `data[i]` dengan `data[idxMin]`, dengan bantuan variabel `sementara`.

Posisi terakhir tidak perlu diproses. Setelah `n - 1` putaran, elemen yang tersisa di ujung kanan pasti yang terbesar.

Data di editor dibangkitkan dari `n` dengan rumus `(k * 37 + 11) % 50 + 1`. Hasilnya tampak acak, tetapi selalu sama setiap kali program dijalankan: `[12, 49, 36, 23, 10, 47, 34]`.

## Membaca visualnya

Geser slider dan perhatikan tiga panah di bawah batang:

- `i` adalah posisi yang sedang diisi. Batang di kiri `i` sudah berada di tempat akhirnya.
- `j` adalah elemen yang sedang dibandingkan. Panel evaluasi menampilkan perbandingannya, misalnya `36 < 49` lalu `true`.
- `idxMin` adalah posisi calon minimum sejauh ini. Tanda hijau di slider menandai langkah saat `idxMin` dibuat atau berpindah.

Di akhir setiap putaran, baris 20–22 menukar dua batang. Pertukaran terjadi **sekali per putaran**, berbeda dengan bubble sort yang bisa menukar berkali-kali dalam satu putaran.

> **Coba sendiri:** hapus baris 17 (`idxMin = j;`), lalu geser slider. `idxMin` tidak pernah berpindah dari `i`, sehingga setiap pertukaran hanya menukar `data[i]` dengan dirinya sendiri. Batang tidak pernah berpindah dan output mencetak array dalam urutan semula.

## Selalu n(n − 1)/2 perbandingan

Putaran pertama membandingkan `n - 1` elemen, putaran kedua `n - 2` elemen, dan seterusnya sampai 1 elemen pada putaran terakhir:

```text
(n − 1) + (n − 2) + … + 1
= n(n − 1) / 2
```

Untuk n = 7 hasilnya 21, sesuai output `Perbandingan: 21`. Rumus ini tidak bergantung pada isi array, jadi **kasus terbaik** dan **kasus terburuk** selection sort sama-sama O(n²). Pertukarannya paling banyak `n - 1` kali, jadi hanya O(n). Itulah kelebihan selection sort dibanding bubble sort, yang pada kasus terburuk menukar sebanyak n(n − 1)/2 kali.

> **Coba sendiri:** ganti `boolean terurut = false;` menjadi `true`, sehingga data awalnya sudah urut 1, 2, …, 7. Geser slider: `j` tetap menyusuri seluruh bagian kanan, `idxMin` tidak pernah berpindah, dan output tetap `Perbandingan: 21`. Selection sort tidak bisa "menyadari" bahwa datanya sudah urut.

Buka tab **Pertumbuhan**. Program dijalankan ulang untuk n = 8 sampai 128, sekali dengan data acak dan sekali dengan data terurut. Kedua garisnya berimpit karena jumlah perbandingannya persis sama. Setiap kali n menjadi dua kali lipat, perbandingan naik sekitar 4 kali, ciri khas O(n²).

> **Coba sendiri:** ubah `int n = 7;` menjadi `int n = 4;`, lalu menjadi `int n = 16;`. Output-nya `Perbandingan: 6` dan `Perbandingan: 120`, cocok dengan rumus n(n − 1)/2. Pada n = 16 batangnya juga lebih banyak, dan slider menjadi jauh lebih panjang.

## Catatan #anggap
Setiap putaran dimulai dengan **menganggap** `data[i]` sebagai yang terkecil. Yang disimpan adalah **indeks**-nya, bukan nilainya, karena nanti kita perlu tahu posisi mana yang harus ditukar.

## Catatan #banding
`j` menyusuri seluruh bagian yang belum terurut. Bila `data[j]` lebih kecil dari calon minimum `data[idxMin]`, posisi calon minimum pindah ke `j`.

## Catatan #tukar
Minimum putaran ini sudah ditemukan, sekarang tukar dengan `data[i]`. Variabel `sementara` menyimpan `data[i]` agar nilainya tidak hilang saat ditimpa. Bagian ini dijalankan **sekali per putaran**.
