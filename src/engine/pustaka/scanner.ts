import { LemparanJava } from '../nilai'

const SPASI = /[\s\u001c-\u001f]/

/** Simulasi java.util.Scanner(System.in) di atas teks input yang sudah diketahui. */
export class PemindaiInput {
  constructor(readonly teks: string) {}

  private lewatiSpasi(p: number): number {
    while (p < this.teks.length && SPASI.test(this.teks[p])) p++
    return p
  }

  /** Token berikutnya dari posisi `p` tanpa memajukan posisi. */
  intipToken(p: number): { token: string; akhir: number } | null {
    const awal = this.lewatiSpasi(p)
    if (awal >= this.teks.length) return null
    let akhir = awal
    while (akhir < this.teks.length && !SPASI.test(this.teks[akhir])) akhir++
    return { token: this.teks.slice(awal, akhir), akhir }
  }

  next(p: number): { nilai: string; posisi: number } {
    const t = this.intipToken(p)
    if (!t) throw new LemparanJava('java.util.NoSuchElementException')
    return { nilai: t.token, posisi: t.akhir }
  }

  private intBerikut(p: number, bit: 8 | 16 | 32 | 64): { nilai: bigint; posisi: number } {
    const t = this.intipToken(p)
    if (!t) throw new LemparanJava('java.util.NoSuchElementException')
    const bersih = t.token.replace(/(?<=\d),(?=\d{3})/g, '')
    if (!/^[+-]?\d+$/.test(bersih)) throw new LemparanJava('java.util.InputMismatchException')
    const n = BigInt(bersih)
    const batas = 2n ** BigInt(bit - 1)
    if (n < -batas || n >= batas) {
      throw new LemparanJava('java.util.InputMismatchException', `For input string: "${t.token}"`)
    }
    return { nilai: n, posisi: t.akhir }
  }

  nextInt(p: number): { nilai: number; posisi: number } {
    const h = this.intBerikut(p, 32)
    return { nilai: Number(h.nilai), posisi: h.posisi }
  }

  nextShort(p: number): { nilai: number; posisi: number } {
    const h = this.intBerikut(p, 16)
    return { nilai: Number(h.nilai), posisi: h.posisi }
  }

  nextByte(p: number): { nilai: number; posisi: number } {
    const h = this.intBerikut(p, 8)
    return { nilai: Number(h.nilai), posisi: h.posisi }
  }

  nextLong(p: number): { nilai: bigint; posisi: number } {
    return this.intBerikut(p, 64)
  }

  nextDouble(p: number): { nilai: number; posisi: number } {
    const t = this.intipToken(p)
    if (!t) throw new LemparanJava('java.util.NoSuchElementException')
    const bersih = t.token.replace(/(?<=\d),(?=\d{3})/g, '')
    if (!/^[+-]?(NaN|Infinity|(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)$/.test(bersih)) {
      throw new LemparanJava('java.util.InputMismatchException')
    }
    return { nilai: Number(bersih), posisi: t.akhir }
  }

  nextBoolean(p: number): { nilai: boolean; posisi: number } {
    const t = this.intipToken(p)
    if (!t) throw new LemparanJava('java.util.NoSuchElementException')
    const k = t.token.toLowerCase()
    if (k !== 'true' && k !== 'false') throw new LemparanJava('java.util.InputMismatchException')
    return { nilai: k === 'true', posisi: t.akhir }
  }

  nextLine(p: number): { nilai: string; posisi: number } {
    if (p >= this.teks.length) throw new LemparanJava('java.util.NoSuchElementException', 'No line found')
    let akhir = p
    while (akhir < this.teks.length && this.teks[akhir] !== '\n' && this.teks[akhir] !== '\r') akhir++
    let lanjut = akhir
    if (this.teks[lanjut] === '\r' && this.teks[lanjut + 1] === '\n') lanjut += 2
    else if (lanjut < this.teks.length) lanjut += 1
    return { nilai: this.teks.slice(p, akhir), posisi: lanjut }
  }

  hasNext(p: number): boolean {
    return this.intipToken(p) !== null
  }

  hasNextInt(p: number): boolean {
    try {
      this.nextInt(p)
      return true
    } catch {
      return false
    }
  }

  hasNextDouble(p: number): boolean {
    try {
      this.nextDouble(p)
      return true
    } catch {
      return false
    }
  }

  hasNextLine(p: number): boolean {
    return p < this.teks.length
  }
}
