/**
 * Interpreter Java Mini Fase 2: perluasan interpreter Fase 1 dengan class & objek, konstruktor, `this`,
 * inisialisasi class malas, exception (try/catch/finally/throw + stack trace JVM), wrapper & autoboxing
 * (cache JDK), StringBuilder, koleksi java.util (model JDK 21), lambda Comparator, dan pesan helpful NPE.
 * Setiap perubahan state tetap menjadi peristiwa trace sehingga bisa diputar ulang langkah demi langkah.
 */
import type * as A from '../ast'
import type { ProgramTerperiksa } from '../checker'
import { konversiKonstan } from '../checker'
import { primitifKeString } from '../format'
import { adalahExceptionBawaan, namaLengkapPustaka, namaSederhana, rantaiException, subtipePustaka } from '../hierarki'
import {
  aritmetika, bandingkan, bitNot, geser, konversiPrimitif, LemparanJava, negasi, nilaiDefault, operasiBit,
  tambahSatu, type Nilai, type OpAritmetika, type OpBanding, type OpBit, type OpGeser,
} from '../nilai'
import {
  adalahObjekPustakaKoleksi, hashWrapper, konstruktorFase2, panggilBoks, panggilKoleksi,
  panggilPembangun, panggilRandom, panggilStatikFase2, samaWrapper, TIDAK_ADA, type KonteksFase2,
} from '../pustaka/fase2'
import { hashString } from '../pustaka/hash'
import { implementasi, type KonteksPustaka } from '../pustaka/implementasi'
import { adalahEntri, adalahMap, cariModel, EntriModel, modelDari, modelMapDari, type OperasiElemen } from '../pustaka/koleksi'
import { PemindaiInput } from '../pustaka/scanner'
import type { Span, Sumber } from '../sumber'
import {
  adalahIntegral, adalahString, PEMBUNGKUS, promosiUnary, samaTipe, T, teksTipe, tipeUnboks, type NamaPrimitif, type Tipe,
} from '../tipe'
import {
  klonState, stateKosong, tampilNilai, terapkan, type JenisLangkah, type Langkah, type NilaiAkhir,
  type ObjekHeap, type Peristiwa, type PohonEval, type StateMesin, type StatusTrace, type Trace, type VarState,
} from '../trace'
import { bacaKoleksi } from '../bacaKoleksi'
import { HeapMesin } from './adaptorKoleksi'
import { PenyimpanBoks } from './boks'
import { aksiUnboxing, asalNull, deskripsiMethodUser, jenisArrayNpe, namaTipeJvm, pesanNpe } from './npe'
import { barisJejak, pesanClassCast, teksThrowable } from './pengecualian'

export interface OpsiJalan {
  stdin?: string
  batasLangkah?: number
  batasKedalaman?: number
  seed?: number
  batasOutput?: number
  batasElemen?: number
  batasObjek?: number
  /**
   * Ganti nilai awal variabel lokal di `main` (deklarasi pertama dengan nama itu); initializer aslinya tidak dievaluasi.
   * Dipakai grafik pertumbuhan untuk menjalankan program dengan beberapa ukuran n.
   */
  ganti?: Record<string, number | boolean | string>
  /** Jalankan tanpa merekam langkah, checkpoint, maupun output (hanya hitungan). */
  modeHitung?: boolean
  /** Hitung juga langkah yang terjadi selama method ini sedang berjalan (termasuk panggilan di dalamnya). */
  ukurMethod?: string
}

export const OPSI_BAWAAN: Required<OpsiJalan> = {
  stdin: '',
  batasLangkah: 20_000,
  // Rekursi Java dijalankan dengan rekursi JavaScript; stack worker browser jauh lebih kecil dari JVM.
  // 200 level cukup untuk contoh pengajaran dan sama di semua lingkungan (lihat juga `stackMasihCukup`).
  batasKedalaman: 200,
  seed: 20260101,
  batasOutput: 10_000,
  batasElemen: 10_000,
  batasObjek: 50_000,
  ganti: {},
  modeHitung: false,
  ukurMethod: '',
}

/** Nilai pengganti (opsi `ganti`) tidak cocok dengan tipe variabelnya. */
export class GalatGanti extends Error {}

const REF_OUT = -1
const REF_ERR = -2
const REF_IN = -3
const JARAK_CHECKPOINT = 100
/** Mulai kedalaman ini, sisa stack JavaScript diperiksa sebelum memanggil method. */
const KEDALAMAN_MULAI_PROBE = 48
/** Cadangan stack (dalam frame JavaScript kecil) yang wajib tersisa sebelum masuk satu method lagi. */
const CADANGAN_STACK = 1_000
/** Stack trace exception tak tertangkap selain StackOverflowError dicetak utuh sampai batas ini. */
const BATAS_JEJAK = 100

function probe(n: number): number {
  // Sengaja bukan tail call (JavaScriptCore/Safari mengoptimasi tail call sehingga stack tidak bertambah).
  return n <= 0 ? 0 : probe(n - 1) + 1
}

/** true bila stack JavaScript masih punya ruang untuk `cadangan` frame lagi. */
function stackMasihCukup(cadangan: number): boolean {
  try {
    return probe(cadangan) === cadangan
  } catch {
    return false
  }
}

class BatasTercapai extends Error {
  constructor(
    readonly jenis: 'langkah' | 'memori' | 'output',
    pesan: string,
  ) {
    super(pesan)
  }
}

class KeluarProgram extends Error {
  constructor(readonly kode: number) {
    super('System.exit')
  }
}

type Selesai = undefined | { k: 'break' } | { k: 'continue' } | { k: 'return'; nilai: Nilai | undefined }

interface FrameRuntime {
  id: number
  simbol: A.SimbolMethod
  lokal: (Nilai | undefined)[]
  terdeklarasi: Set<number>
  tipeLokal: Map<number, Tipe>
  barisAktif: number
  barisReturn?: number
  spanReturn?: Span
  /** Objek `this` untuk method instance, konstruktor, dan lambda yang memakai `this`. */
  ini: number | null
  /** Class pemilik method. */
  kelas: A.InfoKelas | undefined
  /** Nama di stack trace, mis. `Main.main`, `Main$Pecahan.<init>`, `Main.lambda$main$0`. */
  namaJejak: string
  /** Tipe kembali (lambda: tipe kembali antarmuka fungsional). */
  kembali: Tipe
}

interface LValue {
  tipe: Tipe
  /** Pemeriksaan null/batas array. */
  cek(): void
  baca(): Nilai
  tulis(v: Nilai, op?: string, operand?: string): void
}

/** Lambda yang sudah dibuat: node AST, nilai tangkapan, dan `this` pembuatnya (data di luar heap trace). */
interface InfoLambda {
  node: A.Lambda
  tangkapan: Nilai[]
  ini: number | null
  kelas: A.InfoKelas | undefined
}

/** Blok try yang sedang aktif (untuk memutuskan apakah exception akan ditangani di frame luar). */
interface TryAktif {
  frame: number
  tangkap: A.Tangkap[]
  adaFinally: boolean
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const KODE_ARRAY: Record<string, string> = { int: 'I', long: 'J', double: 'D', float: 'F', char: 'C', boolean: 'Z', byte: 'B', short: 'S' }

function kodeTipeArray(tipeElemen: string): string {
  if (tipeElemen.endsWith('[]')) return '[' + kodeTipeArray(tipeElemen.slice(0, -2))
  return KODE_ARRAY[tipeElemen] ?? `Ljava.lang.${tipeElemen === 'Scanner' ? 'Object' : tipeElemen};`
}

/** Hash identitas deterministik (JVM asli memakai nilai acak; korpus menghindarinya). */
const hashIdentitas = (id: number) => (Math.imul(id + 7, 0x9e3779b1) >>> 0) % 0x7fffffff

const PRIMITIF_WRAPPER: Record<string, NamaPrimitif> = {
  Integer: 'int', Long: 'long', Double: 'double', Float: 'float', Short: 'short', Byte: 'byte', Character: 'char', Boolean: 'boolean',
}

const adalahReferensiRuntime = (t: Tipe) => t.k === 'kelas' || t.k === 'array' || t.k === 'null' || t.k === 'variabel' || t.k === 'wildcard'

/** Objek Comparator milik JDK (nama kelas persis JDK 21): urutan alami, urutan terbalik, dan hasil reversed/thenComparing. */
const PEMBANDING_ALAMI = 'java.util.Comparators$NaturalOrderComparator'
const PEMBANDING_TERBALIK = 'java.util.Collections$ReverseComparator'
const PEMBANDING_TERBALIK2 = 'java.util.Collections$ReverseComparator2'
const PEMBANDING_LANJUT = 'java.util.Comparator$$Lambda'
const KELAS_PEMBANDING = new Set([PEMBANDING_ALAMI, PEMBANDING_TERBALIK, PEMBANDING_TERBALIK2, PEMBANDING_LANJUT])

/** `Kelas.nama` dan daftar tipe parameter dari id pustaka `Kelas.nama(a,b)`. */
function uraiId(id: string): { kelas: string; nama: string } {
  const kurung = id.indexOf('(')
  const kepala = kurung < 0 ? id : id.slice(0, kurung)
  const titik = kepala.lastIndexOf('.')
  return { kelas: kepala.slice(0, titik), nama: kepala.slice(titik + 1) }
}

/** Program hasil checker Fase 2 (semuaKelas/infoMain diisi front-end Fase 2). */
type ProgramFase2 = ProgramTerperiksa & { semuaKelas?: Map<string, A.InfoKelas>; infoMain?: A.InfoKelas }

export function jalankanProgram(program: ProgramTerperiksa, sumber: Sumber, opsi: OpsiJalan = {}): Trace {
  // Abaikan kunci bernilai undefined agar tidak menimpa nilai bawaan (mis. `{ batasLangkah: undefined }`).
  const terisi = Object.fromEntries(Object.entries(opsi).filter(([, v]) => v !== undefined)) as OpsiJalan
  return new Mesin(program, sumber, { ...OPSI_BAWAAN, ...terisi }).jalankan()
}

class Mesin {
  private readonly state: StateMesin = stateKosong()
  private readonly langkah: Langkah[] = []
  private readonly checkpoint: { indeks: number; state: StateMesin }[] = []
  private pending: Peristiwa[] = []
  private output = ''
  private readonly rentangErr: [number, number][] = []
  private readonly hitung: Record<number, number> = {}
  private readonly frames: FrameRuntime[] = []
  private idFrame = 1
  private idObjek = 1
  private jumlahObjek = 0
  private readonly intern = new Map<string, number>()
  /** Field static: kunci `nama` (class Main) atau `Kanonik.nama` (class lain). */
  private readonly statik = new Map<string, { nilai: Nilai; tipe: Tipe; nama: string }>()
  private readonly pemindai: PemindaiInput
  private readonly acak: () => number
  private selesai = false
  /** true bila StackOverflowError dipicu oleh habisnya stack JavaScript, bukan oleh `batasKedalaman`. */
  private stackBrowserHabis = false
  private readonly ctx: KonteksPustaka
  private readonly ctx2: KonteksFase2
  private readonly heapKoleksi: HeapMesin
  private readonly boksan: PenyimpanBoks
  private readonly ops: OperasiElemen
  private jumlahLangkah = 0
  /** Langkah selama `opsi.ukurMethod` sedang berjalan. */
  private langkahUkur = 0
  private dalamUkur = 0
  private readonly gantiDipakai = new Set<string>()
  /** Class yang sudah diinisialisasi (nama kanonik). */
  private readonly terinit = new Set<string>()
  private readonly lambda = new Map<number, InfoLambda>()
  /** Objek tunggal JDK per run (Comparator.naturalOrder(), Collections.reverseOrder()). */
  private readonly tunggal = new Map<string, number>()
  private readonly tryAktif: TryAktif[] = []
  private readonly kelasDariBiner = new Map<string, A.InfoKelas>()
  private readonly mainKanonik: string
  private readonly biner = (kanonik: string) => this.program.semuaKelas?.get(kanonik)?.biner

  constructor(
    private readonly program: ProgramFase2,
    private readonly sumber: Sumber,
    private readonly opsi: Required<OpsiJalan>,
  ) {
    this.pemindai = new PemindaiInput(opsi.stdin)
    this.acak = mulberry32(opsi.seed)
    this.mainKanonik = program.infoMain?.nama ?? program.kelas.nama
    for (const info of program.semuaKelas?.values() ?? []) this.kelasDariBiner.set(info.biner, info)
    this.ctx = {
      heap: this.state.heap,
      teks: (ref) => this.teks(ref),
      buatString: (s) => this.buatString(s),
      buatArray: (t, isi) => this.buatArray(t, isi),
      buatScanner: () => this.alokasi({ k: 'scanner', posisi: 0 }),
      tulisElemen: (id, indeks, nilai, tipeElemen) => {
        const o = this.state.heap[id] as { nilai: Nilai[] }
        this.emit({ k: 'tulis-elemen', id, indeks, tipe: tipeElemen, lama: o.nilai[indeks], baru: nilai })
      },
      cetak: (teks, err) => this.cetak(teks, err),
      pemindai: this.pemindai,
      geserScanner: (id, posisi, token, metode) => {
        const lama = (this.state.heap[id] as { posisi: number }).posisi
        this.emit({ k: 'scanner', id, posisiLama: lama, posisi, token, metode })
      },
      acak: () => this.acak(),
      keString: (v, t) => this.keString(v, t),
      keluar: (kode) => {
        throw new KeluarProgram(kode)
      },
      waktuNano: () => 1_700_000_000_000_000_000n + BigInt(this.jumlahLangkah) * 1_000_000n,
    }
    this.boksan = new PenyimpanBoks((o) => this.alokasi(o))
    this.heapKoleksi = new HeapMesin({
      heap: this.state.heap,
      alokasi: (o) => this.alokasi(o),
      baruArray: (tipeElemen, isi) => this.buatArrayTeks(tipeElemen, isi),
      emit: (p) => this.emit(p),
      kelasLain: (id) => this.kelasJvm(id),
    })
    this.ops = {
      hashCode: (x) => this.hashCodeObjek(x),
      equals: (a, b) => this.equalsObjek(a, b),
      compareTo: (a, b) => this.compareToObjek(a, b),
      compare: (cmp, a, b) => this.compareLambda(cmp, a, b),
      teks: (x) => (x === null ? 'null' : this.keString(x, T.Object)),
      pastikanComparable: (x) => {
        if (!this.adalahComparable(x)) throw new LemparanJava('java.lang.ClassCastException', pesanClassCast(this.kelasJvm(x), 'java.lang.Comparable'))
      },
    }
    this.ctx2 = {
      h: this.heapKoleksi,
      ops: this.ops,
      heap: this.state.heap,
      boks: (kelas, nilai) => this.boks(kelas, nilai),
      buatString: (s) => this.buatString(s),
      teks: (ref) => this.teks(ref),
      buatPembangun: (s) => this.alokasi({ k: 'pembangun', nilai: s }),
      ubahPembangun: (id, baru, metode) => {
        const lama = (this.state.heap[id] as { nilai: string }).nilai
        this.emit({ k: 'tulis-pembangun', id, lama, baru, metode })
      },
      keString: (v, t) => this.keString(v, t),
      buatArrayObjek: (isi) => this.buatArrayTeks('Object', isi),
      seedBawaan: () => BigInt(this.opsi.seed),
      panggilFase1: (id, arg, p) => {
        const impl = implementasi(id)
        if (!impl) throw new LemparanJava('java.lang.UnsupportedOperationException', `[Simulator] ${id} belum diimplementasikan`)
        return impl(this.ctx, null, arg, p, p)
      },
    }
  }

  // ---------- infrastruktur ----------
  private get f(): FrameRuntime {
    return this.frames[this.frames.length - 1]
  }

  private baris(span: Span): number {
    return this.sumber.baris(span.awal)
  }

  private src(e: { span: Span }): string {
    return this.sumber.potong(e.span)
  }

  private emit(p: Peristiwa): void {
    terapkan(this.state, p)
    if (!this.opsi.modeHitung) this.pending.push(p)
  }

  private catat(span: Span | undefined, jenis: JenisLangkah, baris?: number): void {
    const b = baris ?? (span ? this.baris(span) : 0)
    this.jumlahLangkah++
    if (this.dalamUkur > 0) this.langkahUkur++
    this.hitung[b] = (this.hitung[b] ?? 0) + 1
    if (!this.opsi.modeHitung) {
      const l: Langkah = {
        baris: b,
        jenis,
        span: span ? { awal: span.awal, akhir: span.akhir } : undefined,
        peristiwa: this.pending,
        panjangOutput: this.output.length,
        kedalaman: this.state.frames.length,
      }
      this.pending = []
      this.langkah.push(l)
      if ((this.langkah.length - 1) % JARAK_CHECKPOINT === 0) {
        this.checkpoint.push({ indeks: this.langkah.length - 1, state: klonState(this.state) })
      }
    }
    if (!this.selesai && this.jumlahLangkah >= this.opsi.batasLangkah) {
      throw new BatasTercapai('langkah', `Program dihentikan setelah ${this.opsi.batasLangkah.toLocaleString('id-ID')} langkah.`)
    }
  }

  private mulaiBaris(node: { span: Span } | Span): void {
    const f = this.f
    if (f) f.barisAktif = this.baris('span' in node ? node.span : node)
  }

  private cetak(teks: string, err: boolean): void {
    if (teks.length === 0 || this.opsi.modeHitung) return
    let t = teks
    let lewat = false
    if (this.output.length + t.length > this.opsi.batasOutput) {
      t = t.slice(0, Math.max(0, this.opsi.batasOutput - this.output.length))
      lewat = true
    }
    const awal = this.output.length
    this.output += t
    if (err) this.rentangErr.push([awal, this.output.length])
    this.emit({ k: 'cetak', teks: t, err })
    if (lewat) throw new BatasTercapai('output', `Output melebihi ${this.opsi.batasOutput.toLocaleString('id-ID')} karakter.`)
  }

  // ---------- heap ----------
  private alokasi(objek: ObjekHeap): number {
    if (++this.jumlahObjek > this.opsi.batasObjek) {
      throw new BatasTercapai('memori', `Program membuat lebih dari ${this.opsi.batasObjek.toLocaleString('id-ID')} objek.`)
    }
    const id = this.idObjek++
    this.emit({ k: 'alokasi', id, objek })
    return id
  }

  private buatString(s: string): number {
    if (s.length > 100_000) throw new BatasTercapai('memori', 'String terlalu panjang (lebih dari 100.000 karakter).')
    return this.alokasi({ k: 'string', nilai: s })
  }

  private internString(s: string): number {
    let id = this.intern.get(s)
    if (id === undefined) {
      id = this.buatString(s)
      this.intern.set(s, id)
    }
    return id
  }

  private teks(ref: Nilai): string {
    if (ref === null) throw new LemparanJava('java.lang.NullPointerException')
    const o = this.state.heap[ref as number]
    return o && o.k === 'string' ? o.nilai : ''
  }

  private buatArray(tipeElemen: Tipe, isi: Nilai[]): number {
    return this.buatArrayTeks(teksTipe(tipeElemen), isi)
  }

  private buatArrayTeks(tipeElemen: string, isi: Nilai[]): number {
    if (isi.length > this.opsi.batasElemen) {
      throw new BatasTercapai('memori', `Ukuran array ${isi.length.toLocaleString('id-ID')} melebihi batas simulator (${this.opsi.batasElemen.toLocaleString('id-ID')} elemen).`)
    }
    return this.alokasi({ k: 'array', tipeElemen, nilai: isi })
  }

  private heapArray(ref: number): { k: 'array'; tipeElemen: string; nilai: Nilai[] } {
    return this.state.heap[ref] as { k: 'array'; tipeElemen: string; nilai: Nilai[] }
  }

  private objek(ref: number): Extract<ObjekHeap, { k: 'objek' }> {
    return this.state.heap[ref] as Extract<ObjekHeap, { k: 'objek' }>
  }

  /** Boxing `Kelas.valueOf(nilai)` dengan cache JDK, beserta peristiwa untuk narasi. */
  private boks(kelas: string, nilai: Nilai): number {
    const h = this.boksan.boks(kelas, nilai)
    this.emit({ k: 'boxing', arah: 'box', kelas, nilai: primitifKeString(nilai, PRIMITIF_WRAPPER[kelas] ?? 'int'), id: h.id, cache: h.cache })
    return h.id
  }

  /** Nama JVM kelas objek heap, mis. `java.lang.String`, `java.lang.Integer`, `Main$Node`, `java.util.ArrayList`. */
  private kelasJvm(ref: Nilai): string {
    if (ref === null) return 'null'
    const o = this.state.heap[ref as number]
    if (!o) return 'java.lang.Object'
    switch (o.k) {
      case 'string':
        return 'java.lang.String'
      case 'boks':
        return `java.lang.${o.kelas}`
      case 'pembangun':
        return 'java.lang.StringBuilder'
      case 'scanner':
        return 'java.util.Scanner'
      case 'lambda':
        return `${this.f?.kelas?.biner ?? 'Main'}$$Lambda`
      case 'array':
        return `[${kodeTipeArray(o.tipeElemen)}`
      case 'objek':
        return o.kelas
    }
  }

  /** Class mahasiswa dari objek heap (undefined untuk objek pustaka). */
  private infoObjek(ref: Nilai): A.InfoKelas | undefined {
    if (ref === null) return undefined
    const o = this.state.heap[ref as number]
    return o?.k === 'objek' ? this.kelasDariBiner.get(o.kelas) : undefined
  }

  private info(kanonik: string | undefined): A.InfoKelas | undefined {
    return kanonik ? this.program.semuaKelas?.get(kanonik) : undefined
  }

  /** Method mahasiswa (instance) bernama `nama` dengan `n` parameter di class objek atau leluhurnya. */
  private cariMethodObjek(info: A.InfoKelas | undefined, nama: string, n: number): A.SimbolMethod | undefined {
    for (let k = info; k; k = this.induk(k)) {
      const m = k.method.get(nama)?.find((x) => !x.statik && x.parameter.length === n)
      if (m) return m
    }
    return undefined
  }

  /** Class induk mahasiswa (hanya untuk turunan exception buatan sendiri). */
  private induk(info: A.InfoKelas): A.InfoKelas | undefined {
    return info.induk && info.induk.k === 'kelas' ? this.info(info.induk.nama) : undefined
  }

  /** Objek luar: `this` lalu `luar` kali lompatan lewat field sintetis `this$0`. */
  private objekLuar(lompatan: number): Nilai {
    let x: Nilai = this.f.ini
    for (let i = 0; i < lompatan && x !== null; i++) x = this.objek(x as number).field.this$0 ?? null
    return x
  }

  private bacaFieldObjek(id: number, nama: string): Nilai {
    this.emit({ k: 'baca-field', id, field: nama })
    return this.objek(id).field[nama] ?? null
  }

  private tulisFieldObjek(id: number, nama: string, tipe: Tipe, baru: Nilai, op?: string, operand?: string): void {
    const lama = this.objek(id).field[nama] ?? null
    this.emit({ k: 'tulis-field', id, field: nama, tipe: teksTipe(tipe), lama, baru, op, operand })
  }

  /** Pesan detail exception (`getMessage()` bawaan Throwable). */
  private pesanException(ref: number): string | null {
    const o = this.state.heap[ref]
    if (o?.k !== 'objek') return null
    const m = o.field.detailMessage
    return m === null || m === undefined ? null : this.teks(m)
  }

  private adalahException(ref: number): boolean {
    const o = this.state.heap[ref]
    if (o?.k !== 'objek') return false
    const info = this.kelasDariBiner.get(o.kelas)
    if (info) return info.exception !== undefined
    return adalahExceptionBawaan(namaSederhana(o.kelas)) || o.jejak !== undefined
  }

  /** `Throwable.toString()`, memakai `getMessage()` mahasiswa bila di-override. */
  private teksThrowableObjek(ref: number): string {
    const o = this.objek(ref)
    const info = this.kelasDariBiner.get(o.kelas)
    const m = this.cariMethodObjek(info, 'getMessage', 0)
    if (m) {
      const r = this.panggilUser(m, [], ref) ?? null
      return teksThrowable(o.kelas, r === null ? null : this.teks(r))
    }
    return teksThrowable(o.kelas, this.pesanException(ref))
  }

  /** Konversi ke String sesuai String.valueOf (untuk konkatenasi, println, printf %s, dan toString koleksi). */
  private keString(v: Nilai, t: Tipe): string {
    if (t.k === 'primitif') return primitifKeString(v, t.nama)
    if (v === null) return 'null'
    if (typeof v !== 'number') return String(v)
    if (v < 0) return `java.io.PrintStream@${hashIdentitas(-v).toString(16)}`
    const o = this.state.heap[v]
    if (!o) return 'null'
    const hash = hashIdentitas(v).toString(16)
    switch (o.k) {
      case 'string':
        return o.nilai
      case 'boks':
        return primitifKeString(o.nilai, PRIMITIF_WRAPPER[o.kelas] ?? 'int')
      case 'pembangun':
        return o.nilai
      case 'array':
        return `[${kodeTipeArray(o.tipeElemen)}@${hash}`
      case 'scanner':
        return `java.util.Scanner@${hash}`
      case 'lambda':
        return `${this.kelasJvm(v)}@${hash}`
      case 'objek':
        return this.toStringObjek(v, o, hash)
    }
  }

  private toStringObjek(id: number, o: Extract<ObjekHeap, { k: 'objek' }>, hash: string): string {
    const info = this.kelasDariBiner.get(o.kelas)
    const m = this.cariMethodObjek(info, 'toString', 0)
    if (m) {
      const r = this.panggilUser(m, [], id) ?? null
      return r === null ? 'null' : this.teks(r)
    }
    if (this.adalahException(id)) return this.teksThrowableObjek(id)
    if (info) return `${o.kelas}@${hash}`
    const h = this.heapKoleksi
    if (adalahEntri(h, id)) return EntriModel.toString(h, this.ops, id)
    if (adalahMap(h, id)) return modelMapDari(h, id).teks(h, this.ops, id)
    const model = cariModel(o.kelas)
    if (model && model.kelas === o.kelas) return model.teks(h, this.ops, id)
    if (model) return `${o.kelas}@${hash}`
    // View map (keySet/values/entrySet) terdaftar sebagai koleksi dengan kelas sendiri.
    try {
      return modelDari(h, id).teks(h, this.ops, id)
    } catch {
      return `${o.kelas}@${hash}`
    }
  }

  private tampil(v: Nilai | undefined, t: Tipe): string {
    return tampilNilai(v, teksTipe(t), this.state.heap)
  }

  // ---------- operasi elemen (dipakai model koleksi) ----------
  private hashCodeObjek(x: number): number {
    const o = this.state.heap[x]
    if (!o) return 0
    if (o.k === 'string') return hashString(o.nilai)
    if (o.k === 'boks') return hashWrapper(o.kelas, o.nilai)
    if (o.k === 'objek') {
      const info = this.kelasDariBiner.get(o.kelas)
      const m = this.cariMethodObjek(info, 'hashCode', 0)
      if (m) return (this.panggilUser(m, [], x) ?? 0) as number
      if (!info) {
        const h = this.heapKoleksi
        if (adalahEntri(h, x)) return EntriModel.hashCode(h, this.ops, x)
        if (adalahMap(h, x)) return modelMapDari(h, x).hashCode(h, this.ops, x)
        const model = cariModel(o.kelas)
        if (model?.hashCode && model.kelas === o.kelas) return model.hashCode(h, this.ops, x)
      }
    }
    return hashIdentitas(x)
  }

  private equalsObjek(a: number, b: Nilai): boolean {
    const o = this.state.heap[a]
    if (!o) return a === b
    if (o.k === 'string') {
      const ob = b === null ? undefined : this.state.heap[b as number]
      return ob?.k === 'string' && ob.nilai === o.nilai
    }
    if (o.k === 'boks') return samaWrapper(this.state.heap, a, b)
    if (o.k === 'objek') {
      const info = this.kelasDariBiner.get(o.kelas)
      const m = this.cariMethodObjek(info, 'equals', 1)
      if (m) return (this.panggilUser(m, [b], a) ?? false) as boolean
      if (!info) {
        const h = this.heapKoleksi
        if (adalahEntri(h, a)) return EntriModel.equals(h, this.ops, a, b)
        if (adalahMap(h, a)) return modelMapDari(h, a).equals(h, this.ops, a, b)
        const model = cariModel(o.kelas)
        if (model?.equals && model.kelas === o.kelas) return model.equals(h, this.ops, a, b)
      }
    }
    return a === b
  }

  /** `x instanceof Comparable` untuk objek heap. */
  private adalahComparable(x: number): boolean {
    const o = this.state.heap[x]
    if (!o) return false
    if (o.k === 'string' || o.k === 'boks' || o.k === 'pembangun') return true
    if (o.k !== 'objek') return false
    for (let info = this.kelasDariBiner.get(o.kelas); info; info = this.induk(info)) {
      if (info.antarmuka.some((t) => t.k === 'kelas' && t.nama === 'Comparable')) return true
    }
    return false
  }

  private compareToObjek(a: number, b: Nilai): number {
    const o = this.state.heap[a]
    const cce = (ke: string) => new LemparanJava('java.lang.ClassCastException', pesanClassCast(this.kelasJvm(b), ke))
    if (o?.k === 'string') {
      if (b === null) throw new LemparanJava('java.lang.NullPointerException', 'Cannot read field "value" because "anotherString" is null')
      const ob = this.state.heap[b as number]
      if (ob?.k !== 'string') throw cce('java.lang.String')
      const x = o.nilai
      const y = ob.nilai
      const n = Math.min(x.length, y.length)
      for (let i = 0; i < n; i++) if (x.charCodeAt(i) !== y.charCodeAt(i)) return x.charCodeAt(i) - y.charCodeAt(i)
      return x.length - y.length
    }
    if (o?.k === 'boks') {
      const r = panggilBoks(this.ctx2, a, 'compareTo', [b])
      if (r !== TIDAK_ADA) {
        const ob = b === null ? undefined : this.state.heap[b as number]
        if (ob?.k !== 'boks' || ob.kelas !== o.kelas) throw cce(`java.lang.${o.kelas}`)
        return r as number
      }
    }
    if (o?.k === 'pembangun') return panggilPembangun(this.ctx2, a, 'compareTo', [], [b]) as number
    if (o?.k === 'objek' && this.adalahComparable(a)) {
      const info = this.kelasDariBiner.get(o.kelas)
      const m = this.cariMethodObjek(info, 'compareTo', 1)
      if (m) {
        // Method jembatan compareTo(Object) meng-cast argumen ke tipe parameternya.
        if (b !== null && !this.instanceOf(b, m.parameter[0])) throw cce(this.namaJvmTipe(m.parameter[0]))
        return (this.panggilUser(m, [b], a) ?? 0) as number
      }
    }
    throw new LemparanJava('java.lang.ClassCastException', pesanClassCast(this.kelasJvm(a), 'java.lang.Comparable'))
  }

  private compareLambda(cmp: number, a: Nilai, b: Nilai): number {
    const o = this.state.heap[cmp]
    if (o?.k === 'lambda') return this.panggilLambda(cmp, [a, b]) as number
    if (o?.k === 'objek') {
      switch (o.kelas) {
        case PEMBANDING_ALAMI:
          return this.compareAlami(a, b, 'c1')
        case PEMBANDING_TERBALIK:
          return this.compareAlami(b, a, 'c2')
        case PEMBANDING_TERBALIK2:
          return this.compareLambda(o.field.cmp as number, b, a)
        case PEMBANDING_LANJUT: {
          const r = this.compareLambda(o.field['arg$1'] as number, a, b)
          return r !== 0 ? r : this.compareLambda(o.field['arg$2'] as number, a, b)
        }
      }
    }
    throw new LemparanJava('java.lang.UnsupportedOperationException', '[Simulator] Comparator ini belum didukung')
  }

  /** NaturalOrderComparator/ReverseComparator: `c1.compareTo(c2)` milik elemen pertama. */
  private compareAlami(a: Nilai, b: Nilai, nama: string): number {
    if (a === null) throw new LemparanJava('java.lang.NullPointerException', `Cannot invoke "java.lang.Comparable.compareTo(Object)" because "${nama}" is null`)
    return this.compareToObjek(a as number, b)
  }

  /** Comparator.naturalOrder() dan Collections.reverseOrder() adalah objek tunggal di JDK. */
  private pembandingTunggal(kelas: string): number {
    let id = this.tunggal.get(kelas)
    if (id === undefined) {
      id = this.heapKoleksi.baruObjek(kelas, {}, {})
      this.tunggal.set(kelas, id)
    }
    return id
  }

  /** Collections.reverseOrder(cmp), juga dipakai Comparator.reversed() (`Collections.reverseOrder(this)`). */
  private balikPembanding(cmp: Nilai): number {
    if (cmp === null) return this.pembandingTunggal(PEMBANDING_TERBALIK)
    const o = this.state.heap[cmp as number]
    if (o?.k === 'objek') {
      if (o.kelas === PEMBANDING_TERBALIK) return this.pembandingTunggal(PEMBANDING_ALAMI)
      if (o.kelas === PEMBANDING_ALAMI) return this.pembandingTunggal(PEMBANDING_TERBALIK)
      if (o.kelas === PEMBANDING_TERBALIK2) return o.field.cmp as number
    }
    return this.heapKoleksi.baruObjek(PEMBANDING_TERBALIK2, { cmp }, { cmp: 'java.util.Comparator' })
  }

  /** compare/reversed/thenComparing pada objek Comparator (lambda mahasiswa atau objek pembanding JDK). */
  private metodePembanding(ref: number, nama: string, arg: Nilai[]): Nilai | typeof TIDAK_ADA {
    switch (nama) {
      case 'compare':
        return this.compareLambda(ref, arg[0], arg[1])
      case 'reversed':
        return this.balikPembanding(ref)
      case 'thenComparing':
        if (arg[0] === null) throw new LemparanJava('java.lang.NullPointerException')
        return this.heapKoleksi.baruObjek(PEMBANDING_LANJUT, { 'arg$1': ref, 'arg$2': arg[0] }, { 'arg$1': 'java.util.Comparator', 'arg$2': 'java.util.Comparator' })
    }
    return TIDAK_ADA
  }

  /** Nama JVM sebuah tipe statis (untuk pesan ClassCastException). */
  private namaJvmTipe(t: Tipe): string {
    if (t.k === 'kelas') return this.biner(t.nama) ?? namaLengkapPustaka(t.nama) ?? t.nama
    if (t.k === 'array') return `[${kodeTipeArray(teksTipe(t.elemen))}`
    return 'java.lang.Object'
  }

  /** `ref instanceof t` (ref tidak null). */
  private instanceOf(ref: Nilai, t: Tipe): boolean {
    if (ref === null) return false
    if (t.k === 'variabel' || t.k === 'wildcard' || t.k === 'error') return true
    const o = this.state.heap[ref as number]
    if (!o) return false
    if (t.k === 'array') return o.k === 'array'
    if (t.k !== 'kelas') return false
    const nama = t.nama
    if (nama === 'Object') return true
    const user = this.info(nama)
    if (user) {
      for (let info = this.infoObjek(ref); info; info = this.induk(info)) if (info.nama === user.nama) return true
      return false
    }
    switch (o.k) {
      case 'string':
        return ['String', 'CharSequence', 'Comparable'].includes(nama)
      case 'boks':
        return nama === o.kelas || nama === 'Comparable' || (nama === 'Number' && !['Character', 'Boolean'].includes(o.kelas))
      case 'pembangun':
        return ['StringBuilder', 'CharSequence', 'Comparable'].includes(nama)
      case 'lambda':
        return nama === 'Comparator'
      case 'scanner':
        return nama === 'Scanner'
      case 'array':
        return false
      case 'objek': {
        const info = this.kelasDariBiner.get(o.kelas)
        if (info) {
          // Class mahasiswa terhadap tipe pustaka: Comparable atau leluhur exception.
          if (nama === 'Comparable') return this.adalahComparable(ref as number)
          return (info.exception ?? []).includes(nama)
        }
        if (KELAS_PEMBANDING.has(o.kelas)) return nama === 'Comparator'
        const sederhana = namaSederhana(o.kelas)
        if (adalahExceptionBawaan(sederhana)) return rantaiException(sederhana).includes(nama)
        return subtipePustaka(sederhana, nama)
      }
    }
  }

  // ---------- program ----------
  jalankan(): Trace {
    let status: StatusTrace = 'selesai'
    let exception: Trace['exception']
    let pesanSimulator: string | undefined
    let kodeKeluar: number | undefined
    const main = this.program.main
    try {
      // Seperti JVM: class Main diinisialisasi sebelum main dijalankan. Field static bernilai default dulu,
      // konstanta compile-time langsung terisi, lalu penginisialisasi lain dijalankan menurut urutan teks.
      this.terinit.add(this.mainKanonik)
      this.initStatik(this.program.infoMain, this.program.kelas)
      if (!main) {
        this.cetak(
          'Error: Main method not found in class Main, please define the main method as:\n   public static void main(String[] args)\nor a JavaFX application class must extend javafx.application.Application\n',
          true,
        )
        this.selesai = true
        this.catat(undefined, 'exception', 1)
        return this.hasil('exception', { kelas: 'Error', pesan: 'Main method not found in class Main', baris: 1, jejak: [] }, undefined, undefined)
      }
      const d = main.deklarasi
      const args = this.buatArray(T.String, [])
      const frame = this.frameBaru(main, [args], null)
      this.catat(d.spanNama, 'mulai')
      const r = this.execBadan(d.badan)
      this.selesai = true
      const barisAkhir = r?.k === 'return' && frame.barisReturn ? frame.barisReturn : this.baris(d.spanTutup)
      frame.barisAktif = barisAkhir
      this.catat(r?.k === 'return' ? frame.spanReturn : d.spanTutup, 'selesai', barisAkhir)
    } catch (galat) {
      this.selesai = true
      // Bila stack JavaScript tetap habis (mis. di browser dengan stack sangat kecil), anggap StackOverflowError.
      let e = galat
      if (e instanceof RangeError && /call stack|too much recursion/i.test(e.message)) {
        this.stackBrowserHabis = true
        e = new LemparanJava('java.lang.StackOverflowError')
      }
      if (e instanceof LemparanJava) {
        status = 'exception'
        const jejakPenuh = e.jejak ?? this.jejakSekarang()
        const soe = e.kelas === 'java.lang.StackOverflowError'
        const batas = soe ? 12 : BATAS_JEJAK
        const jejak = jejakPenuh.length > batas ? [...jejakPenuh.slice(0, batas - 2), `\t... (${jejakPenuh.length - batas + 2} frame lagi)`] : jejakPenuh
        const baris = this.f?.barisAktif ?? 1
        let teks = teksThrowable(e.kelas, e.pesanJava)
        try {
          if (e.objek !== undefined) teks = this.teksThrowableObjek(e.objek)
        } catch {
          // toString/getMessage mahasiswa gagal: pakai bentuk bawaan.
        }
        exception = { kelas: e.kelas, pesan: e.pesanJava, baris, jejak }
        try {
          this.cetak(`Exception in thread "main" ${teks}\n${jejak.join('\n')}\n`, true)
        } catch (lain) {
          if (!(lain instanceof BatasTercapai)) throw lain
        }
        if (soe) {
          pesanSimulator = this.stackBrowserHabis
            ? `[Simulator] Stack browser habis pada kedalaman ${this.frames.length} pemanggilan method (JVM asli mengizinkan jauh lebih dalam). Biasanya rekursi tidak punya base case yang tercapai.`
            : `[Simulator] Kedalaman pemanggilan method melebihi ${this.opsi.batasKedalaman.toLocaleString('id-ID')} (JVM asli mengizinkan jauh lebih dalam). Biasanya rekursi tidak punya base case yang tercapai.`
        }
        this.emit({ k: 'exception', kelas: e.kelas, pesan: e.pesanJava })
        this.catat(undefined, 'exception', baris)
      } else if (e instanceof BatasTercapai) {
        status = e.jenis === 'langkah' ? 'batas-langkah' : e.jenis === 'memori' ? 'batas-memori' : 'batas-output'
        pesanSimulator = `[Simulator] ${e.message}`
        if (e.jenis === 'langkah') {
          const terpanas = this.barisTerpanas()
          pesanSimulator += ` Kemungkinan ada perulangan tak berujung (infinite loop)${terpanas ? `; baris yang paling sering dijalankan: ${terpanas}` : ''}.`
        }
        this.catat(undefined, 'batas', this.f?.barisAktif ?? 1)
      } else if (e instanceof KeluarProgram) {
        status = 'keluar'
        kodeKeluar = e.kode
        this.catat(undefined, 'selesai', this.f?.barisAktif ?? 1)
      } else {
        throw e
      }
    }
    return this.hasil(status, exception, pesanSimulator, kodeKeluar)
  }

  private barisTerpanas(): number | undefined {
    let terbaik: number | undefined
    let maks = 0
    for (const [b, n] of Object.entries(this.hitung)) {
      if (n > maks) {
        maks = n
        terbaik = Number(b)
      }
    }
    return terbaik
  }

  private hasil(status: StatusTrace, exception: Trace['exception'], pesanSimulator: string | undefined, kodeKeluar: number | undefined): Trace {
    return {
      langkah: this.langkah,
      checkpoint: this.checkpoint,
      output: this.output,
      rentangErr: this.rentangErr,
      status,
      exception,
      pesanSimulator,
      hitunganBaris: this.hitung,
      barisTerpanas: this.barisTerpanas(),
      akhirMain: this.nilaiAkhirMain(),
      akhirStatik: Object.fromEntries([...this.statik.values()].map((v) => [v.nama, { tipe: teksTipe(v.tipe), nilai: this.json(v.nilai, teksTipe(v.tipe), 0) }])),
      kodeKeluar,
      jumlahLangkah: this.jumlahLangkah,
      langkahUkur: this.opsi.ukurMethod ? this.langkahUkur : undefined,
      gantiDipakai: this.gantiDipakai.size ? [...this.gantiDipakai] : undefined,
    }
  }

  private nilaiAkhirMain(): Record<string, NilaiAkhir> {
    const hasil: Record<string, NilaiAkhir> = {}
    const main = this.frames[0]
    if (!main) return hasil
    const fs = this.state.frames.find((f) => f.id === main.id)
    for (const v of fs?.vars ?? []) {
      if (v.param) continue
      hasil[v.nama] = { tipe: v.tipe, nilai: this.json(v.nilai, v.tipe, 0) }
    }
    return hasil
  }

  /** Nilai ramah-JSON untuk pemeriksa tantangan: objek → {field: nilai}, List/Set → array, Map → objek. */
  private json(v: Nilai | undefined, tipe: string, kedalaman: number): unknown {
    if (v === undefined || v === null) return null
    switch (tipe) {
      case 'char':
        return String.fromCharCode(v as number)
      case 'long': {
        const b = v as bigint
        return b >= BigInt(Number.MIN_SAFE_INTEGER) && b <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(b) : b.toString()
      }
      case 'int':
      case 'short':
      case 'byte':
      case 'double':
      case 'float':
      case 'boolean':
        return v
    }
    const o = this.state.heap[v as number]
    if (!o || kedalaman > 4) return null
    switch (o.k) {
      case 'string':
        return o.nilai
      case 'array':
        return o.nilai.map((x) => this.json(x, o.tipeElemen, kedalaman + 1))
      case 'boks':
        return this.json(o.nilai, PRIMITIF_WRAPPER[o.kelas] ?? 'int', kedalaman + 1)
      case 'pembangun':
        return o.nilai
      case 'objek': {
        const isi = bacaKoleksi(this.state.heap, v as number, 1000)
        if (isi?.jenis === 'map') {
          return Object.fromEntries(isi.entri.map(([kk, nn]) => [String(this.json(kk, 'Object', kedalaman + 1)), this.json(nn, 'Object', kedalaman + 1)]))
        }
        if (isi) return isi.elemen.map((x) => this.json(x, 'Object', kedalaman + 1))
        return Object.fromEntries(
          Object.entries(o.field)
            .filter(([nama]) => nama !== 'this$0')
            .map(([nama, x]) => [nama, this.json(x, o.tipeField[nama] ?? 'Object', kedalaman + 1)]),
        )
      }
      default:
        return null
    }
  }

  // ---------- class & field static ----------
  private kunciStatik(f: A.SimbolField): string {
    return !f.kelas || f.kelas === this.mainKanonik ? f.nama : `${f.kelas}.${f.nama}`
  }

  private namaStatik(f: A.SimbolField): string {
    if (!f.kelas || f.kelas === this.mainKanonik) return f.nama
    return `${this.info(f.kelas)?.sederhana ?? f.kelas}.${f.nama}`
  }

  /** Inisialisasi class saat pertama kali dipakai secara aktif (JLS 12.4.1). */
  private pastikanInit(kanonik: string | undefined): void {
    if (!kanonik || this.terinit.has(kanonik)) return
    this.terinit.add(kanonik)
    const info = this.info(kanonik)
    if (info) this.initStatik(info, info.deklarasi)
  }

  private initStatik(info: A.InfoKelas | undefined, kelas: A.DeklarasiKelas): void {
    const peta = info?.field ?? this.program.field
    const fieldStatik = kelas.field.filter((f) => f.modifier.includes('static')).flatMap((f) => f.deklarator)
    const simbol = (d: A.Deklarator) => peta.get(d.nama)
    const konstan = (d: A.Deklarator) => d.init !== undefined && simbol(d)?.konstan !== undefined
    const isi = (d: A.Deklarator, nilai: Nilai) => {
      const s = simbol(d)
      const tipe = d.tipe!
      const nama = s ? this.namaStatik(s) : d.nama
      this.statik.set(s ? this.kunciStatik(s) : d.nama, { nilai, tipe, nama })
      this.emit({ k: 'deklarasi-statik', nama, tipe: teksTipe(tipe), nilai })
    }
    for (const d of fieldStatik) isi(d, konstan(d) ? this.nilaiUntuk(d.init!, d.tipe!) : nilaiDefault(d.tipe!))
    for (const d of fieldStatik) {
      if (!d.init || konstan(d)) continue
      isi(d, this.nilaiUntuk(d.init, d.tipe!))
    }
  }

  private bacaStatik(f: A.SimbolField): Nilai {
    if (f.konstan === undefined) this.pastikanInit(f.kelas)
    const nama = this.namaStatik(f)
    this.emit({ k: 'baca-statik', nama })
    return this.statik.get(this.kunciStatik(f))?.nilai ?? nilaiDefault(f.tipe)
  }

  private tulisStatik(f: A.SimbolField, v: Nilai, op?: string, operand?: string): void {
    this.pastikanInit(f.kelas)
    const kunci = this.kunciStatik(f)
    const nama = this.namaStatik(f)
    const lama = this.statik.get(kunci)?.nilai
    this.statik.set(kunci, { nilai: v, tipe: f.tipe, nama })
    this.emit({ k: 'tulis-statik', nama, tipe: teksTipe(f.tipe), lama, baru: v, op, operand })
  }

  // ---------- frame & pemanggilan ----------
  private namaJejak(info: A.InfoKelas | undefined, method: string): string {
    return `${info?.biner ?? this.program.kelas.nama}.${method}`
  }

  private jejakSekarang(): string[] {
    return [...this.frames].reverse().map((f) => {
      const titik = f.namaJejak.lastIndexOf('.')
      return barisJejak(f.namaJejak.slice(0, titik), f.namaJejak.slice(titik + 1), f.barisAktif)
    })
  }

  private varIni(ini: number | null, info: A.InfoKelas | undefined): VarState[] {
    return ini === null ? [] : [{ slot: -1, nama: 'this', tipe: info?.sederhana ?? 'Object', nilai: ini, param: true }]
  }

  private frameBaru(m: A.SimbolMethod, arg: Nilai[], ini: number | null): FrameRuntime {
    const d = m.deklarasi
    const id = this.idFrame++
    const info = this.info(m.kelas) ?? this.program.infoMain
    const frame: FrameRuntime = {
      id,
      simbol: m,
      lokal: new Array(d.jumlahSlot ?? 0),
      terdeklarasi: new Set(),
      tipeLokal: new Map(),
      barisAktif: this.baris(d.spanNama),
      ini,
      kelas: info,
      namaJejak: this.namaJejak(info, m.konstruktor ? '<init>' : m.nama),
      kembali: m.kembali,
    }
    const vars: VarState[] = [
      ...this.varIni(ini, info),
      ...d.parameter.map((p, i) => {
        const p2 = p.info!
        frame.lokal[p2.slot] = arg[i]
        frame.terdeklarasi.add(p2.slot)
        frame.tipeLokal.set(p2.slot, p2.tipe)
        return { slot: p2.slot, nama: p.nama, tipe: teksTipe(p2.tipe), nilai: arg[i], param: true }
      }),
    ]
    const barisPemanggil = this.frames.length ? this.f.barisAktif : 0
    const label = m.konstruktor ? (info?.sederhana ?? m.nama) : m.nama
    this.emit({
      k: 'panggil',
      frame: { id, method: label, baris: frame.barisAktif, vars },
      method: label,
      argumen: arg.map((a, i) => this.tampil(a, m.parameter[i])),
      barisPemanggil,
      jenis: m.konstruktor ? 'konstruktor' : undefined,
    })
    this.frames.push(frame)
    return frame
  }

  private cekKedalaman(): void {
    if (this.frames.length >= this.opsi.batasKedalaman) throw new LemparanJava('java.lang.StackOverflowError')
    // Jaring pengaman: hentikan dengan StackOverflowError yang rapi sebelum stack browser benar-benar habis.
    if (this.frames.length >= KEDALAMAN_MULAI_PROBE && !stackMasihCukup(CADANGAN_STACK)) {
      this.stackBrowserHabis = true
      throw new LemparanJava('java.lang.StackOverflowError')
    }
  }

  private panggilUser(m: A.SimbolMethod, arg: Nilai[], ini: number | null = null): Nilai | undefined {
    if (m.statik) this.pastikanInit(m.kelas)
    this.cekKedalaman()
    const d = m.deklarasi
    const diukur = this.opsi.ukurMethod !== '' && m.nama === this.opsi.ukurMethod
    if (diukur) this.dalamUkur++
    try {
      const frame = this.frameBaru(m, arg, ini)
      try {
        this.catat(d.spanNama, 'panggil')
        const r = m.konstruktor ? this.execKonstruktor(m, frame) : this.execBadan(d.badan)
        const nilai = r?.k === 'return' ? r.nilai : undefined
        const barisKembali = frame.barisReturn ?? this.baris(d.spanTutup)
        frame.barisAktif = barisKembali
        this.emit({
          k: 'kembali',
          frame: frame.id,
          method: m.konstruktor ? (frame.kelas?.sederhana ?? m.nama) : m.nama,
          nilai: nilai !== undefined ? this.tampil(nilai, m.kembali) : undefined,
          tipe: m.kembali.k === 'void' || m.konstruktor ? undefined : teksTipe(m.kembali),
          jenis: m.konstruktor ? 'konstruktor' : undefined,
        })
        this.catat(frame.spanReturn ?? d.spanTutup, 'kembali', barisKembali)
        this.frames.pop()
        this.emit({ k: 'buang-frame', frame: frame.id })
        return nilai
      } catch (e) {
        if (e instanceof LemparanJava) this.lepasFrame(frame, e)
        throw e
      }
    } finally {
      if (diukur) this.dalamUkur--
    }
  }

  /** Rantai nama kelas exception untuk pencocokan catch (kanonik untuk class mahasiswa, sederhana untuk pustaka). */
  private rantaiException(e: LemparanJava): string[] {
    const info = this.kelasDariBiner.get(e.kelas)
    if (info) return info.exception ?? [info.nama, 'Throwable']
    const sederhana = namaSederhana(e.kelas)
    const r = rantaiException(sederhana)
    return r.length ? r : [sederhana, 'RuntimeException', 'Exception', 'Throwable']
  }

  private cocokCatch(t: A.Tangkap, rantai: string[]): boolean {
    return (t.tipeTangkap ?? []).some((x) => x.k === 'kelas' && rantai.includes(x.nama))
  }

  /** Apakah ada blok try aktif di frame lain yang akan menangkap exception ini atau punya finally. */
  private akanDitangani(e: LemparanJava, frame: number): boolean {
    const rantai = this.rantaiException(e)
    return this.tryAktif.some((t) => t.frame !== frame && (t.adaFinally || t.tangkap.some((c) => this.cocokCatch(c, rantai))))
  }

  /**
   * Exception merambat keluar dari `frame`: rekam stack trace bila belum ada (frame masih utuh), lalu buang
   * frame bila exception akan ditangani di frame luar. Bila tidak akan tertangkap, frame dibiarkan agar
   * tampilan akhir memperlihatkan call stack saat program berhenti.
   */
  private lepasFrame(frame: FrameRuntime, e: LemparanJava): void {
    if (!e.jejak) e.jejak = this.jejakSekarang()
    if (!this.akanDitangani(e, frame.id)) return
    const i = this.frames.lastIndexOf(frame)
    if (i < 0) return
    this.emit({ k: 'rambat', frame: frame.id, method: frame.simbol.konstruktor ? (frame.kelas?.sederhana ?? frame.simbol.nama) : frame.simbol.nama, kelas: e.kelas })
    this.frames.splice(i, 1)
    this.emit({ k: 'buang-frame', frame: frame.id })
  }

  // ---------- objek & konstruktor ----------
  /** Field instance milik class ini saja (tanpa leluhur), urut deklarasi. */
  private fieldInstance(info: A.InfoKelas): A.Deklarator[] {
    return info.deklarasi.field.filter((f) => !f.modifier.includes('static')).flatMap((f) => f.deklarator)
  }

  private buatObjek(info: A.InfoKelas, luar: Nilai, jejak?: string[]): number {
    const field: Record<string, Nilai> = {}
    const tipeField: Record<string, string> = {}
    if (info.exception) {
      field.detailMessage = null
      tipeField.detailMessage = 'String'
    }
    const rantai: A.InfoKelas[] = []
    for (let k: A.InfoKelas | undefined = info; k; k = this.induk(k)) rantai.unshift(k)
    for (const k of rantai) {
      for (const d of this.fieldInstance(k)) {
        field[d.nama] = nilaiDefault(d.tipe!)
        tipeField[d.nama] = teksTipe(d.tipe!)
      }
    }
    if (!info.statik && info.luar) {
      field.this$0 = luar
      tipeField.this$0 = info.luar.sederhana
    }
    return this.alokasi({ k: 'objek', kelas: info.biner, field, tipeField, jejak })
  }

  /** Jalankan konstruktor `ktor` (undefined = konstruktor bawaan) pada objek `ini`. */
  private jalankanKonstruktor(info: A.InfoKelas, ktor: A.SimbolMethod | undefined, ini: number, arg: Nilai[]): void {
    if (ktor) {
      this.panggilUser(ktor, arg, ini)
      return
    }
    // Konstruktor bawaan: super() lalu initializer field. Tanpa initializer, tidak ada yang perlu ditampilkan.
    this.superImplisit(info, ini)
    if (!this.fieldInstance(info).some((d) => d.init)) return
    this.cekKedalaman()
    const sintetis: A.SimbolMethod = {
      nama: info.sederhana,
      parameter: [],
      kembali: T.void,
      statik: false,
      varargs: false,
      deklarasi: { ...info.deklarasi.konstruktor[0], spanNama: info.deklarasi.spanNama, spanTutup: info.deklarasi.spanNama, parameter: [], jumlahSlot: 0 } as A.DeklarasiMethod,
      tandaTangan: `${info.sederhana}()`,
      kelas: info.nama,
      konstruktor: true,
    }
    const frame = this.frameBaru(sintetis, [], ini)
    try {
      this.catat(info.deklarasi.spanNama, 'panggil')
      this.initField(info, ini)
      this.emit({ k: 'kembali', frame: frame.id, method: info.sederhana, jenis: 'konstruktor' })
      this.catat(info.deklarasi.spanNama, 'kembali')
      this.frames.pop()
      this.emit({ k: 'buang-frame', frame: frame.id })
    } catch (e) {
      if (e instanceof LemparanJava) this.lepasFrame(frame, e)
      throw e
    }
  }

  /** `super()` implisit: hanya bermakna bila induknya exception buatan sendiri. */
  private superImplisit(info: A.InfoKelas, ini: number): void {
    const induk = this.induk(info)
    if (!induk) return
    const ktor = induk.konstruktor.find((k) => k.parameter.length === 0)
    this.jalankanKonstruktor(induk, ktor, ini, [])
  }

  /** Initializer field instance, menurut urutan teks (setelah super(), sebelum isi konstruktor). */
  private initField(info: A.InfoKelas, ini: number): void {
    for (const d of this.fieldInstance(info)) {
      if (!d.init) continue
      this.mulaiBaris(d)
      const v = this.nilaiUntuk(d.init, d.tipe!)
      this.tulisFieldObjek(ini, d.nama, d.tipe!, v, '=')
      this.catat(d.span, 'pernyataan')
    }
  }

  /** Badan konstruktor: `this(...)` mendelegasikan; selain itu super(...) lalu initializer field, lalu isinya. */
  private execKonstruktor(m: A.SimbolMethod, frame: FrameRuntime): Selesai {
    const info = frame.kelas!
    const ini = frame.ini!
    const isi = m.deklarasi.badan.pernyataan
    const pertama = isi[0]
    const panggilAwal = pertama?.jenis === 'PernyataanEkspresi' && pertama.ekspresi.jenis === 'PanggilKonstruktor' ? pertama.ekspresi : undefined
    let mulai = 0
    if (panggilAwal) {
      const r = this.exec(pertama)
      if (r) return r
      mulai = 1
    } else {
      this.superImplisit(info, ini)
    }
    if (!panggilAwal || panggilAwal.bentuk === 'super') this.initField(info, ini)
    for (let i = mulai; i < isi.length; i++) {
      const r = this.exec(isi[i])
      if (r) return r
    }
    return undefined
  }

  private evalPanggilKonstruktor(e: A.PanggilKonstruktor): Nilai {
    const t = e.target!
    const ini = this.f.ini!
    if (t.k === 'user') {
      const param = t.konstruktor?.parameter ?? []
      const arg = this.argumenUser(e.argumen, param, !!(t.konstruktor?.varargs && e.pakaiVarargs))
      this.jalankanKonstruktor(t.kelas, t.konstruktor, ini, arg)
      return null
    }
    // super(pesan) ke exception bawaan: mengisi detailMessage.
    const { nilai } = this.argumenPustaka(e.argumen, t.parameter, false, t.id)
    const pesan = t.parameter.length > 0 && t.parameter[0].k === 'kelas' && t.parameter[0].nama === 'String' ? nilai[0] : null
    if (pesan !== null) this.tulisFieldObjek(ini, 'detailMessage', T.String, pesan, '=')
    return null
  }

  // ---------- lambda ----------
  private evalLambda(e: A.Lambda): Nilai {
    const f = this.f
    const tangkapan = (e.tangkapan ?? []).map((t) => f.lokal[t.luar.slot] ?? nilaiDefault(t.luar.tipe))
    const ini = e.pakaiThis ? f.ini : null
    const id = this.alokasi({
      k: 'lambda',
      nama: e.namaMethod ?? 'lambda',
      teks: this.src(e),
      tangkapan: (e.tangkapan ?? []).map((t, i) => ({ slot: t.dalam.slot, nama: t.dalam.nama, tipe: teksTipe(t.dalam.tipe), nilai: tangkapan[i] })),
    })
    this.lambda.set(id, { node: e, tangkapan, ini, kelas: f.kelas })
    return id
  }

  /** Jalankan lambda `id` sebagai method sintetis `lambda$<method>$<n>` (Comparator.compare). */
  private panggilLambda(id: number, arg: Nilai[]): Nilai {
    const L = this.lambda.get(id)
    if (!L) throw new LemparanJava('java.lang.UnsupportedOperationException', '[Simulator] Lambda tidak dikenal')
    this.cekKedalaman()
    const e = L.node
    const fung = e.fungsional ?? { antarmuka: 'Comparator', parameter: [T.Object, T.Object], kembali: T.int }
    const idFrame = this.idFrame++
    const nama = e.namaMethod ?? 'lambda'
    const simbol: A.SimbolMethod = {
      nama,
      parameter: fung.parameter,
      kembali: fung.kembali,
      statik: L.ini === null,
      varargs: false,
      deklarasi: { spanNama: e.span, spanTutup: e.span, parameter: [], jumlahSlot: e.jumlahSlot } as unknown as A.DeklarasiMethod,
      tandaTangan: nama,
      kelas: L.kelas?.nama,
    }
    const frame: FrameRuntime = {
      id: idFrame,
      simbol,
      lokal: new Array(e.jumlahSlot ?? 0),
      terdeklarasi: new Set(),
      tipeLokal: new Map(),
      barisAktif: this.baris(e.span),
      ini: L.ini,
      kelas: L.kelas,
      namaJejak: this.namaJejak(L.kelas, nama),
      kembali: fung.kembali,
    }
    const vars: VarState[] = [...this.varIni(L.ini, L.kelas)]
    e.parameter.forEach((p, i) => {
      const info = p.info
      if (!info) return
      const v = this.konversiNilai(arg[i] ?? null, T.Object, info.tipe)
      frame.lokal[info.slot] = v
      frame.terdeklarasi.add(info.slot)
      frame.tipeLokal.set(info.slot, info.tipe)
      vars.push({ slot: info.slot, nama: p.nama, tipe: teksTipe(info.tipe), nilai: v, param: true })
    })
    ;(e.tangkapan ?? []).forEach((t, i) => {
      frame.lokal[t.dalam.slot] = L.tangkapan[i]
      frame.terdeklarasi.add(t.dalam.slot)
      frame.tipeLokal.set(t.dalam.slot, t.dalam.tipe)
      vars.push({ slot: t.dalam.slot, nama: t.dalam.nama, tipe: teksTipe(t.dalam.tipe), nilai: L.tangkapan[i] })
    })
    this.emit({
      k: 'panggil',
      frame: { id: idFrame, method: nama, baris: frame.barisAktif, vars },
      method: nama,
      argumen: arg.map((a) => this.tampil(a, T.Object)),
      barisPemanggil: this.frames.length ? this.f.barisAktif : 0,
      jenis: 'lambda',
    })
    this.frames.push(frame)
    try {
      this.catat(e.span, 'panggil')
      let nilai: Nilai
      if (e.badan.jenis === 'Blok') {
        const r = this.execBadan(e.badan)
        nilai = r?.k === 'return' && r.nilai !== undefined ? r.nilai : null
      } else {
        this.mulaiBaris(e.badan)
        nilai = this.nilaiUntuk(e.badan, fung.kembali)
      }
      this.emit({ k: 'kembali', frame: idFrame, method: nama, nilai: this.tampil(nilai, fung.kembali), tipe: teksTipe(fung.kembali), jenis: 'lambda' })
      this.catat(frame.spanReturn ?? e.span, 'kembali', frame.barisReturn ?? frame.barisAktif)
      this.frames.pop()
      this.emit({ k: 'buang-frame', frame: idFrame })
      return nilai
    } catch (err) {
      if (err instanceof LemparanJava) this.lepasFrame(frame, err)
      throw err
    }
  }

  // ---------- pernyataan ----------
  private hapusSlot(slot: number[] | undefined): void {
    if (!slot) return
    const f = this.f
    for (const s of slot) {
      if (!f.terdeklarasi.has(s)) continue
      f.terdeklarasi.delete(s)
      const nama = this.state.frames.find((x) => x.id === f.id)?.vars.find((v) => v.slot === s)?.nama ?? ''
      this.emit({ k: 'hapus-var', frame: f.id, slot: s, nama })
    }
  }

  /** Jalankan isi blok tanpa membuang variabelnya (dipakai untuk badan method: variabel tetap terlihat sampai frame dibuang). */
  private execBadan(b: A.Blok): Selesai {
    for (const s of b.pernyataan) {
      const r = this.exec(s)
      if (r) return r
    }
    return undefined
  }

  private deklarasi(p: A.DeklarasiLokal): void {
    for (const d of p.deklarator) {
      const info = d.info!
      let nilai: Nilai | undefined
      if (this.frames.length === 1 && this.f.simbol === this.program.main && this.perluGanti(info.nama)) {
        nilai = this.nilaiGanti(info.nama, this.opsi.ganti[info.nama], info.tipe)
        this.gantiDipakai.add(info.nama)
      } else {
        nilai = d.init ? this.nilaiUntuk(d.init, info.tipe) : undefined
      }
      const f = this.f
      f.lokal[info.slot] = nilai
      f.terdeklarasi.add(info.slot)
      f.tipeLokal.set(info.slot, info.tipe)
      this.emit({ k: 'deklarasi', frame: f.id, slot: info.slot, nama: info.nama, tipe: teksTipe(info.tipe), nilai })
    }
  }

  private perluGanti(nama: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.opsi.ganti, nama) && !this.gantiDipakai.has(nama)
  }

  /** Nilai dari opsi `ganti` dikonversi ke tipe variabel; ditolak bila tidak cocok. */
  private nilaiGanti(nama: string, mentah: number | boolean | string, tipe: Tipe): Nilai {
    const gagal = () => new GalatGanti(`Nilai ${JSON.stringify(mentah)} tidak cocok untuk variabel ${nama} bertipe ${teksTipe(tipe)}.`)
    const bulat = typeof mentah === 'number' && Number.isInteger(mentah)
    if (tipe.k === 'primitif') {
      switch (tipe.nama) {
        case 'boolean':
          if (typeof mentah !== 'boolean') throw gagal()
          return mentah
        case 'double':
        case 'float':
          if (typeof mentah !== 'number') throw gagal()
          return tipe.nama === 'float' ? Math.fround(mentah) : mentah
        case 'long':
          if (!bulat) throw gagal()
          return BigInt(mentah as number)
        case 'char':
          if (typeof mentah === 'string' && mentah.length === 1) return mentah.charCodeAt(0)
          if (bulat && (mentah as number) >= 0 && (mentah as number) <= 0xffff) return mentah as number
          throw gagal()
        default: {
          const batas = tipe.nama === 'byte' ? 0x7f : tipe.nama === 'short' ? 0x7fff : 0x7fffffff
          if (!bulat || (mentah as number) > batas || (mentah as number) < -batas - 1) throw gagal()
          return mentah as number
        }
      }
    }
    if (adalahString(tipe) && typeof mentah === 'string') return this.buatString(mentah)
    throw gagal()
  }

  private exec(p: A.Pernyataan): Selesai {
    switch (p.jenis) {
      case 'Blok':
        return this.execBlok(p)
      case 'Kosong':
        return undefined
      case 'DeklarasiLokal':
        this.mulaiBaris(p)
        this.deklarasi(p)
        this.catat(p.span, 'pernyataan')
        return undefined
      case 'PernyataanEkspresi':
        this.mulaiBaris(p)
        this.eval(p.ekspresi)
        this.catat(p.span, 'pernyataan')
        return undefined
      case 'If':
        return this.execIf(p)
      case 'While':
        return this.execWhile(p)
      case 'DoWhile':
        return this.execDoWhile(p)
      case 'For':
        return this.execFor(p)
      case 'ForEach':
        return this.execForEach(p)
      case 'Switch':
        return this.execSwitch(p)
      case 'Break':
      case 'Continue':
        this.mulaiBaris(p)
        this.emit({ k: 'lompat', jenis: p.jenis === 'Break' ? 'break' : 'continue' })
        this.catat(p.span, 'pernyataan')
        return { k: p.jenis === 'Break' ? 'break' : 'continue' }
      case 'Return':
        return this.execReturn(p)
      case 'Try':
        return this.execTry(p)
      case 'Throw':
        return this.execThrow(p)
    }
  }

  private execBlok(p: A.Blok): Selesai {
    const r = this.execBadan(p)
    this.hapusSlot(p.slotLokal)
    return r
  }

  private execIf(p: A.If): Selesai {
    this.mulaiBaris(p)
    const v = this.evalKondisi(p.kondisi, 'if', { adaLain: p.lain !== undefined })
    this.catat(p.kondisi.span, 'kondisi')
    if (v) return this.exec(p.maka)
    return p.lain ? this.exec(p.lain) : undefined
  }

  private execWhile(p: A.While): Selesai {
    for (let ke = 0; ; ke++) {
      this.mulaiBaris(p.kondisi)
      const v = this.evalKondisi(p.kondisi, 'while', { pertama: ke === 0 })
      this.catat(p.kondisi.span, 'kondisi')
      if (!v) return undefined
      const r = this.exec(p.badan)
      if (r?.k === 'break') return undefined
      if (r?.k === 'return') return r
    }
  }

  private execDoWhile(p: A.DoWhile): Selesai {
    for (;;) {
      const r = this.exec(p.badan)
      if (r?.k === 'break') return undefined
      if (r?.k === 'return') return r
      this.mulaiBaris(p.spanKondisi)
      const v = this.evalKondisi(p.kondisi, 'do-while')
      this.catat(p.spanKondisi, 'kondisi')
      if (!v) return undefined
    }
  }

  private execReturn(p: A.Return): Selesai {
    this.mulaiBaris(p)
    const f = this.f
    const nilai = p.ekspresi ? this.nilaiUntuk(p.ekspresi, f.kembali) : undefined
    f.barisReturn = this.baris(p.span)
    f.spanReturn = p.span
    return { k: 'return', nilai }
  }

  private execFor(p: A.For): Selesai {
    this.mulaiBaris(p)
    if (p.init.length) {
      for (const i of p.init) {
        if (i.jenis === 'DeklarasiLokal') this.deklarasi(i)
        else this.eval(i.ekspresi)
      }
      this.catat({ awal: p.init[0].span.awal, akhir: p.init[p.init.length - 1].span.akhir }, 'pernyataan')
    }
    let hasil: Selesai
    for (let ke = 0; ; ke++) {
      if (p.kondisi) {
        this.mulaiBaris(p.kondisi)
        const v = this.evalKondisi(p.kondisi, 'for', { pertama: ke === 0 })
        this.catat(p.kondisi.span, 'kondisi')
        if (!v) break
      }
      const r = this.exec(p.badan)
      if (r?.k === 'break') break
      if (r?.k === 'return') {
        hasil = r
        break
      }
      if (p.update.length) {
        this.mulaiBaris(p.update[0])
        for (const u of p.update) this.eval(u)
        this.catat({ awal: p.update[0].span.awal, akhir: p.update[p.update.length - 1].span.akhir }, 'pernyataan')
      }
    }
    this.hapusSlot(p.slotLokal)
    return hasil
  }

  /** Isi variabel for-each untuk satu putaran (deklarasi pertama kali, tulis sesudahnya). */
  private isiVariabelForEach(info: A.InfoLokal, v: Nilai): void {
    const f = this.f
    if (!f.terdeklarasi.has(info.slot)) {
      f.terdeklarasi.add(info.slot)
      f.tipeLokal.set(info.slot, info.tipe)
      f.lokal[info.slot] = v
      this.emit({ k: 'deklarasi', frame: f.id, slot: info.slot, nama: info.nama, tipe: teksTipe(info.tipe), nilai: v })
    } else {
      const lama = f.lokal[info.slot]
      f.lokal[info.slot] = v
      this.emit({ k: 'tulis', frame: f.id, slot: info.slot, nama: info.nama, tipe: teksTipe(info.tipe), lama, baru: v })
    }
  }

  private execForEach(p: A.ForEach): Selesai {
    this.mulaiBaris(p)
    const ref = this.eval(p.iterable)
    const tIter = p.iterable.tipe!
    const info = p.info!
    const spanKepala = { awal: p.span.awal, akhir: p.iterable.span.akhir }
    let hasil: Selesai
    if (tIter.k === 'array') {
      if (ref === null) throw new LemparanJava('java.lang.NullPointerException', pesanNpe('Cannot read the array length', asalNull(p.iterable, this.biner)))
      const arr = this.heapArray(ref as number)
      const tipeElemen = p.tipeElemen ?? tIter.elemen
      for (let k = 0; k < arr.nilai.length; k++) {
        this.mulaiBaris(p)
        this.emit({ k: 'baca-elemen', id: ref as number, indeks: k })
        this.isiVariabelForEach(info, this.konversiNilai(arr.nilai[k], tipeElemen, info.tipe, `"${this.src(p.iterable)}[${k}]"`))
        this.catat(spanKepala, 'pernyataan')
        const r = this.exec(p.badan)
        if (r?.k === 'break') break
        if (r?.k === 'return') {
          hasil = r
          break
        }
      }
    } else {
      // Iterable: seperti javac, `for (T x : c)` menjadi iterator() → hasNext() → next().
      if (ref === null) throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot invoke "${namaTipeJvm(tIter, this.biner)}.iterator()"`, asalNull(p.iterable, this.biner)))
      const it = this.panggilInstanceKoleksi(ref as number, 'iterator', [])
      const tipeElemen = p.tipeElemen ?? T.Object
      for (;;) {
        this.mulaiBaris(p)
        if (!this.panggilInstanceKoleksi(it as number, 'hasNext', [])) break
        const x = this.panggilInstanceKoleksi(it as number, 'next', [])
        this.isiVariabelForEach(info, this.konversiNilai(x, tipeElemen, info.tipe, 'the return value of "java.util.Iterator.next()"'))
        this.catat(spanKepala, 'pernyataan')
        const r = this.exec(p.badan)
        if (r?.k === 'break') break
        if (r?.k === 'return') {
          hasil = r
          break
        }
      }
    }
    this.hapusSlot([info.slot])
    return hasil
  }

  private panggilInstanceKoleksi(id: number, nama: string, arg: Nilai[]): Nilai {
    const r = panggilKoleksi(this.ctx2, id, nama, [], arg)
    if (r === TIDAK_ADA) throw new LemparanJava('java.lang.UnsupportedOperationException', `[Simulator] ${this.kelasJvm(id)}.${nama}() belum didukung`)
    return r
  }

  private execSwitch(p: A.Switch): Selesai {
    this.mulaiBaris(p)
    const t0 = p.selektor.tipe!
    const v0 = this.eval(p.selektor)
    const string = adalahString(t0)
    if (string && v0 === null) {
      throw new LemparanJava('java.lang.NullPointerException', pesanNpe('Cannot invoke "String.hashCode()"', asalNull(p.selektor, this.biner)))
    }
    // Selektor wrapper (Integer, Character, …) di-unbox dulu.
    const tp = tipeUnboks(t0)
    const t = tp ?? t0
    const v = tp ? this.konversiNilai(v0, t0, tp, p.selektor) : v0
    const kunci = string ? this.teks(v) : v
    let mulai = -1
    let label = 'default'
    let indeksDefault = -1
    p.grup.forEach((g, gi) => {
      for (const l of g.label) {
        if (l === 'default') {
          indeksDefault = gi
          continue
        }
        if (mulai >= 0) continue
        const kv = string ? l.konstan : konversiKonstan(l.konstan!, l.tipe!, t)
        if (kv === kunci) {
          mulai = gi
          label = this.src(l)
        }
      }
    })
    if (mulai < 0) mulai = indeksDefault
    this.emit({
      k: 'evaluasi',
      konteks: 'switch',
      teks: this.src(p.selektor),
      pohon: { k: 'daun', teks: this.src(p.selektor), nilai: this.tampil(v, t) },
      hasil: this.tampil(v, t),
    })
    this.emit({ k: 'cocok-case', label: mulai < 0 ? '' : label === 'default' ? 'default' : `case ${label}` })
    this.catat(p.selektor.span, 'kondisi', this.baris(p.span))
    let r: Selesai
    if (mulai >= 0) {
      const akhir = p.panah ? mulai + 1 : p.grup.length
      luar: for (let gi = mulai; gi < akhir; gi++) {
        for (const s of p.grup[gi].pernyataan) {
          r = this.exec(s)
          if (r) break luar
        }
      }
    }
    this.hapusSlot(p.slotLokal)
    return r?.k === 'break' ? undefined : r
  }

  private execThrow(p: A.Throw): Selesai {
    this.mulaiBaris(p)
    const v = this.eval(p.ekspresi)
    if (v === null) throw new LemparanJava('java.lang.NullPointerException', pesanNpe('Cannot throw exception', asalNull(p.ekspresi, this.biner)))
    const o = this.objek(v as number)
    const pesan = this.pesanException(v as number)
    this.emit({ k: 'lempar', kelas: o.kelas, pesan, id: v as number })
    this.catat(p.span, 'pernyataan')
    throw new LemparanJava(o.kelas, pesan, v as number, o.jejak ? [...o.jejak] : undefined)
  }

  /** Objek exception untuk exception dari mesin/pustaka saat ditangkap (sebelumnya belum ada di heap). */
  private materialisasiException(e: LemparanJava): number {
    if (e.objek !== undefined) return e.objek
    const pesan = e.pesanJava === null ? null : this.buatString(e.pesanJava)
    const id = this.alokasi({ k: 'objek', kelas: e.kelas, field: { detailMessage: pesan }, tipeField: { detailMessage: 'String' }, jejak: e.jejak ?? this.jejakSekarang() })
    e.objek = id
    return id
  }

  private execTry(p: A.Try): Selesai {
    const f = this.f
    const aktif: TryAktif = { frame: f.id, tangkap: p.tangkap, adaFinally: p.akhirnya !== undefined }
    this.tryAktif.push(aktif)
    let hasil: Selesai
    let tertunda: LemparanJava | undefined
    let diTry = true
    try {
      hasil = this.execBlok(p.blok)
    } catch (e) {
      if (!(e instanceof LemparanJava)) throw e
      diTry = false
      // Catch hanya berlaku untuk exception dari blok try; exception dari blok catch langsung ke finally.
      const i = this.tryAktif.lastIndexOf(aktif)
      if (i >= 0) this.tryAktif.splice(i, 1)
      if (!e.jejak) e.jejak = this.jejakSekarang()
      const rantai = this.rantaiException(e)
      const c = p.tangkap.find((x) => this.cocokCatch(x, rantai))
      if (!c) tertunda = e
      else {
        const sudahAdaObjek = e.objek !== undefined
        const id = this.materialisasiException(e)
        if (!sudahAdaObjek) this.emit({ k: 'lempar', kelas: e.kelas, pesan: e.pesanJava, id })
        this.mulaiBaris(c)
        const info = c.info!
        f.lokal[info.slot] = id
        f.terdeklarasi.add(info.slot)
        f.tipeLokal.set(info.slot, info.tipe)
        this.emit({ k: 'deklarasi', frame: f.id, slot: info.slot, nama: info.nama, tipe: teksTipe(info.tipe), nilai: id })
        this.emit({ k: 'tangkap', kelas: e.kelas, tipe: c.tipe.map((t) => this.sumber.potong(t.span)).join(' | '), variabel: c.nama, id })
        this.catat({ awal: c.span.awal, akhir: c.badan.span.awal }, 'pernyataan')
        // Selama blok catch berjalan, finally milik try ini tetap menunggu (exception dari sini merambat lewat finally).
        const sisaFinally: TryAktif | undefined = p.akhirnya ? { frame: f.id, tangkap: [], adaFinally: true } : undefined
        if (sisaFinally) this.tryAktif.push(sisaFinally)
        try {
          hasil = this.execBlok(c.badan)
        } catch (e2) {
          if (!(e2 instanceof LemparanJava) || !p.akhirnya) throw e2
          tertunda = e2
        } finally {
          if (sisaFinally) this.tryAktif.splice(this.tryAktif.lastIndexOf(sisaFinally), 1)
          if (this.f === f) this.hapusSlot([info.slot])
        }
      }
    } finally {
      if (diTry) {
        const i = this.tryAktif.lastIndexOf(aktif)
        if (i >= 0) this.tryAktif.splice(i, 1)
      }
    }
    if (p.akhirnya) {
      this.emit({ k: 'finally', sebab: tertunda ? 'exception' : hasil?.k ?? 'normal' })
      const r = this.execBlok(p.akhirnya)
      // return/break/continue di finally menimpa hasil try/catch dan menelan exception.
      if (r) return r
    }
    if (tertunda) throw tertunda
    return hasil
  }

  // ---------- konversi ----------
  /**
   * Konversi nilai dari tipe statis `dari` ke `ke` (assignment, argumen, return, operand): primitif, boxing
   * (dengan cache JDK) dan unboxing (helpful NPE bila null). `asal` = ekspresi sumber, atau klausa asal NPE
   * yang sudah jadi (mis. `the return value of "java.util.Iterator.next()"`).
   */
  private konversiNilai(v: Nilai, dari: Tipe, ke: Tipe, asal?: A.Ekspresi | string): Nilai {
    if (dari.k === 'primitif' && ke.k === 'primitif') return dari.nama === ke.nama ? v : konversiPrimitif(v, dari.nama, ke.nama)
    if (dari.k === 'primitif') {
      if (!adalahReferensiRuntime(ke)) return v
      // Boxing ke wrapper tujuan bila tujuannya wrapper (Character c = 65), selain itu ke wrapper tipe asal (Object o = 5).
      const tujuan = tipeUnboks(ke)
      const kelas = tujuan ? (ke as { nama: string }).nama : PEMBUNGKUS[dari.nama]
      const p = tujuan?.nama ?? dari.nama
      return this.boks(kelas, p === dari.nama ? v : konversiPrimitif(v, dari.nama, p))
    }
    if (ke.k === 'primitif') {
      if (v === null) {
        const pembungkus = tipeUnboks(dari) ? (dari as { nama: string }).nama : PEMBUNGKUS[ke.nama]
        const asalTeks = asal === undefined ? null : typeof asal === 'string' ? asal : asalNull(asal, this.biner)
        throw new LemparanJava('java.lang.NullPointerException', pesanNpe(aksiUnboxing(pembungkus), asalTeks))
      }
      const o = this.state.heap[v as number]
      if (o?.k !== 'boks') return v
      const p = PRIMITIF_WRAPPER[o.kelas] ?? 'int'
      this.emit({ k: 'boxing', arah: 'unbox', kelas: o.kelas, nilai: primitifKeString(o.nilai, p), id: v as number })
      return p === ke.nama ? o.nilai : konversiPrimitif(o.nilai, p, ke.nama)
    }
    return v
  }

  private keBoolean(v: Nilai, e: A.Ekspresi): boolean {
    return (e.tipe && e.tipe.k !== 'primitif' ? this.konversiNilai(v, e.tipe, T.boolean, e) : v) as boolean
  }

  /** Evaluasi lalu konversi ke tipe tujuan (konteks assignment/argumen/return). */
  private nilaiUntuk(e: A.Ekspresi, ke: Tipe): Nilai {
    if (e.jenis === 'InisialisasiArray') return this.buatDariInit(e, ke)
    const v = this.eval(e)
    return this.konversiNilai(v, e.tipe!, ke, e)
  }

  private buatDariInit(init: A.InisialisasiArray, tipe: Tipe): number {
    const elemen = (tipe as { elemen: Tipe }).elemen
    const isi = init.elemen.map((x) => this.nilaiUntuk(x, elemen))
    return this.buatArray(elemen, isi)
  }

  private indeks(e: A.Ekspresi): number {
    return this.konversiNilai(this.eval(e), e.tipe!, T.int, e) as number
  }

  /** Ekspresi yang hanya berupa nama class (kualifier), bukan nilai. */
  private adalahKualifierKelas(e: A.Ekspresi): boolean {
    return (e.jenis === 'Nama' || e.jenis === 'AksesField') && e.ikatan?.k === 'kelas'
  }

  // Catatan: `eval` dan `exec` sengaja dibuat sebagai dispatcher ramping. Rekursi Java dijalankan lewat
  // rekursi JavaScript, sehingga frame yang besar (switch raksasa dengan banyak variabel lokal) cepat
  // menghabiskan stack worker browser. Isi tiap kasus dipindah ke method tersendiri.
  eval(e: A.Ekspresi): Nilai {
    if (e.konstan !== undefined) {
      if (e.tipe!.k === 'primitif') return e.konstan as Nilai
      if (adalahString(e.tipe!)) return this.internString(e.konstan as string)
    }
    switch (e.jenis) {
      case 'Literal':
        return e.jenisLiteral === 'string' ? this.internString(e.nilai as string) : ((e.nilai ?? null) as Nilai)
      case 'Nama':
        return this.evalNama(e)
      case 'AksesField':
        return this.evalAksesField(e)
      case 'AksesArray':
        return this.evalAksesArray(e)
      case 'PanggilMethod':
        return this.panggil(e)
      case 'BaruArray':
        return this.evalBaruArray(e)
      case 'BaruObjek':
        return this.evalBaruObjek(e)
      case 'InisialisasiArray':
        return this.buatDariInit(e, e.tipe!)
      case 'Unary':
        return this.evalUnary(e)
      case 'IncDec':
        return this.evalIncDec(e)
      case 'Biner':
        return this.evalBiner(e)
      case 'Assign':
        return this.assign(e)
      case 'Kondisional':
        return this.nilaiUntuk(this.evalKondisi(e.kondisi, 'ternary') ? e.ya : e.tidak, e.tipe!)
      case 'Cast':
        return this.evalCast(e)
      case 'This':
        return this.objekLuar(e.luar ?? 0)
      case 'Lambda':
        return this.evalLambda(e)
      case 'PanggilKonstruktor':
        return this.evalPanggilKonstruktor(e)
    }
  }

  private evalNama(e: A.Nama): Nilai {
    const ik = e.ikatan!
    if (ik.k === 'lokal') {
      const f = this.f
      this.emit({ k: 'baca', frame: f.id, slot: ik.info.slot, nama: ik.info.nama })
      return f.lokal[ik.info.slot] ?? nilaiDefault(ik.info.tipe)
    }
    if (ik.k === 'field') {
      if (ik.field.statik) return this.bacaStatik(ik.field)
      return this.bacaFieldObjek(this.objekLuar(ik.luar ?? 0) as number, e.nama)
    }
    return null
  }

  private evalAksesField(e: A.AksesField): Nilai {
    const ik = e.ikatan!
    if (ik.k === 'panjang-array') {
      const ref = this.eval(e.objek)
      if (ref === null) throw new LemparanJava('java.lang.NullPointerException', pesanNpe('Cannot read the array length', asalNull(e.objek, this.biner)))
      return this.heapArray(ref as number).nilai.length
    }
    if (ik.k === 'field-pustaka') {
      if (ik.id === 'System.out') return REF_OUT
      if (ik.id === 'System.err') return REF_ERR
      if (ik.id === 'System.in') return REF_IN
      // Boolean.TRUE/FALSE: objek cache yang sama dengan hasil autoboxing (Boolean.valueOf).
      if (ik.id === 'Boolean.TRUE' || ik.id === 'Boolean.FALSE') return this.boksan.boks('Boolean', ik.id === 'Boolean.TRUE').id
      return null
    }
    if (ik.k === 'field') {
      if (ik.field.statik) {
        // Seperti javac: kualifier berupa ekspresi tetap dievaluasi lalu hasilnya diabaikan.
        if (!this.adalahKualifierKelas(e.objek)) this.eval(e.objek)
        return this.bacaStatik(ik.field)
      }
      const ref = this.eval(e.objek)
      if (ref === null) throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot read field "${e.nama}"`, asalNull(e.objek, this.biner)))
      return this.bacaFieldObjek(ref as number, e.nama)
    }
    return null
  }

  private evalAksesArray(e: A.AksesArray): Nilai {
    const ref = this.eval(e.array)
    const i = this.indeks(e.indeks)
    const elemen = (e.array.tipe as { elemen: Tipe }).elemen
    if (ref === null) {
      throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot load from ${jenisArrayNpe(elemen)} array`, asalNull(e.array, this.biner)))
    }
    const arr = this.heapArray(ref as number)
    if (i < 0 || i >= arr.nilai.length) {
      throw new LemparanJava('java.lang.ArrayIndexOutOfBoundsException', `Index ${i} out of bounds for length ${arr.nilai.length}`)
    }
    this.emit({ k: 'baca-elemen', id: ref as number, indeks: i })
    return arr.nilai[i]
  }

  private evalBaruArray(e: A.BaruArray): Nilai {
    const tipe = e.tipe!
    if (e.init) return this.buatDariInit(e.init, tipe)
    const dim: number[] = []
    for (const d of e.dimensi) dim.push(this.indeks(d))
    for (const d of dim) if (d < 0) throw new LemparanJava('java.lang.NegativeArraySizeException', String(d))
    return this.arrayBertingkat(tipe, dim, 0)
  }

  private evalBaruObjek(e: A.BaruObjek): Nilai {
    const t = e.target!
    if (t.k === 'user') {
      const info = t.kelas
      this.pastikanInit(info.nama)
      const k = t.konstruktor
      const luar = !info.statik && info.luar ? this.objekLuar(t.luar ?? 0) : null
      const arg = this.argumenUser(e.argumen, k?.parameter ?? [], !!(k?.varargs && e.pakaiVarargs))
      // Stack trace exception direkam saat objeknya dibuat (Throwable.fillInStackTrace), tanpa frame <init>.
      const id = this.buatObjek(info, luar, info.exception ? this.jejakSekarang() : undefined)
      this.jalankanKonstruktor(info, k, id, arg)
      return id
    }
    const { kelas } = uraiId(t.id)
    const { nilai, tipe } = this.argumenPustaka(e.argumen, t.parameter, !!e.pakaiVarargs, t.id)
    if (adalahExceptionBawaan(kelas)) {
      const pesan = t.parameter.length > 0 && t.parameter[0].k === 'kelas' && t.parameter[0].nama === 'String' ? nilai[0] : null
      return this.alokasi({
        k: 'objek',
        kelas: namaLengkapPustaka(kelas) ?? kelas,
        field: { detailMessage: pesan },
        tipeField: { detailMessage: 'String' },
        jejak: this.jejakSekarang(),
      })
    }
    const baru = konstruktorFase2(this.ctx2, kelas, nilai, t.parameter)
    if (baru !== undefined) return baru
    return this.panggilFase1(t.id, null, nilai, tipe, t.parameter)
  }

  private evalUnary(e: A.Unary): Nilai {
    const v = this.eval(e.operand)
    if (e.op === '!') return !this.keBoolean(v, e.operand)
    const ta = e.operand.tipe!
    const p = promosiUnary(tipeUnboks(ta) ?? ta) as { k: 'primitif'; nama: NamaPrimitif }
    const pv = this.konversiNilai(v, ta, p, e.operand)
    if (e.op === '+') return pv
    if (e.op === '-') {
      const hasil = negasi(pv, p.nama)
      if ((p.nama === 'int' || p.nama === 'long') && hasil === pv && pv !== 0 && pv !== 0n) {
        this.emit({ k: 'aritmetika', jenis: 'overflow', teks: `-(${this.tampil(pv, p)})`, hasil: this.tampil(hasil, p), tepat: `${String(pv).startsWith('-') ? String(pv).slice(1) : '-' + String(pv)}`, tipe: p.nama })
      }
      return hasil
    }
    return bitNot(pv, p.nama)
  }

  private evalIncDec(e: A.IncDec): Nilai {
    const lv = this.lvalue(e.target)
    lv.cek()
    const lama = lv.baca()
    // Wrapper (Integer x; x++): unboxing, tambah, lalu boxing lagi.
    const tp = tipeUnboks(lv.tipe)
    const tipeP = tp ?? (lv.tipe as { k: 'primitif'; nama: NamaPrimitif })
    const tn = tipeP.nama
    const lamaP = tp ? this.konversiNilai(lama, lv.tipe, tp, e.target) : lama
    const baruP = tambahSatu(lamaP, tn, e.op === '++' ? 1 : -1)
    if ((tn === 'int' || tn === 'long') && (e.op === '++' ? (baruP as number) < (lamaP as number) : (baruP as number) > (lamaP as number))) {
      const tepat = typeof lamaP === 'bigint' ? (lamaP + (e.op === '++' ? 1n : -1n)).toString() : String((lamaP as number) + (e.op === '++' ? 1 : -1))
      this.emit({ k: 'aritmetika', jenis: 'overflow', teks: `${this.tampil(lamaP, tipeP)} ${e.op === '++' ? '+' : '-'} 1`, hasil: this.tampil(baruP, tipeP), tepat, tipe: tn })
    }
    const baru = tp ? this.konversiNilai(baruP, tp, lv.tipe) : baruP
    lv.tulis(baru, e.op)
    return e.prefix ? baru : lama
  }

  private evalBiner(e: A.Biner): Nilai {
    if (e.op === '&&') return this.keBoolean(this.eval(e.kiri), e.kiri) ? this.keBoolean(this.eval(e.kanan), e.kanan) : false
    if (e.op === '||') return this.keBoolean(this.eval(e.kiri), e.kiri) ? true : this.keBoolean(this.eval(e.kanan), e.kanan)
    const a = this.eval(e.kiri)
    const b = this.eval(e.kanan)
    return this.hitungBiner(e.op, a, e.kiri.tipe!, b, e.kanan.tipe!, e.tipeOperasi!, e.kiri, e.kanan)
  }

  private evalCast(e: A.Cast): Nilai {
    const t = e.tipe!
    const v = this.eval(e.ekspresi)
    const dari = e.ekspresi.tipe!
    if (dari.k === 'primitif' && t.k === 'primitif') {
      const hasil = konversiPrimitif(v, dari.nama, t.nama)
      if (dari.nama !== t.nama) {
        this.emit({ k: 'cast', dari: dari.nama, ke: t.nama, sebelum: this.tampil(v, dari), sesudah: this.tampil(hasil, t) })
      }
      return hasil
    }
    if (dari.k === 'primitif') return this.konversiNilai(v, dari, t, e.ekspresi)
    if (t.k === 'primitif') {
      // `(int) obj`: checkcast ke Integer lalu unboxing; `(int) integerObj`: unboxing saja.
      if (v !== null && !tipeUnboks(dari)) {
        const w: Tipe = { k: 'kelas', nama: PEMBUNGKUS[t.nama] }
        if (!this.instanceOf(v, w)) throw new LemparanJava('java.lang.ClassCastException', pesanClassCast(this.kelasJvm(v), `java.lang.${PEMBUNGKUS[t.nama]}`))
        return this.konversiNilai(v, w, t, e.ekspresi)
      }
      return this.konversiNilai(v, dari, t, e.ekspresi)
    }
    if (v !== null && !this.instanceOf(v, t)) {
      throw new LemparanJava('java.lang.ClassCastException', pesanClassCast(this.kelasJvm(v), this.namaJvmTipe(t)))
    }
    return v
  }

  private arrayBertingkat(tipe: Tipe, dim: number[], level: number): number {
    const elemen = (tipe as { elemen: Tipe }).elemen
    const n = dim[level]
    if (level === dim.length - 1) return this.buatArray(elemen, new Array(n).fill(nilaiDefault(elemen)))
    const isi: Nilai[] = []
    for (let i = 0; i < n; i++) isi.push(this.arrayBertingkat(elemen, dim, level + 1))
    return this.buatArray(elemen, isi)
  }

  private hitungBiner(op: A.OpBiner, a: Nilai, ta: Tipe, b: Nilai, tb: Tipe, tipeOp: Tipe, ea?: A.Ekspresi, eb?: A.Ekspresi): Nilai {
    if (adalahString(tipeOp) && op === '+') return this.buatString(this.keString(a, ta) + this.keString(b, tb))
    if (op === '==' || op === '!=') {
      if (tipeOp.k === 'primitif') {
        const pa = this.konversiNilai(a, ta, tipeOp, ea)
        const pb = this.konversiNilai(b, tb, tipeOp, eb)
        return bandingkan(op, pa, pb)
      }
      return op === '==' ? a === b : a !== b
    }
    const p = tipeOp as { k: 'primitif'; nama: NamaPrimitif }
    if (op === '<<' || op === '>>' || op === '>>>') {
      const pa = this.konversiNilai(a, ta, p, ea)
      const tbp = tipeUnboks(tb) ?? tb
      const pb = this.konversiNilai(b, tb, promosiUnary(tbp), eb)
      return geser(op as OpGeser, pa, pb, p.nama)
    }
    const pa = this.konversiNilai(a, ta, p, ea)
    const pb = this.konversiNilai(b, tb, p, eb)
    if (op === '<' || op === '>' || op === '<=' || op === '>=') return bandingkan(op as OpBanding, pa, pb)
    if (op === '&' || op === '|' || op === '^') return operasiBit(op as OpBit, pa, pb, p.nama)
    const h = aritmetika(op as OpAritmetika, pa, pb, p.nama)
    if (this.opsi.modeHitung) return h.nilai
    const teks = () => `${this.tampil(pa, p)} ${op} ${this.tampil(pb, p)}`
    if (h.overflow) this.emit({ k: 'aritmetika', jenis: 'overflow', teks: teks(), hasil: this.tampil(h.nilai, p), tepat: h.overflow, tipe: p.nama })
    else if (op === '/' && adalahIntegral(p) && (typeof pa === 'bigint' ? (pa as bigint) % (pb as bigint) !== 0n : (pa as number) % (pb as number) !== 0)) {
      this.emit({ k: 'aritmetika', jenis: 'bagi-bulat', teks: teks(), hasil: this.tampil(h.nilai, p), tipe: p.nama })
    } else if (op === '%' && adalahIntegral(p)) {
      this.emit({ k: 'aritmetika', jenis: 'sisa', teks: teks(), hasil: this.tampil(h.nilai, p), tipe: p.nama })
    } else if (op === '/' && !adalahIntegral(p) && pb === 0) {
      this.emit({ k: 'aritmetika', jenis: 'bagi-nol-pecahan', teks: teks(), hasil: this.tampil(h.nilai, p), tipe: p.nama })
    }
    return h.nilai
  }

  private lvalue(e: A.Ekspresi): LValue {
    if (e.jenis === 'Nama' && e.ikatan?.k === 'lokal') {
      const info = e.ikatan.info
      const f = this.f
      return {
        tipe: info.tipe,
        cek: () => {},
        baca: () => {
          this.emit({ k: 'baca', frame: f.id, slot: info.slot, nama: info.nama })
          return f.lokal[info.slot] ?? nilaiDefault(info.tipe)
        },
        tulis: (v, op, operand) => {
          const lama = f.lokal[info.slot]
          f.lokal[info.slot] = v
          this.emit({ k: 'tulis', frame: f.id, slot: info.slot, nama: info.nama, tipe: teksTipe(info.tipe), lama, baru: v, op, operand })
        },
      }
    }
    if ((e.jenis === 'Nama' || e.jenis === 'AksesField') && e.ikatan?.k === 'field') {
      const fld = e.ikatan.field
      if (fld.statik) {
        if (e.jenis === 'AksesField' && !this.adalahKualifierKelas(e.objek)) this.eval(e.objek)
        return {
          tipe: fld.tipe,
          cek: () => {},
          baca: () => this.bacaStatik(fld),
          tulis: (v, op, operand) => this.tulisStatik(fld, v, op, operand),
        }
      }
      const ref = e.jenis === 'Nama' ? this.objekLuar(e.ikatan.luar ?? 0) : this.eval(e.objek)
      const cek = (tulis: boolean) => {
        if (ref === null) {
          const asal = e.jenis === 'AksesField' ? asalNull(e.objek, this.biner) : null
          throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot ${tulis ? 'assign' : 'read'} field "${e.jenis === 'AksesField' ? e.nama : e.nama}"`, asal))
        }
      }
      return {
        tipe: fld.tipe,
        cek: () => cek(false),
        baca: () => {
          cek(false)
          return this.bacaFieldObjek(ref as number, fld.nama)
        },
        tulis: (v, op, operand) => {
          cek(true)
          this.tulisFieldObjek(ref as number, fld.nama, fld.tipe, v, op, operand)
        },
      }
    }
    if (e.jenis === 'AksesArray') {
      const ref = this.eval(e.array)
      const i = this.indeks(e.indeks)
      const tipe = (e.array.tipe as { elemen: Tipe }).elemen
      const cek = (simpan: boolean) => {
        if (ref === null) {
          throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot ${simpan ? 'store to' : 'load from'} ${jenisArrayNpe(tipe)} array`, asalNull(e.array, this.biner)))
        }
        const arr = this.heapArray(ref as number)
        if (i < 0 || i >= arr.nilai.length) {
          throw new LemparanJava('java.lang.ArrayIndexOutOfBoundsException', `Index ${i} out of bounds for length ${arr.nilai.length}`)
        }
        return arr
      }
      return {
        tipe,
        cek: () => void cek(false),
        baca: () => {
          const arr = cek(false)
          this.emit({ k: 'baca-elemen', id: ref as number, indeks: i })
          return arr.nilai[i]
        },
        tulis: (v, op, operand) => {
          const arr = cek(true)
          this.emit({ k: 'tulis-elemen', id: ref as number, indeks: i, tipe: teksTipe(tipe), lama: arr.nilai[i], baru: v, op, operand })
        },
      }
    }
    throw new Error('Target assignment tidak valid')
  }

  private assign(e: A.Assign): Nilai {
    const lv = this.lvalue(e.target)
    if (e.op === '=') {
      const v = this.nilaiUntuk(e.nilai, lv.tipe)
      lv.tulis(v, '=')
      return v
    }
    lv.cek()
    const lama = lv.baca()
    const kanan = this.eval(e.nilai)
    const op = e.op.slice(0, -1) as A.OpBiner
    const tipeOp = e.tipeOperasi!
    let hasil: Nilai
    if (adalahString(tipeOp)) hasil = this.buatString(this.keString(lama, lv.tipe) + this.keString(kanan, e.nilai.tipe!))
    else hasil = this.konversiNilai(this.hitungBiner(op, lama, lv.tipe, kanan, e.nilai.tipe!, tipeOp, e.target, e.nilai), tipeOp, lv.tipe)
    if (!adalahString(tipeOp) && lv.tipe.k === 'primitif' && !samaTipe(tipeOp, lv.tipe)) {
      const sebelum = this.hitungTanpaPeristiwa(op, lama, lv.tipe, kanan, e.nilai.tipe!, tipeOp)
      if (sebelum !== undefined && !Object.is(sebelum, hasil) && !(typeof sebelum === 'bigint' && BigInt(hasil as number) === sebelum)) {
        this.emit({ k: 'cast', dari: teksTipe(tipeOp), ke: teksTipe(lv.tipe), sebelum: this.tampil(sebelum, tipeOp), sesudah: this.tampil(hasil, lv.tipe) })
      }
    }
    lv.tulis(hasil, e.op, this.tampil(kanan, e.nilai.tipe!))
    return hasil
  }

  private hitungTanpaPeristiwa(op: A.OpBiner, a: Nilai, ta: Tipe, b: Nilai, tb: Tipe, tipeOp: Tipe): Nilai | undefined {
    const simpan = this.pending.length
    try {
      return this.hitungBiner(op, a, ta, b, tb, tipeOp)
    } catch {
      return undefined
    } finally {
      this.pending.length = simpan
    }
  }

  // ---------- pemanggilan ----------
  private argumenUser(argumen: A.Ekspresi[], parameter: Tipe[], varargs: boolean): Nilai[] {
    const hasil: Nilai[] = []
    if (!varargs) {
      for (let i = 0; i < argumen.length; i++) hasil.push(this.nilaiUntuk(argumen[i], parameter[i]))
      return hasil
    }
    const n = parameter.length
    for (let i = 0; i < n - 1; i++) hasil.push(this.nilaiUntuk(argumen[i], parameter[i]))
    const elemen = (parameter[n - 1] as { elemen: Tipe }).elemen
    const sisa: Nilai[] = []
    for (let i = n - 1; i < argumen.length; i++) sisa.push(this.nilaiUntuk(argumen[i], elemen))
    hasil.push(this.buatArray(elemen, sisa))
    return hasil
  }

  /**
   * Argumen method pustaka. Untuk metode cetak/format Fase 1 (PrintStream.*, String.format, String.join),
   * argumen bertipe Object/varargs diteruskan apa adanya beserta tipe statisnya (formatter memerlukannya).
   * Metode lain mendapat konversi penuh (boxing), dan varargs-nya dikemas menjadi array seperti javac.
   */
  private argumenPustaka(argumen: A.Ekspresi[], parameter: Tipe[], varargs: boolean, id: string): { nilai: Nilai[]; tipe: Tipe[] } {
    const nilai: Nilai[] = []
    const tipe: Tipe[] = []
    const mentah = id.startsWith('PrintStream.') || id.startsWith('String.format(') || id.startsWith('String.join(')
    if (varargs && !mentah) {
      const n = parameter.length
      for (let i = 0; i < n - 1; i++) {
        nilai.push(this.nilaiUntuk(argumen[i], parameter[i]))
        tipe.push(parameter[i])
      }
      const elemen = (parameter[n - 1] as { elemen: Tipe }).elemen
      const sisa: Nilai[] = []
      for (let i = n - 1; i < argumen.length; i++) sisa.push(this.nilaiUntuk(argumen[i], elemen))
      nilai.push(this.buatArray(elemen, sisa))
      tipe.push(parameter[n - 1])
      return { nilai, tipe }
    }
    for (let i = 0; i < argumen.length; i++) {
      const a = argumen[i]
      const tujuan = varargs && i >= parameter.length - 1 ? undefined : parameter[i]
      const keObject = tujuan?.k === 'kelas' && tujuan.nama === 'Object'
      if (tujuan && !(mentah && keObject)) {
        nilai.push(this.nilaiUntuk(a, tujuan))
        // Parameter Object menerima referensi apa adanya: implementasi Fase 1 memakai tipe statis argumennya
        // (mis. String.valueOf(Object) mengembalikan String yang sama).
        tipe.push(keObject && a.tipe && a.tipe.k !== 'primitif' ? a.tipe : tujuan)
      } else {
        const v = this.eval(a)
        // printf/format: wrapper diperlakukan sebagai nilai primitifnya (%d untuk Integer, %.2f untuk Double).
        const o = a.tipe && a.tipe.k !== 'primitif' && typeof v === 'number' && v > 0 ? this.state.heap[v] : undefined
        if (o?.k === 'boks') {
          nilai.push(o.nilai)
          tipe.push({ k: 'primitif', nama: PRIMITIF_WRAPPER[o.kelas] ?? 'int' })
        } else {
          nilai.push(v)
          tipe.push(a.tipe!)
        }
      }
    }
    return { nilai, tipe }
  }

  private panggil(e: A.PanggilMethod): Nilai {
    const t = e.target!
    if (t.k === 'user') return this.panggilMethodUser(e, t)
    let objek: Nilai = null
    if (!t.statik) objek = e.objek ? this.eval(e.objek) : this.f.ini
    const { nilai, tipe } = this.argumenPustaka(e.argumen, t.parameter, !!e.pakaiVarargs, t.id)
    // Seperti JVM: penerima null baru terdeteksi saat invoke, setelah argumen dievaluasi.
    if (!t.statik && objek === null) {
      throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot invoke "${t.jvm ?? t.id}"`, e.objek ? asalNull(e.objek, this.biner) : null))
    }
    return this.panggilPustaka(t, objek, nilai, tipe)
  }

  private panggilMethodUser(e: A.PanggilMethod, t: Extract<A.TargetPanggil, { k: 'user' }>): Nilai {
    const m = t.method
    if (m.statik) {
      if (e.objek && !this.adalahKualifierKelas(e.objek)) this.eval(e.objek)
      const arg = this.argumenUser(e.argumen, m.parameter, !!(m.varargs && e.pakaiVarargs))
      return this.panggilUser(m, arg, null) ?? null
    }
    const ini = e.objek ? this.eval(e.objek) : this.objekLuar(t.luar ?? 0)
    const arg = this.argumenUser(e.argumen, m.parameter, !!(m.varargs && e.pakaiVarargs))
    if (ini === null) {
      throw new LemparanJava('java.lang.NullPointerException', pesanNpe(`Cannot invoke "${deskripsiMethodUser(m, this.biner)}"`, e.objek ? asalNull(e.objek, this.biner) : null))
    }
    const info = this.infoObjek(ini)
    const target = info && info.nama !== m.kelas ? (this.cariOverride(info, m) ?? m) : m
    return this.panggilUser(target, arg, ini as number) ?? null
  }

  /** Override `m` di class objek (hanya mungkin pada hierarki exception buatan sendiri). */
  private cariOverride(info: A.InfoKelas, m: A.SimbolMethod): A.SimbolMethod | undefined {
    for (let k: A.InfoKelas | undefined = info; k && k.nama !== m.kelas; k = this.induk(k)) {
      const x = k.method.get(m.nama)?.find((c) => !c.statik && c.parameter.length === m.parameter.length && c.parameter.every((p, i) => samaTipe(p, m.parameter[i])))
      if (x) return x
    }
    return undefined
  }

  private panggilFase1(id: string, objek: Nilai, arg: Nilai[], tipeArg: Tipe[], tipeParam: Tipe[]): Nilai {
    const impl = implementasi(id)
    if (!impl) throw new LemparanJava('java.lang.UnsupportedOperationException', `[Simulator] ${id} belum diimplementasikan`)
    const hasil = impl(this.ctx, objek, arg, tipeArg, tipeParam)
    return hasil === undefined ? null : hasil
  }

  private panggilPustaka(t: Extract<A.TargetPanggil, { k: 'pustaka' }>, objek: Nilai, arg: Nilai[], tipeArg: Tipe[]): Nilai {
    const { kelas, nama } = uraiId(t.id)
    if (t.statik) {
      if (kelas === 'String' && nama === 'join' && t.parameter[1] && t.parameter[1].k !== 'array') {
        // String.join(pemisah, Iterable): elemen dibaca dalam urutan iterasi.
        if (arg[1] === null) throw new LemparanJava('java.lang.NullPointerException')
        const isi = bacaKoleksi(this.state.heap, arg[1] as number)
        const elemen = isi && isi.jenis !== 'map' ? isi.elemen : []
        return this.buatString(elemen.map((x) => this.keString(x, T.Object)).join(this.teks(arg[0])))
      }
      if ((kelas === 'Collections' || kelas === 'Comparator') && nama === 'reverseOrder') return this.balikPembanding(arg.length ? arg[0] : null)
      if (kelas === 'Comparator' && nama === 'naturalOrder') return this.pembandingTunggal(PEMBANDING_ALAMI)
      const r = panggilStatikFase2(this.ctx2, kelas, nama, t.parameter, arg)
      if (r !== TIDAK_ADA) return r
      return this.panggilFase1(t.id, null, arg, tipeArg, t.parameter)
    }
    const ref = objek as number
    if (ref < 0) return this.panggilFase1(t.id, objek, arg, tipeArg, t.parameter)
    const o = this.state.heap[ref]
    let r: Nilai | typeof TIDAK_ADA = TIDAK_ADA
    switch (o?.k) {
      case 'string':
        if (implementasi(`String.${nama}(`)) r = this.panggilFase1(`String.${nama}(`, objek, arg, tipeArg, t.parameter)
        break
      case 'scanner':
        r = this.panggilFase1(t.id, objek, arg, tipeArg, t.parameter)
        break
      case 'boks':
        r = panggilBoks(this.ctx2, ref, nama, arg)
        break
      case 'pembangun':
        r = panggilPembangun(this.ctx2, ref, nama, t.parameter, arg)
        break
      case 'lambda':
        r = this.metodePembanding(ref, nama, arg)
        break
      case 'objek':
        r = this.panggilObjek(ref, o, nama, t, arg)
        break
    }
    if (r === TIDAK_ADA) r = this.metodeObject(ref, nama, arg)
    if (r === TIDAK_ADA) throw new LemparanJava('java.lang.UnsupportedOperationException', `[Simulator] ${t.id} belum diimplementasikan`)
    if (!this.opsi.modeHitung && (o?.k === 'pembangun' || (o?.k === 'objek' && !this.kelasDariBiner.has(o.kelas) && !this.adalahException(ref)))) {
      this.emit({
        k: 'pustaka',
        id: ref,
        kelas: o.k === 'pembangun' ? 'java.lang.StringBuilder' : o.kelas,
        metode: `${nama}(${arg.map((x, i) => this.tampil(x, t.parameter[i] ?? T.Object)).join(', ')})`,
        hasil: t.kembali.k === 'void' ? undefined : this.tampil(r, t.kembali),
      })
    }
    return r
  }

  private panggilObjek(ref: number, o: Extract<ObjekHeap, { k: 'objek' }>, nama: string, t: Extract<A.TargetPanggil, { k: 'pustaka' }>, arg: Nilai[]): Nilai | typeof TIDAK_ADA {
    const info = this.kelasDariBiner.get(o.kelas)
    // Override milik class mahasiswa (toString, equals, hashCode, compareTo, getMessage, …) yang dipanggil lewat tipe pustaka.
    const m = this.cariMethodObjek(info, nama, arg.length)
    if (m) return this.panggilUser(m, arg, ref) ?? null
    if (this.adalahException(ref)) {
      const r = this.metodeThrowable(ref, nama)
      if (r !== TIDAK_ADA) return r
    }
    if (o.kelas === 'java.util.Random') return panggilRandom(this.ctx2, ref, nama, arg)
    if (KELAS_PEMBANDING.has(o.kelas)) return this.metodePembanding(ref, nama, arg)
    if (!info && adalahObjekPustakaKoleksi(this.ctx2, ref)) return panggilKoleksi(this.ctx2, ref, nama, t.parameter, arg)
    return TIDAK_ADA
  }

  private metodeThrowable(ref: number, nama: string): Nilai | typeof TIDAK_ADA {
    switch (nama) {
      case 'getMessage':
      case 'getLocalizedMessage':
        return this.objek(ref).field.detailMessage ?? null
      case 'toString':
        return this.buatString(this.teksThrowableObjek(ref))
      case 'printStackTrace': {
        const jejak = this.objek(ref).jejak ?? []
        this.cetak(`${this.teksThrowableObjek(ref)}\n${jejak.map((b) => b + '\n').join('')}`, true)
        return null
      }
      case 'getCause':
        return null
    }
    return TIDAK_ADA
  }

  /** Method bawaan java.lang.Object untuk objek yang tidak meng-override-nya. */
  private metodeObject(ref: number, nama: string, arg: Nilai[]): Nilai | typeof TIDAK_ADA {
    switch (nama) {
      case 'equals':
        return this.equalsObjek(ref, arg[0])
      case 'hashCode':
        return this.hashCodeObjek(ref)
      case 'toString':
        return this.buatString(this.keString(ref, T.Object))
    }
    return TIDAK_ADA
  }

  // ---------- kondisi dengan pohon evaluasi ----------
  private evalKondisi(
    e: A.Ekspresi,
    konteks: 'if' | 'while' | 'for' | 'do-while' | 'ternary',
    tambahan: { adaLain?: boolean; pertama?: boolean } = {},
  ): boolean {
    if (this.opsi.modeHitung) return this.keBoolean(this.eval(e), e)
    const { nilai, pohon } = this.evalPohon(e)
    const b = this.keBoolean(nilai, e)
    this.emit({ k: 'evaluasi', konteks, teks: this.src(e), pohon, hasil: b ? 'true' : 'false', ...tambahan })
    return b
  }

  private evalPohon(e: A.Ekspresi): { nilai: Nilai; pohon: PohonEval } {
    const t = e.tipe!
    if (e.konstan !== undefined && t.k === 'primitif') {
      return { nilai: e.konstan as Nilai, pohon: { k: 'daun', teks: this.src(e), nilai: this.tampil(e.konstan as Nilai, t), literal: true } }
    }
    if (e.jenis === 'Biner' && !(e.op === '+' && adalahString(e.tipeOperasi ?? T.int))) {
      const a = this.evalPohon(e.kiri)
      if (e.op === '&&' || e.op === '||') {
        const ka = this.keBoolean(a.nilai, e.kiri)
        if ((e.op === '&&' && !ka) || (e.op === '||' && ka)) {
          return {
            nilai: ka,
            pohon: { k: 'biner', op: e.op, kiri: a.pohon, kanan: this.pohonTanpaNilai(e.kanan), nilai: this.tampil(ka, T.boolean) },
          }
        }
        const b = this.evalPohon(e.kanan)
        const kb = this.keBoolean(b.nilai, e.kanan)
        return { nilai: kb, pohon: { k: 'biner', op: e.op, kiri: a.pohon, kanan: b.pohon, nilai: this.tampil(kb, t) } }
      }
      const b = this.evalPohon(e.kanan)
      const v = this.hitungBiner(e.op, a.nilai, e.kiri.tipe!, b.nilai, e.kanan.tipe!, e.tipeOperasi!, e.kiri, e.kanan)
      return { nilai: v, pohon: { k: 'biner', op: e.op, kiri: a.pohon, kanan: b.pohon, nilai: this.tampil(v, t) } }
    }
    if (e.jenis === 'Unary' && e.op === '!') {
      const a = this.evalPohon(e.operand)
      const v = !this.keBoolean(a.nilai, e.operand)
      return { nilai: v, pohon: { k: 'unary', op: '!', operand: a.pohon, nilai: this.tampil(v, T.boolean) } }
    }
    const v = this.eval(e)
    return { nilai: v, pohon: { k: 'daun', teks: this.src(e), nilai: this.tampil(v, t), literal: e.jenis === 'Literal' } }
  }

  private pohonTanpaNilai(e: A.Ekspresi): PohonEval {
    if (e.jenis === 'Biner' && !(e.op === '+' && adalahString(e.tipeOperasi ?? T.int))) {
      return { k: 'biner', op: e.op, kiri: this.pohonTanpaNilai(e.kiri), kanan: this.pohonTanpaNilai(e.kanan) }
    }
    if (e.jenis === 'Unary' && e.op === '!') return { k: 'unary', op: '!', operand: this.pohonTanpaNilai(e.operand) }
    return { k: 'daun', teks: this.src(e), literal: e.jenis === 'Literal' }
  }
}
