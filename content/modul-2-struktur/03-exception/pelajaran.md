---
judul: Exception
urutan: 3
ringkasan: Melaporkan keadaan gagal dengan melempar exception, lalu menangkapnya di tempat yang tahu cara menanganinya, lengkap dengan finally dan stack trace.
tujuan:
  - Melempar exception dengan throw dan menangkapnya dengan try, catch, dan finally
  - Menelusuri perambatan exception dari method yang melempar ke pemanggil yang menangkapnya
  - Membuat exception sendiri dan membedakan checked exception dari unchecked exception
  - Membaca stack trace untuk menemukan asal sebuah exception
visual:
  - jenis: memori
  - jenis: konsol
pantau: [harga]
---

## Ketika rencana tidak berjalan mulus

Kamu membayar belanjaan kantin satu per satu dengan dompet digital. Barang ketiga ternyata lebih mahal daripada sisa saldo. Method `bayar` tahu bahwa ada yang salah, tetapi tidak tahu harus berbuat apa. Apakah seluruh belanjaan dibatalkan? Perlu menampilkan pesan? Keputusan itu milik kode yang memanggilnya.

Untuk keadaan seperti ini, Java punya **exception**: sebuah objek yang melaporkan keadaan luar biasa. Method yang menemukan masalah **melempar** (*throw*) exception, lalu kode yang tahu cara menanganinya **menangkap** (*catch*) exception itu. Di Modul 1 kamu sudah bertemu exception yang menghentikan program, misalnya `ArrayIndexOutOfBoundsException`. Sekarang kamu belajar melempar exception sendiri dan menangkapnya sebelum program berhenti.

## Melempar dan menangkap

Lihat method `bayar` di baris 14–22. Bila harga melebihi saldo, baris 19 membuat objek exception dengan `new` lalu melemparnya dengan **`throw`**:

```java
throw new SaldoKurangException("saldo " + saldo + ", kurang " + (harga - saldo));
```

Begitu `throw` dijalankan, method langsung berhenti, sehingga baris 21 (`saldo -= harga;`) tidak pernah dijalankan untuk barang itu. Teks yang dikirim ke konstruktor menjadi pesan exception, dan pesan itu bisa dibaca kembali dengan `getMessage()`.

Di `main`, kode yang mungkin gagal dibungkus **`try`**. Setiap blok **`catch`** menyebut satu jenis exception yang sanggup ia tangani. Blok **`finally`** selalu dijalankan setelahnya, baik ada exception maupun tidak, sehingga cocok untuk pekerjaan penutup seperti mencetak struk atau menutup berkas.

```java
try {
    belanja(dompet, keranjang);
} catch (SaldoKurangException e) {
    System.out.println("Gagal: " + e.getMessage());
} finally {
    System.out.println("Struk dicetak");
}
```

Saldo awal 20000. Barang pertama (8000) dan kedua (5000) lunas, sehingga saldo tinggal 7000. Barang ketiga (9000) memicu exception. Tanda hijau di slider menandai setiap kali sebuah `harga` diambil dari keranjang, jadi kamu bisa melompat langsung ke barang ketiga.

> **Coba sendiri:** ubah saldo awal di baris 35 menjadi `new Dompet(30000)`. Tidak ada exception yang dilempar. Keempat barang lunas, `Semua lunas` tercetak, dan blok `catch` dilewati. Blok `finally` tetap mencetak `Struk dicetak`.

## Merambat ke pemanggil

Exception tidak harus ditangkap di method tempat ia dilempar. Bila tidak ada `catch` yang cocok, exception **merambat** ke pemanggilnya, lalu ke pemanggil berikutnya, dan seterusnya. Perhatikan panel memori pada langkah sesudah baris 19:

1. `bayar` tidak punya `catch`, sehingga frame-nya dibuang dan exception tiba di baris 28, tempat `bayar` dipanggil.
2. `belanja` juga tidak menangkapnya. Frame `belanja` ikut dibuang, sehingga sisa perulangan (barang 2000) dan baris `Semua lunas` dilewati.
3. Di `main`, panggilan `belanja` berada di dalam `try`, dan `catch (SaldoKurangException e)` di baris 39 cocok. Panggung menyorot objek exception beserta pesannya, frame-frame yang dibuang, dan blok `catch` yang menangkapnya.
4. Setelah `catch` dan `finally` selesai, program berjalan normal lagi dan mencetak `Program selesai`.

Baris 41 memanggil `e.printStackTrace()`, yang mencetak **stack trace** dengan warna merah (aliran error, *stderr*):

```text
SaldoKurangException: saldo 7000, kurang 2000
	at Dompet.bayar(Main.java:19)
	at Main.belanja(Main.java:28)
	at Main.main(Main.java:38)
```

Baca dari atas ke bawah. Baris pertama berisi jenis dan pesan exception. Baris berikutnya adalah tempat exception dilempar, lalu setiap pemanggilnya sampai `main`. Isinya persis call stack pada saat `throw` dijalankan. Saat program-mu berhenti karena exception, stack trace inilah petunjuk pertama untuk mencari penyebabnya.

## Checked dan unchecked

Exception di Java terbagi menjadi dua keluarga.

| Keluarga | Contoh | Aturan javac |
|---|---|---|
| **Checked**: turunan `Exception` selain `RuntimeException` | `SaldoKurangException`, `IOException` | Wajib ditangkap, atau diumumkan dengan `throws` di kepala method |
| **Unchecked**: turunan `RuntimeException` | `IllegalArgumentException`, `NullPointerException`, `NumberFormatException`, `ArithmeticException` | Boleh tidak ditangkap dan tidak diumumkan |

`SaldoKurangException` dibuat sendiri di baris 1–5 dengan `extends Exception`, yang berarti "`SaldoKurangException` adalah sejenis `Exception`". Konstruktornya meneruskan pesan ke `super(pesan)`, sehingga pesan itu tersimpan dan bisa dibaca lewat `getMessage()`. Karena keluarganya checked, `bayar` dan `belanja` wajib mengumumkan **`throws SaldoKurangException`** di kepalanya. Dengan begitu, siapa pun yang memanggilnya dipaksa memikirkan kemungkinan gagal itu.

> **Coba sendiri:** hapus `throws SaldoKurangException` dari kepala method `belanja` di baris 26. Javac menolak dengan dua error. Baris 28 mendapat `unreported exception SaldoKurangException; must be caught or declared to be thrown`. Baris 39 mendapat `exception SaldoKurangException is never thrown in body of corresponding try statement`, karena `belanja` kini tidak lagi mengumumkan exception itu.

Unchecked exception biasanya menandai kesalahan program atau data yang tidak sah, misalnya harga negatif di baris 15–17.

> **Coba sendiri:** ubah `5000` di baris 36 menjadi `-5000`. Baris 16 melempar `IllegalArgumentException`, padahal `catch` di baris 39 hanya menangkap `SaldoKurangException`. Exception itu lolos, tetapi blok `finally` tetap mencetak `Struk dicetak`. Setelah itu program berhenti dengan `Exception in thread "main" java.lang.IllegalArgumentException: harga harus positif: -5000`, dan `Program selesai` tidak pernah tercetak.

Bandingkan dengan `jual` di pelajaran sebelumnya, yang melaporkan kegagalan dengan mengembalikan `false`. Nilai kembalian seperti itu mudah diabaikan oleh pemanggil. Checked exception tidak bisa diabaikan diam-diam: javac menolak kode yang tidak menangkap atau mengumumkannya. Namun membuat exception lebih mahal daripada sebuah `if`, karena Java mencatat seluruh call stack saat itu, yaitu O(d) untuk kedalaman pemanggilan d. Karena itu, pakai exception untuk keadaan yang benar-benar luar biasa, bukan sebagai pengganti percabangan biasa.

## Catatan #lempar
`throw` melempar objek exception dan **langsung menghentikan** method ini. Baris `saldo -= harga;` di bawahnya tidak dijalankan.

## Catatan #tangkap
Blok `catch` ini hanya menangkap `SaldoKurangException`. Exception jenis lain akan **lolos** dan terus merambat.

## Catatan #akhirnya
Blok `finally` **selalu** dijalankan, baik `try` selesai normal, exception-nya tertangkap, maupun exception-nya lolos.
