import { analisisKonstruksi } from '@/engine/analisis'
import { jalankan, kompilasi } from '@/engine'
import type { Penjalan } from './periksa'

/** Penjalan sinkron di thread yang sama (untuk tes dan skrip validator konten, bukan untuk UI). */
export function penjalanLangsung(batasLangkah?: number): Penjalan {
  return async (sumber, input) => {
    const k = kompilasi(sumber)
    if (!k.ok || !k.program) return { ok: false, diagnostik: k.diagnostik, konstruksi: [] }
    const trace = jalankan(k, { stdin: input, batasLangkah })
    return { ok: true, diagnostik: [], konstruksi: analisisKonstruksi(k.program), trace }
  }
}
