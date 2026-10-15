import type { OpsiJalan } from '@/engine'
import type { HasilEngine, PermintaanEngine } from './protokol'

const BATAS_WAKTU_MS = 3000

interface Tunggu {
  resolve: (h: HasilEngine) => void
  timer: ReturnType<typeof setTimeout>
}

/**
 * Menjalankan mesin Java Mini di Web Worker agar UI tidak pernah membeku.
 * Bila sebuah run melebihi batas waktu, worker dihentikan lalu dibuat ulang.
 */
export class KlienEngine {
  private worker: Worker | null = null
  private idBerikut = 1
  private readonly menunggu = new Map<number, Tunggu>()

  private pastikanWorker(): Worker {
    if (this.worker) return this.worker
    const w = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (ev: MessageEvent<HasilEngine>) => {
      const t = this.menunggu.get(ev.data.id)
      if (!t) return
      clearTimeout(t.timer)
      this.menunggu.delete(ev.data.id)
      t.resolve(ev.data)
    }
    w.onerror = (ev) => {
      ev.preventDefault()
      this.mulaiUlang(`Worker gagal: ${ev.message}`)
    }
    this.worker = w
    return w
  }

  private mulaiUlang(alasan: string, timeout = false): void {
    this.worker?.terminate()
    this.worker = null
    for (const [id, t] of this.menunggu) {
      clearTimeout(t.timer)
      t.resolve({ id, ok: false, diagnostik: [], penanda: {}, konstruksi: [], galat: alasan, timeout, durasiMs: BATAS_WAKTU_MS })
    }
    this.menunggu.clear()
  }

  jalankan(sumber: string, opsi: OpsiJalan = {}): Promise<HasilEngine> {
    const id = this.idBerikut++
    const w = this.pastikanWorker()
    return new Promise((resolve) => {
      const timer = setTimeout(
        () => this.mulaiUlang('Program berjalan lebih dari 3 detik dan dihentikan. Kemungkinan ada perulangan yang sangat lama atau tak berujung.', true),
        BATAS_WAKTU_MS,
      )
      this.menunggu.set(id, { resolve, timer })
      const pesan: PermintaanEngine = { id, sumber, opsi }
      w.postMessage(pesan)
    })
  }
}

export const klienEngine = new KlienEngine()
