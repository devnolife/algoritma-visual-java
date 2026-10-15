import type { Diagnostik, OpsiJalan, Trace } from '@/engine'

export interface PermintaanEngine {
  id: number
  sumber: string
  opsi: OpsiJalan
}

export interface HasilEngine {
  id: number
  ok: boolean
  diagnostik: Diagnostik[]
  penanda: Record<number, string>
  trace?: Trace
  /** Konstruksi Java yang dipakai (for, while, rekursi, method:nama, …). */
  konstruksi: string[]
  /** Galat internal simulator (bug), bukan error Java. */
  galat?: string
  /** true bila worker dihentikan paksa karena melebihi batas waktu. */
  timeout?: boolean
  durasiMs: number
}
