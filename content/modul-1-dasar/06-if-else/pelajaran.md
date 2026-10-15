---
judul: Percabangan if / else
urutan: 6
ringkasan: Membuat program memilih jalan sendiri berdasarkan kondisi yang bernilai true atau false.
tujuan:
  - "Menulis kondisi dengan operator pembanding (==, !=, <, >, <=, >=) dan operator logika (&&, ||, !)"
  - Menyusun rantai if / else if / else dan menebak cabang mana yang dijalankan
  - Memakai if bersarang untuk pemeriksaan bertahap
  - Mengenali kesalahan umum, misalnya memakai = di dalam kondisi
visual:
  - jenis: evaluasi
  - jenis: memori
pantau: [predikat]
---

## Program yang bisa memilih

Sampai sekarang, program berjalan lurus dari baris pertama sampai terakhir. Dengan **percabangan**, program bisa memilih: sebuah blok kode hanya dijalankan jika **kondisi**-nya terpenuhi.

```java
if (kondisi) {
    // dijalankan jika kondisi bernilai true
} else {
    // dijalankan jika kondisi bernilai false
}
```

Kondisi wajib berupa ekspresi `boolean`, yaitu ekspresi yang hasilnya `true` atau `false`. Bagian `else` boleh tidak ditulis; jika kondisinya false, blok `if` dilewati begitu saja.

Pada program di editor, `nilai` adalah nilai ujian dan `hadir` adalah banyaknya pertemuan yang dihadiri seorang mahasiswa.

## Membuat kondisi

Operator **pembanding** membandingkan dua nilai dan menghasilkan `boolean`:

- `==` sama dengan, `!=` tidak sama dengan
- `>` lebih besar, `<` lebih kecil
- `>=` lebih besar atau sama dengan, `<=` lebih kecil atau sama dengan

Operator **logika** menggabungkan beberapa kondisi:

- `a && b` (dan): true jika `a` **dan** `b` sama-sama true
- `a || b` (atau): true jika **salah satu** saja sudah true
- `!a` (bukan): membalik true menjadi false, dan sebaliknya

Saat slider berhenti di baris `if`, **panel evaluasi** menulis ulang kondisinya tahap demi tahap sampai tersisa satu nilai: `nilai >= 60 && hadir >= 10` → `78 >= 60 && 12 >= 10` → `true && true` → `true`.

Jika sisi kiri `&&` sudah false, hasil akhirnya pasti false, jadi Java tidak memeriksa sisi kanan lagi. Ini disebut evaluasi **short-circuit**. Di panel evaluasi, sisi kanan tetap tertulis sebagai teks karena memang tidak pernah dihitung. Hal serupa berlaku untuk `||`: jika sisi kirinya sudah true, sisi kanan dilewati.

## Rantai if / else if / else

Untuk lebih dari dua kemungkinan, sambungkan beberapa kondisi dengan `else if`:

1. Java memeriksa kondisi dari atas ke bawah.
2. Kondisi **pertama** yang true menang: bloknya dijalankan, lalu sisa rantai dilewati.
3. `else` di akhir menampung semua kasus yang tidak cocok dengan kondisi mana pun.

Setelah program dijalankan, isi cabang yang tidak pernah dijalankan tampak **pudar** di editor. Dengan `nilai = 78`, dari tiga baris yang mengisi `predikat`, hanya `predikat = "Baik";` yang tetap terang.

> **Coba sendiri:** ubah `nilai` menjadi 92, lalu 45. Setiap kali, geser slider dan perhatikan berapa kondisi yang sempat dicek di panel evaluasi, serta baris mana yang tetap terang.

> **Coba sendiri:** ubah `nilai` menjadi 92, lalu hapus kata `else` pada baris `} else if (nilai >= 70) {`. Sekarang ada dua `if` terpisah dan **keduanya** dicek. Di panel memori, `predikat` diisi dua kali, dan hasil akhirnya keliru: "Baik".

## If bersarang

Sebuah `if` boleh diletakkan di dalam blok `if` atau `else` lain. If bagian dalam hanya diperiksa jika eksekusi masuk ke blok luarnya. Pada program ini, penyebab tidak lulus baru diperiksa ketika status mahasiswa tidak lulus.

> **Coba sendiri:** tekan **Reset kode** untuk mengembalikan program awal, lalu ubah `hadir` menjadi 8. Panel evaluasi menunjukkan `true && false`, status berubah menjadi tidak lulus, dan barulah if bagian dalam ikut dicek.

## Kesalahan yang sering terjadi

Jika kode tidak bisa dikompilasi, tab **Masalah** menampilkan pesan error seperti javac beserta artinya dalam bahasa Indonesia, dan animasi dijeda sampai error diperbaiki.

- **Memakai `=`, bukan `==`.** `if (nilai = 100)` berarti *mengisi* `nilai` dengan 100, bukan membandingkan. Hasilnya bertipe `int`, bukan `boolean`, sehingga Java menolak dengan error `incompatible types: int cannot be converted to boolean`.
- **Titik koma setelah kondisi.** `if (nilai >= 85);` dianggap if dengan isi kosong, sehingga blok sesudahnya selalu dijalankan. Jika setelahnya ada `else`, muncul error `'else' without 'if'`.
- **Variabel yang belum pasti terisi.** Hapus dua baris `} else {` dan `predikat = "Kurang";`. Java menolak dengan error `variable predikat might not have been initialized`, karena ada jalur eksekusi yang tidak pernah mengisi `predikat`.

## Catatan #rantai
Java memeriksa kondisi dari atas ke bawah. Begitu ada kondisi yang bernilai true, cabangnya dijalankan dan **sisa rantai dilewati** tanpa dicek lagi.

## Catatan #dan
`&&` bernilai true hanya jika **kedua** sisinya true. Jika sisi kiri sudah false, sisi kanan tidak dicek lagi (short-circuit). Coba ubah `nilai` menjadi 50, lalu lihat panel evaluasi di baris ini.

## Catatan #bersarang
If ini berada **di dalam** blok `else`, jadi hanya dicek ketika kondisi lulus bernilai false. Jika mahasiswa lulus, baris ini dilewati sama sekali.
