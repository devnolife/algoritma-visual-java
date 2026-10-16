# Catatan perilaku JDK 21 untuk korpus fase 2

Rujukan bagi penulis mesin Java Mini. Semua contoh di bawah **disalin dari keluaran JDK asli** (javac/java 21,
`-g`, locale `en_US`) melalui `pnpm uji:diferensial --hanya-jdk`. Program korpus fase 2 bernomor 201-407 di
`tests/korpus/NNN-*.java` dan 201-317 di `tests/korpus-error/NNN-*.java`. Contoh bertanda _(probe)_ berasal dari program uji terpisah dan **tidak**
ada di korpus, karena perilakunya terlalu bergantung pada detail internal javac atau di luar subset fase 2.

Uji diferensial membuang frame `at java.base/...`, jadi mesin hanya perlu mencetak frame kode mahasiswa. Contoh
keluaran mentah JDK (frame internal masih ada):

```
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "a.skor" is null
	at Main.lambda$main$2(Main.java:33)
	at java.base/java.util.TimSort.binarySort(TimSort.java:296)
	at java.base/java.util.TimSort.sort(TimSort.java:221)
	at java.base/java.util.Arrays.sort(Arrays.java:1308)
	at java.base/java.util.ArrayList.sort(ArrayList.java:1804)
	at Main.main(Main.java:32)
```

Setelah disaring, yang dibandingkan hanya baris pertama, frame `Main.lambda$main$2`, dan `Main.main`.

## 1. Pesan NullPointerException (helpful NPE)

Pesannya sama, baik untuk NPE yang tidak tertangkap (`Exception in thread "main" java.lang.NullPointerException: ...`)
maupun yang ditangkap lalu dicetak dengan `e.getMessage()`. Bentuk umumnya `<aksi> because <asal> is null`.

**Aksi** (apa yang gagal):

| Ekspresi                  | Aksi                                                                                                   | Program            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ |
| baca field `x.f`          | `Cannot read field "f"`                                                                                | 388, 393, 395      |
| tulis field `x.f = v`     | `Cannot assign field "f"`                                                                              | 389                |
| panggil method            | `Cannot invoke "Kelas.method(TipeParam, TipeParam)"`                                                   | 390, 391           |
| baca elemen array         | `Cannot load from int array` / `Cannot load from object array`                                         | 392, 399           |
| tulis elemen array        | `Cannot store to int array`                                                                            | 392                |
| `a.length`                | `Cannot read the array length`                                                                         | 392, 399           |
| unboxing                  | `Cannot invoke "java.lang.Integer.intValue()"` (juga `Boolean.booleanValue()`, `Double.doubleValue()`) | 275, 280, 396, 397 |
| `throw e` dengan `e` null | `Cannot throw exception` _(probe)_                                                                     | –                  |

Nama kelas di dalam aksi `Cannot invoke`:

- `java.lang.String` dan `java.lang.Object` disingkat menjadi `String` dan `Object`. Kelas JDK lain ditulis lengkap, misalnya `java.lang.Integer.intValue()` dan `java.util.List.get(int)`.
- Kelas bersarang memakai nama biner, misalnya `Main$Akun.setor(int)`. Kelas top-level tanpa awalan, misalnya `Dompet.bayar(int, String)`.
- Daftar tipe parameter dipisah `", "` (koma + spasi). Diagnostik javac justru memakai `","` tanpa spasi, misalnya `Barang(String,String)`.

**Asal** (bagian yang null):

| Bentuk kode                                                | Asal dalam pesan                                                                                      | Program       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------- |
| variabel lokal/parameter `curr`, `o`                       | `"curr"`, `"o"`                                                                                       | 388, 398      |
| rantai field `p.next.next`                                 | `"p.next"`                                                                                            | 388           |
| `o.alamat.kota.nama`                                       | `"o.alamat.kota"`                                                                                     | 398           |
| field milik objek ini (`kepala.isi`, ditulis tanpa `this`) | `"this.kepala"`                                                                                       | 393           |
| field static `akar.nilai` di Main                          | `"Main.akar"`, rantai `"Main.akar.kiri"`                                                              | 394           |
| field static kelas lain                                    | `"Konfigurasi.aktif"`                                                                                 | 394           |
| elemen array static `daftar[i]`                            | `"Main.daftar[i]"`                                                                                    | 390           |
| elemen array lokal `rak[2]`, `nama[i]`                     | `"rak[2]"`, `"nama[i]"`                                                                               | 389, 399      |
| indeks berupa ekspresi `jadwal[i + 1]`                     | `"jadwal[...]"`                                                                                       | 392           |
| nilai kembali method                                       | `the return value of "Main.cari(int)"` (tanpa tanda kutip di sekitar `the return value`)              | 391, 395, 399 |
| `List.get` vs `ArrayList.get`                              | mengikuti **tipe statis** variabel: `"java.util.List.get(int)"` atau `"java.util.ArrayList.get(int)"` | 398, 395      |
| `Map.get` vs `HashMap.get`                                 | `"java.util.Map.get(Object)"` atau `"java.util.HashMap.get(Object)"`                                  | 396           |
| for-each atas `List<Integer>` berisi null                  | `the return value of "java.util.Iterator.next()"`                                                     | 397           |
| parameter lambda                                           | `"a.skor"` (frame `lambda$main$2`)                                                                    | 269           |

Contoh lengkap:

```
Cannot read field "next" because "p.next" is null
Cannot assign field "isi" because "luar.dalam.dalam" is null
Cannot invoke "Main$Akun.setor(int)" because "Main.daftar[i]" is null
Cannot invoke "Dompet.bayar(int, String)" because "dompet" is null
Cannot invoke "String.toUpperCase()" because the return value of "Main.cariNama(String[], String)" is null
Cannot load from int array because "jadwal[...]" is null
Cannot store to int array because "Main.cadangan" is null
Cannot load from object array because "tabel[1]" is null
Cannot read the array length because the return value of "Main.muat(boolean)" is null
Cannot read field "isi" because "this.kepala" is null
Cannot invoke "String.length()" because "Konfigurasi.aktif" is null
Cannot read field "harga" because the return value of "java.util.ArrayList.get(int)" is null
Cannot invoke "java.lang.Integer.intValue()" because the return value of "java.util.Map.get(Object)" is null
Cannot invoke "java.lang.Integer.intValue()" because the return value of "java.util.HashMap.get(Object)" is null
Cannot invoke "java.lang.Integer.intValue()" because the return value of "java.util.Iterator.next()" is null
Cannot invoke "java.lang.Boolean.booleanValue()" because the return value of "Main.cekLulus(int)" is null
Cannot invoke "java.lang.Double.doubleValue()" because "st.rata" is null
```

Hal yang mengejutkan:

- **Ternary bercampur int memicu unboxing** (281). Tipe `adaMangga ? 0 : stok.get("mangga")` adalah `int`, sehingga `get` yang mengembalikan null langsung di-unbox:
  `Cannot invoke "java.lang.Integer.intValue()" because the return value of "java.util.HashMap.get(Object)" is null`.
- **NPE yang dilempar eksplisit oleh kode JDK tidak punya pesan.** Contohnya `ArrayDeque.offer/push(null)` (316), `List.of(...).contains(null)` (300), `PriorityQueue.offer(null)`, `List.of("a", null)`, dan `TreeMap.put(null, v)` pada map tidak kosong _(probe)_. Hasilnya hanya `java.lang.NullPointerException`, dan `getMessage()` mengembalikan `null`.
- **`TreeMap.put(null, v)` / `TreeSet.add(null)` pada koleksi kosong** justru menghasilkan pesan helpful dari dalam kode JDK _(probe)_: `Cannot invoke "java.lang.Comparable.compareTo(Object)" because "k1" is null`.
- **Variabel sintetis javac muncul sebagai `<localN>`** _(probe; sengaja dihindari di korpus karena bergantung pada nomor slot)_:
  - `st.n++` dengan field `Integer n` yang null menghasilkan `... because "<local1>.n" is null`. Begitu juga `st.n += 2`. Di dalam method lain, nomornya berbeda (di 397 versi awal tertulis `<local5>.jumlah`). Korpus memakai `st.jumlah = st.jumlah + 1`, yang menghasilkan `"st.jumlah"`.
  - `a[0]++` pada `Integer[]` menghasilkan `"<local1>[0]"`.
  - `switch` pada String null menghasilkan `Cannot invoke "String.hashCode()" because "<local1>" is null`.
  - for-each atas array null menghasilkan `Cannot read the array length because "<local1>" is null`.
  - Sebaliknya, for-each atas `List` null memakai nama asli: `Cannot invoke "java.util.List.iterator()" because "daftar" is null`.

## 2. ClassCastException

Formatnya `class A cannot be cast to class B (<info modul>)`. Bagian info modul:

- bila A dan B satu modul/loader: `(A and B are in unnamed module of loader 'app')`;
- bila berbeda: `(A is in unnamed module of loader 'app'; B is in module java.base of loader 'bootstrap')`.

```
class Main$Dolar cannot be cast to class Main$Rupiah (Main$Dolar and Main$Rupiah are in unnamed module of loader 'app')
class java.lang.String cannot be cast to class Main$Rupiah (java.lang.String is in module java.base of loader 'bootstrap'; Main$Rupiah is in unnamed module of loader 'app')
class Anjing cannot be cast to class Kucing (Anjing and Kucing are in unnamed module of loader 'app')
class java.lang.String cannot be cast to class java.lang.Integer (java.lang.String and java.lang.Integer are in module java.base of loader 'bootstrap')
class Main$Tugas cannot be cast to class java.lang.Comparable (Main$Tugas is in unnamed module of loader 'app'; java.lang.Comparable is in module java.base of loader 'bootstrap')
```

Program: 231, 258, 251, 265, 354.

Catatan:

- Kelas bersarang ditulis dengan nama biner (`Main$Dolar`), kelas top-level tanpa awalan.
- Meng-cast `null` tidak pernah gagal (258).
- `PriorityQueue.add` dengan objek non-Comparable dan tanpa Comparator langsung gagal **pada elemen pertama** (354). Frame JDK-nya `PriorityQueue.siftUpComparable`.

## 3. IndexOutOfBoundsException per method

| Pemanggilan                                     | Exception dan pesan                                                                                             | Program  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| `ArrayList.get/set/remove(int)`                 | `java.lang.IndexOutOfBoundsException: Index 5 out of bounds for length 3` (indeks negatif juga: `Index -1 ...`) | 296, 276 |
| `ArrayList.add(int, E)`                         | `java.lang.IndexOutOfBoundsException: Index: 5, Size: 3`                                                        | 296      |
| `LinkedList.get/set/remove/add(int, ...)`       | `java.lang.IndexOutOfBoundsException: Index: 5, Size: 3`                                                        | 313      |
| `List.of(a, b, c).get(3)` (3 elemen atau lebih) | `java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3`                                  | 300      |
| `List.of(a, b).get(2)` (1–2 elemen)             | `java.lang.IndexOutOfBoundsException: Index: 2 Size: 2` (**tanpa koma**)                                        | 300      |
| `Arrays.asList(...).get(3)`                     | `java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3`                                  | 299      |
| `Stack.get(7)` (Vector)                         | `java.lang.ArrayIndexOutOfBoundsException: Array index out of range: 7`                                         | 318      |
| `list.remove('A')`                              | char dilebarkan ke int, sehingga yang terpanggil `remove(int 65)`: `Index 65 out of bounds for length 9`        | 277      |
| `ArrayList.subList(0, 1)` pada list kosong      | `java.lang.IndexOutOfBoundsException: toIndex = 1` _(probe)_                                                    | –        |

Indeks array biasa: `Index 3 out of bounds for length 3`, `Index -1 out of bounds for length 3`, dan `Index 0 out of bounds for length 0` (255).

StringBuilder (288) melempar `java.lang.StringIndexOutOfBoundsException` dengan dua format:

```
charAt(10) -> java.lang.StringIndexOutOfBoundsException: Index 10 out of bounds for length 5
deleteCharAt(5) -> java.lang.StringIndexOutOfBoundsException: Index 5 out of bounds for length 5
setCharAt(-1) -> java.lang.StringIndexOutOfBoundsException: Index -1 out of bounds for length 5
insert(9) -> java.lang.StringIndexOutOfBoundsException: Range [9, 5) out of bounds for length 5
delete(3, 1) -> java.lang.StringIndexOutOfBoundsException: Range [3, 1) out of bounds for length 5
substring(4, 2) -> java.lang.StringIndexOutOfBoundsException: Range [4, 2) out of bounds for length 5
replace(7, 8) -> java.lang.StringIndexOutOfBoundsException: Range [7, 5) out of bounds for length 5
```

Perhatikan pada format `Range`:

- `insert(9, ...)` dan `replace(7, 8, ...)` melaporkan rentang `[awal, length)`, bukan argumen kedua yang diberikan.
- `delete(2, 99)` **tidak** melempar exception, karena ujungnya dipotong ke `length()`.
- `"abc".charAt(5)` pada String: `Index 5 out of bounds for length 3` (251).

## 4. Exception tanpa pesan dan pesan lain dari JDK

Exception berikut **tidak punya pesan**: `toString()` hanya berisi nama kelas, dan `getMessage()` bernilai `null`.

| Exception                                   | Pemicu                                                                                                                                                          | Program       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `java.util.NoSuchElementException`          | `Iterator.next()` kebablasan pada ArrayList; iterator HashMap dan LinkedList berperilaku sama _(probe)_                                                         | 259, 304      |
|                                             | `ArrayDeque.removeFirst/pop` (259), `ArrayDeque.element` _(probe)_, `LinkedList.getFirst/getLast/removeFirst/removeLast/pop/remove()` (312) pada koleksi kosong | 259, 312      |
|                                             | `TreeMap.firstKey()` pada map kosong                                                                                                                            | 344           |
|                                             | `Collections.max` pada list kosong                                                                                                                              | 298           |
|                                             | `PriorityQueue.remove()` pada antrian kosong (`poll()` justru mengembalikan `null`)                                                                             | 355           |
| `java.util.EmptyStackException`             | `Stack.pop/peek` pada stack kosong (frame JDK: `Stack.peek`, `Stack.pop`)                                                                                       | 260, 321      |
| `java.lang.UnsupportedOperationException`   | `List.of(...).add/set/remove` dan `Arrays.asList(...).add/remove` (frame JDK: `AbstractList.add` dua kali)                                                      | 299, 300      |
| `java.lang.IllegalStateException`           | `Iterator.remove()` sebelum `next()` atau dua kali berturut-turut                                                                                               | 261           |
| `java.util.ConcurrentModificationException` | modifikasi struktural di tengah for-each, baik ArrayList maupun HashMap                                                                                         | 294, 295, 334 |
| `java.lang.NullPointerException`            | null yang dilempar eksplisit dari kode JDK (lihat bagian 1)                                                                                                     | 300, 316      |

Pesan JDK lain yang perlu ditiru:

- `InputMismatchException` dari `Scanner.nextInt` (257):
  - token yang tidak cocok pola bilangan bulat (`x`, `4.5`, `sembilan`) menghasilkan `java.util.InputMismatchException` **tanpa pesan**;
  - token yang cocok pola tetapi meluap menghasilkan `java.util.InputMismatchException: For input string: "99999999999"`.
- `Integer.parseInt` (256):
  - `For input string: "abc"`, `For input string: ""`, `For input string: " 5"` (spasi tidak dipangkas), `For input string: "3.5"`, `For input string: "2147483648"`, `For input string: "0x1F"`;
  - `Integer.parseInt(null)` menghasilkan `Cannot parse null string` _(probe)_.
- `Double.parseDouble(" 2.5 ")` **memangkas spasi** dan berhasil, berbeda dengan `Integer.parseInt(" 5")` (256).
- Lain-lain:
  - `new int[-2]` menghasilkan `java.lang.NegativeArraySizeException: -2` (251);
  - `new ArrayList<>(-1)` menghasilkan `Illegal Capacity: -1` _(probe)_;
  - `new Random(1).nextInt(0)` menghasilkan `bound must be positive` _(probe)_.

## 5. Keluaran exception yang tidak tertangkap

Formatnya `Exception in thread "main" <nama biner>[: <pesan>]`, lalu satu baris `\tat ...` per frame. Kode keluarnya 1.

- **Nama biner**: exception bersarang tercetak `Main$StokHabisException` (249). Kelas di dalam kelas bersarang tercetak `Main$Gudang$Rak.ambil` (270). Kelas top-level tanpa awalan, misalnya `SaldoTidakCukupException` (248).
- **Pesan null**: tanpa titik dua, misalnya `Exception in thread "main" java.util.EmptyStackException`. Pesan kosong `""` tetap memakai titik dua dan spasi, misalnya `java.lang.RuntimeException: ` (251).
- **Konstruktor** tercetak `<init>`, termasuk rantai `this(...)` (250):

  ```
  Exception in thread "main" java.lang.ArithmeticException: penyebut tidak boleh nol
  	at Main$Pecahan.<init>(Main.java:9)
  	at Main$Pecahan.<init>(Main.java:20)
  	at Main.main(Main.java:48)
  ```

- **Lambda Comparator**: framenya bernama `lambda$<method>$<n>` dengan `n` dihitung per kelas sesuai urutan kemunculan lambda di sumber, mulai dari 0. Lambda ketiga di `main` menjadi `lambda$main$2` (269). Frame pemanggil menunjuk baris pemanggilan `sort`, bukan baris lambda.
- **Rekursi**: semua frame tercetak tanpa pemotongan. Program 253 mencetak 26 frame `Main.telusuri` diikuti `Main.mulai` dan `Main.main`.
- **Stack trace direkam saat objek exception dibuat**, bukan saat dilempar (271). Exception yang dibuat di `siapkan()` lalu dilempar dari `main` mencetak:

  ```
  Exception in thread "main" java.lang.IllegalStateException: rusak
  	at Main.siapkan(Main.java:16)
  	at Main.main(Main.java:36)
  ```

  Baris 36 adalah pemanggilan `siapkan`, bukan pernyataan `throw`.

- Semua blok `finally` berjalan sebelum JVM mencetak stack trace (265). Karena stdout dan stderr dibandingkan terpisah, urutan antar-aliran tidak diuji.

## 6. Format printStackTrace

`e.printStackTrace()` menulis ke **stderr** dengan bentuk `<toString()>` lalu baris `\tat ...`, **tanpa** awalan `Exception in thread`. Program tetap berjalan dan bisa selesai dengan kode keluar 0 (252, 264, 271):

```
Main$DataRusakException: nilai 'x' bukan angka
	at Main.parseNilai(Main.java:13)
	at Main.rataRata(Main.java:20)
	at Main.main(Main.java:29)
java.lang.ArithmeticException: / by zero
	at Main.rataRata(Main.java:22)
	at Main.main(Main.java:29)
```

Exception tanpa pesan hanya mencetak nama kelasnya, misalnya `Main$AksesDitolak` (271).

Exception dengan _cause_ (`new IllegalStateException("gagal konversi", e)`) berada di luar subset fase 2. Sebagai rujukan _(probe)_:

```
java.lang.IllegalStateException: gagal konversi
	at Main.main(Main.java:52)
Caused by: java.lang.ClassCastException: class java.lang.String cannot be cast to class java.lang.Integer (java.lang.String and java.lang.Integer are in module java.base of loader 'bootstrap')
	at Main.main(Main.java:51)
```

## 7. HashMap, HashSet, LinkedHashMap

- **Urutan iterasi** mengikuti indeks bucket `(h ^ (h >>> 16)) & (n - 1)`. Di dalam satu bucket, urutannya sesuai sisip.
- **Ukuran tabel** dimulai dari 16 dan menjadi dua kali lipat saat `size > 0.75 * n`, yaitu saat entri ke-13, ke-25, ke-49, dan ke-97 (328, 329, 342, 345). Resize membelah bucket tanpa mengubah urutan relatif. Program 328 memperlihatkan perubahan urutan di setiap ambang.
- **String yang bertabrakan** (330): `"Aa"`, `"BB"`, dan `"C#"` sama-sama ber-hash 2112. `"AaAa"`, `"BBBB"`, `"AaBB"`, dan `"BBAa"` ber-hash 2031744.
- **Resize, bukan treeify** (331): ketika satu bucket sudah berisi 8 node dan kunci ke-9 masuk, `treeifyBin` memanggil `resize()` karena kapasitas tabel < 64. Pada program 331, kunci ke-9 memindahkan tabel 16 menjadi 32 walau size baru 12. Kunci ke-10 memindahkan 32 menjadi 64. Perubahan urutan penanda `a`, `q`, `Q` menjadi buktinya:

  ```
  8. AaBBBBBB (hash -540425984), size 11: {a=0, q=0, Q=0, AaAaAaAa=1, AaAaAaBB=2, AaAaBBAa=3, AaAaBBBB=4, AaBBAaAa=5, AaBBAaBB=6, AaBBBBAa=7, AaBBBBBB=8}
  9. BBAaAaAa (hash -540425984), size 12: {a=0, AaAaAaAa=1, AaAaAaBB=2, AaAaBBAa=3, AaAaBBBB=4, AaBBAaAa=5, AaBBAaBB=6, AaBBBBAa=7, AaBBBBBB=8, BBAaAaAa=9, q=0, Q=0}
  10. BBAaAaBB (hash -540425984), size 13: {AaAaAaAa=1, AaAaAaBB=2, AaAaBBAa=3, AaAaBBBB=4, AaBBAaAa=5, AaBBAaBB=6, AaBBBBAa=7, AaBBBBBB=8, BBAaAaAa=9, BBAaAaBB=10, Q=0, a=0, q=0}
  ```

- **Treeify sungguhan** terjadi mulai kunci ke-11 bila tabel sudah 64 _(probe; sengaja tidak ada di korpus)_. Akar pohon merah-hitam dipindah ke depan bucket, sehingga urutan iterasinya berubah: `[AaAaBBBB, AaAaAaAa, AaAaAaBB, AaAaBBAa, ...]`.
- **`hashCode` dan `equals`** (230):
  - `hashCode` dipanggil tepat sekali per `put/get/containsKey/remove/getOrDefault/putIfAbsent`, dan tidak pernah saat resize;
  - `equals` dipanggil sebagai `kunciDicari.equals(kunciTersimpan)`, hanya bila hash sama dan referensinya berbeda;
  - `put` dengan objek kunci yang sama persis tidak memanggil `equals`.
- **Pencarian di List** (228): `ArrayList.contains/indexOf/remove(Object)` memanggil `argumen.equals(elemen)`, termasuk `argumen.equals(null)` untuk elemen null. `lastIndexOf` menelusuri dari belakang. `ArrayList.equals` memanggil `elemenKiri.equals(elemenKanan)` dan melewati pasangan yang referensinya sama.
- **Nilai null** (326, 347):
  - kunci null diperbolehkan dan tercetak pertama karena berada di bucket 0;
  - `getOrDefault` mengembalikan `null`, bukan nilai default, bila kuncinya ada dengan nilai null;
  - `putIfAbsent` menimpa nilai null.
- **Mengubah field kunci** setelah disimpan membuat entri "hilang" untuk `get`, padahal `containsValue` masih menemukannya (341).
- **LinkedHashMap** (335): `put` ulang tidak memindahkan posisi, sedangkan `remove` lalu `put` memindahkan entri ke belakang.

## 8. Pengurutan dan urutan perbandingan

- **Algoritma**: `Collections.sort`, `List.sort`, dan `Arrays.sort(Object[])` memakai TimSort (ComparableTimSort bila tanpa Comparator):
  - n < 32: `countRunAndMakeAscending`, lalu insertion sort biner. Perbandingan pertama selalu `a[1]` terhadap `a[0]`, misalnya `banding 1 dengan 3` untuk `[3, 1, 4, 1, 5]` (363).
  - Run yang menurun tegas dibalik. Pada 365, `85:90 80:85 75:80 ...` adalah run menurun 8 elemen yang lalu diperpanjang ke minRun.
  - minRun untuk n = 40 adalah 20, dan untuk n = 70 adalah 18 (365, 366).
  - Mode galloping terlihat di 367 (`9:0 9:1 9:3 9:7 9:46 ...`, lompatan eksponensial).
- **Stabilitas**: pengurutan objek stabil (362).
- **Comparator pengurangan**: `(a, b) -> a - b` salah urut untuk nilai ekstrem karena overflow (370). TimSort **tidak** melempar exception untuk 8 elemen.
- **PriorityQueue** (356):
  - `offer` membandingkan elemen baru dengan induknya (`5?50 5?30 5?10`);
  - `poll` membandingkan dua anak dulu (`10?20`), lalu elemen yang turun dengan anak terkecil (`50?10`);
  - elemen yang setara **tidak FIFO** (351);
  - `new PriorityQueue<>(list)` memakai heapify (siftDown dari tengah), sehingga isi array bisa berbeda dari offer satu per satu (350);
  - `toString` dan iterasi mengikuti urutan array heap (348, 349).
- **TreeMap dan TreeSet** membandingkan kunci pertama dengan dirinya sendiri: `put M: M?M` (368) dan `add 40: 40?40` (369). Kunci yang dianggap sama oleh Comparator digabung menjadi satu, dan kunci pertama yang dipertahankan (339).
- **`Collections.max(list, cmp)`** memanggil `cmp.compare(berikut, kandidat)`: `20?40 60?40 10?60 30?60 20?60` (369).

## 9. Perilaku lain yang mengejutkan

- **Wrapper**:
  - cache Integer dan Long hanya untuk −128..127, sehingga `==` bernilai true untuk 127 dan false untuk 128 (273, 279);
  - Character di-cache untuk kode ≤ 127, sedangkan Double tidak pernah (277, 278);
  - `Double.valueOf(0.0).equals(-0.0)` false, dan `NaN` `equals` `NaN` true (278).
- **Kunci HashMap bertipe Long**: `HashMap<Long, ...>.get(2021002)` dengan literal int mengembalikan `null` karena Integer ≠ Long (279).
- **For-each yang memodifikasi list** (295):
  - menghapus elemen **kedua terakhir** tidak melempar CME, dan elemen terakhir terlewat;
  - menghapus elemen **terakhir** justru melempar CME.
- **`finally`**:
  - `return` di `finally` menimpa nilai kembali dan menelan exception (245);
  - perubahan variabel di `finally` tidak mengubah nilai `return` yang sudah dihitung, tetapi perubahan isi objek terlihat (245, 268).
- **Inisialisasi kelas malas** (220):
  - field static kelas lain baru diinisialisasi saat kelas itu pertama kali dipakai;
  - membaca konstanta `static final int VERSI = 3` tidak memicu inisialisasi.
- **`Arrays.asList`**:
  - `Arrays.asList(int[])` menghasilkan `List<int[]>` berisi **satu** elemen (299);
  - list hasil `Arrays.asList(String[])` menempel ke arraynya: perubahan di salah satu terlihat di yang lain (299).
- **Kesamaan List dan Deque**:
  - `ArrayList.equals(LinkedList)` dan `ArrayList.equals(List.of(...))` bernilai true bila isinya sama (234);
  - `ArrayDeque` tidak meng-override `equals` (325).
- **`list.addAll(list)`** menggandakan isi list (292).
- **Konkatenasi null**: `null + " tambahan"` menghasilkan `null tambahan`, dan `StringBuilder.append((String) null)` menambahkan teks `null` (206, 283).
- **javac**:
  - `Character c = 65;` **sah** (konstanta di-narrowing lalu di-boxing). Yang error adalah `Character c = kode;` dengan `kode` bertipe int (error 273).
  - `nama.size` tanpa kurung pada `ArrayList` menghasilkan `size has private access in ArrayList` karena ArrayList punya field private `size` (error 265). Pada variabel bertipe `List`, hasilnya `cannot find symbol` (error 283).
  - Bila hanya satu kandidat method/konstruktor yang cocok jumlah argumennya, javac memakai pesan ringkas `incompatible types: int cannot be converted to String` (error 203). Bentuk `no suitable constructor found for ...` beserta detail per kandidat hanya muncul bila ada beberapa kandidat dengan jumlah parameter sama (error 204).
  - Lambda dengan tipe parameter eksplisit yang salah dilaporkan sebagai `incompatible types: Comparator<String> cannot be converted to Comparator<? super Integer>` (error 315).
  - **Urutan error javac tidak selalu menurut nomor baris.** Pada `@Override public long hashCode()`, error `cannot override` (baris method) dilaporkan sebelum error `@Override` (baris sebelumnya). Pada `compareTo` berkembalian boolean, error kelas `is not abstract and does not override ...` dilaporkan lebih dulu (error 252).
