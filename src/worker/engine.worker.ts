import { analisisKonstruksi } from '@/engine/analisis'
import { jalankan, kompilasi } from '@/engine'
import type { HasilEngine, PermintaanEngine } from './protokol'

interface KonteksWorker {
  onmessage: ((ev: MessageEvent<PermintaanEngine>) => void) | null
  postMessage(pesan: HasilEngine): void
}

const ctx = self as unknown as KonteksWorker

ctx.onmessage = (ev) => {
  const { id, sumber, opsi } = ev.data
  const mulai = performance.now()
  try {
    const k = kompilasi(sumber)
    if (!k.ok || !k.program) {
      ctx.postMessage({ id, ok: false, diagnostik: k.diagnostik, penanda: k.penanda, konstruksi: [], durasiMs: performance.now() - mulai })
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
      durasiMs: performance.now() - mulai,
    })
  } catch (e) {
    ctx.postMessage({
      id,
      ok: false,
      diagnostik: [],
      penanda: {},
      konstruksi: [],
      galat: e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e),
      durasiMs: performance.now() - mulai,
    })
  }
}
