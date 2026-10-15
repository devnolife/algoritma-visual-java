---
judul: String
urutan: 15
ringkasan: Mengenal String sebagai objek yang isinya tidak bisa diubah, memakai method-method pentingnya, dan membandingkan teks dengan benar.
tujuan:
  - Menjelaskan bahwa variabel String menyimpan referensi ke objek String di heap
  - "Memakai method String yang umum: `length`, `charAt`, `substring`, `indexOf`, `contains`, `toUpperCase`, dan `equals`"
  - "Membedakan `==` (membandingkan alamat objek) dan `equals` (membandingkan isi teks)"
  - Menyusuri karakter String dengan perulangan untuk membalik sebuah kata
visual:
  - jenis: string
    variabel: kata
  - jenis: string
    variabel: balik
  - jenis: memori
    stringSebagaiObjek: true
pantau: [balik]
input: "katak\n"
---

## String adalah objek

Teks di Java disimpan dengan tipe `String`. Berbeda dengan `int` atau `char`, String adalah **objek**. Variabel `kata` tidak berisi huruf-hurufnya, melainkan **referensi** (panah) ke objek String di heap. Lihat panel memori: setiap variabel String punya panah ke kotak teks di kolom Heap.

Seperti array, setiap karakter String punya indeks yang dimulai dari 0. Panel paling atas menampilkan isi `kata` beserta indeks setiap hurufnya, dan panel kedua menampilkan `balik` yang tumbuh satu huruf setiap putaran perulangan.

## Method-method penting

Untuk `String kata = "kasur";`:

- `kata.length()` menghasilkan `5`, yaitu banyaknya karakter. Perhatikan tanda kurungnya; pada array ditulis `.length` tanpa kurung.
- `kata.charAt(0)` menghasilkan `'k'`, karakter (bertipe `char`) di indeks 0.
- `kata.substring(2)` menghasilkan `"sur"`, dari indeks 2 sampai akhir.
- `kata.substring(0, 3)` menghasilkan `"kas"`, dari indeks 0 sampai **sebelum** indeks 3.
- `kata.indexOf("u")` menghasilkan `3`, posisi pertama huruf u. Hasilnya `-1` jika tidak ditemukan.
- `kata.contains("sur")` menghasilkan `true`.
- `kata.toUpperCase()` menghasilkan `"KASUR"`.
- `kata.equals("kasur")` menghasilkan `true`.

> **Coba sendiri:** tambahkan `System.out.println(kata.substring(0, 3));` di akhir `main`, lalu cocokkan hasilnya dengan indeks di panel atas. Coba juga method lain dari daftar di atas.

## Isi String tidak bisa diubah

String bersifat **immutable**: isi sebuah objek String tidak pernah berubah setelah dibuat. `toUpperCase()` tidak mengubah `kata`; method itu **mengembalikan** String hasilnya. Di panel memori, `besar` menunjuk ke objek baru `"KASUR"`, sedangkan `kata` tetap menunjuk `"kasur"`.

Begitu pula `balik += kata.charAt(i);`. Huruf tidak ditempelkan ke objek yang lama. Setiap putaran membuat objek baru (`"r"`, `"ru"`, `"rus"`, dan seterusnya), lalu panah `balik` berpindah ke objek itu.

> **Coba sendiri:** tambahkan baris `kata.toUpperCase();` tepat di bawah `String kata = "kasur";`. Geser slider: `kata` tetap `"kasur"`, karena hasil method itu tidak disimpan ke variabel mana pun. Agar `kata` menunjuk ke versi huruf besar, tulis `kata = kata.toUpperCase();`.

## == atau equals?

- `==` pada String membandingkan **alamat**: apakah kedua panah menunjuk objek yang sama.
- `equals` membandingkan **isi** teks, huruf demi huruf.

Literal yang sama, seperti `"kasur"` pada `kata` dan `lagi`, disimpan Java sebagai satu objek saja. Karena itu `kata == lagi` bernilai `true`; perhatikan kedua panahnya menuju kotak yang sama. Sebaliknya, `new String("kasur")` selalu membuat objek baru, sehingga `kata == salinan` bernilai `false` walaupun isinya sama, sedangkan `kata.equals(salinan)` bernilai `true`. String yang dibentuk saat program berjalan, misalnya hasil `+=`, juga merupakan objek baru.

Jadi, untuk membandingkan isi String, **selalu pakai `equals`**.

> **Coba sendiri:** ganti `new String("kasur")` menjadi `"kasur"` saja. Panah `salinan` kini menunjuk objek yang sama dengan `kata`, sehingga `kata == salinan` menjadi `true`. Lalu tambahkan `System.out.println(balik == "rusak");` di akhir program: hasilnya `false`, padahal isinya sama.

## Menyusuri dan membalik String

Perulangan di editor berjalan mundur dari indeks terakhir, `kata.length() - 1`, sampai indeks 0. Setiap karakter ditempelkan ke `balik`, sehingga `"kasur"` menjadi `"rusak"`.

Untuk menyusuri dari depan, mulai dari indeks 0 sampai sebelum `kata.length()`:

```java
for (int i = 0; i < kata.length(); i++) {
    System.out.println(i + ": " + kata.charAt(i));
}
```

Potongan ini mencetak `0: k`, `1: a`, dan seterusnya sampai `4: r`.

Kata yang sama dengan kebalikannya, seperti `"katak"` dan `"malam"`, disebut **palindrom**. Di tab Tantangan, kamu akan membuat program pemeriksanya.

## Catatan #baru
`toUpperCase()` tidak mengubah `kata`; method ini **mengembalikan** String hasilnya, dan `besar` menunjuk ke String itu. Bandingkan panah `kata` dan `besar` di panel memori.

## Catatan #samaDengan
`==` membandingkan alamat objek, bukan isinya. Jika `salinan` dibuat dengan `new`, panahnya menunjuk objek lain walaupun isinya sama, sehingga hasilnya `false`.

## Catatan #balik
`+=` tidak menambahkan huruf ke objek yang lama. Java membuat String baru yang satu huruf lebih panjang, lalu panah `balik` pindah ke objek baru itu.
