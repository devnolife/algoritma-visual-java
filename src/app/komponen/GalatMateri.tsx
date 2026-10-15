import { FileWarning } from 'lucide-react'
import { GALAT_KONTEN } from '@/lessons/muat'

/** Ditampilkan bila ada berkas materi yang tidak valid, agar dosen tahu file mana yang perlu diperbaiki. */
export function GalatMateri() {
  if (!GALAT_KONTEN) return null
  return (
    <div className="border-b border-galat/30 bg-galat-lembut px-5 py-3 text-[14px]" role="alert">
      <p className="flex items-center gap-2 font-semibold">
        <FileWarning className="size-4 text-galat" aria-hidden="true" />
        Ada berkas materi yang tidak valid, jadi materi belum bisa ditampilkan.
      </p>
      <p className="mt-1 font-mono text-[12.5px]">{GALAT_KONTEN}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Jalankan <code className="kode-sebaris">pnpm cek-konten</code> untuk detail. Tips: beri tanda kutip pada teks YAML yang mengandung titik dua (": ").
      </p>
    </div>
  )
}
