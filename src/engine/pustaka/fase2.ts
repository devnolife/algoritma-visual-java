/**
 * Implementasi pustaka Fase 2 yang dipanggil interpreter berdasarkan jenis objek penerima:
 * - koleksi java.util (lewat model JDK di ./koleksi), termasuk Map.Entry, iterator, dan view map;
 * - wrapper (Integer, Long, Double, Character, Boolean, …), StringBuilder, dan Random;
 * - method static Collections, Arrays.asList/sort(T[]), List.of, valueOf wrapper, dan Objects.
 * Method milik class mahasiswa (toString/equals/hashCode/compareTo yang di-override) dan Throwable ditangani
 * interpreter, karena perlu menjalankan kode mahasiswa dan membaca stack trace.
 */
import { primitifKeString } from '../format'
import { konversiPrimitif, LemparanJava, type Nilai } from '../nilai'
import type { NamaPrimitif, Tipe } from '../tipe'
import type { ObjekHeap } from '../trace'
import { AcakJava, bitDouble, hashBoolean, hashDouble, hashFloat, hashLong } from './hash'
import {
  adalahEntri,
  ArrayDequeModel,
  ArrayListModel,
  ArraysAsListModel,
  cariModel,
  cariModelMap,
  CollectionsModel,
  containsAll,
  EntriModel,
  HashMapModel,
  HashSetModel,
  iterasi,
  LinkedHashMapModel,
  LinkedHashSetModel,
  LinkedListModel,
  ListOfModel,
  modelDari,
  PriorityQueueModel,
  StackModel,
  TampilanHashMapModel,
  TampilanTreeMapModel,
  TreeMapModel,
  TreeSetModel,
  urutkan,
  VectorModel,
  type HeapKoleksi,
  type OperasiElemen,
} from './koleksi'
import { aturKarakter, aturPanjang, balik, bandingkanTeks, ganti, hapus, hapusKarakter, indeksDari, indeksTerakhir, karakterDi, potong, sisip } from './stringBuilder'

/** Layanan interpreter yang dibutuhkan pustaka Fase 2. */
export interface KonteksFase2 {
  readonly h: HeapKoleksi
  readonly ops: OperasiElemen
  readonly heap: Record<number, ObjekHeap>
  boks(kelas: string, nilai: Nilai): number
  buatString(s: string): number
  /** Isi String (NPE bila null). */
  teks(ref: Nilai): string
  buatPembangun(s: string): number
  ubahPembangun(id: number, baru: string, metode: string): void
  /** String.valueOf(v) untuk nilai bertipe statis `t` (menjalankan toString mahasiswa bila perlu). */
  keString(v: Nilai, t: Tipe): string
  /** Array referensi baru, mis. hasil toArray(). */
  buatArrayObjek(isi: Nilai[]): number
  /** Seed bawaan untuk `new Random()` tanpa argumen (deterministik di simulator). */
  seedBawaan(): bigint
  /** Panggil implementasi Fase 1 berdasarkan id, mis. `Integer.parseInt(String)`. */
  panggilFase1(id: string, arg: Nilai[], tipeParam: Tipe[]): Nilai
}

/** Penanda: method tidak ditangani modul ini. */
export const TIDAK_ADA = Symbol('tidak-ada')
export type HasilPustaka = Nilai | typeof TIDAK_ADA

const npe = (pesan: string | null = null) => new LemparanJava('java.lang.NullPointerException', pesan)

type FungsiModel = (h: HeapKoleksi, ops: OperasiElemen, id: number, ...arg: never[]) => unknown
type Model = Record<string, unknown>

/** Model lengkap per nama kelas JDK (selain view & iterator, yang lewat registri). */
const MODEL: Record<string, Model> = {
  'java.util.ArrayList': ArrayListModel,
  'java.util.LinkedList': LinkedListModel,
  'java.util.ArrayDeque': ArrayDequeModel,
  'java.util.Stack': StackModel,
  'java.util.Vector': VectorModel,
  'java.util.PriorityQueue': PriorityQueueModel,
  'java.util.Arrays$ArrayList': ArraysAsListModel,
  'java.util.ImmutableCollections$ListN': ListOfModel,
  'java.util.HashMap': HashMapModel,
  'java.util.LinkedHashMap': LinkedHashMapModel,
  'java.util.TreeMap': TreeMapModel,
  'java.util.HashSet': HashSetModel,
  'java.util.LinkedHashSet': LinkedHashSetModel,
  'java.util.TreeSet': TreeSetModel,
}

const adalahKelas = (t: Tipe | undefined, nama: string) => t?.k === 'kelas' && t.nama === nama
const adalahIntParam = (t: Tipe | undefined) => t?.k === 'primitif' && t.nama === 'int'

/** Nama operasi model untuk method Java `nama(p...)`, mis. remove(int) → removeIndeks. */
function namaOperasi(model: Model, nama: string, p: Tipe[]): string | undefined {
  const ada = (n: string) => typeof model[n] === 'function'
  if (nama === 'remove') {
    if (p.length === 0) return ada('remove') ? 'remove' : undefined
    if (adalahIntParam(p[0]) && ada('removeIndeks')) return 'removeIndeks'
    if (ada('removeObjek')) return 'removeObjek'
    return ada('remove') ? 'remove' : undefined
  }
  if ((nama === 'add' || nama === 'addAll') && p.length === 2 && adalahIntParam(p[0]) && ada(`${nama}Indeks`)) return `${nama}Indeks`
  return ada(nama) ? nama : undefined
}

/** Ubah nilai kembali model menjadi nilai Java. */
function hasilModel(c: KonteksFase2, nama: string, v: unknown): Nilai {
  if (v === undefined) return null
  if (typeof v === 'string') return c.buatString(v)
  if (Array.isArray(v)) return c.buatArrayObjek(v as Nilai[])
  if (nama === 'toArray' && typeof v === 'number') return v
  return v as Nilai
}

const panggilModel = (c: KonteksFase2, model: Model, op: string, id: number, arg: Nilai[]): Nilai =>
  hasilModel(c, op, (model[op] as FungsiModel)(c.h, c.ops, id, ...(arg as never[])))

// ---------- Konstruktor ----------

/** `new X(...)` untuk koleksi, StringBuilder, dan Random. undefined bila bukan kelas yang ditangani. */
export function konstruktorFase2(c: KonteksFase2, kelas: string, arg: Nilai[], p: Tipe[]): number | undefined {
  const h = c.h
  const kosong = arg.length === 0
  const angka = adalahIntParam(p[0])
  const pembanding = adalahKelas(p[0], 'Comparator')
  switch (kelas) {
    case 'ArrayList':
      return kosong ? ArrayListModel.baru(h) : angka ? ArrayListModel.baru(h, arg[0] as number) : ArrayListModel.dariKoleksi(h, c.ops, arg[0])
    case 'LinkedList':
      return kosong ? LinkedListModel.baru(h) : LinkedListModel.dariKoleksi(h, c.ops, arg[0])
    case 'ArrayDeque':
      return kosong ? ArrayDequeModel.baru(h) : angka ? ArrayDequeModel.baru(h, arg[0] as number) : ArrayDequeModel.dariKoleksi(h, c.ops, arg[0])
    case 'Stack':
      return StackModel.baru(h)
    case 'Vector':
      return kosong ? VectorModel.baru(h) : angka ? VectorModel.baru(h, arg[0] as number) : VectorModel.dariKoleksi(h, c.ops, arg[0])
    case 'PriorityQueue':
      if (kosong) return PriorityQueueModel.baru(h)
      if (arg.length === 2) return PriorityQueueModel.baru(h, arg[0] as number, arg[1] as number | null)
      if (angka) return PriorityQueueModel.baru(h, arg[0] as number)
      if (pembanding) return PriorityQueueModel.baru(h, undefined, arg[0] as number | null)
      return PriorityQueueModel.dariKoleksi(h, c.ops, arg[0])
    case 'HashMap':
    case 'LinkedHashMap': {
      const m = kelas === 'HashMap' ? HashMapModel : LinkedHashMapModel
      if (kosong) return m.baru(h)
      return angka ? m.baru(h, arg[0] as number, arg[1] as number | undefined) : m.dariMap(h, c.ops, arg[0])
    }
    case 'TreeMap':
      if (kosong) return TreeMapModel.baru(h)
      if (pembanding) return TreeMapModel.baru(h, arg[0])
      return adalahKelas(p[0], 'SortedMap') ? TreeMapModel.dariSortedMap(h, c.ops, arg[0]) : TreeMapModel.dariMap(h, c.ops, arg[0])
    case 'HashSet':
    case 'LinkedHashSet': {
      const m = kelas === 'HashSet' ? HashSetModel : LinkedHashSetModel
      if (kosong) return m.baru(h)
      return angka ? m.baru(h, arg[0] as number, arg[1] as number | undefined) : m.dariKoleksi(h, c.ops, arg[0])
    }
    case 'TreeSet':
      if (kosong) return TreeSetModel.baru(h)
      if (pembanding) return TreeSetModel.baru(h, arg[0])
      return adalahKelas(p[0], 'SortedSet') ? TreeSetModel.dariSortedSet(h, c.ops, arg[0]) : TreeSetModel.dariKoleksi(h, c.ops, arg[0])
    case 'StringBuilder':
      if (kosong || angka) return c.buatPembangun('')
      // new StringBuilder(String): null → NPE dari str.length().
      if (arg[0] === null) throw npe(adalahKelas(p[0], 'String') ? 'Cannot invoke "String.length()" because "str" is null' : null)
      return c.buatPembangun(c.keString(arg[0], p[0]))
    case 'Random': {
      const seed = kosong ? c.seedBawaan() : BigInt(arg[0] as bigint)
      return h.baruObjek('java.util.Random', { seed: AcakJava.dariSeed(seed).status }, { seed: 'long' })
    }
  }
  return undefined
}

// ---------- Instance: koleksi, entri, iterator, view ----------

/** Method instance pada objek koleksi/map/entri/iterator/view. */
export function panggilKoleksi(c: KonteksFase2, id: number, nama: string, p: Tipe[], arg: Nilai[]): HasilPustaka {
  const h = c.h
  const kelas = h.kelasDari(id)
  if (adalahEntri(h, id)) {
    switch (nama) {
      case 'getKey':
        return EntriModel.getKey(h, id)
      case 'getValue':
        return EntriModel.getValue(h, id)
      case 'setValue':
        return EntriModel.setValue(h, c.ops, id, arg[0])
      case 'toString':
        return c.buatString(EntriModel.toString(h, c.ops, id))
      case 'equals':
        return EntriModel.equals(h, c.ops, id, arg[0])
      case 'hashCode':
        return EntriModel.hashCode(h, c.ops, id)
    }
    return TIDAK_ADA
  }
  const model = MODEL[kelas]
  if (model) {
    if (nama === 'comparator' && typeof model.comparator === 'function') return (model.comparator as (h: HeapKoleksi, id: number) => Nilai)(h, id)
    const op = namaOperasi(model, nama, p)
    if (op) return panggilModel(c, model, op, id, arg)
    if (nama === 'containsAll' || nama === 'removeAll' || nama === 'retainAll') return operasiMassal(c, model, id, nama, arg[0])
    return TIDAK_ADA
  }
  const reg = cariModel(kelas)
  if (reg && reg.kelasIterator.includes(kelas) && reg.kelas !== kelas) {
    // Objek iterator (mis. java.util.ArrayList$Itr).
    if (nama === 'hasNext') return reg.hasNext(h, c.ops, id)
    if (nama === 'next') return reg.next(h, c.ops, id)
    if (nama === 'remove') {
      reg.remove(h, c.ops, id)
      return null
    }
    return TIDAK_ADA
  }
  if (reg) {
    // View keySet()/values()/entrySet().
    const tampilan = (kelas.startsWith('java.util.TreeMap') ? TampilanTreeMapModel : TampilanHashMapModel) as Model
    const op = namaOperasi(tampilan, nama, p)
    if (op) return panggilModel(c, tampilan, op, id, arg)
    if (nama === 'iterator') return reg.iterator(h, c.ops, id)
    if (nama === 'size') return reg.size(h, c.ops, id)
    if (nama === 'isEmpty') return reg.size(h, c.ops, id) === 0
    if (nama === 'contains') return reg.contains(h, c.ops, id, arg[0])
    if (nama === 'toString') return c.buatString(reg.teks(h, c.ops, id))
    if (nama === 'equals' && reg.equals) return reg.equals(h, c.ops, id, arg[0])
    if (nama === 'hashCode' && reg.hashCode) return reg.hashCode(h, c.ops, id)
    return TIDAK_ADA
  }
  const mm = cariModelMap(kelas)
  if (mm) {
    if (nama === 'size') return mm.size(h, c.ops, id)
    if (nama === 'get') return mm.get(h, c.ops, id, arg[0])
    if (nama === 'containsKey') return mm.containsKey(h, c.ops, id, arg[0])
    if (nama === 'put') return mm.put(h, c.ops, id, arg[0], arg[1])
    if (nama === 'toString') return c.buatString(mm.teks(h, c.ops, id))
  }
  return TIDAK_ADA
}

/** Koleksi yang removeAll/retainAll-nya memakai bulkRemove internal sendiri (belum dimodelkan). */
const TANPA_HAPUS_MASSAL = new Set(['java.util.ArrayDeque', 'java.util.PriorityQueue', 'java.util.Vector', 'java.util.Stack'])

/**
 * containsAll/removeAll/retainAll seperti AbstractCollection dan AbstractSet JDK 21: `contains` milik koleksi
 * argumen dipanggil untuk setiap elemen dalam urutan iterasi, lalu elemen dihapus lewat iterator. ArrayList memakai
 * batchRemove, tetapi urutan pemanggilan `contains`, isi akhir, dan kenaikan modCount-nya sama.
 */
function operasiMassal(c: KonteksFase2, model: Model, id: number, nama: string, lain: Nilai): HasilPustaka {
  const h = c.h
  if (nama === 'containsAll') {
    if (lain === null) throw npe('Cannot invoke "java.util.Collection.iterator()" because "c" is null')
    return containsAll(h, c.ops, id, lain as number)
  }
  const m = modelDari(h, id)
  if (m.kelas === 'java.util.ImmutableCollections$ListN') throw new LemparanJava('java.lang.UnsupportedOperationException', null)
  if (TANPA_HAPUS_MASSAL.has(m.kelas)) return TIDAK_ADA
  if (lain === null) throw npe()
  const ml = modelDari(h, lain as number)
  let berubah = false
  if (nama === 'removeAll' && m.set && m.size(h, c.ops, id) > ml.size(h, c.ops, lain as number)) {
    // AbstractSet.removeAll: bila set ini lebih besar, hapus setiap elemen argumen satu per satu.
    const hapus = namaOperasi(model, 'remove', [{ k: 'kelas', nama: 'Object' }])!
    const it = iterasi(h, c.ops, lain as number)
    while (it.hasNext()) berubah = (panggilModel(c, model, hapus, id, [it.next()]) as boolean) || berubah
    return berubah
  }
  const hapusBila = nama === 'removeAll'
  const it = m.iterator(h, c.ops, id)
  while (m.hasNext(h, c.ops, it)) {
    if (ml.contains(h, c.ops, lain as number, m.next(h, c.ops, it)) === hapusBila) {
      m.remove(h, c.ops, it)
      berubah = true
    }
  }
  return berubah
}

/** Apakah objek heap ini ditangani `panggilKoleksi` (koleksi, map, entri, iterator, view). */
export function adalahObjekPustakaKoleksi(c: KonteksFase2, id: number): boolean {
  const kelas = c.h.kelasDari(id)
  return MODEL[kelas] !== undefined || adalahEntri(c.h, id) || cariModel(kelas) !== undefined || cariModelMap(kelas) !== undefined
}

// ---------- Instance: wrapper ----------

const PRIMITIF_WRAPPER: Record<string, NamaPrimitif> = {
  Integer: 'int', Long: 'long', Double: 'double', Float: 'float', Short: 'short', Byte: 'byte', Character: 'char', Boolean: 'boolean',
}

const PRIMITIF_ARRAY: Record<string, true> = { int: true, long: true, double: true, float: true, short: true, byte: true, char: true, boolean: true }

/** Nama parameter compareTo di JDK (untuk pesan NPE `because "anotherInteger" is null`). */
const PARAM_COMPARETO: Record<string, string> = {
  Integer: 'anotherInteger', Long: 'anotherLong', Double: 'anotherDouble', Float: 'anotherFloat', Short: 'anotherShort',
  Byte: 'anotherByte', Character: 'anotherCharacter', Boolean: 'b',
}

/** Perbandingan nilai wrapper sesuai `X.compare` JDK. */
export function bandingWrapper(kelas: string, a: Nilai, b: Nilai): number {
  if (kelas === 'Boolean') return a === b ? 0 : a ? 1 : -1
  if (kelas === 'Double' || kelas === 'Float') {
    const x = a as number
    const y = b as number
    if (x < y) return -1
    if (x > y) return 1
    const bx = bitDouble(x)
    const by = bitDouble(y)
    return bx === by ? 0 : bx < by ? -1 : 1
  }
  if (kelas === 'Long') return (a as bigint) < (b as bigint) ? -1 : (a as bigint) > (b as bigint) ? 1 : 0
  if (kelas === 'Character' || kelas === 'Short' || kelas === 'Byte') return (a as number) - (b as number)
  return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0
}

/** `x.equals(y)` untuk wrapper: kelas sama dan nilai sama (Double/Float: bit sama, sehingga NaN = NaN dan 0.0 ≠ -0.0). */
export function samaWrapper(heap: Record<number, ObjekHeap>, a: number, b: Nilai): boolean {
  const oa = heap[a]
  const ob = b === null ? undefined : heap[b as number]
  if (oa?.k !== 'boks' || ob?.k !== 'boks' || oa.kelas !== ob.kelas) return false
  if (oa.kelas === 'Double' || oa.kelas === 'Float') return bitDouble(oa.nilai as number) === bitDouble(ob.nilai as number)
  return oa.nilai === ob.nilai
}

/** `x.hashCode()` untuk wrapper. */
export function hashWrapper(kelas: string, v: Nilai): number {
  switch (kelas) {
    case 'Long':
      return hashLong(v as bigint)
    case 'Double':
      return hashDouble(v as number)
    case 'Float':
      return hashFloat(v as number)
    case 'Boolean':
      return hashBoolean(v as boolean)
    default:
      return v as number
  }
}

export function panggilBoks(c: KonteksFase2, id: number, nama: string, arg: Nilai[]): HasilPustaka {
  const o = c.heap[id]
  if (o?.k !== 'boks') return TIDAK_ADA
  const prim = PRIMITIF_WRAPPER[o.kelas] ?? 'int'
  const ke = /^(int|long|double|float|short|byte|char|boolean)Value$/.exec(nama)
  if (ke) return konversiPrimitif(o.nilai, prim, ke[1] as NamaPrimitif)
  switch (nama) {
    case 'compareTo': {
      const lain = arg[0]
      if (lain === null) throw npe(`Cannot read field "value" because "${PARAM_COMPARETO[o.kelas] ?? 'o'}" is null`)
      const ob = c.heap[lain as number]
      return bandingWrapper(o.kelas, o.nilai, ob?.k === 'boks' ? ob.nilai : null)
    }
    case 'equals':
      return samaWrapper(c.heap, id, arg[0])
    case 'hashCode':
      return hashWrapper(o.kelas, o.nilai)
    case 'toString':
      return c.buatString(primitifKeString(o.nilai, prim))
    case 'isNaN':
      return Number.isNaN(o.nilai as number)
    case 'isInfinite':
      return o.nilai === Infinity || o.nilai === -Infinity
  }
  return TIDAK_ADA
}

// ---------- Instance: StringBuilder ----------

function teksArgumen(c: KonteksFase2, v: Nilai, t: Tipe): string {
  if (t.k === 'array' && t.elemen.k === 'primitif' && t.elemen.nama === 'char') {
    if (v === null) throw npe()
    const o = c.heap[v as number]
    return o?.k === 'array' ? o.nilai.map((x) => String.fromCharCode(x as number)).join('') : ''
  }
  return c.keString(v, t)
}

export function panggilPembangun(c: KonteksFase2, id: number, nama: string, p: Tipe[], arg: Nilai[]): HasilPustaka {
  const o = c.heap[id]
  if (o?.k !== 'pembangun') return TIDAK_ADA
  const s = o.nilai
  const ubah = (baru: string): Nilai => {
    if (baru !== s) c.ubahPembangun(id, baru, nama)
    return id
  }
  switch (nama) {
    case 'append':
      return ubah(s + teksArgumen(c, arg[0], p[0]))
    case 'insert':
      return ubah(sisip(s, arg[0] as number, teksArgumen(c, arg[1], p[1])))
    case 'delete':
      return ubah(hapus(s, arg[0] as number, arg[1] as number))
    case 'deleteCharAt':
      return ubah(hapusKarakter(s, arg[0] as number))
    case 'replace':
      if (arg[2] === null) throw npe()
      return ubah(ganti(s, arg[0] as number, arg[1] as number, c.teks(arg[2])))
    case 'reverse':
      return ubah(balik(s))
    case 'setCharAt':
      ubah(aturKarakter(s, arg[0] as number, arg[1] as number))
      return null
    case 'setLength':
      ubah(aturPanjang(s, arg[0] as number))
      return null
    case 'charAt':
      return karakterDi(s, arg[0] as number)
    case 'length':
      return s.length
    case 'isEmpty':
      return s.length === 0
    case 'indexOf':
      return indeksDari(s, c.teks(arg[0]), arg.length > 1 ? (arg[1] as number) : 0)
    case 'lastIndexOf':
      return indeksTerakhir(s, c.teks(arg[0]), arg.length > 1 ? (arg[1] as number) : s.length)
    case 'substring':
      return c.buatString(potong(s, arg[0] as number, arg.length > 1 ? (arg[1] as number) : s.length))
    case 'toString':
      return c.buatString(s)
    case 'compareTo': {
      if (arg[0] === null) throw npe()
      const lain = c.heap[arg[0] as number]
      return bandingkanTeks(s, lain?.k === 'pembangun' ? lain.nilai : '')
    }
  }
  return TIDAK_ADA
}

// ---------- Instance: Random ----------

export function panggilRandom(c: KonteksFase2, id: number, nama: string, arg: Nilai[]): HasilPustaka {
  const acak = new AcakJava(c.h.bacaField(id, 'seed') as bigint)
  let hasil: Nilai
  switch (nama) {
    case 'nextInt':
      if (arg.length === 0) hasil = acak.nextInt()
      else {
        if ((arg[0] as number) <= 0) throw new LemparanJava('java.lang.IllegalArgumentException', 'bound must be positive')
        hasil = acak.nextInt(arg[0] as number)
      }
      break
    case 'nextDouble':
      hasil = acak.nextDouble()
      break
    case 'nextBoolean':
      hasil = acak.nextBoolean()
      break
    case 'nextLong':
      hasil = acak.nextLong()
      break
    default:
      return TIDAK_ADA
  }
  c.h.tulisField(id, 'seed', acak.status)
  return hasil
}

// ---------- Static ----------

function isiArray(c: KonteksFase2, ref: Nilai): Nilai[] {
  if (ref === null) throw npe()
  const o = c.heap[ref as number]
  return o?.k === 'array' ? o.nilai : []
}

/** Method static Fase 2. `kelas.nama` dari id pustaka. */
export function panggilStatikFase2(c: KonteksFase2, kelas: string, nama: string, p: Tipe[], arg: Nilai[]): HasilPustaka {
  const h = c.h
  const kunci = `${kelas}.${nama}`
  const w = PRIMITIF_WRAPPER[kelas]
  if (w && nama === 'valueOf') {
    if (p[0]?.k === 'primitif') return c.boks(kelas, konversiPrimitif(arg[0], p[0].nama, w))
    // valueOf(String): parse lalu boxing (pesan NumberFormatException milik parseX).
    const pengurai: Record<string, string> = {
      Integer: 'Integer.parseInt(String)',
      Long: 'Long.parseLong(String)',
      Double: 'Double.parseDouble(String)',
      Float: 'Float.parseFloat(String)',
      Short: 'Short.parseShort(String)',
      Byte: 'Byte.parseByte(String)',
      Boolean: 'Boolean.parseBoolean(String)',
    }
    const id = pengurai[kelas]
    if (!id) return TIDAK_ADA
    return c.boks(kelas, c.panggilFase1(id, arg, p))
  }
  switch (kunci) {
    case 'Collections.sort':
      CollectionsModel.sort(h, c.ops, arg[0], (arg[1] ?? null) as number | null)
      return null
    case 'Collections.reverse':
      CollectionsModel.reverse(h, c.ops, arg[0])
      return null
    case 'Collections.swap':
      CollectionsModel.swap(h, c.ops, arg[0], arg[1] as number, arg[2] as number)
      return null
    case 'Collections.max':
      return CollectionsModel.max(h, c.ops, arg[0], (arg[1] ?? null) as number | null)
    case 'Collections.min':
      return CollectionsModel.min(h, c.ops, arg[0], (arg[1] ?? null) as number | null)
    case 'Collections.frequency':
      return CollectionsModel.frequency(h, c.ops, arg[0], arg[1])
    case 'Collections.addAll':
      return CollectionsModel.addAll(h, c.ops, arg[0], arg[1])
    case 'Arrays.asList':
      return ArraysAsListModel.asList(h, arg[0])
    case 'List.of':
      // List.of(E...) menerima array varargs; List.of(a, b) berbentuk tetap juga dikemas checker sebagai array.
      return ListOfModel.of(h, p.length === 1 && p[0].k === 'array' ? isiArray(c, arg[0]) : arg)
    case 'Arrays.sort': {
      // Hanya bentuk objek: sort(T[], Comparator) dan sort(Object[]) untuk elemen selain primitif/String
      // (keduanya ditangani implementasi Fase 1).
      const a = arg[0]
      if (a === null) throw npe()
      const arr = c.heap[a as number]
      const n = h.panjangArray(a as number)
      if (p.length === 2 && adalahKelas(p[1], 'Comparator')) {
        urutkan(h, c.ops, a as number, 0, n, arg[1] as number | null)
        return null
      }
      // Rentang [dari, sampai) dengan Comparator: TimSort JDK beserta pemeriksaan rentangnya.
      if (p.length === 4 && adalahKelas(p[3], 'Comparator')) {
        urutkan(h, c.ops, a as number, arg[1] as number, arg[2] as number, arg[3] as number | null)
        return null
      }
      const primitifAtauString = arr?.k === 'array' && (arr.tipeElemen === 'String' || arr.tipeElemen in PRIMITIF_ARRAY)
      if (p.length === 1 && !primitifAtauString) {
        urutkan(h, c.ops, a as number, 0, n, null)
        return null
      }
      if (p.length === 3 && !primitifAtauString) {
        urutkan(h, c.ops, a as number, arg[1] as number, arg[2] as number, null)
        return null
      }
      return TIDAK_ADA
    }
    case 'Objects.equals':
      return arg[0] === arg[1] || (arg[0] !== null && c.ops.equals(arg[0] as number, arg[1]))
    case 'Objects.hashCode':
      return arg[0] === null ? 0 : c.ops.hashCode(arg[0] as number)
    case 'Objects.hash': {
      let hsl = 1
      for (const x of isiArray(c, arg[0])) hsl = (Math.imul(31, hsl) + (x === null ? 0 : c.ops.hashCode(x as number))) | 0
      return hsl
    }
    case 'Objects.requireNonNull':
      if (arg[0] === null) throw npe(arg.length > 1 && arg[1] !== null ? c.teks(arg[1]) : null)
      return arg[0]
    case 'Objects.toString':
      return c.buatString(c.keString(arg[0], { k: 'kelas', nama: 'Object' }))
  }
  return TIDAK_ADA
}
