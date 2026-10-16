import type { Nilai } from '../../nilai'
import {
  aioobe,
  arrayDari,
  bacaArray,
  bacaInt,
  cme,
  galat,
  iae,
  iobe,
  isiArray,
  ise,
  iteratorLokal,
  naikkan,
  npe,
  nsee,
  panjangBaru,
  pesanNpePanggil,
  salin,
  salinBaru,
  teksKoleksi,
  tulisArray,
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
} from './registri'
import { urutkan } from './urut'

/**
 * java.util.Vector{elementData, elementCount, capacityIncrement, modCount} dan subkelasnya java.util.Stack.
 * Kapasitas awal 10, tumbuh dua kali lipat (capacityIncrement 0). Iterator: `Vector$Itr`.
 */
export const KELAS_VECTOR = 'java.util.Vector'
export const KELAS_STACK = 'java.util.Stack'
const KELAS_ITR = 'java.util.Vector$Itr'

const TIPE: Record<string, string> = {
  elementData: 'Object[]',
  elementCount: 'int',
  capacityIncrement: 'int',
  modCount: 'int',
}

type H = HeapKoleksi
type O = OperasiElemen

const dataDari = (h: H, id: number) => h.bacaField(id, 'elementData') as number
const jumlah = (h: H, id: number) => bacaInt(h, id, 'elementCount')

function buat(h: H, kelas: string, kapasitas: number, capacityIncrement: number): number {
  if (kapasitas < 0) throw iae(`Illegal Capacity: ${kapasitas}`)
  return h.baruObjek(
    kelas,
    { elementData: h.baruArray('Object', kapasitas), elementCount: 0, capacityIncrement, modCount: 0 },
    TIPE,
  )
}

/** new Stack<>(). */
function baruStack(h: H): number {
  return buat(h, KELAS_STACK, 10, 0)
}

/** new Vector<>(), new Vector<>(kapasitas), new Vector<>(kapasitas, capacityIncrement). */
function baruVector(h: H, kapasitas = 10, capacityIncrement = 0): number {
  return buat(h, KELAS_VECTOR, kapasitas, capacityIncrement)
}

/** new Vector<>(c): elementData = salinan c.toArray() (panjang = ukuran c). */
function vectorDariKoleksi(h: H, ops: O, c: Nilai): number {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const isi = keArray(h, ops, c as number)
  return h.baruObjek(
    KELAS_VECTOR,
    { elementData: arrayDari(h, isi), elementCount: isi.length, capacityIncrement: 0, modCount: 0 },
    TIPE,
  )
}

/** grow(minCapacity): tambah capacityIncrement bila > 0, selainnya dua kali lipat. */
function grow(h: H, id: number, minCapacity: number): number {
  const lama = dataDari(h, id)
  const kapLama = h.panjangArray(lama)
  const tambah = bacaInt(h, id, 'capacityIncrement')
  const baru = salinBaru(h, lama, panjangBaru(kapLama, minCapacity - kapLama, tambah > 0 ? tambah : kapLama))
  h.tulisField(id, 'elementData', baru)
  return baru
}

/** add(e, elementData, s) bersama add(E) dan addElement. */
function tambahAkhir(h: H, id: number, e: Nilai): void {
  let a = dataDari(h, id)
  const s = jumlah(h, id)
  if (s === h.panjangArray(a)) a = grow(h, id, s + 1)
  h.tulisElemen(a, s, e)
  h.tulisField(id, 'elementCount', s + 1)
}

function add(h: H, _ops: O, id: number, e: Nilai): boolean {
  naikkan(h, id)
  tambahAkhir(h, id, e)
  return true
}

function addElement(h: H, _ops: O, id: number, e: Nilai): void {
  naikkan(h, id)
  tambahAkhir(h, id, e)
}

/** add(index, e) = insertElementAt(e, index); indeks negatif gagal di System.arraycopy. */
function addIndeks(h: H, _ops: O, id: number, index: number, e: Nilai): void {
  const s0 = jumlah(h, id)
  if (index > s0) throw aioobe(`${index} > ${s0}`)
  naikkan(h, id)
  let a = dataDari(h, id)
  const s = jumlah(h, id)
  if (s === h.panjangArray(a)) a = grow(h, id, s + 1)
  salin(h, a, index, a, index + 1, s - index)
  h.tulisElemen(a, index, e)
  h.tulisField(id, 'elementCount', s + 1)
}

function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const isi = keArray(h, ops, c as number)
  naikkan(h, id)
  const n = isi.length
  if (n === 0) return false
  let a = dataDari(h, id)
  const s = jumlah(h, id)
  if (n > h.panjangArray(a) - s) a = grow(h, id, s + n)
  for (let i = 0; i < n; i++) h.tulisElemen(a, s + i, isi[i])
  h.tulisField(id, 'elementCount', s + n)
  return true
}

/** get(index): indeks >= elementCount → "Array index out of range: i"; negatif → akses array JVM. */
function get(h: H, _ops: O, id: number, index: number): Nilai {
  if (index >= jumlah(h, id)) throw aioobe(`Array index out of range: ${index}`)
  return bacaArray(h, dataDari(h, id), index)
}

function set(h: H, _ops: O, id: number, index: number, e: Nilai): Nilai {
  if (index >= jumlah(h, id)) throw aioobe(`Array index out of range: ${index}`)
  const a = dataDari(h, id)
  const lama = bacaArray(h, a, index)
  tulisArray(h, a, index, e)
  return lama
}

/** remove(int index): modCount naik sebelum pemeriksaan indeks. */
function removeIndeks(h: H, _ops: O, id: number, index: number): Nilai {
  naikkan(h, id)
  const s = jumlah(h, id)
  if (index >= s) throw aioobe(`Array index out of range: ${index}`)
  const a = dataDari(h, id)
  const lama = bacaArray(h, a, index)
  const geser = s - index - 1
  if (geser > 0) salin(h, a, index + 1, a, index, geser)
  h.tulisField(id, 'elementCount', s - 1)
  h.tulisElemen(a, s - 1, null)
  return lama
}

function elementAt(h: H, _ops: O, id: number, index: number): Nilai {
  const s = jumlah(h, id)
  if (index >= s) throw aioobe(`${index} >= ${s}`)
  return bacaArray(h, dataDari(h, id), index)
}

function removeElementAt(h: H, _ops: O, id: number, index: number): void {
  const s = jumlah(h, id)
  if (index >= s) throw aioobe(`${index} >= ${s}`)
  if (index < 0) throw aioobe(`Array index out of range: ${index}`)
  const a = dataDari(h, id)
  const j = s - index - 1
  if (j > 0) salin(h, a, index + 1, a, index, j)
  naikkan(h, id)
  h.tulisField(id, 'elementCount', s - 1)
  h.tulisElemen(a, s - 1, null)
}

/** indexOf(o, index); Vector membaca field elementData/elementCount ulang tiap putaran. */
function indexOfDari(h: H, ops: O, id: number, o: Nilai, index: number): number {
  if (o === null) {
    for (let i = index; i < jumlah(h, id); i++) if (bacaArray(h, dataDari(h, id), i) === null) return i
  } else {
    for (let i = index; i < jumlah(h, id); i++)
      if (ops.equals(o as number, bacaArray(h, dataDari(h, id), i))) return i
  }
  return -1
}

/** lastIndexOf(o, index). */
function lastIndexOfDari(h: H, ops: O, id: number, o: Nilai, index: number): number {
  const s = jumlah(h, id)
  if (index >= s) throw iobe(`${index} >= ${s}`)
  if (o === null) {
    for (let i = index; i >= 0; i--) if (bacaArray(h, dataDari(h, id), i) === null) return i
  } else {
    for (let i = index; i >= 0; i--) if (ops.equals(o as number, bacaArray(h, dataDari(h, id), i))) return i
  }
  return -1
}

function indexOf(h: H, ops: O, id: number, o: Nilai): number {
  return indexOfDari(h, ops, id, o, 0)
}

function lastIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  return lastIndexOfDari(h, ops, id, o, jumlah(h, id) - 1)
}

function contains(h: H, ops: O, id: number, o: Nilai): boolean {
  return indexOfDari(h, ops, id, o, 0) >= 0
}

/** remove(Object) = removeElement: modCount naik walau tidak ketemu (dan sekali lagi bila ketemu). */
function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  naikkan(h, id)
  const i = indexOf(h, ops, id, o)
  if (i >= 0) {
    removeElementAt(h, ops, id, i)
    return true
  }
  return false
}

/** clear() = removeAllElements(). */
function clear(h: H, _ops: O, id: number): void {
  const a = dataDari(h, id)
  const sampai = jumlah(h, id)
  h.tulisField(id, 'elementCount', 0)
  for (let i = 0; i < sampai; i++) h.tulisElemen(a, i, null)
  naikkan(h, id)
}

function size(h: H, _ops: O, id: number): number {
  return jumlah(h, id)
}

function isEmpty(h: H, _ops: O, id: number): boolean {
  return jumlah(h, id) === 0
}

function firstElement(h: H, _ops: O, id: number): Nilai {
  if (jumlah(h, id) === 0) throw nsee()
  return h.bacaElemen(dataDari(h, id), 0)
}

function lastElement(h: H, _ops: O, id: number): Nilai {
  const s = jumlah(h, id)
  if (s === 0) throw nsee()
  return h.bacaElemen(dataDari(h, id), s - 1)
}

function sort(h: H, ops: O, id: number, pembanding: number | null): void {
  const harapan = bacaInt(h, id, 'modCount')
  urutkan(h, ops, dataDari(h, id), 0, jumlah(h, id), pembanding)
  if (bacaInt(h, id, 'modCount') !== harapan) throw cme()
  naikkan(h, id)
}

function toArray(h: H, _ops: O, id: number): Nilai[] {
  return isiArray(h, dataDari(h, id), 0, jumlah(h, id))
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

// ---------- Stack ----------
function push(h: H, ops: O, id: number, e: Nilai): Nilai {
  addElement(h, ops, id, e)
  return e
}

/** peek(): EmptyStackException bila kosong. */
function peek(h: H, ops: O, id: number): Nilai {
  const s = jumlah(h, id)
  if (s === 0) throw galat('java.util.EmptyStackException')
  return elementAt(h, ops, id, s - 1)
}

function pop(h: H, ops: O, id: number): Nilai {
  const s = jumlah(h, id)
  const e = peek(h, ops, id)
  removeElementAt(h, ops, id, s - 1)
  return e
}

function empty(h: H, _ops: O, id: number): boolean {
  return jumlah(h, id) === 0
}

/** search(o): jarak 1-based dari puncak, -1 bila tidak ada. */
function search(h: H, ops: O, id: number, o: Nilai): number {
  const i = lastIndexOf(h, ops, id, o)
  return i >= 0 ? jumlah(h, id) - i : -1
}

// ---------- Vector$Itr ----------
const vectorItr = (w: Wadah) => w.baca('this$0') as number

function cekKomodifikasi(h: H, w: Wadah): void {
  if (bacaInt(h, vectorItr(w), 'modCount') !== w.baca('expectedModCount')) throw cme()
}

const LOGIKA_ITR: LogikaIterator = {
  hasNext: (h, _ops, w) => w.baca('cursor') !== jumlah(h, vectorItr(w)),
  next(h, _ops, w) {
    cekKomodifikasi(h, w)
    const id = vectorItr(w)
    const i = w.baca('cursor') as number
    if (i >= jumlah(h, id)) throw nsee()
    w.tulis('cursor', i + 1)
    w.tulis('lastRet', i)
    return bacaArray(h, dataDari(h, id), i)
  },
  remove(h, ops, w) {
    const lastRet = w.baca('lastRet') as number
    if (lastRet === -1) throw ise()
    cekKomodifikasi(h, w)
    const id = vectorItr(w)
    removeIndeks(h, ops, id, lastRet)
    w.tulis('expectedModCount', bacaInt(h, id, 'modCount'))
    w.tulis('cursor', lastRet)
    w.tulis('lastRet', -1)
  },
}

const fieldItr = (h: H, id: number): Record<string, Nilai> => ({
  cursor: 0,
  lastRet: -1,
  expectedModCount: bacaInt(h, id, 'modCount'),
  this$0: id,
})

function iterator(h: H, _ops: O, id: number): number {
  return h.baruObjek(KELAS_ITR, fieldItr(h, id), {
    cursor: 'int',
    lastRet: 'int',
    expectedModCount: 'int',
    this$0: h.kelasDari(id),
  })
}

const operasiItr = operasiIterator({ [KELAS_ITR]: LOGIKA_ITR })

const metodeVector = {
  add,
  addElement,
  addIndeks,
  insertElementAt: (h: H, ops: O, id: number, e: Nilai, index: number) => addIndeks(h, ops, id, index, e),
  addAll,
  get,
  set,
  removeIndeks,
  removeObjek,
  removeElement: removeObjek,
  elementAt,
  removeElementAt,
  firstElement,
  lastElement,
  indexOf,
  lastIndexOf,
  contains,
  clear,
  removeAllElements: clear,
  size,
  isEmpty,
  sort,
  toArray,
  equals,
  hashCode,
  toString,
  iterator,
}

export const VectorModel = { baru: baruVector, dariKoleksi: vectorDariKoleksi, ...metodeVector }

export const StackModel = { baru: baruStack, ...metodeVector, push, pop, peek, empty, search }

/** Operasi objek `Vector$Itr` (juga dipakai Stack). */
export const VectorItr = operasiItr

for (const kelas of [KELAS_VECTOR, KELAS_STACK]) {
  daftarkanKoleksi({
    kelas,
    kelasIterator: [KELAS_ITR],
    list: true,
    size,
    contains,
    keArray: toArray,
    add,
    iterator,
    ...operasiItr,
    iterasi: (h, ops, id) => iteratorLokal(h, ops, LOGIKA_ITR, fieldItr(h, id)),
    teks: toString,
    equals,
    hashCode,
    daftar: { aksesAcak: true, get, set, sort },
  })
}
