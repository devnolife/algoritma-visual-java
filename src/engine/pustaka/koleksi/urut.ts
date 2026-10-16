import type { Nilai } from '../../nilai'
import { aioobe, iae, npe, pesanIndeks, salin, type HeapKoleksi, type OperasiElemen } from './heap'

/*
 * Pengurutan objek JDK 21: java.util.TimSort (dengan Comparator) dan java.util.ComparableTimSort
 * (urutan alami). Ditulis ulang dari perilaku yang terdokumentasi lalu diverifikasi terhadap JDK asli
 * (tests/engine/koleksi/fixture/urut.json): urutan & argumen setiap compare/compareTo, hasil akhir,
 * serta galat "Comparison method violates its general contract!" untuk pembanding yang tidak konsisten.
 *
 * Array target hanya diubah lewat HeapKoleksi (tulisElemen/salinArray). Array sementara `tmp` untuk
 * penggabungan hidup di JS selama satu panggilan, dengan panjang yang sama seperti di JDK.
 */

const MIN_MERGE = 32
const MIN_GALLOP = 7
const INITIAL_TMP_STORAGE_LENGTH = 256

/** Arrays.rangeCheck. */
function cekRentang(panjang: number, dari: number, sampai: number): void {
  if (dari > sampai) throw iae(`fromIndex(${dari}) > toIndex(${sampai})`)
  if (dari < 0) throw aioobe(`Array index out of range: ${dari}`)
  if (sampai > panjang) throw aioobe(`Array index out of range: ${sampai}`)
}

/**
 * Arrays.sort(a, dari, sampai, c) untuk array referensi: ComparableTimSort bila `pembanding === null`,
 * TimSort bila tidak. Stabil; galat dari compare/compareTo diteruskan apa adanya.
 */
export function urutkan(
  h: HeapKoleksi,
  ops: OperasiElemen,
  a: number,
  dari: number,
  sampai: number,
  pembanding: number | null,
): void {
  cekRentang(h.panjangArray(a), dari, sampai)
  new Pengurut(h, ops, a, pembanding).urutkan(dari, sampai)
}

/** Panjang run minimum: bit atas n (n < 32 setelah digeser) + 1 bila ada bit 1 yang terbuang. */
function minRunLength(n: number): number {
  let r = 0
  while (n >= MIN_MERGE) {
    r |= n & 1
    n >>= 1
  }
  return n + r
}

type Pembaca = (i: number) => Nilai

class Pengurut {
  private tmp: Nilai[] = []
  private tmpLen = 0
  private minGallop = MIN_GALLOP
  private readonly runBase: number[] = []
  private readonly runLen: number[] = []
  private stackSize = 0
  private readonly ambilA: Pembaca
  private readonly ambilTmp: Pembaca

  constructor(
    private readonly h: HeapKoleksi,
    private readonly ops: OperasiElemen,
    private readonly a: number,
    private readonly c: number | null,
  ) {
    this.ambilA = (i) => h.bacaElemen(a, i)
    this.ambilTmp = (i) => {
      if (i < 0 || i >= this.tmpLen) throw aioobe(pesanIndeks(i, this.tmpLen))
      return this.tmp[i]
    }
  }

  /**
   * c.compare(x, y), atau ((Comparable) x).compareTo(y). `penerima` = ekspresi penerima di kode JDK,
   * untuk pesan helpful NPE bila x null (mis. "a[runHi]", "pivot").
   */
  private banding(x: Nilai, y: Nilai, penerima: string): number {
    if (this.c !== null) return this.ops.compare(this.c, x, y)
    if (x === null) {
      throw npe(`Cannot invoke "java.lang.Comparable.compareTo(Object)" because "${penerima}" is null`)
    }
    return this.ops.compareTo(x as number, y)
  }

  private taruh(i: number, v: Nilai): void {
    this.h.tulisElemen(this.a, i, v)
  }

  /** System.arraycopy(tmp, dari, a, ke, n): tmp hidup di JS, jadi ditulis per elemen. */
  private tmpKeA(dari: number, ke: number, n: number): void {
    for (let k = 0; k < n; k++) this.taruh(ke + k, this.ambilTmp(dari + k))
  }

  urutkan(lo: number, hi: number): void {
    let sisa = hi - lo
    if (sisa < 2) return

    // Array kecil: "mini-TimSort" tanpa penggabungan.
    if (sisa < MIN_MERGE) {
      const panjangRunAwal = this.hitungRunDanNaikkan(lo, hi)
      this.binarySort(lo, hi, lo + panjangRunAwal)
      return
    }

    // Konstruktor TimSort: ukuran tmp bergantung pada panjang array penuh, bukan rentang.
    const len = this.h.panjangArray(this.a)
    this.tmpLen = len < 2 * INITIAL_TMP_STORAGE_LENGTH ? len >>> 1 : INITIAL_TMP_STORAGE_LENGTH
    this.tmp = new Array<Nilai>(this.tmpLen).fill(null)

    const minRun = minRunLength(sisa)
    do {
      let runLen = this.hitungRunDanNaikkan(lo, hi)
      if (runLen < minRun) {
        const paksa = sisa <= minRun ? sisa : minRun
        this.binarySort(lo, lo + paksa, lo + runLen)
        runLen = paksa
      }
      this.pushRun(lo, runLen)
      this.mergeCollapse()
      lo += runLen
      sisa -= runLen
    } while (sisa !== 0)
    this.mergeForceCollapse()
  }

  /** Insertion sort dengan pencarian biner; a[lo..start) sudah terurut. */
  private binarySort(lo: number, hi: number, start: number): void {
    if (start === lo) start++
    for (; start < hi; start++) {
      const pivot = this.ambilA(start)
      let left = lo
      let right = start
      while (left < right) {
        const mid = (left + right) >>> 1
        if (this.banding(pivot, this.ambilA(mid), 'pivot') < 0) right = mid
        else left = mid + 1
      }
      const n = start - left
      if (n === 1 || n === 2) {
        if (n === 2) this.taruh(left + 2, this.ambilA(left + 1))
        this.taruh(left + 1, this.ambilA(left))
      } else {
        salin(this.h, this.a, left, this.a, left + 1, n)
      }
      this.taruh(left, pivot)
    }
  }

  /** countRunAndMakeAscending: panjang run di lo; run menurun tegas dibalik. */
  private hitungRunDanNaikkan(lo: number, hi: number): number {
    let runHi = lo + 1
    if (runHi === hi) return 1
    if (this.banding(this.ambilA(runHi++), this.ambilA(lo), 'a[runHi]') < 0) {
      while (runHi < hi && this.banding(this.ambilA(runHi), this.ambilA(runHi - 1), 'a[runHi]') < 0) runHi++
      this.balikRentang(lo, runHi)
    } else {
      while (runHi < hi && this.banding(this.ambilA(runHi), this.ambilA(runHi - 1), 'a[runHi]') >= 0) runHi++
    }
    return runHi - lo
  }

  private balikRentang(lo: number, hi: number): void {
    hi--
    while (lo < hi) {
      const t = this.ambilA(lo)
      this.taruh(lo++, this.ambilA(hi))
      this.taruh(hi--, t)
    }
  }

  private pushRun(base: number, len: number): void {
    this.runBase[this.stackSize] = base
    this.runLen[this.stackSize] = len
    this.stackSize++
  }

  /** Gabungkan run bertetangga sampai invarian tumpukan run kembali berlaku (versi yang sudah diperbaiki). */
  private mergeCollapse(): void {
    const rl = this.runLen
    while (this.stackSize > 1) {
      let n = this.stackSize - 2
      if ((n > 0 && rl[n - 1] <= rl[n] + rl[n + 1]) || (n > 1 && rl[n - 2] <= rl[n] + rl[n - 1])) {
        if (rl[n - 1] < rl[n + 1]) n--
      } else if (n < 0 || rl[n] > rl[n + 1]) {
        break
      }
      this.mergeAt(n)
    }
  }

  private mergeForceCollapse(): void {
    while (this.stackSize > 1) {
      let n = this.stackSize - 2
      if (n > 0 && this.runLen[n - 1] < this.runLen[n + 1]) n--
      this.mergeAt(n)
    }
  }

  private mergeAt(i: number): void {
    let base1 = this.runBase[i]
    let len1 = this.runLen[i]
    const base2 = this.runBase[i + 1]
    let len2 = this.runLen[i + 1]

    this.runLen[i] = len1 + len2
    if (i === this.stackSize - 3) {
      this.runBase[i + 1] = this.runBase[i + 2]
      this.runLen[i + 1] = this.runLen[i + 2]
    }
    this.stackSize--

    // Elemen awal run1 yang sudah di tempatnya dilewati.
    const k = this.gallopRight(this.ambilA(base2), this.ambilA, base1, len1, 0)
    base1 += k
    len1 -= k
    if (len1 === 0) return

    // Elemen akhir run2 yang sudah di tempatnya dilewati.
    len2 = this.gallopLeft(this.ambilA(base1 + len1 - 1), this.ambilA, base2, len2, len2 - 1)
    if (len2 === 0) return

    if (len1 <= len2) this.mergeLo(base1, len1, base2, len2)
    else this.mergeHi(base1, len1, base2, len2)
  }

  /** Posisi paling kiri untuk menyisipkan key (sebelum elemen yang sama). */
  private gallopLeft(key: Nilai, baca: Pembaca, base: number, len: number, hint: number): number {
    let lastOfs = 0
    let ofs = 1
    if (this.banding(key, baca(base + hint), 'key') > 0) {
      const maxOfs = len - hint
      while (ofs < maxOfs && this.banding(key, baca(base + hint + ofs), 'key') > 0) {
        lastOfs = ofs
        ofs = ((ofs << 1) + 1) | 0
        if (ofs <= 0) ofs = maxOfs
      }
      if (ofs > maxOfs) ofs = maxOfs
      lastOfs += hint
      ofs += hint
    } else {
      const maxOfs = hint + 1
      while (ofs < maxOfs && this.banding(key, baca(base + hint - ofs), 'key') <= 0) {
        lastOfs = ofs
        ofs = ((ofs << 1) + 1) | 0
        if (ofs <= 0) ofs = maxOfs
      }
      if (ofs > maxOfs) ofs = maxOfs
      const t = lastOfs
      lastOfs = hint - ofs
      ofs = hint - t
    }

    lastOfs++
    while (lastOfs < ofs) {
      const m = lastOfs + ((ofs - lastOfs) >>> 1)
      if (this.banding(key, baca(base + m), 'key') > 0) lastOfs = m + 1
      else ofs = m
    }
    return ofs
  }

  /** Posisi paling kanan untuk menyisipkan key (sesudah elemen yang sama). */
  private gallopRight(key: Nilai, baca: Pembaca, base: number, len: number, hint: number): number {
    let ofs = 1
    let lastOfs = 0
    if (this.banding(key, baca(base + hint), 'key') < 0) {
      const maxOfs = hint + 1
      while (ofs < maxOfs && this.banding(key, baca(base + hint - ofs), 'key') < 0) {
        lastOfs = ofs
        ofs = ((ofs << 1) + 1) | 0
        if (ofs <= 0) ofs = maxOfs
      }
      if (ofs > maxOfs) ofs = maxOfs
      const t = lastOfs
      lastOfs = hint - ofs
      ofs = hint - t
    } else {
      const maxOfs = len - hint
      while (ofs < maxOfs && this.banding(key, baca(base + hint + ofs), 'key') >= 0) {
        lastOfs = ofs
        ofs = ((ofs << 1) + 1) | 0
        if (ofs <= 0) ofs = maxOfs
      }
      if (ofs > maxOfs) ofs = maxOfs
      lastOfs += hint
      ofs += hint
    }

    lastOfs++
    while (lastOfs < ofs) {
      const m = lastOfs + ((ofs - lastOfs) >>> 1)
      if (this.banding(key, baca(base + m), 'key') < 0) ofs = m
      else lastOfs = m + 1
    }
    return ofs
  }

  /** Penggabungan stabil dari kiri; run1 (yang lebih pendek) disalin ke tmp. */
  private mergeLo(base1: number, len1: number, base2: number, len2: number): void {
    this.siapkanTmp(len1)
    let cursor1 = 0
    let cursor2 = base2
    let dest = base1
    for (let k = 0; k < len1; k++) this.tmp[k] = this.ambilA(base1 + k)

    this.taruh(dest++, this.ambilA(cursor2++))
    if (--len2 === 0) {
      this.tmpKeA(cursor1, dest, len1)
      return
    }
    if (len1 === 1) {
      salin(this.h, this.a, cursor2, this.a, dest, len2)
      this.taruh(dest + len2, this.ambilTmp(cursor1))
      return
    }

    let minGallop = this.minGallop
    outer: while (true) {
      let count1 = 0
      let count2 = 0

      do {
        if (this.banding(this.ambilA(cursor2), this.ambilTmp(cursor1), 'a[cursor2]') < 0) {
          this.taruh(dest++, this.ambilA(cursor2++))
          count2++
          count1 = 0
          if (--len2 === 0) break outer
        } else {
          this.taruh(dest++, this.ambilTmp(cursor1++))
          count1++
          count2 = 0
          if (--len1 === 1) break outer
        }
      } while ((count1 | count2) < minGallop)

      do {
        count1 = this.gallopRight(this.ambilA(cursor2), this.ambilTmp, cursor1, len1, 0)
        if (count1 !== 0) {
          this.tmpKeA(cursor1, dest, count1)
          dest += count1
          cursor1 += count1
          len1 -= count1
          if (len1 <= 1) break outer
        }
        this.taruh(dest++, this.ambilA(cursor2++))
        if (--len2 === 0) break outer

        count2 = this.gallopLeft(this.ambilTmp(cursor1), this.ambilA, cursor2, len2, 0)
        if (count2 !== 0) {
          salin(this.h, this.a, cursor2, this.a, dest, count2)
          dest += count2
          cursor2 += count2
          len2 -= count2
          if (len2 === 0) break outer
        }
        this.taruh(dest++, this.ambilTmp(cursor1++))
        if (--len1 === 1) break outer
        minGallop--
      } while (count1 >= MIN_GALLOP || count2 >= MIN_GALLOP)
      if (minGallop < 0) minGallop = 0
      minGallop += 2
    }
    this.minGallop = minGallop < 1 ? 1 : minGallop

    if (len1 === 1) {
      salin(this.h, this.a, cursor2, this.a, dest, len2)
      this.taruh(dest + len2, this.ambilTmp(cursor1))
    } else if (len1 === 0) {
      throw iae('Comparison method violates its general contract!')
    } else {
      this.tmpKeA(cursor1, dest, len1)
    }
  }

  /** Penggabungan stabil dari kanan; run2 (yang lebih pendek) disalin ke tmp. */
  private mergeHi(base1: number, len1: number, base2: number, len2: number): void {
    this.siapkanTmp(len2)
    const tmpBase = 0
    for (let k = 0; k < len2; k++) this.tmp[tmpBase + k] = this.ambilA(base2 + k)

    let cursor1 = base1 + len1 - 1
    let cursor2 = tmpBase + len2 - 1
    let dest = base2 + len2 - 1

    this.taruh(dest--, this.ambilA(cursor1--))
    if (--len1 === 0) {
      this.tmpKeA(tmpBase, dest - (len2 - 1), len2)
      return
    }
    if (len2 === 1) {
      dest -= len1
      cursor1 -= len1
      salin(this.h, this.a, cursor1 + 1, this.a, dest + 1, len1)
      this.taruh(dest, this.ambilTmp(cursor2))
      return
    }

    let minGallop = this.minGallop
    outer: while (true) {
      let count1 = 0
      let count2 = 0

      do {
        if (this.banding(this.ambilTmp(cursor2), this.ambilA(cursor1), 'tmp[cursor2]') < 0) {
          this.taruh(dest--, this.ambilA(cursor1--))
          count1++
          count2 = 0
          if (--len1 === 0) break outer
        } else {
          this.taruh(dest--, this.ambilTmp(cursor2--))
          count2++
          count1 = 0
          if (--len2 === 1) break outer
        }
      } while ((count1 | count2) < minGallop)

      do {
        count1 = len1 - this.gallopRight(this.ambilTmp(cursor2), this.ambilA, base1, len1, len1 - 1)
        if (count1 !== 0) {
          dest -= count1
          cursor1 -= count1
          len1 -= count1
          salin(this.h, this.a, cursor1 + 1, this.a, dest + 1, count1)
          if (len1 === 0) break outer
        }
        this.taruh(dest--, this.ambilTmp(cursor2--))
        if (--len2 === 1) break outer

        count2 = len2 - this.gallopLeft(this.ambilA(cursor1), this.ambilTmp, tmpBase, len2, len2 - 1)
        if (count2 !== 0) {
          dest -= count2
          cursor2 -= count2
          len2 -= count2
          this.tmpKeA(cursor2 + 1, dest + 1, count2)
          if (len2 <= 1) break outer
        }
        this.taruh(dest--, this.ambilA(cursor1--))
        if (--len1 === 0) break outer
        minGallop--
      } while (count1 >= MIN_GALLOP || count2 >= MIN_GALLOP)
      if (minGallop < 0) minGallop = 0
      minGallop += 2
    }
    this.minGallop = minGallop < 1 ? 1 : minGallop

    if (len2 === 1) {
      dest -= len1
      cursor1 -= len1
      salin(this.h, this.a, cursor1 + 1, this.a, dest + 1, len1)
      this.taruh(dest, this.ambilTmp(cursor2))
    } else if (len2 === 0) {
      throw iae('Comparison method violates its general contract!')
    } else {
      this.tmpKeA(tmpBase, dest - (len2 - 1), len2)
    }
  }

  /** ensureCapacity: tmp diganti pangkat dua terkecil > minCapacity, dibatasi setengah panjang array. */
  private siapkanTmp(minCapacity: number): void {
    if (this.tmpLen < minCapacity) {
      let ukuranBaru = ((-1 >>> Math.clz32(minCapacity)) + 1) | 0
      if (ukuranBaru < 0) ukuranBaru = minCapacity
      else ukuranBaru = Math.min(ukuranBaru, this.h.panjangArray(this.a) >>> 1)
      this.tmp = new Array<Nilai>(ukuranBaru).fill(null)
      this.tmpLen = ukuranBaru
    }
  }
}
