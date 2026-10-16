import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cariPelajaran } from '@/lessons/muat'
import { PanelTantangan } from '@/lessons/PanelTantangan'
import { Pemutar } from '@/player/Pemutar'
import { usePemutar } from '@/player/store'
import type { KonfigVisual } from '@/viz/Panggung'
import { Kepala, Pemisah, Remah } from '../komponen/Kepala'
import { Markdown } from '../komponen/Markdown'
import { useSimpanKode } from '../komponen/useSimpanKode'
import { kodeTersimpan, useProgres } from '../progres'
import { TidakDitemukan } from './TidakDitemukan'

const TANPA_LULUS: string[] = []

export function HalamanPelajaran() {
  const { modul, pelajaran } = useParams()
  const hasil = cariPelajaran(modul, pelajaran)
  const [terlipat, setTerlipat] = useState(false)
  const kunci = hasil?.pelajaran.kunci ?? ''
  const lulus = useProgres((s) => s.lulus[kunci]) ?? TANPA_LULUS
  const kodeAwal = hasil?.pelajaran.kode ?? ''

  useEffect(() => {
    if (!hasil) return
    const p = hasil.pelajaran
    usePemutar.getState().muat(kodeTersimpan.ambil(p.kunci) ?? p.kode, p.meta.input)
    useProgres.getState().tandaiDibuka(p.kunci)
    document.title = `${p.meta.judul} · Algoritma & Pemrograman Java`
    // Muat ulang hanya saat pelajaran berganti.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci])

  useSimpanKode(kunci, kodeAwal)

  if (!hasil) return <TidakDitemukan />
  const { modul: m, pelajaran: p, indeks } = hasil
  const sebelum = m.pelajaran[indeks - 1]
  const sesudah = m.pelajaran[indeks + 1]

  return (
    <div className="flex h-dvh flex-col">
      <Kepala>
        <Remah ke={`/modul/${m.slug}`}>{m.meta.judul}</Remah>
        <Pemisah />
        <Remah>{p.meta.judul}</Remah>
      </Kepala>
      <div className="flex min-h-0 flex-1">
        {terlipat ? (
          <aside className="flex w-12 shrink-0 flex-col items-center gap-2 border-r bg-card py-3" aria-label="Materi (diciutkan)">
            <Button variant="ghost" size="icon" onClick={() => setTerlipat(false)} aria-label="Tampilkan materi">
              <PanelLeftOpen />
            </Button>
          </aside>
        ) : (
          <aside className="flex w-[clamp(264px,20vw,340px)] shrink-0 flex-col border-r bg-card" aria-label="Materi dan tantangan">
            <Tabs key={p.kunci} defaultValue="materi" className="flex min-h-0 flex-1 flex-col gap-0">
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <TabsList>
                  <TabsTrigger value="materi">Materi</TabsTrigger>
                  <TabsTrigger value="tantangan">
                    Tantangan
                    <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">
                      {lulus.length}/{p.tantangan.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={() => setTerlipat(true)} aria-label="Ciutkan panel materi">
                  <PanelLeftClose />
                </Button>
              </div>
              <TabsContent value="materi" className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Pelajaran {p.meta.urutan}
                </p>
                <h1 className="mb-3 text-[26px] leading-tight">{p.meta.judul}</h1>
                <div className="mb-5 rounded-xl bg-secondary/70 px-4 py-3">
                  <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tujuan</p>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-[14.5px]">
                    {p.meta.tujuan.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <Markdown isi={p.materi} />
              </TabsContent>
              <TabsContent value="tantangan" className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <PanelTantangan pelajaran={p} />
              </TabsContent>
            </Tabs>
            <div className="flex items-center justify-between gap-2 border-t px-3 py-2.5">
              {sebelum ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/modul/${m.slug}/${sebelum.slug}`}>
                    <ChevronLeft data-icon="inline-start" />
                    Sebelumnya
                  </Link>
                </Button>
              ) : (
                <span />
              )}
              {sesudah && (
                <Button size="sm" asChild>
                  <Link to={`/modul/${m.slug}/${sesudah.slug}`}>
                    Berikutnya
                    <ChevronRight data-icon="inline-end" />
                  </Link>
                </Button>
              )}
            </div>
          </aside>
        )}
        <Pemutar
          kodeAwal={p.kode}
          konfigVisual={p.meta.visual as KonfigVisual[]}
          catatan={p.catatan}
          pantau={p.meta.pantau}
          batasLangkah={p.meta.batasLangkah}
          pertumbuhan={p.meta.pertumbuhan}
        />
      </div>
    </div>
  )
}
