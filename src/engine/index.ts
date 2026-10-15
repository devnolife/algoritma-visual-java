import { periksa, type ProgramTerperiksa } from './checker'
import { PengumpulDiagnostik, type Diagnostik } from './diagnostik'
import { lex } from './lexer'
import { parse } from './parser'
import { jalankanProgram, type OpsiJalan } from './runtime/interpreter'
import { Sumber } from './sumber'
import type { Trace } from './trace'

export type { Diagnostik } from './diagnostik'
export type { OpsiJalan } from './runtime/interpreter'
export { OPSI_BAWAAN } from './runtime/interpreter'
export * from './trace'

export interface HasilKompilasi {
  ok: boolean
  diagnostik: Diagnostik[]
  /** Penanda catatan dosen: baris → nama (dari komentar `// #nama`). */
  penanda: Record<number, string>
  program?: ProgramTerperiksa
  sumber: Sumber
}

export function kompilasi(teks: string): HasilKompilasi {
  const sumber = new Sumber(teks)
  const diag = new PengumpulDiagnostik(sumber)
  const { token, penanda } = lex(sumber, diag)
  const objPenanda = Object.fromEntries(penanda)
  const unit = parse(token, diag)
  const gagal = (): HasilKompilasi => ({
    ok: false,
    diagnostik: [...diag.daftar].sort((a, b) => a.span.awal - b.span.awal),
    penanda: objPenanda,
    sumber,
  })
  if (diag.adaError) return gagal()
  const program = periksa(unit, diag)
  if (diag.adaError || !program) return gagal()
  return { ok: true, diagnostik: [], penanda: objPenanda, program, sumber }
}

export function jalankan(hasil: HasilKompilasi, opsi: OpsiJalan = {}): Trace {
  if (!hasil.ok || !hasil.program) throw new Error('Program belum berhasil dikompilasi')
  return jalankanProgram(hasil.program, hasil.sumber, opsi)
}

export interface HasilEksekusi {
  ok: boolean
  diagnostik: Diagnostik[]
  penanda: Record<number, string>
  trace?: Trace
}

export function kompilasiDanJalankan(teks: string, opsi: OpsiJalan = {}): HasilEksekusi {
  const k = kompilasi(teks)
  if (!k.ok) return { ok: false, diagnostik: k.diagnostik, penanda: k.penanda }
  return { ok: true, diagnostik: [], penanda: k.penanda, trace: jalankan(k, opsi) }
}
