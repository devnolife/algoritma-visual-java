---
judul: Rekursi & call stack
urutan: 14
ringkasan: Memecahkan masalah dengan method yang memanggil dirinya sendiri, sambil mengamati frame menumpuk lalu dibongkar di call stack.
tujuan:
  - Mengenali base case dan recursive case pada method rekursif
  - Menelusuri bagaimana frame menumpuk di call stack, lalu dibongkar sambil membawa nilai kembali
  - Menjelaskan mengapa rekursi tanpa base case berakhir dengan StackOverflowError
  - Menyadari bahwa rekursi bercabang seperti Fibonacci bisa menghitung hal yang sama berulang kali
visual:
  - jenis: memori
  - jenis: evaluasi
---

## Method yang memanggil dirinya sendiri

**Rekursi** adalah teknik ketika sebuah method memanggil dirinya sendiri untuk menyelesaikan versi yang **lebih kecil** dari masalah yang sama. Contoh klasiknya adalah faktorial:

```text
4! = 4 × 3 × 2 × 1 = 24
```

Perhatikan bahwa `4! = 4 × 3!`, lalu `3! = 3 × 2!`, dan seterusnya. Secara umum `n! = n × (n − 1)!`, dengan kesepakatan `0! = 1`. Rumus yang memakai dirinya sendiri ini bisa langsung ditulis sebagai method:

```java
static int faktorial(int n) {
    if (n == 0) return 1;
    return n * faktorial(n - 1);
}
```

## Dua bagian wajib

Setiap method rekursif membutuhkan dua bagian:

- **Base case**: kasus paling sederhana yang jawabannya langsung diketahui tanpa rekursi. Di sini `if (n == 0) return 1;`.
- **Recursive case**: memanggil diri sendiri dengan masalah yang lebih kecil, yaitu `faktorial(n - 1)`. Karena `n` selalu berkurang 1, cepat atau lambat panggilan pasti sampai di base case (selama `n` awalnya tidak negatif).

## Menumpuk, lalu membongkar

Geser slider pelan-pelan dan amati call stack di panel memori. Ada dua fase:

1. **Menumpuk.** `faktorial(4)` belum bisa menghitung apa pun karena harus menunggu hasil `faktorial(3)`, yang menunggu `faktorial(2)`, dan seterusnya sampai `faktorial(0)`. Setiap panggilan mendapat frame baru dengan `n` miliknya sendiri, sehingga ada lima frame `faktorial` di atas `main`.
2. **Membongkar.** `faktorial(0)` langsung mengembalikan 1. Frame-nya menampilkan label `return 1`, lalu dibuang. Frame di bawahnya kini bisa menghitung `1 * 1`, mengembalikan 1, dan begitu seterusnya sampai `faktorial(4)` mengembalikan 24 ke `main`.

Jika diuraikan, perhitungannya seperti ini:

```text
faktorial(4)
= 4 * faktorial(3)
= 4 * 3 * faktorial(2)
= 4 * 3 * 2 * faktorial(1)
= 4 * 3 * 2 * 1 * faktorial(0)
= 4 * 3 * 2 * 1 * 1
= 24
```

> **Coba sendiri:** ganti `int angka = 4;` menjadi `int angka = 6;`. Tumpukan frame bertambah tinggi, dan saat dibongkar labelnya berurutan `return 1`, `1`, `2`, `6`, `24`, `120`, sampai `720`.

## Kalau base case hilang atau salah

Tanpa base case, `faktorial` akan terus memanggil `faktorial(-1)`, `faktorial(-2)`, dan seterusnya tanpa akhir. Setiap panggilan menambah satu frame, padahal ruang call stack terbatas. Ketika ruang itu habis, Java menghentikan program dengan **StackOverflowError**. Karena itu, pastikan base case selalu ada dan setiap panggilan rekursif benar-benar bergerak mendekatinya.

> **Coba sendiri:** hapus baris `if (n == 0) return 1;`, lalu tekan tombol **Ke langkah terakhir**. Frame `faktorial` menumpuk terus sampai program berhenti dengan `StackOverflowError`. Simulator ini sudah menghentikannya pada kedalaman 200 pemanggilan, sedangkan JVM asli baru berhenti setelah ribuan pemanggilan, tetapi jenis error-nya sama.

Base case juga harus mengembalikan nilai yang **benar**, karena nilainya ikut terbawa ke semua frame di bawahnya.

> **Coba sendiri:** ubah base case menjadi `if (n == 0) return 0;`. Program tetap berhenti, tetapi hasilnya `4! = 0`. Perhatikan label `return` pada setiap frame: angka 0 dari frame teratas ikut dikalikan ke semua frame di bawahnya.

## Fibonacci: satu panggilan, dua cabang

Barisan Fibonacci adalah 0, 1, 1, 2, 3, 5, 8, …, yaitu setiap suku merupakan jumlah dua suku sebelumnya. Method `fib` di editor menuliskannya secara rekursif dengan **dua** panggilan sekaligus:

```java
return fib(n - 1) + fib(n - 2);
```

Akibatnya jumlah panggilan membengkak dengan cepat. Untuk menghitung `fib(5)`, method `fib` dipanggil 15 kali: `fib(3)` dihitung ulang 2 kali dan `fib(2)` 3 kali. `fib(30)` bahkan membutuhkan hampir 2,7 juta panggilan. Rekursi memang ringkas, tetapi tidak selalu efisien.

> **Coba sendiri:** hapus tanda `//` di depan baris `System.out.println("fib(5) = " + fib(5));`, lalu geser slider. Call stack naik turun berkali-kali. Hitung berapa kali frame `fib(n = 1)` muncul; seharusnya 5 kali.

## Catatan #dasar
Base case: untuk `n == 0` jawabannya langsung diketahui tanpa memanggil `faktorial` lagi. Bagian inilah yang menghentikan rekursi.

## Catatan #rekursif
Baris ini baru selesai setelah `faktorial(n - 1)` mengembalikan nilainya. Hasil itu dikalikan dengan `n` milik frame ini, lalu dikirim ke frame di bawahnya.
