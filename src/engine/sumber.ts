/** Rentang posisi di teks sumber (offset karakter, akhir eksklusif). */
export interface Span {
  awal: number
  akhir: number
  /**
   * Titik yang ditunjuk pesan error (seperti `^` di javac), bila berbeda dari `awal`:
   * operator pada ekspresi biner/assignment, `?` pada ternary, titik pada `a.b`, `[` pada `a[i]`.
   */
  fokus?: number
}

export function gabungSpan(a: Span, b: Span): Span {
  return { awal: Math.min(a.awal, b.awal), akhir: Math.max(a.akhir, b.akhir) }
}

/** Teks sumber beserta indeks awal tiap baris, untuk konversi offset ke baris/kolom. */
export class Sumber {
  readonly teks: string
  private readonly awalBaris: number[]

  constructor(teks: string) {
    this.teks = teks
    this.awalBaris = [0]
    for (let i = 0; i < teks.length; i++) {
      const c = teks.charCodeAt(i)
      if (c === 10) this.awalBaris.push(i + 1)
      else if (c === 13) {
        if (teks.charCodeAt(i + 1) === 10) i++
        this.awalBaris.push(i + 1)
      }
    }
  }

  get jumlahBaris(): number {
    return this.awalBaris.length
  }

  /** Nomor baris (mulai 1) untuk sebuah offset. */
  baris(offset: number): number {
    let lo = 0
    let hi = this.awalBaris.length - 1
    while (lo < hi) {
      const tengah = (lo + hi + 1) >> 1
      if (this.awalBaris[tengah] <= offset) lo = tengah
      else hi = tengah - 1
    }
    return lo + 1
  }

  /** Nomor kolom (mulai 1) untuk sebuah offset. */
  kolom(offset: number): number {
    return offset - this.awalBaris[this.baris(offset) - 1] + 1
  }

  awalDariBaris(baris: number): number {
    return this.awalBaris[Math.max(0, Math.min(baris - 1, this.awalBaris.length - 1))]
  }

  teksBaris(baris: number): string {
    const awal = this.awalDariBaris(baris)
    let akhir = baris < this.awalBaris.length ? this.awalBaris[baris] : this.teks.length
    while (akhir > awal && (this.teks[akhir - 1] === '\n' || this.teks[akhir - 1] === '\r')) akhir--
    return this.teks.slice(awal, akhir)
  }

  potong(span: Span): string {
    return this.teks.slice(span.awal, span.akhir)
  }
}
