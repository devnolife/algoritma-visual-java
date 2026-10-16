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

- Satu berkas berisi `public class Main` dengan `public static void main(String[] args)`.
- Gunakan hanya fitur Java yang didukung simulator Fase 1:
  - tipe primitif, `String`, array 1D/2D;
  - percabangan, perulangan, dan method `static`;
  - `Math`, `Arrays`, `Scanner`, dan pustaka sejenisnya.
  - Rincian lengkap ada di [README](../README.md#java-yang-didukung-fase-1).
- Class buatan sendiri, koleksi (`ArrayList` dan sejenisnya), dan `try/catch` belum didukung.
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
| `memori` | `stringSebagaiObjek: true` (opsional) | <ul><li>Call stack (satu frame per method) berisi kotak variabel bertipe, beserta heap (array, String) dan panah referensinya.</li><li>Dengan `stringSebagaiObjek: true`, setiap String digambar sebagai objek di heap. Opsi ini cocok untuk membahas `==` vs `equals`.</li></ul> |
| `evaluasi` | — | Ekspresi yang sedang dievaluasi, ditulis ulang bertahap, misalnya `nilai[i] > maks` → `7 > 9` → `false`. |
| `array` | <ul><li>`variabel` (wajib)</li><li>`gaya: sel` atau `batang`</li><li>`penunjuk: [i, j]`</li><li>`rentang: [kiri, kanan]`</li><li>`judul`</li></ul> | <ul><li>Satu array sebagai deret sel berindeks.</li><li>`gaya: batang` menggambar batang setinggi nilainya (untuk array angka); cocok untuk sorting.</li><li>`penunjuk` adalah nama variabel `int` yang ditampilkan sebagai panah indeks.</li><li>`rentang` memudarkan elemen di luar `kiri..kanan`. Variabelnya dibaca dari frame teratas yang memilikinya, jadi ikut berganti saat rekursi (merge sort, quick sort, pencarian biner).</li><li>`judul` mengganti label array.</li></ul> |
| `array2d` | <ul><li>`variabel` (wajib)</li><li>`baris`, `kolom`</li><li>`gaya: grid`, `tabel`, atau `papan`</li><li>`labelBaris`, `labelKolom`</li></ul> | <ul><li>Array 2D sebagai tabel. `baris`/`kolom` adalah nama variabel indeks yang disorot, misalnya `i` dan `j`.</li><li>`gaya: tabel` untuk dynamic programming: tiap langkah yang menulis satu sel menampilkan panah dari sel-sel yang dibaca.</li><li>`labelBaris`/`labelKolom` berupa nama variabel String/array atau daftar teks. Bila jumlahnya kurang satu dari jumlah baris/kolom, baris/kolom 0 berlabel `∅` (kasus dasar). Untuk LCS cukup `labelBaris: a`.</li><li>`gaya: papan` menggambar papan catur; nilai `1`, `true`, atau `'Q'` tampil sebagai ratu.</li></ul> |
| `pohonPanggilan` | <ul><li>`method` (opsional)</li><li>`maks` (opsional, bawaan 63)</li><li>`tandaiBerulang` (opsional, bawaan `true`)</li></ul> | Pohon semua pemanggilan method sampai langkah ini beserta nilai kembalinya. Panggilan aktif disorot; panggilan yang argumennya sama dengan panggilan sebelumnya bergaris putus-putus (cocok untuk Fibonacci naif). `method` membatasi ke satu method, misalnya `fib`. Untuk backtracking, set `tandaiBerulang: false`: argumennya bisa sama walaupun keadaan papannya berbeda. |
| `graf` | <ul><li>`variabel` (wajib, matriks `int[][]`/`boolean[][]`)</li><li>`nama`, `berarah`, `posisi`, `kosong`</li><li>`dikunjungi`, `label`, `simpul: [u, v]`</li></ul> | <ul><li>Graf dari matriks ketetanggaan. Nilai 0 dan nilai ≥ 1.000.000.000 berarti tidak ada sisi; bobot tampil bila ada nilai selain 0/1. Tata letak bawaan melingkar.</li><li>`dikunjungi` (boolean[]) mewarnai simpul, `label` (mis. array `jarak`) ditempel di bawah simpul, dan `simpul` menyorot simpul aktif `u` serta tetangga `v` beserta sisinya.</li></ul> |
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

Ketahanan visual terhadap edit mahasiswa: bila mahasiswa mengganti nama atau menghapus variabel yang dirujuk `visual`, panggung menampilkan "Variabel `x` tidak ditemukan di kodemu, mungkin namanya sudah diubah". Bila `memori` ikut ditampilkan, array dengan nama barunya tetap terlihat di sana. Karena itu, sertakan `memori` di hampir setiap pelajaran.

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

Aturan tambahan untuk beberapa jenis cek (tanda `?` di tabel berarti kolom itu opsional):
- **`outputPola`**
  - Memakai regex JavaScript dengan flag `m`, sehingga `^` dan `$` berarti awal dan akhir **baris**.
  - Pola cukup cocok dengan sebagian output.
  - Untuk mewajibkan beberapa baris berurutan, sambungkan baris-barisnya dengan `\n`.
- **`variabel`**
  - Variabel harus dideklarasikan langsung di badan `main`, bukan di dalam blok `if`/`for`.
  - `harapan` boleh berupa angka, teks (untuk `char`/`String`), `true`/`false`, `null`, atau daftar untuk array, misalnya `[1, 2, 3]`.
  - Bilangan pecahan dibandingkan dengan toleransi 10⁻⁹ (relatif).
  - `tipe` (misalnya `double`) mewajibkan tipe deklarasinya.

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
| `pustaka:<Kelas.method>` | Memanggil method pustaka, misalnya `pustaka:Math.sqrt` atau `pustaka:String.charAt` |

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
- **Sudah bisa:** semua materi berbasis tipe primitif, String, array 1D/2D, method `static`, dan rekursi. Contohnya seluruh Modul 1 dan Modul 3 (searching, sorting, divide & conquer, greedy, dynamic programming, backtracking, graf dengan matriks ketetanggaan).
- **Belum bisa:** materi yang membutuhkan class/objek buatan sendiri, koleksi (`ArrayList`, `HashMap`, …), atau `try/catch`. Fitur ini sedang dikerjakan pada Fase 2 untuk Modul 2 (Struktur Data).

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
