---
judul: "DP: Fibonacci"
urutan: 11
ringkasan: Menyimpan jawaban submasalah agar tidak dihitung ulang, sehingga Fibonacci rekursif yang eksponensial menjadi linear.
tujuan:
  - Mengenali submasalah tumpang tindih pada pohon panggilan Fibonacci naif
  - Menerapkan memoisasi (top-down) dengan array memo
  - Menjelaskan tabulasi (bottom-up) sebagai cara lain mengisi tabel jawaban
  - Membandingkan pertumbuhan O(2ⁿ) versi naif dengan O(n) versi memoisasi
visual:
  - jenis: array
    variabel: memo
    penunjuk: [n]
  - jenis: pohonPanggilan
  - jenis: memori
pantau: [panggilan]
pertumbuhan:
  variabel: n
  nilai: [6, 8, 10, 12, 14, 16]
  ukur: panggilan
  seri:
    - nama: naif
      ganti: { pakaiMemo: false }
    - nama: memoisasi
      ganti: { pakaiMemo: true }
---

## Menghitung hal yang sama berulang kali

Di pelajaran rekursi (Modul 1) kamu sudah bertemu barisan Fibonacci 0, 1, 1, 2, 3, 5, 8, …, dengan `fib(n) = fib(n - 1) + fib(n - 2)`. Versi rekursif langsungnya ada di method `fib` (baris 14–18). Masalahnya, kedua cabang rekursi tidak saling berbagi hasil. Untuk menghitung `fib(6)`, `fib(4)` dihitung 2 kali, `fib(3)` 3 kali, dan `fib(2)` 5 kali.

Masalah yang tersusun dari **submasalah tumpang tindih** (*overlapping subproblems*) seperti ini adalah sasaran **dynamic programming** (DP). Idenya sederhana: selesaikan setiap submasalah **satu kali saja**, simpan jawabannya, lalu pakai ulang jawaban itu setiap kali dibutuhkan.

> **Coba sendiri:** ubah `boolean pakaiMemo = true;` di baris 7 menjadi `false`, sehingga program memakai `fib` versi naif. Pohon panggilan membengkak menjadi 25 simpul, dan banyak simpulnya bergaris putus-putus: argumennya sudah pernah muncul, tetapi seluruh subpohonnya dihitung ulang. Output menjadi `Panggilan: 25`, sedangkan array `memo` tetap berisi 0 karena tidak dipakai.

## Memoisasi: catat sebelum lupa

**Memoisasi** menambahkan sebuah catatan, yaitu array `memo`, pada versi rekursif. Method `fibMemo` bekerja seperti ini:

1. Kasus dasarnya tetap sama: `fib(0) = 0` dan `fib(1) = 1` (baris 22).
2. Sebelum menghitung, periksa catatan. Bila `memo[n]` sudah terisi, langsung kembalikan nilainya (baris 23).
3. Bila belum, hitung secara rekursif seperti biasa, lalu **simpan** hasilnya di `memo[n]` sebelum dikembalikan (baris 24).

Karena dimulai dari masalah besar `fibMemo(6)` lalu turun ke submasalah yang lebih kecil, memoisasi disebut pendekatan **top-down**.

Geser slider dan perhatikan dua hal. Pertama, penunjuk `n` pada array `memo` menandai sel yang sedang diperiksa atau diisi. Sel `memo[2]` sampai `memo[6]` terisi berurutan 1, 2, 3, 5, 8 saat rekursi kembali naik. Kedua, simpul putus-putus pada pohon versi ini tidak punya anak: panggilan kedua `fibMemo(2)`, `fibMemo(3)`, dan `fibMemo(4)` langsung dijawab dari `memo`. Totalnya hanya 11 panggilan.

> **Coba sendiri:** hapus baris 23, yaitu `if (memo[n] != 0) return memo[n];`. Hasil tetap disimpan di `memo`, tetapi tidak pernah dibaca, sehingga pohon kembali membengkak menjadi 25 panggilan seperti versi naif. Menyimpan saja tidak cukup; catatan harus **diperiksa** sebelum menghitung.

## Tabulasi: dari bawah ke atas

Cara kedua adalah **tabulasi**: tanpa rekursi, isi tabel jawaban mulai dari submasalah terkecil ke atas (**bottom-up**):

1. Isi kasus dasarnya: `tabel[0] = 0` dan `tabel[1] = 1`.
2. Untuk `i` dari 2 sampai `n`, hitung `tabel[i] = tabel[i - 1] + tabel[i - 2]`.
3. Jawabannya ada di `tabel[n]`.

Saat `tabel[i]` dihitung, `tabel[i - 1]` dan `tabel[i - 2]` pasti sudah terisi, jadi cukup satu perulangan `for`. Bandingkan kedua pendekatan DP ini:

- **Memoisasi (top-down):** rekursi ditambah array catatan. Dimulai dari n dan hanya menghitung submasalah yang diperlukan, tetapi rekursi yang terlalu dalam bisa memenuhi call stack.
- **Tabulasi (bottom-up):** perulangan ditambah tabel. Dimulai dari 0 dan menghitung semua submasalah sampai n. Karena tanpa rekursi, tabulasi tidak bisa kehabisan stack walaupun n besar.

Kamu akan menulis versi tabulasinya di tantangan pertama.

## Dari 2ⁿ menjadi n

Pada versi naif, setiap kenaikan n kira-kira mengalikan banyaknya panggilan dengan 1,6. Pertumbuhan seperti ini **eksponensial** dan biasa ditulis O(2ⁿ). Pada versi memoisasi, setiap `fibMemo(k)` hanya dihitung sekali dan memanggil paling banyak dua panggilan lain, sehingga totalnya 2n − 1 panggilan, yaitu **O(n)**. Harganya adalah memori tambahan O(n) untuk array `memo`.

Buka tab **Pertumbuhan**. Program dijalankan ulang untuk n = 6 sampai 16 dengan kedua seri. Pada n = 16, versi naif membutuhkan 3.193 panggilan, sedangkan versi memoisasi hanya 31. Ukuran n berhenti di 16 karena versi naif cepat sekali menjadi terlalu lambat untuk diukur ulang setiap kali kodenya diedit.

> **Coba sendiri:** ubah `int n = 6;` menjadi `int n = 20;`. Dengan `pakaiMemo = true`, program selesai dengan `Panggilan: 39`. Lalu ubah `pakaiMemo` menjadi `false`: program dihentikan karena melebihi 20.000 langkah, padahal yang dihitung hanya `fib(20) = 6765`.

## Catatan #ulang

Dua panggilan ini **tidak saling berbagi hasil**: semua yang dihitung `fib(n - 2)` sudah pernah dihitung juga di dalam `fib(n - 1)`.

## Catatan #cek

Sebelum menghitung, periksa catatan. Nilai `0` berarti `memo[n]` **belum dihitung**, karena untuk `n >= 2` nilai Fibonacci tidak pernah 0.

## Catatan #simpan

Hasil disimpan di `memo[n]` sebelum dikembalikan, sehingga panggilan berikutnya dengan `n` yang sama cukup **membaca** nilai ini.
