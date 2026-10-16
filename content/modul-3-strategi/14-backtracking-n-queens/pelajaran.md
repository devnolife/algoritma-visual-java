---
judul: "Backtracking: N-Queens"
urutan: 14
ringkasan: Menaruh ratu catur baris demi baris, memeriksa apakah aman, lalu mundur untuk mencoba pilihan lain begitu menemui jalan buntu.
tujuan:
  - Menjelaskan pola backtracking, yaitu coba, periksa, lanjut, atau mundur
  - Memeriksa serangan ratu pada kolom dan dua diagonal memakai selisih baris
  - Membaca pohon panggilan sebagai pohon pencarian beserta cabang-cabangnya yang buntu
  - Mengubah pencarian solusi pertama menjadi penghitungan semua solusi
visual:
  - jenis: array2d
    variabel: papan
    gaya: papan
    baris: baris
    kolom: kol
  - jenis: pohonPanggilan
    method: letakkan
    tandaiBerulang: false
  - jenis: evaluasi
  - jenis: memori
pantau: [mundur]
batasLangkah: 40000
---

## Teka-teki delapan ratu

Ratu dalam catur menyerang ke segala arah: sepanjang baris, kolom, dan kedua diagonal, sejauh apa pun. Teka-teki **N-Queens** meminta kita menaruh `n` ratu di papan `n × n` sehingga tidak ada dua ratu yang saling menyerang. Versi klasiknya memakai papan catur 8 × 8 dan punya 92 solusi. Program ini memakai papan 4 × 4 agar setiap langkahnya bisa diikuti.

Cara *brute force* adalah mencoba semua susunan. Walaupun kita langsung membatasi satu ratu per baris, papan 8 × 8 masih punya 8⁸ = 16.777.216 susunan. **Backtracking** jauh lebih hemat: susunan dibangun sedikit demi sedikit, dan begitu ada ratu yang terancam, semua susunan lanjutan dari keadaan itu ditinggalkan tanpa dicoba.

## Coba, periksa, mundur

Method `letakkan(baris)` mengurus satu baris papan:

1. Bila `baris == n`, semua ratu sudah terpasang dan solusi ditemukan. Inilah **base case** di baris 18.
2. Coba kolom `kol` = 0, 1, 2, … satu per satu.
3. Tanyakan `aman(baris, kol)`: apakah petak itu diserang ratu di baris-baris atasnya?
4. Bila aman, taruh ratu (`papan[baris][kol] = 1`), lalu panggil `letakkan(baris + 1)` untuk baris berikutnya.
5. Bila panggilan itu mengembalikan `true`, solusi sudah lengkap dan kita ikut selesai.
6. Bila mengembalikan `false`, baris-baris di bawahnya buntu. Cabut ratunya (`papan[baris][kol] = 0`), lalu coba kolom berikutnya. Langkah mundur ini disebut **backtrack**.
7. Bila semua kolom gagal, kembalikan `false` agar baris di atasnya yang mundur.

Method `aman` cukup memeriksa baris-baris di atas, karena baris di bawahnya masih kosong. Untuk ratu di baris `i`, selisih barisnya `d = baris - i`. Ratu itu menyerang petak kita bila berada di kolom yang sama (`kol`), di diagonal kiri atas (`kol - d`), atau di diagonal kanan atas (`kol + d`). Pemeriksaan `kol - d >= 0` dan `kol + d < n` ditulis **sebelum** `&&` agar indeks di luar papan tidak pernah dibaca.

> **Coba sendiri:** hapus `kol - d >= 0 &&` di baris 34. Program berhenti dengan **ArrayIndexOutOfBoundsException** (`Index -1`), karena diagonal kiri atas petak di kolom 0 sudah berada di luar papan.

## Membaca papan dan pohon panggilan

- **Papan.** Ikon mahkota adalah ratu (nilai 1). Petak (`baris`, `kol`) yang sedang dicoba diberi bingkai, begitu pula petak yang sedang dibaca oleh `aman`. Petak yang baru ditulis berwarna hijau.
- **Pohon panggilan.** Letaknya di bawah papan, jadi gulir panggung bila belum terlihat. Setiap kotak adalah satu panggilan `letakkan`, yaitu satu baris papan. `↩ false` berarti cabang itu buntu dan memicu backtrack, sedangkan jalur yang disorot adalah panggilan yang masih berjalan. Pohon ini disebut **pohon pencarian**. Susunan yang ditolak `aman` tidak pernah menjadi kotak baru: cabangnya sudah **dipangkas** sebelum dicoba.
- **Argumen sama, keadaan berbeda.** `letakkan(2)` muncul tiga kali di pohon, tetapi ini **bukan** perhitungan ulang seperti pada Fibonacci: isi papannya berbeda setiap kali. Karena hasil `letakkan(2)` bergantung pada ratu yang sudah ada di papan, hasilnya juga tidak bisa disimpan lalu dipakai ulang seperti memoisasi.
- **Tanda hijau di slider** muncul setiap kali `mundur` bertambah, yaitu setiap kali ratu dicabut kembali. Program ini mundur 4 kali sebelum menemukan solusi dengan ratu di kolom 1, 3, 0, dan 2.

> **Coba sendiri:** lompat ke tanda hijau pertama di slider. Ratu di baris papan 1 baru saja dicabut karena semua petak di baris papan 2 diserang. Lalu hapus baris 23 di editor (`papan[baris][kol] = 0;`). Ratu yang seharusnya dicabut kini tertinggal di papan dan menghalangi petak lain, sehingga program menyerah tanpa mencetak papan: outputnya hanya `Ratu dicabut kembali: 7 kali`.

> **Coba sendiri:** ubah `n = 4` di baris 4 menjadi `n = 3`. Papan 3 × 3 tidak punya solusi: semua kotak di pohon panggilan berakhir `↩ false` dan papan tidak dicetak. Lalu coba `n = 8` dan tekan tombol **Ke langkah terakhir**. Solusi delapan ratu ditemukan setelah sekitar 19.000 langkah dan 105 kali mundur.

## Seberapa cepat?

Dalam kasus terburuk, backtracking tetap eksponensial. Baris pertama punya `n` pilihan, baris kedua paling banyak `n - 1`, dan seterusnya, sehingga batas atasnya sekitar **O(n!)**. Namun pemangkasan oleh `aman` membuat susunan yang benar-benar dicoba jauh lebih sedikit. Untuk papan 4 × 4, `letakkan` hanya dipanggil 9 kali dan `aman` 26 kali, padahal brute force satu ratu per baris punya 4⁴ = 256 susunan. Untuk papan 8 × 8, solusi pertama ditemukan setelah 114 panggilan `letakkan`, sangat jauh dari 16 juta susunan.

Pola coba–periksa–mundur yang sama dipakai untuk mengisi Sudoku, mencari jalan keluar labirin, dan menyusun jadwal kuliah tanpa bentrok.

## Catatan #selesai
**Base case**: sampai di baris ke-`n` berarti baris 0 sampai `n - 1` sudah berisi ratu yang semuanya aman, jadi solusinya lengkap.

## Catatan #coba
Petak ini aman, jadi ratu **dicoba** di sini, lalu pencarian berlanjut ke baris berikutnya lewat rekursi.

## Catatan #mundur
**Backtrack**: semua lanjutan dari petak ini buntu, jadi ratunya dicabut agar papan kembali seperti sebelum dicoba, lalu kolom berikutnya diperiksa.
