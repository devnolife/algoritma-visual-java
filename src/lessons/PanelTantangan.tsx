import type { Pelajaran } from './urai'

/** Sementara: daftar tantangan tanpa pemeriksa (pemeriksa otomatis ditambahkan berikutnya). */
export function PanelTantangan({ pelajaran }: { pelajaran: Pelajaran }) {
  if (pelajaran.tantangan.length === 0) return <p className="text-[14px] text-muted-foreground">Belum ada tantangan untuk pelajaran ini.</p>
  return (
    <ol className="flex flex-col gap-4">
      {pelajaran.tantangan.map((t, i) => (
        <li key={t.id} className="rounded-xl border bg-card px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tantangan {i + 1}</p>
          <h3 className="text-lg">{t.judul}</h3>
          <p className="text-[14.5px]">{t.soal}</p>
        </li>
      ))}
    </ol>
  )
}
