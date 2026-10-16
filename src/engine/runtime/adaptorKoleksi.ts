/**
 * Adaptor `HeapKoleksi` (antarmuka model koleksi java.util) di atas heap mesin: setiap tulisan model menjadi
 * peristiwa trace (`alokasi`, `tulis-field`, `tulis-elemen`, `salin-elemen`), sehingga isi dalam koleksi bisa
 * diputar ulang langkah demi langkah dan ditampilkan lewat "Lihat isi dalam".
 */
import type { Nilai } from '../nilai'
import type { HeapKoleksi } from '../pustaka/koleksi'
import type { ObjekHeap, Peristiwa } from '../trace'

/** Layanan heap yang disediakan interpreter. */
export interface DasarHeap {
  readonly heap: Record<number, ObjekHeap>
  alokasi(o: ObjekHeap): number
  /** Array baru (dengan pemeriksaan batas ukuran simulator). */
  baruArray(tipeElemen: string, isi: Nilai[]): number
  emit(p: Peristiwa): void
  /** Nama kelas JVM objek yang bukan `objek` berfield, mis. `java.lang.String`, `java.lang.Integer`. */
  kelasLain(id: number): string
}

type Objek = Extract<ObjekHeap, { k: 'objek' }>
type ArrayHeap = Extract<ObjekHeap, { k: 'array' }>

export class HeapMesin implements HeapKoleksi {
  private readonly statikJdk = new Map<string, Nilai>()

  constructor(private readonly m: DasarHeap) {}

  private objek(id: number): Objek {
    const o = this.m.heap[id]
    if (!o || o.k !== 'objek') throw new Error(`Objek #${id} bukan objek berfield`)
    return o
  }

  private array(id: number): ArrayHeap {
    const o = this.m.heap[id]
    if (!o || o.k !== 'array') throw new Error(`Objek #${id} bukan array`)
    return o
  }

  baruObjek(kelas: string, field: Record<string, Nilai>, tipeField: Record<string, string>): number {
    return this.m.alokasi({ k: 'objek', kelas, field: { ...field }, tipeField: { ...tipeField } })
  }

  bacaField(id: number, nama: string): Nilai {
    return this.objek(id).field[nama] ?? null
  }

  tulisField(id: number, nama: string, nilai: Nilai): void {
    const o = this.objek(id)
    const lama = o.field[nama] ?? null
    if (Object.is(lama, nilai)) return
    this.m.emit({ k: 'tulis-field', id, field: nama, tipe: o.tipeField[nama] ?? 'Object', lama, baru: nilai })
  }

  baruArray(tipeElemen: string, panjang: number): number {
    return this.m.baruArray(tipeElemen, new Array<Nilai>(panjang).fill(null))
  }

  panjangArray(id: number): number {
    return this.array(id).nilai.length
  }

  bacaElemen(id: number, i: number): Nilai {
    return this.array(id).nilai[i] ?? null
  }

  tulisElemen(id: number, i: number, nilai: Nilai): void {
    const a = this.array(id)
    const lama = a.nilai[i] ?? null
    if (Object.is(lama, nilai)) return
    this.m.emit({ k: 'tulis-elemen', id, indeks: i, tipe: a.tipeElemen, lama, baru: nilai })
  }

  salinArray(sumber: number, posSumber: number, tujuan: number, posTujuan: number, panjang: number): void {
    // Nilai diambil dulu seluruhnya: tumpang-tindih sumber/tujuan berperilaku seperti System.arraycopy.
    const nilai = this.array(sumber).nilai.slice(posSumber, posSumber + panjang)
    this.array(tujuan)
    this.m.emit({ k: 'salin-elemen', id: tujuan, mulai: posTujuan, nilai })
  }

  kelasDari(id: number): string {
    const o = this.m.heap[id]
    if (o && o.k === 'objek') return o.kelas
    return this.m.kelasLain(id)
  }

  statik(kelas: string, nama: string, buat: () => Nilai): Nilai {
    const kunci = `${kelas}.${nama}`
    if (this.statikJdk.has(kunci)) return this.statikJdk.get(kunci)!
    const v = buat()
    this.statikJdk.set(kunci, v)
    return v
  }
}
