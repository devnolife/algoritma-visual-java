import { Pause, Play, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Trace } from '@/engine'
import { cn } from '@/lib/utils'
import { usePemutar, type Kecepatan } from './store'

type JenisTanda = 'output' | 'pantau' | 'exception'

const WARNA_TANDA: Record<JenisTanda, string> = {
  output: 'bg-baca',
  pantau: 'bg-tulis',
  exception: 'bg-galat',
}

function hitungTanda(trace: Trace, pantau: string[]): { i: number; jenis: JenisTanda }[] {
  const hasil: { i: number; jenis: JenisTanda }[] = []
  trace.langkah.forEach((l, i) => {
    if (l.jenis === 'exception' || l.jenis === 'batas') hasil.push({ i, jenis: 'exception' })
    else if (l.peristiwa.some((p) => p.k === 'cetak' && !p.err)) hasil.push({ i, jenis: 'output' })
    else if (pantau.length && l.peristiwa.some((p) => (p.k === 'tulis' || p.k === 'deklarasi' || p.k === 'tulis-statik') && pantau.includes(p.nama))) {
      hasil.push({ i, jenis: 'pantau' })
    }
  })
  // Batasi jumlah tanda agar tetap ringan untuk trace panjang.
  if (hasil.length <= 400) return hasil
  const loncat = Math.ceil(hasil.length / 400)
  return hasil.filter((t, k) => t.jenis === 'exception' || k % loncat === 0)
}

function TombolIkon({ label, kbd, onClick, disabled, children, utama }: { label: string; kbd?: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; utama?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={utama ? 'default' : 'outline'} size="icon-lg" aria-label={label} onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {kbd && <span className="ml-2 font-mono text-[11px] opacity-70">{kbd}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

export function BilahKontrol({ pantau = [] }: { pantau?: string[] }) {
  const trace = usePemutar((s) => s.trace)
  const langkah = usePemutar((s) => s.langkah)
  const bermain = usePemutar((s) => s.bermain)
  const kecepatan = usePemutar((s) => s.kecepatan)
  const jumlahRun = usePemutar((s) => s.jumlahRun)
  const aksi = usePemutar.getState()
  const n = trace?.langkah.length ?? 0
  const tanda = useMemo(() => (trace ? hitungTanda(trace, pantau) : []), [trace, pantau])

  const kosong = n === 0
  return (
    <div className="flex h-16 items-center gap-4 border-t bg-card px-5">
      <div className="flex items-center gap-1.5">
        <TombolIkon label="Ke langkah pertama" kbd="Home" onClick={() => (aksi.jeda(), aksi.keLangkah(0))} disabled={kosong || langkah === 0}>
          <SkipBack />
        </TombolIkon>
        <TombolIkon label="Langkah sebelumnya" kbd="←" onClick={() => (aksi.jeda(), aksi.mundur())} disabled={kosong || langkah === 0}>
          <StepBack />
        </TombolIkon>
        <TombolIkon label={bermain ? 'Jeda' : 'Putar otomatis'} kbd="Spasi" onClick={() => (bermain ? aksi.jeda() : aksi.putar())} disabled={kosong} utama>
          {bermain ? <Pause /> : <Play />}
        </TombolIkon>
        <TombolIkon label="Langkah berikutnya" kbd="→" onClick={() => (aksi.jeda(), aksi.maju())} disabled={kosong || langkah >= n - 1}>
          <StepForward />
        </TombolIkon>
        <TombolIkon label="Ke langkah terakhir" kbd="End" onClick={() => (aksi.jeda(), aksi.keLangkah(n - 1))} disabled={kosong || langkah >= n - 1}>
          <SkipForward />
        </TombolIkon>
      </div>

      <SliderPrimitive.Root
        className="relative flex h-10 min-w-0 flex-1 touch-none select-none items-center"
        min={0}
        max={Math.max(0, n - 1)}
        step={1}
        value={[Math.min(langkah, Math.max(0, n - 1))]}
        disabled={kosong}
        onValueChange={([v]) => {
          aksi.jeda()
          aksi.keLangkah(v)
        }}
        onPointerDown={() => aksi.setMenyeret(true)}
        onPointerUp={() => aksi.setMenyeret(false)}
        onLostPointerCapture={() => aksi.setMenyeret(false)}
        aria-label="Geser untuk memilih langkah"
      >
        <SliderPrimitive.Track className="relative h-2 grow rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
          {n > 1 &&
            tanda.map((t) => (
              <span
                key={t.i}
                className={cn('pointer-events-none absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full', WARNA_TANDA[t.jenis])}
                style={{ left: `${(t.i / (n - 1)) * 100}%` }}
              />
            ))}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block size-5 rounded-full border-2 border-primary bg-card shadow-md outline-none transition-[box-shadow] duration-150 focus-visible:ring-4 focus-visible:ring-ring/40"
          aria-label="Langkah"
          aria-valuetext={n === 0 ? 'Belum ada langkah' : `Langkah ${langkah + 1} dari ${n}, baris ${trace?.langkah[langkah]?.baris ?? '-'}`}
        />
      </SliderPrimitive.Root>

      <div className="flex shrink-0 items-center gap-3 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-[3px] rounded-full bg-baca" />
          output
        </span>
        {pantau.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-[3px] rounded-full bg-tulis" />
            {pantau.join(', ')} berubah
          </span>
        )}
      </div>

      <div className="relative flex min-w-[120px] shrink-0 flex-col items-end justify-center whitespace-nowrap">
        <span className="font-mono text-[13px] tabular-nums">
          Langkah <b className="text-foreground">{n === 0 ? 0 : langkah + 1}</b> / {n}
        </span>
        {jumlahRun > 1 && (
          <span key={jumlahRun} className="info-run absolute -bottom-3 whitespace-nowrap text-[11px] text-tulis" role="status">
            Dijalankan ulang · {n} langkah
          </span>
        )}
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={String(kecepatan)}
        onValueChange={(v) => v && aksi.setKecepatan(Number(v) as Kecepatan)}
        aria-label="Kecepatan putar"
      >
        {(['0.5', '1', '2', '4'] as const).map((k) => (
          <ToggleGroupItem key={k} value={k} aria-label={`Kecepatan ${k === '0.5' ? 'setengah' : k} kali`} className="px-2 text-[12px] tabular-nums">
            {k === '0.5' ? '½' : k}×
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
