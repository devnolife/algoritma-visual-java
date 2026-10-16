/**
 * Pembangun trace sintetis untuk unit test dan harness visual (`#/uji-visual`, hanya mode pengembangan).
 * Peristiwa diterapkan ke state seperti interpreter, lalu dikelompokkan per langkah dengan `catat()`.
 * Koleksi java.util dibuat dengan model koleksi sungguhan lewat `HeapMesin`, sehingga isi heap-nya realistis.
 */
import type { Nilai } from '@/engine/nilai'
import { hashString } from '@/engine/pustaka/hash'
import type { OperasiElemen } from '@/engine/pustaka/koleksi'
import { HeapMesin, type DasarHeap } from '@/engine/runtime/adaptorKoleksi'
import { PenyimpanBoks } from '@/engine/runtime/boks'
import { klonState, stateKosong, terapkan, type JenisLangkah, type Langkah, type ObjekHeap, type Peristiwa, type StateMesin, type Trace } from '@/engine/trace'

export interface VarAwal {
  nama: string
  tipe: string
  nilai?: Nilai
  param?: boolean
  slot?: number
}

export class PembangunTrace {
  readonly state: StateMesin = stateKosong()
  readonly h: HeapMesin
  readonly boks: PenyimpanBoks
  readonly ops: OperasiElemen
  private readonly langkah: Langkah[] = []
  private readonly checkpoint: Trace['checkpoint'] = []
  private pending: Peristiwa[] = []
  private idBerikut = 1
  private idFrame = 1
  private readonly slotBerikut = new Map<number, number>()
  private readonly intern = new Map<string, number>()
  private output = ''

  constructor() {
    const dasar: DasarHeap = {
      heap: this.state.heap,
      alokasi: (o) => this.alokasi(o),
      baruArray: (tipeElemen, isi) => this.alokasi({ k: 'array', tipeElemen, nilai: isi }),
      emit: (p) => this.emit(p),
      kelasLain: (id) => {
        const o = this.state.heap[id]
        return o?.k === 'string' ? 'java.lang.String' : o?.k === 'boks' ? `java.lang.${o.kelas}` : 'java.lang.Object'
      },
    }
    this.h = new HeapMesin(dasar)
    this.boks = new PenyimpanBoks((o) => this.alokasi(o))
    const isi = (x: Nilai): unknown => {
      const o = typeof x === 'number' ? this.state.heap[x] : undefined
      return o?.k === 'boks' || o?.k === 'string' ? o.nilai : x
    }
    this.ops = {
      hashCode: (x) => {
        const o = this.state.heap[x]
        return o?.k === 'string' ? hashString(o.nilai) : o?.k === 'boks' ? Number(o.nilai) | 0 : x
      },
      equals: (a, b) => b !== null && isi(a) === isi(b),
      compareTo: (a, b) => {
        const x = isi(a)
        const y = isi(b)
        return typeof x === 'string' && typeof y === 'string' ? (x < y ? -1 : x > y ? 1 : 0) : Number(x) - Number(y)
      },
      compare: (_c, a, b) => Number(isi(a)) - Number(isi(b)),
      teks: (x) => String(isi(x)),
      pastikanComparable: () => {},
    }
  }

  emit(p: Peristiwa): void {
    terapkan(this.state, p)
    this.pending.push(p)
  }

  alokasi(o: ObjekHeap): number {
    const id = this.idBerikut++
    this.emit({ k: 'alokasi', id, objek: o })
    return id
  }

  /** Literal String (diinternir seperti javac). */
  str(s: string): number {
    const ada = this.intern.get(s)
    if (ada !== undefined) return ada
    const id = this.alokasi({ k: 'string', nilai: s })
    this.intern.set(s, id)
    return id
  }

  /** Integer.valueOf(n) dengan cache −128..127, beserta peristiwa `boxing`. */
  int(n: number): number {
    const b = this.boks.boks('Integer', n)
    this.emit({ k: 'boxing', arah: 'box', kelas: 'Integer', nilai: String(n), id: b.id, cache: b.cache })
    return b.id
  }

  array(tipeElemen: string, isi: Nilai[]): number {
    return this.alokasi({ k: 'array', tipeElemen, nilai: isi })
  }

  objek(kelas: string, field: Record<string, Nilai>, tipeField: Record<string, string>, jejak?: string[]): number {
    return this.alokasi({ k: 'objek', kelas, field: { ...field }, tipeField: { ...tipeField }, jejak })
  }

  tulisField(id: number, field: string, baru: Nilai): void {
    const o = this.state.heap[id]
    if (o?.k !== 'objek') throw new Error(`#${id} bukan objek`)
    this.emit({ k: 'tulis-field', id, field, tipe: o.tipeField[field] ?? 'Object', lama: o.field[field] ?? null, baru })
  }

  bacaField(id: number, field: string): void {
    this.emit({ k: 'baca-field', id, field })
  }

  tulisElemen(id: number, indeks: number, baru: Nilai): void {
    const o = this.state.heap[id]
    if (o?.k !== 'array') throw new Error(`#${id} bukan array`)
    this.emit({ k: 'tulis-elemen', id, indeks, tipe: o.tipeElemen, lama: o.nilai[indeks] ?? null, baru })
  }

  /** Frame baru (method/konstruktor/lambda). Variabel awal biasanya parameter, termasuk `this` (slot −1). */
  frame(method: string, vars: VarAwal[] = [], jenis?: 'konstruktor' | 'lambda'): number {
    const id = this.idFrame++
    let slot = 0
    const vs = vars.map((v) => ({ slot: v.slot ?? slot++, nama: v.nama, tipe: v.tipe, nilai: v.nilai, param: v.param ?? true }))
    this.slotBerikut.set(id, slot)
    this.emit({ k: 'panggil', frame: { id, method, baris: 1, vars: vs }, method, argumen: [], barisPemanggil: 1, jenis })
    return id
  }

  buangFrame(frame: number): void {
    this.emit({ k: 'buang-frame', frame })
  }

  /** Deklarasi variabel lokal; mengembalikan slot-nya. */
  deklarasi(frame: number, nama: string, tipe: string, nilai?: Nilai): number {
    const slot = this.slotBerikut.get(frame) ?? 0
    this.slotBerikut.set(frame, slot + 1)
    this.emit({ k: 'deklarasi', frame, slot, nama, tipe, nilai })
    return slot
  }

  private varDi(frame: number, nama: string) {
    const v = this.state.frames.find((f) => f.id === frame)?.vars.find((x) => x.nama === nama)
    if (!v) throw new Error(`variabel ${nama} tidak ada di frame ${frame}`)
    return v
  }

  tulis(frame: number, nama: string, baru: Nilai): void {
    const v = this.varDi(frame, nama)
    this.emit({ k: 'tulis', frame, slot: v.slot, nama, tipe: v.tipe, lama: v.nilai, baru })
  }

  baca(frame: number, nama: string): void {
    this.emit({ k: 'baca', frame, slot: this.varDi(frame, nama).slot, nama })
  }

  statik(nama: string, tipe: string, nilai: Nilai): void {
    this.emit({ k: 'deklarasi-statik', nama, tipe, nilai })
  }

  tulisStatik(nama: string, baru: Nilai): void {
    const v = this.state.statik.find((x) => x.nama === nama)
    if (!v) throw new Error(`static ${nama} tidak ada`)
    this.emit({ k: 'tulis-statik', nama, tipe: v.tipe, lama: v.nilai, baru })
  }

  cetak(teks: string): void {
    this.output += teks
    this.emit({ k: 'cetak', teks })
  }

  /** Tutup langkah: semua peristiwa sejak langkah sebelumnya menjadi milik langkah ini. */
  catat(baris = 1, jenis: JenisLangkah = 'pernyataan'): number {
    this.langkah.push({ baris, jenis, peristiwa: this.pending, panjangOutput: this.output.length, kedalaman: this.state.frames.length })
    this.pending = []
    if (this.langkah.length === 1) this.checkpoint.push({ indeks: 0, state: klonState(this.state) })
    return this.langkah.length - 1
  }

  selesai(status: Trace['status'] = 'selesai'): Trace {
    if (this.pending.length || this.langkah.length === 0) this.catat(1, 'selesai')
    return {
      langkah: this.langkah,
      checkpoint: this.checkpoint,
      output: this.output,
      rentangErr: [],
      status,
      hitunganBaris: {},
      akhirMain: {},
    }
  }
}

/** Simpul class mahasiswa `Main$Node{data, next}` (int). */
export function simpulInt(t: PembangunTrace, data: number, next: Nilai = null, kelas = 'Main$Node'): number {
  return t.objek(kelas, { data, next }, { data: 'int', next: 'Node' })
}

/** Simpul pohon `Main$Node{data, left, right}` (int). */
export function simpulPohon(t: PembangunTrace, data: number, left: Nilai = null, right: Nilai = null): number {
  return t.objek('Main$Node', { data, left, right }, { data: 'int', left: 'Node', right: 'Node' })
}
