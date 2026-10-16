# Panduan Dosen: Menambah & Mengubah Materi

Semua materi ada di folder `content/`. Satu pelajaran terdiri atas satu folder berisi tiga berkas teks, sehingga menambah pelajaran **tidak memerlukan perubahan kode aplikasi**. Aplikasi membaca folder ini saat build, sedangkan `pnpm cek-konten` memeriksa seluruh isinya sebelum dipublikasikan.

**Daftar isi**
1. [Struktur folder](#1-struktur-folder)
2. [Langkah cepat: menambah satu pelajaran](#2-langkah-cepat-menambah-satu-pelajaran)
3. [`pelajaran.md`](#3-pelajaranmd)
4. [`Main.java` dan catatan dosen](#4-mainjava-dan-catatan-dosen)
5. [Visual](#5-visual)
6. [`tantangan.yaml`](#6-tantanganyaml)
7. [Solusi](#7-solusi)
8. [Aturan menulis YAML (penting)](#8-aturan-menulis-yaml-penting)
9. [Validasi dan pratinjau](#9-validasi-dan-pratinjau)
10. [Tips menulis materi](#10-tips-menulis-materi)
11. [Menambah modul baru](#11-menambah-modul-baru)
12. [Mengubah materi yang sudah dipakai mahasiswa](#12-mengubah-materi-yang-sudah-dipakai-mahasiswa)
13. [Publikasi](#13-publikasi)

---

## 1. Struktur folder

```
content/
  modul-1-dasar/
    modul.yaml                  judul, urutan, ringkasan modul
    01-program-java-pertama/
      pelajaran.md              frontmatter + isi materi + catatan dosen
      Main.java                 kode awal yang dijalankan dan divisualisasikan
      tantangan.yaml            daftar tantangan (opsional, tetapi dianjurkan)
      solusi/
        <id-tantangan>.java     satu solusi per tantangan, tidak ikut dipublikasikan
    02-variabel-dan-tipe-data/
    …
```

- **Nama folder menjadi alamat halaman**, misalnya `#/modul/modul-1-dasar/01-program-java-pertama`. Gunakan huruf kecil, angka, dan tanda hubung saja.
- **Urutan tampil ditentukan oleh `urutan`** di frontmatter, bukan oleh nama folder. Awalan angka (`01-`) hanya agar folder tersusun rapi di file explorer.

## 2. Langkah cepat: menambah satu pelajaran

1. Salin folder pelajaran yang paling mirip. Contoh: `11-array-1-dimensi` disalin menjadi `16-pencarian-linear`.
2. Buka `pelajaran.md`, lalu:
   - ubah `judul`, `urutan` (harus unik dalam modul), `ringkasan`, dan `tujuan`;
   - tulis ulang isi materi.
3. Ganti isi `Main.java` dengan program contohmu. Tandai baris penting dengan komentar `// #nama`, lalu tulis bagian `## Catatan #nama` di `pelajaran.md`.
4. Tulis `tantangan.yaml`. Untuk setiap tantangan, buat satu berkas `solusi/<id>.java`.
5. Jalankan `pnpm cek-konten` dan perbaiki sampai tidak ada error.
6. Jalankan `pnpm dev`, lalu buka pelajaranmu dan:
   - geser slider dari awal sampai akhir;
   - coba hapus atau ubah beberapa baris;
   - kerjakan setiap tantangan.

## 3. `pelajaran.md`

Berkas ini diawali **frontmatter** YAML di antara dua garis `---`, lalu diikuti isi materi dalam Markdown.

```markdown
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

Isi materi dalam Markdown biasa …

> **Coba sendiri:** hapus baris 7, lalu geser slider sampai akhir. Nilai `maks` tidak pernah berubah.

## Catatan #awal

Nilai awal `maks` diambil dari elemen **pertama**, bukan 0.

## Catatan #banding

`maks` hanya diganti bila ditemukan nilai yang **lebih besar**.
```

### Kolom frontmatter

| Kolom | Wajib | Isi |
|---|---|---|
| `judul` | ya | Judul pelajaran. |
| `urutan` | ya | Bilangan bulat yang unik di dalam modul. Menentukan urutan tampil. |
| `ringkasan` | ya | Satu kalimat yang tampil di daftar pelajaran. |
| `tujuan` | ya | Daftar tujuan pembelajaran, minimal satu. |
| `visual` | tidak | Daftar renderer di panggung, ditampilkan dari atas ke bawah ([§5](#5-visual)). Bila dikosongkan, dipakai `evaluasi` + `memori`. |
| `pantau` | tidak | Nama variabel yang perubahannya ditandai hijau di slider, misalnya `[maks]` atau `[jumlah, i]`. |
| `input` | tidak | Isi awal tab Input (stdin untuk `Scanner`), misalnya `"5\n3\n"`. |
| `batasLangkah` | tidak | Batas jumlah langkah program. Bawaan 20.000, maksimal 100.000. |
| `pertumbuhan` | tidak | Grafik pertumbuhan: program dijalankan ulang untuk beberapa ukuran n ([§5, Grafik pertumbuhan](#grafik-pertumbuhan)). |

### Isi materi

- **Format yang didukung:** Markdown lengkap, yaitu heading `##`/`###`, paragraf, daftar, **tebal**, *miring*, `kode sebaris`, blok kode, tabel, kutipan `>`, dan tautan.
- **Yang tidak didukung:** HTML mentah.
- **Tautan** dibuka di tab baru.
- **Bagian `## Catatan #nama`** tidak tampil di panel Materi; isinya dipindah ke kartu penjelasan langkah. Letakkan **semua** bagian catatan di akhir berkas, karena teks sesudah judul catatan pertama dianggap sebagai bagian catatan.

## 4. `Main.java` dan catatan dosen

`Main.java` adalah program yang langsung dijalankan dan divisualisasikan saat mahasiswa membuka pelajaran.

### Aturan program

- Satu berkas berisi `public class Main` dengan `public static void main(String[] args)`. Class lain (non-public, atau bersarang di dalam `Main`) boleh ditulis di berkas yang sama.
- Gunakan hanya fitur Java yang didukung simulator:
  - tipe primitif, `String`, array 1D/2D, percabangan, perulangan, method, dan rekursi;
  - class buatan sendiri: field, konstruktor, method instance, `this`, `toString`/`equals`/`hashCode`, dan `implements Comparable<T>`;
  - exception: `try`/`catch`/`finally`, `throw`, `throws`, dan exception buatan sendiri (`extends Exception` atau `RuntimeException`);
  - wrapper (`Integer`, `Double`, …), `StringBuilder`, koleksi `java.util` (`ArrayList`, `LinkedList`, `ArrayDeque`, `Stack`, `HashMap`, `HashSet`, `TreeMap`, `PriorityQueue`, …), dan lambda `Comparator`;
  - `Math`, `Arrays`, `Collections`, `Scanner`, `Random`, dan pustaka sejenisnya.
  - Rincian lengkap ada di [README](../README.md#java-yang-didukung).
- Belum didukung: pewarisan antar-class biasa (selain exception), interface/abstract class/generik buatan sendiri, enum, record, stream, dan lambda selain `Comparator`.
- Program boleh sengaja berakhir dengan exception, misalnya untuk menunjukkan `ArrayIndexOutOfBoundsException`. `cek-konten` akan memberi peringatan agar kamu memastikan hal itu memang disengaja.

### Catatan dosen

Catatan dosen adalah penjelasan tambahan yang muncul di kartu penjelasan **tepat saat baris tertentu dijalankan**.

1. Beri komentar penanda di akhir baris pada `Main.java`:
   ```java
   int maks = nilai[0];   // #awal
   for (int i = 1; i < nilai.length; i++) {
       if (nilai[i] > maks) {   // #banding
   ```
2. Tulis isinya di `pelajaran.md` dengan judul yang namanya sama:
   ```markdown
   ## Catatan #banding

   `maks` hanya diganti bila ditemukan nilai yang **lebih besar**.
   ```

Aturan penanda:
- Nama penanda boleh berisi huruf, angka, `_`, dan `-`.
- Satu nama boleh dipakai di beberapa baris; semua baris itu akan menampilkan catatan yang sama.
- Di editor, penanda tampil sebagai chip kecil.
- Bila mahasiswa menghapus baris bertanda, catatannya ikut hilang. Ini disengaja.

Format isi catatan:
- Isi catatan **hanya** mendukung `kode` dan **tebal**.
- Tulis 1–3 kalimat saja, karena kartu penjelasan juga menampilkan narasi otomatis langkah itu.

## 5. Visual

Renderer dipilih lewat `visual:` di frontmatter dan ditampilkan berurutan dari atas ke bawah.

| `jenis` | Opsi | Yang ditampilkan |
|---|---|---|
| `memori` | `stringSebagaiObjek: true` (opsional) | <ul><li>Call stack (satu frame per method) berisi kotak variabel bertipe, beserta heap (array, String, objek) dan panah referensinya.</li><li>Dengan `stringSebagaiObjek: true`, setiap String digambar sebagai objek di heap. Opsi ini cocok untuk membahas `==` vs `equals`.</li><li>Objek class buatan sendiri digambar sebagai kotak berisi baris field bertipe. Frame method objek dan konstruktor (`new Node(…)`) memuat `this`.</li><li>Wrapper (`Integer`, `Double`, …) dan `StringBuilder` tampil sebagai kotak kecil. Hasil autoboxing −128..127 diambil dari cache, jadi beberapa variabel menunjuk kotak yang **sama**. Ini cocok untuk membahas `==` pada `Integer`.</li><li>Koleksi java.util tampil ringkas, misalnya `ArrayList [3, 1, 2]`. Isi dalamnya dilihat lewat visual `koleksi`.</li><li>Saat exception dilempar, objek exception (beserta pesannya), frame yang dibuang, blok `catch` yang menangkap, dan `finally` disorot.</li></ul> |
| `evaluasi` | — | Ekspresi yang sedang dievaluasi, ditulis ulang bertahap, misalnya `nilai[i] > maks` → `7 > 9` → `false`. |
| `array` | <ul><li>`variabel` (wajib)</li><li>`gaya: sel` atau `batang`</li><li>`penunjuk: [i, j]`</li><li>`rentang: [kiri, kanan]`</li><li>`judul`</li></ul> | <ul><li>Satu array sebagai deret sel berindeks.</li><li>`gaya: batang` menggambar batang setinggi nilainya (untuk array angka); cocok untuk sorting.</li><li>`penunjuk` adalah nama variabel `int` yang ditampilkan sebagai panah indeks.</li><li>`rentang` memudarkan elemen di luar `kiri..kanan`. Variabelnya dibaca dari frame teratas yang memilikinya, jadi ikut berganti saat rekursi (merge sort, quick sort, pencarian biner).</li><li>`judul` mengganti label array.</li></ul> |
| `array2d` | <ul><li>`variabel` (wajib)</li><li>`baris`, `kolom`</li><li>`gaya: grid`, `tabel`, atau `papan`</li><li>`labelBaris`, `labelKolom`</li></ul> | <ul><li>Array 2D sebagai tabel. `baris`/`kolom` adalah nama variabel indeks yang disorot, misalnya `i` dan `j`.</li><li>`gaya: tabel` untuk dynamic programming: tiap langkah yang menulis satu sel menampilkan panah dari sel-sel yang dibaca.</li><li>`labelBaris`/`labelKolom` berupa nama variabel String/array atau daftar teks. Bila jumlahnya kurang satu dari jumlah baris/kolom, baris/kolom 0 berlabel `∅` (kasus dasar). Untuk LCS cukup `labelBaris: a`.</li><li>`gaya: papan` menggambar papan catur; nilai `1`, `true`, atau `'Q'` tampil sebagai ratu.</li></ul> |
| `pohonPanggilan` | <ul><li>`method` (opsional)</li><li>`maks` (opsional, bawaan 63)</li><li>`tandaiBerulang` (opsional, bawaan `true`)</li></ul> | Pohon semua pemanggilan method sampai langkah ini beserta nilai kembalinya. Panggilan aktif disorot; panggilan yang argumennya sama dengan panggilan sebelumnya bergaris putus-putus (cocok untuk Fibonacci naif). `method` membatasi ke satu method, misalnya `fib`. Untuk backtracking, set `tandaiBerulang: false`: argumennya bisa sama walaupun keadaan papannya berbeda. |
| `graf` | <ul><li>`variabel` (wajib): matriks `int[][]`/`boolean[][]` atau daftar ketetanggaan `ArrayList<ArrayList<Integer>>`/`List<Integer>[]`</li><li>`nama`, `berarah`, `posisi`, `kosong`</li><li>`dikunjungi`, `label`, `simpul: [u, v]`</li></ul> | <ul><li>Graf dari matriks ketetanggaan. Nilai 0 dan nilai ≥ 1.000.000.000 berarti tidak ada sisi; bobot tampil bila ada nilai selain 0/1. Tata letak bawaan melingkar.</li><li>Daftar ketetanggaan juga ditulis sebagai daftar `0 → [1, 2]` di bawah graf; daftar milik simpul `u` disorot.</li><li>`dikunjungi` (boolean[]) mewarnai simpul, `label` (mis. array `jarak`) ditempel di bawah simpul, dan `simpul` menyorot simpul aktif `u` serta tetangga `v` beserta sisinya.</li></ul> |
| `rantai` | <ul><li>`kepala` (wajib)</li><li>`penunjuk: [curr, prev]`</li><li>`berikut`, `sebelum`, `data`</li><li>`judul`</li></ul> | <ul><li>Linked list buatan sendiri sebagai deret simpul `[data │ •]→` yang diakhiri penanda null `∅`.</li><li>`kepala` adalah jalur ke simpul pertama, misalnya `head` atau `daftar.head` ([aturan jalur](#struktur-data-modul-2)).</li><li>`penunjuk` menempel label di atas simpul yang ditunjuk. Simpul yang belum tersambung ke rantai (mis. `baru`) tampil di baris sendiri. Penunjuk yang bernilai null ditulis `curr = null` di baris judul visual.</li><li>`sebelum: prev` menggambar panah balik (putus-putus) untuk rantai dua arah.</li><li>Rantai melingkar terdeteksi: panah terakhir kembali ke simpul tujuannya dan diberi tanda.</li></ul> |
| `pohon` | <ul><li>`akar` (wajib)</li><li>`penunjuk: [node]`</li><li>`kiri`, `kanan`, `data`</li><li>`judul`</li></ul> | <ul><li>Pohon biner dari simpul buatan sendiri. Field anak dikenali otomatis (`left`/`right` atau `kiri`/`kanan`); bila namanya lain, isi `kiri` dan `kanan`.</li><li>Simpul yang ditunjuk `penunjuk` disorot beserta jalurnya dari akar. Cocok untuk pencarian dan penyisipan BST.</li><li>Penunjuk ke simpul yang belum menjadi bagian pohon digambar sebagai subpohon terpisah di sampingnya.</li></ul> |
| `tumpukan` | <ul><li>`variabel` (wajib)</li><li>`puncak` atau `ukuran` (untuk array)</li><li>`berikut`, `data` (untuk simpul)</li><li>`judul`</li></ul> | <ul><li>Stack sebagai tumpukan vertikal dengan elemen teratas di atas.</li><li>`variabel` boleh berupa `Stack`/`ArrayDeque`/`LinkedList` (puncak = `peek()`), array dengan `puncak` (indeks elemen teratas, −1 = kosong) atau `ukuran` (jumlah elemen), atau simpul teratas stack berantai.</li><li>Sel array di atas puncak digambar putus-putus: isinya masih ada di memori, tetapi bukan bagian stack lagi.</li></ul> |
| `antrian` | <ul><li>`variabel` (wajib)</li><li>`depan`, `belakang`, `ukuran` (untuk array)</li><li>`berikut`, `data` (untuk simpul)</li><li>`judul`</li></ul> | <ul><li>Queue sebagai deret mendatar dari depan ke belakang.</li><li>`variabel` boleh berupa `Queue`/`Deque`/`LinkedList`, array dengan `depan` (indeks elemen terdepan) + `belakang` (indeks elemen terakhir) atau `ukuran`, atau simpul terdepan antrean berantai.</li><li>Array melingkar didukung: sel aktif boleh "membungkus" ke indeks 0. Sertakan `ukuran` agar antrean kosong dan penuh bisa dibedakan.</li></ul> |
| `tabelHash` | <ul><li>`variabel` (wajib)</li><li>`penunjuk: [indeks, p]`</li><li>`berikut`, `kunci`, `nilai`</li><li>`judul`</li></ul> | <ul><li>Tabel hash sebagai daftar bucket bernomor. Setiap bucket berisi rantai simpul (chaining) atau satu nilai (open addressing).</li><li>`variabel` boleh berupa array bucket buatan sendiri atau `HashMap`/`HashSet` (memakai array `table` internalnya).</li><li>`penunjuk` bertipe `int` menandai bucket, misalnya hasil `hash % n`. Penunjuk bertipe simpul menandai simpulnya. Jumlah tabrakan ditulis di kepala visual, dan bucket kosong yang berurutan diringkas.</li></ul> |
| `koleksi` | <ul><li>`variabel` (wajib)</li><li>`isiDalam: true` (opsional)</li><li>`sebagai: tumpukan` atau `sebagai: antrian` (opsional, untuk `ArrayDeque`/`LinkedList`)</li><li>`judul`</li></ul> | <ul><li>Koleksi java.util dalam bentuk abstraknya: List sebagai deret berindeks (ditata menurun bila elemennya objek panjang), Set sebagai himpunan, Map sebagai pasangan kunci → nilai, Stack/Queue/Deque dengan penanda `peek()`, dan PriorityQueue sebagai heap.</li><li>Tombol **Lihat isi dalam** menggambar struktur internal JDK: `elementData` + `size` pada ArrayList, `table` + rantai `Node` pada HashMap, simpul dua arah pada LinkedList, array melingkar `head`/`tail` pada ArrayDeque, heap (pohon + array) pada PriorityQueue, pohon merah-hitam pada TreeMap/TreeSet, dan HashMap di balik HashSet.</li><li>`isiDalam: true` membuat tombol itu sudah aktif saat pelajaran dibuka.</li><li>`sebagai: tumpukan` menggambar `Deque` sebagai tumpukan vertikal dengan elemen depan sebagai puncak, tempat `push`/`pop`/`peek` bekerja. `sebagai: antrian` menggambar `LinkedList` sebagai antrean depan → belakang. Tanpa opsi ini, `ArrayDeque` tampil sebagai antrean dua ujung.</li></ul> |
| `string` | `variabel` (wajib) | String sebagai deret karakter berindeks. |
| `konsol` | — | Output program dalam ukuran besar di panggung, terbentuk langkah demi langkah. Cocok untuk `print`/`println` dan pola bintang. |
| `input` | — | Isi stdin; bagian yang sudah dibaca `Scanner` ditandai. |

Kombinasi yang terbukti nyaman dipakai:

| Topik | Kombinasi |
|---|---|
| Array | `array` + `evaluasi` + `memori` |
| Method dan rekursi | `memori` + `evaluasi` |
| Output | `konsol` + `memori` |
| Scanner | `input` + `memori` |
| Sorting | `array` (`gaya: batang`, `penunjuk`) + `evaluasi`; rekursif ditambah `rentang` + `pohonPanggilan` |
| Dynamic programming | `array2d` (`gaya: tabel`) + `evaluasi`, atau `pohonPanggilan` untuk versi rekursif |
| Graf | `graf` + `array` (antrean atau jarak) |
| Linked list | `rantai` (`penunjuk: [curr, prev]`) + `memori` |
| Pohon biner dan BST | `pohon` (`penunjuk`) + `evaluasi`; penelusuran rekursif ditambah `memori` |
| Stack dan queue | `tumpukan`/`antrian` + `evaluasi`; versi java.util ditambah `memori` |
| Hash table | `tabelHash` (`penunjuk: [indeks]`) + `evaluasi` |
| Koleksi java.util | `koleksi` + `memori` (wrapper dan identitas objek) |
| Exception | `memori` + `konsol` |

Ketahanan visual terhadap edit mahasiswa: bila mahasiswa mengganti nama atau menghapus variabel yang dirujuk `visual`, panggung menampilkan "Variabel `x` tidak ditemukan di kodemu, mungkin namanya sudah diubah". Bila `memori` ikut ditampilkan, array dengan nama barunya tetap terlihat di sana. Karena itu, sertakan `memori` di hampir setiap pelajaran.

### Struktur data (Modul 2)

Opsi `kepala`, `akar`, `variabel`, `penunjuk`, `puncak`, `depan`, `belakang`, dan `ukuran` pada renderer `rantai`, `pohon`, `tumpukan`, `antrian`, `tabelHash`, dan `koleksi` menerima **jalur**, bukan hanya nama variabel:

| Jalur | Artinya |
|---|---|
| `head` | Variabel lokal `head`, atau field static `head` milik `Main`. |
| `daftar.head` | Field `head` dari objek yang ditunjuk variabel `daftar`. Boleh berlanjut, misalnya `daftar.head.next`. |
| `this.head` | Field `head` dari objek pemilik method yang sedang berjalan. |
| `Main.kepala`, `Antrean.depan` | Field static milik `Main` atau class lain. |

Aturan bacanya:
- **Frame yang dibaca.**
  - `kepala` dan `akar` dicari mulai dari frame **terbawah** (biasanya `main`). Karena itu, seluruh struktur tetap tergambar walaupun method rekursif punya parameter bernama sama.
  - `penunjuk` dan opsi lain dicari mulai dari frame **teratas**, sehingga ikut berpindah mengikuti rekursi, misalnya `node` pada `cari(node.left, x)`.
- **Field simpul dikenali otomatis.**
  - Penghubung: `next`/`berikut`, atau field yang bertipe class simpul itu sendiri.
  - Anak pohon: `left`/`right` atau `kiri`/`kanan`.
  - Data: `data`, `nilai`, `val`, `value`, `item`, `isi`, `key`, atau field pertama yang bukan penghubung.
  - Isi `berikut`, `sebelum`, `kiri`, `kanan`, `data`, `kunci`, atau `nilai` hanya bila nama field-nya berbeda.
- **Sorotan.** Field yang ditulis pada langkah itu (misalnya `curr.next = baru`) disorot sebagai tulis, field yang dibaca disorot sebagai baca, dan objek yang baru dibuat disorot sebagai objek baru.
- **Batas gambar.** Rantai digambar sampai 40 simpul dan pohon sampai 127 simpul; selebihnya ditandai `…`. Gambar yang lebih lebar dari panggung diperkecil sampai 70%, lalu bisa digeser mendatar.
- **Antrean array.** `belakang` adalah indeks elemen **terakhir**, bukan indeks kosong sesudahnya. Tanpa `ukuran`, antrean dianggap kosong bila `belakang` tepat satu di belakang `depan`. Untuk array melingkar, sertakan `ukuran`.

```yaml
visual:
  - jenis: rantai
    kepala: daftar.head        # objek class DaftarBerantai buatan sendiri dengan field head
    penunjuk: [curr, prev, baru]
  - jenis: pohon
    akar: root
    penunjuk: [node]           # parameter method rekursif cari(Node node, int x)
  - jenis: antrian
    variabel: data             # int[] data
    depan: depan
    belakang: belakang
    ukuran: jumlah
  - jenis: koleksi
    variabel: peta             # HashMap<String, Integer>
  - jenis: memori
```

Ruang Coba memilih visual sendiri dari program mahasiswa. Class yang punya satu field bertipe dirinya sendiri tampil sebagai `rantai`, dua field seperti itu sebagai `pohon`, dan koleksi java.util di `main` sebagai `koleksi`. `Deque`/`LinkedList` yang hanya dipakai lewat `push`/`pop` digambar sebagai tumpukan. Yang dipakai lewat `offer`/`poll`, atau dideklarasikan sebagai `Queue`, digambar sebagai antrean.

### Grafik pertumbuhan

Untuk materi analisis algoritma, frontmatter `pertumbuhan` memunculkan tab **Pertumbuhan** di samping Output/Input/Masalah. Program dijalankan ulang untuk beberapa ukuran n, lalu nilai yang diukur digambar terhadap n dan dibandingkan dengan kurva O(1), O(log n), O(n), O(n log n), O(n²), O(n³), dan O(2ⁿ). Grafik dihitung ulang setiap kali kode diedit, jadi mahasiswa langsung melihat dampak perubahan algoritmanya.

```yaml
pertumbuhan:
  variabel: n                 # variabel lokal di main, wajib bernilai awal: int n = 8;
  nilai: [8, 16, 32, 64, 128]
  ukur: perbandingan          # `langkah`, `method:<nama>`, atau nama variabel penghitung
  seri:                       # opsional, maksimal 3 garis
    - nama: data acak
    - nama: data terurut
      ganti: { terurut: true } # variabel lokal main lain yang ikut diganti
  acuan: [n, n^2]             # opsional: kurva pembanding tambahan
```

- **Cara kerja.** Nilai awal `variabel` diganti dengan setiap ukuran n (initializer aslinya tidak dievaluasi). Karena itu, data harus **dibangkitkan dari `n`**, misalnya `data[i] = (i * 37 + 11) % 50 + 1;`, bukan ditulis sebagai literal `{5, 2, 8}`.
- **Apa yang diukur.** Pilihan terbaik biasanya variabel penghitung yang dinaikkan di operasi inti, misalnya `perbandingan++` (lokal di `main`, atau `static int` untuk algoritma rekursif). `method:urutkan` menghitung langkah selama method itu berjalan. `langkah` menghitung semua langkah, termasuk perulangan pengisian data.
- **Batas ukuran.** Setiap run maksimal 1.000.000 langkah, kedalaman rekursi tetap 200, dan total waktunya sekitar 2 detik. Pilih n yang membuat program cepat selesai: O(n²) cukup sampai 128, Fibonacci naif sampai 16.
- **Validasi.** `pnpm cek-konten` memastikan semua ukuran selesai normal pada kode awal.

## 6. `tantangan.yaml`

Berkas ini berisi daftar tantangan. Tantangan dinyatakan lulus bila **semua** cek-nya lulus, dan statusnya disimpan di browser mahasiswa.

```yaml
- id: nilai-terkecil
  judul: Cari nilai terkecil
  soal: "Ubah program agar mencetak **tepat satu baris** `Nilai terkecil: X`."
  cek:
    - jenis: output
      harapan: "Nilai terkecil: 2"
    - jenis: variabel
      nama: min
      tipe: int
      harapan: 2
    - jenis: harusMemakai
      konstruksi: for
  petunjuk:
    - "Ganti nama variabel `maks` menjadi `min`."
    - Balik operator pembanding pada baris if.
```

| Kolom | Isi |
|---|---|
| `id` | Huruf kecil, angka, dan tanda hubung. Harus unik dalam pelajaran dan sama dengan nama berkas solusinya. |
| `judul` | Judul singkat tantangan. |
| `soal` | Perintah untuk mahasiswa. Sebutkan format output yang diminta secara **persis**. |
| `cek` | Daftar pemeriksaan otomatis, minimal satu (tabel di bawah). |
| `petunjuk` | Opsional. Dibuka satu per satu oleh mahasiswa; urutkan dari yang umum ke yang hampir menjawab. |

`soal` dan `petunjuk` hanya mendukung `kode` dan **tebal**.

### Jenis cek

| `jenis` | Kolom | Lulus bila … |
|---|---|---|
| `output` | `harapan`, `input`? | Output program sama persis dengan `harapan`. Spasi di ujung baris dan baris kosong di akhir diabaikan. |
| `outputMemuat` | `harapan`, `input`? | Output memuat teks `harapan` di posisi mana pun. |
| `outputPola` | `pola`, `input`? | Output cocok dengan regex `pola` (aturan regex di bawah tabel). |
| `variabel` | `nama`, `harapan`, `tipe`?, `input`? | Variabel `nama` bernilai `harapan` saat `main` selesai. Aturan rincinya di bawah tabel. |
| `arrayTerurut` | `nama`, `arah: naik`/`turun`, `input`? | Array `nama` terurut di akhir `main`. Bawaan `arah` adalah `naik`. |
| `harusMemakai` | `konstruksi` | Kode memakai konstruksi itu (daftar di bawah). |
| `dilarangMemakai` | `konstruksi` | Kode **tidak** memakai konstruksi itu. |
| `tanpaError` | `input`? | Program berjalan sampai selesai: tanpa exception dan tanpa menabrak batas langkah. |
| `maksLangkah` | `batas`, `input`? | Jumlah langkah ≤ `batas`. Cocok untuk tantangan efisiensi, misalnya "hentikan perulangan begitu ketemu". |
| `kompleksitas` | `maks`, `seri`?, `pertumbuhan`? | Kelas pertumbuhan yang terukur tidak lebih buruk dari `maks` (`"1"`, `"log n"`, `"n"`, `"n log n"`, `"n^2"`, `"n^3"`, `"2^n"`). Tanpa `pertumbuhan` dipakai konfigurasi pelajaran; tanpa `seri` semua seri harus memenuhi. |
| `isiRantai` | `kepala`, `harapan`, `berikut`?, `data`?, `input`? | Saat program selesai, data simpul dari `kepala` sampai `null` sama persis dengan `harapan`, misalnya `[1, 2, 3]`. `kepala` berupa jalur seperti di visual `rantai` (`head`, `daftar.head`, field static). Rantai melingkar dinyatakan gagal. |
| `isiPohon` | `akar`, `harapan`, `urutan`?, `kiri`?, `kanan`?, `data`?, `input`? | Saat program selesai, penelusuran pohon dari `akar` menghasilkan `harapan`. `urutan` adalah `inorder` (bawaan), `preorder`, atau `postorder`. Untuk BST, `inorder` selalu terurut, jadi `preorder` lebih tepat untuk memeriksa bentuk pohon. |

Aturan tambahan untuk beberapa jenis cek (tanda `?` di tabel berarti kolom itu opsional):
- **`outputPola`**
  - Memakai regex JavaScript dengan flag `m`, sehingga `^` dan `$` berarti awal dan akhir **baris**.
  - Pola cukup cocok dengan sebagian output.
  - Untuk mewajibkan beberapa baris berurutan, sambungkan baris-barisnya dengan `\n`.
- **`variabel`**
  - Variabel harus dideklarasikan langsung di badan `main` (bukan di dalam blok `if`/`for`), atau berupa field static.
  - `harapan` boleh berupa angka, teks (untuk `char`/`String`), `true`/`false`, `null`, atau daftar untuk array, misalnya `[1, 2, 3]`.
  - Bilangan pecahan dibandingkan dengan toleransi 10⁻⁹ (relatif).
  - `tipe` (misalnya `double`) mewajibkan tipe deklarasinya.
  - Objek dan koleksi ditulis dalam bentuk JSON:

    | Nilai akhir | Tulis `harapan` sebagai | Contoh |
    |---|---|---|
    | Objek class buatan sendiri | Objek berisi **semua** field-nya | `{ nama: "Ani", ipk: 3.5 }` |
    | List, Set, Queue, Deque, Stack | Daftar menurut urutan iterasi Java | `[1, 2, 3]` |
    | Map | Objek; kuncinya selalu ditulis sebagai teks | `{ "apel": 3, "jeruk": 5 }` |
    | Wrapper (`Integer`, `Double`, …) | Nilai primitifnya | `42` |
    | `StringBuilder` | Teks isinya | `"cba"` |

  - Urutan kunci Map tidak diperiksa, tetapi urutan daftar diperiksa. Urutan iterasi `HashSet` mengikuti urutan bucket, bukan urutan penambahan, jadi tulis `harapan` sesuai urutan yang dicetak Java. Agar soal mudah dipahami, pakai `TreeSet` (terurut) atau `LinkedHashSet` (urutan penambahan) di kode awal.
- **`isiRantai` dan `isiPohon`**
  - Keduanya membaca struktur di akhir program, jadi strukturnya harus masih bisa dicapai dari `kepala`/`akar` saat `main` selesai.
  - `harapan` berisi data simpul saja (angka atau teks), misalnya `[10, 5, 15]`.
  - Field simpul dikenali seperti pada visual `rantai`/`pohon` ([Struktur data](#struktur-data-modul-2)). Isi `berikut`/`kiri`/`kanan`/`data` hanya bila nama field-nya berbeda.

    ```yaml
    cek:
      - jenis: isiRantai
        kepala: daftar.head
        harapan: [3, 1, 2]
      - jenis: isiPohon
        akar: root
        urutan: preorder
        harapan: [50, 30, 20, 40, 70]
    ```

Aturan untuk semua jenis cek:
- **`input`** adalah stdin untuk uji itu, misalnya `"5\n3\n"`. Program dijalankan sekali untuk setiap nilai `input` yang berbeda. Cek tanpa `input` memakai input kosong, bukan isi tab Input mahasiswa.
- **Yang diperiksa hanya stdout.** Pesan exception (stderr) tidak ikut diperiksa oleh cek output.

### Nilai `konstruksi`

| Nilai | Artinya |
|---|---|
| `for`, `for-each`, `while`, `do-while` | Perulangan |
| `if`, `switch`, `ternary` | Percabangan |
| `break`, `continue` | Lompatan dalam perulangan/switch |
| `array` | Membuat array (`new int[n]` atau `{…}`) |
| `casting` | Casting eksplisit, misalnya `(int) x` |
| `scanner` | Membuat `Scanner` |
| `rekursi` | Ada method yang memanggil dirinya sendiri, langsung maupun tidak langsung |
| `method:<nama>` | Ada method bernama `<nama>`, misalnya `method:luasLingkaran` |
| `pustaka:<Kelas.method>` | Memanggil method pustaka, misalnya `pustaka:Math.sqrt` atau `pustaka:String.charAt`. Method objek juga tercatat menurut tipe variabel penerimanya: `pustaka:ArrayList.add` untuk `ArrayList<Integer> daftar`, `pustaka:Deque.push` untuk `Deque<Integer> tumpukan`. |
| `class:<Nama>` | Ada class buatan sendiri bernama `<Nama>` selain `Main`, misalnya `class:Node` |
| `konstruktor` | Ada konstruktor yang ditulis sendiri |
| `objek` | Membuat objek class buatan sendiri dengan `new` |
| `koleksi:<Kelas>` | Membuat koleksi java.util dengan `new`, misalnya `koleksi:ArrayList` atau `koleksi:HashMap` |
| `try`, `throw` | Blok `try` dan pernyataan `throw` |
| `lambda` | Ekspresi lambda, misalnya `Comparator` `(a, b) -> Double.compare(a.ipk, b.ipk)` |

Nilai yang mengandung `:` wajib diberi kutip, misalnya `konstruksi: "method:pangkat"` ([§8](#8-aturan-menulis-yaml-penting)).

## 7. Solusi

- **Nama dan isi berkas.** Simpan satu program lengkap per tantangan di `solusi/<id>.java`, dengan nama yang sama persis dengan `id` tantangan.
- **Validasi.** `pnpm cek-konten` menjalankan setiap solusi terhadap semua cek-nya. Validasi gagal bila ada solusi yang tidak lulus, atau bila kode awal `Main.java` **sudah** lulus tanpa diubah.
- **Kerahasiaan.** Folder `solusi/` tidak ikut dimasukkan ke aplikasi yang dipublikasikan, sehingga mahasiswa tidak bisa melihatnya dari browser. Bila repositori ini publik, solusi tetap bisa dibaca di repositori.

## 8. Aturan menulis YAML (penting)

Kesalahan materi paling sering berasal dari YAML. Berlaku untuk frontmatter, `modul.yaml`, dan `tantangan.yaml`.

1. **Teks yang mengandung `: ` (titik dua + spasi) atau ` #` (spasi + pagar) wajib diberi kutip.**
   ```yaml
   soal: Cetak dengan format Nama: Rina            # SALAH: error, YAML membaca "Nama" sebagai kunci
   soal: "Cetak dengan format Nama: Rina"          # BENAR
   soal: Pakai tanda #include di C                 # SALAH: tanpa error, tetapi teks terpotong menjadi "Pakai tanda"
   ```
   ` #` lebih berbahaya karena tidak memunculkan error: sisa teks dianggap komentar dan terbuang diam-diam.
2. **Teks yang diawali karakter khusus wajib diberi kutip.** Karakter khusus itu antara lain `` ` ``, `*`, `[`, `{`, `&`, `!`, `|`, `>`, `%`, `@`, `'`, dan `"`. Kasus yang paling sering terjadi:
   - petunjuk yang diawali kode, misalnya `` "`nextInt()` hanya membaca angkanya." ``;
   - teks yang diawali tebal, misalnya `"**Ingat:** …"`.
3. **Kutip ganda `"…"` memproses escape:** `\n` berarti baris baru, `\"` untuk tanda kutip, `\\` untuk backslash. Pakai kutip ganda untuk `harapan` dan `input`:
   ```yaml
   input: "Rina Amelia\n19\n"
   harapan: "Baris 1\nBaris 2"
   ```
4. **Kutip tunggal `'…'` menyimpan teks apa adanya** (backslash tidak diproses). Tanda kutip tunggal di dalamnya ditulis dua kali (`''`). Pakai kutip tunggal untuk:
   - teks yang memuat kode Java dengan `"`:
     ```yaml
     - 'Cetak dengan `System.out.println("Luas: " + luas);`.'
     ```
   - **regex**:
     ```yaml
     pola: '^IPK: \d\.\d{2}$'
     ```
     Dalam kutip ganda, `\d` justru membuat YAML error.
5. **Output beberapa baris** juga bisa ditulis sebagai blok `|`:
   ```yaml
   harapan: |
     *
     **
     ***
   ```
6. **Indentasi memakai spasi, bukan tab.**

Bila YAML salah, aplikasi tidak menampilkan materi apa pun. Sebagai gantinya muncul banner merah berisi nama berkas dan pesan kesalahannya ([§9](#9-validasi-dan-pratinjau)).

## 9. Validasi dan pratinjau

```bash
pnpm cek-konten     # memeriksa seluruh folder content/
pnpm dev            # pratinjau di http://localhost:5173
```

`pnpm cek-konten` selesai dengan kode keluar 1 bila ada **error**. Error harus diperbaiki:
- berkas YAML/frontmatter tidak valid, atau ada kolom wajib yang hilang;
- `Main.java` tidak bisa dikompilasi;
- penanda `// #nama` tidak punya `## Catatan #nama`, atau sebaliknya, atau catatannya kosong;
- `id` tantangan ganda, atau `urutan` pelajaran ganda;
- solusi tidak ada atau tidak lulus;
- kode awal sudah lulus tantangan tanpa diubah;
- grafik `pertumbuhan` tidak bisa diukur pada kode awal (variabel ukuran atau penghitung tidak ada, atau kurang dari 2 ukuran n yang selesai normal).

**Peringatan** tidak menggagalkan validasi, tetapi sebaiknya diperiksa:
- kode awal berakhir dengan exception atau menabrak batas langkah;
- variabel di `visual`/`pantau` tidak pernah muncul saat program dijalankan;
- jalur di visual struktur data (`daftar.head`, `this.top`, `Main.kepala`) tidak bisa dicocokkan, atau nama field di opsi `berikut`/`sebelum`/`kiri`/`kanan`/`data`/`kunci`/`nilai` tidak dimiliki objek mana pun;
- ukuran n tertentu pada grafik `pertumbuhan` menabrak batas langkah atau berakhir dengan exception;
- ada berkas solusi tanpa tantangan;
- ada pelajaran tanpa tantangan.

Untuk memvalidasi materi di folder lain (misalnya draf), arahkan variabel `KONTEN` ke folder tersebut:
- PowerShell: `$env:KONTEN='draf'; pnpm cek-konten`
- bash: `KONTEN=draf pnpm cek-konten`

Selama `pnpm dev` berjalan, setiap berkas yang disimpan langsung terlihat di browser. Bila ada berkas yang tidak valid, halaman menampilkan banner "Ada berkas materi yang tidak valid" beserta lokasinya.

## 10. Tips menulis materi

**Program contoh**
- **Satu konsep per pelajaran.** Program contoh sebaiknya pendek (±10–25 baris) dengan data kecil: array 5 elemen, perulangan sampai 5. Lebih dari ±150 langkah membuat slider sulit digeser dengan teliti.
- **Periksa rujukan nomor baris.** Bila materi merujuk nomor baris ("baris 6"), periksa lagi setiap kali `Main.java` diubah. Validator tidak memeriksa rujukan ini.
- **`pantau` cukup 1–2 variabel kunci**, misalnya `maks` atau `jumlah`. Tanda hijau di slider membantu mahasiswa melompat ke momen penting.
- **Isi `input` di frontmatter** pada pelajaran Scanner, agar program langsung berjalan tanpa mahasiswa mengetik apa pun.
- **Hindari `Math.random()`** kecuali memang menjadi materinya. Bila dipakai, hasilnya tetap sama setiap kali kode diedit, dan tombol 🎲 **Acak ulang** muncul otomatis.

**Eksperimen dan error**
- **Bagian `> **Coba sendiri:** …` adalah kekuatan utama aplikasi ini.**
  - Mintalah mahasiswa menghapus atau mengubah **satu** baris, lalu mengamati animasinya.
  - Sebutkan apa yang seharusnya terjadi agar mereka bisa membandingkan.
  - Contoh: hapus `maks = nilai[i];`, ganti `<` menjadi `<=` (indeks keluar batas), atau hapus base case rekursi.
- **Tunjukkan error dengan sengaja.**
  - Contoh: hapus `;` atau tulis `int x = 3.5;`.
  - Mahasiswa melihat pesan asli `javac` beserta penjelasan *Artinya* dan *Saran*.

**Tantangan**
- **Pakai minimal dua `input` uji berbeda** untuk tantangan berbasis input, agar jawaban tidak bisa di-*hardcode*.
- **Gabungkan cek hasil dengan cek cara.** Pasangkan `output` atau `variabel` dengan `harusMemakai`/`dilarangMemakai`, misalnya wajib `rekursi` dan dilarang `for`/`while`.
- **Tulis format output secara eksplisit di `soal`.** Contoh: "tepat satu baris `Luas: X`". Mahasiswa sering menambahkan prompt seperti `Masukkan angka:` yang membuat cek `output` gagal.

## 11. Menambah modul baru

1. Buat folder modul, misalnya `content/modul-4-lanjutan/`, berisi `modul.yaml`:
   ```yaml
   judul: "Modul 4: Topik Lanjutan"
   urutan: 4
   ringkasan: Satu kalimat yang tampil di Beranda.
   ```
2. Tambahkan folder pelajaran di dalamnya seperti biasa.
3. Modul otomatis muncul di Beranda sesuai `urutan`. Kartu "Segera hadir" dengan nomor yang sama otomatis hilang.

Yang bisa dan belum bisa ditulis dengan mesin saat ini:
- **Sudah bisa:** materi berbasis tipe primitif, String, array 1D/2D, method, rekursi, class/objek buatan sendiri, exception, wrapper, `StringBuilder`, koleksi `java.util`, `Comparable`, dan lambda `Comparator`. Contohnya seluruh Modul 1 dan Modul 3.
- **Belum bisa:** pewarisan antar-class biasa (selain exception), interface/abstract class/generik buatan sendiri, `instanceof`, enum, record, dan stream. Konstruksi ini memunculkan pesan "[Simulator] … belum didukung" beserta alternatifnya.

## 12. Mengubah materi yang sudah dipakai mahasiswa

Progres mahasiswa disimpan di browser masing-masing (localStorage) dengan kunci `nama-folder-modul/nama-folder-pelajaran` dan `id` tantangan.

| Perubahan | Dampak pada mahasiswa |
|---|---|
| Mengubah teks materi, catatan, `soal`, petunjuk, atau `urutan` | Aman. |
| Mengubah `Main.java` | Mahasiswa yang belum pernah mengedit kode pelajaran itu langsung melihat versi baru. Yang sudah mengedit tetap melihat versinya sendiri sampai menekan ↺ **Reset kode**. |
| Mengubah `cek` sebuah tantangan | Status lulus yang lama tetap tersimpan. |
| Mengganti `id` tantangan | Status lulus tantangan itu hilang. |
| Mengganti nama folder pelajaran atau modul | Alamat halaman berubah, dan progres serta kode tersimpan untuk pelajaran itu mulai dari nol. **Hindari selama semester berjalan.** |

## 13. Publikasi

```bash
pnpm cek-konten && pnpm build
```

Salin isi folder `dist/` ke server web. Server bisa berupa server kampus (termasuk subfolder), GitHub Pages, Netlify, atau layanan sejenis; detailnya ada di [README](../README.md#deploy). Tidak ada backend yang perlu disiapkan.
