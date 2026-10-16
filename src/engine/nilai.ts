import type { NamaPrimitif, Tipe } from './tipe'

/**
 * Nilai runtime mentah. Tipenya selalu diketahui dari tipe statis hasil type checker:
 * - byte/short/int/char/float/double → number (char = kode UTF-16)
 * - long → bigint
 * - boolean → boolean
 * - referensi (String, array, objek pustaka) → number (id objek di heap) atau null
 */
export type Nilai = number | bigint | boolean | null

export const INT_MIN = -2147483648
export const INT_MAX = 2147483647
export const LONG_MIN = -(2n ** 63n)
export const LONG_MAX = 2n ** 63n - 1n

/** Exception Java yang dilempar oleh program (mis. ArithmeticException). */
export class LemparanJava extends Error {
  /** Nama JVM kelas exception, mis. `java.lang.ArithmeticException`, `Main$StokHabis`. */
  readonly kelas: string
  readonly pesanJava: string | null
  /** Objek exception di heap (ada untuk `throw` objek, atau setelah ditangkap catch). */
  objek?: number
  /** Stack trace saat exception dibuat, mis. `\tat Main.bagi(Main.java:7)`. */
  jejak?: string[]

  constructor(kelas: string, pesanJava: string | null = null, objek?: number, jejak?: string[]) {
    super(pesanJava === null ? kelas : `${kelas}: ${pesanJava}`)
    this.kelas = kelas
    this.pesanJava = pesanJava
    this.objek = objek
    this.jejak = jejak
  }
}

export const keInt = (x: number) => x | 0
export const keShort = (x: number) => (x << 16) >> 16
export const keByte = (x: number) => (x << 24) >> 24
export const keChar = (x: number) => x & 0xffff
export const keLong = (x: bigint) => BigInt.asIntN(64, x)
export const keFloat = (x: number) => Math.fround(x)

/** double/float → int sesuai JLS 5.1.3 (NaN → 0, di luar rentang dibatasi). */
export function pecahanKeInt(d: number): number {
  if (Number.isNaN(d)) return 0
  if (d >= INT_MAX) return INT_MAX
  if (d <= INT_MIN) return INT_MIN
  return Math.trunc(d) | 0
}

/** double/float → long sesuai JLS 5.1.3. */
export function pecahanKeLong(d: number): bigint {
  if (Number.isNaN(d)) return 0n
  if (d >= 2 ** 63) return LONG_MAX
  if (d <= -(2 ** 63)) return LONG_MIN
  return BigInt(Math.trunc(d))
}

function persempitInt(v: number, ke: NamaPrimitif): number {
  switch (ke) {
    case 'byte':
      return keByte(v)
    case 'short':
      return keShort(v)
    case 'char':
      return keChar(v)
    default:
      return v | 0
  }
}

/** Konversi nilai primitif (widening maupun casting/narrowing). */
export function konversiPrimitif(v: Nilai, dari: NamaPrimitif, ke: NamaPrimitif): Nilai {
  if (dari === ke) return v
  if (dari === 'boolean' || ke === 'boolean') return v
  if (dari === 'long') {
    const b = v as bigint
    if (ke === 'float') return Math.fround(Number(b))
    if (ke === 'double') return Number(b)
    return persempitInt(Number(BigInt.asIntN(32, b)), ke)
  }
  if (dari === 'float' || dari === 'double') {
    const d = v as number
    if (ke === 'double') return d
    if (ke === 'float') return Math.fround(d)
    if (ke === 'long') return pecahanKeLong(d)
    return persempitInt(pecahanKeInt(d), ke)
  }
  const n = v as number
  if (ke === 'long') return BigInt(n)
  if (ke === 'float') return Math.fround(n)
  if (ke === 'double') return n
  return persempitInt(n, ke)
}

/** Konversi berdasarkan tipe statis; referensi tidak berubah. */
export function konversi(v: Nilai, dari: Tipe, ke: Tipe): Nilai {
  if (dari.k === 'primitif' && ke.k === 'primitif') return konversiPrimitif(v, dari.nama, ke.nama)
  return v
}

export function nilaiDefault(t: Tipe): Nilai {
  if (t.k !== 'primitif') return null
  switch (t.nama) {
    case 'boolean':
      return false
    case 'long':
      return 0n
    default:
      return 0
  }
}

export type OpAritmetika = '+' | '-' | '*' | '/' | '%'

export interface HasilAritmetika {
  nilai: Nilai
  /** Diisi bila hasil int/long meluap (overflow); berisi hasil matematis yang sebenarnya. */
  overflow?: string
}

/** Operasi aritmetika pada tipe hasil promosi (int, long, float, atau double). */
export function aritmetika(op: OpAritmetika, a: Nilai, b: Nilai, tipe: NamaPrimitif): HasilAritmetika {
  if (tipe === 'long') {
    const x = a as bigint
    const y = b as bigint
    let tepat: bigint
    switch (op) {
      case '+':
        tepat = x + y
        break
      case '-':
        tepat = x - y
        break
      case '*':
        tepat = x * y
        break
      case '/':
        if (y === 0n) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
        tepat = x / y
        break
      case '%':
        if (y === 0n) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
        tepat = x % y
        break
    }
    const hasil = BigInt.asIntN(64, tepat)
    return hasil === tepat ? { nilai: hasil } : { nilai: hasil, overflow: tepat.toString() }
  }
  const x = a as number
  const y = b as number
  if (tipe === 'int') {
    let hasil: number
    let tepat: number
    switch (op) {
      case '+':
        tepat = x + y
        hasil = tepat | 0
        break
      case '-':
        tepat = x - y
        hasil = tepat | 0
        break
      case '*':
        tepat = x * y
        hasil = Math.imul(x, y)
        break
      case '/':
        if (y === 0) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
        tepat = Math.trunc(x / y)
        hasil = tepat | 0
        break
      case '%':
        if (y === 0) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
        tepat = x % y
        hasil = tepat | 0
        break
    }
    if (hasil !== tepat && !(tepat === 0 && hasil === 0)) {
      const teksTepat = Number.isSafeInteger(tepat) ? String(tepat) : (BigInt(x) * BigInt(y)).toString()
      return { nilai: hasil, overflow: teksTepat }
    }
    return { nilai: hasil }
  }
  let hasil: number
  switch (op) {
    case '+':
      hasil = x + y
      break
    case '-':
      hasil = x - y
      break
    case '*':
      hasil = x * y
      break
    case '/':
      hasil = x / y
      break
    case '%':
      hasil = x % y
      break
  }
  return { nilai: tipe === 'float' ? Math.fround(hasil) : hasil }
}

export type OpBanding = '<' | '>' | '<=' | '>=' | '==' | '!='

export function bandingkan(op: OpBanding, a: Nilai, b: Nilai): boolean {
  switch (op) {
    case '<':
      return (a as number) < (b as number)
    case '>':
      return (a as number) > (b as number)
    case '<=':
      return (a as number) <= (b as number)
    case '>=':
      return (a as number) >= (b as number)
    case '==':
      return a === b
    case '!=':
      return a !== b
  }
}

export type OpBit = '&' | '|' | '^'

export function operasiBit(op: OpBit, a: Nilai, b: Nilai, tipe: NamaPrimitif): Nilai {
  if (tipe === 'boolean') {
    const x = a as boolean
    const y = b as boolean
    return op === '&' ? x && y : op === '|' ? x || y : x !== y
  }
  if (tipe === 'long') {
    const x = a as bigint
    const y = b as bigint
    return op === '&' ? x & y : op === '|' ? x | y : x ^ y
  }
  const x = a as number
  const y = b as number
  return op === '&' ? x & y : op === '|' ? x | y : x ^ y
}

export type OpGeser = '<<' | '>>' | '>>>'

/** Geser bit; `tipeKiri` adalah tipe hasil promosi operand kiri (int atau long). */
export function geser(op: OpGeser, a: Nilai, jarak: Nilai, tipeKiri: NamaPrimitif): Nilai {
  const j = typeof jarak === 'bigint' ? Number(BigInt.asIntN(32, jarak)) : (jarak as number)
  if (tipeKiri === 'long') {
    const x = a as bigint
    const s = BigInt(j & 63)
    if (op === '<<') return BigInt.asIntN(64, x << s)
    if (op === '>>') return x >> s
    return BigInt.asIntN(64, BigInt.asUintN(64, x) >> s)
  }
  const x = a as number
  const s = j & 31
  if (op === '<<') return x << s
  if (op === '>>') return x >> s
  return (x >>> s) | 0
}

export function negasi(v: Nilai, tipe: NamaPrimitif): Nilai {
  if (tipe === 'long') return BigInt.asIntN(64, -(v as bigint))
  if (tipe === 'int') return -(v as number) | 0
  if (tipe === 'float') return Math.fround(-(v as number))
  return -(v as number)
}

export function bitNot(v: Nilai, tipe: NamaPrimitif): Nilai {
  if (tipe === 'long') return ~(v as bigint)
  return ~(v as number)
}

/** Tambah/kurang 1 untuk ++/-- pada tipe asli variabel (termasuk byte/short/char). */
export function tambahSatu(v: Nilai, tipe: NamaPrimitif, delta: 1 | -1): Nilai {
  switch (tipe) {
    case 'long':
      return BigInt.asIntN(64, (v as bigint) + BigInt(delta))
    case 'int':
      return ((v as number) + delta) | 0
    case 'short':
      return keShort((v as number) + delta)
    case 'byte':
      return keByte((v as number) + delta)
    case 'char':
      return keChar((v as number) + delta)
    case 'float':
      return Math.fround((v as number) + delta)
    default:
      return (v as number) + delta
  }
}
