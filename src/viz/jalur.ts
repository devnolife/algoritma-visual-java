import type { Nilai } from '@/engine/nilai'
import type { FrameState, ObjekHeap, StateMesin, Trace, VarState } from '@/engine/trace'

export interface HasilCari {
  v: VarState
  frame: FrameState | undefined
}

/** Cari variabel bernama `nama` dari frame teratas ke bawah, lalu variabel statik. */
export function cariVariabel(state: StateMesin, nama: string): HasilCari | undefined {
  for (let i = state.frames.length - 1; i >= 0; i--) {
    const v = state.frames[i].vars.find((x) => x.nama === nama)
    if (v) return { v, frame: state.frames[i] }
  }
  const s = state.statik.find((x) => x.nama === nama)
  return s ? { v: s, frame: undefined } : undefined
}

/**
 * Seperti `cariVariabel`, tetapi dari frame terbawah (main) ke atas. Dipakai untuk akar struktur (`kepala`, `akar`):
 * pada rekursi, `root` milik main adalah seluruh pohon, sedangkan `root` di frame teratas hanya subpohon.
 */
export function cariVariabelLuar(state: StateMesin, nama: string): HasilCari | undefined {
  for (const f of state.frames) {
    const v = f.vars.find((x) => x.nama === nama)
    if (v) return { v, frame: f }
  }
  const s = state.statik.find((x) => x.nama === nama)
  return s ? { v: s, frame: undefined } : undefined
}

/** Semua nama variabel (lokal, parameter, static) yang pernah ada selama program berjalan. */
export function namaVariabelDiTrace(trace: Trace): Set<string> {
  const nama = new Set<string>()
  for (const l of trace.langkah) {
    for (const p of l.peristiwa) {
      if (p.k === 'deklarasi' || p.k === 'deklarasi-statik') nama.add(p.nama)
      else if (p.k === 'panggil') for (const v of p.frame.vars) nama.add(v.nama)
    }
  }
  return nama
}

const PRIMITIF = new Set(['int', 'long', 'short', 'byte', 'char', 'double', 'float', 'boolean'])

/** Tipe primitif Java (nilainya bukan id heap). */
export const adalahPrimitif = (tipe: string) => PRIMITIF.has(tipe)

export type Objek = Extract<ObjekHeap, { k: 'objek' }>

/** Objek berfield di heap untuk nilai referensi, atau undefined. */
export function objekDari(heap: StateMesin['heap'], v: Nilai | undefined): Objek | undefined {
  if (typeof v !== 'number') return undefined
  const o = heap[v]
  return o?.k === 'objek' ? o : undefined
}

export type MasalahJalur = 'tidak-ada' | 'belum-diisi' | 'null-di-tengah' | 'bukan-objek' | 'field-tidak-ada'

export interface HasilJalur {
  /** Nilai di ujung jalur; undefined bila jalur tidak bisa diikuti sampai habis. */
  nilai?: Nilai
  /** Tipe Java nilai di ujung jalur (tipe variabel atau tipe field terakhir). */
  tipe: string
  masalah?: MasalahJalur
  /** Bagian jalur tempat masalah terjadi, mis. `daftar` atau `daftar.head`. */
  pada?: string
  /** Nama akar jalur (variabel/field static) bila ditemukan. */
  akar?: string
}

/** Pecah jalur `daftar.head.next` menjadi bagian-bagiannya (spasi diabaikan). */
export const bagianJalur = (jalur: string) =>
  jalur
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean)

/**
 * Ikuti jalur variabel → field, mis. `head`, `daftar.head`, `this.head`, field static `kepala`,
 * `Main.kepala`, atau field static class lain `Konfig.awal`.
 * `arah: 'luar'` mencari variabel dari frame terbawah dulu (untuk akar struktur), `'dalam'` dari frame teratas.
 */
export function ikutiJalur(state: StateMesin, jalur: string, arah: 'dalam' | 'luar' = 'dalam'): HasilJalur {
  const bagian = bagianJalur(jalur)
  if (bagian.length === 0) return { tipe: '', masalah: 'tidak-ada', pada: jalur }
  const cari = arah === 'luar' ? cariVariabelLuar : cariVariabel
  let pakai = 1
  let ketemu = cari(state, bagian[0])
  if (!ketemu && bagian.length >= 2) {
    // Field static class lain disimpan dengan nama `Kelas.field`; field static Main bernama polos.
    const statik = state.statik.find((x) => x.nama === `${bagian[0]}.${bagian[1]}`) ?? (bagian[0] === 'Main' ? state.statik.find((x) => x.nama === bagian[1]) : undefined)
    if (statik) {
      ketemu = { v: statik, frame: undefined }
      pakai = 2
    }
  }
  if (!ketemu) return { tipe: '', masalah: 'tidak-ada', pada: bagian[0] }
  const akar = bagian.slice(0, pakai).join('.')
  if (ketemu.v.nilai === undefined) return { tipe: ketemu.v.tipe, masalah: 'belum-diisi', pada: akar, akar }
  let nilai: Nilai = ketemu.v.nilai
  let tipe = ketemu.v.tipe
  for (let i = pakai; i < bagian.length; i++) {
    const sampai = bagian.slice(0, i).join('.')
    if (nilai === null) return { tipe, masalah: 'null-di-tengah', pada: sampai, akar }
    const o = objekDari(state.heap, nilai)
    if (!o) return { tipe, masalah: 'bukan-objek', pada: sampai, akar }
    if (!(bagian[i] in o.field)) return { tipe, masalah: 'field-tidak-ada', pada: `${sampai}.${bagian[i]}`, akar }
    nilai = o.field[bagian[i]]
    tipe = o.tipeField[bagian[i]] ?? 'Object'
  }
  return { nilai, tipe, akar }
}

/** Kalimat singkat untuk masalah jalur (ditampilkan renderer dan pesan cek). */
export function pesanMasalahJalur(h: HasilJalur, jalur: string): string {
  switch (h.masalah) {
    case 'tidak-ada':
      return `\`${h.pada ?? jalur}\` tidak ditemukan`
    case 'belum-diisi':
      return `\`${h.pada ?? jalur}\` belum diisi`
    case 'null-di-tengah':
      return `\`${h.pada}\` bernilai null, jadi \`${jalur}\` tidak bisa diikuti`
    case 'bukan-objek':
      return `\`${h.pada}\` bukan objek, jadi \`${jalur}\` tidak bisa diikuti`
    case 'field-tidak-ada':
      return `field \`${h.pada}\` tidak ada`
    default:
      return ''
  }
}
