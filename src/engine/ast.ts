import type { Span } from './sumber'
import type { NamaPrimitif, Tipe } from './tipe'

/** Nilai konstanta compile-time (JLS 15.29). String disimpan sebagai string JS. */
export type NilaiKonstan = number | bigint | boolean | string

interface Dasar {
  id: number
  span: Span
}

// ---------- Tipe di kode sumber ----------
export type NodeTipe =
  | (Dasar & { jenis: 'TipePrimitif'; nama: NamaPrimitif })
  /** `argumen` kosong (`[]`) = diamond `<>`; undefined = tanpa argumen tipe. */
  | (Dasar & { jenis: 'TipeNama'; nama: string; argumen?: NodeTipe[] })
  | (Dasar & { jenis: 'TipeArray'; elemen: NodeTipe })
  /** Hanya sebagai argumen tipe: `?`, `? extends T`, `? super T`. */
  | (Dasar & { jenis: 'TipeWildcard'; batas: 'extends' | 'super' | null; tipe?: NodeTipe })

export type Akses = 'public' | 'protected' | 'private' | 'paket'

// ---------- Simbol (diisi type checker) ----------
export interface InfoLokal {
  nama: string
  tipe: Tipe
  slot: number
  final: boolean
  parameter: boolean
  /** true bila dideklarasikan dengan nilai awal (untuk aturan final). */
  punyaInit?: boolean
  konstan?: NilaiKonstan
  span: Span
}

/** Informasi class mahasiswa (top-level atau bersarang), diisi checker. */
export interface InfoKelas {
  /** Nama kanonik, kunci unik: `Main`, `Node`, `Main.Node`, `Main.Gudang.Rak`. */
  nama: string
  /** Nama sederhana, mis. `Node`. */
  sederhana: string
  /** Nama biner JVM untuk toString bawaan, stack trace, dan nama exception: `Main$Node`. */
  biner: string
  deklarasi: DeklarasiKelas
  luar?: InfoKelas
  /** true untuk class top-level dan class bersarang `static`; false untuk inner class. */
  statik: boolean
  /** Supertipe `extends` (hanya turunan Throwable); undefined = Object. */
  induk?: Tipe
  /** Antarmuka `implements` (hanya `Comparable<T>`). */
  antarmuka: Tipe[]
  field: Map<string, SimbolField>
  /** Method yang dideklarasikan di class ini (tanpa konstruktor). */
  method: Map<string, SimbolMethod[]>
  /** Konstruktor yang ditulis. Kosong = konstruktor bawaan tanpa parameter. */
  konstruktor: SimbolMethod[]
  /** Rantai leluhur bila turunan Throwable: [nama kanonik sendiri, ..., 'RuntimeException', 'Exception', 'Throwable']. */
  exception?: string[]
}

export interface SimbolField {
  nama: string
  tipe: Tipe
  statik: boolean
  final: boolean
  konstan?: NilaiKonstan
  deklarasi: Deklarator
  /** Nama kanonik class pemilik (undefined hanya untuk kode lama yang belum diisi). */
  kelas?: string
  akses?: Akses
}

export interface SimbolMethod {
  nama: string
  parameter: Tipe[]
  kembali: Tipe
  statik: boolean
  varargs: boolean
  deklarasi: DeklarasiMethod
  /** Tanda tangan gaya javac, mis. `luas(double,double)`. Untuk konstruktor: `Titik(int,int)`. */
  tandaTangan: string
  /** Nama kanonik class pemilik. */
  kelas?: string
  akses?: Akses
  konstruktor?: boolean
  /** Exception di klausa `throws`. */
  throws?: Tipe[]
}

export type Ikatan =
  | { k: 'lokal'; info: InfoLokal }
  /**
   * Field class mahasiswa. Field static: dibaca dari class pemiliknya. Field instance tanpa penerima eksplisit
   * (`data` berarti `this.data`): `luar` = jumlah lompatan ke objek luar lewat `this$0` (0 = `this` sendiri).
   */
  | { k: 'field'; field: SimbolField; luar?: number }
  /** Nama class sebagai kualifier (`Math`, `Node`, `Main.Node`). */
  | { k: 'kelas'; nama: string }

export type TargetPanggil =
  /**
   * Method mahasiswa. Tanpa `objek` eksplisit pada method instance, penerimanya `this` (atau objek luar sejauh
   * `luar` lompatan `this$0`, untuk inner class yang memanggil method class luarnya).
   */
  | { k: 'user'; method: SimbolMethod; luar?: number }
  | {
      k: 'pustaka'
      /** Id method pustaka dari `pustaka/daftar.ts`, mis. `String.charAt(int)`, `List.get(int)`. */
      id: string
      parameter: Tipe[]
      kembali: Tipe
      statik: boolean
      varargs: boolean
      /**
       * Deskripsi JVM untuk pesan NPE `Cannot invoke "..."`: tipe statis penerima (nama lengkap, kecuali
       * String/Object) + nama + tipe parameter terhapus, mis. `java.util.List.get(int)`, `String.length()`,
       * `java.util.Map.get(Object)`.
       */
      jvm?: string
      /**
       * Method instance pustaka yang dipanggil tanpa penerima eksplisit (mis. `getMessage()` di dalam class
       * exception buatan sendiri): penerimanya `this`, atau objek luar sejauh `luar` lompatan `this$0`.
       */
      luar?: number
    }

// ---------- Ekspresi ----------
interface DasarEkspresi extends Dasar {
  /** Tipe statis hasil type checker. */
  tipe?: Tipe
  /** Nilai bila ekspresi ini konstanta compile-time. */
  konstan?: NilaiKonstan
  /** Jumlah pasangan kurung `( … )` yang membungkus ekspresi ini di kode (untuk cetak ulang gaya javac di pesan). */
  kurung?: number
}

export interface Literal extends DasarEkspresi {
  jenis: 'Literal'
  jenisLiteral: 'int' | 'long' | 'float' | 'double' | 'char' | 'string' | 'boolean' | 'null'
  nilai: NilaiKonstan | null
  perluMinus?: boolean
}

export interface Nama extends DasarEkspresi {
  jenis: 'Nama'
  nama: string
  ikatan?: Ikatan
}

export interface AksesField extends DasarEkspresi {
  jenis: 'AksesField'
  objek: Ekspresi
  nama: string
  spanNama: Span
  /**
   * `field` dengan field instance: baca field objek hasil `objek`. Dengan field static: `objek` hanya kualifier
   * (nama class, atau ekspresi yang tetap dievaluasi lalu diabaikan, seperti javac).
   */
  ikatan?: { k: 'panjang-array' } | { k: 'field-pustaka'; id: string } | { k: 'field'; field: SimbolField } | { k: 'kelas'; nama: string }
}

export interface AksesArray extends DasarEkspresi {
  jenis: 'AksesArray'
  array: Ekspresi
  indeks: Ekspresi
}

export interface PanggilMethod extends DasarEkspresi {
  jenis: 'PanggilMethod'
  objek?: Ekspresi
  nama: string
  spanNama: Span
  argumen: Ekspresi[]
  target?: TargetPanggil
  /** true bila argumen varargs dikemas menjadi array saat pemanggilan. */
  pakaiVarargs?: boolean
}

export interface InisialisasiArray extends DasarEkspresi {
  jenis: 'InisialisasiArray'
  elemen: Ekspresi[]
}

export interface BaruArray extends DasarEkspresi {
  jenis: 'BaruArray'
  elemen: NodeTipe
  dimensi: Ekspresi[]
  dimensiKosong: number
  init?: InisialisasiArray
}

export interface BaruObjek extends DasarEkspresi {
  jenis: 'BaruObjek'
  /** Untuk diamond `new ArrayList<>()`, `tipeNode.argumen` berupa array kosong. */
  tipeNode: NodeTipe
  argumen: Ekspresi[]
  target?: TargetBaru
  pakaiVarargs?: boolean
}

export type TargetBaru =
  | { k: 'pustaka'; id: string; parameter: Tipe[]; kembali: Tipe; statik: boolean; varargs: boolean }
  /**
   * Class mahasiswa. `konstruktor` undefined = konstruktor bawaan. Untuk inner class, objek luarnya adalah
   * `this` (atau objek luar sejauh `luar` lompatan) dari konteks pembuatan.
   */
  | { k: 'user'; kelas: InfoKelas; konstruktor?: SimbolMethod; luar?: number }

/** `this` (atau `Luar.this`). `luar` = jumlah lompatan `this$0` dari objek sekarang (0 = `this`). */
export interface This extends DasarEkspresi {
  jenis: 'This'
  kualifier?: string
  luar?: number
}

export interface ParameterLambda extends Dasar {
  nama: string
  spanNama: Span
  /** Tipe yang ditulis eksplisit, mis. `(String a, String b) -> ...`. */
  tipeNode?: NodeTipe
  info?: InfoLokal
}

/**
 * Lambda (Fase 2: hanya bertarget `Comparator<T>`). Dijalankan sebagai method sintetis `lambda$<method>$<nomor>`.
 * Variabel lokal luar yang dipakai di badan disalin ke slot sendiri saat lambda dibuat (`tangkapan`).
 */
export interface Lambda extends DasarEkspresi {
  jenis: 'Lambda'
  parameter: ParameterLambda[]
  /** true bila parameter ditulis dalam kurung, mis. `(a, b) -> ...` atau `(a) -> ...`. */
  berkurung: boolean
  /** Posisi token `->`. */
  posisiPanah: number
  badan: Ekspresi | Blok
  // Diisi checker:
  /** Nama method sintetis, mis. `lambda$main$0`. */
  namaMethod?: string
  /** Antarmuka fungsional target beserta tipe parameter/kembali hasil substitusi. */
  fungsional?: { antarmuka: string; parameter: Tipe[]; kembali: Tipe }
  /** Pasangan variabel luar → slot di frame lambda (urutan = urutan kemunculan pertama). */
  tangkapan?: { luar: InfoLokal; dalam: InfoLokal }[]
  /** Lambda di dalam method instance memakai `this` (field/method instance class pemilik). */
  pakaiThis?: boolean
  jumlahSlot?: number
}

/** `this(...)` atau `super(...)` sebagai pernyataan pertama konstruktor. */
export interface PanggilKonstruktor extends DasarEkspresi {
  jenis: 'PanggilKonstruktor'
  bentuk: 'this' | 'super'
  argumen: Ekspresi[]
  /**
   * `this(...)`: konstruktor lain di class yang sama. `super(...)`: konstruktor class induk; untuk induk
   * exception bawaan berupa id konstruktor pustaka, mis. `RuntimeException.<init>(String)`.
   */
  target?: { k: 'user'; konstruktor?: SimbolMethod; kelas: InfoKelas } | { k: 'pustaka'; id: string; parameter: Tipe[] }
  pakaiVarargs?: boolean
}

export interface Unary extends DasarEkspresi {
  jenis: 'Unary'
  op: '+' | '-' | '!' | '~'
  operand: Ekspresi
}

export interface IncDec extends DasarEkspresi {
  jenis: 'IncDec'
  op: '++' | '--'
  prefix: boolean
  target: Ekspresi
}

export type OpBiner =
  | '||' | '&&' | '|' | '^' | '&' | '==' | '!=' | '<' | '>' | '<=' | '>='
  | '<<' | '>>' | '>>>' | '+' | '-' | '*' | '/' | '%'

export interface Biner extends DasarEkspresi {
  jenis: 'Biner'
  op: OpBiner
  kiri: Ekspresi
  kanan: Ekspresi
  /** Tipe operand setelah promosi (untuk aritmetika/perbandingan), atau String untuk konkatenasi. */
  tipeOperasi?: Tipe
}

export type OpAssign = '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '>>>='

export interface Assign extends DasarEkspresi {
  jenis: 'Assign'
  op: OpAssign
  target: Ekspresi
  nilai: Ekspresi
  /** Untuk compound assignment: tipe operasi biner sebelum dicasting kembali ke tipe target. */
  tipeOperasi?: Tipe
}

export interface Kondisional extends DasarEkspresi {
  jenis: 'Kondisional'
  kondisi: Ekspresi
  ya: Ekspresi
  tidak: Ekspresi
}

export interface Cast extends DasarEkspresi {
  jenis: 'Cast'
  tipeNode: NodeTipe
  ekspresi: Ekspresi
}

export type Ekspresi =
  | Literal | Nama | AksesField | AksesArray | PanggilMethod | InisialisasiArray | BaruArray | BaruObjek
  | Unary | IncDec | Biner | Assign | Kondisional | Cast | This | Lambda | PanggilKonstruktor

// ---------- Pernyataan ----------
export interface Deklarator extends Dasar {
  nama: string
  spanNama: Span
  dimensiTambahan: number
  init?: Ekspresi
  /** Diisi checker. */
  info?: InfoLokal
  tipe?: Tipe
}

export interface Blok extends Dasar {
  jenis: 'Blok'
  pernyataan: Pernyataan[]
  /** Slot variabel lokal yang dideklarasikan langsung di blok ini (untuk keluar scope). */
  slotLokal?: number[]
}

export interface DeklarasiLokal extends Dasar {
  jenis: 'DeklarasiLokal'
  final: boolean
  tipeNode: NodeTipe
  deklarator: Deklarator[]
}

export interface PernyataanEkspresi extends Dasar {
  jenis: 'PernyataanEkspresi'
  ekspresi: Ekspresi
}

export interface If extends Dasar {
  jenis: 'If'
  kondisi: Ekspresi
  maka: Pernyataan
  lain?: Pernyataan
}

export interface While extends Dasar {
  jenis: 'While'
  kondisi: Ekspresi
  badan: Pernyataan
}

export interface DoWhile extends Dasar {
  jenis: 'DoWhile'
  badan: Pernyataan
  kondisi: Ekspresi
  spanKondisi: Span
}

export interface For extends Dasar {
  jenis: 'For'
  init: (DeklarasiLokal | PernyataanEkspresi)[]
  kondisi?: Ekspresi
  update: Ekspresi[]
  badan: Pernyataan
  slotLokal?: number[]
}

export interface ForEach extends Dasar {
  jenis: 'ForEach'
  final: boolean
  tipeNode: NodeTipe
  nama: string
  spanNama: Span
  iterable: Ekspresi
  badan: Pernyataan
  info?: InfoLokal
  /**
   * Diisi checker: tipe elemen yang dihasilkan iterasi (elemen array, atau `T` dari `Iterable<T>` setelah
   * substitusi). Iterasi koleksi memakai `iterator()`/`hasNext()`/`next()` seperti javac.
   */
  tipeElemen?: Tipe
}

export interface GrupCase extends Dasar {
  /** Label case; 'default' untuk default. */
  label: (Ekspresi | 'default')[]
  /** Posisi kata kunci `case`/`default` untuk tiap label (sejajar dengan `label`). */
  posisiLabel: number[]
  pernyataan: Pernyataan[]
}

export interface Switch extends Dasar {
  jenis: 'Switch'
  selektor: Ekspresi
  /** Rentang `( … )` di sekitar selektor (posisi error tipe selektor, seperti javac). */
  spanSelektor: Span
  grup: GrupCase[]
  panah: boolean
  slotLokal?: number[]
}

export interface Break extends Dasar {
  jenis: 'Break'
}

export interface Continue extends Dasar {
  jenis: 'Continue'
}

export interface Return extends Dasar {
  jenis: 'Return'
  ekspresi?: Ekspresi
}

export interface Kosong extends Dasar {
  jenis: 'Kosong'
}

export interface Tangkap extends Dasar {
  /** Lebih dari satu untuk multi-catch `catch (A | B e)`. */
  tipe: NodeTipe[]
  final: boolean
  nama: string
  spanNama: Span
  badan: Blok
  // Diisi checker:
  info?: InfoLokal
  /** Tipe yang ditangkap (sejajar dengan `tipe`). */
  tipeTangkap?: Tipe[]
}

export interface Try extends Dasar {
  jenis: 'Try'
  blok: Blok
  tangkap: Tangkap[]
  akhirnya?: Blok
}

export interface Throw extends Dasar {
  jenis: 'Throw'
  ekspresi: Ekspresi
}

export type Pernyataan =
  | Blok | DeklarasiLokal | PernyataanEkspresi | If | While | DoWhile | For | ForEach | Switch
  | Break | Continue | Return | Kosong | Try | Throw

// ---------- Deklarasi tingkat class ----------
export interface Parameter extends Dasar {
  final: boolean
  tipeNode: NodeTipe
  nama: string
  spanNama: Span
  varargs: boolean
  info?: InfoLokal
}

export interface Anotasi {
  nama: string
  span: Span
}

export interface DeklarasiMethod extends Dasar {
  jenis: 'DeklarasiMethod'
  modifier: string[]
  /** Anotasi yang ditulis, mis. `@Override`. */
  anotasi: Anotasi[]
  /** null = void (atau konstruktor). */
  tipeKembali: NodeTipe | null
  /** true untuk konstruktor; `nama` = nama sederhana class. */
  konstruktor: boolean
  nama: string
  spanNama: Span
  parameter: Parameter[]
  throws: NodeTipe[]
  badan: Blok
  /** Posisi kurawal penutup method (untuk 'missing return statement'). */
  spanTutup: Span
  simbol?: SimbolMethod
  /** Jumlah slot lokal yang dibutuhkan (diisi checker). */
  jumlahSlot?: number
}

export interface DeklarasiField extends Dasar {
  jenis: 'DeklarasiField'
  modifier: string[]
  tipeNode: NodeTipe
  deklarator: Deklarator[]
}

export interface DeklarasiKelas extends Dasar {
  jenis: 'DeklarasiKelas'
  nama: string
  spanNama: Span
  /** Posisi kata kunci `class` (javac menunjuk ke sini untuk error nama file). */
  posisiKataKelas: number
  modifier: string[]
  /** `extends` (Fase 2: hanya untuk exception buatan sendiri). */
  induk?: NodeTipe
  /** `implements` (Fase 2: hanya `Comparable<T>`). */
  antarmuka: NodeTipe[]
  field: DeklarasiField[]
  /** Method biasa (tanpa konstruktor). */
  method: DeklarasiMethod[]
  konstruktor: DeklarasiMethod[]
  /** Class bersarang (member class), static maupun inner. */
  kelas: DeklarasiKelas[]
  /** Urutan anggota sesuai kode (untuk inisialisasi field berurutan). */
  anggota: (DeklarasiField | DeklarasiMethod | DeklarasiKelas)[]
  /** Diisi checker. */
  info?: InfoKelas
}

export interface Impor extends Dasar {
  nama: string
  wildcard: boolean
  statik: boolean
}

export interface UnitKompilasi {
  impor: Impor[]
  kelas: DeklarasiKelas[]
}
