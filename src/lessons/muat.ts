import { GalatKonten, susunKonten, type Modul, type Pelajaran } from './urai'

// Semua berkas materi dimuat saat build. Folder `solusi/` sengaja tidak ikut.
const mentah = import.meta.glob(['/content/*/modul.yaml', '/content/*/*/pelajaran.md', '/content/*/*/Main.java', '/content/*/*/tantangan.yaml'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const berkas: Record<string, string> = {}
for (const [path, isi] of Object.entries(mentah)) berkas[path.replace(/^\/content\//, '')] = isi

function muatSemua(): { modul: Modul[]; galat?: string } {
  try {
    return { modul: susunKonten(berkas) }
  } catch (e) {
    if (e instanceof GalatKonten) return { modul: [], galat: e.message }
    throw e
  }
}

const hasil = muatSemua()

export const DAFTAR_MODUL: Modul[] = hasil.modul
/** Pesan bila ada berkas materi yang tidak valid (ditampilkan untuk dosen). */
export const GALAT_KONTEN: string | undefined = hasil.galat

export function cariModul(slug: string | undefined): Modul | undefined {
  return DAFTAR_MODUL.find((m) => m.slug === slug)
}

export function cariPelajaran(modul: string | undefined, slug: string | undefined): { modul: Modul; pelajaran: Pelajaran; indeks: number } | undefined {
  const m = cariModul(modul)
  const indeks = m?.pelajaran.findIndex((p) => p.slug === slug) ?? -1
  if (!m || indeks < 0) return undefined
  return { modul: m, pelajaran: m.pelajaran[indeks], indeks }
}
