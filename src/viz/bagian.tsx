import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PesanVariabel } from './bersama'
import { ikutiJalur, bagianJalur } from './jalur'
import type { StateMesin } from '@/engine'

/** Lebar teks monospace (JetBrains Mono: 0,6 em per huruf). */
export const lebarMono = (teks: string, ukuran = 15) => teks.length * ukuran * 0.6

/**
 * Gambar berukuran tetap yang diperkecil (transform scale, minimal `min`) agar muat di lebar panggung;
 * bila tetap tidak muat, wadahnya bisa digulir mendatar.
 */
export function SkalaMuat({ lebar, tinggi, label, min = 0.7, children }: { lebar: number; tinggi: number; label: string; min?: number; children: ReactNode }) {
  const wadah = useRef<HTMLDivElement>(null)
  const [tersedia, setTersedia] = useState(0)
  useLayoutEffect(() => {
    const el = wadah.current
    if (!el) return
    const ukur = () => setTersedia(el.clientWidth)
    ukur()
    const ro = new ResizeObserver(ukur)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const skala = tersedia > 0 ? Math.max(min, Math.min(1, tersedia / lebar)) : 1
  return (
    <div ref={wadah} className="w-full max-w-full overflow-x-auto pt-1 pb-1">
      <div style={{ width: lebar * skala, height: tinggi * skala }}>
        <div role="img" aria-label={label} className="relative origin-top-left" style={{ width: lebar, height: tinggi, transform: skala < 1 ? `scale(${skala})` : undefined }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Seperti `SkalaMuat`, tetapi untuk isi bertata letak bebas (flex) yang lebarnya baru diketahui setelah diukur:
 * isi yang lebih lebar dari panggung diperkecil sampai `min`, sisanya bisa digulir mendatar.
 */
export function MuatLebar({ min = 0.8, children }: { min?: number; children: ReactNode }) {
  const wadah = useRef<HTMLDivElement>(null)
  const isi = useRef<HTMLDivElement>(null)
  const [ukuran, setUkuran] = useState({ tersedia: 0, lebar: 0, tinggi: 0 })
  useLayoutEffect(() => {
    const w = wadah.current
    const el = isi.current
    if (!w || !el) return
    // offsetWidth/offsetHeight tidak terpengaruh transform, jadi pengukuran tetap stabil setelah diperkecil.
    const ukur = () => setUkuran({ tersedia: w.clientWidth, lebar: el.offsetWidth, tinggi: el.offsetHeight })
    ukur()
    const ro = new ResizeObserver(ukur)
    ro.observe(w)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const skala = ukuran.tersedia > 0 && ukuran.lebar > ukuran.tersedia ? Math.max(min, ukuran.tersedia / ukuran.lebar) : 1
  return (
    <div ref={wadah} className="w-full max-w-full overflow-x-auto pb-1">
      <div style={skala < 1 ? { width: ukuran.lebar * skala, height: ukuran.tinggi * skala } : undefined}>
        <div ref={isi} className="w-max origin-top-left" style={skala < 1 ? { transform: `scale(${skala})` } : undefined}>
          {children}
        </div>
      </div>
    </div>
  )
}

/** Kotak pesan bergaris putus-putus (struktur kosong, opsi salah, dll.). */
export function PesanVisual({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">{children}</p>
}

/** Teks dengan `kode` ditulis sebagai kode sebaris. */
export function TeksKode({ teks }: { teks: string }) {
  return (
    <>
      {teks.split(/(`[^`]+`)/).map((b, i) => (b.startsWith('`') && b.endsWith('`') ? <code key={i} className="kode-sebaris">{b.slice(1, -1)}</code> : <span key={i}>{b}</span>))}
    </>
  )
}

/**
 * Pesan saat jalur struktur (mis. `daftar.head`) belum bisa diikuti. Bila akar jalurnya sama sekali tidak ada,
 * dipakai pesan variabel standar (belum dideklarasikan / tidak ada di kode).
 */
export function PesanJalur({
  state,
  jalur,
  masalah,
  adaDiKode,
  adaMemori,
}: {
  state: StateMesin
  jalur: string
  masalah: string
  adaDiKode: boolean
  adaMemori: boolean
}) {
  const h = ikutiJalur(state, jalur)
  if (h.masalah === 'tidak-ada') return <PesanVariabel nama={bagianJalur(jalur)[0] ?? jalur} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  return (
    <PesanVisual>
      <TeksKode teks={`${masalah.charAt(0).toUpperCase()}${masalah.slice(1)}.`} />
    </PesanVisual>
  )
}

/** Baris judul visual: badge/teks kecil di kiri, nama variabel tebal, keterangan redup. */
export function KepalaVisual({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]', className)}>{children}</div>
}

/**
 * Keterangan penunjuk yang bernilai null pada langkah ini. Penunjuk yang sedang tidak ada (variabel lokal method
 * lain) sengaja tidak dicantumkan: di Ruang Coba jumlahnya bisa banyak dan hanya menjadi derau.
 */
export function KeteranganPenunjuk({ nol }: { nol: readonly string[] }) {
  if (nol.length === 0) return null
  return (
    <span className="flex flex-wrap items-center gap-x-2 font-mono text-[12px] text-muted-foreground">
      {nol.map((n) => (
        <span key={n}>
          <span className="font-bold text-banding-teks">{n}</span> = null
        </span>
      ))}
    </span>
  )
}

export type WarnaPanah = 'biasa' | 'tulis' | 'baca' | 'redup' | 'jalur'

const WARNA: Record<WarnaPanah, string> = {
  biasa: 'var(--tipe-ref)',
  tulis: 'var(--tulis)',
  baca: 'var(--baca)',
  redup: 'var(--muted-foreground)',
  jalur: 'var(--banding)',
}

export const warnaPanah = (w: WarnaPanah) => WARNA[w]

/** Id unik marker ujung panah untuk satu SVG (satu per warna). */
export function useMarkerPanah(): (w: WarnaPanah) => string {
  const id = useId().replace(/:/g, '')
  return (w) => `panah-${id}-${w}`
}

/** Definisi marker ujung panah untuk semua warna; pasang sekali di setiap SVG yang memakai `useMarkerPanah`. */
export function DefsPanah({ marker }: { marker: (w: WarnaPanah) => string }) {
  return (
    <defs>
      {(Object.keys(WARNA) as WarnaPanah[]).map((w) => (
        <marker key={w} id={marker(w)} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={WARNA[w]} />
        </marker>
      ))}
    </defs>
  )
}

/** Panah lurus pendek (dipakai di antara dua kotak yang bersebelahan). */
export function PanahPendek({ lebar, warna = 'biasa', arah = 'kanan', className }: { lebar: number; warna?: WarnaPanah; arah?: 'kanan' | 'kiri'; className?: string }) {
  const marker = useMarkerPanah()
  const [x1, x2] = arah === 'kanan' ? [1, lebar - 2] : [lebar - 1, 2]
  return (
    <svg width={lebar} height={10} className={cn('shrink-0 overflow-visible', className)} aria-hidden="true">
      <DefsPanah marker={marker} />
      <line x1={x1} y1={5} x2={x2} y2={5} stroke={WARNA[warna]} strokeWidth={warna === 'biasa' || warna === 'redup' ? 1.6 : 2.4} markerEnd={`url(#${marker(warna)})`} />
    </svg>
  )
}
