/**
 * Data murni untuk visual koleksi java.util: ringkasan abstrak (dibaca lewat `bacaKoleksi` milik mesin, tanpa
 * menulis heap), kunci sorotan per elemen, teks ringkas untuk Memori, dan struktur internal JDK untuk
 * tampilan "Lihat isi dalam".
 */
import { adalahObjekKoleksi, bacaKoleksi, type JenisKoleksi } from '@/engine/bacaKoleksi'
import type { Nilai } from '@/engine/nilai'
import { namaKelasTampil, tampilNilai, type ObjekHeap } from '@/engine/trace'

type Heap = Record<number, ObjekHeap>
type Objek = Extract<ObjekHeap, { k: 'objek' }>

const BATAS_TEKS = 8
/** Batas elemen yang dibaca untuk tampilan abstrak (koleksi yang lebih besar dipotong). */
export const BATAS_ELEMEN = 64
const BATAS_SIMPUL = 200
const TIPE_PRIMITIF = new Set(['int', 'float', 'double', 'long', 'short', 'byte', 'char', 'boolean'])

export { adalahObjekKoleksi }

const objekDi = (heap: Heap, x: Nilai | undefined): Objek | undefined => {
  if (typeof x !== 'number') return undefined
  const o = heap[x]
  return o?.k === 'objek' ? o : undefined
}

const ref = (o: Objek | undefined, f: string): number | null => {
  const v = o?.field[f]
  return typeof v === 'number' ? v : null
}

const int = (o: Objek | undefined, f: string): number | undefined => {
  const v = o?.field[f]
  return typeof v === 'number' ? v : undefined
}

const larikDi = (heap: Heap, x: Nilai | undefined) => {
  if (typeof x !== 'number') return undefined
  const o = heap[x]
  return o?.k === 'array' ? o : undefined
}

const KELAS_ENTRI = new Set([
  'java.util.HashMap$Node',
  'java.util.LinkedHashMap$Entry',
  'java.util.TreeMap$Entry',
  'java.util.AbstractMap$SimpleImmutableEntry',
])

/** Map.Entry: simpul map (HashMap$Node, TreeMap$Entry, …) yang dipegang program lewat entrySet(). */
export const adalahEntri = (o: ObjekHeap | undefined): boolean => o?.k === 'objek' && KELAS_ENTRI.has(o.kelas)

/** Objek iterator java.util (ArrayList$Itr, HashMap$KeyIterator, …). */
export const adalahIterator = (o: ObjekHeap | undefined): boolean => o?.k === 'objek' && o.kelas.startsWith('java.util.') && /(Itr|Iterator)$/.test(o.kelas)

/** Objek exception (bawaan maupun buatan mahasiswa). */
export const adalahException = (o: ObjekHeap | undefined): boolean =>
  o?.k === 'objek' && (o.jejak !== undefined || 'detailMessage' in o.field || /(Exception|Error)$/.test(o.kelas))

/** Objek milik pustaka Java (nama biner berawalan `java.`). */
export const adalahObjekPustaka = (o: ObjekHeap | undefined) => o?.k === 'objek' && o.kelas.startsWith('java.')

/** Pesan exception (`detailMessage`) atau null. */
export function pesanException(heap: Heap, o: Objek): string | null {
  const p = o.field.detailMessage
  if (typeof p !== 'number') return null
  const s = heap[p]
  return s?.k === 'string' ? s.nilai : null
}

const NAMA_KHUSUS: Record<string, string> = {
  'java.util.ImmutableCollections$ListN': 'List.of',
  'java.util.Arrays$ArrayList': 'Arrays.asList',
}

/** Nama koleksi untuk tampilan: `ArrayList`, `List.of`, view `HashMap.keySet()`. */
export function namaKoleksi(kelas: string): string {
  if (NAMA_KHUSUS[kelas]) return NAMA_KHUSUS[kelas]
  const m = /^java\.util\.(\w+)\$(?:Linked)?(KeySet|Values|EntrySet)$/.exec(kelas)
  if (m) return `${m[1]}.${m[2] === 'KeySet' ? 'keySet' : m[2] === 'Values' ? 'values' : 'entrySet'}()`
  return namaKelasTampil(kelas)
}

// ---------- Teks ringkas ----------
function teksField(heap: Heap, o: Objek, f: string): string {
  const v = o.field[f]
  const tipe = o.tipeField[f] ?? 'Object'
  if (v === null) return 'null'
  if (TIPE_PRIMITIF.has(tipe)) return tampilNilai(v, tipe, heap)
  const target = typeof v === 'number' ? heap[v] : undefined
  if (target?.k === 'objek') {
    if (adalahObjekKoleksi(heap, v as number)) return `${namaKoleksi(target.kelas)}(${ukuranKoleksi(heap, v as number)})`
    return `${namaKelasTampil(target.kelas)}#${v as number}`
  }
  if (target?.k === 'array') return `${target.tipeElemen}[${target.nilai.length}]`
  return tampilNilai(v, tipe, heap, 2)
}

/** Objek class mahasiswa secara ringkas, mis. `Mahasiswa{nama="Ani", ipk=3.5}`. */
export function ringkasObjek(heap: Heap, id: number, kedalaman = 0): string {
  const o = objekDi(heap, id)
  if (!o) return '…'
  const nama = namaKelasTampil(o.kelas)
  if (adalahException(o)) {
    const p = pesanException(heap, o)
    return p === null ? `${nama}()` : `${nama}("${p}")`
  }
  if (kedalaman >= 2) return `${nama}#${id}`
  const field = Object.keys(o.field).filter((f) => f !== 'this$0')
  const isi = field.slice(0, 3).map((f) => `${f}=${teksField(heap, o, f)}`)
  if (field.length > 3) isi.push('…')
  return `${nama}{${isi.join(', ')}}`
}

function teksKoleksi(heap: Heap, id: number, kedalaman: number): string {
  const o = objekDi(heap, id)!
  if (kedalaman >= 2) return `${namaKoleksi(o.kelas)}(${ukuranKoleksi(heap, id)})`
  const isi = bacaKoleksi(heap, id, BATAS_TEKS + 1)
  if (!isi) return namaKoleksi(o.kelas)
  if (isi.jenis === 'map') {
    const teks = isi.entri.slice(0, BATAS_TEKS).map(([k, v]) => `${teksElemen(k, heap, kedalaman + 1)}=${teksElemen(v, heap, kedalaman + 1)}`)
    if (isi.entri.length > BATAS_TEKS) teks.push('…')
    return `{${teks.join(', ')}}`
  }
  const teks = isi.elemen.slice(0, BATAS_TEKS).map((x) => teksElemen(x, heap, kedalaman + 1))
  if (isi.elemen.length > BATAS_TEKS) teks.push('…')
  return `[${teks.join(', ')}]`
}

/**
 * Teks satu nilai referensi di dalam koleksi/objek: wrapper `5`, String `"ab"`, koleksi bersarang `[1, 2]`,
 * entri `a=1`, objek mahasiswa `Node{data=3, next=Node#7}`.
 */
export function teksElemen(x: Nilai | undefined, heap: Heap, kedalaman = 0): string {
  if (x === undefined) return '?'
  if (x === null) return 'null'
  if (typeof x !== 'number') return String(x)
  const o = heap[x]
  if (!o) return '…'
  if (o.k === 'objek') {
    if (adalahObjekKoleksi(heap, x)) return teksKoleksi(heap, x, kedalaman)
    if (adalahEntri(o)) return `${teksElemen(o.field.key, heap, kedalaman + 1)}=${teksElemen(o.field.value, heap, kedalaman + 1)}`
    if (!o.kelas.startsWith('java.') || adalahException(o)) return ringkasObjek(heap, x, kedalaman)
    return namaKelasTampil(o.kelas)
  }
  return tampilNilai(x, 'Object', heap, kedalaman)
}

// ---------- Simpul & ukuran ----------
/** Simpul map (HashMap$Node/LinkedHashMap$Entry/TreeMap$Entry) dalam urutan iterasi JDK, sama dengan `bacaKoleksi`. */
export function simpulMap(heap: Heap, idMap: number, batas = BATAS_SIMPUL): number[] {
  const m = objekDi(heap, idMap)
  const hasil: number[] = []
  if (!m) return hasil
  const lihat = new Set<number>()
  const tambah = (e: number) => {
    if (lihat.has(e)) return false
    lihat.add(e)
    hasil.push(e)
    return true
  }
  if (m.kelas === 'java.util.LinkedHashMap') {
    for (let e = ref(m, 'head'); e !== null && hasil.length < batas; e = ref(objekDi(heap, e), 'after')) if (!tambah(e)) break
  } else if (m.kelas === 'java.util.HashMap') {
    const t = larikDi(heap, m.field.table)
    for (let i = 0; t && i < t.nilai.length && hasil.length < batas; i++) {
      const awal = t.nilai[i]
      for (let e = typeof awal === 'number' ? awal : null; e !== null && hasil.length < batas; e = ref(objekDi(heap, e), 'next')) if (!tambah(e)) break
    }
  } else if (m.kelas === 'java.util.TreeMap') {
    const tumpukan: number[] = []
    let e = ref(m, 'root')
    while ((e !== null || tumpukan.length) && hasil.length < batas) {
      while (e !== null && !lihat.has(e) && tumpukan.length < batas) {
        tumpukan.push(e)
        e = ref(objekDi(heap, e), 'left')
      }
      const x = tumpukan.pop()
      if (x === undefined) break
      if (!tambah(x)) break
      e = ref(objekDi(heap, x), 'right')
    }
  }
  return hasil
}

/** Map penopang sebuah set atau view (HashSet.map, TreeSet.m, HashMap$KeySet.this$0, TreeMap$KeySet.m). */
export function mapPenopang(heap: Heap, id: number): number | null {
  const o = objekDi(heap, id)
  if (!o) return null
  if (o.kelas === 'java.util.HashSet' || o.kelas === 'java.util.LinkedHashSet') return ref(o, 'map')
  if (o.kelas === 'java.util.TreeSet') return ref(o, 'm')
  if (/\$(Linked)?(KeySet|Values|EntrySet)$/.test(o.kelas)) return ref(o, 'this$0') ?? ref(o, 'm')
  return null
}

/** size() koleksi dari field internalnya (tanpa menelusuri seluruh isi). */
export function ukuranKoleksi(heap: Heap, id: number): number {
  const o = objekDi(heap, id)
  if (!o) return 0
  switch (o.kelas) {
    case 'java.util.Vector':
    case 'java.util.Stack':
      return int(o, 'elementCount') ?? 0
    case 'java.util.ArrayDeque': {
      const a = larikDi(heap, o.field.elements)
      const cap = a?.nilai.length ?? 0
      return cap ? (((int(o, 'tail') ?? 0) - (int(o, 'head') ?? 0)) % cap + cap) % cap : 0
    }
    case 'java.util.ImmutableCollections$ListN':
      return larikDi(heap, o.field.elements)?.nilai.length ?? 0
    case 'java.util.Arrays$ArrayList':
      return larikDi(heap, o.field.a)?.nilai.length ?? 0
  }
  if ('size' in o.field) return int(o, 'size') ?? 0
  const peta = mapPenopang(heap, id)
  return peta !== null ? ukuranKoleksi(heap, peta) : 0
}

// ---------- Ringkasan abstrak ----------
export interface ElemenKoleksi {
  nilai: Nilai
  teks: string
  /** Kunci sorotan sumber elemen ini: sel array internal (`el:`) atau simpulnya (`obj:`/`field:`). */
  kunci: string[]
  /** Kunci React yang stabil antarlangkah (slot array atau id simpul). */
  kunciReact: string
}

export interface EntriKoleksi {
  kunci: Nilai
  nilai: Nilai
  teksKunci: string
  teksNilai: string
  sumber: string[]
  kunciReact: string
}

interface DasarRingkasan {
  id: number
  kelas: string
  nama: string
  ukuran: number
  /** true bila tidak semua isi dibaca (koleksi sangat besar). */
  terpotong: boolean
}

export type RingkasanKoleksi =
  | (DasarRingkasan & { jenis: Exclude<JenisKoleksi, 'map'>; elemen: ElemenKoleksi[] })
  | (DasarRingkasan & { jenis: 'map'; entri: EntriKoleksi[] })

/** Ringkasan koleksi berelemen (List, Set, Queue/Deque, Stack, PriorityQueue). */
export type RingkasanElemen = Extract<RingkasanKoleksi, { elemen: ElemenKoleksi[] }>
/** Ringkasan Map. */
export type RingkasanPeta = Extract<RingkasanKoleksi, { jenis: 'map' }>

/** Kunci sorotan + kunci React tiap elemen, dalam urutan iterasi (undefined bila kelas tidak dikenali). */
function sumberElemen(heap: Heap, id: number, o: Objek, n: number): { kunci: string[]; react: string }[] | undefined {
  const dariLarik = (arr: number | null, posisi: (i: number) => number) =>
    arr === null ? undefined : Array.from({ length: n }, (_, i) => ({ kunci: [`el:${arr}:${posisi(i)}`], react: `s${posisi(i)}` }))
  switch (o.kelas) {
    case 'java.util.ArrayList':
    case 'java.util.Vector':
    case 'java.util.Stack':
      return dariLarik(ref(o, 'elementData'), (i) => i)
    case 'java.util.ImmutableCollections$ListN':
      return dariLarik(ref(o, 'elements'), (i) => i)
    case 'java.util.Arrays$ArrayList':
      return dariLarik(ref(o, 'a'), (i) => i)
    case 'java.util.PriorityQueue':
      return dariLarik(ref(o, 'queue'), (i) => i)
    case 'java.util.ArrayDeque': {
      const arr = ref(o, 'elements')
      const cap = larikDi(heap, arr)?.nilai.length ?? 0
      const head = int(o, 'head') ?? 0
      return cap ? dariLarik(arr, (i) => (head + i) % cap) : undefined
    }
    case 'java.util.LinkedList': {
      const hasil: { kunci: string[]; react: string }[] = []
      const lihat = new Set<number>()
      for (let x = ref(o, 'first'); x !== null && hasil.length < n && !lihat.has(x); x = ref(objekDi(heap, x), 'next')) {
        lihat.add(x)
        hasil.push({ kunci: [`obj:${x}`, `field:${x}:item`], react: `n${x}` })
      }
      return hasil
    }
  }
  const peta = mapPenopang(heap, id)
  if (peta !== null) return simpulMap(heap, peta, n).map((x) => ({ kunci: [`obj:${x}`, `field:${x}:key`, `field:${x}:value`], react: `n${x}` }))
  return undefined
}

/** Ringkasan abstrak koleksi `id` (urutan iterasi JDK), atau undefined bila bukan koleksi yang dikenal. */
export function ringkasKoleksi(heap: Heap, id: number, batas = BATAS_ELEMEN): RingkasanKoleksi | undefined {
  const o = objekDi(heap, id)
  if (!o || !adalahObjekKoleksi(heap, id)) return undefined
  const isi = bacaKoleksi(heap, id, batas)
  if (!isi) return undefined
  const ukuran = ukuranKoleksi(heap, id)
  const dasar = { id, kelas: o.kelas, nama: namaKoleksi(o.kelas) }
  if (isi.jenis === 'map') {
    const simpul = simpulMap(heap, id, batas)
    const cocok = simpul.length === isi.entri.length
    const entri = isi.entri.map(([k, v], i): EntriKoleksi => {
      const s = cocok ? simpul[i] : undefined
      return {
        kunci: k,
        nilai: v,
        teksKunci: teksElemen(k, heap, 1),
        teksNilai: teksElemen(v, heap, 1),
        sumber: s === undefined ? [] : [`obj:${s}`, `field:${s}:value`, `field:${s}:key`],
        kunciReact: s === undefined ? `i${i}` : `n${s}`,
      }
    })
    return { ...dasar, jenis: 'map', ukuran: Math.max(ukuran, entri.length), entri, terpotong: ukuran > entri.length }
  }
  const sumber = sumberElemen(heap, id, o, isi.elemen.length)
  const cocok = sumber !== undefined && sumber.length === isi.elemen.length
  const elemen = isi.elemen.map(
    (x, i): ElemenKoleksi => ({
      nilai: x,
      teks: teksElemen(x, heap, 1),
      kunci: cocok ? sumber![i].kunci : [],
      kunciReact: cocok ? sumber![i].react : `i${i}`,
    }),
  )
  return { ...dasar, jenis: isi.jenis, ukuran: Math.max(ukuran, elemen.length), elemen, terpotong: ukuran > elemen.length }
}

/** Teks ringkas koleksi untuk kartu Memori, mis. `[3, 1, 4]` atau `{a=1, b=2}`. */
export function teksRingkasKoleksi(r: RingkasanKoleksi, maks = BATAS_TEKS): string {
  if (r.jenis === 'map') {
    const isi = r.entri.slice(0, maks).map((e) => `${e.teksKunci}=${e.teksNilai}`)
    if (r.ukuran > maks) isi.push('…')
    return `{${isi.join(', ')}}`
  }
  const isi = r.elemen.slice(0, maks).map((e) => e.teks)
  if (r.ukuran > maks) isi.push('…')
  return `[${isi.join(', ')}]`
}

// ---------- Objek internal ----------
/**
 * Semua objek internal milik koleksi `id` (termasuk dirinya): array penyimpan, simpul, map penopang, view.
 * Elemen koleksi (data) tidak ikut: field bertipe `Object` (item/key/value) dan isi array `Object[]` tidak ditelusuri.
 */
export function objekInternal(heap: Heap, id: number): number[] {
  const hasil: number[] = []
  const lihat = new Set<number>()
  const antre = [id]
  while (antre.length && hasil.length < 4 * BATAS_SIMPUL) {
    const x = antre.shift()!
    if (lihat.has(x)) continue
    const o = heap[x]
    if (!o) continue
    lihat.add(x)
    hasil.push(x)
    if (o.k === 'array') {
      if (o.tipeElemen.startsWith('java.util.')) for (const e of o.nilai) if (typeof e === 'number') antre.push(e)
      continue
    }
    if (o.k !== 'objek') continue
    for (const [f, v] of Object.entries(o.field)) {
      if (typeof v !== 'number') continue
      const tipe = o.tipeField[f] ?? 'Object'
      if (tipe === 'Object' || tipe === 'java.util.Comparator') continue
      const t = heap[v]
      if (t?.k === 'array' || (t?.k === 'objek' && t.kelas.startsWith('java.util.'))) antre.push(v)
    }
  }
  return hasil
}

// ---------- Isi dalam (struktur internal JDK) ----------
export interface FieldInternal {
  nama: string
  teks: string
  kunci: string
}

export interface SelInternal {
  indeks: number
  nilai: Nilai
  teks: string
  kunci: string
  kosong: boolean
}

export interface SimpulInternal {
  id: number
  /** Field data simpul, mis. `item`, atau `hash`/`key`/`value`. */
  isi: FieldInternal[]
  /** Field referensi antarsimpul (next/prev/left/right/parent/before/after): id tujuan atau null. */
  ref: Record<string, number | null>
  /** TreeMap$Entry: warna merah (field `color` false). */
  merah?: boolean
}

interface DasarDalam {
  id: number
  kelas: string
  /** Field bertipe primitif milik objek koleksi, mis. `size`, `modCount`, `threshold`. */
  field: FieldInternal[]
}

export type IsiDalam =
  | (DasarDalam & { k: 'larik'; namaLarik: string; idLarik: number | null; sel: SelInternal[]; ukuran: number; namaUkuran?: string })
  | (DasarDalam & { k: 'melingkar'; namaLarik: string; idLarik: number | null; sel: SelInternal[]; head: number; tail: number })
  | (DasarDalam & { k: 'heap'; namaLarik: string; idLarik: number | null; sel: SelInternal[]; ukuran: number })
  | (DasarDalam & { k: 'berantai'; simpul: SimpulInternal[]; first: number | null; last: number | null; melingkar: boolean })
  | (DasarDalam & {
      k: 'tabel'
      idLarik: number | null
      bucket: { indeks: number; kunci: string; simpul: SimpulInternal[] }[]
      /** LinkedHashMap: urutan sisip lewat before/after (id simpul). */
      urutan?: number[]
      head?: number | null
      tail?: number | null
    })
  | (DasarDalam & { k: 'pohon'; akar: number | null; simpul: SimpulInternal[] })
  | (DasarDalam & { k: 'bungkus'; namaField: string; dalam: IsiDalam | null })

/** Field bertipe primitif sebuah objek internal, mis. `size = 3`, `modCount = 4`, `loadFactor = 0.75`. */
function fieldPrimitif(o: Objek, id: number, heap: Heap): FieldInternal[] {
  return Object.entries(o.field)
    .filter(([f]) => TIPE_PRIMITIF.has(o.tipeField[f] ?? ''))
    .map(([f, v]) => ({ nama: f, teks: tampilNilai(v, o.tipeField[f], heap), kunci: `field:${id}:${f}` }))
}

function selLarik(heap: Heap, idLarik: number | null, teks: (x: Nilai) => string = (x) => teksElemen(x, heap, 1)): SelInternal[] {
  const a = larikDi(heap, idLarik ?? undefined)
  if (!a || idLarik === null) return []
  return a.nilai.map((x, i) => ({ indeks: i, nilai: x, teks: x === null ? 'null' : teks(x), kunci: `el:${idLarik}:${i}`, kosong: x === null }))
}

function simpulDari(heap: Heap, id: number, isi: string[], refs: string[], present: boolean): SimpulInternal {
  const o = objekDi(heap, id)
  const s: SimpulInternal = {
    id,
    isi: isi
      .filter((f) => o !== undefined && f in o.field)
      .map((f) => {
        const v = o!.field[f]
        const tipe = o!.tipeField[f] ?? 'Object'
        const teks = present && f === 'value' && objekDi(heap, v)?.kelas === 'java.lang.Object' ? 'PRESENT' : tipe === 'Object' ? teksElemen(v, heap, 1) : tampilNilai(v, tipe, heap)
        return { nama: f, teks, kunci: `field:${id}:${f}` }
      }),
    ref: Object.fromEntries(refs.map((f) => [f, ref(o, f)])),
  }
  if (o && 'color' in o.field) s.merah = o.field.color === false
  return s
}

/** Struktur internal JDK koleksi `id` untuk tampilan "Lihat isi dalam", atau null bila tidak dikenal. */
export function isiDalam(heap: Heap, id: number, present = false): IsiDalam | null {
  const o = objekDi(heap, id)
  if (!o) return null
  const field = fieldPrimitif(o, id, heap)
  const dasar = { id, kelas: o.kelas, field }
  switch (o.kelas) {
    case 'java.util.ArrayList':
      return { ...dasar, k: 'larik', namaLarik: 'elementData', idLarik: ref(o, 'elementData'), sel: selLarik(heap, ref(o, 'elementData')), ukuran: int(o, 'size') ?? 0, namaUkuran: 'size' }
    case 'java.util.Vector':
    case 'java.util.Stack':
      return { ...dasar, k: 'larik', namaLarik: 'elementData', idLarik: ref(o, 'elementData'), sel: selLarik(heap, ref(o, 'elementData')), ukuran: int(o, 'elementCount') ?? 0, namaUkuran: 'elementCount' }
    case 'java.util.ImmutableCollections$ListN': {
      const sel = selLarik(heap, ref(o, 'elements'))
      return { ...dasar, k: 'larik', namaLarik: 'elements', idLarik: ref(o, 'elements'), sel, ukuran: sel.length }
    }
    case 'java.util.Arrays$ArrayList': {
      const sel = selLarik(heap, ref(o, 'a'))
      return { ...dasar, k: 'larik', namaLarik: 'a', idLarik: ref(o, 'a'), sel, ukuran: sel.length }
    }
    case 'java.util.ArrayDeque':
      return { ...dasar, k: 'melingkar', namaLarik: 'elements', idLarik: ref(o, 'elements'), sel: selLarik(heap, ref(o, 'elements')), head: int(o, 'head') ?? 0, tail: int(o, 'tail') ?? 0 }
    case 'java.util.PriorityQueue':
      return { ...dasar, k: 'heap', namaLarik: 'queue', idLarik: ref(o, 'queue'), sel: selLarik(heap, ref(o, 'queue')), ukuran: int(o, 'size') ?? 0 }
    case 'java.util.LinkedList': {
      const simpul: SimpulInternal[] = []
      const lihat = new Set<number>()
      let melingkar = false
      for (let x = ref(o, 'first'); x !== null && simpul.length < BATAS_SIMPUL; x = ref(objekDi(heap, x), 'next')) {
        if (lihat.has(x)) {
          melingkar = true
          break
        }
        lihat.add(x)
        simpul.push(simpulDari(heap, x, ['item'], ['prev', 'next'], false))
      }
      return { ...dasar, k: 'berantai', simpul, first: ref(o, 'first'), last: ref(o, 'last'), melingkar }
    }
    case 'java.util.HashMap':
    case 'java.util.LinkedHashMap': {
      const idTabel = ref(o, 'table')
      const t = larikDi(heap, idTabel ?? undefined)
      const linked = o.kelas === 'java.util.LinkedHashMap'
      const refs = linked ? ['next', 'before', 'after'] : ['next']
      const bucket = (t?.nilai ?? []).map((awal, i) => {
        const simpul: SimpulInternal[] = []
        const lihat = new Set<number>()
        for (let e = typeof awal === 'number' ? awal : null; e !== null && !lihat.has(e) && simpul.length < BATAS_SIMPUL; e = ref(objekDi(heap, e), 'next')) {
          lihat.add(e)
          simpul.push(simpulDari(heap, e, ['hash', 'key', 'value'], refs, present))
        }
        return { indeks: i, kunci: `el:${idTabel}:${i}`, simpul }
      })
      const hasil: IsiDalam = { ...dasar, k: 'tabel', idLarik: idTabel, bucket }
      if (linked) {
        hasil.urutan = simpulMap(heap, id)
        hasil.head = ref(o, 'head')
        hasil.tail = ref(o, 'tail')
      }
      return hasil
    }
    case 'java.util.TreeMap': {
      const simpul: SimpulInternal[] = []
      const lihat = new Set<number>()
      const antre = [ref(o, 'root')]
      while (antre.length && simpul.length < BATAS_SIMPUL) {
        const x = antre.shift()
        if (x === null || x === undefined || lihat.has(x)) continue
        lihat.add(x)
        const s = simpulDari(heap, x, ['key', 'value'], ['left', 'right', 'parent'], present)
        simpul.push(s)
        antre.push(s.ref.left, s.ref.right)
      }
      return { ...dasar, k: 'pohon', akar: ref(o, 'root'), simpul }
    }
  }
  const peta = mapPenopang(heap, id)
  if (peta !== null) {
    const namaField = 'm' in o.field ? 'm' : 'map' in o.field ? 'map' : 'this$0'
    // HashSet/TreeSet menyimpan elemen sebagai kunci map penopang dengan nilai bersama PRESENT; view memakai map aslinya.
    const set = o.kelas.endsWith('Set') && !o.kelas.includes('$')
    return { ...dasar, k: 'bungkus', namaField, dalam: isiDalam(heap, peta, set) }
  }
  return null
}
