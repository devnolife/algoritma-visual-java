import { LemparanJava, type Nilai } from '../../nilai'

/**
 * Fondasi model koleksi java.util (Fase 2).
 *
 * Setiap koleksi adalah objek heap yang field-nya persis field privat JDK 21, mis.
 * `java.util.ArrayList{elementData, size, modCount}`. Model berupa fungsi murni
 * `(h, ops, id, ...arg)`: seluruh state dibaca/ditulis lewat `HeapKoleksi`, tidak ada
 * state tersembunyi di variabel JS di antara dua panggilan. Setiap tulisan menjadi
 * peristiwa trace yang diputar ulang UI langkah demi langkah.
 *
 * Nilai referensi = id objek heap (number) atau null; int = number; boolean = boolean.
 */
export interface HeapKoleksi {
  /** Objek baru. `kelas` = nama biner JDK, mis. 'java.util.ArrayList', 'java.util.LinkedList$Node'. */
  baruObjek(kelas: string, field: Record<string, Nilai>, tipeField: Record<string, string>): number
  bacaField(id: number, nama: string): Nilai
  tulisField(id: number, nama: string, nilai: Nilai): void
  /** Array referensi baru berisi null, mis. tipeElemen 'Object' atau 'java.util.HashMap$Node'. */
  baruArray(tipeElemen: string, panjang: number): number
  panjangArray(id: number): number
  bacaElemen(id: number, i: number): Nilai
  tulisElemen(id: number, i: number, nilai: Nilai): void
  /** Semantik System.arraycopy (sumber/tujuan yang tumpang-tindih harus berperilaku seperti Java). */
  salinArray(sumber: number, posSumber: number, tujuan: number, posTujuan: number, panjang: number): void
  kelasDari(id: number): string
  /**
   * Field static milik kelas JDK, mis. `ArrayList.EMPTY_ELEMENTDATA`. Saat pertama diminta, `buat()`
   * dijalankan (biasanya mengalokasikan objek lewat heap ini) dan hasilnya disimpan; permintaan
   * berikutnya mengembalikan referensi yang sama. Identitasnya teramati (mis. aturan tumbuh ArrayList).
   */
  statik(kelas: string, nama: string, buat: () => Nilai): Nilai
}

/** Callback dengan semantik Java persis; diimplementasikan interpreter (boleh menjalankan kode mahasiswa). */
export interface OperasiElemen {
  /** x.hashCode(), x tidak null. */
  hashCode(x: number): number
  /** a.equals(b), a tidak null. */
  equals(a: number, b: Nilai): boolean
  /** ((Comparable) a).compareTo(b); lempar ClassCastException bila a bukan Comparable. */
  compareTo(a: number, b: Nilai): number
  /** comparator.compare(a, b). */
  compare(pembanding: number, a: Nilai, b: Nilai): number
  /** String.valueOf(x) ("null" untuk null). */
  teks(x: Nilai): string
  /**
   * Cast `(Comparable) x` saja, tanpa membandingkan: lempar ClassCastException bila x bukan Comparable.
   * Dibutuhkan PriorityQueue: elemen pertama tidak pernah dibandingkan, tetapi tetap di-cast di siftUp.
   */
  pastikanComparable(x: number): void
}

/** Untuk operasi jarang dipakai yang sengaja belum diimplementasikan. */
export class BelumDidukung extends Error {
  constructor(pesan: string) {
    super(pesan)
    this.name = 'BelumDidukung'
  }
}

// ---------- Exception Java ----------
export const galat = (kelas: string, pesan: string | null = null) => new LemparanJava(kelas, pesan)
export const npe = (pesan: string | null = null) => galat('java.lang.NullPointerException', pesan)
export const iobe = (pesan: string | null = null) => galat('java.lang.IndexOutOfBoundsException', pesan)
export const aioobe = (pesan: string | null = null) =>
  galat('java.lang.ArrayIndexOutOfBoundsException', pesan)
export const iae = (pesan: string | null = null) => galat('java.lang.IllegalArgumentException', pesan)
export const ise = () => galat('java.lang.IllegalStateException')
export const uoe = (pesan: string | null = null) => galat('java.lang.UnsupportedOperationException', pesan)
export const nsee = () => galat('java.util.NoSuchElementException')
export const cme = () => galat('java.util.ConcurrentModificationException')

/** Pesan Objects.checkIndex dan akses array JVM: `Index 5 out of bounds for length 3`. */
export const pesanIndeks = (i: number, n: number) => `Index ${i} out of bounds for length ${n}`

/** Objects.checkIndex(i, n). */
export function cekIndeks(i: number, n: number): void {
  if (i < 0 || i >= n) throw iobe(pesanIndeks(i, n))
}

/** Pesan helpful NPE untuk pemanggilan method pada variabel null di kode JDK (JDK dikompilasi dengan nama lokal). */
export const pesanNpePanggil = (metode: string, variabel: string) =>
  `Cannot invoke "${metode}" because "${variabel}" is null`

// ---------- Akses field ----------
export const bacaInt = (h: HeapKoleksi, id: number, nama: string) => h.bacaField(id, nama) as number
export const bacaRef = (h: HeapKoleksi, id: number, nama: string) => h.bacaField(id, nama) as number | null

/** `field++` pada field int (modCount dkk.), dengan luapan int Java. */
export function naikkan(h: HeapKoleksi, id: number, nama = 'modCount'): void {
  h.tulisField(id, nama, ((h.bacaField(id, nama) as number) + 1) | 0)
}

// ---------- Array ----------
/** `a[i]` dengan pemeriksaan batas JVM (ArrayIndexOutOfBoundsException). */
export function bacaArray(h: HeapKoleksi, a: number, i: number): Nilai {
  const n = h.panjangArray(a)
  if (i < 0 || i >= n) throw aioobe(pesanIndeks(i, n))
  return h.bacaElemen(a, i)
}

/** `a[i] = v` dengan pemeriksaan batas JVM. */
export function tulisArray(h: HeapKoleksi, a: number, i: number, v: Nilai): void {
  const n = h.panjangArray(a)
  if (i < 0 || i >= n) throw aioobe(pesanIndeks(i, n))
  h.tulisElemen(a, i, v)
}

/** System.arraycopy untuk array referensi, lengkap dengan pesan galat HotSpot. Panjang 0 tidak menulis apa pun. */
export function salin(
  h: HeapKoleksi,
  src: number,
  posSrc: number,
  dst: number,
  posDst: number,
  n: number,
): void {
  const ps = h.panjangArray(src)
  const pd = h.panjangArray(dst)
  if (posSrc < 0) throw aioobe(`arraycopy: source index ${posSrc} out of bounds for object array[${ps}]`)
  if (posDst < 0) throw aioobe(`arraycopy: destination index ${posDst} out of bounds for object array[${pd}]`)
  if (n < 0) throw aioobe(`arraycopy: length ${n} is negative`)
  if (n + posSrc > ps)
    throw aioobe(`arraycopy: last source index ${n + posSrc} out of bounds for object array[${ps}]`)
  if (n + posDst > pd) {
    throw aioobe(`arraycopy: last destination index ${n + posDst} out of bounds for object array[${pd}]`)
  }
  if (n > 0) h.salinArray(src, posSrc, dst, posDst, n)
}

/** Arrays.copyOf(a, panjangBaru): array baru, isi lama disalin sebanyak yang muat. */
export function salinBaru(h: HeapKoleksi, a: number, panjangBaru: number, tipeElemen = 'Object'): number {
  const baru = h.baruArray(tipeElemen, panjangBaru)
  salin(h, a, 0, baru, 0, Math.min(h.panjangArray(a), panjangBaru))
  return baru
}

/** Array heap baru berisi `isi` (mis. hasil toArray()). */
export function arrayDari(h: HeapKoleksi, isi: readonly Nilai[], tipeElemen = 'Object'): number {
  const a = h.baruArray(tipeElemen, isi.length)
  for (let i = 0; i < isi.length; i++) h.tulisElemen(a, i, isi[i])
  return a
}

/** Isi `a[dari..sampai)` sebagai array JS (salinan sementara dalam satu panggilan). */
export function isiArray(h: HeapKoleksi, a: number, dari: number, sampai: number): Nilai[] {
  const hasil: Nilai[] = []
  for (let i = dari; i < sampai; i++) hasil.push(h.bacaElemen(a, i))
  return hasil
}

const INT_MAX = 2147483647
const SOFT_MAX_ARRAY_LENGTH = INT_MAX - 8

/** jdk.internal.util.ArraysSupport.newLength: aturan tumbuh bersama ArrayList/Vector/PriorityQueue. */
export function panjangBaru(panjangLama: number, minTumbuh: number, prefTumbuh: number): number {
  const pref = panjangLama + Math.max(minTumbuh, prefTumbuh)
  if (pref > 0 && pref <= SOFT_MAX_ARRAY_LENGTH) return pref
  const min = panjangLama + minTumbuh
  if (min > INT_MAX) {
    throw galat(
      'java.lang.OutOfMemoryError',
      `Required array length ${panjangLama} + ${minTumbuh} is too large`,
    )
  }
  return min <= SOFT_MAX_ARRAY_LENGTH ? SOFT_MAX_ARRAY_LENGTH : min
}

// ---------- Kesamaan & hash elemen ----------
/** Objects.equals(a, b) = `a == b || (a != null && a.equals(b))`. */
export const samaObjek = (ops: OperasiElemen, a: Nilai, b: Nilai) =>
  a === b || (a !== null && ops.equals(a as number, b))

/** `o1 == null ? o2 == null : o1.equals(o2)` (AbstractList.equals): tanpa jalan pintas identitas. */
export const samaNullAman = (ops: OperasiElemen, a: Nilai, b: Nilai) =>
  a === null ? b === null : ops.equals(a as number, b)

/** `e == null ? 0 : e.hashCode()`. */
export const hashElemen = (ops: OperasiElemen, e: Nilai) => (e === null ? 0 : ops.hashCode(e as number))

/** `31 * h + x` dalam aritmetika int Java. */
export const hash31 = (h: number, x: number) => (Math.imul(31, h) + x) | 0

// ---------- Field iterator ----------
/**
 * Tempat field sebuah iterator: objek heap sungguhan (iterator milik program) atau objek JS sementara
 * (iterasi internal satu panggilan, mis. toString/equals). Logika iterator ditulis sekali di atas `Wadah`,
 * sehingga keduanya berperilaku identik tanpa meninggalkan objek sampah di heap.
 */
export interface Wadah {
  baca(nama: string): Nilai
  tulis(nama: string, nilai: Nilai): void
}

export const wadahHeap = (h: HeapKoleksi, id: number): Wadah => ({
  baca: (nama) => h.bacaField(id, nama),
  tulis: (nama, nilai) => h.tulisField(id, nama, nilai),
})

export function wadahLokal(awal: Record<string, Nilai>): Wadah {
  const field = { ...awal }
  return {
    baca: (nama) => field[nama],
    tulis: (nama, nilai) => {
      field[nama] = nilai
    },
  }
}

/** Iterator internal (field di wadah lokal), dipakai operasi pustaka yang di JDK membuat iterator sementara. */
export interface IteratorLokal {
  hasNext(): boolean
  next(): Nilai
  remove(): void
}

/** Logika satu kelas iterator, ditulis di atas `Wadah`. */
export interface LogikaIterator {
  hasNext(h: HeapKoleksi, ops: OperasiElemen, w: Wadah): boolean
  next(h: HeapKoleksi, ops: OperasiElemen, w: Wadah): Nilai
  remove(h: HeapKoleksi, ops: OperasiElemen, w: Wadah): void
}

/** Iterator lokal dari logika + field awal. */
export function iteratorLokal(
  h: HeapKoleksi,
  ops: OperasiElemen,
  logika: LogikaIterator,
  field: Record<string, Nilai>,
): IteratorLokal {
  const w = wadahLokal(field)
  return {
    hasNext: () => logika.hasNext(h, ops, w),
    next: () => logika.next(h, ops, w),
    remove: () => logika.remove(h, ops, w),
  }
}

/** AbstractCollection.toString: `[a, b]`, elemen yang menunjuk koleksi itu sendiri ditulis `(this Collection)`. */
export function teksKoleksi(ops: OperasiElemen, id: number, it: IteratorLokal): string {
  if (!it.hasNext()) return '[]'
  let s = '['
  for (;;) {
    const e = it.next()
    s += e === id ? '(this Collection)' : ops.teks(e)
    if (!it.hasNext()) return s + ']'
    s += ', '
  }
}
