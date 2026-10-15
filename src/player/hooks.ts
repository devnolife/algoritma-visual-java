import { useEffect } from 'react'
import { klienEngine } from '@/worker/klienEngine'
import { usePemutar } from './store'

export const JEDA_KETIK_MS = 400
/** Durasi satu langkah pada kecepatan 1×. */
export const DURASI_LANGKAH_MS = 800

/** Jalankan ulang program setiap kali kode atau input berubah (dengan jeda ketik). */
export function useJalankanOtomatis(batasLangkah?: number): void {
  const sumber = usePemutar((s) => s.sumber)
  const stdin = usePemutar((s) => s.stdin)
  const versi = usePemutar((s) => s.versi)

  useEffect(() => {
    if (!sumber) return
    const pertama = usePemutar.getState().trace === null && usePemutar.getState().hasil === null
    const timer = setTimeout(
      () => {
        usePemutar.getState().mulaiJalan()
        void klienEngine.jalankan(sumber, { stdin, batasLangkah }).then((h) => usePemutar.getState().terimaHasil(versi, h))
      },
      pertama ? 0 : JEDA_KETIK_MS,
    )
    return () => clearTimeout(timer)
  }, [sumber, stdin, versi, batasLangkah])
}

/** Maju otomatis saat mode putar aktif. */
export function usePutarOtomatis(): void {
  const bermain = usePemutar((s) => s.bermain)
  const langkah = usePemutar((s) => s.langkah)
  const kecepatan = usePemutar((s) => s.kecepatan)
  const total = usePemutar((s) => s.trace?.langkah.length ?? 0)

  useEffect(() => {
    if (!bermain) return
    if (langkah >= total - 1) {
      usePemutar.getState().jeda()
      return
    }
    const timer = setTimeout(() => usePemutar.getState().maju(), DURASI_LANGKAH_MS / kecepatan)
    return () => clearTimeout(timer)
  }, [bermain, langkah, kecepatan, total])
}

function fokusDiInput(): boolean {
  const el = document.activeElement
  if (!el) return false
  return el.closest('.cm-editor, input, textarea, select, [contenteditable="true"], [role="slider"]') !== null
}

/** Pintasan keyboard pemutar: ←/→, Shift+←/→ (±10), Home/End, Spasi. Tidak aktif saat mengetik. */
export function usePintasanPemutar(): void {
  useEffect(() => {
    const lepas = () => {
      if (usePemutar.getState().menyeret) usePemutar.getState().setMenyeret(false)
    }
    const tangani = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || fokusDiInput()) return
      const s = usePemutar.getState()
      if (!s.trace) return
      // Tombol ditahan: render instan tanpa transisi.
      if (e.repeat && !s.menyeret) s.setMenyeret(true)
      const lompat = e.shiftKey ? 10 : 1
      switch (e.key) {
        case 'ArrowRight':
          s.jeda()
          s.maju(lompat)
          break
        case 'ArrowLeft':
          s.jeda()
          s.mundur(lompat)
          break
        case 'Home':
          s.jeda()
          s.keLangkah(0)
          break
        case 'End':
          s.jeda()
          s.keLangkah(s.trace.langkah.length - 1)
          break
        case ' ':
          if (s.bermain) s.jeda()
          else s.putar()
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', tangani)
    window.addEventListener('keyup', lepas)
    return () => {
      window.removeEventListener('keydown', tangani)
      window.removeEventListener('keyup', lepas)
    }
  }, [])
}
