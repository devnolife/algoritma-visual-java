# Desain: Web App Visualisasi Algoritma & Pemrograman (Java)

> Desain yang disetujui untuk Fase 1. Mockup tata letak: [mockup-pemutar.html](./mockup-pemutar.html).

## 1. Masalah & pendekatan

Mahasiswa pemula sulit membayangkan apa yang terjadi di memori saat program Java berjalan, terutama variabel bertipe (*strong typing*), percabangan, perulangan, array, method, dan rekursi.

**Solusi:** web app (laptop/desktop) yang menjalankan kode Java **langkah demi langkah** di browser.
- Setiap langkah menampilkan animasi *state* (kotak variabel bertipe, array, call stack, output) disertai penjelasan berbahasa Indonesia.
- Mahasiswa **menggeser slider** untuk maju atau mundur antarlangkah.
- Kode Java **selalu tampil dan bisa diedit bebas**. Menghapus atau mengubah baris langsung menjalankan ulang program, sehingga animasinya ikut berubah.
- Kesalahan tipe memunculkan error ala `javac` beserta penjelasan dan saran dalam Bahasa Indonesia.

**Pendekatan teknis:** interpreter **"Java Mini"** buatan sendiri (TypeScript) di Web Worker, dengan alur lexer → parser → type checker → interpreter yang merekam *trace*. UI React merender *state* tiap langkah dengan animasi Motion. Semuanya berjalan di browser, tanpa server.

## 2. Keputusan desain

| Topik | Keputusan |
|---|---|
| Bentuk aplikasi | Pemutar dan Ruang Coba khusus laptop/desktop (target 1280×720; lebar < 1100 px menampilkan pemberitahuan). Beranda dan daftar modul responsif sampai ponsel |
| Bahasa yang diajarkan | Java (subset, semantik Java 21) |
| Edit kode | Bebas penuh; dijalankan ulang otomatis 400 ms setelah berhenti mengetik |
| Interaksi "geser" | Opsi **C**: slider langkah, kode selalu tampil, baris aktif tersorot |
| Eksekusi | Interpreter Java Mini sendiri di Web Worker (dipilih dibanding CheerpJ atau server JDK) |
| Rilis | Bertahap. **Fase 1** = mesin + pemutar + Modul 1 (15 pelajaran) + Ruang Coba |
| Akun | Tanpa login; progres dan kode tersimpan di localStorage; situs statis |
| Latihan | 1–2 tantangan per pelajaran, dicek otomatis |
| Bahasa | UI berbahasa Indonesia; identifier pada contoh kode juga berbahasa Indonesia (`int umur`) |
| Penulisan materi | Dosen menulis file Markdown + Java + YAML di `content/` |
| Animasi | Motion (motion.dev) + SVG/HTML; tanpa GSAP |
| Tema | Terang sebagai bawaan (ramah proyektor) + mode gelap |
| Tipografi | Satu keluarga huruf, Atkinson Hyperlegible Next, untuk judul dan isi. Huruf yang mirip (I l 1, O 0) mudah dibedakan, juga saat diproyeksikan. Hierarki dibangun dari tebal dan ukuran. Kode memakai JetBrains Mono tanpa ligatur |
| Nama aplikasi | Sementara: "Algoritma & Pemrograman · Java" (bisa diganti) |

## 3. Temuan pencarian skill

- **Lokal** (dipakai saat implementasi; tidak ada yang khusus visualisasi algoritma):
  - `animate` dan `emil-design-eng`: membangun gerak.
  - `apple-design`: rasa seret/geser.
  - `review-animations`: QA animasi.
  - `shadcn`: komponen.
  - `fixing-accessibility`, `web-design-guidelines`, `impeccable`: QA desain.
  - `webapp-testing` / `playwright-cli`: E2E.
  - `deslop`: merapikan kode.
- **Internet (skills.sh):**
  - `greensock/gsap-skills`: resmi, ±60K installs, tetapi tidak dibutuhkan karena arsitektur berbasis *state* per langkah lebih cocok dengan Motion.
  - Skill Manim: menghasilkan video, bukan interaktif.
  - Skill visualisasi algoritma: installs < 15, belum layak dipakai.
  - **Tidak ada skill yang perlu di-install.**

## 4. Arsitektur

```mermaid
flowchart LR
  ED["Editor CodeMirror<br/>(kode Java)"] -- "edit, jeda 400 ms" --> W
  subgraph W["Web Worker: Mesin Java Mini"]
    L[Lexer] --> P["Parser → AST"] --> T["Type checker"] --> I["Interpreter per langkah"]
  end
  T -- "error kompilasi" --> ER["Garis merah + penjelasan error"]
  I -- "Trace: peristiwa + checkpoint" --> ST[Player store]
  ST --> SL["Slider langkah"] & VZ["Visualisasi SVG + Motion"] & NR["Penjelasan langkah"] & HL["Sorot baris kode"] & CO["Konsol"]
  KT[("content/*.md + Main.java + tantangan.yaml")] --> ED & VZ
```

**Stack:**
- Inti: Vite, React, TypeScript (strict), pnpm.
- Editor & animasi: CodeMirror 6, Motion.
- State & UI: Zustand, Tailwind CSS v4, shadcn/ui (Radix).
- Navigasi & materi: React Router (HashRouter), react-markdown + remark-gfm, `yaml`, zod.
- Pengujian & skrip: Vitest, Playwright, tsx.

Hasil build berupa situs statis (`base: './'`) yang bisa di-hosting di GitHub Pages, Netlify, Vercel, atau server kampus tanpa konfigurasi.

```
algorithm/
├── content/modul-1-dasar/{modul.yaml, NN-slug/{pelajaran.md, Main.java, tantangan.yaml, solusi/}}
├── docs/            DESAIN.md (salinan desain ini), PANDUAN-DOSEN.md
├── scripts/         cek-konten.ts, uji-diferensial.ts
├── src/
│   ├── engine/      diagnostik/ lexer/ parser/ ast/ checker/ runtime/ pustaka/ trace/ narasi/ index.ts   (murni TS, tanpa DOM)
│   ├── worker/      engine.worker.ts, klienEngine.ts
│   ├── editor/      konfigurasi CodeMirror: warna tipe, baris aktif, diagnostik, penanda #nama
│   ├── player/      store, slider, kontrol, kartu penjelasan, panel Output/Input/Masalah
│   ├── viz/         memori, array, array2d, evaluasi, konsol, input, string, registry
│   ├── lessons/     loader konten, skema zod, render Markdown, pemeriksa tantangan
│   └── app/         routing, halaman, tema, progres (localStorage)
└── tests/           engine/ (Vitest) · korpus/ · korpus-error/ · e2e/ (Playwright)
```

## 5. Mesin Java Mini

### 5.1 Subset Java Fase 1
- **Struktur:**
  - Satu file `Main.java` berisi `public class Main` dan `public static void main(String[] args)`.
  - Method `static` lain, field `static` / `static final`.
  - `import java.util.Scanner;`, `java.util.Arrays`, dan `java.util.*` diterima.
- **Tipe:** `byte short int long float double char boolean`, `String`, array 1D/2D.
- **Literal:** desimal/hex/biner/oktal, garis bawah (`1_000`), akhiran `L`/`f`/`d`, eksponen, char dan string dengan escape (`\n \t \" \\ \' \uXXXX`).
- **Operator:** aritmatika, `++/--` (prefix/postfix), compound assignment, relasional, logika (*short-circuit*), bitwise dan shift, ternary, casting, konkatenasi String.
- **Statement:** deklarasi multi-variabel, blok dan scope, `if/else`, `switch` klasik (fall-through, `default`) dan bentuk `case ->`, `while`, `do-while`, `for`, for-each, `break`, `continue`, `return`.
- **Method:** parameter, `return`, `void`, overloading, rekursi.
- **Pustaka:**
  - Output: `System.out.print/println/printf`, `String.format`.
  - `Math`: abs, max, min, pow, sqrt, round, floor, ceil, random, PI, E.
  - `String`: length, charAt, substring, indexOf, lastIndexOf, contains, equals, equalsIgnoreCase, compareTo, toUpperCase, toLowerCase, trim, isEmpty, startsWith, endsWith, replace, repeat, toCharArray, split (regex sederhana), valueOf.
  - Kelas pembantu: `Integer.parseInt/toString/MAX_VALUE/MIN_VALUE`, `Double.parseDouble`, `Character.isDigit/isLetter/isLetterOrDigit/isUpperCase/isLowerCase/toUpperCase/toLowerCase/getNumericValue`, `Arrays.toString/deepToString/sort/fill/copyOf/equals`.
  - `Scanner`: nextInt, nextLong, nextDouble, nextBoolean, next, nextLine, hasNext, hasNextInt, hasNextLine, close.

### 5.2 Tidak didukung di Fase 1
Fitur berikut memunculkan pesan ramah "belum didukung simulator ini" beserta alternatifnya:
- class/objek buatan sendiri, generic dan koleksi, wrapper/autoboxing, `try/catch/throw` (menyusul di Fase 2);
- inheritance, interface, lambda/stream;
- `var` (sengaja ditolak agar tipe selalu ditulis eksplisit);
- switch expression/`yield`, label pada `break/continue`;
- thread, file I/O, package selain `java.util`, anotasi, text block.

### 5.3 Semantik runtime
Semua perilaku di bawah harus identik dengan Java 21 dan diverifikasi lewat uji diferensial.
- **Representasi angka:**
  - `int` 32-bit dengan wrap (`Math.imul`, `|0`);
  - `long` 64-bit (BigInt `asIntN`);
  - `float` lewat `Math.fround`;
  - `char` 16-bit tak bertanda.
- **Pembagian & sisa:** pembagian bulat memotong ke arah nol; `/ by zero` memicu `ArithmeticException`; tanda `%` mengikuti pembilang; double menghasilkan Infinity/NaN.
- **Casting:**
  - double→int/long di-*clamp*, dan NaN→0;
  - penyempitan int→byte/short/char memotong bit;
  - compound assignment melakukan casting implisit (`x += 3.5` sah untuk `int x`).
- **Format angka:**
  - `Double.toString`/`Float.toString` versi Java, misalnya `0.30000000000000004`, `1.0E7`, `1.0E-4`, `100.0`;
  - `printf %f` membulatkan dengan HALF_UP.
- **String & exception:**
  - String adalah objek imutabel; literal dan konstanta compile-time di-*intern*, sehingga `==` vs `equals` berperilaku seperti Java.
  - Exception yang tidak ditangkap mencetak `Exception in thread "main" java.lang.X: pesan` + `\tat Main.m(Main.java:N)`, lalu program berhenti.
- **Lain-lain:**
  - `Math.random()` memakai *seed* tetap per sesi agar animasi stabil saat kode diedit; ada tombol "Acak ulang".
  - Class publik wajib bernama `Main`, dan method `main` wajib ada. Pesannya mengikuti Java asli.

### 5.4 Type checker & katalog error
- **Format pesan:** `Main.java:N: error: <pesan javac>`, ditambah **Artinya** (penjelasan Indonesia) dan **Saran** (perbaikan konkret). Pesan tampil di tab *Masalah* dan sebagai garis bergelombang di editor.
- **Aturan yang dicek:**
  - konversi assignment (widening, narrowing konstanta ke byte/short/char), promosi numerik;
  - overload resolution;
  - reachability, *definite assignment*, `final`;
  - konteks static, dereference primitif.
- **Error sintaks:** jika ada, hanya error sintaks yang dilaporkan (sama seperti javac).
- **Katalog sintaks:** `';' expected`, `')' expected`, `<identifier> expected`, `illegal start of expression`, `not a statement`, `'else' without 'if'`, `reached end of file while parsing`, `unclosed string literal`, `unclosed character literal`, `integer number too large`, `class, interface, enum, or record expected`.
- **Katalog semantik:** `cannot find symbol`, `incompatible types: X cannot be converted to Y`, `incompatible types: possible lossy conversion from X to Y`, `bad operand types for binary operator`, `bad operand type X for unary operator`, `incomparable types`, `variable x is already defined in method …`, `variable x might not have been initialized`, `cannot assign a value to final variable x`, `missing return statement`, `unreachable statement`, `incompatible types: unexpected return value`, `method m in class Main cannot be applied to given types;`, `no suitable method found for …`, `non-static method … cannot be referenced from a static context`, `int cannot be dereferenced`, `array required, but X found`, `break outside switch or loop`, `continue outside of loop`, `duplicate case label`, `class X is public, should be declared in a file named X.java`.
- Teks pesan diverifikasi terhadap javac 21 lewat `tests/korpus-error/`.

### 5.5 Model langkah & trace
- **Langkah 0** adalah "program siap" (state awal).
- **Satu langkah** = salah satu dari:
  - selesainya 1 statement (efeknya sudah terlihat);
  - 1 evaluasi kondisi (`if`, `while`, `for`, `do-while`, `switch`);
  - pemanggilan method (frame baru);
  - `return` (frame dibuang).
- `for` dipecah menjadi langkah inisialisasi, cek kondisi, dan update. For-each menghasilkan 1 langkah per elemen.
- **Baris yang disorot** adalah baris yang *baru saja dijalankan*.
- **Isi tiap langkah:** baris, jenis langkah, kedalaman call stack, panjang output, dan daftar peristiwa:
  - `deklarasi`, `tulis/baca-var`, `tulis/baca-elemen`;
  - `evaluasi` (pohon ekspresi beserta nilainya);
  - `panggil/kembali`, `alokasi`, `cetak`, `cast`, `overflow`, `baca-input`, `exception`.
- **Penyimpanan:** peristiwa + *checkpoint* state lengkap tiap 100 langkah. `TraceReader.stateAt(i)` merekonstruksi state langkah ke-i dalam waktu < 5 ms, jadi slider bisa melompat ke mana saja, maju maupun mundur.
- **Nilai** disimpan mentah (number/bigint/boolean/ref); tipenya diambil dari tipe statis hasil checker.
- Trace juga menyimpan **state akhir frame `main`** sebelum dibuang, untuk keperluan cek tantangan.

### 5.6 Batas pengaman
Pesan berlabel `[Simulator]` bila bukan perilaku Java.
- **Batas langkah:** 20.000, bisa diubah per pelajaran. Pesannya: "Program dihentikan setelah 20.000 langkah, kemungkinan infinite loop. Baris yang paling sering dijalankan: N."
- **Kedalaman rekursi:** 200, lalu `java.lang.StackOverflowError` disertai catatan `[Simulator]` bahwa batas ini lebih kecil dari JVM asli. Rekursi Java dijalankan dengan rekursi JavaScript, sedangkan stack worker browser jauh lebih kecil dari JVM (diukur ±380 level untuk method bersarang di worker Chromium yang "dingin"). Batas 200 dipilih agar hasilnya sama di semua browser; sebagai jaring pengaman, sisa stack JavaScript juga diperiksa sebelum setiap pemanggilan sehingga simulator tidak pernah mogok dengan `RangeError`. Korpus uji diferensial menghindari rekursi lebih dari 200 tingkat.
- **Ukuran:** array ≤ 10.000 elemen, String ≤ 100.000 karakter, output ≤ 10.000 karakter.
- **Timeout worker:** 3 detik; worker lalu dihentikan dan dibuat ulang.

### 5.7 Narasi otomatis & catatan dosen
- Fungsi murni `narasikan(langkah, stateSebelum, stateSesudah)` menghasilkan kalimat Indonesia, misalnya:
  - "Membuat variabel `umur` bertipe int dengan nilai 20."
  - "Cek kondisi `i < nilai.length` → 3 < 5 bernilai true, masuk ke badan perulangan."
  - "`7 / 2` = 3 karena keduanya int: sisa pembagian dibuang."
  - "Casting `(int) 3.7` → 3: bagian desimal dipotong, bukan dibulatkan."
  - "Overflow! 2147483647 + 1 menjadi −2147483648 karena int hanya 32-bit."
  - "Memanggil `faktorial(3)`: frame baru dibuat dengan n = 3."
- **Catatan dosen:**
  - ditandai dengan komentar penanda `// #nama` di `Main.java`;
  - isinya ditulis di bagian `## Catatan #nama` pada `pelajaran.md`;
  - tampil saat baris bertanda dijalankan. Jika baris itu dihapus mahasiswa, catatannya ikut hilang.

### 5.8 API mesin
- `kompilasi(sumber)` → `{ ok: true, program, penanda } | { ok: false, diagnostik[] }`
- `jalankan(program, { stdin, batasLangkah, batasKedalaman, seed })` → `Trace`
- `new TraceReader(trace).stateAt(i)`, `narasikan(...)`
- `klienEngine.jalankan(sumber, opsi)` → Promise. Setiap run diberi id sehingga hasil yang sudah basi diabaikan; ada timeout + respawn.

## 6. Pemutar pelajaran (lihat `docs/mockup-pemutar.html`)

### Beranda dan daftar modul
- **Hero:**
  - Visualnya adalah demo yang benar-benar berjalan, bukan ilustrasi atau tangkapan layar tiruan. Program bubble sort dijalankan mesin Java Mini di Web Worker, lalu digambar dengan `ArrayView`, narasi, dan slider yang sama dengan pemutar.
  - Tombol "Hapus baris 9" menjalankan ulang program tanpa baris pertukaran, sehingga pengunjung langsung melihat bahwa mengubah kode mengubah animasinya.
  - Putar otomatis hanya berjalan saat demo terlihat. Dengan `prefers-reduced-motion`, demo diam di perbandingan pertama.
- **Peta belajar:** modul tersedia, modul yang segera hadir, dan enam judul pelajaran pertama sebagai gambaran isi.
- **Contoh error:** kode dengan kesalahan tipe dikompilasi mesin, lalu ditampilkan dengan panel Masalah milik pemutar (`DaftarMasalah`).
- **Pemuatan:** demo dan contoh error dimuat terpisah (lazy) dengan kerangka berukuran sama, agar teks hero tampil lebih dulu tanpa pergeseran layout.
- **Layar sempit:** semua bagian melipat menjadi satu kolom di bawah 1024 px. Pemberitahuan layar sempit hanya muncul di pemutar dan Ruang Coba.

### Tata letak
- **Header:** identitas aplikasi, breadcrumb, posisi pelajaran, tautan Ruang Coba, tombol tema.
- **Kiri** (±20% lebar layar, 264–340 px, bisa diciutkan): tab Materi | Tantangan (n/m).
- **Tengah:** panggung visualisasi + kartu penjelasan langkah (narasi + catatan dosen, `aria-live="polite"`, dibisukan selama putar otomatis).
- **Kanan** (±50% sisa lebar, 400–640 px, cukup untuk baris 70 karakter di layar 1366 px): editor `Main.java` (✎ bisa diedit, 🎲 Acak ulang bila memakai `Math.random()`, ↺ Reset kode) + tab Output | Input | Masalah.
- **Bawah:**
  - kontrol ⏮ ◀ ▶/⏸ ▶▏ ⏭;
  - slider dengan tanda warna: hijau = variabel di `pantau` (frontmatter) berubah, biru = output, merah = exception;
  - teks "Langkah i / N" dan pilihan kecepatan 0.5×/1×/2×/4× (1× = 1 langkah per 800 ms).

### Perilaku
- **Saat kode diedit:** jeda 400 ms → worker → trace baru. Posisi langkah dipertahankan (dibatasi ke panjang trace baru), dan muncul indikator "Dijalankan ulang · N langkah". Mengubah isi tab Input juga menjalankan ulang program.
- **Error kompilasi:** garis merah di editor dan tab Masalah terbuka. Visualisasi terakhir yang valid dipudarkan dengan label "Animasi dijeda sampai error diperbaiki".
- **Exception runtime:** langkah terakhir menyorot baris penyebab, dan exception tampil di panggung serta di Output.
- **Gerak slider:** menyeret slider merender langkah secara instan; Next/Play memakai transisi beranimasi.
- **Bantuan navigasi:**
  - klik nomor baris → lompat ke eksekusi berikutnya dari baris itu;
  - baris yang tidak pernah dijalankan pada trace saat ini tampil pudar.
- **Keyboard:**
  - saat fokus di luar editor: ←/→ langkah, Shift+←/→ ±10, Home/End, Spasi play/pause;
  - di dalam editor: Alt+←/→.
- **Aksesibilitas:**
  - semua kontrol bisa dioperasikan dengan keyboard, dan fokusnya terlihat;
  - makna warna selalu disertai ikon atau teks;
  - kontras AA;
  - `prefers-reduced-motion` mengganti transisi dengan crossfade singkat.
- **Tema:** mengikuti pengaturan terang/gelap sistem operasi sampai mahasiswa memilih sendiri lewat tombol tema; pilihan disimpan di localStorage. Skrip kecil di `index.html` memasang tema sebelum halaman digambar sehingga tidak ada kedipan.

## 7. Visualisasi

Renderer dipilih lewat `visual:` di frontmatter. Jika variabel yang dirujuk tidak ada (dihapus/diganti nama), tampil "Variabel `x` tidak ditemukan" dan visual kembali ke Memori.

| Renderer | Isi | Pelajaran |
|---|---|---|
| `memori` | Call stack (frame per method), kotak variabel dengan badge tipe berwarna (sama dengan warna tipe di editor), tooltip rentang tipe, char + kode angkanya, panah referensi ke array/String | semua |
| `array` | Sel atau batang, indeks, penunjuk dari variabel int (`penunjuk: [i, j]`), sorotan baca/bandingkan/tulis, penunjuk di luar batas berwarna merah | 11, 13, Modul 3 |
| `array2d` | Grid dengan penunjuk baris/kolom | 12 |
| `evaluasi` | Ekspresi kondisi dengan substitusi nilai, mis. `nilai[i] > maks` → `7 > 9` → false; short-circuit terlihat | 6–9, 11 |
| `konsol` | Output besar di panggung; pola terbentuk per langkah | 1, 10 |
| `input` | Buffer stdin; bagian yang sudah dibaca Scanner ditandai | 5 |
| `string` | Karakter sebagai sel berindeks; mode String sebagai objek di heap (untuk `==` vs `equals`) | 15 |
| `array` + `rentang` | Elemen di luar `kiri..kanan` dipudarkan; variabel rentang dibaca dari frame teratas (ikut rekursi) | Modul 3: pencarian biner, merge sort, quick sort |
| `pohonPanggilan` | Pohon semua pemanggilan sampai langkah ini dengan nilai kembali; panggilan aktif disorot, panggilan berulang (argumen sama) bergaris putus-putus | Modul 3: D&C, sorting rekursif, DP, backtracking |
| `array2d` gaya `tabel`/`papan` | Tabel DP berlabel dengan panah dari sel yang dibaca ke sel yang ditulis; papan catur untuk N-Queens | Modul 3: knapsack, LCS, N-Queens |
| `graf` | Graf dari matriks ketetanggaan: bobot, simpul dikunjungi, label jarak, simpul aktif/tetangga dan sisi yang diperiksa | Modul 3: BFS/DFS, Dijkstra |

**Grafik pertumbuhan** (tab Pertumbuhan, Modul 3): program dijalankan ulang di worker terpisah untuk beberapa ukuran n (opsi mesin `ganti` + `modeHitung`, tanpa rekaman langkah). Nilai yang diukur (`langkah`, `method:<nama>`, atau variabel penghitung) digambar terhadap n bersama kurva acuan yang diskalakan. Kelas kompleksitas dipilih dari kemiringan log-log pada dua interval terbesar, dan grafik diperbarui setiap kali kode diedit.

**Aturan animasi** (mengikuti skill `animate`/`emil-design-eng`, ditinjau dengan `review-animations`):
- **Properti & waktu:** hanya `transform`/`opacity`; durasi 180–320 ms pada 1× (ikut skala kecepatan); `ease-out` untuk masuk/keluar, `ease-in-out` untuk perpindahan; tidak ada `scale(0)` (mulai dari 0.96 + opacity 0).
- **Perubahan nilai:** nilai lama keluar ke atas, nilai baru masuk, disertai kilatan warna sesuai peristiwa.
- **Frame method:** masuk di puncak tumpukan; saat keluar, memudar sambil membawa nilai kembali ke pemanggil.
- **Warna peristiwa:** baca biru, bandingkan oranye, tulis hijau, error merah.
- **Warna tipe:** int biru, double ungu, char oranye-cokelat, boolean hijau, String teal, array abu.

## 8. Materi & tantangan

`pelajaran.md`:
```yaml
---
judul: Mencari nilai maksimum
urutan: 11
ringkasan: Menelusuri array untuk menemukan nilai terbesar.
tujuan: [Menelusuri array dengan for, Memakai variabel penampung maks]
visual:
  - { jenis: array, variabel: nilai, gaya: sel, penunjuk: [i] }
  - { jenis: evaluasi }
  - { jenis: memori }
pantau: [maks]         # perubahan variabel ini ditandai hijau di slider
input: ""              # stdin bawaan untuk Scanner
batasLangkah: 20000
---
## Materi
(Markdown biasa)

## Catatan #banding
Kita hanya mengganti maks bila menemukan nilai yang lebih besar.
```

`tantangan.yaml`:
```yaml
- id: nilai-terkecil
  judul: Cari nilai terkecil
  soal: Ubah program agar mencetak nilai terkecil dari array.
  cek:
    - { jenis: output, input: "", harapan: "Nilai terkecil: 2" }
    - { jenis: variabel, nama: min, tipe: int, harapan: 2 }
    - { jenis: harusMemakai, konstruksi: for }
  petunjuk: [Ganti nama variabel maks menjadi min., Balik operator pembanding pada baris if.]
```

- **Jenis cek:**
  - `output` (persis, per input uji), `outputMemuat`, `outputPola` (regex);
  - `variabel` (nilai akhir di `main`, opsional dengan tipe), `arrayTerurut` (naik/turun);
  - `harusMemakai` / `dilarangMemakai`: `for`, `while`, `do-while`, `for-each`, `if`, `switch`, `ternary`, `casting`, `array`, `break`, `continue`, `rekursi`, `scanner`, `method:<nama>`, `pustaka:<Kelas.method>` (mis. `pustaka:Math.random`, `pustaka:String.charAt`);
  - `tanpaError`, `maksLangkah`;
  - `kompleksitas`: kelas pertumbuhan terukur tidak lebih buruk dari `maks` (memakai konfigurasi `pertumbuhan` pelajaran bila tidak ditulis ulang; `seri` opsional).
- **Hasil cek:** ditampilkan per butir (✔/✘ + pesan Indonesia); petunjuk dibuka bertahap; status lulus disimpan di localStorage.
- **Folder `solusi/`:** hanya dibaca oleh validator, tidak ikut ter-bundle.
- **`pnpm cek-konten` memastikan:**
  - skema zod valid;
  - kode awal bisa dikompilasi;
  - setiap solusi lulus semua cek;
  - kode awal belum langsung lulus tantangan;
  - setiap penanda `#nama` punya pasangan `## Catatan #nama`, dan sebaliknya.
- **`docs/PANDUAN-DOSEN.md`:** cara menambah pelajaran langkah demi langkah.

## 9. Kurikulum

### Modul 1: Algoritma & Pemrograman Dasar (Fase 1)
| # | Pelajaran | Inti materi | Visual | Contoh tantangan |
|---|---|---|---|---|
| 1 | Program Java pertama | struktur class/main, statement & `;`, `println` vs `print`, urutan eksekusi | konsol, memori | Cetak biodata 3 baris (`outputPola`) |
| 2 | Variabel & tipe data | deklarasi, inisialisasi, 8 primitif + String, penamaan, `final` | memori (tooltip rentang) | `double ipk = 3.75` lalu cetak (`variabel` + tipe) |
| 3 | Strong typing & casting | widening otomatis, narrowing wajib casting, *lossy conversion*, `(int) 3.7`, char ↔ int, overflow | memori, evaluasi | Perbaiki error tipe dengan casting |
| 4 | Operator & ekspresi | aritmatika, `/` int vs double, `%`, `++/--`, compound, presedensi, relasional & logika | evaluasi, memori | Rata-rata 3 nilai sebagai double |
| 5 | Input dengan Scanner | `nextInt/nextDouble/nextLine`, jebakan `nextLine` setelah `nextInt` | input, memori | Luas persegi panjang (beberapa input uji) |
| 6 | if / else if / else | kondisi, relasional & logika, nested if, cabang yang dilewati | evaluasi, memori | Nilai angka → huruf A–E |
| 7 | switch | `case`, `break`, fall-through, `default`, `case ->` | evaluasi | Nama hari dari angka 1–7 |
| 8 | Perulangan for | inisialisasi/kondisi/update, jejak `i`, off-by-one | evaluasi, memori | Jumlah bilangan genap 1..n |
| 9 | while & do-while | cek awal vs akhir, sentinel, infinite loop & batas langkah | evaluasi, memori | Jumlah digit sebuah bilangan |
| 10 | Perulangan bersarang | pola bintang, tabel perkalian | konsol, memori | Segitiga terbalik tinggi 4 |
| 11 | Array 1 dimensi | `new int[n]`, nilai default, indeks, `.length`, maks/min, pencarian linear, out of bounds | array, evaluasi, memori | Nilai terkecil; jumlah nilai ≥ 75 |
| 12 | Array 2 dimensi | matriks, baris/kolom, loop bersarang | array2d | Jumlah diagonal utama |
| 13 | Method | parameter, return, `void`, scope, pass-by-value (primitif vs array), overloading | memori (call stack + referensi) | `luasLingkaran(double r)` |
| 14 | Rekursi & call stack | base case, faktorial, fibonacci, StackOverflowError | memori (call stack) | `pangkat(a, n)` rekursif tanpa loop |
| 15 | String | objek imutabel, method umum, `==` vs `equals`, membalik string | string, memori (heap) | Cek palindrom |

Ditambah halaman **Ruang Coba**: editor bebas dengan visual otomatis (memori, array, evaluasi, konsol) dan panel input.

### Modul 3: Strategi Algoritma (dirilis lebih dulu dari Modul 2)
| # | Pelajaran | Visual utama | Grafik pertumbuhan |
|---|---|---|---|
| 1 | Analisis algoritma & Big-O | array (penunjuk i, j), evaluasi, memori | O(n²), penghitung `operasi` |
| 2 | Brute force | array, evaluasi, memori | O(n²) |
| 3 | Pencarian linear & biner | array (`rentang` kiri..kanan) | dua seri: O(log n) vs O(n) |
| 4 | Bubble sort | array batang | acak & terurut sama-sama O(n²); tantangan "berhenti dini" membuat data terurut O(n) |
| 5 | Selection sort | array batang | selalu O(n²), juga untuk data terurut |
| 6 | Insertion sort | array batang | acak O(n²) vs terurut O(n) |
| 7 | Divide and conquer | pohonPanggilan | pangkat cepat O(log n) vs biasa O(n) |
| 8 | Merge sort | array batang + `rentang`, pohonPanggilan | O(n log n) |
| 9 | Quick sort | array batang + `rentang`, pohonPanggilan | acak O(n log n) vs terurut O(n²) |
| 10 | Greedy: uang kembalian | array, evaluasi | — |
| 11 | DP: Fibonacci | pohonPanggilan, array memo | naif O(2ⁿ) vs memo O(n) |
| 12 | DP: Knapsack 0/1 | array2d `tabel` berlabel | — |
| 13 | DP: Longest Common Subsequence | array2d `tabel` (label huruf) | — |
| 14 | Backtracking: N-Queens | array2d `papan`, pohonPanggilan | — |
| 15 | Graf: BFS & DFS | graf (dikunjungi, u/v), array antrean | — |
| 16 | Dijkstra: jarak terpendek | graf berbobot (label jarak) | — |

Setiap pelajaran punya 2 tantangan beserta solusinya (32 tantangan). Cek `kompleksitas` dipakai untuk tantangan efisiensi.

### Roadmap
- ~~**Modul 3: Strategi Algoritma**~~ **selesai** (tabel di atas). Modul ini dikerjakan lebih dulu karena cukup memakai subset Fase 1. Isinya:
  - grafik pertumbuhan, yaitu program dijalankan untuk beberapa ukuran n lalu jumlah operasinya dibandingkan dengan kurva acuan;
  - renderer rentang aktif pada array, pohon panggilan, tabel DP berlabel, papan backtracking, dan graf dari matriks.
- **Fase 2 + Modul 2: Struktur Data.**
  - ~~Mesin~~ **selesai**: lihat [§11](#11-fase-2-perluasan-mesin-untuk-struktur-data). Seluruh korpus (622 program) identik dengan JDK 21.
  - ~~Renderer~~ **selesai**: memori objek dan alur exception, rantai node, pohon, tumpukan, antrean, tabel hash, koleksi `java.util` (abstrak + "Lihat isi dalam"), graf dari daftar ketetanggaan.
  - Materi (15 pelajaran): class & objek, konstruktor & `this`, exception, ArrayList & wrapper, singly/doubly linked list, stack, queue, hashing, HashMap & HashSet, pohon biner, BST, heap & PriorityQueue, graf, mengurutkan objek & Iterator.

## 10. Pengujian & kualitas
- **Unit (Vitest):**
  - lexer; parser (snapshot AST); checker (minimal 1 tes per entri katalog error);
  - runtime: overflow, pembagian, casting, format angka, identitas String, Scanner;
  - trace: `stateAt(i)` sama dengan state dari eksekusi langsung untuk setiap i;
  - narasi.
- **Uji diferensial vs JDK 21** (`pnpm uji:diferensial`):
  - ≥ 100 program di `tests/korpus/` (+ file `.in` untuk stdin) dijalankan dengan `javac -g` + `java` asli dan dengan mesin kita;
  - stdout harus identik, dan kelas + pesan exception dibandingkan;
  - untuk `tests/korpus-error/`, baris dan teks error pertama harus sama dengan javac.
- **Validator konten:** `pnpm cek-konten`.
- **E2E** (Playwright, Chromium, 1280×720):
  - play/seret slider ↔ sorotan baris & penjelasan tetap sinkron;
  - hapus `maks = nilai[i];` → output dan animasi berubah, tantangan gagal;
  - `int maks = 3.5;` → error + penjelasan, animasi dijeda;
  - infinite loop → pesan batas langkah;
  - tantangan lulus → progres masih ada setelah reload;
  - Ruang Coba.
- **QA desain:** `review-animations`, `fixing-accessibility`, `web-design-guidelines`, `impeccable`; cek tema terang untuk proyektor.
- **Target performa:** kompilasi + jalan pelajaran biasa < 100 ms; `stateAt` < 5 ms; animasi 60 fps.


## 11. Fase 2: perluasan mesin untuk Struktur Data

Prinsipnya sama dengan Fase 1: setiap perilaku harus identik dengan JDK 21 dan dibuktikan lewat uji diferensial. Konstruksi di luar subset ini tetap mendapat pesan "[Simulator] … belum didukung" beserta alternatifnya.

### 11.1 Subset Java tambahan
- **Struktur:** beberapa class dalam satu file (`public class Main` + class non-public), class bersarang `static`, dan inner class (non-static) yang dibuat dari konteks instance. Nama biner JVM (`Main$Node`) dipakai di `toString` bawaan, stack trace, dan nama exception.
- **Anggota class:** field instance/static dengan initializer, konstruktor (overload, konstruktor bawaan, `this(...)`), method instance, `this`, modifier akses dengan aturan javac, dan field `final` yang wajib terisi di konstruktor.
- **Override method `Object`:** `toString()`, `equals(Object)`, `hashCode()`, dengan `@Override` divalidasi. Ketiganya dipanggil otomatis oleh `println`, konkatenasi, dan koleksi. Casting `Object` → class sendiri didukung (`ClassCastException`).
- **`implements Comparable<T>`** dan **lambda yang bertarget `Comparator<T>`**. Variabel yang ditangkap lambda wajib *effectively final*.
- **Exception:** `try/catch` (termasuk multi-catch), `finally`, `throw`, `throws`, checked vs unchecked. `extends` hanya diizinkan untuk exception (`Exception`, `RuntimeException`, atau exception bawaan lain) dengan `super(pesan)`. Tersedia `getMessage()`, `toString()`, `printStackTrace()`; `StackOverflowError` bisa ditangkap.
- **Wrapper & autoboxing:** `Integer`, `Long`, `Double`, `Character`, `Boolean`, dengan cache −128..127 persis JDK; unboxing `null` menghasilkan NPE.
- **Generik untuk tipe pustaka saja:** argumen tipe, bentuk bersarang, diamond `<>`, tipe antarmuka (`List`, `Map`, `Set`, `Queue`, `Deque`, `Collection`, `Iterable`, `Iterator`, `Map.Entry`), dan for-each pada koleksi.
- **Pustaka:** `StringBuilder`; `ArrayList`, `LinkedList`, `ArrayDeque`, `Stack`, `HashMap`, `HashSet`, `LinkedHashMap`, `LinkedHashSet`, `TreeMap`, `TreeSet`, `PriorityQueue`, `Iterator`; `Collections`, `Arrays.asList`, `List.of`, `Integer.compare`; `Random` dengan seed (deret LCG identik dengan JDK).
- **Tetap ditolak:** class/method generik buatan sendiri, wildcard, pewarisan antar-class biasa, interface/abstract buatan sendiri, `instanceof`, enum, record, anonymous/local class, lambda selain `Comparator`, method reference, stream, `var`, `Map.of`/`Set.of` (urutan iterasinya diacak JDK per run), thread, I/O file.

### 11.2 Model runtime
- **Objek heap baru:**
  - `objek` `{ kelas, field, tipeField, internal? }`: class mahasiswa, exception, dan objek internal koleksi;
  - `boks` (wrapper), `pembangun` (StringBuilder), `lambda` (AST + nilai tangkapan).
- **Exception** adalah objek biasa. Jejak stack-nya direkam saat objek dibuat (seperti `fillInStackTrace`), bukan saat dilempar.
- **Frame:** `this` tampil sebagai variabel pertama method instance. Konstruktor menjadi frame `Node(…)`, dan di stack trace bernama `Node.<init>`.
- **Peristiwa baru:** `tulis-field` (mengubah state); `baca-field`, `lempar`, `tangkap`, `finally`, `boxing` (informatif).
- **Callback pustaka → kode mahasiswa:** `KonteksPustaka.panggil(objek, method, argumen)` menjalankan `toString`, `compareTo`, `compare`, `equals`, atau `hashCode` milik mahasiswa secara rekursif. Frame dan langkahnya ikut terekam, dengan baris pemanggil = baris pemanggilan pustaka.
- **Pesan NPE** mengikuti JDK 21 (JEP 358), misalnya `Cannot read field "next" because "curr" is null`.
- **Nilai akhir untuk cek tantangan:** objek → `{field: nilai}`, List/Set → array, Map → objek kunci → nilai.
- **Nilai yang tidak deterministik di JVM** (hash identitas, `toString` bawaan `Node@1b6d3586`) dibuat deterministik oleh simulator; narasi menjelaskannya dan korpus tidak mencetaknya.

### 11.3 Koleksi `java.util`
Setiap koleksi dimodelkan sebagai objek heap dengan field yang sama seperti JDK 21:

| Koleksi | Field yang dimodelkan |
|---|---|
| `ArrayList` | `elementData`, `size`, `modCount` |
| `HashMap` | `table`, `size`, `threshold`, `modCount`; node `HashMap$Node{hash, key, value, next}` |
| `LinkedHashMap` | seperti `HashMap`, ditambah `head`, `tail`, dan `before`/`after` per node |
| `HashSet` / `LinkedHashSet` | `map` |
| `LinkedList` | `first`, `last`, `size`; node `LinkedList$Node{item, next, prev}` |
| `ArrayDeque` | `elements`, `head`, `tail` |
| `Stack` (`Vector`) | `elementData`, `elementCount` |
| `PriorityQueue` | `queue`, `size` |
| `TreeMap` / `TreeSet` | `root`, `size`; node `TreeMap$Entry{key, value, left, right, parent, color}` |

- **Perilaku yang wajib identik:** urutan iterasi dan `toString`, pertumbuhan kapasitas, penyebaran hash dan pemecahan bucket saat resize, siftUp/siftDown, penyeimbangan red-black, `modCount` + iterator → `ConcurrentModificationException` (termasuk kasus yang tidak melempar), pesan exception, serta urutan pemanggilan `compareTo`/`compare` saat sort dan pada heap.
- **Implementasi ditulis sendiri** dari dokumentasi dan perilaku teramati, tanpa menyalin kode OpenJDK. Verifikasinya dua lapis: korpus diferensial, dan harness refleksi JDK (`--add-opens java.base/java.util=ALL-UNNAMED`) yang membuang isi field internal sebagai fixture unit test.
- **"Lihat isi dalam"** menggambar objek-objek internal ini; tampilan abstrak dihitung darinya.
- **Batasan:** treeification bucket HashMap (≥ 8 tabrakan dengan tabel ≥ 64) tidak dimodelkan.

### 11.4 Type checker & analisis alur
- **Class:** tabel class (mahasiswa + pustaka), pencarian nama bertingkat (lokal → field class → class luar), konteks static/instance, konstruktor + overload, aturan akses, `@Override`.
- **Tipe:** argumen dan variabel tipe pustaka, hierarki antarmuka pustaka, invariansi generik, diamond yang tipenya diambil dari target, boxing/unboxing, resolusi overload 3 fase (JLS 15.12.2; contoh `list.remove(1)` vs `remove(Integer)`).
- **Lambda → `Comparator<T>`:** tipe parameter dari target, badan ekspresi atau blok, analisis *effectively final*.
- **Exception:** hierarki `Throwable`, analisis checked exception, `throws`, urutan catch.
- **Analisis alur:** *definite assignment* dan keterjangkauan untuk try/catch/finally (JLS 16.2.15), `throw`, field `final` di konstruktor, badan lambda.

### 11.5 Katalog error tambahan (teks persis javac 21)
- **Class dan objek:**
  - `non-static variable this cannot be referenced from a static context`;
  - `constructor X in class X cannot be applied to given types;`, `no suitable constructor found for …`;
  - `x has private access in X`;
  - `variable x not initialized in the default constructor`;
  - `call to super must be first statement in constructor`;
  - `duplicate class: X`, `modifier static not allowed here`.
- **Override:**
  - `method does not override or implement a method from a supertype`;
  - `toString() in X cannot override toString() in Object`;
  - `X is not abstract and does not override abstract method compareTo(X) in Comparable`.
- **Generik:** `unexpected type`, `incompatible types: String cannot be converted to Integer`, `generic array creation`.
- **Exception:**
  - `unreported exception X; must be caught or declared to be thrown`;
  - `exception X is never thrown in body of corresponding try statement`;
  - `exception X has already been caught`;
  - `'try' without 'catch', 'finally' or resource declarations`.
- **Lambda:** `local variables referenced from a lambda expression must be final or effectively final`, `incompatible types: bad return type in lambda expression`.

### 11.6 Pengujian
- **Korpus Fase 2:** 204 program jalan (nomor 201-404 di `tests/korpus/`) dan 116 program error (nomor 201-316 di `tests/korpus-error/`). Selama staging, korpus ini berada di folder terpisah dan hanya dijalankan dengan JDK. Setelah integrasi, korpus dipindah ke folder utama, sehingga `pnpm uji:diferensial` menjalankan semuanya. Catatan perilaku JDK yang menjadi rujukan ada di `tests/korpus/CATATAN-FASE2.md`. Untuk memeriksa program korpus baru sebelum mesin mendukungnya, pakai `pnpm uji:diferensial <filter> --hanya-jdk`.
- **Target:** seluruh korpus lama dan baru identik dengan JDK 21. Untuk diagnostik generik yang sangat panjang, minimal baris pertama dan posisinya identik; kasus ini dilaporkan terpisah.
- **Anggaran performa:** kompilasi + eksekusi satu pelajaran < 5 ms (median), `stateDi` < 1 ms, 60 fps pada build produksi.