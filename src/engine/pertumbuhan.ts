/**
 * Analisis pertumbuhan (kompleksitas) dari hasil pengukuran program pada beberapa ukuran n.
 * Modul ini murni (tanpa mesin) agar bisa dipakai UI, pemeriksa tantangan, dan validator konten.
 */

export const KELAS_KOMPLEKSITAS = ['1', 'log n', 'n', 'n log n', 'n^2', 'n^3', '2^n'] as const
export type KelasKompleksitas = (typeof KELAS_KOMPLEKSITAS)[number]

export interface KonfigPertumbuhan {
  variabel: string
  nilai: number[]
  /** `langkah`, `method:<nama>`, atau nama variabel penghitung (lokal main / field static). */
  ukur: string
  seri: { nama: string; ganti: Record<string, number | boolean | string> }[]
  acuan?: KelasKompleksitas[]
}

export type StatusTitik = 'ok' | 'batas' | 'exception' | 'waktu' | 'galat'

export interface TitikPertumbuhan {
  n: number
  /** null bila program tidak selesai normal pada ukuran ini. */
  nilai: number | null
  status: StatusTitik
  pesan?: string
}

export interface SeriPertumbuhan {
  nama: string
  titik: TitikPertumbuhan[]
  kelas?: KelasKompleksitas
}

export interface HasilPertumbuhan {
  seri: SeriPertumbuhan[]
  /** Pesan bila pengukuran tidak bisa dilakukan sama sekali (mis. variabel n dihapus). */
  galat?: string
}

const LABEL: Record<KelasKompleksitas, string> = {
  '1': 'O(1)',
  'log n': 'O(log n)',
  n: 'O(n)',
  'n log n': 'O(n log n)',
  'n^2': 'O(n²)',
  'n^3': 'O(n³)',
  '2^n': 'O(2ⁿ)',
}

export const labelKelas = (k: KelasKompleksitas): string => LABEL[k]

/** Bentuk singkat tanpa O(…), untuk teks seperti "paling mirip n²". */
export const namaKelas = (k: KelasKompleksitas): string => LABEL[k].slice(2, -1)

export const urutanKelas = (k: KelasKompleksitas): number => KELAS_KOMPLEKSITAS.indexOf(k)

const log2 = (n: number) => Math.log2(Math.max(2, n))

/** f(n) untuk menggambar kurva acuan. */
export function fungsiKelas(k: KelasKompleksitas, n: number): number {
  switch (k) {
    case '1':
      return 1
    case 'log n':
      return log2(n)
    case 'n':
      return n
    case 'n log n':
      return n * log2(n)
    case 'n^2':
      return n * n
    case 'n^3':
      return n * n * n
    case '2^n':
      return 2 ** n
  }
}

/** ln f(n), dihitung tanpa overflow (2ⁿ untuk n besar). */
function lnFungsi(k: KelasKompleksitas, n: number): number {
  const ln = Math.log(Math.max(1, n))
  switch (k) {
    case '1':
      return 0
    case 'log n':
      return Math.log(log2(n))
    case 'n':
      return ln
    case 'n log n':
      return ln + Math.log(log2(n))
    case 'n^2':
      return 2 * ln
    case 'n^3':
      return 3 * ln
    case '2^n':
      return n * Math.LN2
  }
}

export interface Klasifikasi {
  kelas: KelasKompleksitas
  /** Interval terakhir yang dipakai untuk kalimat kesimpulan. */
  dari: { n: number; nilai: number }
  ke: { n: number; nilai: number }
}

/**
 * Pilih kelas yang "kemiringan" log-log-nya paling cocok dengan data pada dua interval terbesar.
 * Kemiringan lokal mengabaikan konstanta pengali, dan suku orde rendah mengecil pada n besar.
 */
export function klasifikasi(titik: { n: number; nilai: number | null }[]): Klasifikasi | null {
  const t = titik
    .filter((p): p is { n: number; nilai: number } => p.nilai !== null && p.nilai > 0 && p.n > 0)
    .sort((a, b) => a.n - b.n)
    .filter((p, i, arr) => i === 0 || p.n > arr[i - 1].n)
  if (t.length < 2) return null
  const interval: [{ n: number; nilai: number }, { n: number; nilai: number }][] = []
  for (let i = Math.max(1, t.length - 2); i < t.length; i++) interval.push([t[i - 1], t[i]])
  let terbaik: KelasKompleksitas = '1'
  let skorTerbaik = Infinity
  for (const k of KELAS_KOMPLEKSITAS) {
    let skor = 0
    interval.forEach(([a, b], i) => {
      const lnN = Math.log(b.n) - Math.log(a.n)
      const kemiringan = (Math.log(b.nilai) - Math.log(a.nilai)) / lnN
      const kemiringanF = (lnFungsi(k, b.n) - lnFungsi(k, a.n)) / lnN
      // Interval terakhir (n terbesar) paling menentukan.
      skor += Math.abs(kemiringan - kemiringanF) * (i === interval.length - 1 ? 2 : 1)
    })
    if (skor < skorTerbaik - 1e-9) {
      skorTerbaik = skor
      terbaik = k
    }
  }
  const [dari, ke] = interval[interval.length - 1]
  return { kelas: terbaik, dari, ke }
}

const angka = (x: number) => (Number.isInteger(x) ? x.toLocaleString('id-ID') : x.toLocaleString('id-ID', { maximumFractionDigits: 1 }))

/** Nama besaran yang diukur, untuk kalimat penjelasan. */
export function namaUkuran(ukur: string): string {
  if (ukur === 'langkah') return 'jumlah langkah'
  if (ukur.startsWith('method:')) return `jumlah langkah di dalam \`${ukur.slice(7)}\``
  return `nilai \`${ukur}\``
}

/** Kalimat kesimpulan, mis. "Saat n naik dari 64 ke 128 (2×), jumlah langkah naik 3,9×. Pola ini paling mirip **n²**." */
export function kalimatKesimpulan(k: Klasifikasi, ukur: string): string {
  const faktorN = k.ke.n / k.dari.n
  const faktor = k.ke.nilai / k.dari.nilai
  return (
    `Saat n naik dari ${angka(k.dari.n)} ke ${angka(k.ke.n)} (${angka(faktorN)}×), ${namaUkuran(ukur)} ` +
    `${faktor >= 1.005 ? `naik ${angka(faktor)}×` : 'hampir tidak berubah'}. Pola ini paling mirip **${labelKelas(k.kelas)}**.`
  )
}

/** Ringkasan pendek untuk satu seri, mis. "naik 3,9× saat n 2× → **O(n²)**". */
export function ringkasanSeri(k: Klasifikasi): string {
  const faktorN = k.ke.n / k.dari.n
  const faktor = k.ke.nilai / k.dari.nilai
  return `${faktor >= 1.005 ? `naik ${angka(faktor)}×` : 'tetap'} saat n ${angka(faktorN)}× → **${labelKelas(k.kelas)}**`
}
