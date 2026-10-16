import type { Diagnostik } from '@/engine'
import { TeksSebaris } from './TeksSebaris'

/** Daftar error kompilasi gaya javac beserta penjelasan Bahasa Indonesia (tab Masalah, juga contoh di Beranda). */
export function DaftarMasalah({ diagnostik, galat, simulator }: { diagnostik: Diagnostik[]; galat?: string; simulator?: string }) {
  if (diagnostik.length === 0 && !galat && !simulator) {
    return <p className="text-[13px] text-muted-foreground">Tidak ada masalah. Kode berhasil dikompilasi.</p>
  }
  return (
    <ol className="flex flex-col gap-3">
      {galat && (
        <li className="rounded-lg border border-galat/30 bg-galat-lembut px-3 py-2 text-[13px]">
          <b>Simulator:</b> {galat.split('\n')[0]}
        </li>
      )}
      {simulator && <li className="rounded-lg bg-banding-lembut px-3 py-2 text-[13px]">{simulator}</li>}
      {diagnostik.map((d, i) => (
        <li key={i} className="flex flex-col gap-1 rounded-lg border border-galat/25 bg-card px-3 py-2.5">
          <code className="font-mono text-[12px] leading-snug text-galat">
            Main.java:{d.baris}: error: {d.pesan}
            {d.detail.map((x, j) => (
              <span key={j} className="block pl-4 text-muted-foreground">
                {x}
              </span>
            ))}
          </code>
          <p className="text-[13.5px] leading-relaxed">
            <b>Artinya:</b> <TeksSebaris teks={d.artinya} />
          </p>
          {d.saran && (
            <p className="text-[13.5px] leading-relaxed">
              <b>Saran:</b> <TeksSebaris teks={d.saran} />
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}
