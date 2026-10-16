import { CircleCheck, CircleDot } from 'lucide-react'
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
  const tantanganTotal = m.pelajaran.reduce((n, p) => n + p.tantangan.length, 0)
  return (
    <div className="flex min-h-dvh flex-col">
      <Kepala>
        <Remah ke="/">Beranda</Remah>
        <Pemisah />
        <Remah>{m.meta.judul}</Remah>
      </Kepala>
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-5 pb-20 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        <header className="flex max-w-[68ch] flex-col gap-3">
          <h1 className="text-[32px] leading-tight tracking-[-0.02em] md:text-[40px]">{m.meta.judul}</h1>
          <p className="text-[17px] leading-relaxed text-muted-foreground">{m.meta.ringkasan}</p>
          <p className="text-[14px] text-muted-foreground">
            {m.pelajaran.length} pelajaran · {tantanganTotal} tantangan
          </p>
        </header>
        <ol className="grid gap-x-6 gap-y-1 md:grid-cols-2">
          {m.pelajaran.map((p) => {
            const lulusIni = lulus[p.kunci]?.length ?? 0
            const selesai = p.tantangan.length > 0 && lulusIni >= p.tantangan.length
            const status = p.tantangan.length > 0 ? `${lulusIni}/${p.tantangan.length} tantangan` : dibuka[p.kunci] ? 'sudah dibuka' : ''
            return (
              <li
                key={p.kunci}
                className="group relative flex gap-4 rounded-xl px-4 py-4 transition-colors duration-200 hover:bg-card has-[a:focus-visible]:bg-card has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/40"
              >
                <span className="w-6 shrink-0 pt-px text-right font-mono text-[14px] font-semibold tabular-nums text-muted-foreground">{p.meta.urutan}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="text-[17px] leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    <Link to={`/modul/${m.slug}/${p.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-xl">
                      {p.meta.judul}
                    </Link>
                  </h2>
                  <p className="text-[14.5px] leading-relaxed text-muted-foreground">{p.meta.ringkasan}</p>
                  {status && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      {selesai ? (
                        <CircleCheck className="size-4 text-tulis-teks" aria-hidden="true" />
                      ) : dibuka[p.kunci] ? (
                        <CircleDot className="size-4 text-primary" aria-hidden="true" />
                      ) : null}
                      {status}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}
