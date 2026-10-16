import type { Diagnostik, OpsiJalan, Trace } from '@/engine'
import type { HasilPertumbuhan, KonfigPertumbuhan } from '@/engine/pertumbuhan'

export interface PermintaanJalan {
  jenis?: 'jalan'
  id: number
  sumber: string
  opsi: OpsiJalan
}

/** Ukur program pada beberapa ukuran n untuk grafik pertumbuhan. */
export interface PermintaanUkur {
  jenis: 'ukur'
  id: number
  sumber: string
  konfig: KonfigPertumbuhan
  opsi: { stdin?: string; seed?: number }
}

export type PermintaanEngine = PermintaanJalan | PermintaanUkur

export interface HasilUkur {
  jenis: 'ukur'
  id: number
  hasil: HasilPertumbuhan
  durasiMs: number
}

export interface HasilEngine {
  id: number
  ok: boolean
  diagnostik: Diagnostik[]
  penanda: Record<number, string>
  trace?: Trace
  /** Konstruksi Java yang dipakai (for, while, rekursi, method:nama, …). */
  konstruksi: string[]
  /** Baris yang bisa mendapat langkah (untuk meredupkan baris yang tidak pernah dijalankan). */
  barisPernyataan: number[]
  /** Galat internal simulator (bug), bukan error Java. */
  galat?: string
  /** true bila worker dihentikan paksa karena melebihi batas waktu. */
  timeout?: boolean
  durasiMs: number
}
