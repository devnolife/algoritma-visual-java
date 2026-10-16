import { useEffect, useState } from 'react'
import type { Diagnostik } from '@/engine'
import { DaftarMasalah } from '@/player/DaftarMasalah'
import { klienEngine } from '@/worker/klienEngine'
import { BingkaiGalat, KerangkaGalat } from './BingkaiDemo'
import { KODE_GALAT } from './demoBeranda'

/** Contoh error sungguhan: kode dikompilasi mesin Java Mini, pesannya ditampilkan dengan panel Masalah milik pemutar. */
export function ContohGalat() {
  const [diagnostik, setDiagnostik] = useState<Diagnostik[] | null>(null)
  const [gagal, setGagal] = useState(false)
  useEffect(() => {
    let batal = false
    void klienEngine.jalankan(KODE_GALAT).then((h) => {
      if (batal) return
      if (h.ok || h.diagnostik.length === 0) setGagal(true)
      else setDiagnostik(h.diagnostik.slice(0, 1))
    })
    return () => {
      batal = true
    }
  }, [])
  if (gagal) {
    return <BingkaiGalat isi={<p className="text-[13.5px] text-muted-foreground">Contoh error tidak bisa dimuat di browser ini.</p>} />
  }
  if (!diagnostik) return <KerangkaGalat />
  return <BingkaiGalat kolom={diagnostik[0].kolom} isi={<DaftarMasalah diagnostik={diagnostik} />} />
}
