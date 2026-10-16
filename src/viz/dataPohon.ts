import type { Trace } from '@/engine'

export interface SimpulPanggilan {
  /** Id frame. */
  id: number
  method: string
  argumen: string[]
  induk: number | null
  /** Indeks langkah saat method dipanggil. */
  mulai: number
  /** Indeks langkah saat method mengembalikan nilai. */
  kembali?: number
  nilai?: string
  /** Indeks langkah saat frame dibuang dari call stack. */
  selesai?: number
  urutan: number
}

/** Argumen ringkas untuk label simpul: array cukup `[…]`, String panjang dipotong. */
function argumenRingkas(argumen: string[], tipe: string[]): string[] {
  return argumen.map((a, i) => {
    if (tipe[i]?.endsWith('[]') || a.startsWith('[')) return '[…]'
    return a.length > 12 ? `${a.slice(0, 10)}…${a.endsWith('"') ? '"' : ''}` : a
  })
}

/** Semua pemanggilan method dalam trace (tanpa `main`), urut menurut waktu pemanggilan. */
export function bangunPohonPanggilan(trace: Trace, method?: string): SimpulPanggilan[] {
  const semua = new Map<number, SimpulPanggilan & { indukAsli: number | null }>()
  const tumpukan: number[] = []
  let urutan = 0
  trace.langkah.forEach((l, i) => {
    for (const p of l.peristiwa) {
      if (p.k === 'panggil') {
        const induk = tumpukan.length ? tumpukan[tumpukan.length - 1] : null
        const tipe = p.frame.vars.filter((v) => v.param).map((v) => v.tipe)
        semua.set(p.frame.id, { id: p.frame.id, method: p.method, argumen: argumenRingkas(p.argumen, tipe), induk: null, indukAsli: induk, mulai: i, urutan: urutan++ })
        tumpukan.push(p.frame.id)
      } else if (p.k === 'kembali') {
        const s = semua.get(p.frame)
        if (s) {
          s.kembali = i
          s.nilai = p.nilai
        }
      } else if (p.k === 'buang-frame') {
        const s = semua.get(p.frame)
        if (s) s.selesai = i
        const j = tumpukan.lastIndexOf(p.frame)
        if (j >= 0) tumpukan.splice(j, 1)
      }
    }
  })
  const lolos = (s: { method: string; indukAsli: number | null }) => (method ? s.method === method : s.indukAsli !== null)
  const hasil: SimpulPanggilan[] = []
  for (const s of semua.values()) {
    if (!lolos(s)) continue
    // Induk = leluhur terdekat yang juga ikut ditampilkan.
    let induk = s.indukAsli
    while (induk !== null && !lolos(semua.get(induk)!)) induk = semua.get(induk)!.indukAsli
    const { indukAsli: _abaikan, ...simpul } = s
    hasil.push({ ...simpul, induk })
  }
  return hasil
}
