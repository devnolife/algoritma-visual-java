import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Beranda } from './halaman/Beranda'
import { HalamanModul } from './halaman/HalamanModul'
import { TidakDitemukan } from './halaman/TidakDitemukan'
import { PemberitahuanLayar } from './komponen/PemberitahuanLayar'
import { BatasGalat } from './komponen/BatasGalat'
import { GalatMateri } from './komponen/GalatMateri'
import './tema'

// Halaman pemutar (editor, visualisasi, Markdown) dimuat terpisah agar Beranda dan daftar modul tampil cepat.
const muatPelajaran = () => import('./halaman/HalamanPelajaran')
const muatRuangCoba = () => import('./halaman/RuangCoba')
const HalamanPelajaran = lazy(() => muatPelajaran().then((m) => ({ default: m.HalamanPelajaran })))
const RuangCoba = lazy(() => muatRuangCoba().then((m) => ({ default: m.RuangCoba })))
// Harness visual hanya ada di mode pengembangan; di build produksi cabang ini (dan chunk-nya) dibuang.
const UjiVisual = import.meta.env.DEV ? lazy(() => import('./halaman/UjiVisual').then((m) => ({ default: m.UjiVisual }))) : null

function MemuatHalaman() {
  return (
    <div className="grid h-dvh place-items-center text-[14px] text-muted-foreground" role="status">
      Memuat…
    </div>
  )
}

export function App() {
  // Unduh halaman pemutar di latar belakang saat browser senggang, sehingga berpindah halaman tetap instan.
  useEffect(() => {
    const unduh = () => {
      void muatPelajaran()
      void muatRuangCoba()
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(unduh, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(unduh, 1500)
    return () => clearTimeout(id)
  }, [])

  return (
    <HashRouter>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={350}>
          <PemberitahuanLayar />
          <GalatMateri />
          <BatasGalat>
            <Suspense fallback={<MemuatHalaman />}>
              <Routes>
                <Route path="/" element={<Beranda />} />
                <Route path="/ruang-coba" element={<RuangCoba />} />
                <Route path="/modul/:modul" element={<HalamanModul />} />
                <Route path="/modul/:modul/:pelajaran" element={<HalamanPelajaran />} />
                {UjiVisual && <Route path="/uji-visual/:skenario?" element={<UjiVisual />} />}
                <Route path="*" element={<TidakDitemukan />} />
              </Routes>
            </Suspense>
          </BatasGalat>
        </TooltipProvider>
      </MotionConfig>
    </HashRouter>
  )
}
