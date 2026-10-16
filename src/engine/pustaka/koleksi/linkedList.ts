import type { Nilai } from '../../nilai'
import {
  arrayDari,
  bacaInt,
  bacaRef,
  cme,
  iobe,
  ise,
  iteratorLokal,
  naikkan,
  npe,
  nsee,
  pesanNpePanggil,
  teksKoleksi,
  wadahLokal,
  type HeapKoleksi,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
import {
  daftarkanKoleksi,
  equalsAbstractList,
  hashCodeAbstractList,
  iterasi,
  keArray,
  operasiIterator,
  type IteratorDaftarLokal,
} from './registri'
import { urutkan } from './urut'

/** java.util.LinkedList{size, first, last, modCount} dengan simpul `LinkedList$Node{item, next, prev}`. */
export const KELAS_LINKEDLIST = 'java.util.LinkedList'
export const KELAS_NODE = 'java.util.LinkedList$Node'
const KELAS_LISTITR = 'java.util.LinkedList$ListItr'

const TIPE: Record<string, string> = { size: 'int', first: KELAS_NODE, last: KELAS_NODE, modCount: 'int' }
const TIPE_NODE: Record<string, string> = { item: 'Object', next: KELAS_NODE, prev: KELAS_NODE }
const TIPE_LISTITR: Record<string, string> = {
  lastReturned: KELAS_NODE,
  next: KELAS_NODE,
  nextIndex: 'int',
  expectedModCount: 'int',
  this$0: KELAS_LINKEDLIST,
}

type H = HeapKoleksi
type O = OperasiElemen

const ukuran = (h: H, id: number) => bacaInt(h, id, 'size')
const pertama = (h: H, id: number) => bacaRef(h, id, 'first')
const terakhir = (h: H, id: number) => bacaRef(h, id, 'last')
const isi = (h: H, x: number) => h.bacaField(x, 'item')
const berikut = (h: H, x: number) => bacaRef(h, x, 'next')
const sebelum = (h: H, x: number) => bacaRef(h, x, 'prev')

/** new Node<>(prev, element, next). */
const simpulBaru = (h: H, prev: number | null, item: Nilai, next: number | null) =>
  h.baruObjek(KELAS_NODE, { item, next, prev }, TIPE_NODE)

function ubahUkuran(h: H, id: number, delta: number): void {
  h.tulisField(id, 'size', ukuran(h, id) + delta)
}

function linkFirst(h: H, id: number, e: Nilai): void {
  const f = pertama(h, id)
  const simpul = simpulBaru(h, null, e, f)
  h.tulisField(id, 'first', simpul)
  if (f === null) h.tulisField(id, 'last', simpul)
  else h.tulisField(f, 'prev', simpul)
  ubahUkuran(h, id, 1)
  naikkan(h, id)
}

function linkLast(h: H, id: number, e: Nilai): void {
  const l = terakhir(h, id)
  const simpul = simpulBaru(h, l, e, null)
  h.tulisField(id, 'last', simpul)
  if (l === null) h.tulisField(id, 'first', simpul)
  else h.tulisField(l, 'next', simpul)
  ubahUkuran(h, id, 1)
  naikkan(h, id)
}

function linkBefore(h: H, id: number, e: Nilai, succ: number): void {
  const pred = sebelum(h, succ)
  const simpul = simpulBaru(h, pred, e, succ)
  h.tulisField(succ, 'prev', simpul)
  if (pred === null) h.tulisField(id, 'first', simpul)
  else h.tulisField(pred, 'next', simpul)
  ubahUkuran(h, id, 1)
  naikkan(h, id)
}

function unlinkFirst(h: H, id: number, f: number): Nilai {
  const elemen = isi(h, f)
  const next = berikut(h, f)
  h.tulisField(f, 'item', null)
  h.tulisField(f, 'next', null)
  h.tulisField(id, 'first', next)
  if (next === null) h.tulisField(id, 'last', null)
  else h.tulisField(next, 'prev', null)
  ubahUkuran(h, id, -1)
  naikkan(h, id)
  return elemen
}

function unlinkLast(h: H, id: number, l: number): Nilai {
  const elemen = isi(h, l)
  const prev = sebelum(h, l)
  h.tulisField(l, 'item', null)
  h.tulisField(l, 'prev', null)
  h.tulisField(id, 'last', prev)
  if (prev === null) h.tulisField(id, 'first', null)
  else h.tulisField(prev, 'next', null)
  ubahUkuran(h, id, -1)
  naikkan(h, id)
  return elemen
}

function unlink(h: H, id: number, x: number): Nilai {
  const elemen = isi(h, x)
  const next = berikut(h, x)
  const prev = sebelum(h, x)
  if (prev === null) {
    h.tulisField(id, 'first', next)
  } else {
    h.tulisField(prev, 'next', next)
    h.tulisField(x, 'prev', null)
  }
  if (next === null) {
    h.tulisField(id, 'last', prev)
  } else {
    h.tulisField(next, 'prev', prev)
    h.tulisField(x, 'next', null)
  }
  h.tulisField(x, 'item', null)
  ubahUkuran(h, id, -1)
  naikkan(h, id)
  return elemen
}

/** node(index): berjalan dari ujung yang lebih dekat. */
function simpulKe(h: H, id: number, index: number): number {
  const s = ukuran(h, id)
  if (index < s >> 1) {
    let x = pertama(h, id) as number
    for (let i = 0; i < index; i++) x = berikut(h, x) as number
    return x
  }
  let x = terakhir(h, id) as number
  for (let i = s - 1; i > index; i--) x = sebelum(h, x) as number
  return x
}

const pesanBatas = (h: H, id: number, index: number) => `Index: ${index}, Size: ${ukuran(h, id)}`

function cekIndeksElemen(h: H, id: number, index: number): void {
  if (!(index >= 0 && index < ukuran(h, id))) throw iobe(pesanBatas(h, id, index))
}

function cekIndeksPosisi(h: H, id: number, index: number): void {
  if (!(index >= 0 && index <= ukuran(h, id))) throw iobe(pesanBatas(h, id, index))
}

function baru(h: H): number {
  return h.baruObjek(KELAS_LINKEDLIST, { size: 0, first: null, last: null, modCount: 0 }, TIPE)
}

/** new LinkedList<>(c) = this(); addAll(c). */
function dariKoleksi(h: H, ops: O, c: Nilai): number {
  const id = baru(h)
  addAllIndeks(h, ops, id, ukuran(h, id), c)
  return id
}

function getFirst(h: H, _ops: O, id: number): Nilai {
  const f = pertama(h, id)
  if (f === null) throw nsee()
  return isi(h, f)
}

function getLast(h: H, _ops: O, id: number): Nilai {
  const l = terakhir(h, id)
  if (l === null) throw nsee()
  return isi(h, l)
}

function removeFirst(h: H, _ops: O, id: number): Nilai {
  const f = pertama(h, id)
  if (f === null) throw nsee()
  return unlinkFirst(h, id, f)
}

function removeLast(h: H, _ops: O, id: number): Nilai {
  const l = terakhir(h, id)
  if (l === null) throw nsee()
  return unlinkLast(h, id, l)
}

function addFirst(h: H, _ops: O, id: number, e: Nilai): void {
  linkFirst(h, id, e)
}

function addLast(h: H, _ops: O, id: number, e: Nilai): void {
  linkLast(h, id, e)
}

function add(h: H, _ops: O, id: number, e: Nilai): boolean {
  linkLast(h, id, e)
  return true
}

/** remove(Object o): unlink simpul pertama yang cocok (`o.equals(x.item)`). */
function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  for (let x = pertama(h, id); x !== null; x = berikut(h, x)) {
    if (o === null ? isi(h, x) === null : ops.equals(o as number, isi(h, x))) {
      unlink(h, id, x)
      return true
    }
  }
  return false
}

function removeLastOccurrence(h: H, ops: O, id: number, o: Nilai): boolean {
  for (let x = terakhir(h, id); x !== null; x = sebelum(h, x)) {
    if (o === null ? isi(h, x) === null : ops.equals(o as number, isi(h, x))) {
      unlink(h, id, x)
      return true
    }
  }
  return false
}

function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  return addAllIndeks(h, ops, id, ukuran(h, id), c)
}

/** addAll(index, c): rantai simpul baru disisipkan sekaligus; modCount naik sekali. */
function addAllIndeks(h: H, ops: O, id: number, index: number, c: Nilai): boolean {
  cekIndeksPosisi(h, id, index)
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const a = keArray(h, ops, c as number)
  const n = a.length
  if (n === 0) return false

  let pred: number | null
  let succ: number | null
  if (index === ukuran(h, id)) {
    succ = null
    pred = terakhir(h, id)
  } else {
    succ = simpulKe(h, id, index)
    pred = sebelum(h, succ)
  }

  for (const e of a) {
    const simpul = simpulBaru(h, pred, e, null)
    if (pred === null) h.tulisField(id, 'first', simpul)
    else h.tulisField(pred, 'next', simpul)
    pred = simpul
  }

  if (succ === null) {
    h.tulisField(id, 'last', pred)
  } else {
    h.tulisField(pred as number, 'next', succ)
    h.tulisField(succ, 'prev', pred)
  }

  ubahUkuran(h, id, n)
  naikkan(h, id)
  return true
}

/** clear(): semua tautan antarsimpul diputus satu per satu, seperti JDK. */
function clear(h: H, _ops: O, id: number): void {
  for (let x = pertama(h, id); x !== null;) {
    const next = berikut(h, x)
    h.tulisField(x, 'item', null)
    h.tulisField(x, 'next', null)
    h.tulisField(x, 'prev', null)
    x = next
  }
  h.tulisField(id, 'last', null)
  h.tulisField(id, 'first', null)
  h.tulisField(id, 'size', 0)
  naikkan(h, id)
}

function get(h: H, _ops: O, id: number, index: number): Nilai {
  cekIndeksElemen(h, id, index)
  return isi(h, simpulKe(h, id, index))
}

function set(h: H, _ops: O, id: number, index: number, e: Nilai): Nilai {
  cekIndeksElemen(h, id, index)
  const x = simpulKe(h, id, index)
  const lama = isi(h, x)
  h.tulisField(x, 'item', e)
  return lama
}

/** add(index, e). */
function addIndeks(h: H, _ops: O, id: number, index: number, e: Nilai): void {
  cekIndeksPosisi(h, id, index)
  if (index === ukuran(h, id)) linkLast(h, id, e)
  else linkBefore(h, id, e, simpulKe(h, id, index))
}

/** remove(int index). */
function removeIndeks(h: H, _ops: O, id: number, index: number): Nilai {
  cekIndeksElemen(h, id, index)
  return unlink(h, id, simpulKe(h, id, index))
}

function indexOf(h: H, ops: O, id: number, o: Nilai): number {
  let index = 0
  for (let x = pertama(h, id); x !== null; x = berikut(h, x)) {
    if (o === null ? isi(h, x) === null : ops.equals(o as number, isi(h, x))) return index
    index++
  }
  return -1
}

function lastIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  let index = ukuran(h, id)
  for (let x = terakhir(h, id); x !== null; x = sebelum(h, x)) {
    index--
    if (o === null ? isi(h, x) === null : ops.equals(o as number, isi(h, x))) return index
  }
  return -1
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

// Operasi Queue/Deque
function peek(h: H, _ops: O, id: number): Nilai {
  const f = pertama(h, id)
  return f === null ? null : isi(h, f)
}

function peekLast(h: H, _ops: O, id: number): Nilai {
  const l = terakhir(h, id)
  return l === null ? null : isi(h, l)
}

function poll(h: H, _ops: O, id: number): Nilai {
  const f = pertama(h, id)
  return f === null ? null : unlinkFirst(h, id, f)
}

function pollLast(h: H, _ops: O, id: number): Nilai {
  const l = terakhir(h, id)
  return l === null ? null : unlinkLast(h, id, l)
}

function offerFirst(h: H, ops: O, id: number, e: Nilai): boolean {
  addFirst(h, ops, id, e)
  return true
}

function offerLast(h: H, ops: O, id: number, e: Nilai): boolean {
  addLast(h, ops, id, e)
  return true
}

/** toArray(): isi dari first ke last. */
function toArray(h: H, _ops: O, id: number): Nilai[] {
  const hasil: Nilai[] = []
  for (let x = pertama(h, id); x !== null; x = berikut(h, x)) hasil.push(isi(h, x))
  return hasil
}

/** List.sort bawaan: toArray → Arrays.sort → tulis balik lewat ListIterator.set; modCount tidak berubah. */
function sort(h: H, ops: O, id: number, pembanding: number | null): void {
  const salinan = toArray(h, ops, id)
  const a = arrayDari(h, salinan)
  urutkan(h, ops, a, 0, salinan.length, pembanding)
  const li = listIteratorLokal(h, ops, id, 0)
  for (let k = 0; k < salinan.length; k++) {
    const e = h.bacaElemen(a, k)
    li.next()
    li.set(e)
  }
}

function toString(h: H, ops: O, id: number): string {
  return teksKoleksi(ops, id, iterasi(h, ops, id))
}

function equals(h: H, ops: O, id: number, o: Nilai): boolean {
  return equalsAbstractList(h, ops, id, o)
}

function hashCode(h: H, ops: O, id: number): number {
  return hashCodeAbstractList(h, ops, id)
}

// ---------- LinkedList$ListItr ----------
const daftarItr = (w: Wadah) => w.baca('this$0') as number

function cekKomodifikasi(h: H, w: Wadah): void {
  if (bacaInt(h, daftarItr(w), 'modCount') !== w.baca('expectedModCount')) throw cme()
}

const LOGIKA_LISTITR: LogikaIterator = {
  hasNext: (h, _ops, w) => (w.baca('nextIndex') as number) < ukuran(h, daftarItr(w)),
  next(h, ops, w) {
    cekKomodifikasi(h, w)
    if (!LOGIKA_LISTITR.hasNext(h, ops, w)) throw nsee()
    const simpul = w.baca('next') as number
    w.tulis('lastReturned', simpul)
    w.tulis('next', berikut(h, simpul))
    w.tulis('nextIndex', (w.baca('nextIndex') as number) + 1)
    return isi(h, simpul)
  },
  remove(h, _ops, w) {
    cekKomodifikasi(h, w)
    const lastReturned = w.baca('lastReturned') as number | null
    if (lastReturned === null) throw ise()
    const lastNext = berikut(h, lastReturned)
    unlink(h, daftarItr(w), lastReturned)
    if (w.baca('next') === lastReturned) w.tulis('next', lastNext)
    else w.tulis('nextIndex', (w.baca('nextIndex') as number) - 1)
    w.tulis('lastReturned', null)
    w.tulis('expectedModCount', ((w.baca('expectedModCount') as number) + 1) | 0)
  },
}

function previous(h: H, w: Wadah): Nilai {
  cekKomodifikasi(h, w)
  const nextIndex = w.baca('nextIndex') as number
  if (!(nextIndex > 0)) throw nsee()
  const next = w.baca('next') as number | null
  const simpul = (next === null ? terakhir(h, daftarItr(w)) : sebelum(h, next)) as number
  w.tulis('next', simpul)
  w.tulis('lastReturned', simpul)
  w.tulis('nextIndex', nextIndex - 1)
  return isi(h, simpul)
}

function setItr(h: H, w: Wadah, e: Nilai): void {
  const lastReturned = w.baca('lastReturned') as number | null
  if (lastReturned === null) throw ise()
  cekKomodifikasi(h, w)
  h.tulisField(lastReturned, 'item', e)
}

/** Field `new ListItr(index)`: next = (index == size) ? null : node(index). */
function fieldListItr(h: H, id: number, index: number): Record<string, Nilai> {
  return {
    lastReturned: null,
    next: index === ukuran(h, id) ? null : simpulKe(h, id, index),
    nextIndex: index,
    expectedModCount: bacaInt(h, id, 'modCount'),
    this$0: id,
  }
}

/** listIterator(index) internal. */
function listIteratorLokal(h: H, ops: O, id: number, index: number): IteratorDaftarLokal {
  cekIndeksPosisi(h, id, index)
  const w = wadahLokal(fieldListItr(h, id, index))
  return {
    hasNext: () => LOGIKA_LISTITR.hasNext(h, ops, w),
    next: () => LOGIKA_LISTITR.next(h, ops, w),
    remove: () => LOGIKA_LISTITR.remove(h, ops, w),
    previous: () => previous(h, w),
    set: (e) => setItr(h, w, e),
  }
}

/** iterator() = listIterator(0). */
function iterator(h: H, _ops: O, id: number): number {
  return h.baruObjek(KELAS_LISTITR, fieldListItr(h, id, 0), TIPE_LISTITR)
}

const operasiItr = operasiIterator({ [KELAS_LISTITR]: LOGIKA_LISTITR })

export const LinkedListModel = {
  baru,
  dariKoleksi,
  add,
  addIndeks,
  addAll,
  addAllIndeks,
  addFirst,
  addLast,
  offerFirst,
  offerLast,
  get,
  set,
  getFirst,
  getLast,
  removeFirst,
  removeLast,
  removeIndeks,
  removeObjek,
  removeFirstOccurrence: removeObjek,
  removeLastOccurrence,
  indexOf,
  lastIndexOf,
  contains,
  clear,
  size,
  isEmpty,
  peek,
  peekFirst: peek,
  peekLast,
  element: getFirst,
  poll,
  pollFirst: poll,
  pollLast,
  /** remove() pada Queue/Deque = removeFirst(). */
  remove: removeFirst,
  offer: add,
  push: addFirst,
  pop: removeFirst,
  sort,
  toArray,
  equals,
  hashCode,
  toString,
  iterator,
}

/** Operasi objek `LinkedList$ListItr`. */
export const LinkedListItr = operasiItr

daftarkanKoleksi({
  kelas: KELAS_LINKEDLIST,
  kelasIterator: [KELAS_LISTITR],
  list: true,
  size,
  contains,
  keArray: toArray,
  add,
  iterator,
  ...operasiItr,
  iterasi: (h, ops, id) => iteratorLokal(h, ops, LOGIKA_LISTITR, fieldListItr(h, id, 0)),
  teks: toString,
  equals,
  hashCode,
  daftar: { aksesAcak: false, get, set, sort, listIterator: listIteratorLokal },
})
