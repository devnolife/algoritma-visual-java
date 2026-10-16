import type { Nilai } from '../../nilai'
import { ArrayDequeModel } from './arrayDeque'
import {
  arrayDari,
  bacaInt,
  bacaRef,
  cme,
  iae,
  isiArray,
  ise,
  iteratorLokal,
  naikkan,
  npe,
  nsee,
  panjangBaru,
  pesanNpePanggil,
  salinBaru,
  teksKoleksi,
  type HeapKoleksi,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
import { daftarkanKoleksi, iterasi, modelDari, operasiIterator } from './registri'

/**
 * java.util.PriorityQueue{queue, size, comparator, modCount}: binary min-heap di array `queue`.
 * toString/iterator mengikuti urutan array, bukan urutan prioritas.
 */
export const KELAS_PRIORITYQUEUE = 'java.util.PriorityQueue'
const KELAS_ITR = 'java.util.PriorityQueue$Itr'
const KAPASITAS_AWAL_BAWAAN = 11

const TIPE: Record<string, string> = {
  queue: 'Object[]',
  size: 'int',
  comparator: 'java.util.Comparator',
  modCount: 'int',
}
const TIPE_ITR: Record<string, string> = {
  cursor: 'int',
  lastRet: 'int',
  forgetMeNot: 'java.util.ArrayDeque',
  lastRetElt: 'Object',
  expectedModCount: 'int',
  this$0: KELAS_PRIORITYQUEUE,
}

type H = HeapKoleksi
type O = OperasiElemen

const antrean = (h: H, id: number) => h.bacaField(id, 'queue') as number
const ukuran = (h: H, id: number) => bacaInt(h, id, 'size')
const pembandingDari = (h: H, id: number) => bacaRef(h, id, 'comparator')

/** ((Comparable) x).compareTo(y); `penerima` = nama variabel di JDK untuk pesan helpful NPE. */
function bandingAlami(ops: O, x: Nilai, y: Nilai, penerima: string): number {
  if (x === null)
    throw npe(`Cannot invoke "java.lang.Comparable.compareTo(Object)" because "${penerima}" is null`)
  return ops.compareTo(x as number, y)
}

/** Cast `(Comparable) x` (null selalu lolos cast). */
function castComparable(ops: O, x: Nilai): void {
  if (x !== null) ops.pastikanComparable(x as number)
}

function siftUpComparable(h: H, ops: O, k: number, x: Nilai, es: number): void {
  castComparable(ops, x)
  while (k > 0) {
    const parent = (k - 1) >>> 1
    const e = h.bacaElemen(es, parent)
    if (bandingAlami(ops, x, e, 'key') >= 0) break
    h.tulisElemen(es, k, e)
    k = parent
  }
  h.tulisElemen(es, k, x)
}

function siftUpUsingComparator(h: H, ops: O, k: number, x: Nilai, es: number, cmp: number): void {
  while (k > 0) {
    const parent = (k - 1) >>> 1
    const e = h.bacaElemen(es, parent)
    if (ops.compare(cmp, x, e) >= 0) break
    h.tulisElemen(es, k, e)
    k = parent
  }
  h.tulisElemen(es, k, x)
}

function siftDownComparable(h: H, ops: O, k: number, x: Nilai, es: number, n: number): void {
  castComparable(ops, x)
  const half = n >>> 1
  while (k < half) {
    let child = (k << 1) + 1
    let c = h.bacaElemen(es, child)
    const right = child + 1
    if (right < n && bandingAlami(ops, c, h.bacaElemen(es, right), 'c') > 0)
      c = h.bacaElemen(es, (child = right))
    if (bandingAlami(ops, x, c, 'key') <= 0) break
    h.tulisElemen(es, k, c)
    k = child
  }
  h.tulisElemen(es, k, x)
}

function siftDownUsingComparator(
  h: H,
  ops: O,
  k: number,
  x: Nilai,
  es: number,
  n: number,
  cmp: number,
): void {
  const half = n >>> 1
  while (k < half) {
    let child = (k << 1) + 1
    let c = h.bacaElemen(es, child)
    const right = child + 1
    if (right < n && ops.compare(cmp, c, h.bacaElemen(es, right)) > 0) c = h.bacaElemen(es, (child = right))
    if (ops.compare(cmp, x, c) <= 0) break
    h.tulisElemen(es, k, c)
    k = child
  }
  h.tulisElemen(es, k, x)
}

function siftUp(h: H, ops: O, id: number, k: number, x: Nilai): void {
  const cmp = pembandingDari(h, id)
  if (cmp !== null) siftUpUsingComparator(h, ops, k, x, antrean(h, id), cmp)
  else siftUpComparable(h, ops, k, x, antrean(h, id))
}

function siftDown(h: H, ops: O, id: number, k: number, x: Nilai): void {
  const cmp = pembandingDari(h, id)
  if (cmp !== null) siftDownUsingComparator(h, ops, k, x, antrean(h, id), ukuran(h, id), cmp)
  else siftDownComparable(h, ops, k, x, antrean(h, id), ukuran(h, id))
}

/** heapify(): siftDown dari induk terakhir ke akar. */
function heapify(h: H, ops: O, id: number): void {
  const es = antrean(h, id)
  const n = ukuran(h, id)
  const cmp = pembandingDari(h, id)
  for (let i = (n >>> 1) - 1; i >= 0; i--) {
    if (cmp === null) siftDownComparable(h, ops, i, h.bacaElemen(es, i), es, n)
    else siftDownUsingComparator(h, ops, i, h.bacaElemen(es, i), es, n, cmp)
  }
}

function buat(h: H, queue: number, size: number, comparator: Nilai): number {
  return h.baruObjek(KELAS_PRIORITYQUEUE, { queue, size, comparator, modCount: 0 }, TIPE)
}

/** new PriorityQueue<>(), (kapasitas), (comparator), (kapasitas, comparator). Kapasitas < 1 → IAE. */
function baru(h: H, kapasitas = KAPASITAS_AWAL_BAWAAN, pembanding: number | null = null): number {
  if (kapasitas < 1) throw iae()
  return buat(h, h.baruArray('Object', kapasitas), 0, pembanding)
}

/** initElementsFromCollection: salin isi c; cek null bila hanya 1 elemen atau ada comparator. */
function isiDariKoleksi(h: H, isi: Nilai[], cmp: Nilai): { queue: number; size: number } {
  if (isi.length === 1 || cmp !== null) for (const e of isi) if (e === null) throw npe()
  return { queue: isi.length > 0 ? arrayDari(h, isi) : h.baruArray('Object', 1), size: isi.length }
}

/**
 * new PriorityQueue<>(c): SortedSet → comparator-nya dipakai, tanpa heapify; PriorityQueue → salinan
 * array apa adanya; selainnya salin lalu heapify.
 */
function dariKoleksi(h: H, ops: O, c: Nilai): number {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const m = modelDari(h, c as number)
  if (m.sortedSet) {
    const cmp = m.comparator ? m.comparator(h, c as number) : null
    const { queue, size } = isiDariKoleksi(h, m.keArray(h, ops, c as number), cmp)
    return buat(h, queue, size, cmp)
  }
  if (m.kelas === KELAS_PRIORITYQUEUE) {
    const isi = m.keArray(h, ops, c as number)
    const queue = isi.length > 0 ? arrayDari(h, isi) : h.baruArray('Object', 1)
    return buat(h, queue, m.size(h, ops, c as number), pembandingDari(h, c as number))
  }
  const { queue, size } = isiDariKoleksi(h, m.keArray(h, ops, c as number), null)
  const id = buat(h, queue, size, null)
  heapify(h, ops, id)
  return id
}

/** grow: kapasitas < 64 jadi 2x + 2, selainnya +50%. */
function grow(h: H, id: number, minCapacity: number): void {
  const lama = antrean(h, id)
  const kapLama = h.panjangArray(lama)
  const kapBaru = panjangBaru(kapLama, minCapacity - kapLama, kapLama < 64 ? kapLama + 2 : kapLama >> 1)
  h.tulisField(id, 'queue', salinBaru(h, lama, kapBaru))
}

function offer(h: H, ops: O, id: number, e: Nilai): boolean {
  if (e === null) throw npe()
  naikkan(h, id)
  const i = ukuran(h, id)
  if (i >= h.panjangArray(antrean(h, id))) grow(h, id, i + 1)
  siftUp(h, ops, id, i, e)
  h.tulisField(id, 'size', i + 1)
  return true
}

function peek(h: H, _ops: O, id: number): Nilai {
  return h.bacaElemen(antrean(h, id), 0)
}

function poll(h: H, ops: O, id: number): Nilai {
  const es = antrean(h, id)
  const hasil = h.bacaElemen(es, 0)
  if (hasil !== null) {
    naikkan(h, id)
    const n = ukuran(h, id) - 1
    h.tulisField(id, 'size', n)
    const x = h.bacaElemen(es, n)
    h.tulisElemen(es, n, null)
    if (n > 0) {
      const cmp = pembandingDari(h, id)
      if (cmp === null) siftDownComparable(h, ops, 0, x, es, n)
      else siftDownUsingComparator(h, ops, 0, x, es, n, cmp)
    }
  }
  return hasil
}

/** AbstractQueue.element(). */
function element(h: H, ops: O, id: number): Nilai {
  const x = peek(h, ops, id)
  if (x === null) throw nsee()
  return x
}

/** AbstractQueue.remove(). */
function remove(h: H, ops: O, id: number): Nilai {
  const x = poll(h, ops, id)
  if (x === null) throw nsee()
  return x
}

function indexOf(h: H, ops: O, id: number, o: Nilai): number {
  if (o !== null) {
    const es = antrean(h, id)
    for (let i = 0, n = ukuran(h, id); i < n; i++) if (ops.equals(o as number, h.bacaElemen(es, i))) return i
  }
  return -1
}

/**
 * removeAt(i): elemen terakhir mengisi lubang lewat siftDown, lalu siftUp bila tidak turun.
 * Mengembalikan elemen itu bila ia naik melewati i (iterator lalu menyimpannya di forgetMeNot).
 */
function removeAt(h: H, ops: O, id: number, i: number): Nilai {
  const es = antrean(h, id)
  naikkan(h, id)
  const s = ukuran(h, id) - 1
  h.tulisField(id, 'size', s)
  if (s === i) {
    h.tulisElemen(es, i, null)
  } else {
    const dipindah = h.bacaElemen(es, s)
    h.tulisElemen(es, s, null)
    siftDown(h, ops, id, i, dipindah)
    if (h.bacaElemen(es, i) === dipindah) {
      siftUp(h, ops, id, i, dipindah)
      if (h.bacaElemen(es, i) !== dipindah) return dipindah
    }
  }
  return null
}

/** remove(Object o). */
function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  const i = indexOf(h, ops, id, o)
  if (i === -1) return false
  removeAt(h, ops, id, i)
  return true
}

/** removeEq: hapus berdasarkan identitas (dipakai iterator untuk elemen forgetMeNot). */
function removeEq(h: H, ops: O, id: number, o: Nilai): void {
  const es = antrean(h, id)
  for (let i = 0, n = ukuran(h, id); i < n; i++) {
    if (o === h.bacaElemen(es, i)) {
      removeAt(h, ops, id, i)
      break
    }
  }
}

function contains(h: H, ops: O, id: number, o: Nilai): boolean {
  return indexOf(h, ops, id, o) >= 0
}

function size(h: H, _ops: O, id: number): number {
  return ukuran(h, id)
}

function isEmpty(h: H, _ops: O, id: number): boolean {
  return ukuran(h, id) === 0
}

function clear(h: H, _ops: O, id: number): void {
  naikkan(h, id)
  const es = antrean(h, id)
  for (let i = 0, n = ukuran(h, id); i < n; i++) h.tulisElemen(es, i, null)
  h.tulisField(id, 'size', 0)
}

/** AbstractQueue.addAll: tolak null dan diri sendiri, lalu add per elemen dalam urutan iterasi c. */
function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  if (c === null) throw npe()
  if (c === id) throw iae()
  let berubah = false
  const it = iterasi(h, ops, c as number)
  while (it.hasNext()) if (offer(h, ops, id, it.next())) berubah = true
  return berubah
}

function comparator(h: H, id: number): Nilai {
  return pembandingDari(h, id)
}

/** toArray(): Arrays.copyOf(queue, size), urutan array. */
function toArray(h: H, _ops: O, id: number): Nilai[] {
  return isiArray(h, antrean(h, id), 0, ukuran(h, id))
}

function toString(h: H, ops: O, id: number): string {
  return teksKoleksi(ops, id, iterasi(h, ops, id))
}

// ---------- PriorityQueue$Itr ----------
const pqItr = (w: Wadah) => w.baca('this$0') as number

function cekKomodifikasi(h: H, w: Wadah): void {
  if (w.baca('expectedModCount') !== bacaInt(h, pqItr(w), 'modCount')) throw cme()
}

const LOGIKA_ITR: LogikaIterator = {
  hasNext(h, ops, w) {
    if ((w.baca('cursor') as number) < ukuran(h, pqItr(w))) return true
    const fmn = w.baca('forgetMeNot') as number | null
    return fmn !== null && !ArrayDequeModel.isEmpty(h, ops, fmn)
  },
  next(h, ops, w) {
    cekKomodifikasi(h, w)
    const id = pqItr(w)
    const cursor = w.baca('cursor') as number
    if (cursor < ukuran(h, id)) {
      w.tulis('cursor', cursor + 1)
      w.tulis('lastRet', cursor)
      return h.bacaElemen(antrean(h, id), cursor)
    }
    const fmn = w.baca('forgetMeNot') as number | null
    if (fmn !== null) {
      w.tulis('lastRet', -1)
      const e = ArrayDequeModel.poll(h, ops, fmn)
      w.tulis('lastRetElt', e)
      if (e !== null) return e
    }
    throw nsee()
  },
  remove(h, ops, w) {
    cekKomodifikasi(h, w)
    const id = pqItr(w)
    const lastRet = w.baca('lastRet') as number
    const lastRetElt = w.baca('lastRetElt')
    if (lastRet !== -1) {
      const dipindah = removeAt(h, ops, id, lastRet)
      w.tulis('lastRet', -1)
      if (dipindah === null) {
        w.tulis('cursor', (w.baca('cursor') as number) - 1)
      } else {
        let fmn = w.baca('forgetMeNot') as number | null
        if (fmn === null) {
          fmn = ArrayDequeModel.baru(h)
          w.tulis('forgetMeNot', fmn)
        }
        ArrayDequeModel.add(h, ops, fmn, dipindah)
      }
    } else if (lastRetElt !== null) {
      removeEq(h, ops, id, lastRetElt)
      w.tulis('lastRetElt', null)
    } else {
      throw ise()
    }
    w.tulis('expectedModCount', bacaInt(h, id, 'modCount'))
  },
}

const fieldItr = (h: H, id: number): Record<string, Nilai> => ({
  cursor: 0,
  lastRet: -1,
  forgetMeNot: null,
  lastRetElt: null,
  expectedModCount: bacaInt(h, id, 'modCount'),
  this$0: id,
})

function iterator(h: H, _ops: O, id: number): number {
  return h.baruObjek(KELAS_ITR, fieldItr(h, id), TIPE_ITR)
}

const operasiItr = operasiIterator({ [KELAS_ITR]: LOGIKA_ITR })

export const PriorityQueueModel = {
  baru,
  dariKoleksi,
  offer,
  add: offer,
  peek,
  poll,
  element,
  /** remove() pada Queue. */
  remove,
  removeObjek,
  contains,
  size,
  isEmpty,
  clear,
  addAll,
  comparator,
  toArray,
  toString,
  iterator,
}

/** Operasi objek `PriorityQueue$Itr`. */
export const PriorityQueueItr = operasiItr

daftarkanKoleksi({
  kelas: KELAS_PRIORITYQUEUE,
  kelasIterator: [KELAS_ITR],
  list: false,
  size,
  contains,
  keArray: toArray,
  add: offer,
  iterator,
  ...operasiItr,
  iterasi: (h, ops, id) => iteratorLokal(h, ops, LOGIKA_ITR, fieldItr(h, id)),
  teks: toString,
  comparator,
})
