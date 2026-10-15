import { create } from 'zustand'
import { PembacaTrace, type Trace } from '@/engine'
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

  muat: (sumber: string, stdin: string) => void
  setSumber: (sumber: string) => void
  setStdin: (stdin: string) => void
  mulaiJalan: () => void
  terimaHasil: (versi: number, h: HasilEngine) => void
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
    }),
  setSumber: (sumber) => {
    if (sumber === get().sumber) return
    set({ sumber, versi: get().versi + 1, bermain: false })
  },
  setStdin: (stdin) => {
    if (stdin === get().stdin) return
    set({ stdin, versi: get().versi + 1, bermain: false })
  },
  mulaiJalan: () => set({ sedangJalan: true }),
  terimaHasil: (versi, h) => {
    if (versi !== get().versi) return
    if (h.ok && h.trace) {
      const pertama = get().trace === null
      const n = h.trace.langkah.length
      set({
        sedangJalan: false,
        hasil: h,
        trace: h.trace,
        pembaca: new PembacaTrace(h.trace),
        penanda: h.penanda,
        konstruksi: h.konstruksi,
        langkah: pertama ? 0 : batasi(get().langkah, n),
        jumlahRun: get().jumlahRun + 1,
      })
    } else {
      set({ sedangJalan: false, hasil: h, bermain: false })
    }
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
