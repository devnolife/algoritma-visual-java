---
judul: "Konstruktor, this, & method objek"
urutan: 2
ringkasan: Membuat objek yang langsung siap pakai lewat konstruktor, mengubah isinya hanya lewat method, dan melindungi field dengan private.
tujuan:
  - Menulis konstruktor, termasuk beberapa konstruktor (overload) yang saling memanggil dengan this(...)
  - Memakai this untuk membedakan field dari parameter yang namanya sama
  - Menulis method objek yang mengubah state, serta getter dan setter yang memvalidasi nilai
  - Menulis toString() agar objek bisa dicetak dengan rapi
visual:
  - jenis: memori
  - jenis: evaluasi
pantau: [teh, roti]
---

## Objek yang lahir siap pakai

Di pelajaran sebelumnya, membuat satu mahasiswa butuh lima baris: satu `new`, lalu empat baris pengisian field. Ada dua masalah di situ. Kalau satu baris terlupa, field-nya diam-diam tetap `null` atau 0. Lalu siapa pun bisa menulis nilai yang tidak masuk akal, misalnya IPK 7,5.

Class `Produk` di editor menyelesaikan kedua masalah itu untuk data kantin kampus. Masalah pertama diselesaikan oleh **konstruktor**, yaitu blok kode yang otomatis dijalankan setiap kali objek dibuat dengan `new`. Bentuknya mirip method, tetapi namanya **sama dengan nama class** dan tidak punya tipe kembalian, bahkan `void` pun tidak:

```java
Produk(String nama, int harga, int stok) {
    this.nama = nama;
    this.harga = harga;
    this.stok = stok;
}
```

Pernyataan `new Produk("Es teh", 5000, 10)` di baris 48 bekerja dalam tiga tahap:

1. Java membuat objek baru di heap dengan semua field bernilai default.
2. Konstruktor dipanggil dengan argumen `"Es teh"`, `5000`, dan `10`.
3. Setelah konstruktor selesai, referensi ke objek itu disimpan di `teh`.

Geser slider ke langkah sesudah baris 48. Di panel memori muncul frame baru di atas `main` yang berisi parameter `nama`, `harga`, `stok`, dan satu variabel istimewa, **`this`**. Panah `this` menunjuk objek yang sedang dibuat, yang field-nya masih `null` dan 0. Baris 7–9 lalu mengisinya satu per satu. Variabel `teh` baru muncul di frame `main` setelah konstruktor selesai; tanda hijau pertama di slider menandai saat itu.

Bila class tidak punya konstruktor sama sekali, Java menyediakan **konstruktor default** tanpa parameter. Konstruktor itulah yang dipakai `new Mahasiswa()` di pelajaran sebelumnya. Begitu kamu menulis konstruktor sendiri, konstruktor default itu tidak ada lagi.

## `this`: objek yang sedang bekerja

Di dalam konstruktor, nama `nama` merujuk ke **parameter**, karena parameter menutupi field yang namanya sama. Untuk menyebut field milik objek, tulis `this.nama`. Jadi `this.nama = nama;` berarti "isi field `nama` milik objek ini dengan nilai parameter `nama`".

> **Coba sendiri:** hapus `this.` di baris 7 sehingga menjadi `nama = nama;`. Program tetap berjalan, tetapi kedua produk tercetak sebagai `null Rp5000 (stok 7)` dan `null Rp13000 (stok 4)`. Baris itu hanya menyalin parameter ke dirinya sendiri, sehingga field `nama` di heap tetap `null`.

Satu class boleh punya beberapa konstruktor asalkan daftar parameternya berbeda. Ini disebut **overload**. `new Produk("Roti bakar", 12000)` di baris 49 memanggil konstruktor dua parameter di baris 12. Konstruktor itu tidak mengisi field sendiri, tetapi meneruskan pekerjaannya dengan `this(nama, harga, 0)` ke konstruktor tiga parameter. Dengan begitu, kode pengisian field cukup ditulis sekali. Di panel memori, kedua frame konstruktor sempat bertumpuk, dan `this` di keduanya menunjuk objek yang sama.

## Method objek mengubah state

Method tanpa `static` adalah **method objek** (*instance method*). Method ini selalu dipanggil lewat sebuah objek, misalnya `roti.tambahStok(4)` di baris 50. Di dalamnya, `stok` berarti `this.stok`, yaitu stok milik objek yang dipakai untuk memanggil. Isi semua field sebuah objek pada suatu saat disebut **state** objek itu, dan method seperti `tambahStok` atau `jual` mengubah state tersebut.

Method `jual` juga memeriksa keadaan sebelum bertindak. `teh.jual(3)` berhasil karena stok teh 10, sehingga stoknya turun menjadi 7 dan method mengembalikan `true`. `roti.jual(5)` gagal karena stok roti hanya 4, sehingga method langsung mengembalikan `false` tanpa mengubah apa pun. Panel evaluasi menampilkan perbandingan `jumlah > stok` untuk masing-masing objek.

Setiap method di class ini berbiaya **O(1)**: tidak ada perulangan, jadi jumlah langkahnya tetap berapa pun besar stoknya.

## `private`, getter, dan setter

Masalah kedua diselesaikan dengan **enkapsulasi**. Ketiga field ditandai **`private`**, sehingga hanya kode di dalam class `Produk` yang boleh menyentuhnya. Kode di luar class harus lewat method:

- **Getter** membaca field, misalnya `getStok()` di baris 16.
- **Setter** mengubah field, misalnya `setHarga(int harga)` di baris 20. Setter ini **memvalidasi** nilainya lebih dulu. Harga negatif ditolak, sehingga baris 53 hanya mencetak `Harga -500 ditolak` dan harga teh tetap 5000.

Karena satu-satunya jalan untuk mengubah harga melewati pemeriksaan itu, tidak ada objek `Produk` yang bisa berharga negatif. Bandingkan baris 53 dan 54 di panel memori: field `harga` milik teh tidak berubah sama sekali, sedangkan harga roti menyala hijau saat berubah menjadi 13000.

> **Coba sendiri:** ganti baris 53 menjadi `teh.harga = -500;`. Kode langsung ditolak dengan error `harga has private access in Produk`, karena `main` berada di luar class `Produk`.

## `toString()`: cara objek memperkenalkan diri

`System.out.println(teh)` di baris 55 otomatis memanggil `teh.toString()`, begitu pula penyambungan teks seperti `"Produk: " + teh`. Method `toString()` sebenarnya sudah dimiliki setiap objek sejak awal, tetapi versi bawaannya hanya mencetak nama class, tanda `@`, dan sebuah kode hash heksadesimal. Kita menggantinya (*override*) dengan versi sendiri di baris 41.

Ada dua aturan di sini. Method ini wajib `public`, karena versi bawaannya juga `public`. Anotasi `@Override` di baris 40 tidak wajib, tetapi sangat dianjurkan: dengan anotasi itu, javac memastikan method-mu benar-benar menggantikan `toString()` bawaan.

> **Coba sendiri:** ganti `toString` di baris 41 menjadi `tostring` (huruf s kecil). Karena salah ketik, method itu tidak lagi menggantikan apa pun, dan javac menolaknya dengan error `method does not override or implement a method from a supertype` di baris 40. Setelah itu hapus baris `@Override`. Programnya berjalan, tetapi teh dan roti kini tercetak seperti `Produk@2e2ac0ea`. Di JVM asli angka hash ini berubah setiap kali program dijalankan, sedangkan simulator membuatnya tetap.

## Catatan #this
`this` menunjuk objek yang **sedang dibuat**. `this.nama` adalah field milik objek itu, sedangkan `nama` saja adalah **parameter** konstruktor.

## Catatan #delegasi
`this(nama, harga, 0)` memanggil **konstruktor lain** di class yang sama, sehingga kode pengisian field cukup ditulis sekali. Panggilan `this(...)` wajib menjadi pernyataan **pertama** di konstruktor.

## Catatan #validasi
Setter memeriksa nilai **sebelum** menyimpannya. Harga negatif ditolak dan `return` langsung mengakhiri method, sehingga baris `this.harga = harga;` tidak pernah dijalankan.
