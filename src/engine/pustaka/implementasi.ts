import { primitifKeString } from '../format'
import { konversiPrimitif, LemparanJava, pecahanKeLong, type Nilai } from '../nilai'
import { adalahString, teksTipe, type NamaPrimitif, type Tipe } from '../tipe'
import type { ObjekHeap } from '../trace'
import { formatJava } from './formatter'
import type { PemindaiInput } from './scanner'

/** Layanan yang disediakan interpreter untuk implementasi pustaka. */
export interface KonteksPustaka {
  heap: Record<number, ObjekHeap>
  teks(ref: Nilai): string
  buatString(s: string): number
  buatArray(tipeElemen: Tipe, isi: Nilai[]): number
  buatScanner(): number
  tulisElemen(id: number, indeks: number, nilai: Nilai, tipeElemen: string): void
  cetak(teks: string, err: boolean): void
  pemindai: PemindaiInput
  geserScanner(id: number, posisiBaru: number, token: string, metode: string): void
  acak(): number
  keString(v: Nilai, t: Tipe): string
  keluar(kode: number): never
  waktuNano(): bigint
}

export type ImplPustaka = (ctx: KonteksPustaka, objek: Nilai, arg: Nilai[], tipeArg: Tipe[], tipeParam: Tipe[]) => Nilai

const NPE = (pesan: string | null = null) => new LemparanJava('java.lang.NullPointerException', pesan)

function wajibArray(ctx: KonteksPustaka, ref: Nilai): { k: 'array'; tipeElemen: string; nilai: Nilai[] } {
  if (ref === null) throw NPE()
  return ctx.heap[ref as number] as { k: 'array'; tipeElemen: string; nilai: Nilai[] }
}

function tipeDariTeks(t: string): Tipe {
  return ['int', 'long', 'short', 'byte', 'char', 'float', 'double', 'boolean'].includes(t)
    ? { k: 'primitif', nama: t as NamaPrimitif }
    : t.endsWith('[]')
      ? { k: 'array', elemen: tipeDariTeks(t.slice(0, -2)) }
      : { k: 'kelas', nama: t }
}

function cekIndeksString(i: number, panjang: number): void {
  if (i < 0 || i >= panjang) {
    throw new LemparanJava('java.lang.StringIndexOutOfBoundsException', `Index ${i} out of bounds for length ${panjang}`)
  }
}

function cekRentang(awal: number, akhir: number, panjang: number): void {
  if (awal < 0 || awal > akhir || akhir > panjang) {
    throw new LemparanJava('java.lang.StringIndexOutOfBoundsException', `Range [${awal}, ${akhir}) out of bounds for length ${panjang}`)
  }
}

function cekRentangArray(dari: number, ke: number, panjang: number): void {
  if (dari > ke) throw new LemparanJava('java.lang.IllegalArgumentException', `fromIndex(${dari}) > toIndex(${ke})`)
  if (dari < 0) throw new LemparanJava('java.lang.ArrayIndexOutOfBoundsException', `Array index out of range: ${dari}`)
  if (ke > panjang) throw new LemparanJava('java.lang.ArrayIndexOutOfBoundsException', `Array index out of range: ${ke}`)
}

// eslint-disable-next-line no-control-regex -- semantik whitespace/trim Java memang mencakup karakter kontrol
const spasiJava = (c: string) => /[\t\n\u000b\f\r\u001c-\u001f]/.test(c) || (/\s/.test(c) && c !== '\u00a0' && c !== '\u2007' && c !== '\u202f')

function parseIntJava(s: string | null, radix: number, bit: 32 | 64 | 16 | 8): bigint {
  if (s === null) throw new LemparanJava('java.lang.NumberFormatException', 'Cannot parse null string: null')
  const salah = () =>
    new LemparanJava('java.lang.NumberFormatException', `For input string: "${s}"${radix === 10 ? '' : ` under radix ${radix}`}`)
  if (s.length === 0) throw salah()
  const digitValid = radix === 10 ? /^[+-]?\d+$/ : radix === 16 ? /^[+-]?[0-9a-fA-F]+$/ : radix === 2 ? /^[+-]?[01]+$/ : /^[+-]?[0-7]+$/
  if (!digitValid.test(s)) throw salah()
  const negatif = s.startsWith('-')
  const angka = s.replace(/^[+-]/, '')
  let n = 0n
  for (const c of angka) n = n * BigInt(radix) + BigInt(parseInt(c, radix))
  if (negatif) n = -n
  const batas = 2n ** BigInt(bit - 1)
  if (n < -batas || n >= batas) {
    if (bit === 16 || bit === 8) {
      throw new LemparanJava('java.lang.NumberFormatException', `Value out of range. Value:"${s}" Radix:${radix}`)
    }
    throw salah()
  }
  return n
}

function parseDoubleJava(s: string | null): number {
  if (s === null) throw NPE()
  // eslint-disable-next-line no-control-regex -- semantik whitespace/trim Java memang mencakup karakter kontrol
  const t = s.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '')
  if (t.length === 0) throw new LemparanJava('java.lang.NumberFormatException', 'empty String')
  if (!/^[+-]?(NaN|Infinity|(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[fFdD]?)$/.test(t)) {
    throw new LemparanJava('java.lang.NumberFormatException', `For input string: "${s}"`)
  }
  return Number(t.replace(/[fFdD]$/, ''))
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return h
}

function splitJava(s: string, regex: string): string[] {
  let re: RegExp
  try {
    re = new RegExp(regex, 'g')
  } catch {
    throw new LemparanJava('java.util.regex.PatternSyntaxException', `Pola tidak valid: ${regex}`)
  }
  const hasil: string[] = []
  let awal = 0
  let cocok = false
  for (const m of s.matchAll(re)) {
    if (m[0].length === 0) {
      if (m.index === 0 || m.index >= s.length) continue
    }
    if (m.index === 0 && m[0].length > 0) {
      cocok = true
      hasil.push('')
      awal = m[0].length
      continue
    }
    cocok = true
    hasil.push(s.slice(awal, m.index))
    awal = m.index + m[0].length
  }
  if (!cocok) return [s]
  hasil.push(s.slice(awal))
  while (hasil.length > 0 && hasil[hasil.length - 1] === '') hasil.pop()
  return hasil
}

function bandingString(a: string, b: string): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const d = a.charCodeAt(i) - b.charCodeAt(i)
    if (d !== 0) return d
  }
  return a.length - b.length
}

/** Urutan total Double.compare (−0.0 < 0.0, NaN paling akhir). */
function bandingDouble(a: number, b: number): number {
  if (a < b) return -1
  if (a > b) return 1
  if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1
  if (Number.isNaN(b)) return -1
  if (a === 0 && b === 0) return Object.is(a, -0) ? (Object.is(b, -0) ? 0 : -1) : Object.is(b, -0) ? 1 : 0
  return 0
}

function urutkanNilai(isi: Nilai[], tipeElemen: string, ctx: KonteksPustaka): Nilai[] {
  const salinan = isi.slice()
  if (tipeElemen === 'long') salinan.sort((a, b) => ((a as bigint) < (b as bigint) ? -1 : (a as bigint) > (b as bigint) ? 1 : 0))
  else if (tipeElemen === 'double' || tipeElemen === 'float') salinan.sort((a, b) => bandingDouble(a as number, b as number))
  else if (tipeElemen === 'String') {
    if (salinan.some((x) => x === null)) throw NPE()
    salinan.sort((a, b) => bandingString(ctx.teks(a), ctx.teks(b)))
  } else if (tipeElemen === 'boolean' || tipeElemen.endsWith('[]') || tipeElemen === 'Object' || tipeElemen === 'Scanner') {
    throw new LemparanJava('java.lang.ClassCastException', `class [${tipeElemen}] cannot be cast to class java.lang.Comparable`)
  } else salinan.sort((a, b) => (a as number) - (b as number))
  return salinan
}

function arrayKeString(ctx: KonteksPustaka, ref: Nilai, dalam: boolean): string {
  if (ref === null) return 'null'
  const o = wajibArray(ctx, ref)
  const tipe = tipeDariTeks(o.tipeElemen)
  const isi = o.nilai.map((x) => (dalam && o.tipeElemen.endsWith('[]') ? arrayKeString(ctx, x, true) : ctx.keString(x, tipe)))
  return `[${isi.join(', ')}]`
}

function tulisUlang(ctx: KonteksPustaka, id: number, baru: Nilai[], tipeElemen: string): void {
  const o = ctx.heap[id] as { nilai: Nilai[] }
  baru.forEach((v, i) => {
    if (!Object.is(o.nilai[i], v)) ctx.tulisElemen(id, i, v, tipeElemen)
  })
}

function cetakNilai(ctx: KonteksPustaka, objek: Nilai, arg: Nilai[], tipeParam: Tipe[], barisBaru: boolean): Nilai {
  const err = objek === -2
  let teks = ''
  if (arg.length > 0) {
    const t = tipeParam[0]
    if (t.k === 'array' && teksTipe(t) === 'char[]') {
      const o = wajibArray(ctx, arg[0])
      teks = o.nilai.map((c) => String.fromCharCode(c as number)).join('')
    } else teks = ctx.keString(arg[0], t)
  }
  ctx.cetak(barisBaru ? teks + '\n' : teks, err)
  return null
}

function ambilScanner(objek: Nilai): number {
  if (objek === null) throw NPE()
  return objek as number
}

function posisiScanner(ctx: KonteksPustaka, id: number): number {
  return (ctx.heap[id] as { posisi: number }).posisi
}

function bacaScanner(
  metode: string,
  baca: (pm: PemindaiInput, p: number) => { nilai: Nilai | string; posisi: number },
  ubah: (ctx: KonteksPustaka, v: Nilai | string) => Nilai = (_c, v) => v as Nilai,
): ImplPustaka {
  return (ctx, objek) => {
    const id = ambilScanner(objek)
    const awal = posisiScanner(ctx, id)
    const h = baca(ctx.pemindai, awal)
    ctx.geserScanner(id, h.posisi, ctx.pemindai.teks.slice(awal, h.posisi).trim(), metode)
    return ubah(ctx, h.nilai)
  }
}

function argFormat(arg: Nilai[], tipeArg: Tipe[], mulai: number) {
  return arg.slice(mulai).map((nilai, i) => ({ nilai, tipe: tipeArg[mulai + i] }))
}

function format(ctx: KonteksPustaka, arg: Nilai[], tipeArg: Tipe[], mulai: number): string {
  const pola = arg[mulai] === null ? null : ctx.teks(arg[mulai])
  if (pola === null) throw NPE()
  return formatJava(pola, argFormat(arg, tipeArg, mulai + 1), (a) => ctx.keString(a.nilai, a.tipe))
}

const charKe = (fn: (c: string) => boolean): ImplPustaka => (_ctx, _o, arg) => fn(String.fromCodePoint(arg[0] as number))

const umum: Record<string, ImplPustaka> = {
  // ---------- System ----------
  'System.exit': (ctx, _o, arg) => ctx.keluar(arg[0] as number),
  'System.currentTimeMillis': (ctx) => ctx.waktuNano() / 1_000_000n,
  'System.nanoTime': (ctx) => ctx.waktuNano(),

  // ---------- PrintStream ----------
  'PrintStream.println': (ctx, o, arg, _t, p) => cetakNilai(ctx, o, arg, p, true),
  'PrintStream.print': (ctx, o, arg, _t, p) => cetakNilai(ctx, o, arg, p, false),
  'PrintStream.printf': (ctx, o, arg, t) => {
    ctx.cetak(format(ctx, arg, t, 0), o === -2)
    return o
  },
  'PrintStream.format': (ctx, o, arg, t) => {
    ctx.cetak(format(ctx, arg, t, 0), o === -2)
    return o
  },

  // ---------- String ----------
  'String.<init>': (ctx, _o, arg, _t, p) => {
    if (p.length === 0) return ctx.buatString('')
    if (p[0].k === 'array') {
      const o = wajibArray(ctx, arg[0])
      return ctx.buatString(o.nilai.map((c) => String.fromCharCode(c as number)).join(''))
    }
    if (arg[0] === null) throw NPE()
    return ctx.buatString(ctx.teks(arg[0]))
  },
  'String.length': (ctx, o) => ctx.teks(o).length,
  'String.charAt': (ctx, o, arg) => {
    const s = ctx.teks(o)
    cekIndeksString(arg[0] as number, s.length)
    return s.charCodeAt(arg[0] as number)
  },
  'String.substring': (ctx, o, arg) => {
    const s = ctx.teks(o)
    const awal = arg[0] as number
    const akhir = arg.length > 1 ? (arg[1] as number) : s.length
    cekRentang(awal, akhir, s.length)
    // Seperti Java: substring seluruh isi mengembalikan objek yang sama.
    if (awal === 0 && akhir === s.length) return o as number
    return ctx.buatString(s.slice(awal, akhir))
  },
  'String.indexOf': (ctx, o, arg, _t, p) => {
    const s = ctx.teks(o)
    const cari = p[0].k === 'primitif' ? String.fromCodePoint(arg[0] as number) : arg[0] === null ? (() => { throw NPE() })() : ctx.teks(arg[0])
    const dari = arg.length > 1 ? Math.max(0, arg[1] as number) : 0
    return s.indexOf(cari, dari)
  },
  'String.lastIndexOf': (ctx, o, arg, _t, p) => {
    const s = ctx.teks(o)
    const cari = p[0].k === 'primitif' ? String.fromCodePoint(arg[0] as number) : arg[0] === null ? (() => { throw NPE() })() : ctx.teks(arg[0])
    if (arg.length === 1) return s.lastIndexOf(cari)
    const dari = arg[1] as number
    return dari < 0 ? -1 : s.lastIndexOf(cari, dari)
  },
  'String.contains': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    return ctx.teks(o).includes(ctx.teks(arg[0]))
  },
  'String.equals': (ctx, o, arg) => {
    const s = ctx.teks(o)
    const lain = arg[0]
    if (lain === null) return false
    const obj = ctx.heap[lain as number]
    return obj !== undefined && obj.k === 'string' && obj.nilai === s
  },
  'String.equalsIgnoreCase': (ctx, o, arg) => {
    if (arg[0] === null) return false
    const a = ctx.teks(o)
    const b = ctx.teks(arg[0])
    return a.length === b.length && a.toUpperCase().toLowerCase() === b.toUpperCase().toLowerCase()
  },
  'String.compareTo': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    return bandingString(ctx.teks(o), ctx.teks(arg[0]))
  },
  'String.compareToIgnoreCase': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    return bandingString(ctx.teks(o).toUpperCase().toLowerCase(), ctx.teks(arg[0]).toUpperCase().toLowerCase())
  },
  // Seperti Java: bila tidak ada huruf yang berubah, objek yang sama dikembalikan.
  'String.toUpperCase': (ctx, o) => {
    const s = ctx.teks(o)
    const t = s.toUpperCase()
    return t === s ? (o as number) : ctx.buatString(t)
  },
  'String.toLowerCase': (ctx, o) => {
    const s = ctx.teks(o)
    const t = s.toLowerCase()
    return t === s ? (o as number) : ctx.buatString(t)
  },
  'String.trim': (ctx, o) => {
    const s = ctx.teks(o)
    // eslint-disable-next-line no-control-regex -- semantik whitespace/trim Java memang mencakup karakter kontrol
    const t = s.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '')
    return t === s ? (o as number) : ctx.buatString(t)
  },
  'String.strip': (ctx, o) => {
    const s = ctx.teks(o)
    let a = 0
    let b = s.length
    while (a < b && spasiJava(s[a])) a++
    while (b > a && spasiJava(s[b - 1])) b--
    return a === 0 && b === s.length ? (o as number) : ctx.buatString(s.slice(a, b))
  },
  'String.isEmpty': (ctx, o) => ctx.teks(o).length === 0,
  'String.isBlank': (ctx, o) => [...ctx.teks(o)].every(spasiJava),
  'String.startsWith': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    return ctx.teks(o).startsWith(ctx.teks(arg[0]))
  },
  'String.endsWith': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    return ctx.teks(o).endsWith(ctx.teks(arg[0]))
  },
  'String.replace': (ctx, o, arg, _t, p) => {
    const s = ctx.teks(o)
    if (p[0].k === 'primitif') {
      const lama = String.fromCharCode(arg[0] as number)
      const baru = String.fromCharCode(arg[1] as number)
      if (lama === baru || !s.includes(lama)) return o as number
      return ctx.buatString(s.split(lama).join(baru))
    }
    if (arg[0] === null || arg[1] === null) throw NPE()
    const target = ctx.teks(arg[0])
    const ganti = ctx.teks(arg[1])
    // Target kosong: Java menyisipkan pengganti di setiap posisi, termasuk awal dan akhir.
    if (target === '') return ctx.buatString(ganti + [...s].join(ganti) + (s.length > 0 ? ganti : ''))
    // Tidak ada yang diganti (atau ganti 1 karakter dengan karakter yang sama): objek yang sama.
    if (!s.includes(target) || (target.length === 1 && target === ganti)) return o as number
    return ctx.buatString(s.split(target).join(ganti))
  },
  'String.repeat': (ctx, o, arg) => {
    const n = arg[0] as number
    if (n < 0) throw new LemparanJava('java.lang.IllegalArgumentException', `count is negative: ${n}`)
    if (n === 1) return o as number
    return ctx.buatString(ctx.teks(o).repeat(n))
  },
  'String.toCharArray': (ctx, o) => {
    const s = ctx.teks(o)
    return ctx.buatArray({ k: 'primitif', nama: 'char' }, [...Array(s.length)].map((_, i) => s.charCodeAt(i)))
  },
  'String.split': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    const bagian = splitJava(ctx.teks(o), ctx.teks(arg[0]))
    return ctx.buatArray({ k: 'kelas', nama: 'String' }, bagian.map((b) => ctx.buatString(b)))
  },
  'String.concat': (ctx, o, arg) => {
    if (arg[0] === null) throw NPE()
    const tambahan = ctx.teks(arg[0])
    // Seperti Java: concat dengan String kosong mengembalikan objek yang sama.
    return tambahan === '' ? (o as number) : ctx.buatString(ctx.teks(o) + tambahan)
  },
  'String.hashCode': (ctx, o) => hashString(ctx.teks(o)),
  'String.toString': (_ctx, o) => o,
  'String.valueOf': (ctx, _o, arg, _t, p) => {
    if (p[0].k === 'array' && teksTipe(p[0]) === 'char[]') {
      const o = wajibArray(ctx, arg[0])
      return ctx.buatString(o.nilai.map((c) => String.fromCharCode(c as number)).join(''))
    }
    // valueOf(Object) memanggil toString(): untuk String hasilnya objek yang sama.
    if (adalahString(_t[0]) && arg[0] !== null) return arg[0] as number
    return ctx.buatString(ctx.keString(arg[0], _t[0]))
  },
  'String.format': (ctx, _o, arg, t) => ctx.buatString(format(ctx, arg, t, 0)),
  'String.join': (ctx, _o, arg, t, p) => {
    const pemisah = ctx.teks(arg[0])
    let bagian: Nilai[]
    if (arg.length === 2 && t[1].k === 'array' && p[1].k === 'array') bagian = wajibArray(ctx, arg[1]).nilai
    else bagian = arg.slice(1)
    return ctx.buatString(bagian.map((x) => (x === null ? 'null' : ctx.teks(x))).join(pemisah))
  },

  // ---------- Object ----------
  'Object.equals': (_ctx, o, arg) => o === arg[0],
  'Object.hashCode': (_ctx, o) => (Math.imul((o as number) + 1, 0x9e3779b1) >>> 1) | 0,
  'Object.toString': (ctx, o, _a, _t) => ctx.buatString(ctx.keString(o, { k: 'kelas', nama: 'Object' })),

  // ---------- Math ----------
  'Math.abs': (_ctx, _o, arg, _t, p) => {
    const t = (p[0] as { nama: NamaPrimitif }).nama
    if (t === 'long') {
      const v = arg[0] as bigint
      return BigInt.asIntN(64, v < 0n ? -v : v)
    }
    if (t === 'int') return Math.abs(arg[0] as number) | 0
    return Math.abs(arg[0] as number)
  },
  'Math.max': (_ctx, _o, arg, _t, p) => {
    if ((p[0] as { nama: string }).nama === 'long') return (arg[0] as bigint) > (arg[1] as bigint) ? arg[0] : arg[1]
    return Math.max(arg[0] as number, arg[1] as number)
  },
  'Math.min': (_ctx, _o, arg, _t, p) => {
    if ((p[0] as { nama: string }).nama === 'long') return (arg[0] as bigint) < (arg[1] as bigint) ? arg[0] : arg[1]
    return Math.min(arg[0] as number, arg[1] as number)
  },
  'Math.sqrt': (_c, _o, a) => Math.sqrt(a[0] as number),
  'Math.cbrt': (_c, _o, a) => Math.cbrt(a[0] as number),
  'Math.floor': (_c, _o, a) => Math.floor(a[0] as number),
  'Math.ceil': (_c, _o, a) => Math.ceil(a[0] as number),
  'Math.log': (_c, _o, a) => Math.log(a[0] as number),
  'Math.log10': (_c, _o, a) => Math.log10(a[0] as number),
  'Math.exp': (_c, _o, a) => Math.exp(a[0] as number),
  'Math.sin': (_c, _o, a) => Math.sin(a[0] as number),
  'Math.cos': (_c, _o, a) => Math.cos(a[0] as number),
  'Math.tan': (_c, _o, a) => Math.tan(a[0] as number),
  'Math.toRadians': (_c, _o, a) => ((a[0] as number) / 180) * Math.PI,
  'Math.toDegrees': (_c, _o, a) => ((a[0] as number) * 180) / Math.PI,
  'Math.signum': (_c, _o, a) => (Number.isNaN(a[0] as number) || a[0] === 0 ? (a[0] as number) : Math.sign(a[0] as number)),
  'Math.rint': (_c, _o, a) => {
    const x = a[0] as number
    if (!Number.isFinite(x) || x === 0) return x
    const b = Math.floor(x)
    const d = x - b
    const hasil = d < 0.5 ? b : d > 0.5 ? b + 1 : b % 2 === 0 ? b : b + 1
    // Seperti Java: tanda dipertahankan, mis. rint(-0.4) = -0.0.
    return hasil === 0 && x < 0 ? -0 : hasil
  },
  'Math.pow': (_c, _o, a) => Math.pow(a[0] as number, a[1] as number),
  'Math.hypot': (_c, _o, a) => Math.hypot(a[0] as number, a[1] as number),
  'Math.atan2': (_c, _o, a) => Math.atan2(a[0] as number, a[1] as number),
  'Math.round': (_c, _o, a, _t, p) => {
    const x = a[0] as number
    if ((p[0] as { nama: string }).nama === 'float') return konversiPrimitif(Math.round(x), 'double', 'int')
    return pecahanKeLong(Number.isNaN(x) ? 0 : Math.round(x))
  },
  'Math.random': (ctx) => ctx.acak(),
  'Math.floorDiv': (_c, _o, a, _t, p) => {
    if ((p[0] as { nama: string }).nama === 'long') {
      const x = a[0] as bigint
      const y = a[1] as bigint
      if (y === 0n) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
      const q = x / y
      return (x % y !== 0n && (x < 0n) !== (y < 0n)) ? q - 1n : q
    }
    const x = a[0] as number
    const y = a[1] as number
    if (y === 0) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
    return Math.floor(x / y) | 0
  },
  'Math.floorMod': (_c, _o, a, _t, p) => {
    if ((p[0] as { nama: string }).nama === 'long') {
      const x = a[0] as bigint
      const y = a[1] as bigint
      if (y === 0n) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
      return ((x % y) + y) % y
    }
    const x = a[0] as number
    const y = a[1] as number
    if (y === 0) throw new LemparanJava('java.lang.ArithmeticException', '/ by zero')
    return (((x % y) + y) % y) | 0
  },

  // ---------- Integer, Long, Short, Byte ----------
  'Integer.parseInt': (ctx, _o, a) => Number(parseIntJava(a[0] === null ? null : ctx.teks(a[0]), a.length > 1 ? (a[1] as number) : 10, 32)),
  'Integer.valueOf': (ctx, _o, a, _t, p) =>
    p[0].k === 'primitif' ? a[0] : Number(parseIntJava(a[0] === null ? null : ctx.teks(a[0]), 10, 32)),
  'Integer.toString': (ctx, _o, a) => ctx.buatString(a.length > 1 ? (a[0] as number).toString(a[1] as number) : String(a[0])),
  'Integer.toBinaryString': (ctx, _o, a) => ctx.buatString(((a[0] as number) >>> 0).toString(2)),
  'Integer.toHexString': (ctx, _o, a) => ctx.buatString(((a[0] as number) >>> 0).toString(16)),
  'Integer.toOctalString': (ctx, _o, a) => ctx.buatString(((a[0] as number) >>> 0).toString(8)),
  'Integer.max': (_c, _o, a) => Math.max(a[0] as number, a[1] as number),
  'Integer.min': (_c, _o, a) => Math.min(a[0] as number, a[1] as number),
  'Integer.sum': (_c, _o, a) => ((a[0] as number) + (a[1] as number)) | 0,
  'Integer.compare': (_c, _o, a) => Math.sign((a[0] as number) - (a[1] as number)),
  'Integer.signum': (_c, _o, a) => Math.sign(a[0] as number),
  'Integer.bitCount': (_c, _o, a) => {
    let x = (a[0] as number) >>> 0
    let n = 0
    while (x) {
      n += x & 1
      x >>>= 1
    }
    return n
  },
  'Integer.reverse': (_c, _o, a) => {
    let x = a[0] as number
    let r = 0
    for (let i = 0; i < 32; i++) {
      r = (r << 1) | (x & 1)
      x >>>= 1
    }
    return r | 0
  },
  'Long.parseLong': (ctx, _o, a) => parseIntJava(a[0] === null ? null : ctx.teks(a[0]), 10, 64),
  'Long.toString': (ctx, _o, a) => ctx.buatString((a[0] as bigint).toString()),
  'Long.compare': (_c, _o, a) => ((a[0] as bigint) < (a[1] as bigint) ? -1 : (a[0] as bigint) > (a[1] as bigint) ? 1 : 0),
  'Short.parseShort': (ctx, _o, a) => Number(parseIntJava(a[0] === null ? null : ctx.teks(a[0]), 10, 16)),
  'Byte.parseByte': (ctx, _o, a) => Number(parseIntJava(a[0] === null ? null : ctx.teks(a[0]), 10, 8)),

  // ---------- Double, Float, Boolean ----------
  'Double.parseDouble': (ctx, _o, a) => parseDoubleJava(a[0] === null ? null : ctx.teks(a[0])),
  'Double.valueOf': (ctx, _o, a) => parseDoubleJava(a[0] === null ? null : ctx.teks(a[0])),
  'Double.toString': (ctx, _o, a) => ctx.buatString(primitifKeString(a[0], 'double')),
  'Double.isNaN': (_c, _o, a) => Number.isNaN(a[0] as number),
  'Double.isInfinite': (_c, _o, a) => !Number.isFinite(a[0] as number) && !Number.isNaN(a[0] as number),
  'Double.compare': (_c, _o, a) => bandingDouble(a[0] as number, a[1] as number),
  'Float.parseFloat': (ctx, _o, a) => Math.fround(parseDoubleJava(a[0] === null ? null : ctx.teks(a[0]))),
  'Float.toString': (ctx, _o, a) => ctx.buatString(primitifKeString(a[0], 'float')),
  'Boolean.parseBoolean': (ctx, _o, a) => a[0] !== null && ctx.teks(a[0]).toLowerCase() === 'true',
  'Boolean.toString': (ctx, _o, a) => ctx.buatString(a[0] ? 'true' : 'false'),

  // ---------- Character ----------
  'Character.isDigit': charKe((c) => /\p{Nd}/u.test(c)),
  'Character.isLetter': charKe((c) => /\p{L}/u.test(c)),
  'Character.isLetterOrDigit': charKe((c) => /[\p{L}\p{Nd}]/u.test(c)),
  'Character.isUpperCase': charKe((c) => /\p{Lu}/u.test(c)),
  'Character.isLowerCase': charKe((c) => /\p{Ll}/u.test(c)),
  'Character.isWhitespace': charKe(spasiJava),
  'Character.isAlphabetic': charKe((c) => /\p{Alphabetic}/u.test(c)),
  'Character.isSpaceChar': charKe((c) => /\p{Zs}|\p{Zl}|\p{Zp}/u.test(c)),
  'Character.toUpperCase': (_c, _o, a) => {
    const s = String.fromCodePoint(a[0] as number).toUpperCase()
    return s.length === 1 ? s.charCodeAt(0) : (a[0] as number)
  },
  'Character.toLowerCase': (_c, _o, a) => {
    const s = String.fromCodePoint(a[0] as number).toLowerCase()
    return s.length === 1 ? s.charCodeAt(0) : (a[0] as number)
  },
  'Character.getNumericValue': (_c, _o, a) => {
    const c = String.fromCodePoint(a[0] as number)
    if (/[0-9]/.test(c)) return Number(c)
    if (/[a-zA-Z]/.test(c)) return c.toLowerCase().charCodeAt(0) - 87
    return -1
  },
  'Character.toString': (ctx, _o, a) => ctx.buatString(String.fromCharCode(a[0] as number)),
  'Character.valueOf': (_c, _o, a) => a[0],
  'Character.compare': (_c, _o, a) => (a[0] as number) - (a[1] as number),

  // ---------- Arrays ----------
  'Arrays.toString': (ctx, _o, a) => ctx.buatString(arrayKeString(ctx, a[0], false)),
  'Arrays.deepToString': (ctx, _o, a) => ctx.buatString(arrayKeString(ctx, a[0], true)),
  'Arrays.fill': (ctx, _o, a) => {
    const o = wajibArray(ctx, a[0])
    const dari = a.length === 4 ? (a[1] as number) : 0
    const ke = a.length === 4 ? (a[2] as number) : o.nilai.length
    cekRentangArray(dari, ke, o.nilai.length)
    const nilai = a[a.length - 1]
    const baru = o.nilai.slice()
    for (let i = dari; i < ke; i++) baru[i] = nilai
    tulisUlang(ctx, a[0] as number, baru, o.tipeElemen)
    return null
  },
  'Arrays.sort': (ctx, _o, a) => {
    const o = wajibArray(ctx, a[0])
    const dari = a.length === 3 ? (a[1] as number) : 0
    const ke = a.length === 3 ? (a[2] as number) : o.nilai.length
    cekRentangArray(dari, ke, o.nilai.length)
    const bagian = urutkanNilai(o.nilai.slice(dari, ke), o.tipeElemen, ctx)
    const baru = [...o.nilai.slice(0, dari), ...bagian, ...o.nilai.slice(ke)]
    tulisUlang(ctx, a[0] as number, baru, o.tipeElemen)
    return null
  },
  'Arrays.equals': (ctx, _o, a) => {
    if (a[0] === a[1]) return true
    if (a[0] === null || a[1] === null) return false
    const ox = wajibArray(ctx, a[0])
    const x = ox.nilai
    const y = wajibArray(ctx, a[1]).nilai
    if (x.length !== y.length) return false
    // Primitif dibandingkan bit demi bit (NaN == NaN, 0.0 != -0.0); Object[] memakai equals (isi untuk String).
    const primitif = tipeDariTeks(ox.tipeElemen).k === 'primitif'
    return x.every((v, i) => {
      if (primitif) return Object.is(v, y[i])
      if (v === y[i]) return true
      if (v === null || y[i] === null) return false
      const ov = ctx.heap[v as number]
      const oy = ctx.heap[y[i] as number]
      return ov?.k === 'string' && oy?.k === 'string' && ov.nilai === oy.nilai
    })
  },
  'Arrays.copyOf': (ctx, _o, a) => {
    const o = wajibArray(ctx, a[0])
    const n = a[1] as number
    if (n < 0) throw new LemparanJava('java.lang.NegativeArraySizeException', String(n))
    const tipe = tipeDariTeks(o.tipeElemen)
    const def = tipe.k === 'primitif' ? (tipe.nama === 'boolean' ? false : tipe.nama === 'long' ? 0n : 0) : null
    const isi = [...Array(n)].map((_, i) => (i < o.nilai.length ? o.nilai[i] : def))
    return ctx.buatArray(tipe, isi)
  },
  'Arrays.copyOfRange': (ctx, _o, a) => {
    const o = wajibArray(ctx, a[0])
    const dari = a[1] as number
    const ke = a[2] as number
    if (dari > ke) throw new LemparanJava('java.lang.IllegalArgumentException', `${dari} > ${ke}`)
    // Pesan mengikuti System.arraycopy di HotSpot.
    const namaArray = tipeDariTeks(o.tipeElemen).k === 'primitif' ? `${o.tipeElemen}[${o.nilai.length}]` : `object array[${o.nilai.length}]`
    const panjangSalin = Math.min(o.nilai.length - dari, ke - dari)
    if (dari < 0) throw new LemparanJava('java.lang.ArrayIndexOutOfBoundsException', `arraycopy: source index ${dari} out of bounds for ${namaArray}`)
    if (panjangSalin < 0) throw new LemparanJava('java.lang.ArrayIndexOutOfBoundsException', `arraycopy: length ${panjangSalin} is negative`)
    const tipe = tipeDariTeks(o.tipeElemen)
    const def = tipe.k === 'primitif' ? (tipe.nama === 'boolean' ? false : tipe.nama === 'long' ? 0n : 0) : null
    const isi = [...Array(ke - dari)].map((_, i) => (dari + i < o.nilai.length ? o.nilai[dari + i] : def))
    return ctx.buatArray(tipe, isi)
  },
  'Arrays.binarySearch': (ctx, _o, a) => {
    const o = wajibArray(ctx, a[0])
    const kunci = a[1]
    let lo = 0
    let hi = o.nilai.length - 1
    const banding = (x: Nilai) =>
      o.tipeElemen === 'String' ? bandingString(ctx.teks(x), ctx.teks(kunci)) : typeof x === 'bigint' ? (x < (kunci as bigint) ? -1 : x > (kunci as bigint) ? 1 : 0) : bandingDouble(x as number, kunci as number)
    while (lo <= hi) {
      const tengah = (lo + hi) >>> 1
      const c = banding(o.nilai[tengah])
      if (c < 0) lo = tengah + 1
      else if (c > 0) hi = tengah - 1
      else return tengah
    }
    return -(lo + 1)
  },

  // ---------- Scanner ----------
  'Scanner.<init>': (ctx) => ctx.buatScanner(),
  'Scanner.nextInt': bacaScanner('nextInt', (pm, p) => pm.nextInt(p)),
  'Scanner.nextLong': bacaScanner('nextLong', (pm, p) => pm.nextLong(p)),
  'Scanner.nextShort': bacaScanner('nextShort', (pm, p) => pm.nextShort(p)),
  'Scanner.nextByte': bacaScanner('nextByte', (pm, p) => pm.nextByte(p)),
  'Scanner.nextDouble': bacaScanner('nextDouble', (pm, p) => pm.nextDouble(p)),
  'Scanner.nextFloat': bacaScanner('nextFloat', (pm, p) => pm.nextDouble(p), (_c, v) => Math.fround(v as number)),
  'Scanner.nextBoolean': bacaScanner('nextBoolean', (pm, p) => pm.nextBoolean(p)),
  'Scanner.next': bacaScanner('next', (pm, p) => pm.next(p), (c, v) => c.buatString(v as string)),
  'Scanner.nextLine': bacaScanner('nextLine', (pm, p) => pm.nextLine(p), (c, v) => c.buatString(v as string)),
  'Scanner.hasNext': (ctx, o) => ctx.pemindai.hasNext(posisiScanner(ctx, ambilScanner(o))),
  'Scanner.hasNextInt': (ctx, o) => ctx.pemindai.hasNextInt(posisiScanner(ctx, ambilScanner(o))),
  'Scanner.hasNextDouble': (ctx, o) => ctx.pemindai.hasNextDouble(posisiScanner(ctx, ambilScanner(o))),
  'Scanner.hasNextLine': (ctx, o) => ctx.pemindai.hasNextLine(posisiScanner(ctx, ambilScanner(o))),
  'Scanner.close': () => null,
}

/** Cari implementasi berdasarkan id tanda tangan, mis. `String.charAt(int)` → `String.charAt`. */
export function implementasi(id: string): ImplPustaka | undefined {
  const nama = id.slice(0, id.indexOf('('))
  return umum[nama]
}
