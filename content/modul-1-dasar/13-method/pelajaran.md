---
judul: Method
urutan: 13
ringkasan: Membungkus langkah-langkah menjadi method bernama yang bisa dipanggil berulang kali dengan parameter dan nilai kembali.
tujuan:
  - Membuat method dengan parameter, lalu memanggilnya dengan argumen
  - "Membedakan method yang mengembalikan nilai dengan `return` dan method `void`"
  - Menjelaskan bahwa setiap pemanggilan method mendapat frame sendiri di call stack
  - Membedakan efek mengirim parameter primitif (nilainya disalin) dan array (referensinya disalin)
visual:
  - jenis: memori
  - jenis: konsol
---

## Mengapa perlu method?

Program yang makin panjang sering berisi langkah yang sama di banyak tempat. Daripada menyalinnya berulang kali, bungkus langkah itu menjadi **method**: sekumpulan perintah yang diberi nama dan bisa dipanggil kapan saja. Sebenarnya kamu sudah sering memakai method, misalnya `main`, `System.out.println`, dan `Math.sqrt`. Sekarang kita membuat sendiri.

```java
static int kuadrat(int x) {
    return x * x;
}
```

- `static`: untuk sekarang semua method kita tulis `static`, sama seperti `main`.
- `int`: **tipe kembalian**, yaitu tipe nilai yang dihasilkan method.
- `kuadrat`: nama method, diawali huruf kecil.
- `(int x)`: **parameter**, variabel yang menerima nilai dari pemanggil.

Method dipanggil dengan menulis namanya: `int y = kuadrat(4);` membuat `y` bernilai 16.

## Parameter dan argumen

Nilai yang dikirim saat memanggil method disebut **argumen**. Pada `luasPersegiPanjang(5, 3)`, argumen pertama masuk ke parameter pertama (`panjang = 5`) dan argumen kedua ke parameter kedua (`lebar = 3`). Jumlah dan urutan argumen harus sesuai dengan parameternya, dan tipenya harus cocok. Nilai `int` boleh dikirim ke parameter `double` karena diperlebar otomatis, tetapi `double` tidak boleh dikirim ke parameter `int`.

## return atau void

- Method dengan tipe kembalian (`int`, `double`, `String`, dan lainnya) **wajib** mengirim hasilnya dengan `return`. Pemanggilannya bisa dipakai seperti sebuah nilai: `int luas = luasPersegiPanjang(5, 3);`.
- Method `void` tidak mengembalikan nilai. Ia hanya mengerjakan sesuatu, misalnya mencetak, seperti `sapa("Rani");`.

`return` juga langsung mengakhiri method; baris sesudahnya tidak dijalankan.

> **Coba sendiri:** hapus baris `return hasil;`. Editor menandai error `missing return statement` dan animasi dijeda, karena method bertipe `int` harus selalu mengembalikan nilai.

## Setiap pemanggilan punya frame sendiri

Setiap kali method dipanggil, Java membuat **frame** baru di puncak call stack. Frame itu berisi parameter dan variabel lokal method tersebut. Saat method selesai, frame dibuang beserta isinya.

Geser slider dan perhatikan panel memori. Frame `sapa` muncul dua kali, masing-masing dengan `nama` yang berbeda, lalu hilang lagi. Saat `luasPersegiPanjang` selesai, framenya menampilkan label `return 15` sebelum dibuang.

Karena itu variabel lokal hanya hidup di dalam method-nya sendiri. `main` tidak bisa membaca `hasil`.

> **Coba sendiri:** tambahkan `System.out.println(hasil);` di dalam `main`. Java menolaknya dengan error `cannot find symbol`, karena `hasil` hanya ada di frame `luasPersegiPanjang`.

## Yang dikirim selalu salinan

Java selalu **menyalin nilai** argumen ke parameter (*pass-by-value*).

- Untuk tipe primitif seperti `int`, yang disalin adalah angkanya. `tambahSatu(skor)` hanya mengubah `angka` di frame `tambahSatu`, sedangkan `skor` di `main` tetap 10.
- Untuk array, isi variabelnya adalah **referensi** (panah). Yang disalin adalah panahnya, sehingga `data` dan `nilai` menunjuk ke array yang **sama** di heap. Perubahan pada `data[0]` ikut terlihat dari `main`, sehingga output-nya `nilai[0] = 10`.

> **Coba sendiri:** ganti nama parameter `angka` menjadi `skor` di kedua tempat dalam `tambahSatu`. Hasilnya tetap `skor = 10`. Sekarang ada dua kotak bernama `skor` di dua frame berbeda, dan keduanya tidak saling memengaruhi.

> **Coba sendiri:** tambahkan baris `data = new int[3];` di awal `gandakanPertama`. Panah `data` pindah ke array baru, sedangkan `nilai` tetap menunjuk array lama, sehingga output menjadi `nilai[0] = 5`.

## Overloading

Beberapa method boleh memakai nama yang sama asalkan daftar parameternya berbeda. Java memilih versi yang cocok dengan tipe argumennya:

```java
static int kuadrat(int x) {
    return x * x;
}

static double kuadrat(double x) {
    return x * x;
}
```

`kuadrat(3)` memakai versi `int` dan menghasilkan `9`, sedangkan `kuadrat(1.5)` memakai versi `double` dan menghasilkan `2.25`. `System.out.println` juga di-overload: ada versi untuk `int`, `double`, `String`, dan lainnya.

## Catatan #kembali
`return` mengirim nilai `hasil` ke tempat method ini dipanggil. Perhatikan label `return` di pojok frame: setelah langkah ini, frame `luasPersegiPanjang` dibuang beserta semua variabel lokalnya.

## Catatan #salinan
Yang berubah hanya parameter di frame `tambahSatu`. Variabel `skor` di frame `main` tidak ikut berubah, karena parameter bertipe primitif hanya menerima **salinan** nilainya.

## Catatan #referensi
Selama `data` dan `nilai` menunjuk ke array yang **sama** (lihat panahnya), mengubah elemen lewat `data` berarti mengubah array milik `main` juga.
