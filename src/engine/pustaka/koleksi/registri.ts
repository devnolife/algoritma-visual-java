import { LemparanJava, type Nilai } from '../../nilai'
import { EntriModel } from './entri'
import {
  BelumDidukung,
  hash31,
  hashElemen,
  samaNullAman,
  wadahHeap,
  type HeapKoleksi,
  type IteratorLokal,
  type LogikaIterator,
  type OperasiElemen,
} from './heap'

/** ListIterator internal (untuk Collections.reverse pada daftar non-RandomAccess). */
export interface IteratorDaftarLokal extends IteratorLokal {
  previous(): Nilai
  set(e: Nilai): void
}

/** Operasi khusus `java.util.List` yang dipakai utilitas Collections. */
export interface OperasiDaftar {
  /** implements RandomAccess */
  readonly aksesAcak: boolean
  get(h: HeapKoleksi, ops: OperasiElemen, id: number, indeks: number): Nilai
  set(h: HeapKoleksi, ops: OperasiElemen, id: number, indeks: number, e: Nilai): Nilai
  /** List.sort(c); `null` = urutan alami. */
  sort(h: HeapKoleksi, ops: OperasiElemen, id: number, pembanding: number | null): void
  /** listIterator(indeks); wajib ada bila `aksesAcak` false. */
  listIterator?(h: HeapKoleksi, ops: OperasiElemen, id: number, indeks: number): IteratorDaftarLokal
}

/**
 * Antarmuka bersama semua model koleksi, dikunci nama kelas JDK. Interpreter memakai ini untuk
 * for-each, `new ArrayList<>(koleksiApaPun)`, `addAll`, `toString`, `equals`, dan `hashCode`.
 */
export interface ModelKoleksi {
  /** Nama biner kelas JDK, mis. 'java.util.ArrayList'. */
  readonly kelas: string
  /** Kelas objek iterator yang dibuat `iterator()`, mis. 'java.util.ArrayList$Itr'. */
  readonly kelasIterator: readonly string[]
  /** `instanceof List` (menentukan hasil equals milik List lain). */
  readonly list: boolean
  /** `instanceof Set` (menentukan hasil AbstractSet.equals milik Set lain). */
  readonly set?: boolean
  /** `instanceof SortedSet` (TreeSet); dipakai konstruktor PriorityQueue(Collection) dan TreeSet.addAll. */
  readonly sortedSet?: boolean
  size(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  /** Collection.contains(o) (dipakai AbstractCollection.containsAll/AbstractSet.equals). */
  contains(h: HeapKoleksi, ops: OperasiElemen, id: number, o: Nilai): boolean
  /** toArray(): salinan isi dalam urutan iterasi. */
  keArray(h: HeapKoleksi, ops: OperasiElemen, id: number): Nilai[]
  /** Collection.add(e). */
  add(h: HeapKoleksi, ops: OperasiElemen, id: number, e: Nilai): boolean
  /** Collection.remove(Object) (bila tersedia; dipakai untuk penerima bertipe antarmuka, mis. view map). */
  removeObjek?(h: HeapKoleksi, ops: OperasiElemen, id: number, o: Nilai): boolean
  /** Collection.clear() (bila tersedia). */
  clear?(h: HeapKoleksi, ops: OperasiElemen, id: number): void
  /** iterator(): objek iterator baru di heap. */
  iterator(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  hasNext(h: HeapKoleksi, ops: OperasiElemen, it: number): boolean
  next(h: HeapKoleksi, ops: OperasiElemen, it: number): Nilai
  /** Iterator.remove(). */
  remove(h: HeapKoleksi, ops: OperasiElemen, it: number): void
  /**
   * Iterator internal dengan perilaku identik `iterator()` tanpa objek iterator di heap (untuk toString/equals/
   * dll.). Efek samping persisten milik iterator() JDK tetap terjadi, mis. HashSet/TreeSet membuat view
   * keySet/navigableKeySet di map penopangnya.
   */
  iterasi(h: HeapKoleksi, ops: OperasiElemen, id: number): IteratorLokal
  /** toString(). */
  teks(h: HeapKoleksi, ops: OperasiElemen, id: number): string
  /** Tidak ada = Object.equals (identitas), mis. ArrayDeque dan PriorityQueue. */
  equals?(h: HeapKoleksi, ops: OperasiElemen, id: number, lain: Nilai): boolean
  /** Tidak ada = Object.hashCode (identitas, disediakan interpreter). */
  hashCode?(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  /** Ada bila koleksi ini List. */
  daftar?: OperasiDaftar
  /** comparator() untuk PriorityQueue/SortedSet. */
  comparator?(h: HeapKoleksi, id: number): Nilai
}

const peta = new Map<string, ModelKoleksi>()

/** Daftarkan model (dipanggil tiap berkas model saat dimuat; HashSet/TreeSet kelak memakai jalur yang sama). */
export function daftarkanKoleksi(model: ModelKoleksi): void {
  peta.set(model.kelas, model)
  for (const k of model.kelasIterator) peta.set(k, model)
}

/** Model untuk nama kelas koleksi atau nama kelas iteratornya. */
export function cariModel(kelas: string): ModelKoleksi | undefined {
  return peta.get(kelas)
}

/** Model pemilik objek `id` (koleksi atau iteratornya). */
export function modelDari(h: HeapKoleksi, id: number): ModelKoleksi {
  const kelas = h.kelasDari(id)
  const m = peta.get(kelas)
  if (!m) throw new BelumDidukung(`Koleksi ${kelas} belum didukung`)
  return m
}

/** `x instanceof Collection` untuk kelas yang terdaftar. */
export function adalahKoleksi(h: HeapKoleksi, x: Nilai): boolean {
  if (typeof x !== 'number') return false
  const kelas = h.kelasDari(x)
  return peta.get(kelas)?.kelas === kelas
}

/** `x instanceof List`. */
export function adalahList(h: HeapKoleksi, x: Nilai): boolean {
  if (typeof x !== 'number') return false
  const kelas = h.kelasDari(x)
  const m = peta.get(kelas)
  return m !== undefined && m.kelas === kelas && m.list
}

export const keArray = (h: HeapKoleksi, ops: OperasiElemen, id: number) =>
  modelDari(h, id).keArray(h, ops, id)
export const iterasi = (h: HeapKoleksi, ops: OperasiElemen, id: number) =>
  modelDari(h, id).iterasi(h, ops, id)
export const ukuranKoleksi = (h: HeapKoleksi, ops: OperasiElemen, id: number) =>
  modelDari(h, id).size(h, ops, id)

/** hasNext/next/remove milik registri dari logika per kelas iterator. */
export function operasiIterator(logika: Record<string, LogikaIterator>) {
  const cari = (h: HeapKoleksi, it: number): LogikaIterator => {
    const l = logika[h.kelasDari(it)]
    if (!l) throw new BelumDidukung(`Iterator ${h.kelasDari(it)} belum didukung`)
    return l
  }
  return {
    hasNext: (h: HeapKoleksi, ops: OperasiElemen, it: number) =>
      cari(h, it).hasNext(h, ops, wadahHeap(h, it)),
    next: (h: HeapKoleksi, ops: OperasiElemen, it: number) => cari(h, it).next(h, ops, wadahHeap(h, it)),
    remove: (h: HeapKoleksi, ops: OperasiElemen, it: number) => cari(h, it).remove(h, ops, wadahHeap(h, it)),
  }
}

/** AbstractList.equals: dua listIterator berjalan bersama, `o1==null ? o2==null : o1.equals(o2)`. */
export function equalsAbstractList(h: HeapKoleksi, ops: OperasiElemen, id: number, o: Nilai): boolean {
  if (o === id) return true
  if (!adalahList(h, o)) return false
  const e1 = iterasi(h, ops, id)
  const e2 = iterasi(h, ops, o as number)
  while (e1.hasNext() && e2.hasNext()) {
    const o1 = e1.next()
    const o2 = e2.next()
    if (!samaNullAman(ops, o1, o2)) return false
  }
  return !(e1.hasNext() || e2.hasNext())
}

/** AbstractList.hashCode: `31 * h + (e == null ? 0 : e.hashCode())` dalam urutan iterasi. */
export function hashCodeAbstractList(h: HeapKoleksi, ops: OperasiElemen, id: number): number {
  let hash = 1
  const it = iterasi(h, ops, id)
  while (it.hasNext()) hash = hash31(hash, hashElemen(ops, it.next()))
  return hash
}

// =====================================================================================
// Set
// =====================================================================================

/** `x instanceof Set`. */
export function adalahSet(h: HeapKoleksi, x: Nilai): boolean {
  if (typeof x !== 'number') return false
  const kelas = h.kelasDari(x)
  const m = peta.get(kelas)
  return m !== undefined && m.kelas === kelas && m.set === true
}

/** AbstractCollection.containsAll(c): `contains(e)` milik koleksi ini untuk setiap e di c. */
export function containsAll(h: HeapKoleksi, ops: OperasiElemen, id: number, c: number): boolean {
  const m = modelDari(h, id)
  const it = iterasi(h, ops, c)
  while (it.hasNext()) if (!m.contains(h, ops, id, it.next())) return false
  return true
}

const tertangkapEquals = (e: unknown) =>
  e instanceof LemparanJava &&
  (e.kelas === 'java.lang.ClassCastException' || e.kelas === 'java.lang.NullPointerException')

/** AbstractSet.equals: ukuran sama lalu containsAll; ClassCastException/NullPointerException → false. */
export function equalsAbstractSet(h: HeapKoleksi, ops: OperasiElemen, id: number, o: Nilai): boolean {
  if (o === id) return true
  if (!adalahSet(h, o)) return false
  if (modelDari(h, o as number).size(h, ops, o as number) !== modelDari(h, id).size(h, ops, id)) return false
  try {
    return containsAll(h, ops, id, o as number)
  } catch (e) {
    if (tertangkapEquals(e)) return false
    throw e
  }
}

/** AbstractSet.hashCode: jumlah hashCode elemen bukan null. */
export function hashCodeAbstractSet(h: HeapKoleksi, ops: OperasiElemen, id: number): number {
  let hash = 0
  const it = iterasi(h, ops, id)
  while (it.hasNext()) {
    const e = it.next()
    if (e !== null) hash = (hash + ops.hashCode(e as number)) | 0
  }
  return hash
}

// =====================================================================================
// Map
// =====================================================================================

/** Antarmuka bersama model Map (HashMap, LinkedHashMap, TreeMap), dikunci nama kelas JDK. */
export interface ModelMap {
  readonly kelas: string
  /** `instanceof SortedMap` (TreeMap): jalur cepat TreeMap(Map)/putAll. */
  readonly sortedMap?: boolean
  size(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  get(h: HeapKoleksi, ops: OperasiElemen, id: number, key: Nilai): Nilai
  containsKey(h: HeapKoleksi, ops: OperasiElemen, id: number, key: Nilai): boolean
  put(h: HeapKoleksi, ops: OperasiElemen, id: number, key: Nilai, value: Nilai): Nilai
  /**
   * `entrySet().iterator()` internal (dipakai toString/equals/hashCode/putAll/konstruktor salinan): view
   * entrySet dibuat dan di-cache di map seperti JDK, lalu menghasilkan objek Map.Entry (simpul map itu sendiri).
   */
  iterasiEntri(h: HeapKoleksi, ops: OperasiElemen, id: number): IteratorLokal
  /** keySet()/values()/entrySet(): objek view di heap (dibuat sekali lalu di-cache seperti JDK). */
  keySet(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  values(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  entrySet(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  teks(h: HeapKoleksi, ops: OperasiElemen, id: number): string
  equals(h: HeapKoleksi, ops: OperasiElemen, id: number, lain: Nilai): boolean
  hashCode(h: HeapKoleksi, ops: OperasiElemen, id: number): number
  /** comparator() untuk SortedMap. */
  comparator?(h: HeapKoleksi, id: number): Nilai
}

const petaMap = new Map<string, ModelMap>()

export function daftarkanMap(model: ModelMap): void {
  petaMap.set(model.kelas, model)
}

export function cariModelMap(kelas: string): ModelMap | undefined {
  return petaMap.get(kelas)
}

export function modelMapDari(h: HeapKoleksi, id: number): ModelMap {
  const kelas = h.kelasDari(id)
  const m = petaMap.get(kelas)
  if (!m) throw new BelumDidukung(`Map ${kelas} belum didukung`)
  return m
}

/** `x instanceof Map`. */
export function adalahMap(h: HeapKoleksi, x: Nilai): boolean {
  return typeof x === 'number' && petaMap.has(h.kelasDari(x))
}

/** AbstractMap.toString: `{k=v, ...}`, kunci/nilai yang menunjuk map itu sendiri ditulis `(this Map)`. */
export function teksMap(h: HeapKoleksi, ops: OperasiElemen, id: number, it: IteratorLokal): string {
  if (!it.hasNext()) return '{}'
  let s = '{'
  for (;;) {
    const e = it.next() as number
    const key = EntriModel.getKey(h, e)
    const value = EntriModel.getValue(h, e)
    s += key === id ? '(this Map)' : ops.teks(key)
    s += '='
    s += value === id ? '(this Map)' : ops.teks(value)
    if (!it.hasNext()) return s + '}'
    s += ', '
  }
}

/**
 * AbstractMap.equals: ukuran sama, lalu tiap entri dicek dengan `m.get(key)` (dan `m.containsKey` bila
 * nilainya null) milik map lain; ClassCastException/NullPointerException → false.
 */
export function equalsAbstractMap(h: HeapKoleksi, ops: OperasiElemen, id: number, o: Nilai): boolean {
  if (o === id) return true
  if (!adalahMap(h, o)) return false
  const lain = o as number
  const m = modelMapDari(h, lain)
  if (m.size(h, ops, lain) !== modelMapDari(h, id).size(h, ops, id)) return false
  try {
    const it = modelMapDari(h, id).iterasiEntri(h, ops, id)
    while (it.hasNext()) {
      const e = it.next() as number
      const key = EntriModel.getKey(h, e)
      const value = EntriModel.getValue(h, e)
      if (value === null) {
        if (!(m.get(h, ops, lain, key) === null && m.containsKey(h, ops, lain, key))) return false
      } else if (!ops.equals(value as number, m.get(h, ops, lain, key))) {
        return false
      }
    }
  } catch (e) {
    if (tertangkapEquals(e)) return false
    throw e
  }
  return true
}

/** AbstractMap.hashCode: jumlah entry.hashCode(). */
export function hashCodeAbstractMap(h: HeapKoleksi, ops: OperasiElemen, id: number): number {
  let hash = 0
  const it = modelMapDari(h, id).iterasiEntri(h, ops, id)
  while (it.hasNext()) hash = (hash + EntriModel.hashCode(h, ops, it.next() as number)) | 0
  return hash
}
