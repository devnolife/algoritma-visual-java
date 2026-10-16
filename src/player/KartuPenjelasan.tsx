import { AlertTriangle, NotebookPen } from 'lucide-react'
import { useMemo } from 'react'
import type { StateMesin, Trace } from '@/engine'
import { narasikan } from '@/engine/narasi'
import { TeksSebaris } from './TeksSebaris'

export function KartuPenjelasan({
  trace,
  indeks,
  state,
  sumber,
  penanda,
  catatan,
  diam = false,
}: {
  trace: Trace
  indeks: number
  state: StateMesin
  sumber: string
  penanda: Record<number, string>
  catatan?: Record<string, string>
  /** true saat putar otomatis: narasi tidak diumumkan pembaca layar agar tidak menumpuk. */
  diam?: boolean
}) {
  const narasi = useMemo(() => narasikan(trace, indeks, state, { sumber, penanda, catatan }), [trace, indeks, state, sumber, penanda, catatan])
  const l = trace.langkah[indeks]
  return (
    <section
      className="flex max-h-[42%] shrink-0 gap-3 overflow-y-auto rounded-xl border bg-card px-4 py-3 shadow-[0_1px_0_0_var(--border)]"
      aria-label={`Penjelasan langkah ${indeks + 1} dari ${trace.langkah.length}`}
    >
      <span className="mt-[3px] h-fit shrink-0 rounded-full border px-2 py-px text-[12px] whitespace-nowrap text-muted-foreground tabular-nums">
        {l && l.baris > 0 ? `baris ${l.baris}` : `langkah ${indeks + 1}`}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div aria-live={diam ? 'off' : 'polite'} className="flex flex-col gap-1.5 text-[15px] leading-relaxed">
        {narasi.kalimat.map((k, i) => (
          <p key={i}>
            <TeksSebaris teks={k} />
          </p>
        ))}
        {narasi.peringatan.map((k, i) => (
          <p key={`p${i}`} className="flex gap-2 rounded-lg bg-banding-lembut px-3 py-2 text-[14px]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-banding-teks" aria-hidden="true" />
            <span>
              <TeksSebaris teks={k} />
            </span>
          </p>
        ))}
      </div>
      {narasi.catatan && (
        <div className="flex gap-2.5 rounded-lg bg-secondary/70 px-3 py-2.5 text-[14px] leading-relaxed">
          <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <span className="mr-2 rounded-[4px] bg-muted px-1.5 py-px font-mono text-[11px] text-muted-foreground">#{narasi.catatan.nama}</span>
            <TeksSebaris teks={narasi.catatan.isi} />
          </div>
        </div>
      )}
      </div>
    </section>
  )
}
