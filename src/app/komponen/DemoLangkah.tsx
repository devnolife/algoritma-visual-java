import { Pause, Play } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PembacaTrace, type Trace } from '@/engine'
import { narasikan } from '@/engine/narasi'
import { cn } from '@/lib/utils'
import { TeksSebaris } from '@/player/TeksSebaris'
import { ArrayView, type KonfigArray } from '@/viz/ArrayView'
import { hitungSorotan } from '@/viz/bersama'
import { klienEngine } from '@/worker/klienEngine'
import { BingkaiDemo, KerangkaBatang } from './BingkaiDemo'
import { BARIS_HAPUS, KODE_DEMO, sumberTanpaBaris } from './demoBeranda'

const KONFIG: KonfigArray = { jenis: 'array', variabel: 'data', gaya: 'batang', penunjuk: ['j'] }
const JEDA_LANGKAH = 560
const JEDA_AKHIR = 2600

/** Langkah pertama yang membandingkan dua elemen: bingkai diam yang paling informatif. */
function langkahBanding(trace: Trace): number {
  const i = trace.langkah.findIndex((l) => l.jenis === 'kondisi' && l.baris === 6)
  return i < 0 ? 0 : i
}

/**
 * Demo hero Beranda: program Java sungguhan dijalankan mesin Java Mini (Web Worker), digambar dengan
 * renderer dan narasi yang sama dengan pemutar. Pengunjung bisa menggeser langkah, menjeda, dan menghapus
 * satu baris untuk melihat animasinya ikut berubah.
 */
export function DemoLangkah() {
  const kurangGerak = useReducedMotion() ?? false
  const kurangGerakRef = useRef(kurangGerak)
  useEffect(() => {
    kurangGerakRef.current = kurangGerak
  }, [kurangGerak])
  const [hapus, setHapus] = useState(false)
  const [trace, setTrace] = useState<Trace | null>(null)
  const [galat, setGalat] = useState<string | null>(null)
  const [indeks, setIndeks] = useState(0)
  const [main, setMain] = useState(false)
  const [terlihat, setTerlihat] = useState(false)
  const [menyeret, setMenyeret] = useState(false)
  const wadah = useRef<HTMLDivElement>(null)
  const pertama = useRef(true)
  const sumber = hapus ? sumberTanpaBaris(KODE_DEMO, BARIS_HAPUS) : KODE_DEMO

  // Program dijalankan ulang di Web Worker setiap kali kodenya berubah, persis seperti di pemutar.
  useEffect(() => {
    let batal = false
    void klienEngine.jalankan(sumber).then((h) => {
      if (batal) return
      if (!h.ok || !h.trace) {
        setGalat(h.galat ?? 'Program demo tidak bisa dijalankan.')
        return
      }
      const t = h.trace
      const awal = pertama.current
      pertama.current = false
      setGalat(null)
      setTrace(t)
      if (kurangGerakRef.current) {
        // Tanpa animasi otomatis: tampilkan perbandingan pertama, atau hasil akhir setelah baris dihapus.
        setIndeks(awal ? langkahBanding(t) : t.langkah.length - 1)
        setMain(false)
      } else {
        setIndeks(Math.min(1, t.langkah.length - 1))
        setMain(true)
      }
    })
    return () => {
      batal = true
    }
  }, [sumber])

  // Putar otomatis hanya saat demo terlihat di layar.
  useEffect(() => {
    const el = wadah.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const n = trace?.langkah.length ?? 0
  const i = Math.min(indeks, Math.max(0, n - 1))

  useEffect(() => {
    if (!main || !terlihat || n === 0) return
    const akhir = i >= n - 1
    const t = window.setTimeout(() => setIndeks(akhir ? Math.min(1, n - 1) : i + 1), akhir ? JEDA_AKHIR : JEDA_LANGKAH)
    return () => window.clearTimeout(t)
  }, [main, terlihat, i, n])

  const pembaca = useMemo(() => (trace ? new PembacaTrace(trace) : null), [trace])
  const state = useMemo(() => pembaca?.stateDi(i), [pembaca, i])
  const langkah = trace?.langkah[i]
  const sorotan = useMemo(() => hitungSorotan(langkah), [langkah])
  const kalimat = useMemo(() => {
    if (!trace || !state) return undefined
    const narasi = narasikan(trace, i, state, { sumber })
    return narasi.peringatan[0] ?? narasi.kalimat[0]
  }, [trace, state, i, sumber])

  return (
    <BingkaiDemo
      bingkaiRef={wadah}
      aktif={langkah?.baris}
      dihapus={hapus}
      visual={
        galat ? (
          <p className="self-center text-[13.5px] text-muted-foreground">Demo tidak bisa dijalankan di browser ini. Coba buka Ruang Coba.</p>
        ) : state ? (
          <ArrayView state={state} sorotan={sorotan} instan={menyeret} konfig={KONFIG} adaMemori={false} />
        ) : (
          <KerangkaBatang />
        )
      }
      kalimat={kalimat ? <TeksSebaris teks={kalimat} /> : undefined}
      kontrol={
        <>
          <Button variant="ghost" size="icon" onClick={() => setMain((m) => !m)} aria-label={main ? 'Jeda demo' : 'Putar demo'} disabled={n === 0}>
            {main ? <Pause /> : <Play />}
          </Button>
          <SliderPrimitive.Root
            className="relative flex h-8 min-w-0 flex-1 touch-none select-none items-center"
            min={0}
            max={Math.max(0, n - 1)}
            step={1}
            value={[i]}
            disabled={n === 0}
            onValueChange={([v]) => {
              setMain(false)
              setIndeks(v)
            }}
            onPointerDown={() => setMenyeret(true)}
            onPointerUp={() => setMenyeret(false)}
            onLostPointerCapture={() => setMenyeret(false)}
            aria-label="Geser untuk memilih langkah demo"
          >
            <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-muted">
              <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className="block size-[18px] rounded-full border-2 border-primary bg-card shadow-sm outline-none transition-[box-shadow] duration-150 focus-visible:ring-4 focus-visible:ring-ring/40"
              aria-label="Langkah demo"
              aria-valuetext={n === 0 ? 'Belum ada langkah' : `Langkah ${i + 1} dari ${n}, baris ${langkah?.baris ?? '-'}`}
            />
          </SliderPrimitive.Root>
          <span className="w-14 shrink-0 text-right font-mono text-[12px] tabular-nums text-muted-foreground" aria-hidden="true">
            {n === 0 ? '' : `${i + 1}/${n}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHapus((h) => !h)}
            disabled={n === 0 && !galat}
            className={cn('w-[9.5rem] shrink-0', hapus && 'border-galat/40 text-galat hover:text-galat')}
          >
            {hapus ? `Kembalikan baris ${BARIS_HAPUS}` : `Hapus baris ${BARIS_HAPUS}`}
          </Button>
        </>
      }
    />
  )
}
