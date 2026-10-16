import type { Nilai } from '../../nilai'
import {
  bacaInt,
  cme,
  galat,
  ise,
  iteratorLokal,
  npe,
  nsee,
  pesanNpePanggil,
  salin,
  salinBaru,
  teksKoleksi,
  type HeapKoleksi,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
import { daftarkanKoleksi, iterasi, operasiIterator, ukuranKoleksi } from './registri'

/**
 * java.util.ArrayDeque{elements, head, tail}: buffer melingkar JDK 21 dengan satu slot selalu kosong
 * (head == tail berarti kosong). Tidak ada modCount; iterator hanya mendeteksi slot null.
 */
export const KELAS_ARRAYDEQUE = 'java.util.ArrayDeque'
const KELAS_DEQITR = 'java.util.ArrayDeque$DeqIterator'
const INT_MAX = 2147483647
const MAX_ARRAY_SIZE = INT_MAX - 8

const TIPE: Record<string, string> = { elements: 'Object[]', head: 'int', tail: 'int' }
const TIPE_ITR: Record<string, string> = {
  cursor: 'int',
  remaining: 'int',
  lastRet: 'int',
  this$0: KELAS_ARRAYDEQUE,
}

type H = HeapKoleksi
type O = OperasiElemen

const dataDari = (h: H, id: number) => h.bacaField(id, 'elements') as number
const kepala = (h: H, id: number) => bacaInt(h, id, 'head')
const ekor = (h: H, id: number) => bacaInt(h, id, 'tail')

/** i + 1 melingkar. */
const inc = (i: number, modulus: number) => (++i >= modulus ? 0 : i)
/** i - 1 melingkar. */
const dec = (i: number, modulus: number) => (--i < 0 ? modulus - 1 : i)
/** i - j melingkar. */
const sub = (i: number, j: number, modulus: number) => ((i -= j) < 0 ? i + modulus : i)

function baru(h: H, numElements?: number): number {
  const n =
    numElements === undefined
      ? 16 + 1
      : numElements < 1
        ? 1
        : numElements === INT_MAX
          ? INT_MAX
          : numElements + 1
  return h.baruObjek(KELAS_ARRAYDEQUE, { elements: h.baruArray('Object', n), head: 0, tail: 0 }, TIPE)
}

/** copyElements(c) = c.forEach(this::addLast): lewat iterator sumber (HashSet ikut membuat view keySet-nya). */
function salinElemen(h: H, ops: O, id: number, c: number): void {
  const it = iterasi(h, ops, c)
  while (it.hasNext()) addLast(h, ops, id, it.next())
}

/** new ArrayDeque<>(c) = this(c.size()); copyElements(c). */
function dariKoleksi(h: H, ops: O, c: Nilai): number {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.size()', 'c'))
  const id = baru(h, ukuranKoleksi(h, ops, c as number))
  salinElemen(h, ops, id, c as number)
  return id
}

/** grow(needed): kapasitas < 64 jadi 2x + 2, selainnya +50%; segmen head..akhir digeser ke ujung array baru. */
function grow(h: H, id: number, needed: number): void {
  const lama = dataDari(h, id)
  const kapLama = h.panjangArray(lama)
  const jump = kapLama < 64 ? kapLama + 2 : kapLama >> 1
  let kapBaru = kapLama + jump
  if (jump < needed || kapBaru - MAX_ARRAY_SIZE > 0) kapBaru = kapasitasTepi(kapLama, needed, jump)
  const es = salinBaru(h, lama, kapBaru)
  h.tulisField(id, 'elements', es)
  const head = kepala(h, id)
  const tail = ekor(h, id)
  // Pengecualian: tail == head perlu dibedakan antara penuh (slot head terisi) dan kosong.
  if (tail < head || (tail === head && h.bacaElemen(es, head) !== null)) {
    const ruangBaru = kapBaru - kapLama
    salin(h, es, head, es, head + ruangBaru, kapLama - head)
    const sampai = head + ruangBaru
    h.tulisField(id, 'head', sampai)
    for (let i = head; i < sampai; i++) h.tulisElemen(es, i, null)
  }
}

function kapasitasTepi(kapLama: number, needed: number, jump: number): number {
  const minKap = kapLama + needed
  if (minKap - MAX_ARRAY_SIZE > 0) {
    if (minKap > INT_MAX) throw galat('java.lang.IllegalStateException', 'Sorry, deque too big')
    return INT_MAX
  }
  if (needed > jump) return minKap
  return kapLama + jump - MAX_ARRAY_SIZE < 0 ? kapLama + jump : MAX_ARRAY_SIZE
}

function addFirst(h: H, _ops: O, id: number, e: Nilai): void {
  if (e === null) throw npe()
  const es = dataDari(h, id)
  const head = dec(kepala(h, id), h.panjangArray(es))
  h.tulisField(id, 'head', head)
  h.tulisElemen(es, head, e)
  if (head === ekor(h, id)) grow(h, id, 1)
}

function addLast(h: H, _ops: O, id: number, e: Nilai): void {
  if (e === null) throw npe()
  const es = dataDari(h, id)
  const tail = ekor(h, id)
  h.tulisElemen(es, tail, e)
  const tailBaru = inc(tail, h.panjangArray(es))
  h.tulisField(id, 'tail', tailBaru)
  if (kepala(h, id) === tailBaru) grow(h, id, 1)
}

/** addAll(c): kapasitas disiapkan dulu, lalu c.forEach(this::addLast). */
function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.size()', 'c'))
  const s = size(h, ops, id)
  const needed = s + ukuranKoleksi(h, ops, c as number) + 1 - h.panjangArray(dataDari(h, id))
  if (needed > 0) grow(h, id, needed)
  if (c === id) forEachDiri(h, ops, id)
  else salinElemen(h, ops, id, c as number)
  return size(h, ops, id) > s
}

/** ArrayDeque.forEach(this::addLast) atas dirinya sendiri: tail berubah selama iterasi → CME di akhir. */
function forEachDiri(h: H, ops: O, id: number): void {
  const es = dataDari(h, id)
  const end = ekor(h, id)
  let i = kepala(h, id)
  let sampai = i <= end ? end : h.panjangArray(es)
  for (;;) {
    for (; i < sampai; i++) addLast(h, ops, id, h.bacaElemen(es, i))
    if (sampai === end) {
      if (end !== ekor(h, id)) throw cme()
      break
    }
    i = 0
    sampai = end
  }
}

function offerFirst(h: H, ops: O, id: number, e: Nilai): boolean {
  addFirst(h, ops, id, e)
  return true
}

function offerLast(h: H, ops: O, id: number, e: Nilai): boolean {
  addLast(h, ops, id, e)
  return true
}

function pollFirst(h: H, _ops: O, id: number): Nilai {
  const es = dataDari(h, id)
  const head = kepala(h, id)
  const e = h.bacaElemen(es, head)
  if (e !== null) {
    h.tulisElemen(es, head, null)
    h.tulisField(id, 'head', inc(head, h.panjangArray(es)))
  }
  return e
}

function pollLast(h: H, _ops: O, id: number): Nilai {
  const es = dataDari(h, id)
  const t = dec(ekor(h, id), h.panjangArray(es))
  const e = h.bacaElemen(es, t)
  if (e !== null) {
    h.tulisField(id, 'tail', t)
    h.tulisElemen(es, t, null)
  }
  return e
}

function removeFirst(h: H, ops: O, id: number): Nilai {
  const e = pollFirst(h, ops, id)
  if (e === null) throw nsee()
  return e
}

function removeLast(h: H, ops: O, id: number): Nilai {
  const e = pollLast(h, ops, id)
  if (e === null) throw nsee()
  return e
}

function peekFirst(h: H, _ops: O, id: number): Nilai {
  return h.bacaElemen(dataDari(h, id), kepala(h, id))
}

function peekLast(h: H, _ops: O, id: number): Nilai {
  const es = dataDari(h, id)
  return h.bacaElemen(es, dec(ekor(h, id), h.panjangArray(es)))
}

function getFirst(h: H, ops: O, id: number): Nilai {
  const e = peekFirst(h, ops, id)
  if (e === null) throw nsee()
  return e
}

function getLast(h: H, ops: O, id: number): Nilai {
  const e = peekLast(h, ops, id)
  if (e === null) throw nsee()
  return e
}

function add(h: H, ops: O, id: number, e: Nilai): boolean {
  addLast(h, ops, id, e)
  return true
}

/** Telusuri slot terisi head..tail (dua segmen bila melingkar); berhenti bila `cocok` mengembalikan true. */
function telusuri(h: H, id: number, cocok: (es: number, i: number) => boolean): boolean {
  const es = dataDari(h, id)
  const end = ekor(h, id)
  let i = kepala(h, id)
  let sampai = i <= end ? end : h.panjangArray(es)
  for (;;) {
    for (; i < sampai; i++) if (cocok(es, i)) return true
    if (sampai === end) return false
    i = 0
    sampai = end
  }
}

function contains(h: H, ops: O, id: number, o: Nilai): boolean {
  if (o === null) return false
  return telusuri(h, id, (es, i) => ops.equals(o as number, h.bacaElemen(es, i)))
}

/** remove(Object) = removeFirstOccurrence. */
function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  if (o === null) return false
  return telusuri(h, id, (es, i) => {
    if (!ops.equals(o as number, h.bacaElemen(es, i))) return false
    hapusDi(h, id, i)
    return true
  })
}

function removeLastOccurrence(h: H, ops: O, id: number, o: Nilai): boolean {
  if (o === null) return false
  const es = dataDari(h, id)
  const end = kepala(h, id)
  let i = ekor(h, id)
  let sampai = i >= end ? end : 0
  for (;;) {
    for (i--; i > sampai - 1; i--) {
      if (ops.equals(o as number, h.bacaElemen(es, i))) {
        hapusDi(h, id, i)
        return true
      }
    }
    if (sampai === end) return false
    i = h.panjangArray(es)
    sampai = end
  }
}

/**
 * delete(i): hapus slot i dengan menggeser sisi yang lebih sedikit elemennya.
 * Mengembalikan true bila elemen dekat tail bergeser mundur (dipakai DeqIterator.remove).
 */
function hapusDi(h: H, id: number, i: number): boolean {
  const es = dataDari(h, id)
  const kapasitas = h.panjangArray(es)
  const head = kepala(h, id)
  const tail = ekor(h, id)
  const depan = sub(i, head, kapasitas)
  const belakang = sub(tail, i, kapasitas) - 1
  if (depan < belakang) {
    if (head <= i) {
      salin(h, es, head, es, head + 1, depan)
    } else {
      salin(h, es, 0, es, 1, i)
      h.tulisElemen(es, 0, h.bacaElemen(es, kapasitas - 1))
      salin(h, es, head, es, head + 1, depan - (i + 1))
    }
    h.tulisElemen(es, head, null)
    h.tulisField(id, 'head', inc(head, kapasitas))
    return false
  }
  const tailBaru = dec(tail, kapasitas)
  h.tulisField(id, 'tail', tailBaru)
  if (i <= tailBaru) {
    salin(h, es, i + 1, es, i, belakang)
  } else {
    salin(h, es, i + 1, es, i, kapasitas - (i + 1))
    h.tulisElemen(es, kapasitas - 1, h.bacaElemen(es, 0))
    salin(h, es, 1, es, 0, tail - 1)
  }
  h.tulisElemen(es, tailBaru, null)
  return true
}

function size(h: H, _ops: O, id: number): number {
  return sub(ekor(h, id), kepala(h, id), h.panjangArray(dataDari(h, id)))
}

function isEmpty(h: H, _ops: O, id: number): boolean {
  return kepala(h, id) === ekor(h, id)
}

function clear(h: H, _ops: O, id: number): void {
  const es = dataDari(h, id)
  const end = ekor(h, id)
  let i = kepala(h, id)
  let sampai = i <= end ? end : h.panjangArray(es)
  for (;;) {
    for (; i < sampai; i++) h.tulisElemen(es, i, null)
    if (sampai === end) break
    i = 0
    sampai = end
  }
  h.tulisField(id, 'tail', 0)
  h.tulisField(id, 'head', 0)
}

/** toArray(): head..tail dalam urutan. */
function toArray(h: H, _ops: O, id: number): Nilai[] {
  const hasil: Nilai[] = []
  telusuri(h, id, (es, i) => {
    hasil.push(h.bacaElemen(es, i))
    return false
  })
  return hasil
}

function toString(h: H, ops: O, id: number): string {
  return teksKoleksi(ops, id, iterasi(h, ops, id))
}

// ---------- ArrayDeque$DeqIterator ----------
const dequeItr = (w: Wadah) => w.baca('this$0') as number

const LOGIKA_ITR: LogikaIterator = {
  hasNext: (_h, _ops, w) => (w.baca('remaining') as number) > 0,
  next(h, _ops, w) {
    const sisa = w.baca('remaining') as number
    if (sisa <= 0) throw nsee()
    const es = dataDari(h, dequeItr(w))
    const cursor = w.baca('cursor') as number
    const e = h.bacaElemen(es, cursor)
    // nonNullElementAt: slot null berarti deque diubah di luar iterator.
    if (e === null) throw cme()
    w.tulis('lastRet', cursor)
    w.tulis('cursor', inc(cursor, h.panjangArray(es)))
    w.tulis('remaining', sisa - 1)
    return e
  },
  remove(h, _ops, w) {
    const lastRet = w.baca('lastRet') as number
    if (lastRet < 0) throw ise()
    const id = dequeItr(w)
    if (hapusDi(h, id, lastRet))
      w.tulis('cursor', dec(w.baca('cursor') as number, h.panjangArray(dataDari(h, id))))
    w.tulis('lastRet', -1)
  },
}

const fieldItr = (h: H, ops: O, id: number): Record<string, Nilai> => ({
  cursor: kepala(h, id),
  remaining: size(h, ops, id),
  lastRet: -1,
  this$0: id,
})

function iterator(h: H, ops: O, id: number): number {
  return h.baruObjek(KELAS_DEQITR, fieldItr(h, ops, id), TIPE_ITR)
}

const operasiItr = operasiIterator({ [KELAS_DEQITR]: LOGIKA_ITR })

export const ArrayDequeModel = {
  baru,
  dariKoleksi,
  addFirst,
  addLast,
  offerFirst,
  offerLast,
  pollFirst,
  pollLast,
  removeFirst,
  removeLast,
  peekFirst,
  peekLast,
  getFirst,
  getLast,
  add,
  addAll,
  offer: offerLast,
  /** remove() pada Queue = removeFirst(). */
  remove: removeFirst,
  poll: pollFirst,
  element: getFirst,
  peek: peekFirst,
  push: addFirst,
  pop: removeFirst,
  contains,
  removeObjek,
  removeFirstOccurrence: removeObjek,
  removeLastOccurrence,
  size,
  isEmpty,
  clear,
  toArray,
  toString,
  iterator,
}

/** Operasi objek `ArrayDeque$DeqIterator`. */
export const ArrayDequeItr = operasiItr

daftarkanKoleksi({
  kelas: KELAS_ARRAYDEQUE,
  kelasIterator: [KELAS_DEQITR],
  list: false,
  size,
  contains,
  keArray: toArray,
  add,
  iterator,
  ...operasiItr,
  iterasi: (h, ops, id) => iteratorLokal(h, ops, LOGIKA_ITR, fieldItr(h, ops, id)),
  teks: toString,
})
