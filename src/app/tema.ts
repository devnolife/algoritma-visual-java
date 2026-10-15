import { create } from 'zustand'
import { baca, simpan } from './penyimpanan'

export type Tema = 'terang' | 'gelap'

function terapkan(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'gelap')
  document.documentElement.style.colorScheme = tema === 'gelap' ? 'dark' : 'light'
}

// Tanpa pilihan tersimpan, ikuti pengaturan tema sistem operasi.
const sistemGelap = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
const awal = baca<Tema>('tema', sistemGelap ? 'gelap' : 'terang')
terapkan(awal)

interface StateTema {
  tema: Tema
  alih: () => void
}

export const useTema = create<StateTema>((set, get) => ({
  tema: awal,
  alih: () => {
    const tema: Tema = get().tema === 'terang' ? 'gelap' : 'terang'
    terapkan(tema)
    simpan('tema', tema)
    set({ tema })
  },
}))
