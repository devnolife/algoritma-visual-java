import { useEffect } from 'react'
import { usePemutar } from '@/player/store'
import { kodeTersimpan } from '../progres'

/** Simpan otomatis kode yang sedang diedit; hapus simpanan bila kembali sama dengan kode awal. */
export function useSimpanKode(kunci: string, kodeAwal: string): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const lepas = usePemutar.subscribe((s, lama) => {
      if (s.sumber === lama.sumber) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (s.sumber === kodeAwal) kodeTersimpan.hapus(kunci)
        else kodeTersimpan.simpan(kunci, s.sumber)
      }, 500)
    })
    return () => {
      clearTimeout(timer)
      lepas()
    }
  }, [kunci, kodeAwal])
}
