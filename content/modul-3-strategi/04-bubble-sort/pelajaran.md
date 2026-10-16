---
judul: Bubble sort
urutan: 4
ringkasan: Mengurutkan array dengan berulang kali menukar dua elemen bersebelahan yang urutannya terbalik, sehingga elemen terbesar menggelembung ke ujung kanan.
tujuan:
  - Menelusuri bubble sort putaran demi putaran beserta pertukaran elemen bersebelahan
  - Menukar dua elemen array dengan bantuan variabel sementara
  - Menjelaskan mengapa setiap putaran boleh berhenti satu indeks lebih awal
  - Menganalisis kasus terbaik dan terburuk bubble sort, termasuk gagasan berhenti dini
visual:
  - jenis: array
    variabel: data
    gaya: batang
    penunjuk: [j, batas]
  - jenis: evaluasi
  - jenis: memori
pantau: [sementara]
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

## Menggelembungkan yang terbesar

Bayangkan kamu mengatur barisan teman dari yang terpendek sampai yang tertinggi, tetapi hanya boleh menukar dua orang yang **bersebelahan**. Berjalanlah dari kiri ke kanan: setiap kali orang di kiri lebih tinggi daripada orang di kanannya, tukar mereka. Setelah satu kali jalan, orang tertinggi pasti sudah sampai di ujung kanan, seperti gelembung udara yang naik ke permukaan air. Ulangi untuk sisa barisan, dan semuanya akan berurutan.

Inilah **bubble sort**, algoritma pengurutan paling sederhana. Satu kali jalan dari kiri ke kanan disebut satu **putaran** (*pass*).

## Algoritmanya

1. Ulangi untuk `putaran` = 0, 1, …, n − 2.
2. Di setiap putaran, hitung `batas = n - 1 - putaran`, lalu telusuri `j` dari 0 sampai `batas - 1`.
3. Bandingkan `data[j]` dengan tetangganya, `data[j + 1]`.
4. Bila `data[j] > data[j + 1]`, **tukar** keduanya.

Setelah putaran pertama, elemen terbesar sudah berada di posisi terakhir. Setelah putaran kedua, dua elemen terbesar sudah di tempatnya, dan seterusnya. Itulah sebabnya `batas` di baris 17 mundur satu setiap putaran: elemen di ujung kanan tidak perlu dibandingkan lagi.

Menukar dua elemen butuh variabel penampung `sementara` (baris 21–23). Tanpa penampung, nilai lama `data[j]` sudah tertimpa sebelum sempat dipindahkan.

> **Coba sendiri:** hapus baris 21 (`int sementara = data[j];`), lalu ganti `data[j + 1] = sementara;` menjadi `data[j + 1] = data[j];`. Output menjadi `[10, 10, 10, 10, 10, 34, 34]`. Setiap "pertukaran" kini hanya menyalin nilai yang lebih kecil, sehingga nilai yang lebih besar hilang.

## Membaca visualnya

Setiap elemen digambar sebagai batang setinggi nilainya. Panah **j** menunjuk elemen kiri dari pasangan yang sedang dibandingkan, sedangkan panah **batas** menunjuk posisi yang akan diisi elemen terbesar pada putaran ini. Saat kondisi `if` dicek, kedua batang yang dibandingkan berwarna oranye dan panel evaluasi menulis ulang kondisinya, misalnya `data[j] > data[j + 1]` → `49 > 36` → `true`. Batang yang baru saja ditulis berwarna hijau. Tanda hijau di slider menandai setiap kali `sementara` dibuat, yaitu setiap pertukaran; untuk data ini ada 11 pertukaran.

Ikuti batang tertinggi (49): sepanjang putaran pertama ia terus ditukar ke kanan sampai indeks 6, lalu tidak pernah disentuh lagi.

> **Coba sendiri:** ubah baris 17 menjadi `int batas = n - 1;`. Hasilnya tetap terurut, tetapi perbandingannya naik dari 21 menjadi 36, karena setiap putaran membandingkan ulang batang-batang di ujung kanan yang sudah pasti di tempatnya.

## Analisis: kasus terbaik dan terburuk

Banyaknya perbandingan selalu (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, sehingga bubble sort berkompleksitas **O(n²)**. Banyaknya pertukaran bergantung pada data: 0 untuk data yang sudah terurut, dan n(n − 1)/2 untuk data yang terurut terbalik.

> **Coba sendiri:** ubah baris 6 menjadi `boolean terurut = true;`. Tidak ada satu pun pertukaran (tidak ada tanda hijau di slider), tetapi output tetap `Perbandingan: 21`.

Tab **Pertumbuhan** memperlihatkan pemborosan itu. Program dijalankan untuk n = 8 sampai 128 dengan dua seri, data acak dan data terurut. Keduanya sama-sama O(n²), sehingga garis oranye (data terurut) tepat menimpa garis biru (data acak).

Perbaikannya sederhana. Bila satu putaran penuh berlalu tanpa satu pertukaran pun, setiap pasangan bersebelahan sudah berurutan; artinya array sudah terurut dan putaran berikutnya tidak perlu dijalankan. Untuk mengetahuinya, pakai sebuah **flag** (variabel penanda) bertipe `boolean` yang mencatat apakah ada pertukaran selama satu putaran. Dengan **berhenti dini** ini, kasus terbaik (data terurut) cukup satu putaran: n − 1 perbandingan, atau O(n). Kasus terburuknya tetap O(n²). Menuliskan versi berhenti dini adalah tantangan kedua pelajaran ini; setelah berhasil, seri data terurut di tab Pertumbuhan akan turun menjadi O(n).

## Catatan #batas
`batas` adalah indeks terakhir yang masih perlu disentuh pada putaran ini. Setelah `putaran` kali putaran, sebanyak `putaran` elemen terbesar sudah berada di ujung kanan, jadi `batas` **mundur satu** setiap putaran.

## Catatan #banding
Hanya dua elemen **bersebelahan** yang dibandingkan. Bila yang kiri lebih besar, urutannya terbalik dan keduanya ditukar.

## Catatan #tukar
Nilai `data[j]` diamankan dulu di `sementara`, karena baris berikutnya akan **menimpanya**.
