import { LemparanJava, type Nilai } from '../../nilai'
import {
  arrayDari,
  bacaInt,
  cekIndeks,
  cme,
  hash31,
  hashElemen,
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
  samaObjek,
  teksKoleksi,
  type HeapKoleksi,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
import { adalahList, daftarkanKoleksi, iterasi, keArray, operasiIterator } from './registri'
import { urutkan } from './urut'

/** java.util.ArrayList{elementData, size, modCount} beserta iterator `ArrayList$Itr`. */
export const KELAS_ARRAYLIST = 'java.util.ArrayList'
const KELAS_ITR = 'java.util.ArrayList$Itr'
const KAPASITAS_BAWAAN = 10

const TIPE: Record<string, string> = { elementData: 'Object[]', size: 'int', modCount: 'int' }
const TIPE_ITR: Record<string, string> = {
  cursor: 'int',
  lastRet: 'int',
  expectedModCount: 'int',
  this$0: KELAS_ARRAYLIST,
}

type H = HeapKoleksi
type O = OperasiElemen

/** EMPTY_ELEMENTDATA: dipakai `new ArrayList<>(0)` dan salinan koleksi kosong; add pertama tumbuh ke 1. */
const kosong = (h: H) =>
  h.statik(KELAS_ARRAYLIST, 'EMPTY_ELEMENTDATA', () => h.baruArray('Object', 0)) as number
/** DEFAULTCAPACITY_EMPTY_ELEMENTDATA: dipakai `new ArrayList<>()`; add pertama tumbuh ke 10. */
const kosongBawaan = (h: H) =>
  h.statik(KELAS_ARRAYLIST, 'DEFAULTCAPACITY_EMPTY_ELEMENTDATA', () => h.baruArray('Object', 0)) as number

/** <clinit>: kedua array kosong bersama ada sejak kelas pertama dipakai. */
function siapkanKelas(h: H): void {
  kosong(h)
  kosongBawaan(h)
}

const dataDari = (h: H, id: number) => h.bacaField(id, 'elementData') as number
const ukuran = (h: H, id: number) => bacaInt(h, id, 'size')

function buat(h: H, elementData: number, size: number): number {
  return h.baruObjek(KELAS_ARRAYLIST, { elementData, size, modCount: 0 }, TIPE)
}

/** grow(minCapacity): kapasitas lama + lama/2 (minimal cukup); array bawaan kosong langsung ke max(10, min). */
function grow(h: H, id: number, minCapacity: number): number {
  const lama = dataDari(h, id)
  const kapLama = h.panjangArray(lama)
  const baru =
    kapLama > 0 || lama !== kosongBawaan(h)
      ? salinBaru(h, lama, panjangBaru(kapLama, minCapacity - kapLama, kapLama >> 1))
      : h.baruArray('Object', Math.max(KAPASITAS_BAWAAN, minCapacity))
  h.tulisField(id, 'elementData', baru)
  return baru
}

function cekKomodifikasi(h: H, id: number, harapan: number): void {
  if (bacaInt(h, id, 'modCount') !== harapan) throw cme()
}

/** new ArrayList<>() atau new ArrayList<>(kapasitas). */
function baru(h: H, kapasitas?: number): number {
  siapkanKelas(h)
  if (kapasitas === undefined) return buat(h, kosongBawaan(h), 0)
  if (kapasitas > 0) return buat(h, h.baruArray('Object', kapasitas), 0)
  if (kapasitas === 0) return buat(h, kosong(h), 0)
  throw iae(`Illegal Capacity: ${kapasitas}`)
}

/** new ArrayList<>(c): kapasitas = ukuran c; c kosong memakai EMPTY_ELEMENTDATA. */
function dariKoleksi(h: H, ops: O, c: Nilai): number {
  siapkanKelas(h)
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const isi = keArray(h, ops, c as number)
  if (isi.length === 0) return buat(h, kosong(h), 0)
  return buat(h, arrayDari(h, isi), isi.length)
}

function add(h: H, _ops: O, id: number, e: Nilai): boolean {
  naikkan(h, id)
  let a = dataDari(h, id)
  const s = ukuran(h, id)
  if (s === h.panjangArray(a)) a = grow(h, id, s + 1)
  h.tulisElemen(a, s, e)
  h.tulisField(id, 'size', s + 1)
  return true
}

/** add(index, e). */
function addIndeks(h: H, _ops: O, id: number, index: number, e: Nilai): void {
  const s = ukuran(h, id)
  if (index > s || index < 0) throw iobe(`Index: ${index}, Size: ${s}`)
  naikkan(h, id)
  let a = dataDari(h, id)
  if (s === h.panjangArray(a)) a = grow(h, id, s + 1)
  salin(h, a, index, a, index + 1, s - index)
  h.tulisElemen(a, index, e)
  h.tulisField(id, 'size', s + 1)
}

/** addAll(c): modCount naik walau c kosong. */
function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const isi = keArray(h, ops, c as number)
  naikkan(h, id)
  const n = isi.length
  if (n === 0) return false
  let a = dataDari(h, id)
  const s = ukuran(h, id)
  if (n > h.panjangArray(a) - s) a = grow(h, id, s + n)
  for (let i = 0; i < n; i++) h.tulisElemen(a, s + i, isi[i])
  h.tulisField(id, 'size', s + n)
  return true
}

/** addAll(index, c). */
function addAllIndeks(h: H, ops: O, id: number, index: number, c: Nilai): boolean {
  const s0 = ukuran(h, id)
  if (index > s0 || index < 0) throw iobe(`Index: ${index}, Size: ${s0}`)
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.toArray()', 'c'))
  const isi = keArray(h, ops, c as number)
  naikkan(h, id)
  const n = isi.length
  if (n === 0) return false
  let a = dataDari(h, id)
  const s = ukuran(h, id)
  if (n > h.panjangArray(a) - s) a = grow(h, id, s + n)
  salin(h, a, index, a, index + n, s - index)
  for (let i = 0; i < n; i++) h.tulisElemen(a, index + i, isi[i])
  h.tulisField(id, 'size', s + n)
  return true
}

function get(h: H, _ops: O, id: number, index: number): Nilai {
  cekIndeks(index, ukuran(h, id))
  return h.bacaElemen(dataDari(h, id), index)
}

function set(h: H, _ops: O, id: number, index: number, e: Nilai): Nilai {
  cekIndeks(index, ukuran(h, id))
  const a = dataDari(h, id)
  const lama = h.bacaElemen(a, index)
  h.tulisElemen(a, index, e)
  return lama
}

/** fastRemove: geser sisi kanan satu ke kiri lalu kosongkan slot terakhir. */
function fastRemove(h: H, id: number, a: number, i: number): void {
  naikkan(h, id)
  const sizeBaru = ukuran(h, id) - 1
  if (sizeBaru > i) salin(h, a, i + 1, a, i, sizeBaru - i)
  h.tulisField(id, 'size', sizeBaru)
  h.tulisElemen(a, sizeBaru, null)
}

/** remove(int index). */
function removeIndeks(h: H, _ops: O, id: number, index: number): Nilai {
  cekIndeks(index, ukuran(h, id))
  const a = dataDari(h, id)
  const lama = h.bacaElemen(a, index)
  fastRemove(h, id, a, index)
  return lama
}

/** remove(Object o): `o.equals(es[i])`, tanpa jalan pintas identitas. */
function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  const a = dataDari(h, id)
  const s = ukuran(h, id)
  let i = 0
  if (o === null) {
    while (i < s && h.bacaElemen(a, i) !== null) i++
  } else {
    while (i < s && !ops.equals(o as number, h.bacaElemen(a, i))) i++
  }
  if (i === s) return false
  fastRemove(h, id, a, i)
  return true
}

function indexOfRentang(h: H, ops: O, id: number, o: Nilai, awal: number, akhir: number): number {
  const a = dataDari(h, id)
  if (o === null) {
    for (let i = awal; i < akhir; i++) if (h.bacaElemen(a, i) === null) return i
  } else {
    for (let i = awal; i < akhir; i++) if (ops.equals(o as number, h.bacaElemen(a, i))) return i
  }
  return -1
}

function indexOf(h: H, ops: O, id: number, o: Nilai): number {
  return indexOfRentang(h, ops, id, o, 0, ukuran(h, id))
}

function lastIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  const a = dataDari(h, id)
  const s = ukuran(h, id)
  if (o === null) {
    for (let i = s - 1; i >= 0; i--) if (h.bacaElemen(a, i) === null) return i
  } else {
    for (let i = s - 1; i >= 0; i--) if (ops.equals(o as number, h.bacaElemen(a, i))) return i
  }
  return -1
}

function contains(h: H, ops: O, id: number, o: Nilai): boolean {
  return indexOf(h, ops, id, o) >= 0
}

function clear(h: H, _ops: O, id: number): void {
  naikkan(h, id)
  const a = dataDari(h, id)
  const sampai = ukuran(h, id)
  h.tulisField(id, 'size', 0)
  for (let i = 0; i < sampai; i++) h.tulisElemen(a, i, null)
}

function size(h: H, _ops: O, id: number): number {
  return ukuran(h, id)
}

function isEmpty(h: H, _ops: O, id: number): boolean {
  return ukuran(h, id) === 0
}

/** sort(c): TimSort langsung di elementData; CME bila pembanding mengubah list; modCount naik. */
function sort(h: H, ops: O, id: number, pembanding: number | null): void {
  const harapan = bacaInt(h, id, 'modCount')
  urutkan(h, ops, dataDari(h, id), 0, ukuran(h, id), pembanding)
  cekKomodifikasi(h, id, harapan)
  naikkan(h, id)
}

function trimToSize(h: H, _ops: O, id: number): void {
  naikkan(h, id)
  const s = ukuran(h, id)
  const a = dataDari(h, id)
  if (s < h.panjangArray(a)) h.tulisField(id, 'elementData', s === 0 ? kosong(h) : salinBaru(h, a, s))
}

function ensureCapacity(h: H, _ops: O, id: number, minCapacity: number): void {
  const a = dataDari(h, id)
  if (minCapacity > h.panjangArray(a) && !(a === kosongBawaan(h) && minCapacity <= KAPASITAS_BAWAAN)) {
    naikkan(h, id)
    grow(h, id, minCapacity)
  }
}

/** toArray(): Arrays.copyOf(elementData, size). */
function toArray(h: H, _ops: O, id: number): Nilai[] {
  return isiArray(h, dataDari(h, id), 0, ukuran(h, id))
}

/** equals: jalur cepat khusus ArrayList lawan ArrayList, keduanya memakai Objects.equals. */
function equals(h: H, ops: O, id: number, o: Nilai): boolean {
  if (o === id) return true
  if (!adalahList(h, o)) return false
  const harapan = bacaInt(h, id, 'modCount')
  const sama =
    h.kelasDari(o as number) === KELAS_ARRAYLIST
      ? equalsArrayList(h, ops, id, o as number)
      : equalsRentang(h, ops, id, o as number, 0, ukuran(h, id))
  cekKomodifikasi(h, id, harapan)
  return sama
}

function equalsRentang(h: H, ops: O, id: number, lain: number, dari: number, sampai: number): boolean {
  const a = dataDari(h, id)
  if (sampai > h.panjangArray(a)) throw cme()
  const oit = iterasi(h, ops, lain)
  for (; dari < sampai; dari++) {
    if (!oit.hasNext() || !samaObjek(ops, h.bacaElemen(a, dari), oit.next())) return false
  }
  return !oit.hasNext()
}

function equalsArrayList(h: H, ops: O, id: number, lain: number): boolean {
  const modCountLain = bacaInt(h, lain, 'modCount')
  const s = ukuran(h, id)
  let sama = s === ukuran(h, lain)
  if (sama) {
    const esLain = dataDari(h, lain)
    const es = dataDari(h, id)
    if (s > h.panjangArray(es) || s > h.panjangArray(esLain)) throw cme()
    for (let i = 0; i < s; i++) {
      if (!samaObjek(ops, h.bacaElemen(es, i), h.bacaElemen(esLain, i))) {
        sama = false
        break
      }
    }
  }
  cekKomodifikasi(h, lain, modCountLain)
  return sama
}

function hashCode(h: H, ops: O, id: number): number {
  const harapan = bacaInt(h, id, 'modCount')
  const a = dataDari(h, id)
  const sampai = ukuran(h, id)
  if (sampai > h.panjangArray(a)) throw cme()
  let hash = 1
  for (let i = 0; i < sampai; i++) hash = hash31(hash, hashElemen(ops, h.bacaElemen(a, i)))
  cekKomodifikasi(h, id, harapan)
  return hash
}

function toString(h: H, ops: O, id: number): string {
  return teksKoleksi(ops, id, iterasi(h, ops, id))
}

// ---------- ArrayList$Itr ----------
const daftarItr = (w: Wadah) => w.baca('this$0') as number

const LOGIKA_ITR: LogikaIterator = {
  hasNext: (h, _ops, w) => w.baca('cursor') !== ukuran(h, daftarItr(w)),
  next(h, _ops, w) {
    const id = daftarItr(w)
    cekKomodifikasi(h, id, w.baca('expectedModCount') as number)
    const i = w.baca('cursor') as number
    if (i >= ukuran(h, id)) throw nsee()
    const a = dataDari(h, id)
    if (i >= h.panjangArray(a)) throw cme()
    w.tulis('cursor', i + 1)
    w.tulis('lastRet', i)
    return h.bacaElemen(a, i)
  },
  remove(h, ops, w) {
    const lastRet = w.baca('lastRet') as number
    if (lastRet < 0) throw ise()
    const id = daftarItr(w)
    cekKomodifikasi(h, id, w.baca('expectedModCount') as number)
    try {
      removeIndeks(h, ops, id, lastRet)
    } catch (e) {
      if (e instanceof LemparanJava && e.kelas.endsWith('IndexOutOfBoundsException')) throw cme()
      throw e
    }
    w.tulis('cursor', lastRet)
    w.tulis('lastRet', -1)
    w.tulis('expectedModCount', bacaInt(h, id, 'modCount'))
  },
}

const fieldItr = (h: H, id: number): Record<string, Nilai> => ({
  cursor: 0,
  lastRet: -1,
  expectedModCount: bacaInt(h, id, 'modCount'),
  this$0: id,
})

function iterator(h: H, _ops: O, id: number): number {
  return h.baruObjek(KELAS_ITR, fieldItr(h, id), TIPE_ITR)
}

const operasiItr = operasiIterator({ [KELAS_ITR]: LOGIKA_ITR })

export const ArrayListModel = {
  baru,
  dariKoleksi,
  add,
  addIndeks,
  addAll,
  addAllIndeks,
  get,
  set,
  removeIndeks,
  removeObjek,
  indexOf,
  lastIndexOf,
  contains,
  clear,
  size,
  isEmpty,
  sort,
  trimToSize,
  ensureCapacity,
  toArray,
  equals,
  hashCode,
  toString,
  iterator,
}

/** Operasi objek `ArrayList$Itr`. */
export const ArrayListItr = operasiItr

daftarkanKoleksi({
  kelas: KELAS_ARRAYLIST,
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
