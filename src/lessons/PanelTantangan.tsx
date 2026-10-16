import { CheckCircle2, CircleDashed, Lightbulb, LoaderCircle, PlayCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useProgres } from '@/app/progres'
import { usePemutar } from '@/player/store'
import { TeksSebaris } from '@/player/TeksSebaris'
import { klienEngine } from '@/worker/klienEngine'
import type { Tantangan } from './skema'
import { periksaTantangan, type HasilTantangan } from './tantangan/periksa'
import type { Pelajaran } from './urai'

const KOSONG: string[] = []

export function PanelTantangan({ pelajaran }: { pelajaran: Pelajaran }) {
  const lulus = useProgres((s) => s.lulus[pelajaran.kunci]) ?? KOSONG
  if (pelajaran.tantangan.length === 0) return <p className="text-[14px] text-muted-foreground">Belum ada tantangan untuk pelajaran ini.</p>
  return (
    <div className="flex flex-col gap-4">
      {/* Judul materi (h1) tidak ikut dirender di tab ini, jadi struktur heading diberi h1 sendiri. */}
      <h1 className="sr-only">Tantangan: {pelajaran.meta.judul}</h1>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Ubah kode di editor sesuai soal, lalu tekan <strong className="text-foreground">Periksa</strong>. Kodemu dijalankan dengan input uji dan dicek otomatis.
      </p>
      {pelajaran.tantangan.map((t, i) => (
        <KartuTantangan
          key={`${pelajaran.kunci}/${t.id}`}
          tantangan={t}
          nomor={i + 1}
          kunci={pelajaran.kunci}
          sudahLulus={lulus.includes(t.id)}
          batasLangkah={pelajaran.meta.batasLangkah}
        />
      ))}
    </div>
  )
}

function KartuTantangan({
  tantangan: t,
  nomor,
  kunci,
  sudahLulus,
  batasLangkah,
}: {
  tantangan: Tantangan
  nomor: number
  kunci: string
  sudahLulus: boolean
  batasLangkah?: number
}) {
  const [hasil, setHasil] = useState<{ h: HasilTantangan; sumber: string } | null>(null)
  const [memeriksa, setMemeriksa] = useState(false)
  const [petunjuk, setPetunjuk] = useState(0)
  const sumber = usePemutar((s) => s.sumber)
  const basi = hasil !== null && hasil.sumber !== sumber

  const periksa = async () => {
    setMemeriksa(true)
    const kode = usePemutar.getState().sumber
    try {
      const h = await periksaTantangan(t, kode, (s, input) => klienEngine.jalankan(s, { stdin: input, batasLangkah }))
      setHasil({ h, sumber: kode })
      if (h.lulus) useProgres.getState().tandaiLulus(kunci, t.id)
    } finally {
      setMemeriksa(false)
    }
  }

  const jumlahLulus = hasil?.h.butir.filter((b) => b.lulus).length ?? 0
  return (
    <section className={cn('flex flex-col gap-3 rounded-xl border bg-card px-4 py-3.5', sudahLulus && 'border-tulis/40')} aria-labelledby={`tantangan-${t.id}`}>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tantangan {nomor}</span>
        {sudahLulus && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-tulis-lembut px-2 py-0.5 text-[12px] font-semibold text-tulis-teks">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Lulus
          </span>
        )}
      </div>
      <h2 id={`tantangan-${t.id}`} className="-mt-1 text-[19px] leading-snug">
        {t.judul}
      </h2>
      <p className="text-[14.5px] leading-relaxed">
        <TeksSebaris teks={t.soal} />
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={periksa} disabled={memeriksa} aria-describedby={`tantangan-${t.id}`}>
          {memeriksa ? <LoaderCircle className="animate-spin motion-reduce:animate-none" data-icon="inline-start" /> : <PlayCircle data-icon="inline-start" />}
          {memeriksa ? 'Memeriksa…' : hasil ? 'Periksa lagi' : 'Periksa'}
        </Button>
        {t.petunjuk.length > 0 && petunjuk < t.petunjuk.length && (
          <Button size="sm" variant="ghost" onClick={() => setPetunjuk((p) => p + 1)}>
            <Lightbulb data-icon="inline-start" />
            {petunjuk === 0 ? 'Butuh petunjuk?' : 'Petunjuk berikutnya'}
            <span className="text-[11.5px] text-muted-foreground tabular-nums">
              {petunjuk}/{t.petunjuk.length}
            </span>
          </Button>
        )}
      </div>

      {petunjuk > 0 && (
        <ol aria-live="polite" aria-label="Petunjuk" className="flex flex-col gap-1.5 rounded-lg bg-banding-lembut/70 px-3 py-2.5 text-[14px] leading-relaxed">
          {t.petunjuk.slice(0, petunjuk).map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold tabular-nums">{i + 1}.</span>
              <span>
                <TeksSebaris teks={p} />
              </span>
            </li>
          ))}
        </ol>
      )}

      {hasil && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className={cn('text-[14px] font-semibold', hasil.h.lulus ? 'text-tulis-teks' : 'text-foreground')}>
            {hasil.h.lulus ? 'Semua cek terpenuhi. Kerja bagus!' : `${jumlahLulus} dari ${hasil.h.butir.length} cek terpenuhi.`}
            {basi && <span className="ml-1 font-normal text-muted-foreground">(kode sudah diubah sejak diperiksa)</span>}
          </p>
          <ul className="flex flex-col gap-2">
            {hasil.h.butir.map((b, i) => (
              <li key={i} className="flex gap-2 text-[14px] leading-snug">
                {b.lulus ? (
                  <CheckCircle2 className="mt-px size-4 shrink-0 text-tulis" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-px size-4 shrink-0 text-galat" aria-hidden="true" />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <span>
                    <span className="sr-only">{b.lulus ? 'Terpenuhi: ' : 'Belum terpenuhi: '}</span>
                    <TeksSebaris teks={b.pesan} />
                  </span>
                  {!b.lulus && b.rincian && (
                    <pre className="overflow-x-auto rounded-md border bg-muted/50 px-2.5 py-1.5 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">{b.rincian}</pre>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasil && !sudahLulus && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <CircleDashed className="size-3.5" aria-hidden="true" />
          {t.cek.length} cek otomatis
        </p>
      )}
    </section>
  )
}
