import { AlertCircle, Dices, LoaderCircle, PencilLine, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EditorJava } from '@/editor/EditorJava'
import { cn } from '@/lib/utils'
import { Panggung, VISUAL_BAWAAN, type KonfigVisual } from '@/viz/Panggung'
import { BilahKontrol } from './BilahKontrol'
import { useJalankanOtomatis, usePintasanPemutar, usePutarOtomatis } from './hooks'
import { KartuPenjelasan } from './KartuPenjelasan'
import { PanelIO } from './PanelIO'
import { traceBasi, usePemutar } from './store'
import { TeksSebaris } from './TeksSebaris'

export interface PropsPemutar {
  kodeAwal: string
  konfigVisual?: KonfigVisual[]
  catatan?: Record<string, string>
  pantau?: string[]
  batasLangkah?: number
}

function Tunggu({ ikon, judul, isi }: { ikon: React.ReactNode; judul: string; isi?: React.ReactNode }) {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        {ikon}
        <p className="font-heading text-lg">{judul}</p>
        {isi && <div className="text-[14px] text-muted-foreground">{isi}</div>}
      </div>
    </div>
  )
}

export function Pemutar({ kodeAwal, konfigVisual = VISUAL_BAWAAN, catatan, pantau, batasLangkah }: PropsPemutar) {
  useJalankanOtomatis(batasLangkah)
  usePutarOtomatis()
  usePintasanPemutar()

  const sumber = usePemutar((s) => s.sumber)
  const stdin = usePemutar((s) => s.stdin)
  const trace = usePemutar((s) => s.trace)
  const pembaca = usePemutar((s) => s.pembaca)
  const langkah = usePemutar((s) => s.langkah)
  const hasil = usePemutar((s) => s.hasil)
  const sedangJalan = usePemutar((s) => s.sedangJalan)
  const menyeret = usePemutar((s) => s.menyeret)
  const penanda = usePemutar((s) => s.penanda)
  const pakaiAcak = usePemutar((s) => s.konstruksi.includes('pustaka:Math.random'))
  const basi = traceBasi({ hasil, trace })

  const state = pembaca?.stateDi(langkah)
  const output = pembaca?.outputDi(langkah) ?? ''
  const l = trace?.langkah[langkah]
  const diagnostik = hasil && !hasil.ok ? hasil.diagnostik : []
  const barisPudar = useMemo(() => {
    if (!trace || !hasil?.ok) return null
    return new Set(hasil.barisPernyataan.filter((b) => !trace.hitunganBaris[b]))
  }, [trace, hasil])

  const klikBaris = (baris: number) => {
    if (!trace || basi) return
    const s = usePemutar.getState()
    let j = trace.langkah.findIndex((x, i) => i > s.langkah && x.baris === baris)
    if (j < 0) j = trace.langkah.findIndex((x) => x.baris === baris)
    if (j >= 0) {
      s.jeda()
      s.keLangkah(j)
    }
  }

  let isiPanggung: React.ReactNode
  if (trace && state) {
    isiPanggung = <Panggung trace={trace} state={state} indeks={langkah} output={output} stdin={stdin} konfig={konfigVisual} instan={menyeret} />
  } else if (hasil && !hasil.ok) {
    const d = hasil.diagnostik[0]
    isiPanggung = (
      <Tunggu
        ikon={<AlertCircle className="size-7 text-galat" aria-hidden="true" />}
        judul="Kode belum bisa dijalankan"
        isi={d ? <>Baris {d.baris}: <TeksSebaris teks={d.artinya} /> Lihat tab Masalah untuk detailnya.</> : hasil.galat}
      />
    )
  } else {
    isiPanggung = <Tunggu ikon={<LoaderCircle className="size-7 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />} judul="Menjalankan program…" />
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(400px,min(50%,640px))] grid-rows-[minmax(0,1fr)_auto]">
      <main className="flex min-h-0 min-w-0 flex-col gap-3 p-4" aria-label="Visualisasi program">
        <div className="kertas-petak relative min-h-0 flex-1 overflow-auto rounded-xl border">
          <div className={cn('min-h-full py-4 pl-9 pr-5 transition-[opacity,filter] duration-200', basi && 'opacity-35 grayscale')}>{isiPanggung}</div>
          {sedangJalan && trace && !basi && (
            <span className="pointer-events-none absolute top-2.5 right-3 flex items-center gap-1.5 rounded-full border bg-card/90 px-2.5 py-1 text-[12px] text-muted-foreground" role="status">
              <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              menjalankan ulang…
            </span>
          )}
          {basi && (
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
              <span className="flex items-center gap-2 rounded-full border border-galat/30 bg-card px-3.5 py-1.5 text-[13px] font-semibold shadow-sm" role="status">
                <AlertCircle className="size-4 text-galat" aria-hidden="true" />
                Animasi dijeda sampai error di baris {diagnostik[0]?.baris ?? '?'} diperbaiki
              </span>
            </div>
          )}
        </div>
        {trace && state && !basi && (
          <KartuPenjelasan trace={trace} indeks={langkah} state={state} sumber={sumber} penanda={penanda} catatan={catatan} />
        )}
      </main>

      <section className="flex min-h-0 flex-col border-l bg-card" aria-label="Kode Java">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
          <span className="font-mono text-[13px] font-semibold">Main.java</span>
          <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] text-muted-foreground">
            <PencilLine className="size-3" aria-hidden="true" />
            bisa diedit
          </span>
          {pakaiAcak && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => usePemutar.getState().acakUlang()}>
                  <Dices data-icon="inline-start" />
                  Acak ulang
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-[12.5px] leading-snug">
                Math.random() di simulator memakai benih tetap agar animasi tidak berubah setiap kali kode diedit. Klik untuk mencoba angka acak lain.
              </TooltipContent>
            </Tooltip>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className={cn(!pakaiAcak && 'ml-auto')} disabled={sumber === kodeAwal}>
                <RotateCcw data-icon="inline-start" />
                Reset kode
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kembalikan kode awal?</AlertDialogTitle>
                <AlertDialogDescription>Semua perubahan yang kamu buat di Main.java akan hilang.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => usePemutar.getState().setSumber(kodeAwal)}>Ya, kembalikan</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>
        <div className="min-h-0 flex-1">
          <EditorJava
            nilai={sumber}
            onUbah={(s) => usePemutar.getState().setSumber(s)}
            aktif={!basi && l ? { baris: l.baris, jenis: l.jenis } : null}
            diagnostik={diagnostik}
            barisPudar={basi ? null : barisPudar}
            onKlikNomorBaris={klikBaris}
            onPintasan={(arah) => {
              const s = usePemutar.getState()
              s.jeda()
              if (arah > 0) s.maju()
              else s.mundur()
            }}
          />
        </div>
        <div className="h-[210px] shrink-0 border-t [@media(max-height:760px)]:h-[164px]">
          <PanelIO />
        </div>
      </section>

      <div className="col-span-2">
        <BilahKontrol pantau={pantau} />
      </div>
    </div>
  )
}
