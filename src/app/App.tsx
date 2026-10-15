import { MotionConfig } from 'motion/react'
import { HashRouter, Route, Routes } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Beranda } from './halaman/Beranda'
import { HalamanModul } from './halaman/HalamanModul'
import { HalamanPelajaran } from './halaman/HalamanPelajaran'
import { RuangCoba } from './halaman/RuangCoba'
import { TidakDitemukan } from './halaman/TidakDitemukan'
import { PemberitahuanLayar } from './komponen/PemberitahuanLayar'
import { BatasGalat } from './komponen/BatasGalat'
import { GalatMateri } from './komponen/GalatMateri'
import './tema'

export function App() {
  return (
    <HashRouter>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={350}>
          <PemberitahuanLayar />
          <GalatMateri />
          <BatasGalat>
            <Routes>
              <Route path="/" element={<Beranda />} />
              <Route path="/ruang-coba" element={<RuangCoba />} />
              <Route path="/modul/:modul" element={<HalamanModul />} />
              <Route path="/modul/:modul/:pelajaran" element={<HalamanPelajaran />} />
              <Route path="*" element={<TidakDitemukan />} />
            </Routes>
          </BatasGalat>
        </TooltipProvider>
      </MotionConfig>
    </HashRouter>
  )
}
