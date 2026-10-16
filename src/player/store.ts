import { create } from 'zustand'
import { PembacaTrace, type Trace } from '@/engine'
import type { HasilPertumbuhan } from '@/engine/pertumbuhan'
import type { HasilEngine } from '@/worker/protokol'

export type Kecepatan = 0.5 | 1 | 2 | 4

export interface StatePemutar {
  sumber: string
  stdin: string
  /** Bertambah setiap kode/input berubah; dipakai untuk mengabaikan hasil yang basi. */
  versi: number
  sedangJalan: boolean
  /** Hasil terakhir dari mesin (bisa berisi error kompilasi). */
  hasil: HasilEngine | null
  /** Trace terakhir yang valid (tetap ditampilkan pudar saat kode sedang error). */
  trace: Trace | null
  pembaca: PembacaTrace | null
  penanda: Record<number, string>
  konstruksi: string[]
  langkah: number
  bermain: boolean
  kecepatan: Kecepatan
  menyeret: boolean
  /** Nomor run berhasil (untuk indikator "dijalankan ulang"). */
  jumlahRun: number
  /** Seed Math.random; undefined = seed bawaan mesin (hasil acak stabil saat kode diedit). */
  seed: number | undefined
  /** Hasil grafik pertumbuhan untuk kode valid terakhir. */
  pertumbuhan: HasilPertumbuhan | null
  memuatPertumbuhan: boolean

  muat: (sumber: string, stdin: string) => void
  setSumber: (sumber: string) => void
  setStdin: (stdin: string) => void
  /** Ganti seed Math.random lalu jalankan ulang program. */
  acakUlang: () => void
  mulaiJalan: () => void
  terimaHasil: (versi: number, h: HasilEngine) => void
  mulaiUkur: () => void
  terimaPertumbuhan: (versi: number, h: HasilPertumbuhan) => void
  keLangkah: (i: number) => void
  maju: (n?: number) => void
  mundur: (n?: number) => void
  putar: () => void
  jeda: () => void
  setKecepatan: (k: Kecepatan) => void
  setMenyeret: (b: boolean) => void
}

const batasi = (i: number, n: number) => Math.max(0, Math.min(i, Math.max(0, n - 1)))

export const usePemutar = create<StatePemutar>((set, get) => ({
  sumber: '',
  stdin: '',
  versi: 0,
  sedangJalan: false,
  hasil: null,
  trace: null,
  pembaca: null,
  penanda: {},
  konstruksi: [],
  langkah: 0,
  bermain: false,
  kecepatan: 1,
  menyeret: false,
  jumlahRun: 0,
  seed: undefined,
  pertumbuhan: null,
  memuatPertumbuhan: false,

  muat: (sumber, stdin) =>
    set({
      sumber,
      stdin,
      versi: get().versi + 1,
      hasil: null,
      trace: null,
      pembaca: null,
      penanda: {},
      konstruksi: [],
      langkah: 0,
      bermain: false,
      jumlahRun: 0,
      seed: undefined,
      pertumbuhan: null,
      memuatPertumbuhan: false,
    }),
  setSumber: (sumber) => {
    if (sumber === get().sumber) return
    set({ sumber, versi: get().versi + 1, bermain: false })
  },
  setStdin: (stdin) => {
    if (stdin === get().stdin) return
    set({ stdin, versi: get().versi + 1, bermain: false })
  },
  acakUlang: () => {
    let seed = Math.floor(Math.random() * 2 ** 31)
    if (seed === get().seed) seed++
    set({ seed, versi: get().versi + 1, bermain: false })
  },
  mulaiJalan: () => set({ sedangJalan: true }),
  terimaHasil: (versi, h) => {
    if (versi !== get().versi) return
    if (h.ok && h.trace) {
      const lama = get().trace
      const n = h.trace.langkah.length
      // Bila sebelumnya sedang melihat langkah terakhir, tetap di akhir program yang baru.
      const diAkhir = lama !== null && get().langkah >= lama.langkah.length - 1
      set({
        sedangJalan: false,
        hasil: h,
        trace: h.trace,
        pembaca: new PembacaTrace(h.trace),
        penanda: h.penanda,
        konstruksi: h.konstruksi,
        langkah: lama === null ? 0 : diAkhir ? n - 1 : batasi(get().langkah, n),
        jumlahRun: get().jumlahRun + 1,
      })
    } else {
      set({ sedangJalan: false, hasil: h, bermain: false })
    }
  },
  mulaiUkur: () => set({ memuatPertumbuhan: true }),
  terimaPertumbuhan: (versi, h) => {
    // Hasil basi (kode sudah berubah lagi) atau permintaan yang dibatalkan diabaikan; permintaan yang lebih baru sedang berjalan.
    if (versi !== get().versi || h.galat === 'dibatalkan') return
    set({ pertumbuhan: h, memuatPertumbuhan: false })
  },
  keLangkah: (i) => {
    const n = get().trace?.langkah.length ?? 0
    set({ langkah: batasi(i, n) })
  },
  maju: (n = 1) => {
    const total = get().trace?.langkah.length ?? 0
    const baru = batasi(get().langkah + n, total)
    set({ langkah: baru, bermain: get().bermain && baru < total - 1 })
  },
  mundur: (n = 1) => set({ langkah: batasi(get().langkah - n, get().trace?.langkah.length ?? 0) }),
  putar: () => {
    const total = get().trace?.langkah.length ?? 0
    if (total === 0) return
    set({ bermain: true, langkah: get().langkah >= total - 1 ? 0 : get().langkah })
  },
  jeda: () => set({ bermain: false }),
  setKecepatan: (kecepatan) => set({ kecepatan }),
  setMenyeret: (menyeret) => set({ menyeret }),
}))

/** Apakah kode saat ini sedang error sehingga trace yang tampil berasal dari kode sebelumnya. */
export function traceBasi(s: Pick<StatePemutar, 'hasil' | 'trace'>): boolean {
  return s.hasil !== null && !s.hasil.ok && s.trace !== null
}

if (import.meta.env.DEV) (globalThis as unknown as { __pemutar: typeof usePemutar }).__pemutar = usePemutar
