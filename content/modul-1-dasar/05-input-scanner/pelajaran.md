---
judul: Input dengan Scanner
urutan: 5
ringkasan: Membaca data dari keyboard dengan Scanner, memahami token dan baris, serta menghindari jebakan nextLine setelah nextInt.
tujuan:
  - Menyiapkan Scanner dengan import dan new Scanner(System.in)
  - Membaca bilangan dan teks dengan nextInt, nextDouble, next, dan nextLine
  - Membedakan pembacaan per token dan per baris
  - Menghindari jebakan nextLine() setelah nextInt()
visual:
  - jenis: input
  - jenis: memori
input: "Rina Amelia\n1.62 19\nMakassar\n"
---

## Program yang menerima data

Sejauh ini program selalu menghasilkan output yang sama. Dengan **input**, program bisa mengolah data yang diberikan pengguna. Java membaca input keyboard memakai class `Scanner` dalam tiga langkah:

1. Tulis `import java.util.Scanner;` di baris paling atas, sebelum `public class Main`. Tanpa baris ini Java menolak dengan `cannot find symbol` (symbol: `class Scanner`).
2. Buat objek Scanner yang terhubung ke keyboard (`System.in`), seperti di baris 5. Nama `masukan` boleh diganti sesukamu.
3. Panggil method pembacanya, mis. `masukan.nextInt()`.

Di aplikasi ini, input tidak diketik saat program berjalan. Tulis dulu di tab **Input** di bawah editor: setiap baris di sana sama dengan satu baris yang diketik lalu diakhiri Enter. Mengubah isi tab Input langsung menjalankan ulang program.

Karena isi tab Input tidak ikut tampil di Output, program di sini tidak mencetak pertanyaan (*prompt*) seperti `Umur: `. Saat menulis program untuk terminal sungguhan, sebaiknya cetak prompt dengan `print` sebelum membaca.

## Membaca token dan baris

- `nextInt()` membaca satu token bilangan bulat dan menghasilkan `int`.
- `nextDouble()` membaca satu token bilangan pecahan dan menghasilkan `double`.
- `next()` membaca satu token (satu kata) dan menghasilkan `String`.
- `nextLine()` membaca sisa baris sampai Enter dan menghasilkan `String`.

**Token** adalah sekelompok karakter yang dipisahkan spasi atau Enter. `nextInt()`, `nextDouble()`, dan `next()` melewati spasi dan Enter lebih dulu, lalu mengambil satu token. Karena itu baris kedua input, `1.62 19`, berisi dua token yang dibaca oleh baris 7 dan baris 8.

Perhatikan panel Input saat menggeser slider: bagian yang sudah dibaca dicoret, token yang baru dibaca disorot, dan garis tegak menandai posisi Scanner. Tanda `↵` berarti Enter dan `·` berarti spasi.

Jika token tidak cocok dengan tipe yang diminta, mis. `nextInt()` bertemu kata `sembilan`, program berhenti dengan `InputMismatchException`. Satu catatan praktis: di komputer yang pengaturan wilayahnya (*locale*) Indonesia, `nextDouble()` pada Java asli meminta koma (`1,62`) dan menolak `1.62`. Simulator ini selalu memakai titik.

> **Coba sendiri:** di tab Input, ganti `19` menjadi `sembilan`, lalu geser slider ke akhir dan baca pesan exception-nya.

> **Coba sendiri:** ubah `nextLine()` di baris 6 menjadi `next()`. Sekarang `nama` hanya berisi `Rina`, sedangkan `Amelia` tertinggal di input, sehingga `nextDouble()` di baris 7 gagal membacanya.

## Jebakan nextLine() setelah nextInt()

`nextInt()` berhenti tepat setelah token angkanya. Enter (`↵`) setelah `19` masih tertinggal di input. Jika langsung disusul `nextLine()`, method itu membaca "sisa baris", yang ternyata kosong, lalu menghasilkan teks kosong `""`.

Solusinya: panggil `masukan.nextLine();` sekali tanpa menyimpan hasilnya untuk membuang sisa Enter itu (baris 9). Setelah itu, `nextLine()` di baris 10 benar-benar membaca `Makassar`.

> **Coba sendiri:** hapus baris 9 (`masukan.nextLine();`), lalu geser slider. Kotak `kota` sekarang berisi `""`, output-nya `Asal: ` tanpa nama kota, dan `Makassar` tidak pernah dibaca. Kartu penjelasan juga menampilkan peringatan pada langkah itu.

Jebakan yang sama terjadi setelah `nextDouble()` dan `next()`. Ingat aturannya: setelah membaca token, buang dulu sisa barisnya sebelum memanggil `nextLine()`.

## Catatan #scanner
`new Scanner(System.in)` membuat objek pembaca yang terhubung ke input. Di panel Memori, `masukan` tidak berisi data, melainkan panah yang menunjuk ke objek Scanner.

## Catatan #token
`nextInt()` melewati spasi, lalu mengambil satu token, yaitu `19`. Enter di belakangnya **tidak** ikut dibaca. Lihat posisi garis tegak di panel Input.

## Catatan #sisaEnter
Baris ini sengaja membuang sisa baris setelah `19`, yang isinya hanya Enter. Tanpa baris ini, `nextLine()` berikutnya menghasilkan teks kosong, bukan `Makassar`.
