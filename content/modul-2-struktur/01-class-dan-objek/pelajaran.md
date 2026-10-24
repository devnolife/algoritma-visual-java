---
judul: "Class & objek"
urutan: 1
ringkasan: Membuat tipe data sendiri dengan class, membuat objeknya dengan new, lalu melihat bahwa variabel objek hanya menyimpan panah ke objek di heap.
tujuan:
  - Menulis class berisi beberapa field, lalu membuat objeknya dengan new
  - Menyebutkan nilai default field, yaitu 0, 0.0, false, dan null
  - Membedakan menyalin nilai primitif dengan menyalin referensi (alias)
  - Menjelaskan arti null dan mencegah NullPointerException dengan memeriksa null lebih dulu
visual:
  - jenis: memori
  - jenis: evaluasi
pantau: [umurBudi, ketua]
---

## Cetak biru dan bangunannya

Bayangkan formulir pendaftaran mahasiswa baru. Bagian akademik cukup merancang **satu** blanko berisi kolom nama, umur, IPK, dan status aktif. Setiap mahasiswa lalu mengisi lembarnya sendiri, sehingga ada banyak lembar dengan bentuk yang sama tetapi isinya berbeda.

Di Java, blanko itu adalah **class** dan setiap lembar yang terisi adalah **objek**. Sampai Modul 1, satu variabel hanya bisa menyimpan satu nilai (`int`, `double`, `String`) atau satu array berisi nilai yang setipe. Data seorang mahasiswa terdiri atas beberapa nilai berbeda tipe yang selalu berjalan bersama. Dengan class, kamu membuat tipe data sendiri yang menampung semuanya:

```java
class Mahasiswa {
    String nama;
    int umur;
    double ipk;
    boolean aktif;
}
```

Variabel di dalam class disebut **field**. Class sendiri belum berisi data apa pun; ia hanya **cetak biru**. Data baru ada setelah kamu membuat objek dengan operator **`new`**:

```java
Mahasiswa ani = new Mahasiswa();
```

Baca baris itu sebagai "buat satu objek baru dari class `Mahasiswa`, lalu simpan alamatnya di variabel `ani`". Dari satu class kamu bisa membuat objek sebanyak yang dibutuhkan, dan setiap objek punya field-nya sendiri: `ani.umur` dan `budi.umur` adalah dua kotak yang berbeda. Field dibaca dan diisi dengan tanda titik, misalnya `ani.nama = "Ani";`.

Satu berkas boleh berisi beberapa class, tetapi hanya satu yang `public`, yaitu class yang namanya sama dengan nama berkas (`Main`). Karena itu `Mahasiswa` ditulis tanpa `public`.

## Objek tinggal di heap, variabel menyimpan panahnya

Panel memori punya dua wilayah. Di kiri ada **call stack** berisi frame `main` dengan variabel-variabel lokalnya. Di kanan ada **heap**, tempat semua objek tinggal. Geser slider ke langkah sesudah baris 10: `new Mahasiswa()` membuat kotak berlabel `Mahasiswa` dengan empat baris field. Variabel `ani` di frame `main` tidak berisi keempat field itu. Isinya hanya **referensi**, yaitu alamat objek, yang digambar sebagai panah ke kotak di heap.

Field yang baru dibuat tidak kosong melompong. Java mengisinya dengan **nilai default**:

| Tipe field | Nilai default |
|---|---|
| `int`, `long`, `short`, `byte` | `0` |
| `double`, `float` | `0.0` |
| `boolean` | `false` |
| `char` | karakter bernilai 0 |
| `String`, array, dan class lain | `null` |

Itulah sebabnya baris 11 mencetak `null 0 0.0 false`. Baris 12–15 lalu mengisi field satu per satu; perhatikan field yang sedang ditulis menyala hijau di kotak objek. Nilai default ini hanya berlaku untuk field dan elemen array. Variabel lokal di dalam method tetap wajib diberi nilai sebelum dibaca.

Membaca atau menulis satu field berbiaya **O(1)**, sama seperti mengakses elemen array lewat indeks: Java langsung tahu letak field itu di dalam objek, tanpa perlu mencarinya.

## Menyalin nilai atau menyalin panah?

Operator `=` selalu menyalin isi kotak variabel. Bedanya terletak pada apa yang ada di dalam kotak itu.

- **Variabel primitif menyimpan nilainya sendiri.** Baris 21 menyalin **angka** 20 dari `budi.umur` ke `umurBudi`. Baris 22 mengubah `umurBudi` menjadi 21, tetapi `budi.umur` tetap 20. Keduanya dua kotak yang terpisah, seperti yang dicetak baris 23.
- **Variabel objek menyimpan panah.** Baris 25 menyalin **panahnya**, bukan objeknya. Sekarang `ketua` dan `ani` menunjuk objek yang **sama**. Nama kedua untuk objek yang sama ini disebut **alias**. Akibatnya, `ketua.ipk = 3.9;` di baris 26 juga mengubah IPK yang terlihat lewat `ani`, sehingga baris 27 mencetak `Ani: IPK 3.9`.

Di panel memori, kedua panah dari `ani` dan `ketua` berakhir di kotak yang sama. Kartu penjelasan di baris 26 bahkan menulis `ani.ipk berubah dari 3.5 menjadi 3.9`, padahal kodenya menulis `ketua.ipk`: dua nama, satu objek. Operator `==` pada objek juga membandingkan panah, bukan isi: `ketua == ani` bernilai `true` karena keduanya menunjuk objek yang sama (baris 28).

Menyalin referensi berbiaya O(1) seberapa pun besar objeknya, karena yang disalin hanya alamatnya. Java tidak pernah menyalin isi objek secara diam-diam. Bila kamu butuh salinan yang benar-benar terpisah, buat objek baru dengan `new`, lalu salin field-nya satu per satu (tantangan pertama).

> **Coba sendiri:** ganti baris 25 menjadi `Mahasiswa ketua = new Mahasiswa();`. Heap kini berisi tiga objek. Perubahan IPK di baris 26 masuk ke objek baru yang namanya masih `null`, sehingga output berubah menjadi `Ani: IPK 3.5` dan `ketua == ani? false`.

## `null`: panah yang tidak menunjuk apa-apa

Variabel objek boleh bernilai **`null`**, artinya tidak menunjuk objek mana pun. Baris 30 menyatakan bahwa wakil ketua belum dipilih: kotak `wakil` di panel memori berisi `null`, tanpa panah.

Membaca atau menulis field lewat `null` mustahil, karena tidak ada objek yang bisa dibaca. Java menghentikan program dengan **NullPointerException** (sering disingkat NPE), error yang paling sering ditemui programmer Java. Untungnya, pesan error JDK 21 menyebut dengan tepat variabel mana yang `null`. Karena itu baris 31 memeriksa `wakil != null` lebih dulu, dan `wakil.nama` hanya dibaca bila pemeriksaan itu lolos.

> **Coba sendiri:** ganti baris 25 menjadi `Mahasiswa ketua = null;`. Program berhenti di baris 26 dengan `NullPointerException: Cannot assign field "ipk" because "ketua" is null`. Java hendak **menulis** (*assign*) field `ipk`, tetapi `ketua` tidak menunjuk objek mana pun.

> **Coba sendiri:** ganti baris 31 menjadi `if (true) {` sehingga pemeriksaannya hilang. Kali ini pesannya `Cannot read field "nama" because "wakil" is null`: Java gagal **membaca** (*read*) field `nama` di baris 32.

## Catatan #baru
`new Mahasiswa()` membuat **objek baru** di heap dan mengisi semua field-nya dengan nilai default. Variabel `ani` hanya menyimpan **referensi** (panah) ke objek itu.

## Catatan #alias
Yang disalin hanya **panahnya**. `ketua` dan `ani` kini menunjuk objek yang **sama**, jadi perubahan lewat `ketua` juga terlihat lewat `ani`.

## Catatan #null
`null` berarti **tidak menunjuk objek apa pun**. Membaca `wakil.nama` saat ini akan memicu `NullPointerException`, jadi periksa dulu dengan `wakil != null`.
