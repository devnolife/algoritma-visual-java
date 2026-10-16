import type { Nilai } from '../../nilai'
import {
  buatHashMap,
  HashMapItr,
  HashMapModel,
  iterasiPeta,
  iteratorPeta,
  kapasitasUntuk,
  KELAS_HASHMAP,
  KELAS_LINKEDHASHMAP,
} from './hashMap'
import { npe, pesanNpePanggil, teksKoleksi, type HeapKoleksi, type OperasiElemen } from './heap'
import { daftarkanKoleksi, equalsAbstractSet, hashCodeAbstractSet, iterasi, ukuranKoleksi } from './registri'

/**
 * java.util.HashSet{map} dan java.util.LinkedHashSet: himpunan yang ditopang HashMap/LinkedHashMap dengan
 * nilai bersama HashSet.PRESENT. Seperti JDK, iterator() (dan semua yang beriterasi lewat iterator: toString,
 * equals, hashCode, for-each) membuat view keySet di map penopang dan menyimpannya di field cache map itu.
 */
export const KELAS_HASHSET = 'java.util.HashSet'
export const KELAS_LINKEDHASHSET = 'java.util.LinkedHashSet'

type H = HeapKoleksi
type O = OperasiElemen

/** HashSet.PRESENT: satu Object bersama untuk semua nilai map penopang. */
export const PRESENT_HASHSET = (h: H) =>
  h.statik(KELAS_HASHSET, 'PRESENT', () => h.baruObjek('java.lang.Object', {}, {})) as number

const peta = (h: H, id: number) => h.bacaField(id, 'map') as number

function buat(h: H, kelas: string, map: number): number {
  PRESENT_HASHSET(h)
  return h.baruObjek(kelas, { map }, { map: KELAS_HASHMAP })
}

/** new HashSet<>() / (initialCapacity) / (initialCapacity, loadFactor). */
function baru(h: H, kapasitas?: number, loadFactor?: number): number {
  return buat(h, KELAS_HASHSET, buatHashMap(h, KELAS_HASHMAP, kapasitas, loadFactor))
}

/** new LinkedHashSet<>(): selalu lewat new LinkedHashMap<>(16 atau initialCapacity, 0.75f). */
function baruLinked(h: H, kapasitas = 16, loadFactor = 0.75): number {
  return buat(h, KELAS_LINKEDHASHSET, buatHashMap(h, KELAS_LINKEDHASHMAP, kapasitas, loadFactor))
}

/** Konstruktor (Collection): map berukuran calculateHashMapCapacity(max(c.size(), 12)), lalu addAll(c). */
function dariKoleksiKelas(h: H, ops: O, kelas: string, c: Nilai): number {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.size()', 'c'))
  const kapasitas = kapasitasUntuk(Math.max(ukuranKoleksi(h, ops, c as number), 12))
  const map = buatHashMap(h, kelas === KELAS_HASHSET ? KELAS_HASHMAP : KELAS_LINKEDHASHMAP, kapasitas)
  const id = buat(h, kelas, map)
  addAll(h, ops, id, c)
  return id
}

function add(h: H, ops: O, id: number, e: Nilai): boolean {
  return HashMapModel.put(h, ops, peta(h, id), e, PRESENT_HASHSET(h)) === null
}

function removeObjek(h: H, ops: O, id: number, o: Nilai): boolean {
  return HashMapModel.remove(h, ops, peta(h, id), o) === PRESENT_HASHSET(h)
}

function contains(h: H, ops: O, id: number, o: Nilai): boolean {
  return HashMapModel.containsKey(h, ops, peta(h, id), o)
}

const size = (h: H, ops: O, id: number) => HashMapModel.size(h, ops, peta(h, id))
const isEmpty = (h: H, ops: O, id: number) => HashMapModel.isEmpty(h, ops, peta(h, id))
const clear = (h: H, ops: O, id: number) => HashMapModel.clear(h, ops, peta(h, id))

/** AbstractCollection.addAll: add per elemen dalam urutan iterasi c. */
function addAll(h: H, ops: O, id: number, c: Nilai): boolean {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.iterator()', 'c'))
  let berubah = false
  const it = iterasi(h, ops, c as number)
  while (it.hasNext()) if (add(h, ops, id, it.next())) berubah = true
  return berubah
}

/** iterator() = map.keySet().iterator(): view keySet map penopang dibuat (dan di-cache) dulu. */
function iterator(h: H, ops: O, id: number): number {
  const map = peta(h, id)
  HashMapModel.keySet(h, ops, map)
  return iteratorPeta(h, map, 'kunci')
}

/** Iterasi internal dengan efek samping yang sama dengan iterator() (view keySet), tanpa objek iterator. */
function iterasiSet(h: H, ops: O, id: number) {
  const map = peta(h, id)
  HashMapModel.keySet(h, ops, map)
  return iterasiPeta(h, ops, map, 'kunci')
}

/** toArray() = map.keysToArray(...): langsung dari tabel/rantai map, tanpa view keySet. */
function toArray(h: H, ops: O, id: number): Nilai[] {
  const hasil: Nilai[] = []
  const it = iterasiPeta(h, ops, peta(h, id), 'kunci')
  while (it.hasNext()) hasil.push(it.next())
  return hasil
}

const toString = (h: H, ops: O, id: number) => teksKoleksi(ops, id, iterasiSet(h, ops, id))
const equals = (h: H, ops: O, id: number, o: Nilai) => equalsAbstractSet(h, ops, id, o)
const hashCode = (h: H, ops: O, id: number) => hashCodeAbstractSet(h, ops, id)

const metode = {
  add,
  addAll,
  removeObjek,
  contains,
  size,
  isEmpty,
  clear,
  iterator,
  toArray,
  toString,
  equals,
  hashCode,
}

export const HashSetModel = {
  baru,
  dariKoleksi: (h: H, ops: O, c: Nilai) => dariKoleksiKelas(h, ops, KELAS_HASHSET, c),
  ...metode,
}

export const LinkedHashSetModel = {
  baru: baruLinked,
  dariKoleksi: (h: H, ops: O, c: Nilai) => dariKoleksiKelas(h, ops, KELAS_LINKEDHASHSET, c),
  ...metode,
}

for (const kelas of [KELAS_HASHSET, KELAS_LINKEDHASHSET]) {
  const kelasItr =
    kelas === KELAS_HASHSET ? 'java.util.HashMap$KeyIterator' : 'java.util.LinkedHashMap$LinkedKeyIterator'
  daftarkanKoleksi({
    kelas,
    kelasIterator: [kelasItr],
    list: false,
    set: true,
    size,
    contains,
    removeObjek,
    clear,
    keArray: toArray,
    add,
    iterator,
    ...HashMapItr,
    iterasi: iterasiSet,
    teks: toString,
    equals,
    hashCode,
  })
}
