import { AnimatePresence, motion } from 'motion/react'

export { hitungSorotan, kelasSorotan, kelasSorotanBanyak, jenisSorotan, type Sorotan } from './sorotan'
export { cariVariabel, namaVariabelDiTrace } from './jalur'

export const EASE_KELUAR = [0.23, 1, 0.32, 1] as const

/**
 * Pesan saat variabel yang dirujuk sebuah visual tidak tersedia: belum dideklarasikan pada langkah ini,
 * atau sama sekali tidak ada di kode (mis. namanya diubah mahasiswa).
 */
export function PesanVariabel({ nama, adaDiKode, adaMemori }: { nama: string; adaDiKode: boolean; adaMemori: boolean }) {
  return (
    <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">
      Variabel <code className="kode-sebaris">{nama}</code>{' '}
      {adaDiKode ? (
        'belum ada pada langkah ini.'
      ) : (
        <>tidak ditemukan di kodemu, mungkin namanya sudah diubah.{adaMemori && ' Isi variabel lain tetap terlihat di panel memori di bawah.'}</>
      )}
    </p>
  )
}

/** Teks nilai yang berganti dengan transisi singkat (lama keluar ke atas, baru masuk dari bawah). */
export function NilaiBerubah({ teks, instan, className }: { teks: string; instan: boolean; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className ?? ''}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={teks}
          className="gerak col-start-1 row-start-1 whitespace-pre"
          initial={{ opacity: 0, transform: 'translateY(45%)' }}
          animate={{ opacity: 1, transform: 'translateY(0%)' }}
          exit={{ opacity: 0, transform: 'translateY(-45%)' }}
          transition={instan ? { duration: 0 } : { duration: 0.18, ease: EASE_KELUAR }}
        >
          {teks}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
