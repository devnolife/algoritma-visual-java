import { analisisKonstruksi, barisBisaDijalankan } from '@/engine/analisis'
import { jalankan, kompilasi } from '@/engine'
import { ukurPertumbuhan } from '@/engine/ukurPertumbuhan'
import type { HasilEngine, HasilUkur, PermintaanEngine, PermintaanUkur } from './protokol'

interface KonteksWorker {
  onmessage: ((ev: MessageEvent<PermintaanEngine>) => void) | null
  postMessage(pesan: HasilEngine | HasilUkur): void
}

const ctx = self as unknown as KonteksWorker

function ukur({ id, sumber, konfig, opsi }: PermintaanUkur): HasilUkur {
  const mulai = performance.now()
  const k = kompilasi(sumber)
  const hasil = !k.ok || !k.program ? { seri: [], galat: 'Kode belum bisa dikompilasi.' } : ukurPertumbuhan(k, konfig, opsi)
  return { jenis: 'ukur', id, hasil, durasiMs: performance.now() - mulai }
}

ctx.onmessage = (ev) => {
  const pesan = ev.data
  if (pesan.jenis === 'ukur') {
    try {
      ctx.postMessage(ukur(pesan))
    } catch (e) {
      ctx.postMessage({ jenis: 'ukur', id: pesan.id, hasil: { seri: [], galat: e instanceof Error ? e.message : String(e) }, durasiMs: 0 })
    }
    return
  }
  const { id, sumber, opsi } = pesan
  const mulai = performance.now()
  try {
    const k = kompilasi(sumber)
    if (!k.ok || !k.program) {
      ctx.postMessage({ id, ok: false, diagnostik: k.diagnostik, penanda: k.penanda, konstruksi: [], barisPernyataan: [], durasiMs: performance.now() - mulai })
      return
    }
    const trace = jalankan(k, opsi)
    ctx.postMessage({
      id,
      ok: true,
      diagnostik: [],
      penanda: k.penanda,
      trace,
      konstruksi: analisisKonstruksi(k.program),
      barisPernyataan: barisBisaDijalankan(k.program, k.sumber),
      durasiMs: performance.now() - mulai,
    })
  } catch (e) {
    ctx.postMessage({
      id,
      ok: false,
      diagnostik: [],
      penanda: {},
      konstruksi: [],
      barisPernyataan: [],
      galat: e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e),
      durasiMs: performance.now() - mulai,
    })
  }
}
