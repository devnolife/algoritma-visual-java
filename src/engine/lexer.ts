import { katalog, PengumpulDiagnostik } from './diagnostik'
import type { Sumber } from './sumber'

export type JenisToken = 'ident' | 'kunci' | 'int' | 'long' | 'float' | 'double' | 'char' | 'string' | 'op' | 'eof'

export interface Token {
  jenis: JenisToken
  teks: string
  awal: number
  akhir: number
  /** int/long: bigint (sudah bertanda); float/double: number; char: kode; string: isi. */
  nilai?: bigint | number | string
  /** Literal desimal 2147483648 / 9223372036854775808 yang hanya sah bila didahului minus. */
  perluMinus?: boolean
}

export const KATA_KUNCI = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue',
  'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if',
  'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private',
  'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
  'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null',
])

const OPERATOR = [
  '>>>=', '<<=', '>>=', '>>>', '...', '->', '::', '++', '--', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=',
  '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '(', ')', '{', '}', '[', ']', ';', ',', '.', '@', '=', '>',
  '<', '!', '~', '?', ':', '+', '-', '*', '/', '&', '|', '^', '%',
]

const awalIdent = /[\p{L}_$]/u
const bagianIdent = /[\p{L}\p{N}_$]/u

export interface HasilLexer {
  token: Token[]
  /** Penanda catatan dosen: nomor baris → nama (dari komentar `// #nama`). */
  penanda: Map<number, string>
}

const INT_BATAS = 2n ** 31n
const LONG_BATAS = 2n ** 63n

export function lex(sumber: Sumber, diag: PengumpulDiagnostik): HasilLexer {
  const s = sumber.teks
  const token: Token[] = []
  const penanda = new Map<number, string>()
  let i = 0

  const error = (awal: number, akhir: number, isi: ReturnType<(typeof katalog)[keyof typeof katalog]>, k: string, fokus?: number) =>
    diag.tambah(k, { awal, akhir, fokus }, isi)

  while (i < s.length) {
    const c = s[i]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') {
      i++
      continue
    }
    if (c === '/' && s[i + 1] === '/') {
      let j = i + 2
      while (j < s.length && s[j] !== '\n' && s[j] !== '\r') j++
      const isi = s.slice(i + 2, j)
      const m = /^\s*#([\p{L}\p{N}_-]+)/u.exec(isi)
      if (m) penanda.set(sumber.baris(i), m[1])
      i = j
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      const tutup = s.indexOf('*/', i + 2)
      if (tutup < 0) {
        error(i, i + 2, katalog.komentarTakTertutup(), 'komentar-tak-tertutup')
        i = s.length
        break
      }
      i = tutup + 2
      continue
    }
    const awal = i
    if (awalIdent.test(c)) {
      let j = i + 1
      while (j < s.length && bagianIdent.test(s[j])) j++
      const teks = s.slice(i, j)
      token.push({ jenis: KATA_KUNCI.has(teks) ? 'kunci' : 'ident', teks, awal, akhir: j })
      i = j
      continue
    }
    if ((c >= '0' && c <= '9') || (c === '.' && s[i + 1] >= '0' && s[i + 1] <= '9')) {
      i = lexAngka(s, i, token, diag)
      continue
    }
    if (c === '"') {
      if (s.startsWith('"""', i)) {
        const tutup = s.indexOf('"""', i + 3)
        const akhir = tutup < 0 ? s.length : tutup + 3
        error(i, akhir, katalog.belumDidukung('Text block """', 'Gunakan String biasa dengan \\n untuk baris baru.'), 'belum-didukung')
        token.push({ jenis: 'string', teks: s.slice(i, akhir), awal, akhir, nilai: '' })
        i = akhir
        continue
      }
      let j = i + 1
      let isi = ''
      let tertutup = false
      while (j < s.length) {
        const d = s[j]
        if (d === '"') {
          tertutup = true
          j++
          break
        }
        if (d === '\n' || d === '\r') break
        if (d === '\\') {
          const e = bacaEscape(s, j)
          if (e.error) error(j, e.akhir, katalog.escapeIlegal(), 'escape-ilegal', j + 1)
          isi += e.teks
          j = e.akhir
          continue
        }
        isi += d
        j++
      }
      if (!tertutup) error(i, j, katalog.stringTakTertutup(), 'string-tak-tertutup')
      token.push({ jenis: 'string', teks: s.slice(i, j), awal, akhir: j, nilai: isi })
      i = j
      continue
    }
    if (c === "'") {
      let j = i + 1
      if (s[j] === "'") {
        error(i, j + 1, katalog.charKosong(), 'char-kosong')
        token.push({ jenis: 'char', teks: "''", awal, akhir: j + 1, nilai: 0 })
        i = j + 1
        continue
      }
      if (j >= s.length || s[j] === '\n' || s[j] === '\r') {
        error(i, j, katalog.charTakTertutup(), 'char-tak-tertutup')
        token.push({ jenis: 'char', teks: "'", awal, akhir: j, nilai: 0 })
        i = j
        continue
      }
      let kodeChar: number
      if (s[j] === '\\') {
        const e = bacaEscape(s, j)
        if (e.error) error(j, e.akhir, katalog.escapeIlegal(), 'escape-ilegal', j + 1)
        kodeChar = e.teks.charCodeAt(0) || 0
        j = e.akhir
      } else {
        kodeChar = s.charCodeAt(j)
        j++
      }
      if (s[j] !== "'") {
        let k = j
        while (k < s.length && s[k] !== "'" && s[k] !== '\n' && s[k] !== '\r' && s[k] !== ';') k++
        const akhir = s[k] === "'" ? k + 1 : k
        error(i, akhir, katalog.charTakTertutup(), 'char-tak-tertutup')
        token.push({ jenis: 'char', teks: s.slice(i, akhir), awal, akhir, nilai: kodeChar })
        i = akhir
        continue
      }
      j++
      token.push({ jenis: 'char', teks: s.slice(i, j), awal, akhir: j, nilai: kodeChar })
      i = j
      continue
    }
    const op = OPERATOR.find((o) => s.startsWith(o, i))
    if (op) {
      token.push({ jenis: 'op', teks: op, awal, akhir: i + op.length })
      i += op.length
      continue
    }
    error(i, i + 1, katalog.karakterIlegal(c), 'karakter-ilegal')
    i++
  }
  token.push({ jenis: 'eof', teks: '', awal: s.length, akhir: s.length })
  return { token, penanda }
}

function bacaEscape(s: string, j: number): { teks: string; akhir: number; error?: boolean } {
  const d = s[j + 1]
  const peta: Record<string, string> = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', s: ' ', '"': '"', "'": "'", '\\': '\\' }
  if (d !== undefined && d in peta) return { teks: peta[d], akhir: j + 2 }
  if (d === 'u') {
    let k = j + 1
    while (s[k] === 'u') k++
    const hex = s.slice(k, k + 4)
    if (/^[0-9a-fA-F]{4}$/.test(hex)) return { teks: String.fromCharCode(parseInt(hex, 16)), akhir: k + 4 }
    return { teks: '', akhir: k, error: true }
  }
  if (d !== undefined && d >= '0' && d <= '7') {
    let k = j + 1
    const maks = d <= '3' ? 3 : 2
    let oktal = ''
    while (oktal.length < maks && s[k] >= '0' && s[k] <= '7') oktal += s[k++]
    return { teks: String.fromCharCode(parseInt(oktal, 8)), akhir: k }
  }
  return { teks: '', akhir: j + 2, error: true }
}

function lexAngka(s: string, i: number, token: Token[], diag: PengumpulDiagnostik): number {
  const awal = i
  const lapor = (akhir: number) => diag.tambah('angka-terlalu-besar', { awal, akhir }, katalog.angkaTerlaluBesar())
  const lower = s.slice(i, i + 2).toLowerCase()
  if (lower === '0x' || lower === '0b') {
    const hex = lower === '0x'
    let j = i + 2
    const pola = hex ? /[0-9a-fA-F_]/ : /[01_]/
    while (j < s.length && pola.test(s[j])) j++
    let panjang = false
    if (s[j] === 'l' || s[j] === 'L') {
      panjang = true
      j++
    }
    const digit = s.slice(i + 2, panjang ? j - 1 : j).replace(/_/g, '')
    const besar = digit === '' ? 0n : BigInt((hex ? '0x' : '0b') + digit)
    const batas = panjang ? 2n ** 64n : 2n ** 32n
    if (besar >= batas) lapor(j)
    const nilai = panjang ? BigInt.asIntN(64, besar) : BigInt.asIntN(32, besar)
    token.push({ jenis: panjang ? 'long' : 'int', teks: s.slice(i, j), awal, akhir: j, nilai })
    return j
  }
  let j = i
  while (j < s.length && /[0-9_]/.test(s[j])) j++
  let pecahan = false
  if (s[j] === '.' && /[0-9]/.test(s[j + 1] ?? '')) {
    pecahan = true
    j++
    while (j < s.length && /[0-9_]/.test(s[j])) j++
  } else if (s[j] === '.' && !/[A-Za-z_.]/.test(s[j + 1] ?? '')) {
    pecahan = true
    j++
  }
  if ((s[j] === 'e' || s[j] === 'E') && /[0-9+-]/.test(s[j + 1] ?? '')) {
    pecahan = true
    j++
    if (s[j] === '+' || s[j] === '-') j++
    while (j < s.length && /[0-9_]/.test(s[j])) j++
  }
  const akhiran = s[j]?.toLowerCase()
  if (akhiran === 'f' || akhiran === 'd') {
    const teks = s.slice(i, j).replace(/_/g, '')
    j++
    const n = Number(teks)
    token.push({ jenis: akhiran === 'f' ? 'float' : 'double', teks: s.slice(i, j), awal, akhir: j, nilai: akhiran === 'f' ? Math.fround(n) : n })
    return j
  }
  if (pecahan) {
    const teks = s.slice(i, j).replace(/_/g, '')
    token.push({ jenis: 'double', teks: s.slice(i, j), awal, akhir: j, nilai: Number(teks) })
    return j
  }
  const digit = s.slice(i, j).replace(/_/g, '')
  let panjang = false
  if (akhiran === 'l') {
    panjang = true
    j++
  }
  const oktal = digit.length > 1 && digit.startsWith('0')
  if (oktal && /[89]/.test(digit)) {
    lapor(j)
    token.push({ jenis: panjang ? 'long' : 'int', teks: s.slice(i, j), awal, akhir: j, nilai: 0n })
    return j
  }
  const besar = oktal ? BigInt('0o' + digit.slice(1)) : BigInt(digit)
  const tok: Token = { jenis: panjang ? 'long' : 'int', teks: s.slice(i, j), awal, akhir: j, nilai: 0n }
  if (oktal) {
    if (besar >= (panjang ? 2n ** 64n : 2n ** 32n)) lapor(j)
    tok.nilai = panjang ? BigInt.asIntN(64, besar) : BigInt.asIntN(32, besar)
  } else {
    const batas = panjang ? LONG_BATAS : INT_BATAS
    if (besar > batas) lapor(j)
    else if (besar === batas) tok.perluMinus = true
    tok.nilai = besar === batas ? -batas : besar
  }
  token.push(tok)
  return j
}
