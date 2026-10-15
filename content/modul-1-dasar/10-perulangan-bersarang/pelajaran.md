---
judul: Perulangan bersarang
urutan: 10
ringkasan: Menaruh perulangan di dalam perulangan untuk membuat pola baris-kolom, seperti segitiga bintang dan tabel perkalian.
tujuan:
  - Menjelaskan bahwa perulangan dalam berjalan penuh untuk setiap putaran perulangan luar
  - Membuat pola bintang dengan memadukan print dan println
  - Menghitung total putaran perulangan bersarang
visual:
  - jenis: konsol
  - jenis: memori
pantau: [baris]
---

## Perulangan di dalam perulangan

Badan sebuah perulangan boleh berisi perulangan lain. Susunan ini disebut **perulangan bersarang** (nested loop). Aturannya: untuk **setiap satu putaran** perulangan luar, perulangan dalam dijalankan **dari awal sampai selesai**.

Bayangkan jam dinding: jarum menit harus berputar penuh sebelum jarum jam maju satu angka. Di program ini, perulangan luar (`baris`) memilih baris yang sedang dibuat, sedangkan perulangan dalam (`kolom`) mengisi baris itu dengan bintang. Tanda hijau di slider menandai setiap kali `baris` berubah, sehingga awal setiap baris pola mudah ditemukan.

## print dan println

Pola bintang memanfaatkan dua cara mencetak:

- `System.out.print("*")` mencetak tanpa pindah baris, sehingga bintang berikutnya muncul tepat di sebelahnya.
- `System.out.println()` tanpa isi hanya **pindah baris**.

Karena itu `print` berada di perulangan dalam (mengisi satu baris), sedangkan `println()` berada di perulangan luar, setelah perulangan dalam selesai.

Geser slider dan perhatikan konsol: bintang muncul satu per satu, lalu kursor pindah ke baris baru setiap kali perulangan dalam selesai. Di panel memori, kotak `kolom` muncul dan hilang berulang kali, karena variabel itu dibuat ulang di setiap putaran luar.

> **Coba sendiri:** ganti `print("*")` menjadi `println("*")`. Setiap bintang kini menempati barisnya sendiri, dan `println()` di perulangan luar menambahkan baris kosong di antara kelompoknya. Kembalikan, lalu hapus baris `System.out.println();`. Sekarang semua bintang menempel di satu baris, bersama teks jumlah bintang.

## Bentuk pola ditentukan kondisi dalam

Kondisi `kolom <= baris` membuat banyak bintang di setiap baris sama dengan nomor barisnya: 1, 2, 3, lalu 4. Itulah yang membentuk segitiga.

> **Coba sendiri:** ubah `kolom <= baris` menjadi `kolom <= tinggi`. Setiap baris kini berisi 4 bintang, sehingga polanya menjadi persegi dan `bintang` bernilai 16.

## Menghitung total putaran

Berapa kali `System.out.print("*")` dijalankan? Variabel `bintang` mencatatnya:

- Pada persegi, perulangan dalam selalu berputar sama banyak, jadi totalnya baris × kolom: 4 × 4 = 16.
- Pada segitiga, putarannya bertambah satu di setiap baris: 1 + 2 + 3 + 4 = 10.

Banyak langkah eksekusi pun cepat membesar. Segitiga setinggi 4 selesai dalam 67 langkah.

> **Coba sendiri:** ubah `tinggi` menjadi 8, lalu lihat banyak langkah di samping slider dan nilai akhir `bintang`.

## Tabel perkalian

Pola yang sama dipakai untuk membuat tabel: perulangan luar memilih baris, perulangan dalam mengisi kolom.

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 5; j++) {
        System.out.print(i * j + "\t");
    }
    System.out.println();
}
```

Tanda `\t` adalah karakter tab yang membuat kolomnya rata. Outputnya:

```
1	2	3	4	5
2	4	6	8	10
3	6	9	12	15
```

Perulangan dalam berputar 5 kali untuk setiap nilai `i`, sehingga totalnya 3 × 5 = 15 hasil kali.

## Kesalahan yang sering terjadi

- **Nama variabel yang sama** untuk kedua perulangan, misalnya `i` di luar dan `i` lagi di dalam. Java menolak dengan error `variable i is already defined in method main(String[])`.
- **`println()` di tempat yang salah.** Di dalam perulangan dalam, setiap bintang mendapat baris sendiri; setelah perulangan luar, semua bintang menempel di satu baris.
- **Update yang tertukar**, misalnya menulis `baris++` di kepala perulangan dalam. `kolom` tidak pernah bertambah sehingga perulangan dalam tidak kunjung selesai, dan simulator menghentikannya setelah 20.000 langkah.

## Catatan #luar
Perulangan luar menentukan **baris** yang sedang dibuat. Satu putaran luar baru selesai setelah seluruh perulangan dalam selesai dan `println()` dijalankan.

## Catatan #dalam
Perulangan dalam dimulai lagi dari `kolom = 1` di setiap baris. Kondisinya `kolom <= baris`, jadi baris ke-3 berisi tepat 3 bintang.

## Catatan #ganti
`println()` tanpa isi hanya memindahkan kursor ke baris baru. Letaknya di luar perulangan dalam, jadi dijalankan sekali per baris.
