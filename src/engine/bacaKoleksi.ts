/**
 * Membaca isi koleksi java.util dari heap state secara hanya-baca (tanpa peristiwa, tanpa menjalankan kode
 * mahasiswa), memakai model koleksi yang sama dengan runtime. Dipakai untuk nilai akhir tantangan
 * (`akhirMain`), visual `koleksi`, dan tampilan ringkas di Memori.
 */
import type { Nilai } from './nilai'
import {
  cariModel,
  cariModelMap,
  type HeapKoleksi,
  type OperasiElemen,
} from './pustaka/koleksi'
import type { ObjekHeap } from './trace'

export type JenisKoleksi = 'list' | 'set' | 'deque' | 'tumpukan' | 'pq' | 'map'

export type IsiKoleksi =
  | { jenis: Exclude<JenisKoleksi, 'map'>; kelas: string; elemen: Nilai[] }
  | { jenis: 'map'; kelas: string; entri: [Nilai, Nilai][] }

class HeapBaca implements HeapKoleksi {
  constructor(private readonly heap: Record<number, ObjekHeap>) {}
  private ditolak(): never {
    throw new Error('Heap hanya-baca')
  }
  baruObjek(): number {
    this.ditolak()
  }
  bacaField(id: number, nama: string): Nilai {
    const o = this.heap[id]
    return o?.k === 'objek' ? (o.field[nama] ?? null) : null
  }
  tulisField(): void {
    this.ditolak()
  }
  baruArray(): number {
    this.ditolak()
  }
  panjangArray(id: number): number {
    const o = this.heap[id]
    return o?.k === 'array' ? o.nilai.length : 0
  }
  bacaElemen(id: number, i: number): Nilai {
    const o = this.heap[id]
    return o?.k === 'array' ? (o.nilai[i] ?? null) : null
  }
  tulisElemen(): void {
    this.ditolak()
  }
  salinArray(): void {
    this.ditolak()
  }
  kelasDari(id: number): string {
    const o = this.heap[id]
    if (!o) return ''
    if (o.k === 'objek') return o.kelas
    if (o.k === 'string') return 'java.lang.String'
    if (o.k === 'boks') return `java.lang.${o.kelas}`
    if (o.k === 'pembangun') return 'java.lang.StringBuilder'
    return ''
  }
  statik(): Nilai {
    this.ditolak()
  }
}

const opsDitolak: OperasiElemen = {
  hashCode: () => {
    throw new Error('Operasi elemen tidak tersedia saat membaca')
  },
  equals: () => {
    throw new Error('Operasi elemen tidak tersedia saat membaca')
  },
  compareTo: () => {
    throw new Error('Operasi elemen tidak tersedia saat membaca')
  },
  compare: () => {
    throw new Error('Operasi elemen tidak tersedia saat membaca')
  },
  teks: () => {
    throw new Error('Operasi elemen tidak tersedia saat membaca')
  },
  pastikanComparable: () => {
    throw new Error('Operasi elemen tidak tersedia saat membaca')
  },
}

function jenisDari(kelas: string, list: boolean): Exclude<JenisKoleksi, 'map'> {
  if (kelas === 'java.util.Stack') return 'tumpukan'
  if (kelas === 'java.util.ArrayDeque') return 'deque'
  if (kelas === 'java.util.PriorityQueue') return 'pq'
  if (list) return 'list'
  return 'set'
}

const MAP_HASH = new Set(['java.util.HashMap', 'java.util.LinkedHashMap'])
const SET_HASH = new Set(['java.util.HashSet', 'java.util.LinkedHashSet'])

/**
 * Entri map dalam urutan iterasi JDK, ditelusuri langsung dari field internalnya (tanpa membuat view
 * entrySet seperti JDK): LinkedHashMap lewat `head`/`after`, HashMap per bucket `table` lalu `next`,
 * TreeMap secara inorder dari `root`.
 */
function entriMap(h: HeapBaca, id: number, batas: number): number[] {
  const kelas = h.kelasDari(id)
  const hasil: number[] = []
  if (kelas === 'java.util.LinkedHashMap') {
    for (let e = h.bacaField(id, 'head'); e !== null && hasil.length < batas; e = h.bacaField(e as number, 'after')) hasil.push(e as number)
  } else if (MAP_HASH.has(kelas)) {
    const tabel = h.bacaField(id, 'table')
    if (tabel === null) return hasil
    const n = h.panjangArray(tabel as number)
    for (let i = 0; i < n && hasil.length < batas; i++) {
      for (let e = h.bacaElemen(tabel as number, i); e !== null && hasil.length < batas; e = h.bacaField(e as number, 'next')) hasil.push(e as number)
    }
  } else if (kelas === 'java.util.TreeMap') {
    const tumpukan: number[] = []
    let e = h.bacaField(id, 'root')
    while ((e !== null || tumpukan.length) && hasil.length < batas) {
      while (e !== null) {
        tumpukan.push(e as number)
        e = h.bacaField(e as number, 'left')
      }
      const x = tumpukan.pop()!
      hasil.push(x)
      e = h.bacaField(x, 'right')
    }
  }
  return hasil
}

/** Apakah objek `id` adalah koleksi/map java.util yang dikenal (bukan iterator atau objek internal). */
export function adalahObjekKoleksi(heap: Record<number, ObjekHeap>, id: number): boolean {
  const o = heap[id]
  if (o?.k !== 'objek') return false
  const m = cariModel(o.kelas)
  return (m !== undefined && m.kelas === o.kelas) || cariModelMap(o.kelas) !== undefined
}

/** Isi abstrak koleksi `id` dalam urutan iterasi JDK, atau undefined bila bukan koleksi yang dikenal. */
export function bacaKoleksi(heap: Record<number, ObjekHeap>, id: number, batas = 10_000): IsiKoleksi | undefined {
  const o = heap[id]
  if (o?.k !== 'objek') return undefined
  const h = new HeapBaca(heap)
  try {
    if (cariModelMap(o.kelas)) {
      const entri = entriMap(h, id, batas).map((e): [Nilai, Nilai] => [h.bacaField(e, 'key'), h.bacaField(e, 'value')])
      return { jenis: 'map', kelas: o.kelas, entri }
    }
    if (SET_HASH.has(o.kelas) || o.kelas === 'java.util.TreeSet') {
      const peta = h.bacaField(id, SET_HASH.has(o.kelas) ? 'map' : 'm')
      const elemen = peta === null ? [] : entriMap(h, peta as number, batas).map((e) => h.bacaField(e, 'key'))
      return { jenis: 'set', kelas: o.kelas, elemen }
    }
    const m = cariModel(o.kelas)
    if (!m || m.kelas !== o.kelas) return undefined
    const elemen: Nilai[] = []
    const it = m.iterasi(h, opsDitolak, id)
    while (elemen.length < batas && it.hasNext()) elemen.push(it.next())
    return { jenis: jenisDari(o.kelas, m.list), kelas: o.kelas, elemen }
  } catch {
    return undefined
  }
}
