import { floatKeString } from '../../format'
import type { Nilai } from '../../nilai'
import { EntriModel, KELAS_ENTRI_LINKED, KELAS_NODE_HASH, adalahEntri } from './entri'
import {
  bacaInt,
  bacaRef,
  cme,
  iae,
  ise,
  iteratorLokal,
  naikkan,
  npe,
  nsee,
  pesanNpePanggil,
  teksKoleksi,
  uoe,
  type HeapKoleksi,
  type IteratorLokal,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
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

/**
 * java.util.HashMap{table, entrySet, size, modCount, threshold, loadFactor, keySet, values} dan
 * java.util.LinkedHashMap (tambahan head, tail, accessOrder, putMode; simpul LinkedHashMap$Entry dengan
 * before/after). Hanya urutan penyisipan; accessOrder selalu false dan putMode selalu PUT_NORM.
 *
 * Penyederhanaan: JDK mengubah bin menjadi pohon merah-hitam (HashMap$TreeNode) bila sebuah bin mencapai
 * TREEIFY_THRESHOLD (8) saat tabel sudah ≥ MIN_TREEIFY_CAPACITY (64). Di sini bin seperti itu tetap linked
 * list. Sampai titik itu (termasuk aturan "bin penuh saat tabel < 64 → resize") perilakunya identik JDK;
 * sesudahnya isi map tetap benar, tetapi urutan iterasi bin itu, urutan panggilan equals/compareTo saat
 * mencari di dalamnya, dan bentuk internalnya (TreeNode) bisa berbeda dari JDK.
 */
export const KELAS_HASHMAP = 'java.util.HashMap'
export const KELAS_LINKEDHASHMAP = 'java.util.LinkedHashMap'

const DEFAULT_INITIAL_CAPACITY = 16
const MAXIMUM_CAPACITY = 1 << 30
const DEFAULT_LOAD_FACTOR = 0.75
const TREEIFY_THRESHOLD = 8
const MIN_TREEIFY_CAPACITY = 64
const INT_MAX = 2147483647

const TIPE_HASHMAP: Record<string, string> = {
  table: 'java.util.HashMap$Node[]',
  entrySet: 'java.util.Set',
  size: 'int',
  modCount: 'int',
  threshold: 'int',
  loadFactor: 'float',
  keySet: 'java.util.Set',
  values: 'java.util.Collection',
}
const TIPE_LINKED: Record<string, string> = {
  head: KELAS_ENTRI_LINKED,
  tail: KELAS_ENTRI_LINKED,
  accessOrder: 'boolean',
  putMode: 'int',
  ...TIPE_HASHMAP,
}
const TIPE_NODE: Record<string, string> = {
  hash: 'int',
  key: 'Object',
  value: 'Object',
  next: KELAS_NODE_HASH,
}
const TIPE_ENTRI_LINKED: Record<string, string> = {
  before: KELAS_ENTRI_LINKED,
  after: KELAS_ENTRI_LINKED,
  ...TIPE_NODE,
}

type H = HeapKoleksi
type O = OperasiElemen

const tabel = (h: H, id: number) => bacaRef(h, id, 'table')
const ukuran = (h: H, id: number) => bacaInt(h, id, 'size')
const linked = (h: H, id: number) => h.kelasDari(id) === KELAS_LINKEDHASHMAP
const hashNode = (h: H, n: number) => bacaInt(h, n, 'hash')
const kunci = (h: H, n: number) => h.bacaField(n, 'key')
const nilai = (h: H, n: number) => h.bacaField(n, 'value')
const berikut = (h: H, n: number) => bacaRef(h, n, 'next')

/** HashMap.hash(key): `h ^ (h >>> 16)`; null → 0. */
export function hashKunci(ops: O, key: Nilai): number {
  if (key === null) return 0
  const x = ops.hashCode(key as number)
  return x ^ (x >>> 16)
}

/** `p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k)))`. */
function cocok(h: H, ops: O, p: number, hash: number, key: Nilai): boolean {
  if (hashNode(h, p) !== hash) return false
  const k = kunci(h, p)
  return k === key || (key !== null && ops.equals(key as number, k))
}

/** tableSizeFor(cap): pangkat dua terkecil ≥ cap. */
function tableSizeFor(cap: number): number {
  const n = (-1 >>> Math.clz32(cap - 1)) | 0
  return n < 0 ? 1 : n >= MAXIMUM_CAPACITY ? MAXIMUM_CAPACITY : n + 1
}

function buatPeta(h: H, kelas: string, threshold: number, loadFactor: number): number {
  const field: Record<string, Nilai> = {
    table: null,
    entrySet: null,
    size: 0,
    modCount: 0,
    threshold,
    loadFactor,
    keySet: null,
    values: null,
  }
  if (kelas === KELAS_LINKEDHASHMAP) {
    return h.baruObjek(
      kelas,
      { head: null, tail: null, accessOrder: false, putMode: 0, ...field },
      TIPE_LINKED,
    )
  }
  return h.baruObjek(kelas, field, TIPE_HASHMAP)
}

/** new HashMap<>() / (initialCapacity) / (initialCapacity, loadFactor); kapasitas awal disimpan di threshold. */
export function buatHashMap(
  h: H,
  kelas: string,
  kapasitas?: number,
  loadFactor = DEFAULT_LOAD_FACTOR,
): number {
  if (kapasitas === undefined) return buatPeta(h, kelas, 0, DEFAULT_LOAD_FACTOR)
  if (kapasitas < 0) throw iae(`Illegal initial capacity: ${kapasitas}`)
  if (kapasitas > MAXIMUM_CAPACITY) kapasitas = MAXIMUM_CAPACITY
  const lf = Math.fround(loadFactor)
  if (lf <= 0 || Number.isNaN(lf)) throw iae(`Illegal load factor: ${floatKeString(lf)}`)
  return buatPeta(h, kelas, tableSizeFor(kapasitas), lf)
}

/** HashMap.calculateHashMapCapacity(n) = ceil(n / 0.75), dipakai HashSet(Collection) & LinkedHashSet(Collection). */
export const kapasitasUntuk = (n: number) => Math.ceil(n / DEFAULT_LOAD_FACTOR)

/** resize(): alokasi awal (lazy) atau gandakan tabel; bin dipecah lo/hi dengan urutan terjaga. */
function resize(h: H, id: number): number {
  const oldTab = tabel(h, id)
  const oldCap = oldTab === null ? 0 : h.panjangArray(oldTab)
  const oldThr = bacaInt(h, id, 'threshold')
  let newCap: number
  let newThr = 0
  if (oldCap > 0) {
    if (oldCap >= MAXIMUM_CAPACITY) {
      h.tulisField(id, 'threshold', INT_MAX)
      return oldTab as number
    }
    newCap = oldCap << 1
    if (newCap < MAXIMUM_CAPACITY && oldCap >= DEFAULT_INITIAL_CAPACITY) newThr = oldThr << 1
  } else if (oldThr > 0) {
    newCap = oldThr
  } else {
    newCap = DEFAULT_INITIAL_CAPACITY
    newThr = Math.trunc(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY)
  }
  if (newThr === 0) {
    const ft = Math.fround(newCap * (h.bacaField(id, 'loadFactor') as number))
    newThr = newCap < MAXIMUM_CAPACITY && ft < MAXIMUM_CAPACITY ? Math.trunc(ft) : INT_MAX
  }
  h.tulisField(id, 'threshold', newThr)
  const newTab = h.baruArray(KELAS_NODE_HASH, newCap)
  h.tulisField(id, 'table', newTab)
  if (oldTab !== null) {
    for (let j = 0; j < oldCap; ++j) {
      let e = h.bacaElemen(oldTab, j) as number | null
      if (e === null) continue
      h.tulisElemen(oldTab, j, null)
      if (berikut(h, e) === null) {
        h.tulisElemen(newTab, hashNode(h, e) & (newCap - 1), e)
        continue
      }
      let loHead: number | null = null
      let loTail: number | null = null
      let hiHead: number | null = null
      let hiTail: number | null = null
      do {
        const next: number | null = berikut(h, e)
        if ((hashNode(h, e) & oldCap) === 0) {
          if (loTail === null) loHead = e
          else h.tulisField(loTail, 'next', e)
          loTail = e
        } else {
          if (hiTail === null) hiHead = e
          else h.tulisField(hiTail, 'next', e)
          hiTail = e
        }
        e = next
      } while (e !== null)
      if (loTail !== null) {
        h.tulisField(loTail, 'next', null)
        h.tulisElemen(newTab, j, loHead)
      }
      if (hiTail !== null) {
        h.tulisField(hiTail, 'next', null)
        h.tulisElemen(newTab, j + oldCap, hiHead)
      }
    }
  }
  return newTab
}

/** newNode: HashMap$Node, atau LinkedHashMap$Entry yang langsung ditautkan di ekor (linkNodeAtEnd). */
function simpulBaru(h: H, id: number, hash: number, key: Nilai, value: Nilai, next: number | null): number {
  if (!linked(h, id)) return h.baruObjek(KELAS_NODE_HASH, { hash, key, value, next }, TIPE_NODE)
  const p = h.baruObjek(
    KELAS_ENTRI_LINKED,
    { before: null, after: null, hash, key, value, next },
    TIPE_ENTRI_LINKED,
  )
  const last = bacaRef(h, id, 'tail')
  h.tulisField(id, 'tail', p)
  if (last === null) {
    h.tulisField(id, 'head', p)
  } else {
    h.tulisField(p, 'before', last)
    h.tulisField(last, 'after', p)
  }
  return p
}

/** treeifyBin: tabel < 64 → resize; selainnya JDK membuat pohon (lihat penyederhanaan di atas). */
function treeifyBin(h: H, id: number, tab: number): void {
  if (h.panjangArray(tab) < MIN_TREEIFY_CAPACITY) resize(h, id)
}

/** putVal: kembalikan nilai lama (atau null bila kunci baru). */
function putVal(
  h: H,
  ops: O,
  id: number,
  hash: number,
  key: Nilai,
  value: Nilai,
  onlyIfAbsent: boolean,
): Nilai {
  // Tabel tidak pernah berpanjang 0 (resize selalu ≥ 1), jadi cukup cek null.
  let tab = tabel(h, id)
  if (tab === null) tab = resize(h, id)
  const n = h.panjangArray(tab)
  const i = (n - 1) & hash
  let p = h.bacaElemen(tab, i) as number | null
  if (p === null) {
    h.tulisElemen(tab, i, simpulBaru(h, id, hash, key, value, null))
  } else {
    let e: number | null
    if (cocok(h, ops, p, hash, key)) {
      e = p
    } else {
      for (let binCount = 0; ; ++binCount) {
        e = berikut(h, p)
        if (e === null) {
          h.tulisField(p, 'next', simpulBaru(h, id, hash, key, value, null))
          if (binCount >= TREEIFY_THRESHOLD - 1) treeifyBin(h, id, tab)
          break
        }
        if (cocok(h, ops, e, hash, key)) break
        p = e
      }
    }
    if (e !== null) {
      const lama = nilai(h, e)
      if (!onlyIfAbsent || lama === null) h.tulisField(e, 'value', value)
      return lama
    }
  }
  naikkan(h, id)
  const sizeBaru = ukuran(h, id) + 1
  h.tulisField(id, 'size', sizeBaru)
  if (sizeBaru > bacaInt(h, id, 'threshold')) resize(h, id)
  return null
}

/** getNode: hash(key) baru dihitung bila tabel sudah ada (map kosong tidak memanggil hashCode). */
function getNode(h: H, ops: O, id: number, key: Nilai): number | null {
  const tab = tabel(h, id)
  if (tab === null) return null
  const n = h.panjangArray(tab)
  const hash = hashKunci(ops, key)
  const first = h.bacaElemen(tab, (n - 1) & hash) as number | null
  if (first === null) return null
  if (cocok(h, ops, first, hash, key)) return first
  for (let e = berikut(h, first); e !== null; e = berikut(h, e)) if (cocok(h, ops, e, hash, key)) return e
  return null
}

/** afterNodeRemoval (LinkedHashMap): lepas dari rantai before/after. */
function lepasTautan(h: H, id: number, p: number): void {
  const b = bacaRef(h, p, 'before')
  const a = bacaRef(h, p, 'after')
  h.tulisField(p, 'after', null)
  h.tulisField(p, 'before', null)
  if (b === null) h.tulisField(id, 'head', a)
  else h.tulisField(b, 'after', a)
  if (a === null) h.tulisField(id, 'tail', b)
  else h.tulisField(a, 'before', b)
}

/** removeNode; `matchValue` untuk entrySet().remove (nilai dibandingkan dengan `value.equals(v)`). */
function removeNode(
  h: H,
  ops: O,
  id: number,
  hash: number,
  key: Nilai,
  value: Nilai,
  matchValue: boolean,
): number | null {
  const tab = tabel(h, id)
  if (tab === null) return null
  const n = h.panjangArray(tab)
  const index = (n - 1) & hash
  let p = h.bacaElemen(tab, index) as number | null
  if (p === null) return null
  let node: number | null = null
  if (cocok(h, ops, p, hash, key)) {
    node = p
  } else {
    for (let e = berikut(h, p); e !== null; e = berikut(h, e)) {
      if (cocok(h, ops, e, hash, key)) {
        node = e
        break
      }
      p = e
    }
  }
  if (node === null) return null
  if (matchValue) {
    const v = nilai(h, node)
    if (!(v === value || (value !== null && ops.equals(value as number, v)))) return null
  }
  if (node === p) h.tulisElemen(tab, index, berikut(h, node))
  else h.tulisField(p, 'next', berikut(h, node))
  naikkan(h, id)
  h.tulisField(id, 'size', ukuran(h, id) - 1)
  if (linked(h, id)) lepasTautan(h, id, node)
  return node
}

// ---------- API publik ----------
/** putMapEntries: pra-ukur tabel (ceil(s / loadFactor)) atau resize berulang, lalu putVal per entri. */
function putMapEntries(h: H, ops: O, id: number, m: number): void {
  const mm = modelMapDari(h, m)
  const s = mm.size(h, ops, m)
  if (s <= 0) return
  if (tabel(h, id) === null) {
    const dt = Math.ceil(s / (h.bacaField(id, 'loadFactor') as number))
    const t = dt < MAXIMUM_CAPACITY ? Math.trunc(dt) : MAXIMUM_CAPACITY
    if (t > bacaInt(h, id, 'threshold')) h.tulisField(id, 'threshold', tableSizeFor(t))
  } else {
    while (s > bacaInt(h, id, 'threshold') && h.panjangArray(tabel(h, id) as number) < MAXIMUM_CAPACITY)
      resize(h, id)
  }
  const it = mm.iterasiEntri(h, ops, m)
  while (it.hasNext()) {
    const e = it.next() as number
    const key = EntriModel.getKey(h, e)
    const value = EntriModel.getValue(h, e)
    putVal(h, ops, id, hashKunci(ops, key), key, value, false)
  }
}

const npePeta = () => npe(pesanNpePanggil('java.util.Map.size()', 'm'))

function dariMapKelas(h: H, ops: O, kelas: string, m: Nilai): number {
  if (m === null) throw npePeta()
  const id = buatPeta(h, kelas, 0, DEFAULT_LOAD_FACTOR)
  putMapEntries(h, ops, id, m as number)
  return id
}

function put(h: H, ops: O, id: number, key: Nilai, value: Nilai): Nilai {
  return putVal(h, ops, id, hashKunci(ops, key), key, value, false)
}

function putIfAbsent(h: H, ops: O, id: number, key: Nilai, value: Nilai): Nilai {
  return putVal(h, ops, id, hashKunci(ops, key), key, value, true)
}

function putAll(h: H, ops: O, id: number, m: Nilai): void {
  if (m === null) throw npePeta()
  putMapEntries(h, ops, id, m as number)
}

function get(h: H, ops: O, id: number, key: Nilai): Nilai {
  const e = getNode(h, ops, id, key)
  return e === null ? null : nilai(h, e)
}

function getOrDefault(h: H, ops: O, id: number, key: Nilai, bawaan: Nilai): Nilai {
  const e = getNode(h, ops, id, key)
  return e === null ? bawaan : nilai(h, e)
}

function containsKey(h: H, ops: O, id: number, key: Nilai): boolean {
  return getNode(h, ops, id, key) !== null
}

/** containsValue: `value.equals(v)`; HashMap menelusuri tabel, LinkedHashMap menelusuri rantai before/after. */
function containsValue(h: H, ops: O, id: number, value: Nilai): boolean {
  const sama = (v: Nilai) => v === value || (value !== null && ops.equals(value as number, v))
  if (linked(h, id)) {
    for (let e = bacaRef(h, id, 'head'); e !== null; e = bacaRef(h, e, 'after'))
      if (sama(nilai(h, e))) return true
    return false
  }
  const tab = tabel(h, id)
  if (tab !== null && ukuran(h, id) > 0) {
    for (let i = 0; i < h.panjangArray(tab); i++) {
      for (let e = h.bacaElemen(tab, i) as number | null; e !== null; e = berikut(h, e))
        if (sama(nilai(h, e))) return true
    }
  }
  return false
}

/** remove(key): hash(key) dihitung lebih dulu, walau map masih kosong. */
function remove(h: H, ops: O, id: number, key: Nilai): Nilai {
  const e = removeNode(h, ops, id, hashKunci(ops, key), key, null, false)
  return e === null ? null : nilai(h, e)
}

/** clear(): modCount selalu naik; tabel (dan kapasitasnya) dipertahankan. */
function clear(h: H, _ops: O, id: number): void {
  naikkan(h, id)
  const tab = tabel(h, id)
  if (tab !== null && ukuran(h, id) > 0) {
    h.tulisField(id, 'size', 0)
    for (let i = 0; i < h.panjangArray(tab); i++) h.tulisElemen(tab, i, null)
  }
  if (linked(h, id)) {
    h.tulisField(id, 'tail', null)
    h.tulisField(id, 'head', null)
  }
}

function size(h: H, _ops: O, id: number): number {
  return ukuran(h, id)
}

function isEmpty(h: H, _ops: O, id: number): boolean {
  return ukuran(h, id) === 0
}

function toString(h: H, ops: O, id: number): string {
  return teksMap(h, ops, id, iterasiEntri(h, ops, id))
}

function equals(h: H, ops: O, id: number, o: Nilai): boolean {
  return equalsAbstractMap(h, ops, id, o)
}

function hashCode(h: H, ops: O, id: number): number {
  return hashCodeAbstractMap(h, ops, id)
}

// ---------- Iterator: HashMap$HashIterator & LinkedHashMap$LinkedHashIterator ----------
type Jenis = 'kunci' | 'nilai' | 'entri'

const KELAS_ITR: Record<Jenis, string> = {
  kunci: 'java.util.HashMap$KeyIterator',
  nilai: 'java.util.HashMap$ValueIterator',
  entri: 'java.util.HashMap$EntryIterator',
}
const KELAS_ITR_LINKED: Record<Jenis, string> = {
  kunci: 'java.util.LinkedHashMap$LinkedKeyIterator',
  nilai: 'java.util.LinkedHashMap$LinkedValueIterator',
  entri: 'java.util.LinkedHashMap$LinkedEntryIterator',
}

const petaItr = (w: Wadah) => w.baca('this$0') as number

function fieldItr(h: H, id: number): Record<string, Nilai> {
  if (linked(h, id)) {
    return {
      next: bacaRef(h, id, 'head'),
      current: null,
      expectedModCount: bacaInt(h, id, 'modCount'),
      reversed: false,
      this$0: id,
    }
  }
  const t = tabel(h, id)
  let next: number | null = null
  let index = 0
  if (t !== null && ukuran(h, id) > 0) {
    const n = h.panjangArray(t)
    while (index < n) {
      next = h.bacaElemen(t, index++) as number | null
      if (next !== null) break
    }
  }
  return { next, current: null, expectedModCount: bacaInt(h, id, 'modCount'), index, this$0: id }
}

/** nextNode(): cek modCount dulu, baru NoSuchElementException. */
function nextNode(h: H, w: Wadah): number {
  const id = petaItr(w)
  const e = w.baca('next') as number | null
  if (bacaInt(h, id, 'modCount') !== w.baca('expectedModCount')) throw cme()
  if (e === null) throw nsee()
  w.tulis('current', e)
  if (linked(h, id)) {
    w.tulis('next', bacaRef(h, e, w.baca('reversed') ? 'before' : 'after'))
    return e
  }
  let next = berikut(h, e)
  w.tulis('next', next)
  const t = tabel(h, id)
  if (next === null && t !== null) {
    const n = h.panjangArray(t)
    while (next === null && (w.baca('index') as number) < n) {
      const i = w.baca('index') as number
      w.tulis('index', i + 1)
      next = h.bacaElemen(t, i) as number | null
      w.tulis('next', next)
    }
  }
  return e
}

function hapusSaatIni(h: H, ops: O, w: Wadah): void {
  const id = petaItr(w)
  const p = w.baca('current') as number | null
  if (p === null) throw ise()
  if (bacaInt(h, id, 'modCount') !== w.baca('expectedModCount')) throw cme()
  w.tulis('current', null)
  removeNode(h, ops, id, hashNode(h, p), kunci(h, p), null, false)
  w.tulis('expectedModCount', bacaInt(h, id, 'modCount'))
}

function logika(jenis: Jenis): LogikaIterator {
  return {
    hasNext: (_h, _ops, w) => w.baca('next') !== null,
    next(h, _ops, w) {
      const e = nextNode(h, w)
      return jenis === 'kunci' ? kunci(h, e) : jenis === 'nilai' ? nilai(h, e) : e
    },
    remove: (h, ops, w) => hapusSaatIni(h, ops, w),
  }
}

const LOGIKA: Record<Jenis, LogikaIterator> = {
  kunci: logika('kunci'),
  nilai: logika('nilai'),
  entri: logika('entri'),
}

/** Iterator program (objek heap) atas kunci/nilai/entri map. */
export function iteratorPeta(h: H, id: number, jenis: Jenis): number {
  const lk = linked(h, id)
  const tipe: Record<string, string> = lk
    ? {
        next: KELAS_ENTRI_LINKED,
        current: KELAS_ENTRI_LINKED,
        expectedModCount: 'int',
        reversed: 'boolean',
        this$0: KELAS_LINKEDHASHMAP,
      }
    : {
        next: KELAS_NODE_HASH,
        current: KELAS_NODE_HASH,
        expectedModCount: 'int',
        index: 'int',
        this$0: KELAS_HASHMAP,
      }
  return h.baruObjek((lk ? KELAS_ITR_LINKED : KELAS_ITR)[jenis], fieldItr(h, id), tipe)
}

/** Iterator internal atas kunci/nilai/entri map. */
export function iterasiPeta(h: H, ops: O, id: number, jenis: Jenis): IteratorLokal {
  return iteratorLokal(h, ops, LOGIKA[jenis], fieldItr(h, id))
}

/** entrySet().iterator() milik AbstractMap (toString/equals/hashCode/putAll): view entrySet dibuat lalu di-cache. */
function iterasiEntri(h: H, ops: O, id: number): IteratorLokal {
  view(h, id, 'entri')
  return iterasiPeta(h, ops, id, 'entri')
}

const operasiItr = operasiIterator({
  [KELAS_ITR.kunci]: LOGIKA.kunci,
  [KELAS_ITR.nilai]: LOGIKA.nilai,
  [KELAS_ITR.entri]: LOGIKA.entri,
  [KELAS_ITR_LINKED.kunci]: LOGIKA.kunci,
  [KELAS_ITR_LINKED.nilai]: LOGIKA.nilai,
  [KELAS_ITR_LINKED.entri]: LOGIKA.entri,
})

// ---------- View keySet()/values()/entrySet() ----------
const KELAS_VIEW: Record<Jenis, string> = {
  kunci: 'java.util.HashMap$KeySet',
  nilai: 'java.util.HashMap$Values',
  entri: 'java.util.HashMap$EntrySet',
}
const KELAS_VIEW_LINKED: Record<Jenis, string> = {
  kunci: 'java.util.LinkedHashMap$LinkedKeySet',
  nilai: 'java.util.LinkedHashMap$LinkedValues',
  entri: 'java.util.LinkedHashMap$LinkedEntrySet',
}
const FIELD_CACHE: Record<Jenis, string> = { kunci: 'keySet', nilai: 'values', entri: 'entrySet' }

/** keySet()/values()/entrySet(): view dibuat sekali lalu disimpan di field cache map. */
function view(h: H, id: number, jenis: Jenis): number {
  const ada = bacaRef(h, id, FIELD_CACHE[jenis])
  if (ada !== null) return ada
  const v = linked(h, id)
    ? h.baruObjek(
        KELAS_VIEW_LINKED[jenis],
        { reversed: false, this$0: id },
        { reversed: 'boolean', this$0: KELAS_LINKEDHASHMAP },
      )
    : h.baruObjek(KELAS_VIEW[jenis], { this$0: id }, { this$0: KELAS_HASHMAP })
  h.tulisField(id, FIELD_CACHE[jenis], v)
  return v
}

const keySet = (h: H, _ops: O, id: number) => view(h, id, 'kunci')
const values = (h: H, _ops: O, id: number) => view(h, id, 'nilai')
const entrySet = (h: H, _ops: O, id: number) => view(h, id, 'entri')

function jenisView(h: H, v: number): Jenis {
  const kelas = h.kelasDari(v)
  for (const j of ['kunci', 'nilai', 'entri'] as const)
    if (KELAS_VIEW[j] === kelas || KELAS_VIEW_LINKED[j] === kelas) return j
  throw new Error(`${kelas} bukan view HashMap`)
}

const petaView = (h: H, v: number) => h.bacaField(v, 'this$0') as number

function viewContains(h: H, ops: O, v: number, o: Nilai): boolean {
  const id = petaView(h, v)
  switch (jenisView(h, v)) {
    case 'kunci':
      return getNode(h, ops, id, o) !== null
    case 'nilai':
      return containsValue(h, ops, id, o)
    case 'entri': {
      if (!adalahEntri(h, o)) return false
      const kandidat = getNode(h, ops, id, EntriModel.getKey(h, o as number))
      return kandidat !== null && EntriModel.equals(h, ops, kandidat, o)
    }
  }
}

/** remove(o): KeySet → removeNode; Values → AbstractCollection.remove lewat iterator; EntrySet → cocokkan nilai. */
function viewRemove(h: H, ops: O, v: number, o: Nilai): boolean {
  const id = petaView(h, v)
  switch (jenisView(h, v)) {
    case 'kunci':
      return removeNode(h, ops, id, hashKunci(ops, o), o, null, false) !== null
    case 'nilai': {
      const it = iterasiPeta(h, ops, id, 'nilai')
      while (it.hasNext()) {
        const x = it.next()
        if (o === null ? x === null : ops.equals(o as number, x)) {
          it.remove()
          return true
        }
      }
      return false
    }
    case 'entri': {
      if (!adalahEntri(h, o)) return false
      const key = EntriModel.getKey(h, o as number)
      const value = EntriModel.getValue(h, o as number)
      return removeNode(h, ops, id, hashKunci(ops, key), key, value, true) !== null
    }
  }
}

const viewSize = (h: H, _ops: O, v: number) => ukuran(h, petaView(h, v))
const viewIterator = (h: H, _ops: O, v: number) => iteratorPeta(h, petaView(h, v), jenisView(h, v))
const viewIterasi = (h: H, ops: O, v: number) => iterasiPeta(h, ops, petaView(h, v), jenisView(h, v))

function viewKeArray(h: H, ops: O, v: number): Nilai[] {
  const hasil: Nilai[] = []
  const it = viewIterasi(h, ops, v)
  while (it.hasNext()) hasil.push(it.next())
  return hasil
}

export const HashMapModel = {
  baru: (h: H, kapasitas?: number, loadFactor?: number) =>
    buatHashMap(h, KELAS_HASHMAP, kapasitas, loadFactor),
  dariMap: (h: H, ops: O, m: Nilai) => dariMapKelas(h, ops, KELAS_HASHMAP, m),
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
  keySet,
  values,
  entrySet,
  toString,
  equals,
  hashCode,
}

export const LinkedHashMapModel = {
  ...HashMapModel,
  baru: (h: H, kapasitas?: number, loadFactor?: number) =>
    buatHashMap(h, KELAS_LINKEDHASHMAP, kapasitas, loadFactor),
  dariMap: (h: H, ops: O, m: Nilai) => dariMapKelas(h, ops, KELAS_LINKEDHASHMAP, m),
}

/** Operasi view keySet()/values()/entrySet() milik HashMap/LinkedHashMap. */
export const TampilanHashMapModel = {
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

/** Operasi objek iterator HashMap/LinkedHashMap (kunci, nilai, entri). */
export const HashMapItr = operasiItr

for (const kelas of [KELAS_HASHMAP, KELAS_LINKEDHASHMAP]) {
  daftarkanMap({
    kelas,
    size,
    get,
    containsKey,
    put,
    iterasiEntri,
    keySet,
    values,
    entrySet,
    teks: toString,
    equals,
    hashCode,
  })
}

for (const jenis of ['kunci', 'nilai', 'entri'] as const) {
  for (const kelas of [KELAS_VIEW[jenis], KELAS_VIEW_LINKED[jenis]]) {
    const himpunan = jenis !== 'nilai'
    daftarkanKoleksi({
      kelas,
      kelasIterator: [KELAS_ITR[jenis], KELAS_ITR_LINKED[jenis]],
      list: false,
      set: himpunan,
      size: viewSize,
      contains: viewContains,
      removeObjek: viewRemove,
      clear: TampilanHashMapModel.clear,
      keArray: viewKeArray,
      add: () => {
        throw uoe()
      },
      iterator: viewIterator,
      ...operasiItr,
      iterasi: viewIterasi,
      teks: TampilanHashMapModel.toString,
      ...(himpunan
        ? {
            equals: (h: H, ops: O, v: number, o: Nilai) => equalsAbstractSet(h, ops, v, o),
            hashCode: hashCodeAbstractSet,
          }
        : {}),
    })
  }
}
