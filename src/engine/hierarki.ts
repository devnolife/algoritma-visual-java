/**
 * Hierarki tipe pustaka Java untuk subset Fase 2: class/antarmuka koleksi beserta parameter generiknya,
 * dan pohon exception (untuk catch, throws, dan analisis checked exception).
 * Murni data + fungsi kecil; belum bergantung pada checker.
 */

/** Rujukan supertipe dengan argumen tipe berupa nama parameter class turunan, mis. List<E>. */
export interface RujukanSuper {
  nama: string
  argumen: string[]
}

export interface InfoTipePustaka {
  /** Nama sederhana, mis. `ArrayList`, `Map.Entry`. */
  nama: string
  /** Nama lengkap seperti di pesan JVM, mis. `java.util.ArrayList`. */
  lengkap: string
  /** Parameter tipe, mis. ['K', 'V']. */
  parameter: string[]
  /** true untuk antarmuka (tidak bisa di-new). */
  antarmuka: boolean
  super: RujukanSuper[]
}

const t = (nama: string, lengkap: string, parameter: string[], antarmuka: boolean, ...sup: [string, ...string[]][]): InfoTipePustaka => ({
  nama,
  lengkap,
  parameter,
  antarmuka,
  super: sup.map(([n, ...a]) => ({ nama: n, argumen: a })),
})

const DAFTAR: InfoTipePustaka[] = [
  t('Object', 'java.lang.Object', [], false),
  t('Iterable', 'java.lang.Iterable', ['T'], true, ['Object']),
  t('Comparable', 'java.lang.Comparable', ['T'], true, ['Object']),
  t('Comparator', 'java.util.Comparator', ['T'], true, ['Object']),
  t('Iterator', 'java.util.Iterator', ['E'], true, ['Object']),
  t('Collection', 'java.util.Collection', ['E'], true, ['Iterable', 'E']),
  t('List', 'java.util.List', ['E'], true, ['Collection', 'E']),
  t('Set', 'java.util.Set', ['E'], true, ['Collection', 'E']),
  t('Queue', 'java.util.Queue', ['E'], true, ['Collection', 'E']),
  t('Deque', 'java.util.Deque', ['E'], true, ['Queue', 'E']),
  t('Map', 'java.util.Map', ['K', 'V'], true, ['Object']),
  t('Map.Entry', 'java.util.Map$Entry', ['K', 'V'], true, ['Object']),
  t('ArrayList', 'java.util.ArrayList', ['E'], false, ['List', 'E']),
  t('LinkedList', 'java.util.LinkedList', ['E'], false, ['List', 'E'], ['Deque', 'E']),
  t('ArrayDeque', 'java.util.ArrayDeque', ['E'], false, ['Deque', 'E']),
  t('Stack', 'java.util.Stack', ['E'], false, ['List', 'E']),
  t('PriorityQueue', 'java.util.PriorityQueue', ['E'], false, ['Queue', 'E']),
  t('HashSet', 'java.util.HashSet', ['E'], false, ['Set', 'E']),
  t('LinkedHashSet', 'java.util.LinkedHashSet', ['E'], false, ['HashSet', 'E']),
  t('TreeSet', 'java.util.TreeSet', ['E'], false, ['Set', 'E']),
  t('HashMap', 'java.util.HashMap', ['K', 'V'], false, ['Map', 'K', 'V']),
  t('LinkedHashMap', 'java.util.LinkedHashMap', ['K', 'V'], false, ['HashMap', 'K', 'V']),
  t('TreeMap', 'java.util.TreeMap', ['K', 'V'], false, ['Map', 'K', 'V']),
  t('StringBuilder', 'java.lang.StringBuilder', [], false, ['Object'], ['Comparable', 'StringBuilder']),
  t('Random', 'java.util.Random', [], false, ['Object']),
  t('Integer', 'java.lang.Integer', [], false, ['Number'], ['Comparable', 'Integer']),
  t('Long', 'java.lang.Long', [], false, ['Number'], ['Comparable', 'Long']),
  t('Double', 'java.lang.Double', [], false, ['Number'], ['Comparable', 'Double']),
  t('Character', 'java.lang.Character', [], false, ['Object'], ['Comparable', 'Character']),
  t('Boolean', 'java.lang.Boolean', [], false, ['Object'], ['Comparable', 'Boolean']),
  t('Number', 'java.lang.Number', [], false, ['Object']),
  t('String', 'java.lang.String', [], false, ['Object'], ['Comparable', 'String']),
]

/** Pohon exception: nama sederhana → [nama lengkap, induk]. */
const EXCEPTION: Record<string, [string, string | null]> = {
  Throwable: ['java.lang.Throwable', null],
  Exception: ['java.lang.Exception', 'Throwable'],
  Error: ['java.lang.Error', 'Throwable'],
  RuntimeException: ['java.lang.RuntimeException', 'Exception'],
  ArithmeticException: ['java.lang.ArithmeticException', 'RuntimeException'],
  ArrayStoreException: ['java.lang.ArrayStoreException', 'RuntimeException'],
  ClassCastException: ['java.lang.ClassCastException', 'RuntimeException'],
  IllegalArgumentException: ['java.lang.IllegalArgumentException', 'RuntimeException'],
  NumberFormatException: ['java.lang.NumberFormatException', 'IllegalArgumentException'],
  IllegalStateException: ['java.lang.IllegalStateException', 'RuntimeException'],
  IndexOutOfBoundsException: ['java.lang.IndexOutOfBoundsException', 'RuntimeException'],
  ArrayIndexOutOfBoundsException: ['java.lang.ArrayIndexOutOfBoundsException', 'IndexOutOfBoundsException'],
  StringIndexOutOfBoundsException: ['java.lang.StringIndexOutOfBoundsException', 'IndexOutOfBoundsException'],
  NegativeArraySizeException: ['java.lang.NegativeArraySizeException', 'RuntimeException'],
  NullPointerException: ['java.lang.NullPointerException', 'RuntimeException'],
  UnsupportedOperationException: ['java.lang.UnsupportedOperationException', 'RuntimeException'],
  ConcurrentModificationException: ['java.util.ConcurrentModificationException', 'RuntimeException'],
  NoSuchElementException: ['java.util.NoSuchElementException', 'RuntimeException'],
  InputMismatchException: ['java.util.InputMismatchException', 'NoSuchElementException'],
  EmptyStackException: ['java.util.EmptyStackException', 'RuntimeException'],
  InterruptedException: ['java.lang.InterruptedException', 'Exception'],
  CloneNotSupportedException: ['java.lang.CloneNotSupportedException', 'Exception'],
  StackOverflowError: ['java.lang.StackOverflowError', 'VirtualMachineError'],
  OutOfMemoryError: ['java.lang.OutOfMemoryError', 'VirtualMachineError'],
  VirtualMachineError: ['java.lang.VirtualMachineError', 'Error'],
  AssertionError: ['java.lang.AssertionError', 'Error'],
}

const PETA = new Map(DAFTAR.map((x) => [x.nama, x]))

export function tipePustaka(nama: string): InfoTipePustaka | undefined {
  return PETA.get(nama)
}

/** Nama lengkap (java.util.X / java.lang.X) untuk class pustaka atau exception bawaan. */
export function namaLengkapPustaka(nama: string): string | undefined {
  return PETA.get(nama)?.lengkap ?? EXCEPTION[nama]?.[0]
}

/** Nama sederhana dari nama lengkap, mis. `java.util.NoSuchElementException` → `NoSuchElementException`. */
export function namaSederhana(lengkap: string): string {
  const titik = lengkap.lastIndexOf('.')
  return titik < 0 ? lengkap : lengkap.slice(titik + 1).replace('$', '.')
}

export const adalahExceptionBawaan = (nama: string): boolean => nama in EXCEPTION

/** Induk langsung sebuah exception bawaan. */
export const indukException = (nama: string): string | null | undefined => EXCEPTION[nama]?.[1]

/**
 * Rantai leluhur (termasuk dirinya) sebuah exception bawaan, mis.
 * InputMismatchException → [InputMismatchException, NoSuchElementException, RuntimeException, Exception, Throwable].
 */
export function rantaiException(nama: string): string[] {
  const hasil: string[] = []
  let n: string | null | undefined = nama
  while (n && EXCEPTION[n] && !hasil.includes(n)) {
    hasil.push(n)
    n = EXCEPTION[n][1]
  }
  return hasil
}

/**
 * Checked exception (JLS 11.1.1): Throwable dan turunannya, kecuali RuntimeException, Error, dan turunannya.
 * `rantai` adalah rantai leluhur lengkap (boleh berisi class mahasiswa di depan).
 */
export function adalahChecked(rantai: string[]): boolean {
  return !rantai.includes('RuntimeException') && !rantai.includes('Error')
}

/**
 * Pandang tipe pustaka `nama<argumen>` sebagai supertipe `target`, dengan substitusi argumen tipe.
 * Mis. ArrayList<Integer> sebagai Iterable → ['Integer']; HashMap<String,Integer> sebagai Map → ['String','Integer'].
 * `konkret` mengubah nama tipe konkret di deklarasi supertipe (mis. Comparable<Integer>) menjadi bentuk T.
 * Mengembalikan null bila `target` bukan supertipenya.
 */
export function argumenSebagai<T>(nama: string, argumen: T[], target: string, konkret: (nama: string) => T = (n) => n as T): T[] | null {
  if (nama === target) return argumen
  const info = PETA.get(nama)
  if (!info) return null
  const peta = new Map(info.parameter.map((p, i) => [p, argumen[i]]))
  for (const s of info.super) {
    const hasil = argumenSebagai(
      s.nama,
      s.argumen.map((a) => (peta.has(a) ? (peta.get(a) as T) : konkret(a))),
      target,
      konkret,
    )
    if (hasil) return hasil
  }
  return null
}

/** Apakah tipe pustaka `nama` adalah subtipe (atau sama dengan) `target`. */
export const subtipePustaka = (nama: string, target: string): boolean => target === 'Object' || argumenSebagai(nama, [], target) !== null
