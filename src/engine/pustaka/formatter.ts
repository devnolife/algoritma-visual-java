import { formatE, formatF, primitifKeString } from '../format'
import { LemparanJava, type Nilai } from '../nilai'
import { teksTipe, type Tipe } from '../tipe'

export interface ArgFormat {
  nilai: Nilai
  tipe: Tipe
}

const NAMA_BOX: Record<string, string> = {
  int: 'java.lang.Integer',
  long: 'java.lang.Long',
  short: 'java.lang.Short',
  byte: 'java.lang.Byte',
  double: 'java.lang.Double',
  float: 'java.lang.Float',
  char: 'java.lang.Character',
  boolean: 'java.lang.Boolean',
  String: 'java.lang.String',
}

function namaKelasArg(t: Tipe): string {
  return NAMA_BOX[teksTipe(t)] ?? teksTipe(t)
}

function kelompokkan(digit: string): string {
  return digit.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function tempel(s: string, lebar: number | undefined, flag: string, nolBoleh: boolean): string {
  if (lebar === undefined || s.length >= lebar) return s
  if (flag.includes('-')) return s.padEnd(lebar, ' ')
  if (flag.includes('0') && nolBoleh) {
    const tanda = /^[+\- (]/.test(s) ? s[0] : ''
    return tanda + s.slice(tanda.length).padStart(lebar - tanda.length, '0')
  }
  return s.padStart(lebar, ' ')
}

function denganTanda(angka: string, negatif: boolean, flag: string): string {
  if (negatif) return flag.includes('(') ? `(${angka})` : `-${angka}`
  if (flag.includes('+')) return `+${angka}`
  if (flag.includes(' ')) return ` ${angka}`
  return angka
}

/**
 * Implementasi java.util.Formatter (Locale US) untuk konversi yang umum dipakai:
 * %d %x %o %f %e %s %c %b %n %%.
 */
export function formatJava(pola: string, arg: ArgFormat[], keString: (a: ArgFormat) => string): string {
  const re = /%(\d+\$)?([-#+ 0,(]*)(\d+)?(\.\d+)?([a-zA-Z%])/g
  let hasil = ''
  let terakhir = 0
  let urut = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(pola))) {
    hasil += pola.slice(terakhir, m.index)
    terakhir = re.lastIndex
    const [penentu, indeks, flag, lebarTeks, presisiTeks, konv] = m
    const lebar = lebarTeks ? Number(lebarTeks) : undefined
    const presisi = presisiTeks ? Number(presisiTeks.slice(1)) : undefined
    if (konv === 'n') {
      hasil += '\n'
      continue
    }
    if (konv === '%') {
      hasil += tempel('%', lebar, flag, false)
      continue
    }
    if (!'dxXofeEsScbB'.includes(konv)) {
      throw new LemparanJava('java.util.UnknownFormatConversionException', `Conversion = '${konv}'`)
    }
    const posisi = indeks ? Number(indeks.slice(0, -1)) - 1 : urut++
    if (posisi >= arg.length) throw new LemparanJava('java.util.MissingFormatArgumentException', `Format specifier '${penentu}'`)
    const a = arg[posisi]
    const t = teksTipe(a.tipe)
    const salahKonversi = () => {
      throw new LemparanJava('java.util.IllegalFormatConversionException', `${konv} != ${namaKelasArg(a.tipe)}`)
    }
    switch (konv) {
      case 'd': {
        if (a.nilai === null) {
          hasil += tempel('null', lebar, flag, false)
          break
        }
        if (!['int', 'long', 'short', 'byte'].includes(t)) salahKonversi()
        const n = BigInt(a.nilai as number | bigint)
        let digit = (n < 0n ? -n : n).toString()
        if (flag.includes(',')) digit = kelompokkan(digit)
        hasil += tempel(denganTanda(digit, n < 0n, flag), lebar, flag, true)
        break
      }
      case 'x':
      case 'X':
      case 'o': {
        if (a.nilai === null) {
          hasil += tempel('null', lebar, flag, false)
          break
        }
        if (!['int', 'long', 'short', 'byte'].includes(t)) salahKonversi()
        const bit = t === 'long' ? 64 : t === 'int' ? 32 : t === 'short' ? 16 : 8
        const n = BigInt.asUintN(bit, BigInt(a.nilai as number | bigint))
        let s = n.toString(konv === 'o' ? 8 : 16)
        if (flag.includes('#')) s = (konv === 'o' ? '0' : '0x') + s
        if (konv === 'X') s = s.toUpperCase()
        hasil += tempel(s, lebar, flag, true)
        break
      }
      case 'f':
      case 'e':
      case 'E': {
        if (a.nilai === null) {
          hasil += tempel('null', lebar, flag, false)
          break
        }
        if (t !== 'double' && t !== 'float') salahKonversi()
        const x = a.nilai as number
        if (!Number.isFinite(x)) {
          const s = Number.isNaN(x) ? 'NaN' : x > 0 ? (flag.includes('+') ? '+Infinity' : 'Infinity') : flag.includes('(') ? '(Infinity)' : '-Infinity'
          hasil += tempel(s, lebar, flag, false)
          break
        }
        const p = presisi ?? 6
        // java.util.Formatter mengubah float menjadi double dulu, jadi (float) 0.1 → 0.10000000149011612.
        let s = konv === 'f' ? formatF(Math.abs(x), p) : formatE(Math.abs(x), p)
        if (konv === 'E') s = s.toUpperCase()
        if (konv === 'f' && flag.includes(',')) {
          const [b, pecahan] = s.split('.')
          s = kelompokkan(b) + (pecahan !== undefined ? '.' + pecahan : '')
        }
        const negatif = x < 0 || Object.is(x, -0)
        hasil += tempel(denganTanda(s, negatif, flag), lebar, flag, true)
        break
      }
      case 's':
      case 'S': {
        let s = keString(a)
        if (presisi !== undefined) s = s.slice(0, presisi)
        if (konv === 'S') s = s.toUpperCase()
        hasil += tempel(s, lebar, flag, false)
        break
      }
      case 'c': {
        if (a.nilai === null) {
          hasil += tempel('null', lebar, flag, false)
          break
        }
        if (!['char', 'int', 'short', 'byte'].includes(t)) salahKonversi()
        hasil += tempel(String.fromCodePoint(a.nilai as number), lebar, flag, false)
        break
      }
      case 'b':
      case 'B': {
        let s = a.nilai === null ? 'false' : t === 'boolean' ? primitifKeString(a.nilai, 'boolean') : 'true'
        if (konv === 'B') s = s.toUpperCase()
        hasil += tempel(s, lebar, flag, false)
        break
      }
    }
  }
  return hasil + pola.slice(terakhir)
}
