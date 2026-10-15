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
  | (Dasar & { jenis: 'TipeNama'; nama: string; argumen?: NodeTipe[] })
  | (Dasar & { jenis: 'TipeArray'; elemen: NodeTipe })

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

export interface SimbolField {
  nama: string
  tipe: Tipe
  statik: boolean
  final: boolean
  konstan?: NilaiKonstan
  deklarasi: Deklarator
}

export interface SimbolMethod {
  nama: string
  parameter: Tipe[]
  kembali: Tipe
  statik: boolean
  varargs: boolean
  deklarasi: DeklarasiMethod
  /** Tanda tangan gaya javac, mis. `luas(double,double)`. */
  tandaTangan: string
}

export type Ikatan =
  | { k: 'lokal'; info: InfoLokal }
  | { k: 'field'; field: SimbolField }
  | { k: 'kelas'; nama: string }

export type TargetPanggil =
  | { k: 'user'; method: SimbolMethod }
  | { k: 'pustaka'; id: string; parameter: Tipe[]; kembali: Tipe; statik: boolean; varargs: boolean }

// ---------- Ekspresi ----------
interface DasarEkspresi extends Dasar {
  /** Tipe statis hasil type checker. */
  tipe?: Tipe
  /** Nilai bila ekspresi ini konstanta compile-time. */
  konstan?: NilaiKonstan
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
  tipeNode: NodeTipe
  argumen: Ekspresi[]
  target?: TargetPanggil
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
  | Unary | IncDec | Biner | Assign | Kondisional | Cast

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
}

export interface GrupCase extends Dasar {
  /** Label case; 'default' untuk default. */
  label: (Ekspresi | 'default')[]
  pernyataan: Pernyataan[]
}

export interface Switch extends Dasar {
  jenis: 'Switch'
  selektor: Ekspresi
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

export type Pernyataan =
  | Blok | DeklarasiLokal | PernyataanEkspresi | If | While | DoWhile | For | ForEach | Switch
  | Break | Continue | Return | Kosong

// ---------- Deklarasi tingkat class ----------
export interface Parameter extends Dasar {
  final: boolean
  tipeNode: NodeTipe
  nama: string
  spanNama: Span
  varargs: boolean
  info?: InfoLokal
}

export interface DeklarasiMethod extends Dasar {
  jenis: 'DeklarasiMethod'
  modifier: string[]
  tipeKembali: NodeTipe | null
  nama: string
  spanNama: Span
  parameter: Parameter[]
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
  nama: string
  spanNama: Span
  modifier: string[]
  field: DeklarasiField[]
  method: DeklarasiMethod[]
  /** Urutan anggota sesuai kode (untuk inisialisasi field statik berurutan). */
  anggota: (DeklarasiField | DeklarasiMethod)[]
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
