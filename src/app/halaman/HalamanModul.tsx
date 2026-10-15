import { ArrowRight, CircleCheck, CircleDot } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { cariModul } from '@/lessons/muat'
import { Kepala, Pemisah, Remah } from '../komponen/Kepala'
import { useProgres } from '../progres'
import { TidakDitemukan } from './TidakDitemukan'

export function HalamanModul() {
  const { modul } = useParams()
  const m = cariModul(modul)
  const dibuka = useProgres((s) => s.dibuka)
  const lulus = useProgres((s) => s.lulus)
  useEffect(() => {
    if (m) document.title = `${m.meta.judul} · Algoritma & Pemrograman Java`
  }, [m])
  if (!m) return <TidakDitemukan />
  return (
    <div className="flex min-h-dvh flex-col">
      <Kepala>
        <Remah ke="/">Beranda</Remah>
        <Pemisah />
        <Remah>{m.meta.judul}</Remah>
      </Kepala>
      <main className="mx-auto flex w-full max-w-[920px] flex-col gap-8 px-10 pb-20 pt-14">
        <header className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">Modul {m.meta.urutan}</p>
          <h1 className="text-[40px] leading-tight">{m.meta.judul}</h1>
          <p className="max-w-[62ch] text-[17px] text-muted-foreground">{m.meta.ringkasan}</p>
        </header>
        <ol className="flex flex-col border-t">
          {m.pelajaran.map((p) => {
            const lulusIni = lulus[p.kunci]?.length ?? 0
            const selesai = p.tantangan.length > 0 && lulusIni >= p.tantangan.length
            return (
              <li key={p.kunci} className="border-b">
                <Link
                  to={`/modul/${m.slug}/${p.slug}`}
                  className="group grid grid-cols-[48px_minmax(0,1fr)_150px_20px] items-center gap-5 py-5 outline-none focus-visible:bg-secondary/60"
                >
                  <span className="font-heading text-[26px] text-muted-foreground/70">{String(p.meta.urutan).padStart(2, '0')}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-heading text-[19px] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{p.meta.judul}</span>
                    <span className="text-[14.5px] text-muted-foreground">{p.meta.ringkasan}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    {selesai ? (
                      <CircleCheck className="size-4 text-tulis" aria-hidden="true" />
                    ) : dibuka[p.kunci] ? (
                      <CircleDot className="size-4 text-primary" aria-hidden="true" />
                    ) : null}
                    {p.tantangan.length > 0 ? `${lulusIni}/${p.tantangan.length} tantangan` : dibuka[p.kunci] ? 'sudah dibuka' : ''}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}
