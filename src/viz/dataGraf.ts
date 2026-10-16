import type { Nilai } from '@/engine/nilai'

/** Nilai yang dianggap "tak hingga" (tidak ada sisi / jarak belum diketahui). */
export const TAK_HINGGA = 1_000_000_000

export interface Sisi {
  dari: number
  ke: number
  bobot: number | null
}

/** Baca matriks ketetanggaan menjadi daftar sisi. */
export function sisiDariMatriks(baris: Nilai[][], tipe: string, kosong?: number): { sisi: Sisi[]; berbobot: boolean; simetris: boolean } {
  const n = baris.length
  const ada = (v: Nilai) => {
    if (tipe === 'boolean') return v === true
    if (typeof v !== 'number') return false
    return v !== 0 && v !== kosong && Math.abs(v) < TAK_HINGGA
  }
  let berbobot = false
  let simetris = true
  const sisi: Sisi[] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < (baris[i]?.length ?? 0); j++) {
      const v = baris[i][j]
      if (ada(v) !== ada(baris[j]?.[i] ?? 0) || (ada(v) && v !== baris[j]?.[i])) simetris = false
      if (!ada(v) || i === j) continue
      if (typeof v === 'number' && v !== 1) berbobot = true
      sisi.push({ dari: i, ke: j, bobot: typeof v === 'number' ? v : null })
    }
  }
  return { sisi, berbobot, simetris }
}
