/**
 * Tanda tangan pustaka Java yang dikenal Java Mini (Fase 1 + Fase 2): method, konstruktor, dan field.
 * Tanda tangan ditulis seperti di Javadoc, termasuk generik, mis. `<T extends Comparable<? super T>> void sort(List<T>)`.
 *
 * Id method: `${KelasDeklarator}.${nama}(${parameter-dideklarasikan.map(teksTipe).join(',')})`, mis. `List.get(int)`,
 * `Collection.add(E)`, `Map.put(K,V)`, `ArrayList.<init>(int)`. Id dipakai runtime untuk memilih implementasi, jadi
 * id Fase 1 tidak boleh berubah. Method yang sama di JDK dideklarasikan sekali saja di tipe paling umum yang memuatnya
 * (mis. `add(E)` di `Collection`), sehingga pemanggilan lewat `ArrayList` maupun `List` menghasilkan id yang sama.
 */
import type { Akses, NilaiKonstan } from '../ast'
import { DAFTAR_EXCEPTION, tipePustaka } from '../hierarki'
import { T, teksTipe, type NamaPrimitif, type Tipe } from '../tipe'

/** Parameter tipe method generik beserta batas atasnya, mis. `T extends Object & Comparable<? super T>`. */
export interface ParamTipe {
  nama: string
  batas: Tipe[]
}

export interface MethodPustaka {
  id: string
  /** Class/antarmuka yang mendeklarasikan method ini. */
  kelas: string
  nama: string
  /** Tipe parameter yang dideklarasikan (boleh memuat variabel tipe class maupun method). */
  parameter: Tipe[]
  kembali: Tipe
  statik: boolean
  varargs: boolean
  /** Parameter tipe milik method generik (kosong/undefined untuk method biasa). */
  tipeParam?: ParamTipe[]
  /** Method yang sah di Java tetapi belum didukung simulator: berisi saran alternatif. */
  belumDidukung?: string
}

export interface FieldPustaka {
  id: string
  kelas: string
  nama: string
  tipe: Tipe
  /** Nilai konstanta compile-time (mis. Integer.MAX_VALUE, Math.PI). */
  konstan?: NilaiKonstan
  statik: boolean
  akses: Akses
}

export interface KelasPustaka {
  nama: string
  /** Method static per nama (overload). */
  statik: Map<string, MethodPustaka[]>
  /** Method instance per nama (overload), hanya yang dideklarasikan di tipe ini. */
  instance: Map<string, MethodPustaka[]>
  field: Map<string, FieldPustaka>
  konstruktor: MethodPustaka[]
}

const daftar = new Map<string, KelasPustaka>()

function kelas(nama: string): KelasPustaka {
  let k = daftar.get(nama)
  if (!k) {
    k = { nama, statik: new Map(), instance: new Map(), field: new Map(), konstruktor: [] }
    daftar.set(nama, k)
  }
  return k
}

// ---------- pengurai tanda tangan ----------
const PRIMITIF = new Set(['byte', 'short', 'int', 'long', 'float', 'double', 'char', 'boolean'])

class Pengurai {
  private i = 0
  constructor(
    private readonly s: string,
    private readonly variabel: ReadonlySet<string>,
  ) {}

  private spasi(): void {
    while (this.s[this.i] === ' ') this.i++
  }

  lihat(teks: string): boolean {
    this.spasi()
    return this.s.startsWith(teks, this.i)
  }

  ambil(teks: string): boolean {
    if (!this.lihat(teks)) return false
    this.i += teks.length
    return true
  }

  harap(teks: string): void {
    if (!this.ambil(teks)) throw new Error(`Tanda tangan pustaka rusak: "${this.s}" (harap ${teks} di ${this.i})`)
  }

  nama(): string {
    this.spasi()
    const awal = this.i
    while (this.i < this.s.length && /[\w.$]/.test(this.s[this.i]) && !this.s.startsWith('...', this.i)) this.i++
    if (awal === this.i) throw new Error(`Tanda tangan pustaka rusak: "${this.s}" (nama di ${this.i})`)
    return this.s.slice(awal, this.i)
  }

  /** Satu tipe; `bolehVarargs` mengizinkan akhiran `...` (hasilnya array + penanda). */
  tipe(): { tipe: Tipe; varargs: boolean } {
    if (this.ambil('?')) {
      if (this.ambil('extends')) return { tipe: { k: 'wildcard', batas: 'extends', tipe: this.tipe().tipe }, varargs: false }
      if (this.ambil('super')) return { tipe: { k: 'wildcard', batas: 'super', tipe: this.tipe().tipe }, varargs: false }
      return { tipe: { k: 'wildcard', batas: null }, varargs: false }
    }
    const n = this.nama()
    let t: Tipe
    if (n === 'void') t = T.void
    else if (PRIMITIF.has(n)) t = { k: 'primitif', nama: n as NamaPrimitif }
    else if (this.variabel.has(n)) t = { k: 'variabel', nama: n }
    else if (this.ambil('<')) {
      const argumen: Tipe[] = []
      do argumen.push(this.tipe().tipe)
      while (this.ambil(','))
      this.harap('>')
      t = { k: 'kelas', nama: n, argumen }
    } else t = { k: 'kelas', nama: n }
    while (this.ambil('[]')) t = { k: 'array', elemen: t }
    if (this.ambil('...')) return { tipe: { k: 'array', elemen: t }, varargs: true }
    return { tipe: t, varargs: false }
  }

  /** `(A, B...)` */
  parameter(): { parameter: Tipe[]; varargs: boolean } {
    this.harap('(')
    const parameter: Tipe[] = []
    let varargs = false
    if (!this.ambil(')')) {
      do {
        const p = this.tipe()
        parameter.push(p.tipe)
        varargs = p.varargs
      } while (this.ambil(','))
      this.harap(')')
    }
    return { parameter, varargs }
  }

  selesai(): void {
    this.spasi()
    if (this.i !== this.s.length) throw new Error(`Tanda tangan pustaka rusak: "${this.s}" (sisa di ${this.i})`)
  }
}

/** Urai `<T extends A & B, U>` di awal tanda tangan. */
function uraiParamTipe(sig: string): { tipeParam: string[]; batasTeks: string[]; sisa: string } {
  if (!sig.startsWith('<')) return { tipeParam: [], batasTeks: [], sisa: sig }
  let kedalaman = 0
  let j = 0
  for (; j < sig.length; j++) {
    if (sig[j] === '<') kedalaman++
    else if (sig[j] === '>' && --kedalaman === 0) break
  }
  const isi = sig.slice(1, j)
  const bagian: string[] = []
  let awal = 0
  kedalaman = 0
  for (let k = 0; k < isi.length; k++) {
    if (isi[k] === '<') kedalaman++
    else if (isi[k] === '>') kedalaman--
    else if (isi[k] === ',' && kedalaman === 0) {
      bagian.push(isi.slice(awal, k))
      awal = k + 1
    }
  }
  bagian.push(isi.slice(awal))
  const tipeParam: string[] = []
  const batasTeks: string[] = []
  for (const b of bagian) {
    const m = /^\s*(\w+)(?:\s+extends\s+(.*))?$/.exec(b)!
    tipeParam.push(m[1])
    batasTeks.push(m[2] ?? '')
  }
  return { tipeParam, batasTeks, sisa: sig.slice(j + 1) }
}

function idMethod(kls: string, nama: string, parameter: Tipe[]): string {
  return `${kls}.${nama}(${parameter.map(teksTipe).join(',')})`
}

function variabelKelas(kls: string): string[] {
  return tipePustaka(kls)?.parameter ?? []
}

/** Deklarasikan method dari tanda tangan, mis. `<T> List<T> asList(T...)`. */
function deklarasi(kls: string, statik: boolean, sig: string, belumDidukung?: string): MethodPustaka {
  const { tipeParam, batasTeks, sisa } = uraiParamTipe(sig.trim())
  const variabel = new Set([...(statik ? [] : variabelKelas(kls)), ...tipeParam])
  const u = new Pengurai(sisa, variabel)
  const kembali = u.tipe().tipe
  const nama = u.nama()
  const { parameter, varargs } = u.parameter()
  u.selesai()
  const batas = batasTeks.map((teks) => {
    if (!teks) return [T.Object]
    return teks.split('&').map((b) => {
      const ub = new Pengurai(b.trim(), variabel)
      const t = ub.tipe().tipe
      ub.selesai()
      return t
    })
  })
  const isi: MethodPustaka = { id: idMethod(kls, nama, parameter), kelas: kls, nama, parameter, kembali, statik, varargs }
  if (tipeParam.length) isi.tipeParam = tipeParam.map((n, i) => ({ nama: n, batas: batas[i] }))
  if (belumDidukung) isi.belumDidukung = belumDidukung
  const k = kelas(kls)
  const peta = statik ? k.statik : k.instance
  peta.set(nama, [...(peta.get(nama) ?? []), isi])
  return isi
}

/** Method static. */
const s = (kls: string, sig: string, belumDidukung?: string) => deklarasi(kls, true, sig, belumDidukung)
/** Method instance (variabel tipe class boleh dipakai). */
const i = (kls: string, sig: string, belumDidukung?: string) => deklarasi(kls, false, sig, belumDidukung)

/** Konstruktor, mis. `ktor('ArrayList', '(Collection<? extends E>)')`. */
function ktor(kls: string, sig: string): void {
  const variabel = new Set(variabelKelas(kls))
  const u = new Pengurai(sig.trim(), variabel)
  const { parameter, varargs } = u.parameter()
  u.selesai()
  const par = variabelKelas(kls)
  kelas(kls).konstruktor.push({
    id: idMethod(kls, '<init>', parameter),
    kelas: kls,
    nama: kls,
    parameter,
    kembali: par.length ? { k: 'kelas', nama: kls, argumen: par.map((n) => ({ k: 'variabel', nama: n })) } : { k: 'kelas', nama: kls },
    statik: true,
    varargs,
  })
}

/** Field static publik. */
function f(kls: string, tipe: string, nama: string, konstan?: NilaiKonstan): void {
  const u = new Pengurai(tipe, new Set())
  kelas(kls).field.set(nama, { id: `${kls}.${nama}`, kelas: kls, nama, tipe: u.tipe().tipe, konstan, statik: true, akses: 'public' })
}

/** Field instance non-publik milik implementasi JDK (hanya untuk pesan akses javac, mis. `size has private access`). */
function fieldTersembunyi(kls: string, tipe: string, nama: string, akses: Akses): void {
  const u = new Pengurai(tipe, new Set())
  kelas(kls).field.set(nama, { id: `${kls}.${nama}`, kelas: kls, nama, tipe: u.tipe().tipe, statik: false, akses })
}

const LAMBDA_LAIN = 'Lambda hanya didukung untuk Comparator. Gunakan perulangan for/for-each biasa.'

// ======================================================================
// java.lang
// ======================================================================

// ---------- Object ----------
ktor('Object', '()')
i('Object', 'boolean equals(Object)')
i('Object', 'int hashCode()')
i('Object', 'String toString()')
i('Object', 'Object getClass()', 'Gunakan nama class secara langsung.')

// ---------- System & PrintStream ----------
f('System', 'PrintStream', 'out')
f('System', 'PrintStream', 'err')
f('System', 'InputStream', 'in')
s('System', 'void exit(int)')
s('System', 'long currentTimeMillis()')
s('System', 'long nanoTime()')
i('PrintStream', 'void println()')
for (const nama of ['println', 'print']) {
  for (const t of ['boolean', 'char', 'int', 'long', 'float', 'double', 'char[]', 'String', 'Object']) i('PrintStream', `void ${nama}(${t})`)
}
i('PrintStream', 'PrintStream printf(String, Object...)')
i('PrintStream', 'PrintStream format(String, Object...)')
kelas('InputStream')

// ---------- String ----------
ktor('String', '()')
ktor('String', '(String)')
ktor('String', '(char[])')
i('String', 'int length()')
i('String', 'char charAt(int)')
i('String', 'String substring(int)')
i('String', 'String substring(int, int)')
i('String', 'int indexOf(String)')
i('String', 'int indexOf(int)')
i('String', 'int indexOf(String, int)')
i('String', 'int indexOf(int, int)')
i('String', 'int lastIndexOf(String)')
i('String', 'int lastIndexOf(int)')
i('String', 'int lastIndexOf(String, int)')
i('String', 'int lastIndexOf(int, int)')
i('String', 'boolean contains(String)')
i('String', 'boolean equals(Object)')
i('String', 'boolean equalsIgnoreCase(String)')
i('String', 'int compareTo(String)')
i('String', 'int compareToIgnoreCase(String)')
i('String', 'String toUpperCase()')
i('String', 'String toLowerCase()')
i('String', 'String trim()')
i('String', 'String strip()')
i('String', 'boolean isEmpty()')
i('String', 'boolean isBlank()')
i('String', 'boolean startsWith(String)')
i('String', 'boolean endsWith(String)')
i('String', 'String replace(char, char)')
i('String', 'String replace(String, String)')
i('String', 'String repeat(int)')
i('String', 'char[] toCharArray()')
i('String', 'String[] split(String)')
i('String', 'String concat(String)')
i('String', 'int hashCode()')
i('String', 'String toString()')
for (const t of ['boolean', 'char', 'int', 'long', 'float', 'double', 'char[]', 'Object']) s('String', `String valueOf(${t})`)
s('String', 'String format(String, Object...)')
s('String', 'String join(String, String...)')
s('String', 'String join(CharSequence, Iterable<? extends CharSequence>)')
i('String', 'Object chars()', 'Stream belum didukung. Gunakan perulangan dengan charAt(i).')

// ---------- Math ----------
f('Math', 'double', 'PI', Math.PI)
f('Math', 'double', 'E', Math.E)
for (const t of ['int', 'long', 'float', 'double']) {
  s('Math', `${t} abs(${t})`)
  s('Math', `${t} max(${t}, ${t})`)
  s('Math', `${t} min(${t}, ${t})`)
}
for (const nama of ['sqrt', 'cbrt', 'floor', 'ceil', 'log', 'log10', 'exp', 'sin', 'cos', 'tan', 'toRadians', 'toDegrees', 'signum', 'rint']) {
  s('Math', `double ${nama}(double)`)
}
s('Math', 'double pow(double, double)')
s('Math', 'double hypot(double, double)')
s('Math', 'double atan2(double, double)')
s('Math', 'long round(double)')
s('Math', 'int round(float)')
s('Math', 'double random()')
s('Math', 'int floorDiv(int, int)')
s('Math', 'int floorMod(int, int)')
s('Math', 'long floorDiv(long, long)')
s('Math', 'long floorMod(long, long)')

// ---------- Number & kelas pembungkus ----------
for (const [t, nama] of [['int', 'intValue'], ['long', 'longValue'], ['double', 'doubleValue'], ['float', 'floatValue'], ['short', 'shortValue'], ['byte', 'byteValue']]) {
  i('Number', `${t} ${nama}()`)
}

f('Integer', 'int', 'MAX_VALUE', 2147483647)
f('Integer', 'int', 'MIN_VALUE', -2147483648)
s('Integer', 'int parseInt(String)')
s('Integer', 'int parseInt(String, int)')
s('Integer', 'Integer valueOf(String)')
s('Integer', 'Integer valueOf(int)')
s('Integer', 'String toString(int)')
s('Integer', 'String toString(int, int)')
s('Integer', 'String toBinaryString(int)')
s('Integer', 'String toHexString(int)')
s('Integer', 'String toOctalString(int)')
s('Integer', 'int max(int, int)')
s('Integer', 'int min(int, int)')
s('Integer', 'int sum(int, int)')
s('Integer', 'int compare(int, int)')
s('Integer', 'int signum(int)')
s('Integer', 'int bitCount(int)')
s('Integer', 'int reverse(int)')
s('Integer', 'int hashCode(int)')
i('Integer', 'int compareTo(Integer)')
i('Integer', 'boolean equals(Object)')
i('Integer', 'int hashCode()')
i('Integer', 'String toString()')

f('Long', 'long', 'MAX_VALUE', 9223372036854775807n)
f('Long', 'long', 'MIN_VALUE', -9223372036854775808n)
s('Long', 'long parseLong(String)')
s('Long', 'Long valueOf(long)')
s('Long', 'Long valueOf(String)')
s('Long', 'String toString(long)')
s('Long', 'int compare(long, long)')
s('Long', 'long max(long, long)')
s('Long', 'long min(long, long)')
s('Long', 'long sum(long, long)')
s('Long', 'int hashCode(long)')
i('Long', 'int compareTo(Long)')
i('Long', 'boolean equals(Object)')
i('Long', 'int hashCode()')
i('Long', 'String toString()')

f('Short', 'short', 'MAX_VALUE', 32767)
f('Short', 'short', 'MIN_VALUE', -32768)
s('Short', 'short parseShort(String)')
s('Short', 'Short valueOf(short)')
i('Short', 'int compareTo(Short)')
i('Short', 'boolean equals(Object)')
i('Short', 'int hashCode()')
i('Short', 'String toString()')

f('Byte', 'byte', 'MAX_VALUE', 127)
f('Byte', 'byte', 'MIN_VALUE', -128)
s('Byte', 'byte parseByte(String)')
s('Byte', 'Byte valueOf(byte)')
i('Byte', 'int compareTo(Byte)')
i('Byte', 'boolean equals(Object)')
i('Byte', 'int hashCode()')
i('Byte', 'String toString()')

f('Double', 'double', 'MAX_VALUE', Number.MAX_VALUE)
f('Double', 'double', 'MIN_VALUE', Number.MIN_VALUE)
f('Double', 'double', 'POSITIVE_INFINITY', Infinity)
f('Double', 'double', 'NEGATIVE_INFINITY', -Infinity)
f('Double', 'double', 'NaN', NaN)
s('Double', 'double parseDouble(String)')
s('Double', 'Double valueOf(String)')
s('Double', 'Double valueOf(double)')
s('Double', 'String toString(double)')
s('Double', 'boolean isNaN(double)')
s('Double', 'boolean isInfinite(double)')
s('Double', 'int compare(double, double)')
s('Double', 'double max(double, double)')
s('Double', 'double min(double, double)')
s('Double', 'double sum(double, double)')
s('Double', 'int hashCode(double)')
i('Double', 'boolean isNaN()')
i('Double', 'boolean isInfinite()')
i('Double', 'int compareTo(Double)')
i('Double', 'boolean equals(Object)')
i('Double', 'int hashCode()')
i('Double', 'String toString()')

f('Float', 'float', 'MAX_VALUE', 3.4028234663852886e38)
f('Float', 'float', 'MIN_VALUE', 1.401298464324817e-45)
s('Float', 'float parseFloat(String)')
s('Float', 'Float valueOf(float)')
s('Float', 'String toString(float)')
s('Float', 'int compare(float, float)')
i('Float', 'int compareTo(Float)')
i('Float', 'boolean equals(Object)')
i('Float', 'int hashCode()')
i('Float', 'String toString()')

f('Character', 'char', 'MIN_VALUE', 0)
f('Character', 'char', 'MAX_VALUE', 0xffff)
for (const nama of ['isDigit', 'isLetter', 'isLetterOrDigit', 'isUpperCase', 'isLowerCase', 'isWhitespace', 'isAlphabetic', 'isSpaceChar']) {
  if (nama !== 'isAlphabetic') s('Character', `boolean ${nama}(char)`)
  s('Character', `boolean ${nama}(int)`)
}
s('Character', 'char toUpperCase(char)')
s('Character', 'int toUpperCase(int)')
s('Character', 'char toLowerCase(char)')
s('Character', 'int toLowerCase(int)')
s('Character', 'int getNumericValue(char)')
s('Character', 'int getNumericValue(int)')
s('Character', 'String toString(char)')
s('Character', 'Character valueOf(char)')
s('Character', 'int compare(char, char)')
s('Character', 'int hashCode(char)')
i('Character', 'char charValue()')
i('Character', 'int compareTo(Character)')
i('Character', 'boolean equals(Object)')
i('Character', 'int hashCode()')
i('Character', 'String toString()')

s('Boolean', 'boolean parseBoolean(String)')
s('Boolean', 'String toString(boolean)')
// Bukan konstanta waktu kompilasi: runtime menyediakan objek Boolean yang di-cache.
f('Boolean', 'Boolean', 'TRUE')
f('Boolean', 'Boolean', 'FALSE')
s('Boolean', 'Boolean valueOf(boolean)')
s('Boolean', 'Boolean valueOf(String)')
s('Boolean', 'int compare(boolean, boolean)')
s('Boolean', 'int hashCode(boolean)')
i('Boolean', 'boolean booleanValue()')
i('Boolean', 'int compareTo(Boolean)')
i('Boolean', 'boolean equals(Object)')
i('Boolean', 'int hashCode()')
i('Boolean', 'String toString()')

// ---------- CharSequence, Comparable, Iterable ----------
i('CharSequence', 'int length()')
i('CharSequence', 'char charAt(int)')
i('CharSequence', 'String toString()')
i('Comparable', 'int compareTo(T)')
i('Iterable', 'Iterator<T> iterator()')
i('Iterable', 'void forEach(Object)', LAMBDA_LAIN)

// ---------- StringBuilder ----------
ktor('StringBuilder', '()')
ktor('StringBuilder', '(int)')
ktor('StringBuilder', '(String)')
ktor('StringBuilder', '(CharSequence)')
for (const t of ['Object', 'String', 'CharSequence', 'char[]', 'boolean', 'char', 'int', 'long', 'float', 'double']) {
  i('StringBuilder', `StringBuilder append(${t})`)
  i('StringBuilder', `StringBuilder insert(int, ${t})`)
}
i('StringBuilder', 'StringBuilder append(CharSequence, int, int)')
i('StringBuilder', 'StringBuilder delete(int, int)')
i('StringBuilder', 'StringBuilder deleteCharAt(int)')
i('StringBuilder', 'StringBuilder replace(int, int, String)')
i('StringBuilder', 'StringBuilder reverse()')
i('StringBuilder', 'void setCharAt(int, char)')
i('StringBuilder', 'void setLength(int)')
i('StringBuilder', 'char charAt(int)')
i('StringBuilder', 'int length()')
i('StringBuilder', 'int capacity()')
i('StringBuilder', 'int indexOf(String)')
i('StringBuilder', 'int indexOf(String, int)')
i('StringBuilder', 'int lastIndexOf(String)')
i('StringBuilder', 'int lastIndexOf(String, int)')
i('StringBuilder', 'String substring(int)')
i('StringBuilder', 'String substring(int, int)')
i('StringBuilder', 'boolean isEmpty()')
i('StringBuilder', 'int compareTo(StringBuilder)')
i('StringBuilder', 'String toString()')

// ---------- Throwable & exception bawaan ----------
i('Throwable', 'String getMessage()')
i('Throwable', 'String getLocalizedMessage()')
// Selalu null di subset ini (tidak ada konstruktor dengan cause).
i('Throwable', 'Throwable getCause()')
i('Throwable', 'String toString()')
i('Throwable', 'void printStackTrace()')
for (const nama of DAFTAR_EXCEPTION) {
  ktor(nama, '()')
  ktor(nama, '(String)')
}

// ======================================================================
// java.util
// ======================================================================

// ---------- Arrays ----------
for (const t of ['int', 'long', 'short', 'byte', 'char', 'float', 'double', 'boolean', 'Object']) {
  s('Arrays', `String toString(${t}[])`)
  s('Arrays', `void fill(${t}[], ${t})`)
  s('Arrays', `void fill(${t}[], int, int, ${t})`)
  s('Arrays', `boolean equals(${t}[], ${t}[])`)
  s('Arrays', `${t}[] copyOf(${t}[], int)`)
  s('Arrays', `${t}[] copyOfRange(${t}[], int, int)`)
  if (t !== 'boolean') {
    s('Arrays', `void sort(${t}[])`)
    s('Arrays', `void sort(${t}[], int, int)`)
    s('Arrays', `int binarySearch(${t}[], ${t})`)
  }
}
s('Arrays', 'String deepToString(Object[])')
s('Arrays', '<T> void sort(T[], Comparator<? super T>)')
s('Arrays', '<T> void sort(T[], int, int, Comparator<? super T>)')
s('Arrays', '<T> List<T> asList(T...)')
s('Arrays', 'Object stream(Object[])', 'Stream belum didukung. Gunakan perulangan for-each.')

// ---------- Scanner ----------
ktor('Scanner', '(InputStream)')
i('Scanner', 'int nextInt()')
i('Scanner', 'long nextLong()')
i('Scanner', 'short nextShort()')
i('Scanner', 'byte nextByte()')
i('Scanner', 'double nextDouble()')
i('Scanner', 'float nextFloat()')
i('Scanner', 'boolean nextBoolean()')
i('Scanner', 'String next()')
i('Scanner', 'String nextLine()')
i('Scanner', 'boolean hasNext()')
i('Scanner', 'boolean hasNextInt()')
i('Scanner', 'boolean hasNextDouble()')
i('Scanner', 'boolean hasNextLine()')
i('Scanner', 'void close()')

// ---------- Random ----------
ktor('Random', '()')
ktor('Random', '(long)')
i('Random', 'int nextInt()')
i('Random', 'int nextInt(int)')
i('Random', 'int nextInt(int, int)')
i('Random', 'long nextLong()')
i('Random', 'double nextDouble()')
i('Random', 'float nextFloat()')
i('Random', 'boolean nextBoolean()')
i('Random', 'double nextGaussian()')
i('Random', 'void setSeed(long)')

// ---------- Objects ----------
s('Objects', 'boolean equals(Object, Object)')
s('Objects', 'int hash(Object...)')
s('Objects', 'int hashCode(Object)')
s('Objects', 'String toString(Object)')
s('Objects', 'boolean isNull(Object)')
s('Objects', 'boolean nonNull(Object)')
s('Objects', '<T> T requireNonNull(T)')
s('Objects', '<T> T requireNonNull(T, String)')

// ---------- Iterator ----------
i('Iterator', 'boolean hasNext()')
i('Iterator', 'E next()')
i('Iterator', 'void remove()')

// ---------- Comparator ----------
i('Comparator', 'int compare(T, T)')
i('Comparator', 'boolean equals(Object)')
i('Comparator', 'Comparator<T> reversed()')
i('Comparator', 'Comparator<T> thenComparing(Comparator<? super T>)')
s('Comparator', '<T extends Comparable<? super T>> Comparator<T> naturalOrder()')
s('Comparator', '<T extends Comparable<? super T>> Comparator<T> reverseOrder()')
s('Comparator', '<T> Comparator<T> comparing(Object)', LAMBDA_LAIN)
s('Comparator', '<T> Comparator<T> comparingInt(Object)', LAMBDA_LAIN)
s('Comparator', '<T> Comparator<T> comparingDouble(Object)', LAMBDA_LAIN)
i('Comparator', 'Comparator<T> thenComparingInt(Object)', LAMBDA_LAIN)

// ---------- Collection ----------
i('Collection', 'int size()')
i('Collection', 'boolean isEmpty()')
i('Collection', 'boolean contains(Object)')
i('Collection', 'boolean add(E)')
i('Collection', 'boolean remove(Object)')
i('Collection', 'boolean addAll(Collection<? extends E>)')
i('Collection', 'boolean removeAll(Collection<?>)')
i('Collection', 'boolean retainAll(Collection<?>)')
i('Collection', 'boolean containsAll(Collection<?>)')
i('Collection', 'void clear()')
i('Collection', 'Object[] toArray()')
i('Collection', '<T> T[] toArray(T[])')
i('Collection', 'boolean equals(Object)')
i('Collection', 'int hashCode()')
i('Collection', 'boolean removeIf(Object)', LAMBDA_LAIN)
i('Collection', 'Object stream()', 'Stream belum didukung. Gunakan perulangan for-each.')

// ---------- List ----------
i('List', 'E get(int)')
i('List', 'E set(int, E)')
i('List', 'void add(int, E)')
i('List', 'E remove(int)')
i('List', 'int indexOf(Object)')
i('List', 'int lastIndexOf(Object)')
i('List', 'boolean addAll(int, Collection<? extends E>)')
i('List', 'List<E> subList(int, int)')
i('List', 'void sort(Comparator<? super E>)')
i('List', 'boolean equals(Object)')
i('List', 'int hashCode()')
i('List', 'void replaceAll(Object)', LAMBDA_LAIN)
s('List', '<E> List<E> of(E...)')
s('List', '<E> List<E> copyOf(Collection<? extends E>)')

// ---------- Set, SortedSet, NavigableSet ----------
i('Set', 'boolean equals(Object)')
i('Set', 'int hashCode()')
s('Set', '<E> Set<E> of(E...)', 'Urutan iterasi Set.of diacak JDK pada setiap run. Gunakan new HashSet<>(Arrays.asList(...)).')
i('SortedSet', 'E first()')
i('SortedSet', 'E last()')
i('SortedSet', 'SortedSet<E> headSet(E)')
i('SortedSet', 'SortedSet<E> tailSet(E)')
i('SortedSet', 'SortedSet<E> subSet(E, E)')
i('SortedSet', 'Comparator<? super E> comparator()')
i('NavigableSet', 'E floor(E)')
i('NavigableSet', 'E ceiling(E)')
i('NavigableSet', 'E higher(E)')
i('NavigableSet', 'E lower(E)')
i('NavigableSet', 'E pollFirst()')
i('NavigableSet', 'E pollLast()')
i('NavigableSet', 'NavigableSet<E> descendingSet()')
i('NavigableSet', 'Iterator<E> descendingIterator()')

// ---------- Queue & Deque ----------
i('Queue', 'boolean offer(E)')
i('Queue', 'E poll()')
i('Queue', 'E peek()')
i('Queue', 'E element()')
i('Queue', 'E remove()')
i('Deque', 'void addFirst(E)')
i('Deque', 'void addLast(E)')
i('Deque', 'boolean offerFirst(E)')
i('Deque', 'boolean offerLast(E)')
i('Deque', 'E removeFirst()')
i('Deque', 'E removeLast()')
i('Deque', 'E pollFirst()')
i('Deque', 'E pollLast()')
i('Deque', 'E getFirst()')
i('Deque', 'E getLast()')
i('Deque', 'E peekFirst()')
i('Deque', 'E peekLast()')
i('Deque', 'void push(E)')
i('Deque', 'E pop()')
i('Deque', 'boolean removeFirstOccurrence(Object)')
i('Deque', 'boolean removeLastOccurrence(Object)')
i('Deque', 'Iterator<E> descendingIterator()')

// ---------- Map ----------
i('Map', 'int size()')
i('Map', 'boolean isEmpty()')
i('Map', 'V get(Object)')
i('Map', 'V put(K, V)')
i('Map', 'V remove(Object)')
i('Map', 'boolean containsKey(Object)')
i('Map', 'boolean containsValue(Object)')
i('Map', 'V getOrDefault(Object, V)')
i('Map', 'V putIfAbsent(K, V)')
i('Map', 'void putAll(Map<? extends K, ? extends V>)')
i('Map', 'V replace(K, V)')
i('Map', 'void clear()')
i('Map', 'Set<K> keySet()')
i('Map', 'Collection<V> values()')
i('Map', 'Set<Map.Entry<K, V>> entrySet()')
i('Map', 'boolean equals(Object)')
i('Map', 'int hashCode()')
i('Map', 'void forEach(Object)', LAMBDA_LAIN)
i('Map', 'V merge(K, V, Object)', LAMBDA_LAIN)
i('Map', 'V computeIfAbsent(K, Object)', LAMBDA_LAIN)
i('Map', 'V compute(K, Object)', LAMBDA_LAIN)
s('Map', '<K, V> Map<K, V> of()', 'Urutan iterasi Map.of diacak JDK pada setiap run. Gunakan new HashMap<>() lalu put.')
i('Map.Entry', 'K getKey()')
i('Map.Entry', 'V getValue()')
i('Map.Entry', 'V setValue(V)')
i('Map.Entry', 'boolean equals(Object)')
i('Map.Entry', 'int hashCode()')
i('SortedMap', 'K firstKey()')
i('SortedMap', 'K lastKey()')
i('SortedMap', 'SortedMap<K, V> headMap(K)')
i('SortedMap', 'SortedMap<K, V> tailMap(K)')
i('SortedMap', 'SortedMap<K, V> subMap(K, K)')
i('SortedMap', 'Comparator<? super K> comparator()')
i('NavigableMap', 'Map.Entry<K, V> firstEntry()')
i('NavigableMap', 'Map.Entry<K, V> lastEntry()')
i('NavigableMap', 'Map.Entry<K, V> pollFirstEntry()')
i('NavigableMap', 'Map.Entry<K, V> pollLastEntry()')
i('NavigableMap', 'K floorKey(K)')
i('NavigableMap', 'K ceilingKey(K)')
i('NavigableMap', 'K higherKey(K)')
i('NavigableMap', 'K lowerKey(K)')
i('NavigableMap', 'Map.Entry<K, V> floorEntry(K)')
i('NavigableMap', 'Map.Entry<K, V> ceilingEntry(K)')
i('NavigableMap', 'Map.Entry<K, V> higherEntry(K)')
i('NavigableMap', 'Map.Entry<K, V> lowerEntry(K)')
i('NavigableMap', 'NavigableMap<K, V> descendingMap()')
i('NavigableMap', 'NavigableSet<K> descendingKeySet()')
i('NavigableMap', 'NavigableSet<K> navigableKeySet()')

// ---------- Implementasi koleksi ----------
ktor('ArrayList', '()')
ktor('ArrayList', '(int)')
ktor('ArrayList', '(Collection<? extends E>)')
i('ArrayList', 'void ensureCapacity(int)')
i('ArrayList', 'void trimToSize()')
fieldTersembunyi('ArrayList', 'int', 'size', 'private')

ktor('LinkedList', '()')
ktor('LinkedList', '(Collection<? extends E>)')
fieldTersembunyi('LinkedList', 'int', 'size', 'paket')

ktor('ArrayDeque', '()')
ktor('ArrayDeque', '(int)')
ktor('ArrayDeque', '(Collection<? extends E>)')

ktor('Stack', '()')
i('Stack', 'E push(E)')
i('Stack', 'E pop()')
i('Stack', 'E peek()')
i('Stack', 'boolean empty()')
i('Stack', 'int search(Object)')
fieldTersembunyi('Stack', 'int', 'elementCount', 'protected')

ktor('PriorityQueue', '()')
ktor('PriorityQueue', '(int)')
ktor('PriorityQueue', '(Comparator<? super E>)')
ktor('PriorityQueue', '(int, Comparator<? super E>)')
ktor('PriorityQueue', '(Collection<? extends E>)')
ktor('PriorityQueue', '(PriorityQueue<? extends E>)')
ktor('PriorityQueue', '(SortedSet<? extends E>)')
i('PriorityQueue', 'Comparator<? super E> comparator()')
fieldTersembunyi('PriorityQueue', 'int', 'size', 'paket')

ktor('HashSet', '()')
ktor('HashSet', '(int)')
ktor('HashSet', '(Collection<? extends E>)')
ktor('LinkedHashSet', '()')
ktor('LinkedHashSet', '(int)')
ktor('LinkedHashSet', '(Collection<? extends E>)')
ktor('TreeSet', '()')
ktor('TreeSet', '(Comparator<? super E>)')
ktor('TreeSet', '(Collection<? extends E>)')
ktor('TreeSet', '(SortedSet<E>)')

ktor('HashMap', '()')
ktor('HashMap', '(int)')
ktor('HashMap', '(Map<? extends K, ? extends V>)')
fieldTersembunyi('HashMap', 'int', 'size', 'paket')
ktor('LinkedHashMap', '()')
ktor('LinkedHashMap', '(int)')
ktor('LinkedHashMap', '(Map<? extends K, ? extends V>)')
ktor('TreeMap', '()')
ktor('TreeMap', '(Comparator<? super K>)')
ktor('TreeMap', '(Map<? extends K, ? extends V>)')
ktor('TreeMap', '(SortedMap<K, ? extends V>)')
fieldTersembunyi('TreeMap', 'int', 'size', 'private')

// ---------- Collections ----------
s('Collections', '<T extends Comparable<? super T>> void sort(List<T>)')
s('Collections', '<T> void sort(List<T>, Comparator<? super T>)')
s('Collections', 'void reverse(List<?>)')
s('Collections', 'void shuffle(List<?>)', 'Urutan acak tanpa seed berbeda tiap run. Gunakan Collections.shuffle(list, new Random(seed)).')
s('Collections', 'void shuffle(List<?>, Random)')
s('Collections', 'void swap(List<?>, int, int)')
s('Collections', 'int frequency(Collection<?>, Object)')
s('Collections', '<T extends Object & Comparable<? super T>> T max(Collection<? extends T>)')
s('Collections', '<T> T max(Collection<? extends T>, Comparator<? super T>)')
s('Collections', '<T extends Object & Comparable<? super T>> T min(Collection<? extends T>)')
s('Collections', '<T> T min(Collection<? extends T>, Comparator<? super T>)')
s('Collections', '<T> boolean addAll(Collection<? super T>, T...)')
s('Collections', '<T> void fill(List<? super T>, T)')
s('Collections', '<T> List<T> nCopies(int, T)')
s('Collections', '<T> List<T> emptyList()')
s('Collections', '<T> List<T> unmodifiableList(List<? extends T>)')
s('Collections', '<T> Comparator<T> reverseOrder()')
s('Collections', '<T> Comparator<T> reverseOrder(Comparator<T>)')
s('Collections', '<T> int binarySearch(List<? extends Comparable<? super T>>, T)')

// ======================================================================

/**
 * Method Object (`toString`, `equals`, `hashCode`) yang dideklarasikan ulang di bawah Object oleh class/antarmuka
 * pustaka. Menentukan kualifier deskripsi JVM (pesan NPE): `java.util.ArrayList.toString()` vs `Object.toString()`.
 */
const SEMUA_OBJEK = ['toString', 'equals', 'hashCode']
const DEKLARASI_ULANG_OBJECT: Record<string, readonly string[]> = {
  ArrayList: SEMUA_OBJEK,
  LinkedList: SEMUA_OBJEK,
  Stack: SEMUA_OBJEK,
  ArrayDeque: ['toString'],
  PriorityQueue: ['toString'],
  HashSet: SEMUA_OBJEK,
  LinkedHashSet: SEMUA_OBJEK,
  TreeSet: SEMUA_OBJEK,
  HashMap: SEMUA_OBJEK,
  LinkedHashMap: SEMUA_OBJEK,
  TreeMap: SEMUA_OBJEK,
  StringBuilder: ['toString'],
  Scanner: ['toString'],
  Throwable: ['toString'],
  Collection: ['equals', 'hashCode'],
  List: ['equals', 'hashCode'],
  Set: ['equals', 'hashCode'],
  Map: ['equals', 'hashCode'],
  'Map.Entry': ['equals', 'hashCode'],
  Comparator: ['equals'],
}

/** Apakah method Object `nama` dideklarasikan ulang oleh tipe pustaka `kelas` (bukan supertipenya). */
export function deklarasiUlangObject(kls: string, nama: string): boolean {
  return DEKLARASI_ULANG_OBJECT[kls]?.includes(nama) ?? false
}

export const KELAS_PUSTAKA: ReadonlyMap<string, KelasPustaka> = daftar

/** Class `java.util` yang dipakai di Fase 1 (impor wajib). Fase 2 memakai `paketPustaka` di hierarki. */
export const KELAS_JAVA_UTIL = new Set(['Scanner', 'Arrays'])

export function kelasPustaka(nama: string): KelasPustaka | undefined {
  return daftar.get(nama)
}
