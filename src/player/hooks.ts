import { useEffect, useRef } from 'react'
import type { KonfigPertumbuhan } from '@/engine/pertumbuhan'
import { klienEngine, klienUkur } from '@/worker/klienEngine'
import { usePemutar } from './store'

export const JEDA_KETIK_MS = 400
/** Durasi satu langkah pada kecepatan 1×. */
export const DURASI_LANGKAH_MS = 800

/** Jalankan ulang program setiap kali kode atau input berubah (dengan jeda ketik). */
export function useJalankanOtomatis(batasLangkah?: number): void {
  const sumber = usePemutar((s) => s.sumber)
  const stdin = usePemutar((s) => s.stdin)
  const versi = usePemutar((s) => s.versi)
  const seed = usePemutar((s) => s.seed)
  const terakhir = useRef<{ sumber: string; stdin: string } | null>(null)

  useEffect(() => {
    if (!sumber) return
    const pertama = usePemutar.getState().trace === null && usePemutar.getState().hasil === null
    // Jeda ketik hanya untuk perubahan kode/input; tombol (mis. Acak ulang) langsung menjalankan.
    const sama = terakhir.current?.sumber === sumber && terakhir.current?.stdin === stdin
    const timer = setTimeout(
      () => {
        terakhir.current = { sumber, stdin }
        usePemutar.getState().mulaiJalan()
        void klienEngine.jalankan(sumber, { stdin, batasLangkah, seed }).then((h) => usePemutar.getState().terimaHasil(versi, h))
      },
      pertama || sama ? 0 : JEDA_KETIK_MS,
    )
    return () => clearTimeout(timer)
  }, [sumber, stdin, versi, batasLangkah, seed])
}

/** Ukur ulang grafik pertumbuhan setiap kali program berhasil dijalankan ulang. */
export function useUkurPertumbuhan(konfig: KonfigPertumbuhan | undefined): void {
  const jumlahRun = usePemutar((s) => s.jumlahRun)
  useEffect(() => {
    const s = usePemutar.getState()
    if (!konfig || !s.hasil?.ok || jumlahRun === 0) return
    const versi = s.versi
    s.mulaiUkur()
    void klienUkur.ukur(s.sumber, konfig, { stdin: s.stdin, seed: s.seed }).then((h) => usePemutar.getState().terimaPertumbuhan(versi, h))
  }, [jumlahRun, konfig])
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

/** Elemen yang memakai sendiri tombol panah/Home/End (navigasi bawaan widget). */
const PEMILIK_PANAH =
  '.cm-editor, input, textarea, select, [contenteditable="true"], [role="slider"], [role="tab"], [role="tablist"], [role="radio"], [role="radiogroup"], [role="menuitem"], [role="option"], [role="listbox"], [role="combobox"]'
/** Elemen yang diaktifkan dengan Spasi (tombol, tautan, kotak centang, …). */
const PEMILIK_SPASI = `${PEMILIK_PANAH}, button, a[href], summary, [role="button"], [role="checkbox"], [role="switch"], [role="link"]`

/** Apakah elemen yang sedang fokus (atau dialog yang terbuka) seharusnya menangani tombol ini sendiri. */
function tombolMilikElemenLain(key: string): boolean {
  if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return true
  const el = document.activeElement
  if (!el || el === document.body) return false
  return el.closest(key === ' ' ? PEMILIK_SPASI : PEMILIK_PANAH) !== null
}

/** Pintasan keyboard pemutar: ←/→, Shift+←/→ (±10), Home/End, Spasi. Tidak aktif saat mengetik atau memakai widget lain. */
export function usePintasanPemutar(): void {
  useEffect(() => {
    const lepas = () => {
      if (usePemutar.getState().menyeret) usePemutar.getState().setMenyeret(false)
    }
    const tangani = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || tombolMilikElemenLain(e.key)) return
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
