---
judul: Stack
urutan: 7
ringkasan: Tumpukan yang hanya bisa diakses dari puncaknya (LIFO), dibuat sendiri dari array lalu dipakai lewat ArrayDeque untuk memeriksa pasangan kurung.
tujuan:
  - Menjelaskan prinsip LIFO serta operasi push, pop, dan peek
  - Membuat stack dari array dengan indeks atas, termasuk menangani overflow dan underflow
  - Memakai Deque dan ArrayDeque sebagai stack, dan mengenali class Stack yang lama
  - Memeriksa keseimbangan kurung dengan bantuan stack
visual:
  - jenis: tumpukan
    variabel: data
    puncak: atas
  - jenis: koleksi
    variabel: tumpukan
    sebagai: tumpukan
  - jenis: evaluasi
  - jenis: memori
pantau: [atas]
---

## Tumpukan piring

Di kantin, piring bersih ditumpuk: piring yang baru dicuci diletakkan di atas, dan piring yang diambil selalu yang paling atas. **Stack** (tumpukan) bekerja dengan cara yang sama. Elemen yang terakhir masuk adalah yang pertama keluar, atau **LIFO** (*last in, first out*). Tombol undo di editor, tombol Back di browser, dan call stack yang kamu lihat di pelajaran rekursi semuanya berupa stack.

Stack hanya punya tiga operasi utama, dan semuanya bekerja di **puncak**:

- **push(x)** meletakkan `x` di puncak;
- **pop()** mengambil elemen puncak sekaligus membuangnya;
- **peek()** melihat elemen puncak tanpa membuangnya.

## Stack dari array

Stack paling sederhana dibuat dari array `data` dan satu indeks `atas` yang menunjuk elemen teratas (baris 5–6). Nilai `atas = -1` berarti stack kosong.

- `push` (baris 8–14) menaikkan `atas`, lalu menulis nilai baru di `data[atas]`.
- `pop` (baris 16–23) membaca `data[atas]`, lalu menurunkan `atas`. Nilainya tidak dihapus dari array; sel itu hanya tidak lagi dianggap bagian stack.

Array berkapasitas tetap, jadi ada dua keadaan yang harus dijaga. Push ke stack yang sudah penuh disebut **overflow**, dan pop dari stack yang kosong disebut **underflow**. Kedua method melempar `IllegalStateException` dengan pesan yang jelas daripada membiarkan Java melempar `ArrayIndexOutOfBoundsException` yang membingungkan.

Di `main`, 10, 20, dan 30 di-push, lalu pop pertama mengembalikan 30, yaitu yang terakhir masuk. Setelah 40 dan 50 di-push, perulangan di baris 33–35 mengosongkan stack dan mencetak `Isi dari puncak: 50 40 20 10`, kebalikan urutan masuknya.

> **Coba sendiri:** ubah baris 5 menjadi `new int[3]`. Stack sudah penuh saat `push(50)` dipanggil, sehingga baris 10 melempar exception dan program berhenti dengan `IllegalStateException: Stack penuh (overflow)`. Stack trace di tab Output menunjukkan exception itu muncul di `push`, yang dipanggil dari `main`.

> **Coba sendiri:** ubah kondisi di baris 33 menjadi `atas >= -1`. Setelah keempat elemen keluar, perulangan masih memanggil `pop()` sekali lagi, dan program berhenti dengan `Stack kosong (underflow)`.

## Membaca visualnya

- **Panel tumpukan** menggambar array `data` tegak: indeks 0 di dasar, dan panah `atas ▶` menunjuk elemen puncak. Sel di atas puncak digambar putus-putus karena isinya masih ada di memori, tetapi bukan bagian stack lagi. Perhatikan sel 30 yang tertimpa 40 saat push berikutnya.
- **Panel koleksi** menggambar `Deque` milik method `seimbang` sebagai tumpukan juga, dengan puncak di atas. Panel ini baru terisi saat `seimbang` berjalan.
- **Panel evaluasi** menulis ulang kondisi `if` dan `while`, misalnya `atas >= 0` → `-1 >= 0` → `false` saat stack sudah kosong.
- **Tanda hijau di slider** muncul setiap kali `atas` berubah, yaitu pada setiap push dan pop.

## Stack siap pakai: `Deque` dan `ArrayDeque`

Java menyediakan stack lewat antarmuka `Deque` dengan implementasi `ArrayDeque` (baris 43):

```java
Deque<Character> tumpukan = new ArrayDeque<>();
tumpukan.push('(');               // puncak: '('
char puncak = tumpukan.peek();    // '(' tetap di tumpukan
tumpukan.pop();                   // tumpukan kosong lagi
```

`ArrayDeque` tidak pernah overflow, karena array di dalamnya diperbesar otomatis saat penuh. Underflow tetap ada: `pop()` pada tumpukan kosong melempar `NoSuchElementException`, sedangkan `peek()` mengembalikan `null`. Karena itu, periksa `isEmpty()` lebih dulu.

Java juga punya class lama `Stack<E>` dengan method `push`, `pop`, dan `peek` yang sama. Class ini masih bisa dipakai, tetapi dokumentasi Java menyarankan `Deque`: `Stack` lebih lambat karena setiap method-nya disinkronkan untuk thread, dan karena turunan `Vector`, isinya bisa diakses lewat indeks seperti list biasa, sehingga aturan LIFO bisa dilanggar.

**Memeriksa kurung seimbang.** Method `seimbang` (baris 42–56) memeriksa apakah setiap kurung buka punya pasangan yang benar:

1. Kurung buka `(`, `[`, atau `{` di-push.
2. Kurung tutup harus cocok dengan kurung buka **terakhir** yang belum ditutup, yaitu puncak stack. Bila stack kosong atau puncaknya bukan pasangannya, teks tidak seimbang. Bila cocok, puncaknya di-pop.
3. Setelah semua karakter diperiksa, stack harus kosong. Kurung buka yang tersisa berarti belum ditutup.

> **Coba sendiri:** ubah baris 38 menjadi `String teks = "{[(])}";`. Hasilnya `false`. Hentikan slider saat karakter `]` diperiksa: puncak stack adalah `(`, bukan `[`, karena kurung `(` belum ditutup.

## Kompleksitas

`push`, `pop`, dan `peek` bernilai O(1) pada stack array maupun `ArrayDeque`; pada `ArrayDeque`, sesekali array-nya perlu diperbesar, jadi O(1) rata-rata. Pemeriksaan kurung untuk teks sepanjang n membutuhkan waktu O(n) dan memori O(n) bila semua karakternya kurung buka. Dibandingkan `ArrayList`, stack sengaja lebih terbatas: kamu tidak bisa mengambil elemen di tengah. Justru batasan itulah yang membuat program lebih mudah dipahami, karena urutan keluarnya selalu jelas.

## Catatan #push
`atas` dinaikkan **lebih dulu**, baru nilai baru ditulis di `data[atas]`, yaitu sel tepat di atas puncak lama. Sisa nilai lama di sel itu, bila ada, **ditimpa**.

## Catatan #pop
Nilai di `data[atas]` **tidak dihapus**. Hanya `atas` yang turun, sehingga sel itu tidak lagi dianggap bagian stack dan akan ditimpa oleh push berikutnya.

## Catatan #tutup
Kurung tutup harus cocok dengan kurung buka **terakhir** yang belum ditutup, yaitu puncak stack. `peek()` melihatnya tanpa membuangnya.
