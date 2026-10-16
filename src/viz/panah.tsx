import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface KonteksPanah {
  daftar: (kunci: string, el: HTMLElement | null) => void
}

const Konteks = createContext<KonteksPanah | null>(null)

/** Daftarkan elemen sebagai ujung panah referensi, mis. `var:3:1` atau `heap:12`. */
export function useJangkar(kunci: string): (el: HTMLElement | null) => void {
  const ktx = useContext(Konteks)
  return useCallback((el: HTMLElement | null) => ktx?.daftar(kunci, el), [ktx, kunci])
}

export interface Panah {
  dari: string
  ke: string
  /** Panah dari frame yang tidak aktif digambar redup. */
  redup?: boolean
}

interface Garis {
  kunci: string
  d: string
  redup?: boolean
}

type Titik = [number, number]

/** Polyline dengan sudut membulat. */
function jalur(titik: Titik[], jari = 7): string {
  const bersih = titik.filter((t, i) => i === 0 || Math.abs(t[0] - titik[i - 1][0]) + Math.abs(t[1] - titik[i - 1][1]) > 0.5)
  let d = `M${bersih[0][0]},${bersih[0][1]}`
  for (let i = 1; i < bersih.length; i++) {
    const [x, y] = bersih[i]
    const lanjut = bersih[i + 1]
    if (!lanjut) {
      d += ` L${x},${y}`
      break
    }
    const [px, py] = bersih[i - 1]
    const masuk = Math.hypot(x - px, y - py)
    const keluar = Math.hypot(lanjut[0] - x, lanjut[1] - y)
    const r = Math.min(jari, masuk / 2, keluar / 2)
    const ax = x - ((x - px) / masuk) * r
    const ay = y - ((y - py) / masuk) * r
    const bx = x + ((lanjut[0] - x) / keluar) * r
    const by = y + ((lanjut[1] - y) / keluar) * r
    d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`
  }
  return d
}

/**
 * Rute ortogonal agar panah tidak menabrak kotak lain: turun dari titik ke celah di bawah kotak nilai,
 * lalu lewat "lajur" di luar frame (tepi kiri panggung, atau celah menuju kolom heap), lalu masuk dari kiri ke sasaran.
 */
function hitungGaris(wadah: HTMLElement, peta: Map<string, HTMLElement>, panah: Panah[]): Garis[] {
  const w = wadah.getBoundingClientRect()
  const rute = []
  for (const p of panah) {
    const a = peta.get(p.dari)
    const b = peta.get(p.ke)
    if (!a || !b || !a.isConnected || !b.isConnected) continue
    const ra = a.getBoundingClientRect()
    const rb = b.getBoundingClientRect()
    const kotak = (a.closest('[data-kotak-nilai]') ?? a).getBoundingClientRect()
    const bingkai = (a.closest('[data-bingkai]') ?? a).getBoundingClientRect()
    const sasaran = (b.querySelector('[data-sasaran-panah]') ?? b).getBoundingClientRect()
    rute.push({
      kunci: `${p.dari}->${p.ke}`,
      redup: p.redup,
      x1: ra.left + ra.width / 2 - w.left,
      y1: ra.top + ra.height / 2 - w.top,
      bawahKotak: kotak.bottom - w.top,
      kiriBingkai: bingkai.left - w.left,
      kananBingkai: bingkai.right - w.left,
      x2: Math.min(sasaran.left, rb.left) - w.left - 2,
      y2: sasaran.top + Math.min(sasaran.height / 2, 26) - w.top,
      keKanan: rb.left >= bingkai.right - 1,
    })
  }
  const hasil: Garis[] = []
  for (const sisi of [true, false]) {
    // Sasaran terendah memakai lajur terdalam supaya garis tidak saling silang.
    const kelompok = rute.filter((r) => r.keKanan === sisi).sort((a, b) => b.y2 - a.y2)
    kelompok.forEach((r, lajur) => {
      const yCelah = r.bawahKotak + 9 + Math.min(lajur, 2) * 3
      const xLajur = sisi ? r.kananBingkai + 12 + lajur * 5 : Math.min(r.kiriBingkai, r.x2) - 14 - lajur * 5
      hasil.push({
        kunci: r.kunci,
        redup: r.redup,
        d: jalur([
          [r.x1, r.y1],
          [r.x1, yCelah],
          [xLajur, yCelah],
          [xLajur, r.y2],
          [r.x2, r.y2],
        ]),
      })
    })
  }
  return hasil
}

/**
 * Wadah relatif yang menggambar panah referensi (variabel → array di heap) di atas isinya.
 * Posisi dihitung ulang setiap `pemicu` berubah dan saat ukuran wadah berubah.
 */
export function WadahPanah({ children, panah, pemicu, className }: { children: ReactNode; panah: Panah[]; pemicu: unknown; className?: string }) {
  const wadah = useRef<HTMLDivElement>(null)
  const peta = useRef(new Map<string, HTMLElement>())
  const [garis, setGaris] = useState<Garis[]>([])

  const daftar = useCallback((kunci: string, el: HTMLElement | null) => {
    if (el) peta.current.set(kunci, el)
    else peta.current.delete(kunci)
  }, [])

  const kunciPanah = panah.map((p) => `${p.dari}>${p.ke}${p.redup ? '~' : ''}`).join('|')

  useLayoutEffect(() => {
    const el = wadah.current
    if (!el) return
    const ukur = () => setGaris(hitungGaris(el, peta.current, panah))
    ukur()
    // Ukur ulang setelah transisi masuk selesai.
    const t = setTimeout(ukur, 240)
    const ro = new ResizeObserver(ukur)
    ro.observe(el)
    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pemicu, kunciPanah])

  return (
    <Konteks.Provider value={{ daftar }}>
      <div ref={wadah} className={`relative ${className ?? ''}`}>
        {children}
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <defs>
            <marker id="ujung-panah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--tipe-ref)" />
            </marker>
          </defs>
          {garis.map((g) => (
            <path key={g.kunci} d={g.d} fill="none" stroke="var(--tipe-ref)" strokeWidth={1.6} strokeOpacity={g.redup ? 0.28 : 0.75} markerEnd="url(#ujung-panah)" />
          ))}
        </svg>
      </div>
    </Konteks.Provider>
  )
}
