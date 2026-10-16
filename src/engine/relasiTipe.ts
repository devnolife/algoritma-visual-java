/**
 * Relasi antartipe untuk type checker Fase 2: supertipe (dengan substitusi argumen generik), subtipe,
 * containment wildcard, konversi assignment/pemanggilan/casting (JLS 5), dan boxing/unboxing.
 * Mengenal class mahasiswa (lewat tabel `InfoKelas`) dan tipe pustaka (lewat `hierarki.ts`).
 */
import type * as A from './ast'
import { indukException, rantaiException as rantaiExceptionPustaka, tipePustaka } from './hierarki'
import {
  bisaWidening, PEMBUNGKUS, samaTipe, T, tipeBoks, tipeUnboks, type HasilAssign, type NamaPrimitif, type Tipe,
} from './tipe'

export type TipeKelas = Extract<Tipe, { k: 'kelas' }>

const OBJECT = T.Object as TipeKelas

/** Batas nilai konstanta yang boleh dipersempit otomatis ke byte/short/char (JLS 5.2). */
function konstantaMuat(nilai: number, ke: NamaPrimitif): boolean {
  if (ke === 'byte') return nilai >= -128 && nilai <= 127
  if (ke === 'short') return nilai >= -32768 && nilai <= 32767
  if (ke === 'char') return nilai >= 0 && nilai <= 0xffff
  return false
}

const adalahRef = (t: Tipe) => t.k === 'kelas' || t.k === 'array' || t.k === 'null' || t.k === 'variabel'

export class DuniaTipe {
  constructor(readonly kelasUser: ReadonlyMap<string, A.InfoKelas>) {}

  user(nama: string): A.InfoKelas | undefined {
    return this.kelasUser.get(nama)
  }

  /** Antarmuka pustaka (class mahasiswa selalu class biasa). */
  antarmuka(nama: string): boolean {
    return !this.kelasUser.has(nama) && (tipePustaka(nama)?.antarmuka ?? false)
  }

  /** Class `final` (aturan casting). */
  final(nama: string): boolean {
    const u = this.kelasUser.get(nama)
    if (u) return u.deklarasi.modifier.includes('final')
    return tipePustaka(nama)?.final ?? false
  }

  /** Parameter tipe class pustaka (class mahasiswa tidak generik). */
  parameterKelas(nama: string): string[] {
    if (this.kelasUser.has(nama)) return []
    return tipePustaka(nama)?.parameter ?? []
  }

  /** true bila `t` adalah tipe generik tanpa argumen tipe (raw type). */
  mentah(t: Tipe): boolean {
    return t.k === 'kelas' && !t.argumen && this.parameterKelas(t.nama).length > 0
  }

  /** Supertipe langsung (superclass lebih dulu, lalu antarmuka), dengan argumen tipe yang sudah disubstitusi. */
  superLangsung(t: TipeKelas): TipeKelas[] {
    if (t.nama === 'Object') return []
    const u = this.kelasUser.get(t.nama)
    if (u) return [(u.induk as TipeKelas | undefined) ?? OBJECT, ...(u.antarmuka as TipeKelas[])]
    const info = tipePustaka(t.nama)
    if (info) {
      const mentah = info.parameter.length > 0 && !t.argumen
      const peta = new Map(info.parameter.map((p, i) => [p, t.argumen?.[i] ?? OBJECT]))
      return info.super.map((s): TipeKelas => {
        const punyaParam = (tipePustaka(s.nama)?.parameter.length ?? 0) > 0
        if (mentah || !punyaParam || s.argumen.length === 0) return { k: 'kelas', nama: s.nama }
        return { k: 'kelas', nama: s.nama, argumen: s.argumen.map((a) => peta.get(a) ?? { k: 'kelas', nama: a }) }
      })
    }
    const induk = indukException(t.nama)
    if (induk) return [{ k: 'kelas', nama: induk }]
    return [OBJECT]
  }

  /** Pandang `t` sebagai supertipe bernama `nama` (dengan substitusi), atau null bila bukan supertipenya. */
  asSuper(t: Tipe, nama: string): TipeKelas | null {
    if (t.k === 'kelas') {
      if (t.nama === nama) return t
      for (const s of this.superLangsung(t)) {
        const h = this.asSuper(s, nama)
        if (h) return h
      }
      return null
    }
    if ((t.k === 'array' || t.k === 'variabel') && nama === 'Object') return OBJECT
    return null
  }

  /** Subtipe (JLS 4.10), termasuk subtipe primitif untuk perbandingan kespesifikan method. */
  subtipe(s: Tipe, t: Tipe): boolean {
    if (s.k === 'error' || t.k === 'error') return true
    if (s.k === 'primitif' || t.k === 'primitif') {
      if (s.k !== 'primitif' || t.k !== 'primitif') return false
      return s.nama === t.nama || bisaWidening(s, t)
    }
    if (s.k === 'void' || t.k === 'void') return s.k === t.k
    if (s.k === 'null') return adalahRef(t)
    if (t.k === 'kelas' && t.nama === 'Object') return true
    if (s.k === 'variabel') return t.k === 'variabel' && t.nama === s.nama
    if (s.k === 'array') {
      if (t.k !== 'array') return false
      if (s.elemen.k === 'primitif' || t.elemen.k === 'primitif') return samaTipe(s.elemen, t.elemen)
      return this.subtipe(s.elemen, t.elemen)
    }
    if (s.k === 'kelas' && t.k === 'kelas') {
      const sup = this.asSuper(s, t.nama)
      if (!sup) return false
      if (!t.argumen || t.argumen.length === 0) return true
      if (!sup.argumen) return false
      return t.argumen.every((a, i) => this.mengandung(a, sup.argumen![i]))
    }
    return false
  }

  /** Containment argumen tipe (JLS 4.5.1): apakah `arg` (mungkin wildcard) memuat `s`. */
  mengandung(arg: Tipe, s: Tipe): boolean {
    if (arg.k === 'error' || s.k === 'error') return true
    if (arg.k === 'wildcard') {
      if (!arg.batas || !arg.tipe) return true
      if (arg.batas === 'extends') {
        const atas = s.k === 'wildcard' ? (s.batas === 'extends' && s.tipe ? s.tipe : s.batas === null ? OBJECT : null) : s
        return atas !== null && this.subtipe(atas, arg.tipe)
      }
      const bawah = s.k === 'wildcard' ? (s.batas === 'super' && s.tipe ? s.tipe : null) : s
      return bawah !== null && this.subtipe(arg.tipe, bawah)
    }
    if (s.k === 'wildcard') return false
    return samaTipe(arg, s)
  }

  /** Konversi unchecked (raw → berparameter), JLS 5.1.9. */
  unchecked(dari: Tipe, ke: Tipe): boolean {
    if (dari.k !== 'kelas' || ke.k !== 'kelas' || !ke.argumen) return false
    const sup = this.asSuper(dari, ke.nama)
    return sup !== null && !sup.argumen
  }

  /** Konteks pemanggilan "strict" (JLS 5.3): identitas, widening primitif/referensi, unchecked. */
  strict(dari: Tipe, ke: Tipe): boolean {
    if (dari.k === 'error' || ke.k === 'error') return true
    if (dari.k === 'primitif' || ke.k === 'primitif') return dari.k === 'primitif' && ke.k === 'primitif' && this.subtipe(dari, ke)
    if (dari.k === 'void' || ke.k === 'void') return false
    return this.subtipe(dari, ke) || this.unchecked(dari, ke)
  }

  /** Konteks pemanggilan "loose": strict ditambah boxing/unboxing (JLS 5.3). */
  longgar(dari: Tipe, ke: Tipe): boolean {
    if (this.strict(dari, ke)) return true
    if (dari.k === 'primitif' && ke.k !== 'primitif') return ke.k !== 'void' && this.subtipe(tipeBoks(dari.nama), ke)
    if (dari.k !== 'primitif' && ke.k === 'primitif') {
      const p = this.unboks(dari)
      return p !== undefined && (p.nama === ke.nama || bisaWidening(p, ke))
    }
    return false
  }

  /** Tipe primitif hasil unboxing bila `t` adalah pembungkus (atau subtipenya), selain itu undefined. */
  unboks(t: Tipe): { k: 'primitif'; nama: NamaPrimitif } | undefined {
    return tipeUnboks(t)
  }

  /**
   * Konversi assignment (JLS 5.2): identitas/widening, boxing lalu widening referensi, unboxing lalu widening
   * primitif, penyempitan konstanta (termasuk `Character c = 65`), dan unchecked.
   */
  cekAssign(dari: Tipe, ke: Tipe, konstan?: unknown): HasilAssign {
    if (dari.k === 'error' || ke.k === 'error') return 'ok'
    if (dari.k === 'void') return 'tidak-cocok'
    if (this.longgar(dari, ke)) return 'ok'
    const angka = typeof konstan === 'number' ? konstan : undefined
    const kecil = (n: NamaPrimitif) => n === 'int' || n === 'short' || n === 'char' || n === 'byte'
    if (dari.k === 'primitif' && ke.k === 'primitif') {
      if (dari.nama === 'boolean' || ke.nama === 'boolean') return 'tidak-cocok'
      if (angka !== undefined && kecil(dari.nama) && (ke.nama === 'byte' || ke.nama === 'short' || ke.nama === 'char') && konstantaMuat(angka, ke.nama)) return 'ok'
      return 'lossy'
    }
    if (dari.k === 'primitif' && ke.k === 'kelas' && angka !== undefined && kecil(dari.nama)) {
      const p = tipeUnboks(ke)
      if (p && (p.nama === 'byte' || p.nama === 'short' || p.nama === 'char') && konstantaMuat(angka, p.nama)) return 'ok'
    }
    return 'tidak-cocok'
  }

  /** Konversi casting (JLS 5.5). */
  bisaCast(dari: Tipe, ke: Tipe): boolean {
    if (dari.k === 'error' || ke.k === 'error') return true
    if (samaTipe(dari, ke)) return true
    if (dari.k === 'primitif' && ke.k === 'primitif') return (dari.nama === 'boolean') === (ke.nama === 'boolean')
    if (dari.k === 'void' || ke.k === 'void') return false
    if (dari.k === 'primitif') return this.subtipe(tipeBoks(dari.nama), ke)
    if (ke.k === 'primitif') {
      const p = this.unboks(dari)
      if (p) return p.nama === ke.nama || bisaWidening(p, ke)
      return this.subtipe(tipeBoks(ke.nama), dari)
    }
    if (dari.k === 'null') return true
    return this.bisaCastReferensi(dari, ke)
  }

  private bisaCastReferensi(s: Tipe, t: Tipe): boolean {
    if (this.subtipe(s, t) || this.subtipe(t, s)) return true
    if (s.k === 'variabel' || t.k === 'variabel') return true
    if (s.k === 'array' || t.k === 'array') {
      if (s.k === 'array' && t.k === 'array') {
        if (s.elemen.k === 'primitif' || t.elemen.k === 'primitif') return samaTipe(s.elemen, t.elemen)
        return this.bisaCastReferensi(s.elemen, t.elemen)
      }
      return false
    }
    if (s.k !== 'kelas' || t.k !== 'kelas') return false
    // Tipe berparameter yang sama class-nya tetapi argumennya pasti berbeda tidak bisa di-cast.
    if (s.nama === t.nama) return !(s.argumen && t.argumen)
    const sAntarmuka = this.antarmuka(s.nama)
    const tAntarmuka = this.antarmuka(t.nama)
    if (sAntarmuka && tAntarmuka) return true
    if (sAntarmuka) return !this.final(t.nama) || this.asSuper(t, s.nama) !== null
    if (tAntarmuka) return !this.final(s.nama) || this.asSuper(s, t.nama) !== null
    // Dua class: harus berhubungan lewat pewarisan (dicek dengan erasure).
    return this.asSuper(s, t.nama) !== null || this.asSuper(t, s.nama) !== null
  }

  /** Rantai leluhur exception (nama kanonik/pustaka), atau undefined bila bukan turunan Throwable. */
  rantaiException(t: Tipe): string[] | undefined {
    if (t.k !== 'kelas') return undefined
    const u = this.kelasUser.get(t.nama)
    if (u) return u.exception
    const r = rantaiExceptionPustaka(t.nama)
    return r.length ? r : undefined
  }

  /** Apakah `t` turunan Throwable. */
  throwable(t: Tipe): boolean {
    return this.rantaiException(t) !== undefined
  }

  /** Checked exception (JLS 11.1.1). */
  checked(t: Tipe): boolean {
    const r = this.rantaiException(t)
    return r !== undefined && !r.includes('RuntimeException') && !r.includes('Error')
  }

  /** Tipe pembungkus untuk primitif, atau `t` sendiri bila sudah referensi. */
  boksBila(t: Tipe): Tipe {
    return t.k === 'primitif' ? tipeBoks(t.nama) : t
  }

  /** Apakah `t` (atau hasil unboxing-nya) bertipe numerik/boolean primitif. */
  primitifDari(t: Tipe): { k: 'primitif'; nama: NamaPrimitif } | undefined {
    if (t.k === 'primitif') return t
    return this.unboks(t)
  }

  /** Daftar nama pembungkus yang dikenal. */
  static readonly PEMBUNGKUS = new Set(Object.values(PEMBUNGKUS))
}
