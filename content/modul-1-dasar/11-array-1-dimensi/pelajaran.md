---
judul: Array 1 dimensi
urutan: 11
ringkasan: Menyimpan banyak nilai sejenis dalam satu variabel, lalu menelusurinya dengan for.
tujuan:
  - Membuat array dan mengakses elemennya lewat indeks
  - Menelusuri seluruh elemen array dengan for dan .length
  - Mencari nilai terbesar memakai variabel penampung
visual:
  - jenis: array
    variabel: nilai
    gaya: sel
    penunjuk: [i]
  - jenis: evaluasi
  - jenis: memori
pantau: [maks]
---

## Satu nama, banyak kotak

Bayangkan kamu menyimpan nilai lima mahasiswa. Membuat lima variabel (`nilai1`, `nilai2`, …) melelahkan. **Array** menyimpan banyak nilai **bertipe sama** di bawah satu nama:

```java
int[] nilai = {4, 9, 2, 7, 5};
```

- `int[]` artinya "array berisi int". Semua elemennya wajib bertipe `int`.
- Setiap elemen punya **indeks** yang dimulai dari **0**: `nilai[0]` bernilai 4, `nilai[4]` bernilai 5.
- Panjang array dibaca dengan `nilai.length` (tanpa tanda kurung). Indeks terakhir selalu `length - 1`.

Array juga bisa dibuat dengan ukuran tertentu: `int[] skor = new int[3];` berisi `{0, 0, 0}`, karena elemen `int` bernilai awal 0.

Perhatikan panel memori: variabel `nilai` tidak berisi angka-angkanya, melainkan **panah** yang menunjuk ke array. Variabel array menyimpan *referensi* (alamat) array.

## Mencari nilai terbesar

Algoritmanya mirip cara kita memeriksa kertas ujian satu per satu:

1. Anggap elemen pertama sebagai yang terbesar: `maks = nilai[0]`.
2. Periksa elemen berikutnya satu per satu dengan `for`.
3. Jika menemukan elemen yang lebih besar dari `maks`, ganti `maks`.

Geser slider dan perhatikan: penunjuk **i** bergerak di bawah array, kotak oranye menandai elemen yang sedang **dibandingkan**, dan kotak hijau menandai nilai yang baru **ditulis**.

> **Coba sendiri:** hapus baris `maks = nilai[i];`, lalu geser slider. Kondisi `if` tetap dicek, tetapi `maks` tidak pernah berubah, sehingga hasilnya salah.

## Awas: di luar batas

Indeks yang sah hanya `0` sampai `length - 1`. Ubah kondisi perulangan menjadi `i <= nilai.length` dan lihat apa yang terjadi: Java menghentikan program dengan **ArrayIndexOutOfBoundsException**.

## Catatan #awal
Kita mulai dengan **menganggap** elemen pertama sebagai yang terbesar. Ini aman karena array ini pasti punya minimal satu elemen.

## Catatan #banding
`maks` hanya diganti bila elemen yang diperiksa **lebih besar**, karena itu operatornya `>`. Apa yang terjadi jika diganti `<`?
