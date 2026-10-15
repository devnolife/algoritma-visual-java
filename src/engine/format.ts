import type { Nilai } from './nilai'
import type { NamaPrimitif } from './tipe'

/** Digit desimal (tanpa nol di belakang) dan eksponen: nilai = d1.d2d3… × 10^eksponen. */
interface Desimal {
  negatif: boolean
  digit: string
  eksponen: number
}

function urai(teksEksponensial: string): Desimal {
  const negatif = teksEksponensial.startsWith('-')
  const t = negatif ? teksEksponensial.slice(1) : teksEksponensial
  const [mantisa, exp] = t.split('e')
  let digit = mantisa.replace('.', '')
  digit = digit.replace(/0+$/, '')
  if (digit === '') digit = '0'
  return { negatif, digit, eksponen: Number(exp) }
}

/**
 * Pilih desimal sesuai spesifikasi Double/Float.toString (JDK 19+): yang terpendek;
 * jika panjangnya 1, pertimbangkan juga panjang 2 dan ambil yang paling dekat.
 */
function desimalTerpendek(x: number, float: boolean): Desimal {
  if (!float) {
    const d = urai(x.toExponential())
    if (d.digit.length === 1) {
      const dua = urai(x.toExponential(1))
      if (Number(x.toExponential(1)) === x && dua.digit.length === 2) return dua
    }
    return d
  }
  for (let p = 1; p <= 9; p++) {
    const teks = x.toExponential(p - 1)
    if (Math.fround(Number(teks)) === x) {
      const d = urai(teks)
      if (p === 1) {
        const teksDua = x.toExponential(1)
        const dua = urai(teksDua)
        if (Math.fround(Number(teksDua)) === x && dua.digit.length === 2) return dua
      }
      return d
    }
  }
  return urai(x.toExponential(8))
}

function formatJava(d: Desimal): string {
  const tanda = d.negatif ? '-' : ''
  const { digit, eksponen } = d
  if (eksponen >= -3 && eksponen < 7) {
    if (eksponen >= 0) {
      const bulat = digit.slice(0, eksponen + 1).padEnd(eksponen + 1, '0')
      const pecahan = digit.slice(eksponen + 1) || '0'
      return `${tanda}${bulat}.${pecahan}`
    }
    return `${tanda}0.${'0'.repeat(-eksponen - 1)}${digit}`
  }
  return `${tanda}${digit[0]}.${digit.slice(1) || '0'}E${eksponen}`
}

/** `Double.toString(double)` versi Java. */
export function doubleKeString(x: number): string {
  if (Number.isNaN(x)) return 'NaN'
  if (x === Infinity) return 'Infinity'
  if (x === -Infinity) return '-Infinity'
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0'
  return formatJava(desimalTerpendek(x, false))
}

/** `Float.toString(float)` versi Java. */
export function floatKeString(x: number): string {
  if (Number.isNaN(x)) return 'NaN'
  if (x === Infinity) return 'Infinity'
  if (x === -Infinity) return '-Infinity'
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0'
  return formatJava(desimalTerpendek(x, true))
}

/** Bentuk teks primitif seperti `String.valueOf(...)`. */
export function primitifKeString(v: Nilai, tipe: NamaPrimitif): string {
  switch (tipe) {
    case 'boolean':
      return v ? 'true' : 'false'
    case 'char':
      return String.fromCharCode(v as number)
    case 'double':
      return doubleKeString(v as number)
    case 'float':
      return floatKeString(v as number)
    case 'long':
      return (v as bigint).toString()
    default:
      return String(v)
  }
}

/** Tulis desimal posisi penuh dari representasi terpendek (untuk printf %f). */
function desimalPosisi(d: Desimal): { bulat: string; pecahan: string } {
  const { digit, eksponen } = d
  if (eksponen >= 0) {
    const bulat = digit.slice(0, eksponen + 1).padEnd(eksponen + 1, '0')
    return { bulat, pecahan: digit.slice(eksponen + 1) }
  }
  return { bulat: '0', pecahan: '0'.repeat(-eksponen - 1) + digit }
}

/** Bulatkan string digit desimal ke `presisi` angka di belakang koma dengan HALF_UP. */
export function bulatkanHalfUp(bulat: string, pecahan: string, presisi: number): string {
  if (pecahan.length <= presisi) {
    const p = pecahan.padEnd(presisi, '0')
    return presisi > 0 ? `${bulat}.${p}` : bulat
  }
  const potong = pecahan.slice(0, presisi)
  const naik = pecahan.charCodeAt(presisi) >= 53
  let angka = bulat + potong
  if (naik) {
    const arr = angka.split('')
    let i = arr.length - 1
    while (i >= 0) {
      if (arr[i] === '9') {
        arr[i] = '0'
        i--
      } else {
        arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1)
        break
      }
    }
    angka = (i < 0 ? '1' : '') + arr.join('')
  }
  const panjangBulat = angka.length - presisi
  const b = angka.slice(0, panjangBulat) || '0'
  return presisi > 0 ? `${b}.${angka.slice(panjangBulat)}` : b
}

/** Format `%.<presisi>f` seperti java.util.Formatter (Locale US). */
export function formatF(x: number, presisi: number, float = false): string {
  if (Number.isNaN(x)) return 'NaN'
  if (!Number.isFinite(x)) return x > 0 ? 'Infinity' : '-Infinity'
  if (x === 0) {
    const nol = presisi > 0 ? `0.${'0'.repeat(presisi)}` : '0'
    return Object.is(x, -0) ? `-${nol}` : nol
  }
  const d = desimalTerpendek(x, float)
  const { bulat, pecahan } = desimalPosisi(d)
  return (d.negatif ? '-' : '') + bulatkanHalfUp(bulat, pecahan, presisi)
}

/** Format `%.<presisi>e` seperti java.util.Formatter. */
export function formatE(x: number, presisi: number): string {
  if (Number.isNaN(x)) return 'NaN'
  if (!Number.isFinite(x)) return x > 0 ? 'Infinity' : '-Infinity'
  const d = x === 0 ? { negatif: Object.is(x, -0), digit: '0', eksponen: 0 } : desimalTerpendek(x, false)
  let eksponen = d.eksponen
  let hasil = bulatkanHalfUp(d.digit[0], d.digit.slice(1), presisi)
  if (hasil.startsWith('10')) {
    eksponen++
    hasil = bulatkanHalfUp('1', '0'.repeat(presisi), presisi)
  }
  const tandaE = eksponen < 0 ? '-' : '+'
  const angkaE = String(Math.abs(eksponen)).padStart(2, '0')
  return `${d.negatif ? '-' : ''}${hasil}e${tandaE}${angkaE}`
}

/** Escape untuk menampilkan char/String di visualisasi (bukan output program). */
export function escapeTampil(s: string): string {
  return s.replace(/[\\\n\t\r"]/g, (c) => ({ '\\': '\\\\', '\n': '\\n', '\t': '\\t', '\r': '\\r', '"': '\\"' })[c] ?? c)
}

export function charTampil(kode: number): string {
  const c = String.fromCharCode(kode)
  if (c === "'") return "'\\''"
  if (c === '\n') return "'\\n'"
  if (c === '\t') return "'\\t'"
  if (c === '\r') return "'\\r'"
  if (c === '\\') return "'\\\\'"
  if (kode === 0) return "'\\u0000'"
  return `'${c}'`
}
