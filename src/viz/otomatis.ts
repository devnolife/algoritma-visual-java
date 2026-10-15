import type { Trace } from '@/engine'

/** Bentuk konfigurasi yang dihasilkan (cocok dengan `KonfigVisual` di Panggung). */
export type KonfigOtomatis =
  | { jenis: 'array'; variabel: string; penunjuk: string[] }
  | { jenis: 'array2d'; variabel: string; baris?: string; kolom?: string }
  | { jenis: 'evaluasi' }
  | { jenis: 'memori' }
  | { jenis: 'konsol' }

const DASAR: KonfigOtomatis[] = [{ jenis: 'evaluasi' }, { jenis: 'memori' }, { jenis: 'konsol' }]
const MAKS_ARRAY = 2
/** Nama variabel int yang lazim dipakai sebagai indeks array. */
const NAMA_INDEKS = /^([a-z]|idx|indeks|kiri|kanan|tengah|awal|akhir|lo|hi|mid|pos|posisi|baris|kolom)$/

/**
 * Visual untuk Ruang Coba yang disusun dari program mahasiswa sendiri:
 * array (maks. 2) yang dideklarasikan di `main` tampil sebagai deret sel dengan penunjuk indeks,
 * diikuti evaluasi kondisi, memori, dan konsol.
 */
export function visualOtomatis(trace: Trace | null): KonfigOtomatis[] {
  if (!trace) return DASAR
  let frameMain: number | undefined
  const array1d: string[] = []
  const array2d: string[] = []
  const indeks = new Set<string>()
  for (const l of trace.langkah) {
    for (const p of l.peristiwa) {
      if (p.k === 'panggil' && frameMain === undefined) frameMain = p.frame.id
      if (p.k !== 'deklarasi') continue
      if (p.tipe === 'int' && NAMA_INDEKS.test(p.nama)) indeks.add(p.nama)
      if (p.frame !== frameMain) continue
      if (/^\w+\[\]$/.test(p.tipe) && !array1d.includes(p.nama)) array1d.push(p.nama)
      else if (/^\w+\[\]\[\]$/.test(p.tipe) && !array2d.includes(p.nama)) array2d.push(p.nama)
    }
  }
  const penunjuk = [...indeks].sort()
  const hasil: KonfigOtomatis[] = []
  for (const nama of array2d) {
    if (hasil.length >= MAKS_ARRAY) break
    hasil.push({ jenis: 'array2d', variabel: nama, baris: indeks.has('i') ? 'i' : undefined, kolom: indeks.has('j') ? 'j' : undefined })
  }
  for (const nama of array1d) {
    if (hasil.length >= MAKS_ARRAY) break
    hasil.push({ jenis: 'array', variabel: nama, penunjuk })
  }
  return [...hasil, ...DASAR]
}
