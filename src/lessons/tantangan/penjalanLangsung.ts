import { analisisKonstruksi } from '@/engine/analisis'
import { jalankan, kompilasi } from '@/engine'
import { ukurPertumbuhan } from '@/engine/ukurPertumbuhan'
import type { Pengukur, Penjalan } from './periksa'

/** Penjalan sinkron di thread yang sama (untuk tes dan skrip validator konten, bukan untuk UI). */
export function penjalanLangsung(batasLangkah?: number): Penjalan {
  return async (sumber, input) => {
    const k = kompilasi(sumber)
    if (!k.ok || !k.program) return { ok: false, diagnostik: k.diagnostik, konstruksi: [] }
    const trace = jalankan(k, { stdin: input, batasLangkah })
    return { ok: true, diagnostik: [], konstruksi: analisisKonstruksi(k.program), trace }
  }
}

/** Pengukur pertumbuhan sinkron (untuk tes dan validator konten). Input mengikuti `input` pelajaran. */
export function pengukurLangsung(stdin = ''): Pengukur {
  return async (sumber, konfig) => {
    const k = kompilasi(sumber)
    if (!k.ok || !k.program) return { seri: [], galat: 'Kode belum bisa dikompilasi.' }
    // Tanpa anggaran waktu agar hasil validator tidak bergantung pada kecepatan mesin.
    return ukurPertumbuhan(k, konfig, { stdin, anggaranMs: Infinity })
  }
}
