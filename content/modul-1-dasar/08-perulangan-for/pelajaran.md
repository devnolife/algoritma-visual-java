---
judul: Perulangan for
urutan: 8
ringkasan: Mengulang blok kode sebanyak yang kita tentukan, sambil melacak variabel penghitung i langkah demi langkah.
tujuan:
  - Menjelaskan urutan kerja inisialisasi, kondisi, dan update pada for
  - Melacak nilai variabel penghitung dan akumulator di setiap putaran
  - Menghindari kesalahan off-by-one akibat tertukarnya < dan <=
visual:
  - jenis: evaluasi
  - jenis: memori
pantau: [jumlah]
---

## Mengulang tanpa menyalin kode

Bayangkan harus mencetak angka 1 sampai 100: menulis 100 baris `println` jelas melelahkan. **Perulangan** (loop) menjalankan blok kode yang sama berkali-kali. Jika banyaknya putaran sudah diketahui, pilihan yang paling umum adalah `for`.

```java
for (inisialisasi; kondisi; update) {
    // badan perulangan
}
```

Kepala `for` terdiri atas tiga bagian yang dipisah titik koma:

1. **Inisialisasi** `int i = 1`: dijalankan **sekali** di awal untuk menyiapkan variabel penghitung.
2. **Kondisi** `i <= n`: dicek **sebelum** setiap putaran. Jika true, badan dijalankan; jika false, perulangan selesai.
3. **Update** `i++`: dijalankan **setelah** badan, sebelum kondisi dicek lagi.

Urutannya: inisialisasi → cek → badan → update → cek → badan → update → … → cek bernilai false → selesai.

## Menelusuri jejak i

Geser slider pelan-pelan. Baris `for` dikunjungi berkali-kali, dan setiap kunjungan adalah langkah tersendiri: inisialisasi, cek kondisi, atau update. Saat kondisi dicek, panel evaluasi menampilkan misalnya `i <= n` → `3 <= 5` → `true`.

Dengan `n = 5`, kondisi dicek **6 kali**: lima kali true, lalu sekali false (`6 <= 5`) yang mengakhiri perulangan. Jadi `i` sempat bernilai 6. Perhatikan juga panel memori: kotak `i` hilang begitu perulangan selesai. Variabel yang dideklarasikan di kepala `for` hanya berlaku di dalam perulangan itu; memakainya sesudah perulangan menghasilkan error `cannot find symbol`.

## Pola akumulasi

`jumlah = jumlah + i;` adalah pola **akumulasi**: nilai lama dibaca, ditambah, lalu disimpan kembali. Penampungnya harus diberi nilai awal yang tepat **sebelum** perulangan. Tanda hijau di slider menandai setiap langkah yang mengisi `jumlah`: mula-mula 0, lalu 1, 3, 6, 10, dan 15.

> **Coba sendiri:** ubah `jumlah + i` menjadi `jumlah * i`. Hasilnya selalu 0. Mengapa? Ubah nilai awal `jumlah` menjadi 1, dan program kini menghitung 1 × 2 × 3 × 4 × 5 = 120.

## Off-by-one: kurang atau lebih satu putaran

Kesalahan paling sering pada `for` adalah banyak putaran yang meleset satu, disebut **off-by-one**:

- `i < n` berhenti sebelum `n`: dengan `n = 5`, `i` hanya bernilai 1 sampai 4.
- `i <= n` ikut menghitung `n`: `i` bernilai 1 sampai 5.
- Memulai dari `i = 0` menambah satu putaran di awal.

> **Coba sendiri:** ubah `<=` menjadi `<`, lalu hitung baris output dan lihat totalnya. Kembalikan, lalu ubah `int i = 1` menjadi `int i = 0`. Berapa kali kondisi dicek sekarang?

Rumus cepatnya: `for (int i = a; i <= b; i++)` berputar `b - a + 1` kali, sedangkan dengan `i < b` berputar `b - a` kali.

## Variasi update

Update tidak harus `i++`:

```java
for (int i = 5; i >= 1; i--) {
    System.out.print(i + " ");    // 5 4 3 2 1
}
for (int i = 0; i <= 10; i += 2) {
    System.out.print(i + " ");    // 0 2 4 6 8 10
}
```

Pastikan update membawa `i` **mendekati** kondisi berhenti. Jika `i++` tertukar menjadi `i--` pada program ini, `i` makin kecil sehingga kondisi `i <= n` terus bernilai true dan perulangan tidak kunjung selesai. Perulangan tak berujung dibahas di pelajaran berikutnya.

Waspadai juga titik koma setelah kepala: `for (int i = 1; i <= n; i++);`. Titik koma itu menjadi badan perulangan yang kosong, sehingga blok `{ }` sesudahnya bukan lagi badan perulangan, dan `i` tidak dikenal di dalamnya (`cannot find symbol`).

## Catatan #kepala
Baris ini dikunjungi berkali-kali dengan tugas berbeda: inisialisasi `int i = 1` (sekali saja), cek kondisi `i <= n` (sebelum setiap putaran), atau update `i++` (setelah setiap putaran). Kartu ini menyebutkan bagian mana yang sedang dijalankan.

## Catatan #akumulasi
Nilai lama `jumlah` dibaca, diolah bersama `i`, lalu hasilnya disimpan kembali ke `jumlah`. Karena itu `jumlah` perlu nilai awal sebelum perulangan dimulai: 0 untuk penjumlahan, 1 untuk perkalian.
