import type * as A from '../ast'
import type { ProgramTerperiksa } from '../checker'
import { konversiKonstan } from '../checker'
import { primitifKeString } from '../format'
import {
  aritmetika, bandingkan, bitNot, geser, konversi, konversiPrimitif, LemparanJava, negasi, nilaiDefault, operasiBit,
  tambahSatu, type Nilai, type OpAritmetika, type OpBanding, type OpBit, type OpGeser,
} from '../nilai'
import { implementasi, type KonteksPustaka } from '../pustaka/implementasi'
import { PemindaiInput } from '../pustaka/scanner'
import type { Span, Sumber } from '../sumber'
import { adalahIntegral, adalahString, promosiUnary, samaTipe, T, teksTipe, type NamaPrimitif, type Tipe } from '../tipe'
import {
  klonState, stateKosong, tampilNilai, terapkan, type JenisLangkah, type Langkah, type NilaiAkhir, type ObjekHeap,
  type Peristiwa, type PohonEval, type StateMesin, type StatusTrace, type Trace, type VarState,
} from '../trace'

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
}

interface LValue {
  tipe: Tipe
  /** Pemeriksaan null/batas array. */
  cek(): void
  baca(): Nilai
  tulis(v: Nilai, op?: string, operand?: string): void
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

function namaArrayNpe(tipeElemen: Tipe): string {
  if (tipeElemen.k !== 'primitif') return 'object'
  if (tipeElemen.nama === 'byte' || tipeElemen.nama === 'boolean') return 'byte/boolean'
  return tipeElemen.nama
}

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
  private readonly statik = new Map<string, { nilai: Nilai; tipe: Tipe }>()
  private readonly pemindai: PemindaiInput
  private readonly acak: () => number
  private selesai = false
  /** true bila StackOverflowError dipicu oleh habisnya stack JavaScript, bukan oleh `batasKedalaman`. */
  private stackBrowserHabis = false
  private readonly ctx: KonteksPustaka
  private jumlahLangkah = 0
  /** Langkah selama `opsi.ukurMethod` sedang berjalan. */
  private langkahUkur = 0
  private dalamUkur = 0
  private readonly gantiDipakai = new Set<string>()

  constructor(
    private readonly program: ProgramTerperiksa,
    private readonly sumber: Sumber,
    private readonly opsi: Required<OpsiJalan>,
  ) {
    this.pemindai = new PemindaiInput(opsi.stdin)
    this.acak = mulberry32(opsi.seed)
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
    if (isi.length > this.opsi.batasElemen) {
      throw new BatasTercapai('memori', `Ukuran array ${isi.length.toLocaleString('id-ID')} melebihi batas simulator (${this.opsi.batasElemen.toLocaleString('id-ID')} elemen).`)
    }
    return this.alokasi({ k: 'array', tipeElemen: teksTipe(tipeElemen), nilai: isi })
  }

  private heapArray(ref: number): { k: 'array'; tipeElemen: string; nilai: Nilai[] } {
    return this.state.heap[ref] as { k: 'array'; tipeElemen: string; nilai: Nilai[] }
  }

  /** Konversi ke String sesuai String.valueOf (untuk konkatenasi & println). */
  private keString(v: Nilai, t: Tipe): string {
    if (t.k === 'primitif') return primitifKeString(v, t.nama)
    if (v === null) return 'null'
    if (typeof v !== 'number') return String(v)
    const o = this.state.heap[v]
    if (!o) return 'null'
    const hash = ((Math.imul(v + 7, 0x9e3779b1) >>> 0) % 0x7fffffff).toString(16)
    if (o.k === 'string') return o.nilai
    if (o.k === 'array') return `[${kodeTipeArray(o.tipeElemen)}@${hash}`
    return `java.util.Scanner@${hash}`
  }

  private tampil(v: Nilai | undefined, t: Tipe): string {
    return tampilNilai(v, teksTipe(t), this.state.heap)
  }

  // ---------- program ----------
  jalankan(): Trace {
    let status: StatusTrace = 'selesai'
    let exception: Trace['exception']
    let pesanSimulator: string | undefined
    let kodeKeluar: number | undefined
    const main = this.program.main
    try {
      // Seperti JVM: semua field static bernilai default dulu; konstanta compile-time (static final) langsung terisi;
      // lalu penginisialisasi lain dijalankan sesuai urutan teks. Field tanpa penginisialisasi tidak disentuh lagi.
      const fieldStatik = this.program.kelas.field.filter((f) => f.modifier.includes('static')).flatMap((f) => f.deklarator)
      const konstan = (d: A.Deklarator) => d.init !== undefined && this.program.field.get(d.nama)?.konstan !== undefined
      for (const d of fieldStatik) {
        const tipe = d.tipe!
        const nilai = konstan(d) ? this.nilaiUntuk(d.init!, tipe) : nilaiDefault(tipe)
        this.statik.set(d.nama, { nilai, tipe })
        this.emit({ k: 'deklarasi-statik', nama: d.nama, tipe: teksTipe(tipe), nilai })
      }
      for (const d of fieldStatik) {
        if (!d.init || konstan(d)) continue
        const tipe = d.tipe!
        const nilai = this.nilaiUntuk(d.init, tipe)
        this.statik.set(d.nama, { nilai, tipe })
        this.emit({ k: 'deklarasi-statik', nama: d.nama, tipe: teksTipe(tipe), nilai })
      }
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
      const frame = this.frameBaru(main, [args])
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
        const jejakPenuh = [...this.frames].reverse().map((f) => `\tat Main.${f.simbol.nama}(Main.java:${f.barisAktif})`)
        const jejak = jejakPenuh.length > 12 ? [...jejakPenuh.slice(0, 10), `\t... (${jejakPenuh.length - 10} frame lagi)`] : jejakPenuh
        const baris = this.f?.barisAktif ?? 1
        exception = { kelas: e.kelas, pesan: e.pesanJava, baris, jejak }
        try {
          this.cetak(`Exception in thread "main" ${e.kelas}${e.pesanJava !== null ? ': ' + e.pesanJava : ''}\n${jejak.join('\n')}\n`, true)
        } catch (lain) {
          if (!(lain instanceof BatasTercapai)) throw lain
        }
        if (e.kelas === 'java.lang.StackOverflowError') {
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
      akhirStatik: Object.fromEntries([...this.statik].map(([nama, v]) => [nama, { tipe: teksTipe(v.tipe), nilai: this.json(v.nilai, teksTipe(v.tipe), 0) }])),
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
    if (!o) return null
    if (o.k === 'string') return o.nilai
    if (o.k === 'array' && kedalaman < 4) return o.nilai.map((x) => this.json(x, o.tipeElemen, kedalaman + 1))
    return null
  }

  private frameBaru(m: A.SimbolMethod, arg: Nilai[]): FrameRuntime {
    const d = m.deklarasi
    const id = this.idFrame++
    const frame: FrameRuntime = {
      id,
      simbol: m,
      lokal: new Array(d.jumlahSlot ?? 0),
      terdeklarasi: new Set(),
      tipeLokal: new Map(),
      barisAktif: this.baris(d.spanNama),
    }
    const vars: VarState[] = d.parameter.map((p, i) => {
      const info = p.info!
      frame.lokal[info.slot] = arg[i]
      frame.terdeklarasi.add(info.slot)
      frame.tipeLokal.set(info.slot, info.tipe)
      return { slot: info.slot, nama: p.nama, tipe: teksTipe(info.tipe), nilai: arg[i], param: true }
    })
    const barisPemanggil = this.frames.length ? this.f.barisAktif : 0
    this.emit({
      k: 'panggil',
      frame: { id, method: m.nama, baris: frame.barisAktif, vars },
      method: m.nama,
      argumen: arg.map((a, i) => this.tampil(a, m.parameter[i])),
      barisPemanggil,
    })
    this.frames.push(frame)
    return frame
  }

  private panggilUser(m: A.SimbolMethod, arg: Nilai[]): Nilai | undefined {
    if (this.frames.length >= this.opsi.batasKedalaman) throw new LemparanJava('java.lang.StackOverflowError')
    // Jaring pengaman: hentikan dengan StackOverflowError yang rapi sebelum stack browser benar-benar habis.
    if (this.frames.length >= KEDALAMAN_MULAI_PROBE && !stackMasihCukup(CADANGAN_STACK)) {
      this.stackBrowserHabis = true
      throw new LemparanJava('java.lang.StackOverflowError')
    }
    const d = m.deklarasi
    const diukur = this.opsi.ukurMethod !== '' && m.nama === this.opsi.ukurMethod
    if (diukur) this.dalamUkur++
    try {
      const frame = this.frameBaru(m, arg)
      this.catat(d.spanNama, 'panggil')
      const r = this.execBadan(d.badan)
      const nilai = r?.k === 'return' ? r.nilai : undefined
      const barisKembali = frame.barisReturn ?? this.baris(d.spanTutup)
      frame.barisAktif = barisKembali
      this.emit({
        k: 'kembali',
        frame: frame.id,
        method: m.nama,
        nilai: nilai !== undefined ? this.tampil(nilai, m.kembali) : undefined,
        tipe: m.kembali.k === 'void' ? undefined : teksTipe(m.kembali),
      })
      this.catat(frame.spanReturn ?? d.spanTutup, 'kembali', barisKembali)
      this.frames.pop()
      this.emit({ k: 'buang-frame', frame: frame.id })
      return nilai
    } finally {
      if (diukur) this.dalamUkur--
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
    const nilai = p.ekspresi ? this.nilaiUntuk(p.ekspresi, f.simbol.kembali) : undefined
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

  private execForEach(p: A.ForEach): Selesai {
    this.mulaiBaris(p)
    const ref = this.eval(p.iterable)
    if (ref === null) throw new LemparanJava('java.lang.NullPointerException', `Cannot read the array length because ${this.deskripsiNull(p.iterable)} is null`)
    const arr = this.heapArray(ref as number)
    const info = p.info!
    const tipeElemen = (p.iterable.tipe as { elemen: Tipe }).elemen
    const f = this.f
    let hasil: Selesai
    for (let k = 0; k < arr.nilai.length; k++) {
      this.mulaiBaris(p)
      this.emit({ k: 'baca-elemen', id: ref as number, indeks: k })
      const v = konversi(arr.nilai[k], tipeElemen, info.tipe)
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
      this.catat({ awal: p.span.awal, akhir: p.iterable.span.akhir }, 'pernyataan')
      const r = this.exec(p.badan)
      if (r?.k === 'break') break
      if (r?.k === 'return') {
        hasil = r
        break
      }
    }
    this.hapusSlot([info.slot])
    return hasil
  }

  private execSwitch(p: A.Switch): Selesai {
    this.mulaiBaris(p)
    const t = p.selektor.tipe!
    const v = this.eval(p.selektor)
    const string = adalahString(t)
    if (string && v === null) {
      throw new LemparanJava('java.lang.NullPointerException', `Cannot invoke "String.hashCode()" because ${this.deskripsiNull(p.selektor)} is null`)
    }
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

  // ---------- ekspresi ----------
  /** Evaluasi lalu konversi ke tipe tujuan (konteks assignment/argumen/return). */
  private nilaiUntuk(e: A.Ekspresi, ke: Tipe): Nilai {
    if (e.jenis === 'InisialisasiArray') return this.buatDariInit(e, ke)
    const v = this.eval(e)
    if (ke.k === 'kelas' && ke.nama === 'Object' && e.tipe!.k === 'primitif') return this.buatString(this.keString(v, e.tipe!))
    return konversi(v, e.tipe!, ke)
  }

  private buatDariInit(init: A.InisialisasiArray, tipe: Tipe): number {
    const elemen = (tipe as { elemen: Tipe }).elemen
    const isi = init.elemen.map((x) => this.nilaiUntuk(x, elemen))
    return this.buatArray(elemen, isi)
  }

  private indeks(e: A.Ekspresi): number {
    const v = this.eval(e)
    return konversi(v, e.tipe!, T.int) as number
  }

  private deskripsiNull(e: A.Ekspresi): string {
    if (e.jenis === 'Nama') return e.ikatan?.k === 'field' ? `"Main.${e.nama}"` : `"${e.nama}"`
    if (e.jenis === 'AksesArray' || e.jenis === 'AksesField') return `"${this.src(e)}"`
    if (e.jenis === 'PanggilMethod') {
      const t = e.target
      const nama = t?.k === 'user' ? `Main.${t.method.tandaTangan}` : t?.id ?? e.nama
      return `the return value of "${nama}"`
    }
    return `"${this.src(e)}"`
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
      this.emit({ k: 'baca-statik', nama: e.nama })
      return this.statik.get(e.nama)?.nilai ?? nilaiDefault(ik.field.tipe)
    }
    return null
  }

  private evalAksesField(e: A.AksesField): Nilai {
    const ik = e.ikatan!
    if (ik.k === 'panjang-array') {
      const ref = this.eval(e.objek)
      if (ref === null) throw new LemparanJava('java.lang.NullPointerException', `Cannot read the array length because ${this.deskripsiNull(e.objek)} is null`)
      return this.heapArray(ref as number).nilai.length
    }
    if (ik.k === 'field-pustaka') {
      if (ik.id === 'System.out') return REF_OUT
      if (ik.id === 'System.err') return REF_ERR
      if (ik.id === 'System.in') return REF_IN
      return null
    }
    if (ik.k === 'field') {
      this.emit({ k: 'baca-statik', nama: e.nama })
      return this.statik.get(e.nama)?.nilai ?? nilaiDefault(ik.field.tipe)
    }
    return null
  }

  private evalAksesArray(e: A.AksesArray): Nilai {
    const ref = this.eval(e.array)
    const i = this.indeks(e.indeks)
    const elemen = (e.array.tipe as { elemen: Tipe }).elemen
    if (ref === null) {
      throw new LemparanJava('java.lang.NullPointerException', `Cannot load from ${namaArrayNpe(elemen)} array because ${this.deskripsiNull(e.array)} is null`)
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
    if (t.k !== 'pustaka') return null
    const { nilai, tipe } = this.argumenPustaka(e.argumen, t.parameter, false)
    return implementasi(t.id)!(this.ctx, null, nilai, tipe, t.parameter)
  }

  private evalUnary(e: A.Unary): Nilai {
    const v = this.eval(e.operand)
    if (e.op === '!') return !v
    const ta = e.operand.tipe!
    const p = promosiUnary(ta) as { k: 'primitif'; nama: NamaPrimitif }
    const pv = konversi(v, ta, p)
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
    const tn = (lv.tipe as { nama: NamaPrimitif }).nama
    const baru = tambahSatu(lama, tn, e.op === '++' ? 1 : -1)
    if ((tn === 'int' || tn === 'long') && (e.op === '++' ? (baru as number) < (lama as number) : (baru as number) > (lama as number))) {
      const tepat = typeof lama === 'bigint' ? (lama + (e.op === '++' ? 1n : -1n)).toString() : String((lama as number) + (e.op === '++' ? 1 : -1))
      this.emit({ k: 'aritmetika', jenis: 'overflow', teks: `${this.tampil(lama, lv.tipe)} ${e.op === '++' ? '+' : '-'} 1`, hasil: this.tampil(baru, lv.tipe), tepat, tipe: tn })
    }
    lv.tulis(baru, e.op)
    return e.prefix ? baru : lama
  }

  private evalBiner(e: A.Biner): Nilai {
    if (e.op === '&&') return this.eval(e.kiri) ? this.eval(e.kanan) : false
    if (e.op === '||') return this.eval(e.kiri) ? true : this.eval(e.kanan)
    const a = this.eval(e.kiri)
    const b = this.eval(e.kanan)
    return this.hitungBiner(e.op, a, e.kiri.tipe!, b, e.kanan.tipe!, e.tipeOperasi!)
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

  private hitungBiner(op: A.OpBiner, a: Nilai, ta: Tipe, b: Nilai, tb: Tipe, tipeOp: Tipe): Nilai {
    if (adalahString(tipeOp) && op === '+') return this.buatString(this.keString(a, ta) + this.keString(b, tb))
    if (op === '==' || op === '!=') {
      if (tipeOp.k === 'primitif') {
        const pa = konversi(a, ta, tipeOp)
        const pb = konversi(b, tb, tipeOp)
        return bandingkan(op, pa, pb)
      }
      return op === '==' ? a === b : a !== b
    }
    const p = tipeOp as { k: 'primitif'; nama: NamaPrimitif }
    if (op === '<<' || op === '>>' || op === '>>>') {
      const pa = konversi(a, ta, p)
      const pb = konversi(b, tb, promosiUnary(tb))
      return geser(op as OpGeser, pa, pb, p.nama)
    }
    const pa = konversi(a, ta, p)
    const pb = konversi(b, tb, p)
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
      const nama = e.ikatan.field.nama
      const tipe = e.ikatan.field.tipe
      return {
        tipe,
        cek: () => {},
        baca: () => {
          this.emit({ k: 'baca-statik', nama })
          return this.statik.get(nama)?.nilai ?? nilaiDefault(tipe)
        },
        tulis: (v, op, operand) => {
          const s = this.statik.get(nama)
          const lama = s?.nilai
          this.statik.set(nama, { nilai: v, tipe })
          this.emit({ k: 'tulis-statik', nama, tipe: teksTipe(tipe), lama, baru: v, op, operand })
        },
      }
    }
    if (e.jenis === 'AksesArray') {
      const ref = this.eval(e.array)
      const i = this.indeks(e.indeks)
      const tipe = (e.array.tipe as { elemen: Tipe }).elemen
      const cek = (simpan: boolean) => {
        if (ref === null) {
          throw new LemparanJava('java.lang.NullPointerException', `Cannot ${simpan ? 'store to' : 'load from'} ${namaArrayNpe(tipe)} array because ${this.deskripsiNull(e.array)} is null`)
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
    else hasil = konversi(this.hitungBiner(op, lama, lv.tipe, kanan, e.nilai.tipe!, tipeOp), tipeOp, lv.tipe)
    if (!adalahString(tipeOp) && !samaTipe(tipeOp, lv.tipe)) {
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

  private argumenPustaka(argumen: A.Ekspresi[], parameter: Tipe[], varargs: boolean): { nilai: Nilai[]; tipe: Tipe[] } {
    const nilai: Nilai[] = []
    const tipe: Tipe[] = []
    for (let i = 0; i < argumen.length; i++) {
      const a = argumen[i]
      const tujuan = varargs && i >= parameter.length - 1 ? undefined : parameter[i]
      if (tujuan && !(tujuan.k === 'kelas' && tujuan.nama === 'Object')) {
        nilai.push(this.nilaiUntuk(a, tujuan))
        tipe.push(tujuan)
      } else {
        nilai.push(this.eval(a))
        tipe.push(a.tipe!)
      }
    }
    return { nilai, tipe }
  }

  private panggil(e: A.PanggilMethod): Nilai {
    const t = e.target!
    if (t.k === 'user') {
      const arg = this.argumenUser(e.argumen, t.method.parameter, !!(t.method.varargs && e.pakaiVarargs))
      return this.panggilUser(t.method, arg) ?? null
    }
    let objek: Nilai = null
    if (!t.statik) {
      objek = this.eval(e.objek!)
      if (objek === null) {
        throw new LemparanJava('java.lang.NullPointerException', `Cannot invoke "${t.id}" because ${this.deskripsiNull(e.objek!)} is null`)
      }
    }
    const { nilai, tipe } = this.argumenPustaka(e.argumen, t.parameter, !!e.pakaiVarargs)
    const impl = implementasi(t.id)
    if (!impl) throw new LemparanJava('java.lang.UnsupportedOperationException', `[Simulator] ${t.id} belum diimplementasikan`)
    const hasil = impl(this.ctx, objek, nilai, tipe, t.parameter)
    return hasil === undefined ? null : hasil
  }

  // ---------- kondisi dengan pohon evaluasi ----------
  private evalKondisi(
    e: A.Ekspresi,
    konteks: 'if' | 'while' | 'for' | 'do-while' | 'ternary',
    tambahan: { adaLain?: boolean; pertama?: boolean } = {},
  ): boolean {
    if (this.opsi.modeHitung) return this.eval(e) as boolean
    const { nilai, pohon } = this.evalPohon(e)
    this.emit({ k: 'evaluasi', konteks, teks: this.src(e), pohon, hasil: nilai ? 'true' : 'false', ...tambahan })
    return nilai as boolean
  }

  private evalPohon(e: A.Ekspresi): { nilai: Nilai; pohon: PohonEval } {
    const t = e.tipe!
    if (e.konstan !== undefined && t.k === 'primitif') {
      return { nilai: e.konstan as Nilai, pohon: { k: 'daun', teks: this.src(e), nilai: this.tampil(e.konstan as Nilai, t), literal: true } }
    }
    if (e.jenis === 'Biner' && !(e.op === '+' && adalahString(e.tipeOperasi ?? T.int))) {
      const a = this.evalPohon(e.kiri)
      if ((e.op === '&&' && !a.nilai) || (e.op === '||' && a.nilai)) {
        return {
          nilai: a.nilai,
          pohon: { k: 'biner', op: e.op, kiri: a.pohon, kanan: this.pohonTanpaNilai(e.kanan), nilai: this.tampil(a.nilai, T.boolean) },
        }
      }
      const b = this.evalPohon(e.kanan)
      const v = e.op === '&&' || e.op === '||' ? b.nilai : this.hitungBiner(e.op, a.nilai, e.kiri.tipe!, b.nilai, e.kanan.tipe!, e.tipeOperasi!)
      return { nilai: v, pohon: { k: 'biner', op: e.op, kiri: a.pohon, kanan: b.pohon, nilai: this.tampil(v, t) } }
    }
    if (e.jenis === 'Unary' && e.op === '!') {
      const a = this.evalPohon(e.operand)
      const v = !a.nilai
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
