import type { Nilai } from '../../nilai'
import { EntriModel } from './entri'
import { npe, pesanNpePanggil, samaObjek, teksKoleksi, type HeapKoleksi, type OperasiElemen } from './heap'
import {
  buatPohon,
  buildFromSorted,
  cariNavigasi,
  deleteEntry,
  getFirstEntry,
  getLastEntry,
  kunciE,
  pembandingPohon,
} from './pohon'
import { daftarkanKoleksi, equalsAbstractSet, hashCodeAbstractSet, iterasi, modelDari } from './registri'
import { iterasiPohon, iteratorPohon, TreeMapItr, TreeMapModel } from './treeMap'

/**
 * java.util.TreeSet{m}: himpunan terurut yang ditopang TreeMap dengan nilai bersama TreeSet.PRESENT.
 * Seperti JDK, iterator() (dan semua yang beriterasi lewat iterator) membuat view navigableKeySet di map.
 * Penyederhanaan: pollFirst()/pollLast() tidak membuat salinan SimpleImmutableEntry sementara milik
 * pollFirstEntry() (objek sampah yang langsung tak terjangkau).
 */
export const KELAS_TREESET = 'java.util.TreeSet'

type H = HeapKoleksi
type O = OperasiElemen

export const PRESENT_TREESET = (h: H) =>
  h.statik(KELAS_TREESET, 'PRESENT', () => h.baruObjek('java.lang.Object', {}, {})) as number

const peta = (h: H, id: number) => h.bacaField(id, 'm') as number

function buat(h: H, pembanding: Nilai): number {
  PRESENT_TREESET(h)
  return h.baruObjek(KELAS_TREESET, { m: buatPohon(h, pembanding) }, { m: 'java.util.NavigableMap' })
}

/** new TreeSet<>() / new TreeSet<>(comparator). */
function baru(h: H, pembanding: Nilai = null): number {
  return buat(h, pembanding)
}

/** new TreeSet<>(Collection c) = this(); addAll(c). */
function dariKoleksi(h: H, ops: O, c: Nilai): number {
  const id = buat(h, null)
  addAll(h, ops, id, c)
  return id
}

/** new TreeSet<>(SortedSet s) = this(s.comparator()); addAll(s). */
function dariSortedSet(h: H, ops: O, s: Nilai): number {
  if (s === null) throw npe(pesanNpePanggil('java.util.SortedSet.comparator()', 's'))
  const m = modelDari(h, s as number)
  const id = buat(h, m.comparator ? m.comparator(h, s as number) : null)
  addAll(h, ops, id, s)
  return id
}

/**
 * addAll: set kosong + sumber SortedSet dengan comparator yang sama → buildFromSorted linear (modCount tetap);
 * selainnya AbstractCollection.addAll (add per elemen).
 */
function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  const map = peta(h, id)
  if (TreeMapModel.size(h, ops, map) === 0) {
    if (c === null) throw npe(pesanNpePanggil('java.util.Collection.size()', 'c'))
    const mc = modelDari(h, c as number)
    const ukuranSumber = mc.size(h, ops, c as number)
    if (ukuranSumber > 0 && mc.sortedSet) {
      const cmpSumber = mc.comparator ? mc.comparator(h, c as number) : null
      if (samaObjek(ops, pembandingPohon(h, map), cmpSumber)) {
        buildFromSorted(h, map, ukuranSumber, mc.iterasi(h, ops, c as number), PRESENT_TREESET(h))
        return true
      }
    }
  }
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.iterator()', 'c'))
  let berubah = false
  const it = iterasi(h, ops, c as number)
  while (it.hasNext()) if (add(h, ops, id, it.next())) berubah = true
  return berubah
}

function add(h: H, ops: O, id: number, e: Nilai): boolean {
  return TreeMapModel.put(h, ops, peta(h, id), e, PRESENT_TREESET(h)) === null
}

function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  return TreeMapModel.remove(h, ops, peta(h, id), o) === PRESENT_TREESET(h)
}

const contains = (h: H, ops: O, id: number, o: Nilai) => TreeMapModel.containsKey(h, ops, peta(h, id), o)
const size = (h: H, ops: O, id: number) => TreeMapModel.size(h, ops, peta(h, id))
const isEmpty = (h: H, ops: O, id: number) => TreeMapModel.isEmpty(h, ops, peta(h, id))
const clear = (h: H, ops: O, id: number) => TreeMapModel.clear(h, ops, peta(h, id))
const first = (h: H, ops: O, id: number) => TreeMapModel.firstKey(h, ops, peta(h, id))
const last = (h: H, ops: O, id: number) => TreeMapModel.lastKey(h, ops, peta(h, id))

const navigasi =
  (arah: 'ceiling' | 'floor' | 'higher' | 'lower') =>
  (h: H, ops: O, id: number, e: Nilai): Nilai => {
    const p = cariNavigasi(h, ops, peta(h, id), e, arah)
    return p === null ? null : kunciE(h, p)
  }

/** pollFirst/pollLast: kunci entri ujung lalu hapus entrinya. */
function poll(h: H, id: number, ujung: 'pertama' | 'terakhir'): Nilai {
  const map = peta(h, id)
  const p = ujung === 'pertama' ? getFirstEntry(h, map) : getLastEntry(h, map)
  if (p === null) return null
  const kunci = EntriModel.getKey(h, p)
  deleteEntry(h, map, p)
  return kunci
}

/** iterator() = m.navigableKeySet().iterator(): view navigableKeySet milik map dibuat (dan di-cache) dulu. */
function iterator(h: H, ops: O, id: number): number {
  const map = peta(h, id)
  TreeMapModel.navigableKeySet(h, ops, map)
  return iteratorPohon(h, map, 'kunci')
}

/** Iterasi internal dengan efek samping yang sama dengan iterator() (view navigableKeySet), tanpa objek iterator. */
function iterasiSet(h: H, ops: O, id: number) {
  const map = peta(h, id)
  TreeMapModel.navigableKeySet(h, ops, map)
  return iterasiPohon(h, ops, map, 'kunci')
}

/** AbstractCollection.toArray(): lewat iterator(). */
function toArray(h: H, ops: O, id: number): Nilai[] {
  const hasil: Nilai[] = []
  const it = iterasiSet(h, ops, id)
  while (it.hasNext()) hasil.push(it.next())
  return hasil
}

const toString = (h: H, ops: O, id: number) => teksKoleksi(ops, id, iterasiSet(h, ops, id))
const equals = (h: H, ops: O, id: number, o: Nilai) => equalsAbstractSet(h, ops, id, o)
const hashCode = (h: H, ops: O, id: number) => hashCodeAbstractSet(h, ops, id)
const comparator = (h: H, id: number) => pembandingPohon(h, peta(h, id))

export const TreeSetModel = {
  baru,
  dariKoleksi,
  dariSortedSet,
  add,
  addAll,
  removeObjek,
  contains,
  size,
  isEmpty,
  clear,
  first,
  last,
  floor: navigasi('floor'),
  ceiling: navigasi('ceiling'),
  higher: navigasi('higher'),
  lower: navigasi('lower'),
  pollFirst: (h: H, _ops: O, id: number) => poll(h, id, 'pertama'),
  pollLast: (h: H, _ops: O, id: number) => poll(h, id, 'terakhir'),
  comparator,
  iterator,
  toArray,
  toString,
  equals,
  hashCode,
}

daftarkanKoleksi({
  kelas: KELAS_TREESET,
  kelasIterator: ['java.util.TreeMap$KeyIterator'],
  list: false,
  set: true,
  sortedSet: true,
  comparator,
  size,
  contains,
  removeObjek,
  clear,
  keArray: toArray,
  add,
  iterator,
  ...TreeMapItr,
  iterasi: iterasiSet,
  teks: toString,
  equals,
  hashCode,
})
