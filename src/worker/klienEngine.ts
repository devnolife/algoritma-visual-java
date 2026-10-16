import type { OpsiJalan } from '@/engine'
import type { HasilPertumbuhan, KonfigPertumbuhan } from '@/engine/pertumbuhan'
import type { HasilEngine, HasilUkur, PermintaanEngine, PermintaanUkur } from './protokol'

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
      t.resolve({ id, ok: false, diagnostik: [], penanda: {}, konstruksi: [], barisPernyataan: [], galat: alasan, timeout, durasiMs: BATAS_WAKTU_MS })
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

const BATAS_WAKTU_UKUR_MS = 8000

/**
 * Pengukur grafik pertumbuhan dengan worker sendiri, agar run utama (animasi) tidak pernah menunggu.
 * Permintaan baru membatalkan permintaan lama: worker yang sedang sibuk dihentikan lalu dibuat ulang.
 */
export class KlienUkur {
  private worker: Worker | null = null
  private idBerikut = 1
  private tunggu: { id: number; resolve: (h: HasilPertumbuhan) => void; timer: ReturnType<typeof setTimeout> } | null = null

  private hentikan(galat: string): void {
    this.worker?.terminate()
    this.worker = null
    if (this.tunggu) {
      clearTimeout(this.tunggu.timer)
      this.tunggu.resolve({ seri: [], galat })
      this.tunggu = null
    }
  }

  private pastikanWorker(): Worker {
    if (this.worker) return this.worker
    const w = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (ev: MessageEvent<HasilUkur>) => {
      const t = this.tunggu
      if (!t || ev.data.id !== t.id) return
      clearTimeout(t.timer)
      this.tunggu = null
      t.resolve(ev.data.hasil)
    }
    w.onerror = (ev) => {
      ev.preventDefault()
      this.hentikan(`Pengukur gagal: ${ev.message}`)
    }
    this.worker = w
    return w
  }

  ukur(sumber: string, konfig: KonfigPertumbuhan, opsi: PermintaanUkur['opsi'] = {}): Promise<HasilPertumbuhan> {
    if (this.tunggu) this.hentikan('dibatalkan')
    const id = this.idBerikut++
    const w = this.pastikanWorker()
    return new Promise((resolve) => {
      const timer = setTimeout(() => this.hentikan('Pengukuran dihentikan karena terlalu lama.'), BATAS_WAKTU_UKUR_MS)
      this.tunggu = { id, resolve, timer }
      const pesan: PermintaanUkur = { jenis: 'ukur', id, sumber, konfig, opsi }
      w.postMessage(pesan)
    })
  }
}

export const klienUkur = new KlienUkur()
