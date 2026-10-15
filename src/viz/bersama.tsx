import { AnimatePresence, motion } from 'motion/react'
import type { Langkah, StateMesin } from '@/engine'

export const EASE_KELUAR = [0.23, 1, 0.32, 1] as const

/** Sorotan yang diturunkan dari peristiwa sebuah langkah. */
export interface Sorotan {
  /** Kunci: `var:<frame>:<slot>`, `statik:<nama>`, `el:<id>:<indeks>`. */
  baca: Set<string>
  tulis: Set<string>
  baru: Set<string>
  /** Langkah kondisi: elemen yang dibaca sedang dibandingkan. */
  banding: boolean
}

export function hitungSorotan(l: Langkah | undefined): Sorotan {
  const s: Sorotan = { baca: new Set(), tulis: new Set(), baru: new Set(), banding: l?.jenis === 'kondisi' }
  for (const p of l?.peristiwa ?? []) {
    switch (p.k) {
      case 'baca':
        s.baca.add(`var:${p.frame}:${p.slot}`)
        break
      case 'baca-statik':
        s.baca.add(`statik:${p.nama}`)
        break
      case 'baca-elemen':
        s.baca.add(`el:${p.id}:${p.indeks}`)
        break
      case 'tulis':
        s.tulis.add(`var:${p.frame}:${p.slot}`)
        break
      case 'tulis-statik':
        s.tulis.add(`statik:${p.nama}`)
        break
      case 'tulis-elemen':
        s.tulis.add(`el:${p.id}:${p.indeks}`)
        break
      case 'deklarasi':
        s.baru.add(`var:${p.frame}:${p.slot}`)
        break
      case 'deklarasi-statik':
        s.baru.add(`statik:${p.nama}`)
        break
    }
  }
  return s
}

/** Kelas sorotan untuk sebuah kotak nilai. */
export function kelasSorotan(sorotan: Sorotan, kunci: string): string {
  if (sorotan.tulis.has(kunci) || sorotan.baru.has(kunci)) return 'border-tulis bg-tulis-lembut'
  if (sorotan.baca.has(kunci)) return sorotan.banding ? 'border-banding bg-banding-lembut' : 'border-baca ring-2 ring-baca/25'
  return 'border-input bg-card'
}

/** Teks nilai yang berganti dengan transisi singkat (lama keluar ke atas, baru masuk dari bawah). */
export function NilaiBerubah({ teks, instan, className }: { teks: string; instan: boolean; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className ?? ''}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={teks}
          className="gerak col-start-1 row-start-1 whitespace-pre"
          initial={{ opacity: 0, transform: 'translateY(45%)' }}
          animate={{ opacity: 1, transform: 'translateY(0%)' }}
          exit={{ opacity: 0, transform: 'translateY(-45%)' }}
          transition={instan ? { duration: 0 } : { duration: 0.18, ease: EASE_KELUAR }}
        >
          {teks}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Cari variabel bernama `nama` dari frame teratas ke bawah, lalu variabel statik. */
export function cariVariabel(state: StateMesin, nama: string) {
  for (let i = state.frames.length - 1; i >= 0; i--) {
    const v = state.frames[i].vars.find((x) => x.nama === nama)
    if (v) return { v, frame: state.frames[i] }
  }
  const s = state.statik.find((x) => x.nama === nama)
  return s ? { v: s, frame: undefined } : undefined
}
