---
judul: Array 2 dimensi
urutan: 12
ringkasan: Menyimpan data berbentuk tabel (baris dan kolom) dalam satu variabel, lalu menelusurinya dengan perulangan bersarang.
tujuan:
  - "Membuat array 2 dimensi dan mengakses elemennya dengan dua indeks, `matriks[i][j]`"
  - "Membedakan `matriks.length` (jumlah baris) dan `matriks[i].length` (jumlah kolom pada baris ke-i)"
  - Menelusuri semua elemen matriks dengan for bersarang
  - Menghitung jumlah setiap baris matriks
visual:
  - jenis: array2d
    variabel: matriks
    baris: i
    kolom: j
  - jenis: evaluasi
  - jenis: memori
pantau: [jumlah]
---

## Data berbentuk tabel

Nilai beberapa mahasiswa untuk beberapa mata kuliah, denah kursi bioskop, papan catur: semuanya berbentuk **tabel** yang punya baris dan kolom. Untuk data seperti ini Java menyediakan **array 2 dimensi**, yang sering disebut matriks:

```java
int[][] matriks = {
    {4, 1, 3},
    {2, 5, 9},
    {6, 7, 8}
};
```

- `int[][]` (dua pasang kurung siku) artinya array 2 dimensi berisi `int`.
- Setiap `{...}` di dalamnya adalah satu baris. Matriks di atas berukuran 3 baris × 3 kolom.
- Elemen diakses dengan dua indeks, `matriks[baris][kolom]`, dan keduanya dimulai dari 0. Jadi `matriks[1][2]` adalah baris 1, kolom 2, yaitu `9`.

Matriks berukuran tertentu juga bisa dibuat dengan `new`:

```java
int[][] papan = new int[2][4];
```

Hasilnya 2 baris × 4 kolom yang semua elemennya bernilai 0.

## Array yang berisi array

Di Java, array 2 dimensi sebenarnya adalah **array yang setiap elemennya berupa array**. `matriks[1]` sendiri adalah sebuah `int[]`, yaitu baris `{2, 5, 9}`. Karena itu ada dua macam panjang:

- `matriks.length` adalah banyaknya baris (3).
- `matriks[i].length` adalah banyaknya kolom pada baris ke-`i` (juga 3 untuk matriks ini).

Di panel memori, variabel `matriks` tidak berisi angka-angkanya. Isinya **panah** yang menunjuk ke tabel di bagian atas, sama seperti array 1 dimensi yang menyimpan referensi.

## Menyusuri matriks dengan perulangan bersarang

Untuk mengunjungi setiap sel, kita memakai perulangan bersarang yang sudah kamu kenal di pelajaran sebelumnya. Perulangan **luar** memilih baris `i`, perulangan **dalam** menyusuri kolom `j` pada baris itu:

```java
for (int i = 0; i < matriks.length; i++) {
    for (int j = 0; j < matriks[i].length; j++) {
        // olah matriks[i][j]
    }
}
```

Perulangan dalam berjalan **penuh** (j = 0, 1, 2) untuk setiap satu nilai `i`, sehingga ada 3 × 3 = 9 sel yang dikunjungi.

Geser slider dan perhatikan tabel: label `i` di samping kiri menandai baris yang sedang dikerjakan, label `j` di atas menandai kolomnya, dan sel di persilangan keduanya diberi bingkai. Variabel `jumlah` dibuat ulang dengan nilai 0 setiap kali pindah baris, lalu menampung total baris itu. Tanda hijau di slider menunjukkan langkah saat `jumlah` berubah.

> **Coba sendiri:** pindahkan baris `int jumlah = 0;` ke atas perulangan luar, tepat sebelum `for (int i ...`. Geser slider lagi: `jumlah` tidak pernah kembali ke 0, sehingga output berubah menjadi total berjalan 8, 24, dan 45.

## Ukuran matriks bisa berubah

Karena perulangan dalam memakai `matriks[i].length`, kode yang sama tetap benar walaupun ukuran matriks diubah. Kita tidak perlu menulis angka 3 di mana pun.

> **Coba sendiri:** tambahkan satu angka di akhir **setiap** baris, misalnya `{4, 1, 3, 2}`. Tabel berubah menjadi 3 baris × 4 kolom dan perulangan dalam otomatis berjalan 4 kali per baris. Lalu kembalikan dan tambahkan angka di **satu** baris saja: Java mengizinkan baris-baris dengan panjang berbeda, dan `matriks[i].length` ikut menyesuaikan.

## Awas: indeks di luar batas

Indeks baris yang sah adalah 0 sampai `matriks.length - 1`, sedangkan indeks kolom 0 sampai `matriks[i].length - 1`.

> **Coba sendiri:** ubah kondisi perulangan dalam menjadi `j <= matriks[i].length`. Program berhenti dengan **ArrayIndexOutOfBoundsException** saat mencoba membaca kolom 3, padahal kolom terakhir adalah kolom 2.

## Catatan #baris
`matriks.length` adalah banyaknya **baris**, karena matriks adalah array yang setiap elemennya berupa array baris. Setiap putaran perulangan luar memilih satu baris `i`.

## Catatan #mulaiNol
Letak baris ini penting: selama berada di dalam perulangan luar, `jumlah` kembali ke 0 setiap kali pindah ke baris baru, sehingga total baris sebelumnya tidak ikut terbawa.

## Catatan #kolom
`matriks[i].length` adalah banyaknya kolom pada baris ke-`i`. Untuk setiap satu nilai `i`, perulangan dalam ini berjalan penuh dari `j = 0` sampai kolom terakhir.
