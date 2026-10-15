---
judul: "Variabel & tipe data"
urutan: 2
ringkasan: Menyimpan data di variabel bertipe, mengenal tipe primitif dan String, serta membuat konstanta dengan final.
tujuan:
  - Mendeklarasikan dan menginisialisasi variabel
  - Memilih tipe data yang tepat untuk sebuah nilai
  - Menamai variabel sesuai aturan dan kebiasaan Java
  - Mengubah isi variabel dan membuat konstanta dengan final
visual:
  - jenis: memori
pantau: [umur]
---

## Variabel adalah kotak berlabel

**Variabel** adalah tempat menyimpan data selama program berjalan. Bayangkan sebuah kotak yang punya nama dan jenis isi. Di Java, setiap variabel punya **tipe** yang ditentukan saat dibuat dan tidak bisa diganti lagi.

```java
int umur;
umur = 19;
double tinggi = 1.65;
```

Baris pertama adalah **deklarasi**: membuat kotak bernama `umur` bertipe `int`. Baris kedua adalah **inisialisasi**: mengisi kotak itu untuk pertama kali. Baris ketiga melakukan keduanya sekaligus.

Geser slider dan perhatikan panel Memori. Setelah baris 3, kotak `umur` sudah ada tetapi isinya `?`, karena belum diberi nilai. Setelah baris 4, isinya menjadi `19`.

> **Coba sendiri:** hapus baris 4, lalu baca pesan di tab Masalah: `variable umur might not have been initialized`. Java menolak membaca kotak yang belum pernah diisi.

## Tipe data

Java punya delapan **tipe primitif**. Lima yang paling sering dipakai muncul di baris 3–8:

- `int`: bilangan bulat, kira-kira ±2,1 miliar (`umur`).
- `long`: bilangan bulat yang sangat besar (`pendudukDunia`).
- `double`: bilangan pecahan dengan titik desimal (`tinggi`).
- `char`: satu karakter di antara kutip tunggal (`golonganDarah`).
- `boolean`: hanya `true` atau `false` (`sudahLulus`).

Tiga sisanya jarang dipakai di modul ini: `byte` dan `short` (bilangan bulat yang lebih kecil daripada `int`) serta `float` (pecahan yang kurang teliti dibanding `double`, literalnya diakhiri `f`, mis. `1.5f`).

Beberapa hal yang sering terlewat:

- Angka bulat yang ditulis langsung dianggap `int`. Angka yang melebihi batas `int` harus diberi akhiran `L` agar menjadi `long`.
- `char` memakai kutip tunggal (`'O'`), sedangkan teks memakai kutip ganda (`"Rina"`).
- `String` untuk teks **bukan** tipe primitif, melainkan class (karena itu huruf S-nya besar). Meski begitu, kita akan sangat sering memakainya.

Setiap kotak di panel Memori punya badge tipe berwarna. Arahkan kursor ke badge itu (mis. `int`) untuk melihat rentang nilai yang bisa ditampungnya. Kotak `char` juga menampilkan angka kecil, yaitu kode Unicode hurufnya.

> **Coba sendiri:** hapus huruf `L` di baris 8. Java menolak dengan `integer number too large`, karena 8100000000 terlalu besar untuk `int`.

## Aturan memberi nama

- Nama boleh berisi huruf, angka, `_`, dan `$`, tetapi tidak boleh diawali angka dan tidak boleh mengandung spasi. Jadi `2umur` dan `nilai akhir` tidak sah.
- Nama tidak boleh sama dengan kata kunci Java seperti `int`, `class`, atau `public`.
- Huruf besar dan kecil dibedakan: `umur` dan `Umur` adalah dua nama yang berbeda.
- Kebiasaan (konvensi) Java: variabel ditulis *camelCase*, mis. `nilaiAkhir` dan `golonganDarah`; konstanta ditulis huruf besar dengan garis bawah, mis. `SKS_MAKSIMUM`.

## Mengubah isi variabel

Isi variabel boleh diganti kapan saja dengan tanda `=`. Pada baris 12, `umur = umur + 1;` dikerjakan dalam dua tahap: Java menghitung dulu sisi kanan, `umur + 1`, memakai nilai lama (19 + 1), lalu menyimpan hasilnya ke `umur`. Kotak `umur` berubah dari 19 menjadi 20, dan slider memberi tanda hijau pada langkah itu.

Saat mengganti isi, jangan menulis tipenya lagi. `int umur = 20;` berarti membuat variabel baru, sehingga Java menolak dengan `variable umur is already defined in method main(String[])`.

Tipe sebuah kotak juga tidak bisa diganti. Java adalah bahasa yang **strongly typed**: kotak `int` hanya menerima bilangan bulat.

> **Coba sendiri:** ubah baris 4 menjadi `umur = 19.5;`. Java menolak dengan `incompatible types: possible lossy conversion from double to int`. Kita akan membahas pesan ini di pelajaran berikutnya.

## Konstanta dengan final

Kata kunci `final` membuat variabel yang isinya tidak boleh diubah setelah diisi, disebut **konstanta**. Gunakan untuk nilai yang memang tetap, seperti batas SKS per semester.

> **Coba sendiri:** tambahkan `SKS_MAKSIMUM = 30;` setelah baris 10. Java menolak dengan `cannot assign a value to final variable SKS_MAKSIMUM`.

## Catatan #deklarasi
Baris ini hanya **mendeklarasikan** `umur`: kotaknya sudah dibuat, tetapi isinya belum ada (tanda `?`). Variabel lokal wajib diisi dulu sebelum dibaca.

## Catatan #final
`final` mengunci nilai `SKS_MAKSIMUM`. Nama konstanta ditulis huruf besar semua agar langsung terlihat berbeda dari variabel biasa.

## Catatan #ubah
Tanda `=` berarti **isi dengan**, bukan "sama dengan". Sisi kanan dihitung lebih dulu memakai nilai lama (19 + 1), baru hasilnya disimpan ke `umur`.
