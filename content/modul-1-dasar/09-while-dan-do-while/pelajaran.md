---
judul: while & do-while
urutan: 9
ringkasan: Mengulang selama sebuah kondisi masih terpenuhi, entah diperiksa di awal (while) atau di akhir (do-while).
tujuan:
  - Membedakan while yang memeriksa kondisi di awal dan do-while yang memeriksa di akhir
  - Membaca data dengan pola sentinel memakai Scanner
  - Mengenali dan memperbaiki perulangan tak berujung (infinite loop)
  - Memilih for, while, atau do-while sesuai kebutuhan
visual:
  - jenis: evaluasi
  - jenis: input
  - jenis: memori
pantau: [jumlah]
input: "5\n8\n3\n0\n"
---

## Mengulang selama kondisi terpenuhi

`for` cocok jika banyaknya putaran sudah diketahui. Namun sering kali kita belum tahu kapan harus berhenti, misalnya saat membaca angka sampai pengguna mengetik 0. Untuk itu ada `while`:

```java
while (kondisi) {
    // badan: diulang selama kondisi bernilai true
}
```

`while` memeriksa kondisi **sebelum** setiap putaran. Jika sejak awal kondisinya false, badannya tidak dijalankan sama sekali.

## Sentinel: berhenti di nilai penanda

Program di editor menjumlahkan angka dari tab Input sampai bertemu angka 0. Nilai penanda akhir seperti ini disebut **sentinel**. Polanya:

1. Baca satu nilai **sebelum** perulangan.
2. Periksa kondisi `angka != 0`.
3. Di dalam badan, proses nilai itu, lalu baca nilai **berikutnya** di akhir badan.

Panel input mencoret bagian input yang sudah dibaca Scanner. Geser slider: setiap `sc.nextInt()` mengambil satu token, lalu kondisi dicek lagi di panel evaluasi, misalnya `angka != 0` → `8 != 0` → `true`. Ketika token `0` terbaca, kondisinya menjadi `0 != 0` → `false` dan perulangan selesai. Angka 0 itu sendiri tidak ikut dijumlahkan.

> **Coba sendiri:** ubah isi tab Input menjadi `4 4 4 4 0`, lalu menjadi `0` saja. Pada input kedua, kondisi langsung false dan badan while tidak dijalankan sekali pun.

## Perulangan tak berujung

Agar `while` bisa berhenti, badannya harus **mengubah** sesuatu yang diperiksa kondisi. Di program ini, tugas itu dijalankan oleh `angka = sc.nextInt();`.

> **Coba sendiri:** hapus baris `angka = sc.nextInt();` yang ada di dalam badan while. Nilai `angka` tidak pernah berubah, kondisinya selalu true, dan perulangan tidak pernah selesai. Inilah **infinite loop**.

Di komputer sungguhan, program seperti itu terus berjalan sampai dihentikan paksa. Simulator ini menghentikannya setelah **20.000 langkah** dan memberi tanda merah di ujung slider. Kartu penjelasan langkah terakhir dan tab Masalah lalu menyebutkan bahwa kemungkinan ada perulangan tak berujung, lengkap dengan nomor baris yang paling sering dijalankan.

Penyebab lain yang sering muncul: lupa menulis `i++` pada while yang memakai penghitung sehingga `i` tidak pernah berubah, atau update yang justru menjauhkan variabel dari kondisi berhenti.

## do-while: periksa belakangan

```java
do {
    // badan: dijalankan minimal sekali
} while (kondisi);
```

`do-while` menjalankan badan **lebih dulu**, baru memeriksa kondisi. Akibatnya badan selalu dijalankan **minimal sekali**. Jangan lupa titik koma setelah `while (kondisi)`; tanpa titik koma itu muncul error `';' expected`.

> **Coba sendiri:** ubah `int hitung = 3;` menjadi `int hitung = 0;`. Walaupun `0 > 0` bernilai false, "Hitung mundur: 0" tetap tercetak sekali. Lalu tulis ulang bagian itu sebagai `while (hitung > 0) { ... }`: sekarang tidak ada yang tercetak.

do-while cocok untuk sesuatu yang harus terjadi dulu sebelum bisa diperiksa, misalnya meminta input sampai nilainya sah:

```java
int nilai;
do {
    nilai = sc.nextInt();
} while (nilai < 0 || nilai > 100);
```

## Memilih perulangan

- **for**: banyak putaran diketahui atau bisa dihitung, misalnya 1 sampai n.
- **while**: berhenti karena suatu keadaan, dan boleh jadi tidak berputar sama sekali, misalnya sentinel.
- **do-while**: badan wajib dijalankan minimal sekali, misalnya validasi input.

Contoh while lainnya adalah menghitung banyak digit dengan terus membagi 10 sampai bilangannya habis:

```java
int bilangan = 4096;
int banyakDigit = 0;
while (bilangan > 0) {
    bilangan = bilangan / 10;    // 409, 40, 4, 0
    banyakDigit++;
}
// banyakDigit bernilai 4
```

## Catatan #cekAwal
Kondisi diperiksa **sebelum** badan dijalankan. Jika angka pertama yang dibaca sudah 0, seluruh badan while dilewati.

## Catatan #maju
Baris inilah yang membuat perulangan bisa berhenti: `angka` diganti dengan token berikutnya sebelum kondisi diperiksa lagi. Tanpa baris ini, `angka` tidak pernah berubah.

## Catatan #cekAkhir
Kondisi do-while baru diperiksa **setelah** badan dijalankan, sehingga badan selalu berjalan minimal sekali. Perhatikan titik koma di akhir baris ini.
