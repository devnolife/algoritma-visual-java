import { Play } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { Button } from '@/components/ui/button'
import { BARIS_GALAT, BARIS_HAPUS, KODE_DEMO, KODE_GALAT } from './demoBeranda'
import { KodeMini } from './KodeMini'

/**
 * Bingkai demo hero: kode, panggung visual, narasi, dan kontrol. Dipakai demo sungguhan maupun kerangkanya,
 * sehingga ukurannya identik dan tidak ada pergeseran layout saat demo selesai dimuat.
 */
export function BingkaiDemo({
  aktif,
  dihapus,
  visual,
  kalimat,
  kontrol,
  bingkaiRef,
}: {
  aktif?: number
  dihapus?: boolean
  visual: ReactNode
  kalimat?: ReactNode
  kontrol: ReactNode
  bingkaiRef?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={bingkaiRef}
      className="overflow-hidden rounded-xl border bg-card shadow-[0_28px_60px_-40px_color-mix(in_oklch,var(--foreground)_55%,transparent)]"
    >
      <KodeMini
        kode={KODE_DEMO}
        label="Kode program demo, bubble sort lima angka"
        aktif={aktif}
        dihapus={dihapus ? BARIS_HAPUS : undefined}
        className="text-[12px] leading-[1.4]"
      />
      <div className="kertas-petak flex flex-col gap-2 border-t px-4 pb-3 pt-3">
        <div className="flex h-[190px] items-end overflow-hidden">{visual}</div>
        <p className="line-clamp-2 min-h-[2lh] text-[13.5px] leading-snug">{kalimat ?? '\u00a0'}</p>
      </div>
      <div className="flex h-11 items-center gap-2 border-t px-2.5">{kontrol}</div>
    </div>
  )
}

/** Batang abu-abu selama mesin belum mengirim trace. */
export function KerangkaBatang() {
  return (
    <div className="flex h-[190px] items-end gap-1.5 pb-[52px]" aria-hidden="true">
      {[62, 25, 100, 12, 50].map((t, i) => (
        <div key={i} className="flex w-14 justify-center">
          <div className="w-[72%] rounded-t-md bg-muted motion-safe:animate-pulse" style={{ height: `${t * 0.88}px` }} />
        </div>
      ))}
    </div>
  )
}

/** Kerangka demo selama potongan kodenya dimuat. */
export function KerangkaDemo() {
  return (
    <BingkaiDemo
      visual={<KerangkaBatang />}
      kontrol={
        <>
          <Button variant="ghost" size="icon" disabled aria-label="Putar demo">
            <Play />
          </Button>
          <div className="h-1.5 flex-1 rounded-full bg-muted" aria-hidden="true" />
          <span className="w-14 shrink-0" />
          <Button variant="outline" size="sm" disabled className="w-[9.5rem] shrink-0">
            Hapus baris {BARIS_HAPUS}
          </Button>
        </>
      }
    />
  )
}

/** Bingkai contoh error: kode dengan baris error di kiri, pesan javac dan penjelasannya di kanan. */
export function BingkaiGalat({ kolom, isi }: { kolom?: number; isi: ReactNode }) {
  return (
    <div className="grid overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <KodeMini kode={KODE_GALAT} label={`Kode dengan kesalahan tipe di baris ${BARIS_GALAT}`} galat={{ baris: BARIS_GALAT, kolom }} className="py-2" />
      <div className="border-t bg-background/60 p-4 lg:border-l lg:border-t-0">{isi}</div>
    </div>
  )
}

export function KerangkaGalat() {
  return (
    <BingkaiGalat
      isi={
        <div className="flex flex-col gap-2.5 rounded-lg border bg-card px-3 py-3" aria-hidden="true">
          <div className="h-3 w-4/5 rounded bg-muted motion-safe:animate-pulse" />
          <div className="h-3 w-full rounded bg-muted motion-safe:animate-pulse" />
          <div className="h-3 w-11/12 rounded bg-muted motion-safe:animate-pulse" />
          <div className="h-3 w-3/5 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      }
    />
  )
}
