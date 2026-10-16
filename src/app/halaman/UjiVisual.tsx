import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { PembacaTrace } from '@/engine/trace'
import { cn } from '@/lib/utils'
import { Panggung } from '@/viz/Panggung'
import { semuaSkenario } from './ujiVisual/skenario'

/**
 * Harness visual khusus pengembangan (`#/uji-visual/:skenario?langkah=N`): merender setiap renderer dengan trace
 * fixture pada lebar panggung yang sama dengan halaman pelajaran di layar 1366 px.
 */
export function UjiVisual() {
  const { skenario } = useParams()
  const [cari, setCari] = useSearchParams()
  const daftar = useMemo(() => semuaSkenario(), [])
  const s = daftar.find((x) => x.id === skenario) ?? daftar[0]
  const pembaca = useMemo(() => new PembacaTrace(s.trace), [s])
  const n = s.trace.langkah.length
  const langkah = Math.max(0, Math.min(n - 1, Number(cari.get('langkah') ?? 0) || 0))
  const lebar = cari.get('lebar') === 'lebar' ? 760 : 515
  const tinggi = Number(cari.get('tinggi')) || 560
  const state = pembaca.stateDi(langkah)
  const ke = (i: number) => setCari((c) => {
    c.set('langkah', String(Math.max(0, Math.min(n - 1, i))))
    return c
  })
  useEffect(() => {
    document.title = `Uji visual · ${s.judul}`
  }, [s])

  return (
    <div className="flex min-h-dvh">
      <nav aria-label="Skenario uji visual" className="w-60 shrink-0 border-r bg-card p-3">
        <h1 className="mb-2 font-heading text-[17px]">Uji visual</h1>
        <ul className="flex flex-col gap-0.5 text-[13px]">
          {daftar.map((x) => (
            <li key={x.id}>
              <Link to={`/uji-visual/${x.id}`} className={cn('block rounded-md px-2 py-1 hover:bg-muted', x.id === s.id && 'bg-muted font-semibold')}>
                {x.id}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-[16px]">{s.judul}</h2>
          <span className="ml-auto flex items-center gap-1 text-[13px] tabular-nums">
            <Button size="icon-sm" variant="outline" aria-label="Langkah sebelumnya" onClick={() => ke(langkah - 1)} disabled={langkah === 0}>
              <ChevronLeft />
            </Button>
            langkah {langkah + 1}/{n} (baris {s.trace.langkah[langkah]?.baris})
            <Button size="icon-sm" variant="outline" aria-label="Langkah berikutnya" onClick={() => ke(langkah + 1)} disabled={langkah >= n - 1}>
              <ChevronRight />
            </Button>
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="kertas-petak relative shrink-0 overflow-auto rounded-xl border" style={{ width: lebar, height: tinggi }}>
            <div className="min-h-full py-4 pr-5 pl-9">
              <Panggung trace={s.trace} state={state} indeks={langkah} output={pembaca.outputDi(langkah)} stdin="" konfig={s.konfig} instan={false} />
            </div>
          </div>
          <pre className="max-h-[560px] min-w-0 flex-1 overflow-auto rounded-lg border bg-card p-2 font-mono text-[11px] leading-snug text-muted-foreground">
            {s.trace.langkah[langkah]?.peristiwa.map((p) => JSON.stringify(p, (_k, v) => (typeof v === 'bigint' ? `${v}n` : v))).join('\n')}
          </pre>
        </div>
      </main>
    </div>
  )
}
