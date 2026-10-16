import { LemparanJava, type Nilai } from '../../nilai'
import {
  arrayDari,
  bacaArray,
  hash31,
  hashElemen,
  isiArray,
  iobe,
  iteratorLokal,
  npe,
  nsee,
  pesanNpePanggil,
  samaObjek,
  teksKoleksi,
  tulisArray,
  uoe,
  type HeapKoleksi,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
import {
  adalahList,
  daftarkanKoleksi,
  equalsAbstractList,
  hashCodeAbstractList,
  iterasi,
  operasiIterator,
} from './registri'
import { urutkan } from './urut'

type H = HeapKoleksi
type O = OperasiElemen

// =====================================================================================
// Arrays.asList → java.util.Arrays$ArrayList{a, modCount}: ukuran tetap, ditopang array asli.
// =====================================================================================
export const KELAS_ARRAYS_ARRAYLIST = 'java.util.Arrays$ArrayList'
const KELAS_ARRAYITR = 'java.util.Arrays$ArrayItr'

const larik = (h: H, id: number) => h.bacaField(id, 'a') as number

/** Arrays.asList(array): tidak menyalin; perubahan lewat set() terlihat di array dan sebaliknya. */
function asList(h: H, array: Nilai): number {
  if (array === null) throw npe()
  return h.baruObjek(KELAS_ARRAYS_ARRAYLIST, { a: array, modCount: 0 }, { a: 'Object[]', modCount: 'int' })
}

function asSize(h: H, _ops: O, id: number): number {
  return h.panjangArray(larik(h, id))
}

function asGet(h: H, _ops: O, id: number, index: number): Nilai {
  return bacaArray(h, larik(h, id), index)
}

function asSet(h: H, _ops: O, id: number, index: number, e: Nilai): Nilai {
  const a = larik(h, id)
  const lama = bacaArray(h, a, index)
  tulisArray(h, a, index, e)
  return lama
}

function asIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  const a = larik(h, id)
  const n = h.panjangArray(a)
  if (o === null) {
    for (let i = 0; i < n; i++) if (h.bacaElemen(a, i) === null) return i
  } else {
    for (let i = 0; i < n; i++) if (ops.equals(o as number, h.bacaElemen(a, i))) return i
  }
  return -1
}

/** AbstractList.lastIndexOf lewat listIterator(size()).previous(). */
function asLastIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  const a = larik(h, id)
  for (let i = h.panjangArray(a) - 1; i >= 0; i--) {
    const e = h.bacaElemen(a, i)
    if (o === null ? e === null : ops.equals(o as number, e)) return i
  }
  return -1
}

function asContains(h: H, ops: O, id: number, o: Nilai): boolean {
  return asIndexOf(h, ops, id, o) >= 0
}

/** AbstractList.add(E) → add(size(), e) → UnsupportedOperationException. */
function asAdd(_h: H, _ops: O, _id: number, _e: Nilai): boolean {
  throw uoe()
}

function asAddIndeks(_h: H, _ops: O, _id: number, _index: number, _e: Nilai): void {
  throw uoe()
}

/** AbstractCollection.addAll: add per elemen, jadi c kosong tidak melempar apa pun. */
function asAddAll(h: H, ops: O, id: number, c: Nilai): boolean {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.iterator()', 'c'))
  const it = iterasi(h, ops, c as number)
  let berubah = false
  while (it.hasNext()) if (asAdd(h, ops, id, it.next())) berubah = true
  return berubah
}

function asRemoveIndeks(_h: H, _ops: O, _id: number, _index: number): Nilai {
  throw uoe()
}

/** AbstractCollection.remove(Object): cari lewat iterator; bila ketemu, Iterator.remove() → UOE("remove"). */
function asRemoveObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  const it = iterasi(h, ops, id)
  while (it.hasNext()) {
    const e = it.next()
    if (o === null ? e === null : ops.equals(o as number, e)) {
      it.remove()
      return true
    }
  }
  return false
}

/** AbstractList.clear → removeRange(0, size): ListItr.next() lalu remove() → UOE bila tidak kosong. */
function asClear(h: H, _ops: O, id: number): void {
  if (h.panjangArray(larik(h, id)) > 0) throw uoe()
}

/** sort(c) = Arrays.sort(a, c): array penopang diurutkan langsung. */
function asSort(h: H, ops: O, id: number, pembanding: number | null): void {
  const a = larik(h, id)
  urutkan(h, ops, a, 0, h.panjangArray(a), pembanding)
}

function asToArray(h: H, _ops: O, id: number): Nilai[] {
  const a = larik(h, id)
  return isiArray(h, a, 0, h.panjangArray(a))
}

function asToString(h: H, ops: O, id: number): string {
  return teksKoleksi(ops, id, iterasi(h, ops, id))
}

function asEquals(h: H, ops: O, id: number, o: Nilai): boolean {
  return equalsAbstractList(h, ops, id, o)
}

function asHashCode(h: H, ops: O, id: number): number {
  return hashCodeAbstractList(h, ops, id)
}

/** Arrays$ArrayItr{cursor, a}: tanpa modCount; remove() bawaan Iterator → UOE("remove"). */
const LOGIKA_ARRAYITR: LogikaIterator = {
  hasNext: (h, _ops, w) => (w.baca('cursor') as number) < h.panjangArray(w.baca('a') as number),
  next(h, _ops, w) {
    const a = w.baca('a') as number
    const i = w.baca('cursor') as number
    if (i >= h.panjangArray(a)) throw nsee()
    w.tulis('cursor', i + 1)
    return h.bacaElemen(a, i)
  },
  remove() {
    throw uoe('remove')
  },
}

const fieldArrayItr = (h: H, id: number): Record<string, Nilai> => ({ cursor: 0, a: larik(h, id) })

function asIterator(h: H, _ops: O, id: number): number {
  return h.baruObjek(KELAS_ARRAYITR, fieldArrayItr(h, id), { cursor: 'int', a: 'Object[]' })
}

const operasiArrayItr = operasiIterator({ [KELAS_ARRAYITR]: LOGIKA_ARRAYITR })

export const ArraysAsListModel = {
  asList,
  size: asSize,
  isEmpty: (h: H, ops: O, id: number) => asSize(h, ops, id) === 0,
  get: asGet,
  set: asSet,
  indexOf: asIndexOf,
  lastIndexOf: asLastIndexOf,
  contains: asContains,
  add: asAdd,
  addIndeks: asAddIndeks,
  addAll: asAddAll,
  removeIndeks: asRemoveIndeks,
  removeObjek: asRemoveObjek,
  clear: asClear,
  sort: asSort,
  toArray: asToArray,
  toString: asToString,
  equals: asEquals,
  hashCode: asHashCode,
  iterator: asIterator,
}

/** Operasi objek `Arrays$ArrayItr`. */
export const ArraysAsListItr = operasiArrayItr

daftarkanKoleksi({
  kelas: KELAS_ARRAYS_ARRAYLIST,
  kelasIterator: [KELAS_ARRAYITR],
  list: true,
  size: asSize,
  contains: asContains,
  keArray: asToArray,
  add: asAdd,
  iterator: asIterator,
  ...operasiArrayItr,
  iterasi: (h, ops, id) => iteratorLokal(h, ops, LOGIKA_ARRAYITR, fieldArrayItr(h, id)),
  teks: asToString,
  equals: asEquals,
  hashCode: asHashCode,
  daftar: { aksesAcak: true, get: asGet, set: asSet, sort: asSort },
})

// =====================================================================================
// List.of → daftar tak-berubah ImmutableCollections.
//
// Penyederhanaan: JDK memakai dua kelas, List12{e0, e1} (1–2 elemen) dan ListN{elements, allowNulls}
// (0 dan ≥ 3 elemen). Di sini semua ukuran dimodelkan sebagai ListN dengan array `elements`, tetapi
// perilaku teramati List12 tetap ditiru berdasarkan ukuran: pesan get() di luar batas
// (`Index: 5 Size: 2`, bukan AIOOBE) dan indexOf/lastIndexOf/contains yang memanggil `o.equals(e)`
// tanpa jalan pintas identitas. Akibatnya hanya getClass() dan tampilan "isi dalam" yang berbeda.
// =====================================================================================
export const KELAS_LISTN = 'java.util.ImmutableCollections$ListN'
const KELAS_LISTITR = 'java.util.ImmutableCollections$ListItr'
const TIPE_LISTN: Record<string, string> = { elements: 'Object[]', allowNulls: 'boolean' }

const elemen = (h: H, id: number) => h.bacaField(id, 'elements') as number
const ukuranTetap = (h: H, id: number) => h.panjangArray(elemen(h, id))
/** Ukuran 1–2 berperilaku seperti ImmutableCollections.List12. */
const gayaList12 = (h: H, id: number) => {
  const n = ukuranTetap(h, id)
  return n === 1 || n === 2
}

/** List.of(e...): null → NPE; ukuran 0 memakai EMPTY_LIST bersama. */
function listOf(h: H, isi: readonly Nilai[]): number {
  for (const e of isi) if (e === null) throw npe()
  if (isi.length === 0) {
    return h.statik('java.util.ImmutableCollections', 'EMPTY_LIST', () =>
      h.baruObjek(KELAS_LISTN, { elements: h.baruArray('Object', 0), allowNulls: false }, TIPE_LISTN),
    ) as number
  }
  return h.baruObjek(KELAS_LISTN, { elements: arrayDari(h, isi), allowNulls: false }, TIPE_LISTN)
}

function tetapSize(h: H, _ops: O, id: number): number {
  return ukuranTetap(h, id)
}

/** get: List12 → IOOBE `Index: i Size: n`; ListN → akses array langsung (AIOOBE). */
function tetapGet(h: H, _ops: O, id: number, index: number): Nilai {
  if (gayaList12(h, id)) {
    const n = ukuranTetap(h, id)
    if (index === 0 || (index === 1 && n === 2)) return h.bacaElemen(elemen(h, id), index)
    throw iobe(`Index: ${index} Size: ${n}`)
  }
  return bacaArray(h, elemen(h, id), index)
}

function tetapIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  if (o === null) throw npe()
  const es = elemen(h, id)
  const n = h.panjangArray(es)
  if (gayaList12(h, id)) {
    if (ops.equals(o as number, h.bacaElemen(es, 0))) return 0
    if (n === 2 && ops.equals(o as number, h.bacaElemen(es, 1))) return 1
    return -1
  }
  for (let i = 0; i < n; i++) if (samaObjek(ops, o, h.bacaElemen(es, i))) return i
  return -1
}

function tetapLastIndexOf(h: H, ops: O, id: number, o: Nilai): number {
  if (o === null) throw npe()
  const es = elemen(h, id)
  const n = h.panjangArray(es)
  if (gayaList12(h, id)) {
    if (n === 2 && ops.equals(o as number, h.bacaElemen(es, 1))) return 1
    if (ops.equals(o as number, h.bacaElemen(es, 0))) return 0
    return -1
  }
  for (let i = n - 1; i >= 0; i--) if (samaObjek(ops, o, h.bacaElemen(es, i))) return i
  return -1
}

function tetapContains(h: H, ops: O, id: number, o: Nilai): boolean {
  return tetapIndexOf(h, ops, id, o) >= 0
}

/** Semua pengubah melempar UnsupportedOperationException (pesan null) tanpa memeriksa argumen. */
function tolak(): never {
  throw uoe()
}

/** AbstractImmutableList.equals: `Objects.equals(get(i), oit.next())` (jalan pintas identitas). */
function tetapEquals(h: H, ops: O, id: number, o: Nilai): boolean {
  if (o === id) return true
  if (!adalahList(h, o)) return false
  const oit = iterasi(h, ops, o as number)
  for (let i = 0, s = ukuranTetap(h, id); i < s; i++) {
    if (!oit.hasNext()) return false
    const e = tetapGet(h, ops, id, i)
    if (!samaObjek(ops, e, oit.next())) return false
  }
  return !oit.hasNext()
}

function tetapHashCode(h: H, ops: O, id: number): number {
  let hash = 1
  for (let i = 0, s = ukuranTetap(h, id); i < s; i++)
    hash = hash31(hash, hashElemen(ops, tetapGet(h, ops, id, i)))
  return hash
}

function tetapToArray(h: H, _ops: O, id: number): Nilai[] {
  return isiArray(h, elemen(h, id), 0, ukuranTetap(h, id))
}

function tetapToString(h: H, ops: O, id: number): string {
  return teksKoleksi(ops, id, iterasi(h, ops, id))
}

/** ImmutableCollections$ListItr{list, size, isListIterator, cursor}. */
const LOGIKA_LISTITR: LogikaIterator = {
  hasNext: (_h, _ops, w) => w.baca('cursor') !== w.baca('size'),
  next(h, ops, w) {
    const i = w.baca('cursor') as number
    let e: Nilai
    try {
      e = tetapGet(h, ops, daftarItr(w), i)
    } catch (galat) {
      if (galat instanceof LemparanJava && galat.kelas.endsWith('IndexOutOfBoundsException')) throw nsee()
      throw galat
    }
    w.tulis('cursor', i + 1)
    return e
  },
  remove() {
    throw uoe()
  },
}

const daftarItr = (w: Wadah) => w.baca('list') as number

const fieldListItr = (h: H, id: number): Record<string, Nilai> => ({
  list: id,
  size: ukuranTetap(h, id),
  isListIterator: false,
  cursor: 0,
})

function tetapIterator(h: H, _ops: O, id: number): number {
  return h.baruObjek(KELAS_LISTITR, fieldListItr(h, id), {
    list: 'java.util.List',
    size: 'int',
    isListIterator: 'boolean',
    cursor: 'int',
  })
}

const operasiListItr = operasiIterator({ [KELAS_LISTITR]: LOGIKA_LISTITR })

export const ListOfModel = {
  of: listOf,
  size: tetapSize,
  isEmpty: (h: H, ops: O, id: number) => tetapSize(h, ops, id) === 0,
  get: tetapGet,
  indexOf: tetapIndexOf,
  lastIndexOf: tetapLastIndexOf,
  contains: tetapContains,
  add: tolak,
  addIndeks: tolak,
  addAll: tolak,
  set: tolak,
  removeIndeks: tolak,
  removeObjek: tolak,
  clear: tolak,
  sort: tolak,
  toArray: tetapToArray,
  toString: tetapToString,
  equals: tetapEquals,
  hashCode: tetapHashCode,
  iterator: tetapIterator,
}

/** Operasi objek `ImmutableCollections$ListItr`. */
export const ListOfItr = operasiListItr

daftarkanKoleksi({
  kelas: KELAS_LISTN,
  kelasIterator: [KELAS_LISTITR],
  list: true,
  size: tetapSize,
  contains: tetapContains,
  keArray: tetapToArray,
  add: tolak,
  iterator: tetapIterator,
  ...operasiListItr,
  iterasi: (h, ops, id) => iteratorLokal(h, ops, LOGIKA_LISTITR, fieldListItr(h, id)),
  teks: tetapToString,
  equals: tetapEquals,
  hashCode: tetapHashCode,
  daftar: { aksesAcak: true, get: tetapGet, set: tolak, sort: tolak },
})
