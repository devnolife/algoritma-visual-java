import type { Nilai } from '../../nilai'
import { adalahEntri, EntriModel } from './entri'
import {
  BelumDidukung,
  bacaInt,
  bacaRef,
  cme,
  ise,
  iteratorLokal,
  naikkan,
  npe,
  nsee,
  pesanNpePanggil,
  samaNullAman,
  samaObjek,
  teksKoleksi,
  uoe,
  type HeapKoleksi,
  type IteratorLokal,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
import {
  buatPohon,
  buildFromSorted,
  cariNavigasi,
  deleteEntry,
  getEntry,
  getFirstEntry,
  getLastEntry,
  KELAS_TREEMAP,
  kunciAtauGagal,
  kunciE,
  nilaiE,
  pembandingPohon,
  putPohon,
  successor,
  ukuranPohon,
} from './pohon'
import {
  daftarkanKoleksi,
  daftarkanMap,
  equalsAbstractMap,
  equalsAbstractSet,
  hashCodeAbstractMap,
  hashCodeAbstractSet,
  modelMapDari,
  operasiIterator,
  teksMap,
} from './registri'

export { KELAS_TREEMAP } from './pohon'

type H = HeapKoleksi
type O = OperasiElemen
type Jenis = 'kunci' | 'nilai' | 'entri'

/** new TreeMap<>() / new TreeMap<>(comparator). */
function baru(h: H, pembanding: Nilai = null): number {
  return buatPohon(h, pembanding)
}

const npePeta = () => npe(pesanNpePanggil('java.util.Map.size()', 'map'))

/**
 * putAll: map kosong + sumber SortedMap dengan comparator yang sama → buildFromSorted (modCount naik sekali);
 * selainnya AbstractMap.putAll (put per entri).
 */
function putAll(h: H, ops: O, id: number, m: Nilai): void {
  if (m === null) throw npePeta()
  const mm = modelMapDari(h, m as number)
  const ukuranSumber = mm.size(h, ops, m as number)
  if (ukuranPohon(h, id) === 0 && ukuranSumber !== 0 && mm.sortedMap) {
    const cmpSumber = mm.comparator ? mm.comparator(h, m as number) : null
    if (samaObjek(ops, pembandingPohon(h, id), cmpSumber)) {
      naikkan(h, id)
      buildFromSorted(h, id, ukuranSumber, mm.iterasiEntri(h, ops, m as number))
      return
    }
  }
  const it = mm.iterasiEntri(h, ops, m as number)
  while (it.hasNext()) {
    const e = it.next() as number
    put(h, ops, id, EntriModel.getKey(h, e), EntriModel.getValue(h, e))
  }
}

/** new TreeMap<>(Map m): comparator null lalu putAll(m). */
function dariMap(h: H, ops: O, m: Nilai): number {
  const id = buatPohon(h, null)
  putAll(h, ops, id, m)
  return id
}

/** new TreeMap<>(SortedMap m): comparator milik m, lalu buildFromSorted tanpa menaikkan modCount. */
function dariSortedMap(h: H, ops: O, m: Nilai): number {
  if (m === null) throw npe(pesanNpePanggil('java.util.SortedMap.comparator()', 'm'))
  const mm = modelMapDari(h, m as number)
  const id = buatPohon(h, mm.comparator ? mm.comparator(h, m as number) : null)
  buildFromSorted(h, id, mm.size(h, ops, m as number), mm.iterasiEntri(h, ops, m as number))
  return id
}

const put = (h: H, ops: O, id: number, key: Nilai, value: Nilai) => putPohon(h, ops, id, key, value, true)
const putIfAbsent = (h: H, ops: O, id: number, key: Nilai, value: Nilai) =>
  putPohon(h, ops, id, key, value, false)

function get(h: H, ops: O, id: number, key: Nilai): Nilai {
  const p = getEntry(h, ops, id, key)
  return p === null ? null : nilaiE(h, p)
}

/** Map.getOrDefault bawaan: get lalu containsKey bila hasilnya null (dua kali pencarian). */
function getOrDefault(h: H, ops: O, id: number, key: Nilai, bawaan: Nilai): Nilai {
  const v = get(h, ops, id, key)
  return v !== null || containsKey(h, ops, id, key) ? v : bawaan
}

const containsKey = (h: H, ops: O, id: number, key: Nilai) => getEntry(h, ops, id, key) !== null

/** containsValue: `value.equals(e.value)` dalam urutan terurut. */
function containsValue(h: H, ops: O, id: number, value: Nilai): boolean {
  for (let e = getFirstEntry(h, id); e !== null; e = successor(h, e)) {
    if (samaNullAman(ops, value, nilaiE(h, e))) return true
  }
  return false
}

function remove(h: H, ops: O, id: number, key: Nilai): Nilai {
  const p = getEntry(h, ops, id, key)
  if (p === null) return null
  const lama = nilaiE(h, p)
  deleteEntry(h, id, p)
  return lama
}

/** clear(): akar dilepas; simpul lama tidak disentuh. */
function clear(h: H, _ops: O, id: number): void {
  naikkan(h, id)
  h.tulisField(id, 'size', 0)
  h.tulisField(id, 'root', null)
}

const size = (h: H, _ops: O, id: number) => ukuranPohon(h, id)
const isEmpty = (h: H, _ops: O, id: number) => ukuranPohon(h, id) === 0
const comparator = (h: H, id: number) => pembandingPohon(h, id)

const firstKey = (h: H, _ops: O, id: number) => kunciAtauGagal(h, getFirstEntry(h, id))
const lastKey = (h: H, _ops: O, id: number) => kunciAtauGagal(h, getLastEntry(h, id))

/** exportEntry: salinan AbstractMap$SimpleImmutableEntry (null bila tidak ada). */
const ekspor = (h: H, e: number | null) => (e === null ? null : EntriModel.salinImut(h, e))
const kunciAtauNull = (h: H, e: number | null) => (e === null ? null : kunciE(h, e))

const navigasi =
  (arah: 'ceiling' | 'floor' | 'higher' | 'lower', bentuk: 'kunci' | 'entri') =>
  (h: H, ops: O, id: number, key: Nilai) => {
    const e = cariNavigasi(h, ops, id, key, arah)
    return bentuk === 'kunci' ? kunciAtauNull(h, e) : ekspor(h, e)
  }

/** pollFirstEntry/pollLastEntry: ekspor salinan dulu, baru hapus. */
function poll(h: H, id: number, p: number | null): Nilai {
  const hasil = ekspor(h, p)
  if (p !== null) deleteEntry(h, id, p)
  return hasil
}

const belum = (nama: string) => () => {
  throw new BelumDidukung(`TreeMap.${nama} belum didukung`)
}

// ---------- Iterator: TreeMap$PrivateEntryIterator ----------
const KELAS_ITR: Record<Jenis, string> = {
  kunci: 'java.util.TreeMap$KeyIterator',
  nilai: 'java.util.TreeMap$ValueIterator',
  entri: 'java.util.TreeMap$EntryIterator',
}
const TIPE_ITR: Record<string, string> = {
  next: 'java.util.TreeMap$Entry',
  lastReturned: 'java.util.TreeMap$Entry',
  expectedModCount: 'int',
  this$0: KELAS_TREEMAP,
}

const petaItr = (w: Wadah) => w.baca('this$0') as number

/** nextEntry(): NoSuchElementException dicek sebelum ConcurrentModificationException (kebalikan HashMap). */
function nextEntry(h: H, w: Wadah): number {
  const e = w.baca('next') as number | null
  if (e === null) throw nsee()
  if (bacaInt(h, petaItr(w), 'modCount') !== w.baca('expectedModCount')) throw cme()
  w.tulis('next', successor(h, e))
  w.tulis('lastReturned', e)
  return e
}

function hapusItr(h: H, w: Wadah): void {
  const id = petaItr(w)
  const lr = w.baca('lastReturned') as number | null
  if (lr === null) throw ise()
  if (bacaInt(h, id, 'modCount') !== w.baca('expectedModCount')) throw cme()
  // Entri dengan dua anak digantikan penerusnya di tempat, jadi berikutnya adalah entri yang sama.
  if (bacaRef(h, lr, 'left') !== null && bacaRef(h, lr, 'right') !== null) w.tulis('next', lr)
  deleteEntry(h, id, lr)
  w.tulis('expectedModCount', bacaInt(h, id, 'modCount'))
  w.tulis('lastReturned', null)
}

function logika(jenis: Jenis): LogikaIterator {
  return {
    hasNext: (_h, _ops, w) => w.baca('next') !== null,
    next(h, _ops, w) {
      const e = nextEntry(h, w)
      return jenis === 'kunci' ? kunciE(h, e) : jenis === 'nilai' ? nilaiE(h, e) : e
    },
    remove: (h, _ops, w) => hapusItr(h, w),
  }
}

const LOGIKA: Record<Jenis, LogikaIterator> = {
  kunci: logika('kunci'),
  nilai: logika('nilai'),
  entri: logika('entri'),
}

const fieldItr = (h: H, id: number): Record<string, Nilai> => ({
  next: getFirstEntry(h, id),
  lastReturned: null,
  expectedModCount: bacaInt(h, id, 'modCount'),
  this$0: id,
})

/** Iterator program (objek heap) atas kunci/nilai/entri, dalam urutan terurut. */
export function iteratorPohon(h: H, id: number, jenis: Jenis): number {
  return h.baruObjek(KELAS_ITR[jenis], fieldItr(h, id), TIPE_ITR)
}

/** Iterator internal atas kunci/nilai/entri. */
export function iterasiPohon(h: H, ops: O, id: number, jenis: Jenis): IteratorLokal {
  return iteratorLokal(h, ops, LOGIKA[jenis], fieldItr(h, id))
}

/** entrySet().iterator() milik AbstractMap (toString/equals/hashCode/putAll): view entrySet dibuat lalu di-cache. */
const iterasiEntri = (h: H, ops: O, id: number) => {
  view(h, id, 'entri')
  return iterasiPohon(h, ops, id, 'entri')
}

const operasiItr = operasiIterator({
  [KELAS_ITR.kunci]: LOGIKA.kunci,
  [KELAS_ITR.nilai]: LOGIKA.nilai,
  [KELAS_ITR.entri]: LOGIKA.entri,
})

const toString = (h: H, ops: O, id: number) => teksMap(h, ops, id, iterasiEntri(h, ops, id))
const equals = (h: H, ops: O, id: number, o: Nilai) => equalsAbstractMap(h, ops, id, o)
const hashCode = (h: H, ops: O, id: number) => hashCodeAbstractMap(h, ops, id)

// ---------- View: TreeMap$KeySet{m}, TreeMap$Values, TreeMap$EntrySet ----------
const KELAS_VIEW: Record<Jenis, string> = {
  kunci: 'java.util.TreeMap$KeySet',
  nilai: 'java.util.TreeMap$Values',
  entri: 'java.util.TreeMap$EntrySet',
}
const FIELD_CACHE: Record<Jenis, string> = { kunci: 'navigableKeySet', nilai: 'values', entri: 'entrySet' }

/** keySet() = navigableKeySet(); values(); entrySet(): dibuat sekali lalu di-cache. */
function view(h: H, id: number, jenis: Jenis): number {
  const ada = bacaRef(h, id, FIELD_CACHE[jenis])
  if (ada !== null) return ada
  const v =
    jenis === 'kunci'
      ? h.baruObjek(KELAS_VIEW.kunci, { m: id }, { m: 'java.util.NavigableMap' })
      : h.baruObjek(KELAS_VIEW[jenis], { this$0: id }, { this$0: KELAS_TREEMAP })
  h.tulisField(id, FIELD_CACHE[jenis], v)
  return v
}

function jenisView(h: H, v: number): Jenis {
  const kelas = h.kelasDari(v)
  for (const j of ['kunci', 'nilai', 'entri'] as const) if (KELAS_VIEW[j] === kelas) return j
  throw new Error(`${kelas} bukan view TreeMap`)
}

const petaView = (h: H, v: number) => h.bacaField(v, jenisView(h, v) === 'kunci' ? 'm' : 'this$0') as number

function viewContains(h: H, ops: O, v: number, o: Nilai): boolean {
  const id = petaView(h, v)
  switch (jenisView(h, v)) {
    case 'kunci':
      return containsKey(h, ops, id, o)
    case 'nilai':
      return containsValue(h, ops, id, o)
    case 'entri': {
      if (!adalahEntri(h, o)) return false
      const value = EntriModel.getValue(h, o as number)
      const p = getEntry(h, ops, id, EntriModel.getKey(h, o as number))
      return p !== null && samaNullAman(ops, nilaiE(h, p), value)
    }
  }
}

/** remove(o): KeySet lewat m.remove + bandingkan ukuran; Values pakai `e.getValue().equals(o)`. */
function viewRemove(h: H, ops: O, v: number, o: Nilai): boolean {
  const id = petaView(h, v)
  switch (jenisView(h, v)) {
    case 'kunci': {
      const lama = ukuranPohon(h, id)
      remove(h, ops, id, o)
      return ukuranPohon(h, id) !== lama
    }
    case 'nilai':
      for (let e = getFirstEntry(h, id); e !== null; e = successor(h, e)) {
        if (samaNullAman(ops, nilaiE(h, e), o)) {
          deleteEntry(h, id, e)
          return true
        }
      }
      return false
    case 'entri': {
      if (!adalahEntri(h, o)) return false
      const value = EntriModel.getValue(h, o as number)
      const p = getEntry(h, ops, id, EntriModel.getKey(h, o as number))
      if (p !== null && samaNullAman(ops, nilaiE(h, p), value)) {
        deleteEntry(h, id, p)
        return true
      }
      return false
    }
  }
}

const viewSize = (h: H, _ops: O, v: number) => ukuranPohon(h, petaView(h, v))
const viewIterator = (h: H, _ops: O, v: number) => iteratorPohon(h, petaView(h, v), jenisView(h, v))
const viewIterasi = (h: H, ops: O, v: number) => iterasiPohon(h, ops, petaView(h, v), jenisView(h, v))

function viewKeArray(h: H, ops: O, v: number): Nilai[] {
  const hasil: Nilai[] = []
  const it = viewIterasi(h, ops, v)
  while (it.hasNext()) hasil.push(it.next())
  return hasil
}

export const TreeMapModel = {
  baru,
  dariMap,
  dariSortedMap,
  put,
  get,
  getOrDefault,
  containsKey,
  containsValue,
  remove,
  putIfAbsent,
  putAll,
  size,
  isEmpty,
  clear,
  comparator,
  firstKey,
  lastKey,
  floorKey: navigasi('floor', 'kunci'),
  ceilingKey: navigasi('ceiling', 'kunci'),
  higherKey: navigasi('higher', 'kunci'),
  lowerKey: navigasi('lower', 'kunci'),
  firstEntry: (h: H, _ops: O, id: number) => ekspor(h, getFirstEntry(h, id)),
  lastEntry: (h: H, _ops: O, id: number) => ekspor(h, getLastEntry(h, id)),
  floorEntry: navigasi('floor', 'entri'),
  ceilingEntry: navigasi('ceiling', 'entri'),
  higherEntry: navigasi('higher', 'entri'),
  lowerEntry: navigasi('lower', 'entri'),
  pollFirstEntry: (h: H, _ops: O, id: number) => poll(h, id, getFirstEntry(h, id)),
  pollLastEntry: (h: H, _ops: O, id: number) => poll(h, id, getLastEntry(h, id)),
  keySet: (h: H, _ops: O, id: number) => view(h, id, 'kunci'),
  navigableKeySet: (h: H, _ops: O, id: number) => view(h, id, 'kunci'),
  values: (h: H, _ops: O, id: number) => view(h, id, 'nilai'),
  entrySet: (h: H, _ops: O, id: number) => view(h, id, 'entri'),
  headMap: belum('headMap'),
  tailMap: belum('tailMap'),
  subMap: belum('subMap'),
  descendingMap: belum('descendingMap'),
  descendingKeySet: belum('descendingKeySet'),
  toString,
  equals,
  hashCode,
}

/** Operasi view keySet()/values()/entrySet() milik TreeMap. */
export const TampilanTreeMapModel = {
  size: viewSize,
  isEmpty: (h: H, ops: O, v: number) => viewSize(h, ops, v) === 0,
  contains: viewContains,
  removeObjek: viewRemove,
  /** AbstractCollection.add → UnsupportedOperationException. */
  add: (): boolean => {
    throw uoe()
  },
  clear: (h: H, ops: O, v: number) => clear(h, ops, petaView(h, v)),
  iterator: viewIterator,
  toArray: viewKeArray,
  toString: (h: H, ops: O, v: number) => teksKoleksi(ops, v, viewIterasi(h, ops, v)),
}

/** Operasi objek iterator TreeMap (kunci, nilai, entri). */
export const TreeMapItr = operasiItr

daftarkanMap({
  kelas: KELAS_TREEMAP,
  sortedMap: true,
  size,
  get,
  containsKey,
  put,
  iterasiEntri,
  keySet: TreeMapModel.keySet,
  values: TreeMapModel.values,
  entrySet: TreeMapModel.entrySet,
  teks: toString,
  equals,
  hashCode,
  comparator,
})

for (const jenis of ['kunci', 'nilai', 'entri'] as const) {
  const himpunan = jenis !== 'nilai'
  daftarkanKoleksi({
    kelas: KELAS_VIEW[jenis],
    kelasIterator: [KELAS_ITR[jenis]],
    list: false,
    set: himpunan,
    // KeySet milik TreeMap adalah NavigableSet (SortedSet) dengan comparator map-nya.
    ...(jenis === 'kunci'
      ? { sortedSet: true, comparator: (h: H, v: number) => pembandingPohon(h, petaView(h, v)) }
      : {}),
    size: viewSize,
    contains: viewContains,
    removeObjek: viewRemove,
    clear: TampilanTreeMapModel.clear,
    keArray: viewKeArray,
    add: () => {
      throw uoe()
    },
    iterator: viewIterator,
    ...operasiItr,
    iterasi: viewIterasi,
    teks: TampilanTreeMapModel.toString,
    ...(himpunan
      ? {
          equals: (h: H, ops: O, v: number, o: Nilai) => equalsAbstractSet(h, ops, v, o),
          hashCode: hashCodeAbstractSet,
        }
      : {}),
  })
}
