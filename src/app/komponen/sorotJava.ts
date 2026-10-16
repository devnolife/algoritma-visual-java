/**
 * Pewarnaan sintaks Java ringan untuk cuplikan kode statis (Beranda), tanpa CodeMirror.
 * Kelas warnanya sama dengan editor: kata kunci, angka, komentar, pemanggilan method, dan warna tipe Java.
 */

export type JenisToken = 'kunci' | 'angka' | 'teks' | 'komentar' | 'fungsi' | 'int' | 'pecahan' | 'char' | 'boolean' | 'string' | 'biasa'

export interface Token {
  teks: string
  jenis: JenisToken
}

const KATA_KUNCI = new Set([
  'public', 'private', 'protected', 'class', 'static', 'final', 'void', 'new', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'default', 'break', 'continue', 'import', 'try', 'catch', 'finally', 'throw', 'throws', 'this',
  'extends', 'implements',
])

/** Sama dengan editor: boolean dan null berwarna seperti literal angka. */
const LITERAL = new Set(['true', 'false', 'null'])

const TIPE: Record<string, JenisToken> = {
  int: 'int', long: 'int', short: 'int', byte: 'int',
  double: 'pecahan', float: 'pecahan',
  char: 'char',
  boolean: 'boolean',
  String: 'string',
}

const POLA = /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)|('(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?[fFdDlL]?\b)|([A-Za-z_$][\w$]*)|(\s+|.)/g

/** Pecah satu baris kode Java menjadi token berwarna. Spasi dan tanda baca menjadi token `biasa`. */
export function tokenJava(baris: string): Token[] {
  const hasil: Token[] = []
  const tambah = (teks: string, jenis: JenisToken) => {
    const akhir = hasil[hasil.length - 1]
    if (akhir && akhir.jenis === jenis && jenis === 'biasa') akhir.teks += teks
    else hasil.push({ teks, jenis })
  }
  for (const m of baris.matchAll(POLA)) {
    const [teks, komentar, string, karakter, angka, kata] = m
    if (komentar !== undefined) tambah(teks, 'komentar')
    else if (string !== undefined) tambah(teks, 'teks')
    else if (karakter !== undefined) tambah(teks, 'teks')
    else if (angka !== undefined) tambah(teks, 'angka')
    else if (kata !== undefined) {
      const sisa = baris.slice((m.index ?? 0) + teks.length)
      if (TIPE[kata]) tambah(teks, TIPE[kata])
      else if (LITERAL.has(kata)) tambah(teks, 'angka')
      else if (KATA_KUNCI.has(kata)) tambah(teks, 'kunci')
      else if (/^\s*\(/.test(sisa)) tambah(teks, 'fungsi')
      else tambah(teks, 'biasa')
    } else tambah(teks, 'biasa')
  }
  return hasil
}
