import { create } from 'zustand'
import { baca, hapus, simpan } from './penyimpanan'

interface DataProgres {
  /** Kunci pelajaran (`modul/pelajaran`) yang sudah dibuka. */
  dibuka: Record<string, number>
  /** Kunci pelajaran → id tantangan yang sudah lulus. */
  lulus: Record<string, string[]>
}

interface StateProgres extends DataProgres {
  tandaiDibuka: (kunci: string) => void
  tandaiLulus: (kunci: string, idTantangan: string) => void
  sudahLulus: (kunci: string, idTantangan: string) => boolean
}

const awal = baca<DataProgres>('progres', { dibuka: {}, lulus: {} })

export const useProgres = create<StateProgres>((set, get) => ({
  ...awal,
  tandaiDibuka: (kunci) => {
    if (get().dibuka[kunci]) return
    const dibuka = { ...get().dibuka, [kunci]: Date.now() }
    set({ dibuka })
    simpan('progres', { dibuka, lulus: get().lulus })
  },
  tandaiLulus: (kunci, id) => {
    const lama = get().lulus[kunci] ?? []
    if (lama.includes(id)) return
    const lulus = { ...get().lulus, [kunci]: [...lama, id] }
    set({ lulus })
    simpan('progres', { dibuka: get().dibuka, lulus })
  },
  sudahLulus: (kunci, id) => (get().lulus[kunci] ?? []).includes(id),
}))

/** Kode terakhir mahasiswa per pelajaran (disimpan otomatis). */
export const kodeTersimpan = {
  ambil: (kunci: string): string | null => baca<string | null>(`kode:${kunci}`, null),
  simpan: (kunci: string, kode: string) => simpan(`kode:${kunci}`, kode),
  hapus: (kunci: string) => hapus(`kode:${kunci}`),
}
