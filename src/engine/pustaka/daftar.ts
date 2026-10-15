import type { NilaiKonstan } from '../ast'
import { T, teksTipe, tipeArray, type Tipe } from '../tipe'

export interface MethodPustaka {
  id: string
  kelas: string
  nama: string
  parameter: Tipe[]
  kembali: Tipe
  statik: boolean
  varargs: boolean
}

export interface FieldPustaka {
  id: string
  kelas: string
  nama: string
  tipe: Tipe
  /** Nilai konstanta compile-time (mis. Integer.MAX_VALUE, Math.PI). */
  konstan?: NilaiKonstan
}

export interface KelasPustaka {
  nama: string
  statik: Map<string, MethodPustaka[]>
  instance: Map<string, MethodPustaka[]>
  field: Map<string, FieldPustaka>
  konstruktor: MethodPustaka[]
}

const PrintStream: Tipe = { k: 'kelas', nama: 'PrintStream' }
const InputStream: Tipe = { k: 'kelas', nama: 'InputStream' }
const { int, long, float, double, char, boolean, String, Object, byte, short } = T
const arr = (t: Tipe, d = 1) => tipeArray(t, d)

const daftar = new Map<string, KelasPustaka>()

function kelas(nama: string): KelasPustaka {
  let k = daftar.get(nama)
  if (!k) {
    k = { nama, statik: new Map(), instance: new Map(), field: new Map(), konstruktor: [] }
    daftar.set(nama, k)
  }
  return k
}

function idMethod(kls: string, nama: string, parameter: Tipe[]): string {
  return `${kls}.${nama}(${parameter.map(teksTipe).join(',')})`
}

function m(kls: string, nama: string, parameter: Tipe[], kembali: Tipe, statik: boolean, varargs = false): void {
  const k = kelas(kls)
  const peta = statik ? k.statik : k.instance
  const isi: MethodPustaka = { id: idMethod(kls, nama, parameter), kelas: kls, nama, parameter, kembali, statik, varargs }
  peta.set(nama, [...(peta.get(nama) ?? []), isi])
}
const s = (kls: string, nama: string, parameter: Tipe[], kembali: Tipe, varargs = false) => m(kls, nama, parameter, kembali, true, varargs)
const i = (kls: string, nama: string, parameter: Tipe[], kembali: Tipe, varargs = false) => m(kls, nama, parameter, kembali, false, varargs)

function f(kls: string, nama: string, tipe: Tipe, konstan?: NilaiKonstan): void {
  kelas(kls).field.set(nama, { id: `${kls}.${nama}`, kelas: kls, nama, tipe, konstan })
}

function ktor(kls: string, parameter: Tipe[]): void {
  kelas(kls).konstruktor.push({
    id: idMethod(kls, '<init>', parameter),
    kelas: kls,
    nama: kls,
    parameter,
    kembali: { k: 'kelas', nama: kls },
    statik: true,
    varargs: false,
  })
}

// ---------- System & PrintStream ----------
f('System', 'out', PrintStream)
f('System', 'err', PrintStream)
f('System', 'in', InputStream)
s('System', 'exit', [int], T.void)
s('System', 'currentTimeMillis', [], long)
s('System', 'nanoTime', [], long)
i('PrintStream', 'println', [], T.void)
for (const nama of ['println', 'print']) {
  for (const t of [boolean, char, int, long, float, double, arr(char), String, Object]) i('PrintStream', nama, [t], T.void)
}
i('PrintStream', 'printf', [String, arr(Object)], PrintStream, true)
i('PrintStream', 'format', [String, arr(Object)], PrintStream, true)

// ---------- String ----------
ktor('String', [])
ktor('String', [String])
ktor('String', [arr(char)])
i('String', 'length', [], int)
i('String', 'charAt', [int], char)
i('String', 'substring', [int], String)
i('String', 'substring', [int, int], String)
i('String', 'indexOf', [String], int)
i('String', 'indexOf', [int], int)
i('String', 'indexOf', [String, int], int)
i('String', 'indexOf', [int, int], int)
i('String', 'lastIndexOf', [String], int)
i('String', 'lastIndexOf', [int], int)
i('String', 'lastIndexOf', [String, int], int)
i('String', 'lastIndexOf', [int, int], int)
i('String', 'contains', [String], boolean)
i('String', 'equals', [Object], boolean)
i('String', 'equalsIgnoreCase', [String], boolean)
i('String', 'compareTo', [String], int)
i('String', 'compareToIgnoreCase', [String], int)
i('String', 'toUpperCase', [], String)
i('String', 'toLowerCase', [], String)
i('String', 'trim', [], String)
i('String', 'strip', [], String)
i('String', 'isEmpty', [], boolean)
i('String', 'isBlank', [], boolean)
i('String', 'startsWith', [String], boolean)
i('String', 'endsWith', [String], boolean)
i('String', 'replace', [char, char], String)
i('String', 'replace', [String, String], String)
i('String', 'repeat', [int], String)
i('String', 'toCharArray', [], arr(char))
i('String', 'split', [String], arr(String))
i('String', 'concat', [String], String)
i('String', 'hashCode', [], int)
i('String', 'toString', [], String)
for (const t of [boolean, char, int, long, float, double, arr(char), Object]) s('String', 'valueOf', [t], String)
s('String', 'format', [String, arr(Object)], String, true)
s('String', 'join', [String, arr(String)], String, true)

// ---------- Math ----------
f('Math', 'PI', double, Math.PI)
f('Math', 'E', double, Math.E)
for (const t of [int, long, float, double]) {
  s('Math', 'abs', [t], t)
  s('Math', 'max', [t, t], t)
  s('Math', 'min', [t, t], t)
}
for (const nama of ['sqrt', 'cbrt', 'floor', 'ceil', 'log', 'log10', 'exp', 'sin', 'cos', 'tan', 'toRadians', 'toDegrees', 'signum', 'rint']) {
  s('Math', nama, [double], double)
}
s('Math', 'pow', [double, double], double)
s('Math', 'hypot', [double, double], double)
s('Math', 'atan2', [double, double], double)
s('Math', 'round', [double], long)
s('Math', 'round', [float], int)
s('Math', 'random', [], double)
s('Math', 'floorDiv', [int, int], int)
s('Math', 'floorMod', [int, int], int)
s('Math', 'floorDiv', [long, long], long)
s('Math', 'floorMod', [long, long], long)

// ---------- Kelas pembungkus ----------
f('Integer', 'MAX_VALUE', int, 2147483647)
f('Integer', 'MIN_VALUE', int, -2147483648)
s('Integer', 'parseInt', [String], int)
s('Integer', 'parseInt', [String, int], int)
s('Integer', 'valueOf', [String], int)
s('Integer', 'valueOf', [int], int)
s('Integer', 'toString', [int], String)
s('Integer', 'toString', [int, int], String)
s('Integer', 'toBinaryString', [int], String)
s('Integer', 'toHexString', [int], String)
s('Integer', 'toOctalString', [int], String)
s('Integer', 'max', [int, int], int)
s('Integer', 'min', [int, int], int)
s('Integer', 'sum', [int, int], int)
s('Integer', 'compare', [int, int], int)
s('Integer', 'signum', [int], int)
s('Integer', 'bitCount', [int], int)
s('Integer', 'reverse', [int], int)
f('Long', 'MAX_VALUE', long, 9223372036854775807n)
f('Long', 'MIN_VALUE', long, -9223372036854775808n)
s('Long', 'parseLong', [String], long)
s('Long', 'toString', [long], String)
s('Long', 'compare', [long, long], int)
f('Short', 'MAX_VALUE', short, 32767)
f('Short', 'MIN_VALUE', short, -32768)
s('Short', 'parseShort', [String], short)
f('Byte', 'MAX_VALUE', byte, 127)
f('Byte', 'MIN_VALUE', byte, -128)
s('Byte', 'parseByte', [String], byte)
f('Double', 'MAX_VALUE', double, Number.MAX_VALUE)
f('Double', 'MIN_VALUE', double, Number.MIN_VALUE)
f('Double', 'POSITIVE_INFINITY', double, Infinity)
f('Double', 'NEGATIVE_INFINITY', double, -Infinity)
f('Double', 'NaN', double, NaN)
s('Double', 'parseDouble', [String], double)
s('Double', 'valueOf', [String], double)
s('Double', 'toString', [double], String)
s('Double', 'isNaN', [double], boolean)
s('Double', 'isInfinite', [double], boolean)
s('Double', 'compare', [double, double], int)
f('Float', 'MAX_VALUE', float, 3.4028234663852886e38)
f('Float', 'MIN_VALUE', float, 1.401298464324817e-45)
s('Float', 'parseFloat', [String], float)
s('Float', 'toString', [float], String)
f('Character', 'MIN_VALUE', char, 0)
f('Character', 'MAX_VALUE', char, 0xffff)
for (const nama of ['isDigit', 'isLetter', 'isLetterOrDigit', 'isUpperCase', 'isLowerCase', 'isWhitespace', 'isAlphabetic', 'isSpaceChar']) {
  if (nama !== 'isAlphabetic') s('Character', nama, [char], boolean)
  s('Character', nama, [int], boolean)
}
s('Character', 'toUpperCase', [char], char)
s('Character', 'toUpperCase', [int], int)
s('Character', 'toLowerCase', [char], char)
s('Character', 'toLowerCase', [int], int)
s('Character', 'getNumericValue', [char], int)
s('Character', 'getNumericValue', [int], int)
s('Character', 'toString', [char], String)
s('Character', 'valueOf', [char], char)
s('Character', 'compare', [char, char], int)
s('Boolean', 'parseBoolean', [String], boolean)
s('Boolean', 'toString', [boolean], String)

// ---------- Arrays ----------
for (const t of [int, long, short, byte, char, float, double, boolean, Object]) {
  s('Arrays', 'toString', [arr(t)], String)
  s('Arrays', 'fill', [arr(t), t], T.void)
  s('Arrays', 'fill', [arr(t), int, int, t], T.void)
  s('Arrays', 'equals', [arr(t), arr(t)], boolean)
  s('Arrays', 'copyOf', [arr(t), int], arr(t))
  s('Arrays', 'copyOfRange', [arr(t), int, int], arr(t))
  if (t !== boolean) {
    s('Arrays', 'sort', [arr(t)], T.void)
    s('Arrays', 'sort', [arr(t), int, int], T.void)
    s('Arrays', 'binarySearch', [arr(t), t], int)
  }
}
s('Arrays', 'deepToString', [arr(Object)], String)

// ---------- Scanner ----------
ktor('Scanner', [InputStream])
i('Scanner', 'nextInt', [], int)
i('Scanner', 'nextLong', [], long)
i('Scanner', 'nextShort', [], short)
i('Scanner', 'nextByte', [], byte)
i('Scanner', 'nextDouble', [], double)
i('Scanner', 'nextFloat', [], float)
i('Scanner', 'nextBoolean', [], boolean)
i('Scanner', 'next', [], String)
i('Scanner', 'nextLine', [], String)
i('Scanner', 'hasNext', [], boolean)
i('Scanner', 'hasNextInt', [], boolean)
i('Scanner', 'hasNextDouble', [], boolean)
i('Scanner', 'hasNextLine', [], boolean)
i('Scanner', 'close', [], T.void)

// ---------- Object ----------
i('Object', 'equals', [Object], boolean)
i('Object', 'hashCode', [], int)
i('Object', 'toString', [], String)
kelas('InputStream')

export const KELAS_PUSTAKA: ReadonlyMap<string, KelasPustaka> = daftar

/** Class pustaka yang boleh dipakai sebagai tipe variabel di Fase 1. */
export const KELAS_BISA_DIPAKAI = new Set(['String', 'Scanner', 'Object'])

/** Class yang wajib di-import dari java.util. */
export const KELAS_JAVA_UTIL = new Set(['Scanner', 'Arrays'])

export function kelasPustaka(nama: string): KelasPustaka | undefined {
  return daftar.get(nama)
}
