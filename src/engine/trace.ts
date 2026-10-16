import { charTampil, doubleKeString, escapeTampil, floatKeString } from './format'
import type { Nilai } from './nilai'

// ---------- State mesin (yang divisualisasikan) ----------
export interface VarState {
  slot: number
  nama: string
  /** Tipe gaya Java, mis. `int`, `double[]`, `String`. */
  tipe: string
  /** undefined = belum diisi (variabel lokal tanpa nilai awal). */
  nilai?: Nilai
  param?: boolean
}

export interface FrameState {
  id: number
  method: string
  /** Baris yang sedang/terakhir dijalankan di frame ini. */
  baris: number
  vars: VarState[]
}

export type ObjekHeap =
  | { k: 'array'; tipeElemen: string; nilai: Nilai[] }
  | { k: 'string'; nilai: string }
  | { k: 'scanner'; posisi: number }
  /**
   * Objek berfield: class mahasiswa, exception, dan objek internal pustaka (koleksi java.util, Random).
   * `kelas` = nama biner JVM: `Main$Node`, `Node`, `java.util.ArrayList`, `java.util.HashMap$Node`,
   * `java.lang.IllegalStateException`. Urutan kunci `field` = urutan deklarasi field.
   */
  | { k: 'objek'; kelas: string; field: Record<string, Nilai>; tipeField: Record<string, string>; jejak?: string[] }
  /** Wrapper hasil boxing (imutabel), mis. `{kelas: 'Integer', nilai: 128}`. */
  | { k: 'boks'; kelas: string; nilai: Nilai }
  /** StringBuilder: isi karakternya saat ini. */
  | { k: 'pembangun'; nilai: string }
  /** Lambda (Comparator): nama method sintetis, teks sumber, dan nilai tangkapan. */
  | { k: 'lambda'; nama: string; teks: string; tangkapan: VarState[] }

export interface StateMesin {
  frames: FrameState[]
  statik: VarState[]
  heap: Record<number, ObjekHeap>
}

// ---------- Pohon evaluasi kondisi ----------
export type PohonEval =
  | { k: 'daun'; teks: string; nilai?: string; literal?: boolean }
  | { k: 'biner'; op: string; kiri: PohonEval; kanan: PohonEval; nilai?: string }
  | { k: 'unary'; op: string; operand: PohonEval; nilai?: string }

// ---------- Peristiwa ----------
export type Peristiwa =
  | { k: 'deklarasi'; frame: number; slot: number; nama: string; tipe: string; nilai?: Nilai; param?: boolean }
  | { k: 'tulis'; frame: number; slot: number; nama: string; tipe: string; lama?: Nilai; baru: Nilai; op?: string; operand?: string }
  | { k: 'hapus-var'; frame: number; slot: number; nama: string }
  | { k: 'deklarasi-statik'; nama: string; tipe: string; nilai: Nilai }
  | { k: 'tulis-statik'; nama: string; tipe: string; lama?: Nilai; baru: Nilai; op?: string; operand?: string }
  | { k: 'alokasi'; id: number; objek: ObjekHeap }
  | { k: 'tulis-elemen'; id: number; indeks: number; tipe: string; lama: Nilai; baru: Nilai; op?: string; operand?: string }
  | { k: 'panggil'; frame: FrameState; method: string; argumen: string[]; barisPemanggil: number; jenis?: 'konstruktor' | 'lambda' }
  | { k: 'buang-frame'; frame: number }
  | { k: 'scanner'; id: number; posisiLama: number; posisi: number; token: string; metode: string }
  | { k: 'baris-frame'; frame: number; baris: number }
  /** Tulis field objek (class mahasiswa maupun objek internal pustaka). */
  | { k: 'tulis-field'; id: number; field: string; tipe: string; lama: Nilai; baru: Nilai; op?: string; operand?: string }
  /** Isi StringBuilder berubah. */
  | { k: 'tulis-pembangun'; id: number; lama: string; baru: string; metode: string }
  /** Tulis beberapa elemen array sekaligus mulai indeks `mulai` (mis. System.arraycopy di dalam koleksi). */
  | { k: 'salin-elemen'; id: number; mulai: number; nilai: Nilai[] }
  // Peristiwa informatif (tidak mengubah state)
  | { k: 'baca-field'; id: number; field: string }
  /** Exception dilempar (oleh `throw`, mesin, atau pustaka). `id` = objek exception bila sudah ada di heap. */
  | { k: 'lempar'; kelas: string; pesan: string | null; id?: number }
  /** Frame dibuang karena exception merambat keluar darinya. */
  | { k: 'rambat'; frame: number; method: string; kelas: string }
  /** Exception ditangkap blok catch. */
  | { k: 'tangkap'; kelas: string; tipe: string; variabel: string; id: number }
  /** Masuk blok finally, beserta sebabnya. */
  | { k: 'finally'; sebab: 'normal' | 'exception' | 'return' | 'break' | 'continue' }
  /** Boxing (primitif → wrapper) atau unboxing. `cache` true bila objek diambil dari cache JDK (Integer −128..127). */
  | { k: 'boxing'; arah: 'box' | 'unbox'; kelas: string; nilai: string; id: number; cache?: boolean }
  /** Pemanggilan method pustaka pada objek (koleksi, StringBuilder, wrapper) untuk narasi. */
  | { k: 'pustaka'; id: number; kelas: string; metode: string; hasil?: string }
  // Peristiwa informatif (tidak mengubah state)
  | { k: 'kembali'; frame: number; method: string; nilai?: string; tipe?: string; jenis?: 'konstruktor' | 'lambda' }
  | { k: 'baca'; frame: number; slot: number; nama: string }
  | { k: 'baca-statik'; nama: string }
  | { k: 'baca-elemen'; id: number; indeks: number }
  | { k: 'evaluasi'; konteks: 'if' | 'while' | 'for' | 'do-while' | 'switch' | 'ternary'; teks: string; pohon: PohonEval; hasil: string; adaLain?: boolean; pertama?: boolean }
  | { k: 'cetak'; teks: string; err?: boolean }
  | { k: 'aritmetika'; jenis: 'bagi-bulat' | 'sisa' | 'overflow' | 'bagi-nol-pecahan'; teks: string; hasil: string; tepat?: string; tipe: string }
  | { k: 'cast'; dari: string; ke: string; sebelum: string; sesudah: string }
  | { k: 'konkatenasi'; kiri: string; kanan: string; hasil: string }
  | { k: 'lompat'; jenis: 'break' | 'continue' }
  | { k: 'cocok-case'; label: string }
  | { k: 'exception'; kelas: string; pesan: string | null }

export type JenisLangkah = 'mulai' | 'pernyataan' | 'kondisi' | 'panggil' | 'kembali' | 'selesai' | 'exception' | 'batas'

export interface Langkah {
  baris: number
  jenis: JenisLangkah
  /** Rentang kode sumber yang dijalankan pada langkah ini. */
  span?: { awal: number; akhir: number }
  peristiwa: Peristiwa[]
  /** Panjang output (stdout + stderr) setelah langkah ini. */
  panjangOutput: number
  kedalaman: number
}

export type StatusTrace = 'selesai' | 'exception' | 'batas-langkah' | 'batas-memori' | 'batas-output' | 'keluar'

export interface NilaiAkhir {
  tipe: string
  /** Nilai ramah-JSON: number/string/boolean/null, atau array bersarang. */
  nilai: unknown
}

export interface Trace {
  langkah: Langkah[]
  checkpoint: { indeks: number; state: StateMesin }[]
  output: string
  /** Rentang [awal, akhir) di output yang berasal dari stderr. */
  rentangErr: [number, number][]
  status: StatusTrace
  exception?: { kelas: string; pesan: string | null; baris: number; jejak: string[] }
  pesanSimulator?: string
  hitunganBaris: Record<number, number>
  barisTerpanas?: number
  /** Nilai akhir variabel di method main (untuk pemeriksa tantangan). */
  akhirMain: Record<string, NilaiAkhir>
  /** Nilai akhir field static. */
  akhirStatik?: Record<string, NilaiAkhir>
  kodeKeluar?: number
  /** Jumlah langkah yang dijalankan (juga terisi pada mode hitung, saat `langkah` kosong). */
  jumlahLangkah?: number
  /** Langkah selama method `opsi.ukurMethod` berjalan. */
  langkahUkur?: number
  /** Nama variabel yang nilai awalnya diganti lewat opsi `ganti`. */
  gantiDipakai?: string[]
}

// ---------- Reducer ----------
function cariFrame(state: StateMesin, id: number): FrameState | undefined {
  for (let i = state.frames.length - 1; i >= 0; i--) if (state.frames[i].id === id) return state.frames[i]
  return undefined
}

function salinObjek(o: ObjekHeap): ObjekHeap {
  if (o.k === 'array') return { k: 'array', tipeElemen: o.tipeElemen, nilai: o.nilai.slice() }
  if (o.k === 'scanner') return { k: 'scanner', posisi: o.posisi }
  // tipeField & jejak tidak pernah diubah setelah objek dibuat, jadi boleh dibagi pakai.
  if (o.k === 'objek') return { k: 'objek', kelas: o.kelas, field: { ...o.field }, tipeField: o.tipeField, jejak: o.jejak }
  if (o.k === 'pembangun') return { k: 'pembangun', nilai: o.nilai }
  // string, boks, lambda: imutabel.
  return o
}

/** Terapkan satu peristiwa ke state (mutasi di tempat). Dipakai saat eksekusi dan saat replay. */
export function terapkan(state: StateMesin, p: Peristiwa): void {
  switch (p.k) {
    case 'deklarasi': {
      const f = cariFrame(state, p.frame)
      if (!f) return
      const lama = f.vars.findIndex((v) => v.slot === p.slot)
      const v: VarState = { slot: p.slot, nama: p.nama, tipe: p.tipe, nilai: p.nilai, param: p.param }
      if (lama >= 0) f.vars[lama] = v
      else f.vars.push(v)
      return
    }
    case 'tulis': {
      const v = cariFrame(state, p.frame)?.vars.find((x) => x.slot === p.slot)
      if (v) v.nilai = p.baru
      return
    }
    case 'hapus-var': {
      const f = cariFrame(state, p.frame)
      if (f) f.vars = f.vars.filter((x) => x.slot !== p.slot)
      return
    }
    case 'deklarasi-statik': {
      const lama = state.statik.findIndex((v) => v.nama === p.nama)
      const v: VarState = { slot: lama >= 0 ? lama : state.statik.length, nama: p.nama, tipe: p.tipe, nilai: p.nilai }
      if (lama >= 0) state.statik[lama] = v
      else state.statik.push(v)
      return
    }
    case 'tulis-statik': {
      const v = state.statik.find((x) => x.nama === p.nama)
      if (v) v.nilai = p.baru
      return
    }
    case 'alokasi':
      state.heap[p.id] = salinObjek(p.objek)
      return
    case 'tulis-elemen': {
      const o = state.heap[p.id]
      if (o && o.k === 'array') o.nilai[p.indeks] = p.baru
      return
    }
    case 'panggil': {
      const pemanggil = state.frames[state.frames.length - 1]
      if (pemanggil) pemanggil.baris = p.barisPemanggil
      state.frames.push({ id: p.frame.id, method: p.frame.method, baris: p.frame.baris, vars: p.frame.vars.map((v) => ({ ...v })) })
      return
    }
    case 'buang-frame': {
      const i = state.frames.findIndex((f) => f.id === p.frame)
      if (i >= 0) state.frames.splice(i, 1)
      return
    }
    case 'scanner': {
      const o = state.heap[p.id]
      if (o && o.k === 'scanner') o.posisi = p.posisi
      return
    }
    case 'baris-frame': {
      const f = cariFrame(state, p.frame)
      if (f) f.baris = p.baris
      return
    }
    case 'tulis-field': {
      const o = state.heap[p.id]
      if (o && o.k === 'objek') o.field[p.field] = p.baru
      return
    }
    case 'tulis-pembangun': {
      const o = state.heap[p.id]
      if (o && o.k === 'pembangun') o.nilai = p.baru
      return
    }
    case 'salin-elemen': {
      const o = state.heap[p.id]
      if (o && o.k === 'array') for (let i = 0; i < p.nilai.length; i++) o.nilai[p.mulai + i] = p.nilai[i]
      return
    }
    default:
      return
  }
}

export function stateKosong(): StateMesin {
  return { frames: [], statik: [], heap: {} }
}

/** Salin state; objek String dibagi pakai karena tidak pernah diubah. */
export function klonState(s: StateMesin): StateMesin {
  const heap: Record<number, ObjekHeap> = {}
  for (const k in s.heap) heap[k] = salinObjek(s.heap[k])
  return {
    frames: s.frames.map((f) => ({ id: f.id, method: f.method, baris: f.baris, vars: f.vars.map((v) => ({ ...v })) })),
    statik: s.statik.map((v) => ({ ...v })),
    heap,
  }
}

/** Membaca state pada langkah mana pun dari trace (maju atau mundur). */
export class PembacaTrace {
  private cache: { i: number; state: StateMesin } | null = null

  constructor(readonly trace: Trace) {}

  get jumlah(): number {
    return this.trace.langkah.length
  }

  /** State setelah langkah ke-i diterapkan. Hasilnya jangan diubah. */
  stateDi(i: number): StateMesin {
    const n = this.trace.langkah.length
    if (n === 0) return stateKosong()
    i = Math.max(0, Math.min(i, n - 1))
    if (this.cache && this.cache.i === i) return this.cache.state
    let cp = this.trace.checkpoint[0]
    for (const c of this.trace.checkpoint) {
      if (c.indeks <= i) cp = c
      else break
    }
    let mulai: { i: number; state: StateMesin } = { i: cp.indeks, state: cp.state }
    if (this.cache && this.cache.i < i && this.cache.i >= cp.indeks) mulai = this.cache
    const state = klonState(mulai.state)
    for (let j = mulai.i + 1; j <= i; j++) for (const p of this.trace.langkah[j].peristiwa) terapkan(state, p)
    this.cache = { i, state }
    return state
  }

  outputDi(i: number): string {
    const l = this.trace.langkah[Math.max(0, Math.min(i, this.trace.langkah.length - 1))]
    return l ? this.trace.output.slice(0, l.panjangOutput) : ''
  }
}

// ---------- Tampilan nilai untuk visualisasi & narasi ----------
const BATAS_TAMPIL_ARRAY = 12

/** Teks nilai untuk ditampilkan, mis. `7`, `3.5`, `'A'`, `"halo"`, `[1, 2, 3]`, `null`. */
export function tampilNilai(v: Nilai | undefined, tipe: string, heap: Record<number, ObjekHeap>, kedalaman = 0): string {
  if (v === undefined) return '?'
  if (v === null) return 'null'
  switch (tipe) {
    case 'char':
      return charTampil(v as number)
    case 'double':
      return doubleKeString(v as number)
    case 'float':
      return floatKeString(v as number)
    case 'long':
      return (v as bigint).toString()
    case 'boolean':
      return v ? 'true' : 'false'
    case 'int':
    case 'short':
    case 'byte':
      return String(v)
  }
  const o = heap[v as number]
  if (!o) return tipe === 'String' ? '"…"' : '…'
  if (o.k === 'string') return `"${escapeTampil(o.nilai)}"`
  if (o.k === 'scanner') return 'Scanner'
  if (o.k === 'boks') return tampilNilai(o.nilai, PRIMITIF_BOKS[o.kelas] ?? 'int', heap, kedalaman)
  if (o.k === 'pembangun') return `"${escapeTampil(o.nilai)}"`
  if (o.k === 'lambda') return 'lambda'
  if (o.k === 'objek') return `${namaKelasTampil(o.kelas)}#${v as number}`
  if (kedalaman > 1) return `${o.tipeElemen}[${o.nilai.length}]`
  const isi = o.nilai.slice(0, BATAS_TAMPIL_ARRAY).map((x) => tampilNilai(x, o.tipeElemen, heap, kedalaman + 1))
  if (o.nilai.length > BATAS_TAMPIL_ARRAY) isi.push('…')
  return `[${isi.join(', ')}]`
}

const PRIMITIF_BOKS: Record<string, string> = {
  Integer: 'int', Long: 'long', Double: 'double', Float: 'float', Short: 'short', Byte: 'byte', Character: 'char', Boolean: 'boolean',
}

/** Nama kelas untuk tampilan dari nama biner: `Main$Node` → `Node`, `java.util.ArrayList` → `ArrayList`, `java.util.HashMap$Node` → `HashMap.Node`. */
export function namaKelasTampil(biner: string): string {
  const tanpaPaket = biner.startsWith('java.') ? biner.slice(biner.lastIndexOf('.') + 1) : biner
  if (!biner.startsWith('java.')) {
    const i = tanpaPaket.lastIndexOf('$')
    return i < 0 ? tanpaPaket : tanpaPaket.slice(i + 1)
  }
  return tanpaPaket.replace(/\$/g, '.')
}
