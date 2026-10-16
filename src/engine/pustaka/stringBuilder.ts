/**
 * Model StringBuilder (java.lang.AbstractStringBuilder) dengan pesan exception persis JDK 21
 * (lihat tests/korpus-fase2/CATATAN.md §3). Fungsi murni: menerima isi lama, mengembalikan isi baru.
 * Konversi argumen ke teks (append(int), append(Object) → toString, dst.) dilakukan interpreter.
 */
import { LemparanJava } from '../nilai'

const sioobe = (pesan: string) => new LemparanJava('java.lang.StringIndexOutOfBoundsException', pesan)

/** checkIndex: `Index 10 out of bounds for length 5`. */
export function cekIndeksPembangun(i: number, n: number): void {
  if (i < 0 || i >= n) throw sioobe(`Index ${i} out of bounds for length ${n}`)
}

/** checkRangeSIOOBE: `Range [3, 1) out of bounds for length 5`. */
function cekRentang(awal: number, akhir: number, n: number): void {
  if (awal < 0 || awal > akhir || akhir > n) throw sioobe(`Range [${awal}, ${akhir}) out of bounds for length ${n}`)
}

export function sisip(s: string, offset: number, teks: string): string {
  // checkOffset: rentang [offset, length) harus sah.
  cekRentang(offset, s.length, s.length)
  return s.slice(0, offset) + teks + s.slice(offset)
}

export function hapus(s: string, awal: number, akhir: number): string {
  const ujung = Math.min(akhir, s.length)
  cekRentang(awal, ujung, s.length)
  return s.slice(0, awal) + s.slice(ujung)
}

export function hapusKarakter(s: string, i: number): string {
  cekIndeksPembangun(i, s.length)
  return s.slice(0, i) + s.slice(i + 1)
}

export function ganti(s: string, awal: number, akhir: number, teks: string): string {
  const ujung = Math.min(akhir, s.length)
  cekRentang(awal, ujung, s.length)
  return s.slice(0, awal) + teks + s.slice(ujung)
}

/** reverse(): pasangan surrogate tetap utuh (setara membalik code point). */
export function balik(s: string): string {
  return Array.from(s).reverse().join('')
}

export function aturKarakter(s: string, i: number, c: number): string {
  cekIndeksPembangun(i, s.length)
  return s.slice(0, i) + String.fromCharCode(c) + s.slice(i + 1)
}

export function karakterDi(s: string, i: number): number {
  cekIndeksPembangun(i, s.length)
  return s.charCodeAt(i)
}

export function potong(s: string, awal: number, akhir = s.length): string {
  cekRentang(awal, akhir, s.length)
  return s.slice(awal, akhir)
}

export function indeksDari(s: string, cari: string, dari = 0): number {
  return s.indexOf(cari, Math.max(0, dari))
}

export function indeksTerakhir(s: string, cari: string, dari = s.length): number {
  if (dari < 0) return -1
  return s.lastIndexOf(cari, dari)
}

/** setLength(n): dipotong atau ditambah karakter '\u0000'. */
export function aturPanjang(s: string, n: number): string {
  if (n < 0) throw sioobe(`String index out of range: ${n}`)
  return n <= s.length ? s.slice(0, n) : s + '\u0000'.repeat(n - s.length)
}

/** compareTo: perbandingan leksikografis karakter demi karakter (sama dengan String.compareTo). */
export function bandingkanTeks(a: string, b: string): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const d = a.charCodeAt(i) - b.charCodeAt(i)
    if (d !== 0) return d
  }
  return a.length - b.length
}
