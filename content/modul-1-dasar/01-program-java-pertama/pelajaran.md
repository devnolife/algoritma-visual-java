---
judul: Program Java pertama
urutan: 1
ringkasan: Mengenal kerangka program Java dan mencetak teks ke layar dengan println dan print.
tujuan:
  - Mengenali kerangka program Java, yaitu class Main dan method main
  - Menulis pernyataan yang diakhiri titik koma
  - Membedakan System.out.println dan System.out.print
  - Memahami bahwa pernyataan dijalankan berurutan dari atas ke bawah
visual:
  - jenis: konsol
  - jenis: memori
---

## Kerangka setiap program Java

Lihat editor di sebelah kanan. Baris 1–2 dan dua kurawal penutup di baris 10–11 adalah **kerangka** yang sama untuk semua program di modul ini. Perintah-perintahmu ditulis di antaranya.

- `public class Main` membuat sebuah **class** bernama `Main`. Di Java, semua kode harus berada di dalam class, dan nama class ini harus sama dengan nama filenya, `Main.java`.
- `public static void main(String[] args)` adalah **method main**, pintu masuk program. Java selalu mulai bekerja dari baris pertama di dalam `main`.
- Kurung kurawal `{` dan `}` selalu berpasangan dan menandai awal serta akhir sebuah blok. Kurawal di baris 10 menutup `main`, kurawal di baris 11 menutup class.

Untuk sekarang, anggap kerangka ini sebagai bingkai yang selalu ditulis. Arti `static`, `void`, dan `String[] args` akan jelas di pelajaran Method.

Teks setelah `//` adalah **komentar**, yaitu catatan untuk manusia yang diabaikan Java (lihat baris 3). Komentar yang diawali `#`, misalnya `// #println`, menandai baris yang punya catatan dosen di kartu penjelasan.

## Pernyataan dan titik koma

Setiap perintah di dalam `main` disebut **pernyataan** (*statement*) dan harus diakhiri titik koma `;`, seperti kalimat yang diakhiri titik.

> **Coba sendiri:** hapus tanda `;` di akhir baris 4. Animasi langsung dijeda dan tab Masalah menampilkan `Main.java:4: error: ';' expected`, artinya Java mengharapkan titik koma di posisi yang digarisbawahi merah. Kembalikan titik komanya, animasi berjalan lagi.

Java juga membedakan huruf besar dan kecil. Jika kamu menulis `system.out.println` dengan huruf `s` kecil, Java menolaknya dengan pesan `package system does not exist`.

## println atau print?

Keduanya mencetak teks ke konsol (layar). Bedanya ada pada apa yang terjadi **setelah** mencetak:

- `System.out.println("...")` mencetak teks lalu **pindah ke baris baru**.
- `System.out.print("...")` mencetak teks dan kursor **tetap di baris yang sama**.

```java
System.out.print("A");
System.out.println("B");
System.out.println("C");
```

Ketiga pernyataan di atas menghasilkan dua baris: `AB`, lalu `C`.

Baris 6 sampai 8 di editor memakai dua `print` lalu satu `println`, sehingga ketiganya menyambung menjadi `Satu baris yang sama.` Teks di dalam tanda kutip dicetak persis apa adanya, termasuk spasi di `"Satu "`.

> **Coba sendiri:** ubah `print` di baris 6 menjadi `println`, lalu geser slider sampai akhir. Kata `Satu` sekarang berdiri sendiri di barisnya.

## Dari atas ke bawah

Geser slider pelan-pelan. Baris yang disorot di editor berpindah satu per satu dari atas ke bawah, dan setiap kali sebuah baris dijalankan, teks barunya muncul di panel Konsol. Java tidak melompat-lompat: satu pernyataan selesai, baru pernyataan berikutnya dijalankan.

Panel Memori menampilkan kotak `main()`, tempat kerja method main. Kotaknya masih kosong karena program ini belum memakai variabel. Kotak itu akan mulai terisi di pelajaran berikutnya.

> **Coba sendiri:** tukar urutan baris 4 dan 5 (potong lalu tempel). Urutan output ikut tertukar, karena output selalu mengikuti urutan pernyataan.

## Karakter escape `\n`

Di dalam teks, garis miring terbalik `\` memulai **karakter escape**, yaitu kode untuk karakter khusus:

- `\n` berarti pindah baris. Baris 9 mencetak `Baris A` dan `Baris B` di dua baris walaupun hanya memakai satu `println`.
- `\t` berarti tab, dan `\"` mencetak tanda kutip ganda di dalam teks.

## Teks atau angka?

Tanda kutip menentukan cara Java memperlakukan isinya. `System.out.println("2 + 3");` mencetak teks `2 + 3` apa adanya, sedangkan `System.out.println(2 + 3);` menghitung dulu lalu mencetak `5`.

> **Coba sendiri:** sisipkan kedua pernyataan itu sebelum baris 10, lalu bandingkan hasilnya di Konsol.

## Catatan #println
`System.out.println` mencetak teks di antara tanda kutip, lalu memindahkan kursor ke baris baru. Teks yang baru tercetak disorot di panel Konsol.

## Catatan #print
`print` tidak pindah baris, jadi teks berikutnya menyambung di baris yang sama. Spasi setelah kata `Satu` sengaja ditulis di dalam tanda kutip agar kata-katanya tidak menempel.

## Catatan #escape
Pasangan `\n` di dalam teks berarti **pindah baris**, sehingga satu `println` ini menghasilkan dua baris output.
