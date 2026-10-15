---
judul: "Strong typing & casting"
urutan: 3
ringkasan: Memahami aturan tipe Java yang ketat, kapan konversi terjadi otomatis, dan kapan perlu casting.
tujuan:
  - Menjelaskan mengapa Java disebut strongly typed
  - Membedakan widening (otomatis) dan narrowing (wajib casting)
  - Memakai casting untuk double ke int dan untuk char ke int atau sebaliknya
  - Mengenali overflow pada int dan cara menghindarinya
visual:
  - jenis: memori
  - jenis: konsol
pantau: [suhuBulat, hurufLain, lewatBatas]
---

## Java itu strongly typed

Setiap variabel Java punya tipe yang tetap, dan Java memeriksa kecocokan tipe **sebelum** program dijalankan, yaitu saat kompilasi. Jika ada yang tidak cocok, program tidak dijalankan sama sekali dan animasi dijeda.

```java
int umur = "19";
```

Java menolak baris di atas dengan pesan `incompatible types: String cannot be converted to int`. Teks `"19"` bukan angka, walaupun isinya tampak seperti angka. Mengubah teks menjadi angka memerlukan method khusus (`Integer.parseInt`), bukan casting. Bagaimana dengan perpindahan nilai antartipe angka? Ada dua arah.

## Widening: otomatis

Memindahkan nilai ke tipe yang **lebih lebar** disebut *widening*. Java melakukannya otomatis karena rentang tipe tujuan pasti cukup untuk menampung nilainya. Urutannya: `byte` → `short` → `int` → `long` → `float` → `double`, ditambah `char` → `int`.

Pada baris 3–5, angka 120 berpindah dari `int` ke `long`, lalu ke `double`. Perhatikan panel Memori: nilainya tetap 120, tetapi badge tipenya berganti, dan kotak `double` menampilkannya sebagai `120.0`.

## Narrowing: wajib casting

Memindahkan nilai ke tipe yang **lebih sempit** disebut *narrowing*. Nilainya bisa tidak muat atau kehilangan bagian desimal, maka Java menolaknya dengan pesan `incompatible types: possible lossy conversion from double to int`.

Jika kamu memang ingin mengubahnya, tulis **casting**: nama tipe tujuan di dalam kurung, tepat di depan nilainya, seperti `(int) suhu` di baris 8. Casting `double` ke `int` **memotong** bagian desimal, bukan membulatkan:

- `(int) 36.9` menghasilkan `36`
- `(int) 3.7` menghasilkan `3`
- `(int) -3.7` menghasilkan `-3` (dipotong menuju nol)

Untuk pembulatan biasa, gunakan `Math.round(36.9)` yang menghasilkan `37`.

> **Coba sendiri:** hapus `(int)` di baris 8 dan baca pesan error-nya, lalu kembalikan. Setelah itu ubah `36.9` menjadi `-36.9` dan lihat isi kotak `suhuBulat`.

## char sebenarnya angka

Setiap karakter disimpan sebagai **kode Unicode**: `'A'` = 65, `'B'` = 66, `'a'` = 97. Karena itu `char` bisa otomatis menjadi `int` (baris 11). Kotak `char` di panel Memori juga menampilkan kodenya sebagai angka kecil.

Jika char dijumlahkan, hasilnya bertipe `int`: `'A' + 1` bernilai `66`, bukan `'B'`. Untuk mengembalikannya menjadi karakter perlu casting `(char)`, seperti di baris 12. Tanda kurung pada `(char) (huruf + 1)` penting: tanpa kurung, casting hanya berlaku untuk `huruf`, lalu hasil penjumlahannya tetap `int`.

Sebaliknya, `(int) 'A'` menghasilkan `65`, dan `(char) 66` menghasilkan `'B'`. Casting ke `int` berguna untuk mencetak kode huruf: `System.out.println(huruf)` mencetak `A`, sedangkan `System.out.println((int) huruf)` mencetak `65`.

> **Coba sendiri:** hapus `(char)` di baris 12. Java menolak dengan `possible lossy conversion from int to char`.

## Overflow: kotak yang kepenuhan

Nilai terbesar `int` adalah `Integer.MAX_VALUE`, yaitu 2147483647. Menambah 1 lagi **tidak** menimbulkan error: nilainya "berputar" ke batas bawah, -2147483648 (baris 15). Kartu penjelasan menandai langkah itu dengan peringatan *Overflow*.

Mengganti tipe variabel tujuannya saja ternyata belum cukup.

> **Coba sendiri:** ubah `int lewatBatas` di baris 15 menjadi `long lewatBatas`. Hasilnya tetap -2147483648, karena `terbesar + 1` sudah dihitung sebagai `int` sebelum disimpan. Ganti juga `1` menjadi `1L` agar penjumlahan dilakukan dalam `long`, maka hasilnya menjadi 2147483648.

## Catatan #widening
Dari `int` ke `long` adalah **widening**: tipe tujuan lebih lebar, jadi tidak ada data yang hilang dan Java mengizinkannya tanpa casting.

## Catatan #narrowing
`(int)` adalah **casting**. Bagian desimal 36.9 dibuang begitu saja, sehingga hasilnya 36, bukan 37.

## Catatan #overflow
`terbesar + 1` dihitung sebagai `int`. Karena melewati 2147483647, hasilnya berputar ke batas bawah, -2147483648. Java tidak memberi error untuk kasus ini.
