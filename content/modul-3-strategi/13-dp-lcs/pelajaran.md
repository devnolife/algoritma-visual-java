---
judul: "DP: Longest Common Subsequence"
urutan: 13
ringkasan: Mengukur kemiripan dua kata dengan mengisi tabel huruf × huruf memakai rumus rekurens LCS.
tujuan:
  - Membedakan subsequence (boleh melompati huruf) dan substring (harus bersambung)
  - Menjelaskan arti sel dp[i][j] dan dua kasus rumus rekurens LCS
  - Mengisi tabel DP baris demi baris dan membaca jawabannya di pojok kanan bawah
  - Menelusuri tabel mundur untuk menyusun string LCS-nya
visual:
  - jenis: array2d
    variabel: dp
    gaya: tabel
    baris: i
    kolom: j
    labelBaris: a
    labelKolom: b
  - jenis: evaluasi
  - jenis: memori
pantau: [i]
---

## Seberapa mirip dua kata?

Pemeriksa ejaan yang menyarankan kata yang mirip, perintah `git diff` yang menandai baris yang berubah, pendeteksi plagiarisme, sampai ahli biologi yang membandingkan dua untai DNA: semuanya perlu mengukur **seberapa mirip** dua deret huruf. Salah satu ukurannya adalah **LCS** (*longest common subsequence*), yaitu subsequence bersama yang terpanjang.

**Subsequence** sebuah kata didapat dengan menghapus nol atau lebih hurufnya tanpa mengubah urutan huruf yang tersisa. Dari `KUCING`, misalnya, kita bisa mendapat `KUNG`, `CIG`, atau `KUING`. Berbeda dengan **substring**, huruf-huruf subsequence tidak harus bersebelahan. `KUCING` dan `KUNING` punya LCS `KUING` yang panjangnya 5, jadi keduanya sangat mirip.

Program di editor membandingkan `IKAN` dan `KAIN`. Keduanya tersusun dari empat huruf yang sama, tetapi urutannya berbeda, sehingga LCS-nya hanya `KAN` (3 huruf). Substring bersama terpanjangnya bahkan hanya `KA`.

Cara *brute force*-nya adalah membuat semua subsequence `a`, lalu memeriksa satu per satu apakah juga subsequence `b`. Kata 4 huruf punya 2⁴ = 16 cara memilih huruf, tetapi kata 30 huruf sudah punya lebih dari satu miliar. Dynamic programming menyelesaikannya cukup dengan mengisi satu tabel.

## Tabel huruf × huruf

Kuncinya adalah memecah masalah menjadi submasalah yang lebih kecil. Sel `dp[i][j]` menyimpan **panjang LCS dari `i` huruf pertama `a` dan `j` huruf pertama `b`**. Contohnya, `dp[2][3]` adalah panjang LCS dari `IK` dan `KAI`, yaitu 1.

Tabelnya berukuran `(m + 1) × (n + 1)`. Baris 0 dan kolom 0 tabel mewakili string kosong. LCS dengan string kosong pasti 0, jadi inilah **kasus dasar** (*base case*). Sel lain diisi dengan **rumus rekurens** yang melihat huruf terakhir kedua awalan, yaitu `a.charAt(i - 1)` dan `b.charAt(j - 1)`:

1. **Hurufnya sama.** Huruf itu bisa menjadi huruf terakhir LCS. Ambil LCS tanpa kedua huruf itu, lalu tambah satu: `dp[i][j] = dp[i - 1][j - 1] + 1`. Sel yang dibaca adalah sel **diagonal** kiri atas.
2. **Hurufnya beda.** Paling tidak satu dari kedua huruf itu tidak terpakai. Coba buang huruf terakhir `a` (sel **atas**, `dp[i - 1][j]`) atau huruf terakhir `b` (sel **kiri**, `dp[i][j - 1]`), lalu ambil yang lebih panjang dengan `Math.max`.

Setiap sel hanya bergantung pada tiga tetangga di atas dan di kirinya, sehingga tabel bisa diisi baris demi baris mulai dari kiri atas. Inilah **tabulasi** (*bottom-up*) yang sudah kamu kenal di pelajaran DP: Fibonacci. Jawaban akhirnya ada di pojok kanan bawah, `dp[m][n]`, yang dicetak di baris 17.

Mengapa `i - 1`? Baris tabel ke-`i` mewakili `i` huruf pertama, jadi huruf terakhirnya berada di indeks `i - 1` karena indeks String dimulai dari 0. Baris tabel ke-0 sudah terpakai untuk string kosong.

> **Coba sendiri:** ubah kondisi di baris 10 menjadi `a.charAt(i) == b.charAt(j)`. Program berhenti dengan **StringIndexOutOfBoundsException** saat `j` bernilai 4, karena `KAIN` hanya punya indeks 0 sampai 3.

## Membaca visualnya

- **Label tabel.** Huruf di kiri adalah huruf-huruf `a` (`I K A N`), huruf di atas adalah huruf-huruf `b` (`K A I N`). Tanda `∅` menandai baris dan kolom string kosong.
- **Penunjuk.** Label `i` dan `j` menandai sel yang sedang diisi.
- **Panah.** Saat sebuah sel ditulis (hijau), panah menunjukkan sel yang dibaca untuk menghitungnya: satu panah dari diagonal bila hurufnya sama, dua panah dari atas dan kiri bila hurufnya beda.
- **Evaluasi.** Panel evaluasi menampilkan huruf yang dibandingkan, misalnya `'I' == 'K'` menjadi `false`.
- **Tanda hijau di slider** muncul setiap kali `i` berubah, yaitu setiap kali pengisian pindah ke baris tabel berikutnya.

Lompat ke baris tabel `A` (`i = 3`). Sel `dp[3][2]` bernilai 2 karena `A` cocok dengan `A`, sehingga LCS `K` dari sel diagonal diperpanjang menjadi `KA`. Di baris tabel terakhir, `N` cocok dengan `N`, sehingga `dp[4][4] = dp[3][3] + 1 = 3`, yaitu `KAN`. Perhatikan juga baris tabel `I`: huruf `I` sempat cocok di kolom 3, tetapi angka 1 itu kalah oleh rangkaian `K`, `A`, `N`.

> **Coba sendiri:** ganti `"KAIN"` di baris 4 menjadi `"IKAN"`. Kedua kata kini sama, sehingga hurufnya cocok di sepanjang diagonal: angkanya naik 1, 2, 3, 4 dan outputnya `Panjang LCS: 4`.

> **Coba sendiri:** ganti `Math.max` di baris 13 menjadi `Math.min`. Outputnya menjadi `Panjang LCS: 1`, padahal `KAN` jelas sepanjang 3. Saat hurufnya beda, kita harus memilih kemungkinan yang **terbaik**, bukan yang terburuk.

## Kompleksitas

Tabel berisi `(m + 1) × (n + 1)` sel, dan setiap sel diisi dengan beberapa operasi saja. Karena itu waktunya **O(m × n)**, begitu pula memorinya. Untuk `IKAN` dan `KAIN` hanya ada 16 sel yang perlu dihitung. Dua teks masing-masing 1.000 huruf membutuhkan sekitar sejuta sel dan masih selesai dalam sekejap, sedangkan brute force harus memeriksa 2¹⁰⁰⁰ kemungkinan.

> **Coba sendiri:** ganti kedua kata menjadi `"KUCING"` dan `"KUNING"`. Tabelnya membesar menjadi 7 × 7 (gulir panggung ke bawah untuk melihat baris terakhirnya), jumlah langkahnya hampir dua kali lipat, dan outputnya `Panjang LCS: 5`.

Tabel ini hanya menyimpan **panjang** LCS. Huruf-hurufnya bisa disusun kembali dengan berjalan mundur dari `dp[m][n]` mengikuti arah panah tadi. Itulah tantangan pertama pelajaran ini.

## Catatan #tabel
Tabel dibuat **satu lebih besar** dari panjang kata karena baris 0 dan kolom 0 mewakili string kosong. Array `int` baru otomatis berisi 0, jadi kasus dasar tidak perlu diisi lagi.

## Catatan #cocok
Hurufnya sama, jadi huruf ini menjadi huruf terakhir LCS: ambil sel **diagonal** `dp[i - 1][j - 1]` (LCS tanpa kedua huruf ini), lalu tambah 1.

## Catatan #beda
Hurufnya beda, jadi salah satunya pasti tidak terpakai. Pilih yang **lebih panjang** antara membuang huruf terakhir `a` (sel atas) atau huruf terakhir `b` (sel kiri).
