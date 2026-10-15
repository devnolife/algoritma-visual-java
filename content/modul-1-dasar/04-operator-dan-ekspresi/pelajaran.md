---
judul: "Operator & ekspresi"
urutan: 4
ringkasan: Menghitung dengan operator aritmetika, memahami urutan pengerjaan, dan membandingkan nilai dengan operator relasional serta logika.
tujuan:
  - Membedakan pembagian int dan pembagian double, serta memakai sisa bagi (%)
  - Memakai ++, --, dan penugasan gabungan seperti +=
  - Menentukan hasil ekspresi berdasarkan urutan pengerjaan operator
  - Menyusun kondisi dengan operator relasional dan logika (&&, ||, !)
visual:
  - jenis: evaluasi
  - jenis: memori
pantau: [skor]
---

## Operator aritmetika

- `+` tambah: `17 + 5` menghasilkan `22`
- `-` kurang: `17 - 5` menghasilkan `12`
- `*` kali: `17 * 5` menghasilkan `85`
- `/` bagi: `17 / 5` menghasilkan `3`
- `%` sisa bagi (modulo): `17 % 5` menghasilkan `2`

Kenapa `17 / 5` hasilnya `3`, bukan `3.4`? Lihat bagian berikut.

## Pembagian int dan pembagian double

Jika **kedua** operand bertipe bulat, Java melakukan **pembagian bulat**: bagian desimal dibuang, bukan dibulatkan. Jadi `17 / 5` = `3` dan `7 / 2` = `3`. Itulah yang terjadi di baris 5: 17 permen dibagi ke 5 anak, tiap anak mendapat 3. Sisanya dihitung dengan `%` di baris 6: `17 % 5` = `2`.

Jika **salah satu** operand bertipe pecahan, hasilnya pecahan: `7 / 2.0` = `3.5`, dan `17 / 2.0` = `8.5` (baris 7). Hati-hati, `double rata = 7 / 2;` menghasilkan `3.0`, karena pembagiannya sudah dikerjakan sebagai int sebelum disimpan ke `double`.

Beberapa hal lain yang perlu diingat:

- `%` sering dipakai untuk mengecek bilangan genap (`x % 2 == 0`) dan mengambil digit terakhir (`12345 % 10` = `5`).
- Membagi int dengan nol menghentikan program dengan `ArithmeticException: / by zero`. Membagi double dengan nol tidak error: `5 / 0.0` menghasilkan `Infinity`.
- `double` menyimpan pecahan sebagai nilai hampiran: `System.out.println(0.1 + 0.2);` mencetak `0.30000000000000004`.

> **Coba sendiri:** ubah `2.0` di baris 7 menjadi `2`. Kotak `setengah` di panel Memori sekarang berisi `8.0`, bukan `8.5`. Lalu ubah `5` di baris 4 menjadi `0` dan geser slider ke akhir: program berhenti di baris 5 dengan `ArithmeticException`.

## Urutan pengerjaan

Seperti di matematika, `*`, `/`, dan `%` dikerjakan sebelum `+` dan `-`. Operator yang setingkat dikerjakan dari kiri ke kanan, dan tanda kurung selalu didahulukan.

- `2 + 3 * 4` = `14` (baris 8), sedangkan `(2 + 3) * 4` = `20`.
- `10 / 3 * 3` = `9`, karena `10 / 3` dikerjakan dulu dan menghasilkan `3`.

> **Coba sendiri:** tambahkan tanda kurung di baris 8 menjadi `(2 + 3) * 4`, lalu lihat isi kotak `hasil`.

## Penugasan gabungan, ++, dan --

`skor += 5` adalah singkatan dari `skor = skor + 5`. Bentuk serupa: `-=`, `*=`, `/=`, dan `%=`. Operator `skor++` menambah 1, sedangkan `skor--` mengurangi 1. Pada baris 9–11, kotak `skor` berubah dari 10 menjadi 15, lalu 16.

Posisi `++` berpengaruh jika dipakai di tengah ekspresi:

```java
int a = 5;
int b = a++;
int c = ++a;
```

Pada baris kedua, `b` mendapat nilai **lama** `a` (5), baru kemudian `a` naik menjadi 6. Pada baris ketiga, `a` naik dulu menjadi 7, lalu nilai barunya disimpan ke `c`. Agar tidak bingung, tulis `++` dan `--` sebagai pernyataan tersendiri, seperti di baris 11.

## Operator perbandingan dan logika

Operator perbandingan atau relasional (`==`, `!=`, `<`, `>`, `<=`, `>=`) menghasilkan `boolean`: `true` atau `false`. Baris 12 menyimpan hasil `skor % 2 == 0` ke `genap`. Jangan tertukar: `==` membandingkan, sedangkan `=` mengisi variabel.

Operator logika menggabungkan nilai boolean:

- `a && b` (dan) bernilai true hanya jika keduanya true.
- `a || b` (atau) bernilai true jika minimal salah satunya true.
- `!a` (bukan) membalik nilai, seperti di baris 13.

Baris 14 meminjam `if`, yang akan dibahas tuntas di pelajaran 6: isi kurung kurawalnya hanya dijalankan jika kondisinya `true`. Panel Evaluasi di atas menampilkan cara Java menghitung kondisi itu langkah demi langkah: `16 >= 15 && 2 != 0`, lalu `true && true`, lalu `true`.

Java juga berhemat (*short-circuit*): jika sisi kiri `&&` sudah false, sisi kanan tidak diperiksa lagi karena hasilnya pasti false. Begitu pula jika sisi kiri `||` sudah true.

> **Coba sendiri:** ganti `skor++` di baris 11 menjadi `skor--`, lalu geser slider ke langkah `if`. Panel Evaluasi menunjukkan `14 >= 15` bernilai false, `sisa != 0` tidak dihitung lagi, dan baris 15 dilewati.

## Catatan #bagiBulat
Kedua operand bertipe `int`, jadi hasilnya juga `int`: `17 / 5` seharusnya `3.4`, tetapi bagian desimalnya dibuang menjadi `3`. Sisa permennya dihitung terpisah dengan `%` di baris berikutnya.

## Catatan #presedensi
Perkalian dikerjakan lebih dulu: `3 * 4` = 12, baru ditambah 2, sehingga `hasil` bernilai 14, bukan 20.

## Catatan #logika
`&&` bernilai true hanya jika kedua sisinya true. Perhatikan panel Evaluasi: setiap bagian kondisi diganti nilainya sampai tersisa satu `true` atau `false`.
