/**
 * Pemeriksaan ekspresi Fase 2: nama dan akses field (termasuk objek luar inner class), pemanggilan method dan
 * konstruktor dengan resolusi overload + inferensi generik, operator dengan boxing/unboxing, ternary (JLS 15.25),
 * casting, `this`, dan lambda bertarget `Comparator`.
 */
import { anakNode } from './analisis'
import type * as A from './ast'
import { teksRingkas } from './cetakJava'
import { PemeriksaDasar, saranMirip, type DataKandidat, type HasilKelas, type KandidatMethod, type KonteksLambda } from './checkerDasar'
import { katalog, type IsiPesan } from './diagnostik'
import { primitifKeString } from './format'
import { aritmetika, bandingkan, bitNot, geser, konversiPrimitif, LemparanJava, negasi, operasiBit } from './nilai'
import type { MethodPustaka } from './pustaka/daftar'
import type { TipeKelas } from './relasiTipe'
import { aritasFungsional, parameterComparator, resolusi, type Alasan, type Argumen, type HasilResolusi } from './resolusi'
import type { Span } from './sumber'
import {
  adalahBoolean, adalahError, adalahIntegral, adalahNumerik, adalahString, memuatVariabel, promosiBiner, promosiUnary,
  samaTipe, substitusi, T, tipeArray, type NamaPrimitif, type Tipe,
} from './tipe'

const OP_ARITMETIKA = new Set(['+', '-', '*', '/', '%'])
const OP_RELASIONAL = new Set(['<', '>', '<=', '>='])

/** Pembawa nilai konstan setelah konversi ke tipe tujuan. */
export function konversiKonstan(nilai: A.NilaiKonstan, dari: Tipe, ke: Tipe): A.NilaiKonstan | undefined {
  if (adalahString(ke)) return adalahString(dari) ? nilai : undefined
  if (dari.k !== 'primitif' || ke.k !== 'primitif') return undefined
  return konversiPrimitif(nilai as number | bigint | boolean, dari.nama, ke.nama) as A.NilaiKonstan
}

/** Bentuk teks konstanta untuk konkatenasi String. */
function konstanKeString(nilai: A.NilaiKonstan, tipe: Tipe): string {
  if (adalahString(tipe)) return nilai as string
  if (tipe.k === 'primitif') return primitifKeString(nilai as number | bigint | boolean, tipe.nama)
  return String(nilai)
}

/** Argumen pemanggilan yang sudah diperiksa sebagian (lambda/diamond ditunda sampai method terpilih). */
interface ArgumenAwal {
  e: A.Ekspresi
  a: Argumen
}

/** Penerima pemanggilan method. */
type Penerima = { k: 'kelas'; hasil: HasilKelas; tipe: TipeKelas } | { k: 'objek'; tipe: Tipe }

type Prim = { k: 'primitif'; nama: NamaPrimitif }

export abstract class PemeriksaEkspresi extends PemeriksaDasar {
  /** Lambda per class untuk penomoran `lambda$<method>$<n>`. */
  protected readonly lambdaKelas = new Map<A.InfoKelas, { lambda: A.Lambda; pemilik: string }[]>()
  /** Field final berinitializer yang sudah diperiksa (konstanta dievaluasi malas seperti javac). */
  protected readonly fieldSelesai = new Set<A.Deklarator>()
  /** Inisialisasi field yang sedang diperiksa (deteksi siklus). */
  private readonly fieldSedang = new Set<A.Deklarator>()

  /** Periksa badan blok (diimplementasikan pemeriksa pernyataan). */
  protected abstract periksaBlok(b: A.Blok, lingkupBaru?: boolean): void
  /** Apakah blok bisa selesai normal (analisis keterjangkauan tanpa laporan). */
  protected abstract bisaSelesaiNormal(b: A.Blok): boolean
  /** Periksa inisialisasi sebuah field (konteks static/instance class pemiliknya). */
  protected abstract periksaInitField(f: A.SimbolField): void

  protected slotTangkapanBaru(): number {
    return this.ctx.slotBerikut++
  }

  // ---------- konversi & kondisi ----------
  protected cekKonversi(dari: Tipe, ke: Tipe, konstan: A.NilaiKonstan | undefined, span: Span): boolean {
    if (adalahError(dari) || adalahError(ke)) return true
    if (dari.k === 'void') {
      this.lapor('tipe-tidak-cocok', span, katalog.tipeTidakCocok('void', this.teks(ke)))
      return false
    }
    const hasil = this.dunia.cekAssign(dari, ke, konstan)
    if (hasil === 'lossy') this.lapor('konversi-lossy', span, katalog.konversiLossy(this.teks(dari), this.teks(ke), this.diag.teks(span)))
    else if (hasil === 'tidak-cocok') this.lapor('tipe-tidak-cocok', span, katalog.tipeTidakCocok(this.teks(dari), this.teks(ke)))
    return hasil === 'ok'
  }

  /** Teks fragmen ketidakcocokan, mis. `String cannot be converted to int`. */
  protected fragmenKonversi(dari: Tipe, ke: Tipe): string {
    const pd = dari.k === 'primitif' && ke.k === 'primitif' && dari.nama !== 'boolean' && ke.nama !== 'boolean'
    return pd ? `possible lossy conversion from ${this.teks(dari)} to ${this.teks(ke)}` : `${this.teks(dari)} cannot be converted to ${this.teks(ke)}`
  }

  protected kondisi(e: A.Ekspresi): void {
    const t = this.ekspresi(e)
    if (adalahError(t)) return
    if (adalahBoolean(t) || (t.k === 'kelas' && t.nama === 'Boolean')) return
    this.lapor('tipe-tidak-cocok', e.span, katalog.tipeTidakCocok(this.teks(t), 'boolean'))
  }

  /** Periksa ekspresi dalam konteks assignment ke tipe `ke` (termasuk inisialisasi array dan lambda). */
  protected periksaInisialisasi(e: A.Ekspresi, ke: Tipe): void {
    if (e.jenis === 'InisialisasiArray') {
      this.inisialisasiArray(e, ke)
      return
    }
    const t = this.ekspresi(e, ke)
    if (e.jenis === 'Lambda' || (e.jenis === 'Kondisional' && this.kondisionalPoli.has(e))) return
    this.cekKonversi(t, ke, e.konstan, e.span)
  }

  protected inisialisasiArray(e: A.InisialisasiArray, ke: Tipe): void {
    if (adalahError(ke)) {
      for (const x of e.elemen) if (x.jenis !== 'InisialisasiArray') this.ekspresi(x)
      e.tipe = T.error
      return
    }
    if (ke.k !== 'array') {
      this.lapor('inisialisasi-ilegal', e.span, {
        pesan: `illegal initializer for ${this.teks(ke)}`,
        artinya: `Bentuk {…} hanya untuk array, sedangkan tipe tujuannya ${this.teks(ke)}.`,
      })
      e.tipe = T.error
      return
    }
    e.tipe = ke
    for (const x of e.elemen) this.periksaInisialisasi(x, ke.elemen)
  }

  // ---------- ekspresi ----------
  protected ekspresi(e: A.Ekspresi, target?: Tipe): Tipe {
    const t = this.ekspresiInti(e, target)
    e.tipe = t
    return t
  }

  private ekspresiInti(e: A.Ekspresi, target: Tipe | undefined): Tipe {
    switch (e.jenis) {
      case 'Literal':
        return this.literal(e)
      case 'Nama':
        return this.nama(e)
      case 'AksesField':
        return this.aksesField(e)
      case 'AksesArray':
        return this.aksesArray(e)
      case 'PanggilMethod':
        return this.panggil(e, target)
      case 'BaruArray':
        return this.baruArray(e)
      case 'BaruObjek':
        return this.baruObjek(e, target)
      case 'InisialisasiArray':
        this.lapor('awal-ekspresi-ilegal', e.span, katalog.awalEkspresiIlegal())
        return T.error
      case 'Unary':
        return this.unary(e)
      case 'IncDec':
        return this.incDec(e)
      case 'Biner':
        return this.biner(e)
      case 'Assign':
        return this.assign(e)
      case 'Kondisional':
        return this.kondisional(e, target)
      case 'Cast':
        return this.cast(e)
      case 'This':
        return this.ekspresiThis(e)
      case 'Lambda':
        return this.lambda(e, target)
      case 'PanggilKonstruktor':
        return this.panggilKonstruktor(e)
    }
  }

  private literal(e: A.Literal): Tipe {
    if (e.jenisLiteral !== 'null') e.konstan = e.nilai as A.NilaiKonstan
    switch (e.jenisLiteral) {
      case 'int':
        return T.int
      case 'long':
        return T.long
      case 'float':
        return T.float
      case 'double':
        return T.double
      case 'char':
        return T.char
      case 'string':
        return T.String
      case 'boolean':
        return T.boolean
      case 'null':
        return T.null
    }
  }

  /** Tandai semua lambda yang sedang diperiksa memakai `this`. */
  protected tandaiPakaiThis(): void {
    for (let l = this.ctx.lambda; l; l = l.induk) l.pakaiThis = true
  }

  /**
   * Field bernama sederhana (JLS 6.5.6.1): class saat ini, lalu class luarnya. `luar` = jumlah lompatan ke class
   * pemilik; `statikError` bila diakses melewati konteks static (javac: StaticError).
   */
  protected cariFieldNama(nama: string): { field: A.SimbolField; luar: number; statikError: boolean } | undefined {
    let statikSaja = this.ctx.statik
    let hop = 0
    for (let k: A.InfoKelas | undefined = this.ctx.kelas; k; k = k.luar) {
      const f = this.fieldDiKelas(k, nama)
      if (f) return { field: f, luar: hop, statikError: statikSaja && !f.statik }
      if (k.statik) statikSaja = true
      hop++
    }
    return undefined
  }

  /** Pastikan nilai konstanta field final sudah dihitung (javac menghitungnya malas saat pertama dipakai). */
  protected pastikanKonstan(f: A.SimbolField): void {
    const d = f.deklarasi
    if (!f.final || !d.init || this.fieldSelesai.has(d) || this.fieldSedang.has(d)) return
    if (!(f.tipe.k === 'primitif' || adalahString(f.tipe))) return
    this.fieldSedang.add(d)
    try {
      this.periksaInitField(f)
    } finally {
      this.fieldSedang.delete(d)
    }
  }

  private nama(e: A.Nama): Tipe {
    const lokal = this.cariLokal(e.nama)
    if (lokal) {
      e.ikatan = { k: 'lokal', info: lokal }
      if (lokal.konstan !== undefined) e.konstan = lokal.konstan
      return lokal.tipe
    }
    const f = this.cariFieldNama(e.nama)
    if (f) {
      if (f.statikError) this.lapor('konteks-statik-variabel', e.span, katalog.konteksStatikVariabel(e.nama))
      e.ikatan = f.luar > 0 && !f.field.statik ? { k: 'field', field: f.field, luar: f.luar } : { k: 'field', field: f.field }
      if (!f.field.statik) this.tandaiPakaiThis()
      this.pastikanKonstan(f.field)
      if (f.field.konstan !== undefined) e.konstan = f.field.konstan
      return f.field.tipe
    }
    const isi = katalog.simbolTidakDitemukan('variable', e.nama, this.lokasiKelas(this.ctx.kelas))
    const mirip = saranMirip(e.nama, this.namaTerlihat())
    this.lapor('simbol-tidak-ditemukan', e.span, mirip ? { ...isi, saran: `Mungkin maksudmu \`${mirip}\`? Java membedakan huruf besar dan kecil.` } : isi)
    return T.error
  }

  private namaTerlihat(): string[] {
    const hasil = new Set<string>()
    for (const l of this.ctx.lingkup) for (const k of l.keys()) hasil.add(k)
    for (let k: A.InfoKelas | undefined = this.ctx.kelas; k; k = k.luar) for (const n of k.field.keys()) hasil.add(n)
    return [...hasil]
  }

  /** Nama class sebagai kualifier (`Math`, `Node`, `Main.Node`), atau undefined bila ekspresi biasa. */
  protected kualifierKelas(e: A.Ekspresi): HasilKelas | undefined {
    if (e.jenis === 'Nama') {
      if (this.cariLokal(e.nama) || this.cariFieldNama(e.nama)) return undefined
      const h = this.cariKelasSederhana(e.nama, this.ctx.kelas)
      if (!h) return undefined
      e.ikatan = { k: 'kelas', nama: this.namaHasil(h) }
      e.tipe = { k: 'kelas', nama: this.namaHasil(h) }
      return h
    }
    if (e.jenis === 'AksesField') {
      if (e.objek.jenis !== 'Nama' && e.objek.jenis !== 'AksesField') return undefined
      const dasar = this.kualifierKelas(e.objek)
      if (!dasar) return undefined
      // Field static bernama sama lebih diutamakan daripada class bersarang (JLS 6.5.2).
      if (this.cariField({ k: 'kelas', nama: this.namaHasil(dasar) }, e.nama)) return undefined
      const h = this.anggotaTipe(dasar, e.nama)
      if (!h) return undefined
      if (h.k === 'user' && h.info.deklarasi.modifier.includes('private') && this.topLevel(h.info) !== this.topLevel(this.ctx.kelas)) {
        this.lapor('akses-privat', e.spanNama, katalog.aksesPrivat(h.info.sederhana, this.namaTampil(h.info.luar!)))
      }
      e.ikatan = { k: 'kelas', nama: this.namaHasil(h) }
      e.tipe = { k: 'kelas', nama: this.namaHasil(h) }
      return h
    }
    return undefined
  }

  /** Untuk `Sytem.out.println(...)`: javac menganggap nama tak dikenal di depan dua titik sebagai package. */
  protected cekPaket(objek: A.Ekspresi): boolean {
    if (objek.jenis !== 'AksesField' || objek.objek.jenis !== 'Nama') return false
    const n = objek.objek.nama
    if (this.cariLokal(n) || this.cariFieldNama(n) || this.cariKelasSederhana(n, this.ctx.kelas)) return false
    const mirip = saranMirip(n, ['System', 'Math', 'String', 'Integer', 'Double', 'Character', 'Arrays', ...this.kelasTopLevel.keys()])
    // javac menunjuk ke titik setelah nama paket (`Sytem.out` → titik).
    this.lapor('paket-tidak-ada', { ...objek.objek.span, fokus: objek.span.fokus }, katalog.paketTidakAda(n, mirip))
    return true
  }

  /** Teks `location:` untuk penerima ekspresi: variabel disebut namanya, ekspresi lain disebut tipenya. */
  protected lokasiObjek(objek: A.Ekspresi, tipe: Tipe): string {
    if (objek.jenis === 'Nama' && (objek.ikatan?.k === 'lokal' || objek.ikatan?.k === 'field')) return `variable ${objek.nama} of type ${this.teks(tipe)}`
    if (objek.jenis === 'AksesField' && (objek.ikatan?.k === 'field' || objek.ikatan?.k === 'field-pustaka')) return `variable ${objek.nama} of type ${this.teks(tipe)}`
    return this.lokasiTipe(tipe)
  }

  private aksesField(e: A.AksesField): Tipe {
    if (this.cekPaket(e.objek)) return T.error
    const q = this.kualifierKelas(e.objek)
    if (q) {
      const tipeQ: TipeKelas = { k: 'kelas', nama: this.namaHasil(q) }
      const f = this.cariField(tipeQ, e.nama)
      if (f && 'user' in f) {
        if (!f.user.statik) this.lapor('konteks-statik-variabel', e.spanNama, katalog.konteksStatikVariabel(e.nama))
        else this.cekAksesField(f.user, e.spanNama)
        e.ikatan = { k: 'field', field: f.user }
        this.pastikanKonstan(f.user)
        if (f.user.konstan !== undefined) e.konstan = f.user.konstan
        return f.user.tipe
      }
      if (f && 'pustaka' in f) {
        if (f.pustaka.akses !== 'public') return this.laporAksesPustaka(e.nama, f.pemilik, f.pustaka.akses, e.spanNama)
        if (!f.pustaka.statik) {
          this.lapor('konteks-statik-variabel', e.spanNama, katalog.konteksStatikVariabel(e.nama))
          return T.error
        }
        e.ikatan = { k: 'field-pustaka', id: f.pustaka.id }
        if (f.pustaka.konstan !== undefined) e.konstan = f.pustaka.konstan
        return f.pustaka.tipe
      }
      this.lapor('simbol-tidak-ditemukan', e.spanNama, katalog.simbolTidakDitemukan('variable', e.nama, this.lokasiTipe(tipeQ)))
      return T.error
    }
    const t = this.ekspresi(e.objek)
    if (adalahError(t)) return T.error
    if (t.k === 'array' && e.nama === 'length') {
      e.ikatan = { k: 'panjang-array' }
      return T.int
    }
    if (t.k === 'primitif') {
      this.lapor('dereference-primitif', e.spanNama, katalog.dereferencePrimitif(t.nama))
      return T.error
    }
    const f = this.cariField(t, e.nama)
    if (f && 'user' in f) {
      this.cekAksesField(f.user, e.spanNama)
      e.ikatan = { k: 'field', field: f.user }
      this.pastikanKonstan(f.user)
      if (f.user.konstan !== undefined && f.user.statik) e.konstan = f.user.konstan
      return f.user.tipe
    }
    if (f && 'pustaka' in f) {
      if (f.pustaka.akses !== 'public') return this.laporAksesPustaka(e.nama, f.pemilik, f.pustaka.akses, e.spanNama)
      e.ikatan = { k: 'field-pustaka', id: f.pustaka.id }
      if (f.pustaka.konstan !== undefined) e.konstan = f.pustaka.konstan
      return f.pustaka.tipe
    }
    this.lapor('simbol-tidak-ditemukan', e.spanNama, {
      ...katalog.simbolTidakDitemukan('variable', e.nama, this.lokasiObjek(e.objek, t)),
      saran: adalahString(t) && e.nama === 'length' ? 'Untuk String, length adalah method: tulis teks.length() dengan tanda kurung.' : undefined,
    })
    return T.error
  }

  private cekAksesField(f: A.SimbolField, span: Span): void {
    if (this.bolehAkses(f.akses ?? 'paket', f.kelas)) return
    const pemilik = f.kelas ? this.kelasUser.get(f.kelas) : undefined
    this.lapor('akses-privat', span, katalog.aksesPrivat(f.nama, pemilik ? this.namaTampil(pemilik) : 'Main'))
  }

  private laporAksesPustaka(nama: string, pemilik: string, akses: A.Akses, span: Span): Tipe {
    const kelas = this.teks({ k: 'kelas', nama: pemilik })
    if (akses === 'private') this.lapor('akses-privat', span, katalog.aksesPrivat(nama, kelas))
    else if (akses === 'protected') this.lapor('akses-privat', span, katalog.aksesProtected(nama, kelas))
    else this.lapor('akses-privat', span, katalog.aksesPaket(nama, kelas))
    return T.error
  }

  private aksesArray(e: A.AksesArray): Tipe {
    const ta = this.ekspresi(e.array)
    const ti = this.ekspresi(e.indeks)
    if (!adalahError(ti)) {
      const pi = this.dunia.primitifDari(ti)
      if (!pi || !adalahNumerik(pi)) this.lapor('tipe-tidak-cocok', e.indeks.span, katalog.tipeTidakCocok(this.teks(ti), 'int'))
      else if (!samaTipe(promosiUnary(pi), T.int)) this.lapor('konversi-lossy', e.indeks.span, katalog.konversiLossy(this.teks(ti), 'int', this.diag.teks(e.indeks.span)))
    }
    if (adalahError(ta)) return T.error
    if (ta.k !== 'array') {
      this.lapor('butuh-array', e.span, katalog.butuhArray(this.teks(ta)))
      return T.error
    }
    return ta.elemen
  }

  private ekspresiThis(e: A.This): Tipe {
    if (!e.kualifier) {
      if (this.ctx.statik) {
        this.lapor('konteks-statik-variabel', e.span, katalog.konteksStatikVariabel('this'))
        return T.error
      }
      this.tandaiPakaiThis()
      return this.tipeKelasUser(this.ctx.kelas)
    }
    const bagian = e.kualifier.split('.')
    let h = this.cariKelasSederhana(bagian[0], this.ctx.kelas)
    for (let i = 1; h && i < bagian.length; i++) h = this.anggotaTipe(h, bagian[i])
    const spanQ = { awal: e.span.awal, akhir: e.span.awal + e.kualifier.length }
    if (!h) {
      this.lapor('simbol-tidak-ditemukan', spanQ, katalog.simbolTidakDitemukan('class', bagian[0], this.lokasiKelas(this.ctx.kelas)))
      return T.error
    }
    let statikSaja = this.ctx.statik
    let hop = 0
    for (let k: A.InfoKelas | undefined = this.ctx.kelas; k; k = k.luar) {
      if (h.k === 'user' && k === h.info) {
        if (statikSaja) {
          this.lapor('konteks-statik-variabel', e.span, katalog.konteksStatikVariabel('this'))
          return T.error
        }
        e.luar = hop
        this.tandaiPakaiThis()
        return this.tipeKelasUser(k)
      }
      if (k.statik) statikSaja = true
      hop++
    }
    this.lapor('bukan-kelas-luar', e.span, { pesan: `not an enclosing class: ${this.tampilHasil(h)}`, artinya: `${this.tampilHasil(h)} bukan class yang membungkus kode ini, sehingga ${this.tampilHasil(h)}.this tidak bisa dipakai di sini.` })
    return T.error
  }

  // ---------- pemanggilan method ----------
  /** Persiapan `new` yang sudah dihitung (agar diamond sebagai argumen tidak diperiksa dua kali). */
  private readonly persiapanBaru = new WeakMap<A.BaruObjek, PersiapanBaru>()

  /** Periksa argumen sebelum resolusi: lambda, diamond, dan kondisional referensi ditunda (poli), selainnya sekarang. */
  protected argumenAwal(e: A.Ekspresi): ArgumenAwal {
    if (e.jenis === 'Lambda') {
      const semuaBertipe = e.parameter.length > 0 && e.parameter.every((p) => p.tipeNode)
      const eksplisit = semuaBertipe ? e.parameter.map((p) => this.tipeDari(p.tipeNode!)) : undefined
      return { e, a: { k: 'lambda', node: e, eksplisit: eksplisit?.some(adalahError) ? undefined : eksplisit } }
    }
    if (e.jenis === 'BaruObjek' && e.tipeNode.jenis === 'TipeNama' && e.tipeNode.argumen?.length === 0) {
      const p = this.siapkanBaru(e)
      if (p.tipe && p.diamond) {
        const tipe = this.selesaikanBaru(e, p, undefined, false) ?? T.error
        return { e, a: { k: 'poly', tipe, denganTarget: (target) => this.selesaikanBaru(e, p, target, false) } }
      }
    }
    if (e.jenis === 'Kondisional') {
      // Seperti javac: kondisional yang kedua cabangnya bukan numerik/boolean adalah ekspresi poli; tiap cabang
      // dicek terhadap tipe parameter masing-masing kandidat.
      this.kondisi(e.kondisi)
      const ya = this.argumenAwal(e.ya)
      const tidak = this.argumenAwal(e.tidak)
      if (!(this.numerikAtauBoolean(e.ya) && this.numerikAtauBoolean(e.tidak))) {
        return { e, a: { k: 'kondisional', node: e, cabang: [ya.a, tidak.a] } }
      }
      const t = ya.a.k === 'biasa' && tidak.a.k === 'biasa' ? this.tipeKondisionalStandalone(e, ya.a.tipe, tidak.a.tipe) : T.error
      e.tipe = t
      return { e, a: { k: 'biasa', tipe: t } }
    }
    if (e.jenis === 'PanggilMethod' && e.argumen.length === 0 && e.objek) {
      const poli = this.panggilStatikPoli(e)
      if (poli) return { e, a: poli }
    }
    const t = this.ekspresi(e)
    if (t.k === 'void') {
      this.lapor('void-tidak-boleh', e.span, katalog.voidTidakBoleh())
      return { e, a: { k: 'biasa', tipe: T.error } }
    }
    return { e, a: { k: 'biasa', tipe: t } }
  }

  /**
   * `Kelas.method()` statik generik tanpa argumen sebagai argumen method lain, mis. `list.sort(Comparator.naturalOrder())`,
   * adalah ekspresi poli seperti di javac: variabel tipenya disimpulkan dari tipe parameter yang dituju. Tanpa target,
   * batas `T extends Comparable<? super T>` tidak bisa dipenuhi.
   */
  private panggilStatikPoli(e: A.PanggilMethod): Argumen | undefined {
    const q = this.kualifierKelas(e.objek!)
    if (!q) return undefined
    const kandidat = this.kandidatMethod({ k: 'kelas', nama: this.namaHasil(q) }, e.nama).filter((k) => k.parameter.length === 0 && !k.varargs)
    const generik = (k: KandidatMethod) => k.data.statik && memuatVariabel(k.kembali, new Set(k.tipeParam.map((p) => p.nama)))
    if (!kandidat.length || !kandidat.every(generik)) return undefined
    const coba = (target: Tipe | undefined): Tipe | null => {
      const h = resolusi(this.dunia, kandidat, [], target)
      if (!h.pilih) return null
      return memuatVariabel(h.pilih.kembali) ? this.hapusVariabel(h.pilih.kembali) : h.pilih.kembali
    }
    const mandiri = coba(undefined)
    // Tanpa target, tipenya hanya diketahui sampai kelasnya (mis. Comparator), cukup untuk menyaring overload.
    const kembali = kandidat[0].kembali
    const kelasSaja: Tipe = kembali.k === 'kelas' ? { k: 'kelas', nama: kembali.nama } : T.error
    return { k: 'poly', tipe: mandiri ?? kelasSaja, denganTarget: coba, tunda: mandiri === null }
  }

  /** Teks daftar tipe argumen untuk pesan (`int,String`); lambda dan kondisional poli dicetak seperti javac. */
  protected teksArgumen(args: ArgumenAwal[]): string {
    return args
      .map((x) => {
        if (x.a.k === 'lambda' || x.a.k === 'kondisional') return teksRingkas(x.e)
        return this.teks(x.a.tipe)
      })
      .join(',')
  }

  private argumenError(a: Argumen): boolean {
    if (a.k === 'lambda') return false
    if (a.k === 'kondisional') return a.cabang.some((c) => this.argumenError(c))
    if (a.k === 'poly' && a.tunda) return false
    return adalahError(a.tipe)
  }

  private adaArgumenError(args: ArgumenAwal[]): boolean {
    return args.some((x) => this.argumenError(x.a))
  }

  private panggil(e: A.PanggilMethod, target?: Tipe): Tipe {
    // Seperti javac: argumen diperiksa lebih dulu, baru penerima (receiver).
    const args = e.argumen.map((a) => this.argumenAwal(a))
    let penerima: Penerima | undefined
    if (e.objek) {
      if (this.cekPaket(e.objek)) return T.error
      const q = this.kualifierKelas(e.objek)
      penerima = q ? { k: 'kelas', hasil: q, tipe: { k: 'kelas', nama: this.namaHasil(q) } } : { k: 'objek', tipe: this.ekspresi(e.objek) }
    }
    if (penerima?.k === 'objek' && adalahError(penerima.tipe)) return T.error
    if (this.adaArgumenError(args)) return this.tebakKembali(e, penerima)
    if (!penerima) return this.panggilTanpaPenerima(e, args, target)
    if (penerima.k === 'kelas') return this.panggilLewatKelas(e, args, penerima.tipe, target)
    return this.panggilLewatObjek(e, args, penerima.tipe, target)
  }

  /** Tebak tipe kembali saat argumen error (hanya bila semua kandidat sepakat), agar error tidak berantai. */
  private tebakKembali(e: A.PanggilMethod, penerima: Penerima | undefined): Tipe {
    let kandidat: KandidatMethod[] = []
    if (!penerima) {
      for (let k: A.InfoKelas | undefined = this.ctx.kelas; k && !kandidat.length; k = k.luar) kandidat = this.kandidatMethod(this.tipeKelasUser(k), e.nama)
    } else kandidat = this.kandidatMethod(penerima.tipe, e.nama)
    if (kandidat.length && kandidat.every((k) => samaTipe(k.kembali, kandidat[0].kembali)) && !memuatVariabel(kandidat[0].kembali)) return kandidat[0].kembali
    return T.error
  }

  private tandaTanganKandidat(k: KandidatMethod): string {
    if (k.data.user) return k.data.user.tandaTangan
    if (k.data.bawaan) return `${k.data.bawaan.sederhana}()`
    return `${k.nama}(${this.teksDaftar(k.data.pustaka!.parameter, k.varargs)})`
  }

  private panggilTanpaPenerima(e: A.PanggilMethod, args: ArgumenAwal[], target: Tipe | undefined): Tipe {
    let statikSaja = this.ctx.statik
    let hop = 0
    let pertama: { kandidat: KandidatMethod[]; hasil: HasilResolusi<DataKandidat>; kelas: A.InfoKelas } | undefined
    for (let k: A.InfoKelas | undefined = this.ctx.kelas; k; k = k.luar) {
      const kandidat = this.kandidatMethod(this.tipeKelasUser(k), e.nama)
      if (kandidat.length) {
        const hasil = resolusi(this.dunia, kandidat, args.map((x) => x.a), target)
        if (hasil.pilih) {
          const m = hasil.pilih.kandidat
          if (!m.data.statik && statikSaja) this.lapor('konteks-statik-method', e.spanNama, katalog.konteksStatikMethod(this.tandaTanganKandidat(m)))
          return this.selesaiPanggil(e, args, hasil.pilih, this.tipeKelasUser(k), hop, true)
        }
        if (!pertama) pertama = { kandidat, hasil, kelas: k }
      }
      if (k.statik) statikSaja = true
      hop++
    }
    if (!pertama) {
      const isi = katalog.simbolTidakDitemukan('method', `${e.nama}(${this.teksArgumen(args)})`, this.lokasiKelas(this.ctx.kelas))
      const nama = new Set<string>()
      for (let k: A.InfoKelas | undefined = this.ctx.kelas; k; k = k.luar) for (const n of k.method.keys()) nama.add(n)
      const mirip = saranMirip(e.nama, nama)
      const salahTempat = ['println', 'print', 'printf'].includes(e.nama)
      const kelasNama = this.cariKelasSederhana(e.nama, this.ctx.kelas)
      this.lapor('simbol-tidak-ditemukan', e.spanNama, {
        ...isi,
        saran: salahTempat
          ? `Untuk mencetak, tulis lengkap: \`System.out.${e.nama}(...)\`.`
          : kelasNama
            ? `Untuk membuat objek, tulis \`new ${e.nama}(...)\`.`
            : mirip
              ? `Mungkin maksudmu \`${mirip}\`?`
              : 'Pastikan method sudah dibuat di dalam class dan ejaannya sama persis.',
      })
      return T.error
    }
    this.laporResolusi(e.spanNama, e.nama, 'method', pertama.hasil, pertama.kandidat, args, this.tipeKelasUser(pertama.kelas))
    return T.error
  }

  private panggilLewatKelas(e: A.PanggilMethod, args: ArgumenAwal[], tipe: TipeKelas, target: Tipe | undefined): Tipe {
    const kandidat = this.kandidatMethod(tipe, e.nama)
    if (!kandidat.length) {
      const isi = katalog.simbolTidakDitemukan('method', `${e.nama}(${this.teksArgumen(args)})`, this.lokasiTipe(tipe))
      const mirip = saranMirip(e.nama, this.namaMethodTipe(tipe))
      this.lapor('simbol-tidak-ditemukan', e.spanNama, mirip ? { ...isi, saran: `Mungkin maksudmu \`${mirip}\`?` } : isi)
      return T.error
    }
    const hasil = resolusi(this.dunia, kandidat, args.map((x) => x.a), target)
    if (!hasil.pilih) {
      this.laporResolusi(e.spanNama, e.nama, 'method', hasil, kandidat, args, tipe)
      return T.error
    }
    if (!hasil.pilih.kandidat.data.statik) {
      this.lapor('konteks-statik-method', e.spanNama, katalog.konteksStatikMethod(this.tandaTanganKandidat(hasil.pilih.kandidat)))
    }
    return this.selesaiPanggil(e, args, hasil.pilih, tipe, 0, false)
  }

  private panggilLewatObjek(e: A.PanggilMethod, args: ArgumenAwal[], t: Tipe, target: Tipe | undefined): Tipe {
    if (t.k === 'primitif') {
      this.lapor('dereference-primitif', e.spanNama, katalog.dereferencePrimitif(t.nama))
      return T.error
    }
    const kandidat = t.k === 'kelas' || t.k === 'array' ? this.kandidatMethod(t, e.nama) : []
    if (!kandidat.length) {
      const isi = katalog.simbolTidakDitemukan('method', `${e.nama}(${this.teksArgumen(args)})`, this.lokasiObjek(e.objek!, t))
      const mirip = t.k === 'kelas' ? saranMirip(e.nama, this.namaMethodTipe(t)) : undefined
      this.lapor('simbol-tidak-ditemukan', e.spanNama, {
        ...isi,
        saran:
          t.k === 'array' && e.nama === 'length'
            ? 'Untuk array, length adalah field: tulis arr.length tanpa tanda kurung.'
            : e.nama === 'length' && t.k === 'kelas' && t.nama !== 'String'
              ? 'Untuk koleksi, banyaknya elemen diambil dengan size().'
              : mirip
                ? `Mungkin maksudmu \`${mirip}\`?`
                : undefined,
      })
      return T.error
    }
    const hasil = resolusi(this.dunia, kandidat, args.map((x) => x.a), target)
    if (!hasil.pilih) {
      this.laporResolusi(e.spanNama, e.nama, 'method', hasil, kandidat, args, t.k === 'kelas' ? t : (T.Object as TipeKelas))
      return T.error
    }
    return this.selesaiPanggil(e, args, hasil.pilih, t, 0, false)
  }

  /** Semua nama method yang dikenal pada tipe (untuk saran ejaan). */
  private namaMethodTipe(t: TipeKelas): string[] {
    const hasil = new Set<string>()
    const antrian: TipeKelas[] = [t]
    const dilihat = new Set<string>()
    while (antrian.length) {
      const s = antrian.shift()!
      if (dilihat.has(s.nama)) continue
      dilihat.add(s.nama)
      const u = this.kelasUser.get(s.nama)
      if (u) for (const n of u.method.keys()) hasil.add(n)
      else this.namaMethodPustaka(s.nama).forEach((n) => hasil.add(n))
      antrian.push(...this.dunia.superLangsung(s))
    }
    return [...hasil]
  }

  protected abstract namaMethodPustaka(kelas: string): string[]

  private selesaiPanggil(
    e: A.PanggilMethod,
    args: ArgumenAwal[],
    pilih: NonNullable<HasilResolusi<DataKandidat>['pilih']>,
    penerima: Tipe,
    luar: number,
    implisit: boolean,
  ): Tipe {
    const k = pilih.kandidat
    const d = k.data
    if (!this.bolehAkses(d.akses, d.kelasUser)) {
      const pemilik = d.kelasUser ? this.kelasUser.get(d.kelasUser) : undefined
      this.lapor('akses-privat', e.spanNama, katalog.aksesPrivat(this.tandaTanganKandidat(k), pemilik ? this.namaTampil(pemilik) : this.teks(d.pemilik)))
      return T.error
    }
    if (d.pustaka?.belumDidukung) {
      this.lapor('belum-didukung', e.spanNama, katalog.belumDidukung(`Method ${e.nama}`, d.pustaka.belumDidukung))
      return T.error
    }
    this.selesaikanArgumen(args, k, pilih.parameter, pilih.fase)
    e.pakaiVarargs = pilih.fase === 3
    if (!d.statik && implisit) this.tandaiPakaiThis()
    if (d.user) {
      e.target = luar > 0 && !d.user.statik ? { k: 'user', method: d.user, luar } : { k: 'user', method: d.user }
      return d.user.kembali
    }
    const mp = d.pustaka!
    let kembali = pilih.kembali
    // `Arrays.copyOf(T[], …)` generik: hasilnya bertipe sama dengan array argumen (mis. String[]).
    if (mp.id.startsWith('Arrays.copyOf') && mp.parameter[0].k === 'array' && mp.parameter[0].elemen.k === 'kelas') {
      const a0 = args[0].a
      if (a0.k === 'biasa') kembali = a0.tipe
    }
    if (memuatVariabel(kembali)) kembali = this.hapusVariabel(kembali)
    e.target = {
      k: 'pustaka',
      id: mp.id,
      parameter: pilih.parameter.map((p) => this.hapusVariabel(p)),
      kembali,
      statik: mp.statik,
      varargs: mp.varargs,
      jvm: this.deskripsiJvm(penerima, mp),
      ...(implisit && luar > 0 && !mp.statik ? { luar } : {}),
    }
    return kembali
  }

  /** Variabel tipe yang tersisa (tidak terinferensi) diganti Object. */
  protected hapusVariabel(t: Tipe): Tipe {
    if (!memuatVariabel(t)) return t
    const ganti = (x: Tipe): Tipe => {
      switch (x.k) {
        case 'variabel':
          return T.Object
        case 'kelas':
          return x.argumen ? { k: 'kelas', nama: x.nama, argumen: x.argumen.map(ganti) } : x
        case 'array':
          return { k: 'array', elemen: ganti(x.elemen) }
        case 'wildcard':
          return x.tipe ? { k: 'wildcard', batas: x.batas, tipe: ganti(x.tipe) } : x
        default:
          return x
      }
    }
    return ganti(t)
  }

  /** Periksa argumen yang ditunda (lambda, diamond, kondisional poli) dengan tipe parameter akhir method terpilih. */
  private selesaikanArgumen(args: ArgumenAwal[], k: KandidatMethod, parameter: Tipe[], fase: 1 | 2 | 3): void {
    args.forEach((x, i) => {
      if (x.a.k === 'biasa') return
      let f = fase === 3 && k.varargs && i >= parameter.length - 1 ? parameter[parameter.length - 1] : parameter[i]
      if (fase === 3 && k.varargs && i >= parameter.length - 1 && f.k === 'array') f = f.elemen
      f = this.hapusVariabel(f)
      if (x.a.k === 'kondisional') this.selesaikanKondisional(x.a.node, x.a, f)
      else this.ekspresi(x.e, f)
    })
  }

  /** Kondisional poli sebagai argumen: cabang yang ditunda diperiksa dengan tipe parameter; tipenya = parameter itu. */
  private selesaikanKondisional(e: A.Kondisional, a: Extract<Argumen, { k: 'kondisional' }>, f: Tipe): void {
    const cabang: [A.Ekspresi, Argumen][] = [
      [e.ya, a.cabang[0]],
      [e.tidak, a.cabang[1]],
    ]
    for (const [x, ax] of cabang) {
      if (ax.k === 'kondisional') this.selesaikanKondisional(ax.node, ax, f)
      else if (ax.k !== 'biasa') this.ekspresi(x, f)
    }
    this.kondisionalPoli.add(e)
    e.tipe = f
    this.lipatKonstanKondisional(e, f)
  }

  // ---------- laporan resolusi ----------
  /** Nama variabel tipe untuk tampilan (`T`, atau `T#1`/`T#2` bila ada beberapa variabel bernama sama). */
  private namaVariabelTampil(kandidat: KandidatMethod[]): Map<KandidatMethod, Map<string, string>> {
    const hitung = new Map<string, number>()
    for (const k of kandidat) for (const p of k.tipeParam) hitung.set(p.nama, (hitung.get(p.nama) ?? 0) + 1)
    const nomor = new Map<string, number>()
    const hasil = new Map<KandidatMethod, Map<string, string>>()
    for (const k of kandidat) {
      const peta = new Map<string, string>()
      for (const p of k.tipeParam) {
        if ((hitung.get(p.nama) ?? 0) > 1) {
          const n = (nomor.get(p.nama) ?? 0) + 1
          nomor.set(p.nama, n)
          peta.set(p.nama, `${p.nama}#${n}`)
        } else peta.set(p.nama, p.nama)
      }
      hasil.set(k, peta)
    }
    return hasil
  }

  /** Teks tipe dengan penggantian nama variabel tipe. */
  private teksV(t: Tipe, peta: Map<string, string>): string {
    if (!peta.size) return this.teks(t)
    const ganti = (x: Tipe): Tipe => {
      switch (x.k) {
        case 'variabel':
          return { k: 'variabel', nama: peta.get(x.nama) ?? x.nama }
        case 'kelas':
          return x.argumen ? { k: 'kelas', nama: x.nama, argumen: x.argumen.map(ganti) } : x
        case 'array':
          return { k: 'array', elemen: ganti(x.elemen) }
        case 'wildcard':
          return x.tipe ? { k: 'wildcard', batas: x.batas, tipe: ganti(x.tipe) } : x
        default:
          return x
      }
    }
    return this.teks(ganti(t))
  }

  /** Baris fragmen ketidakcocokan sebuah argumen (tanpa awalan `argument mismatch; `). */
  private fragmenArgumen(a: Alasan, peta: Map<string, string>): string[] {
    switch (a.k) {
      case 'arg':
        return [this.fragmenKonversiV(a.dari, a.ke, peta)]
      case 'lambda':
        if (a.jenis === 'parameter') return ['incompatible parameter types in lambda expression']
        if (a.jenis === 'bukan-fungsional') return [`${this.teksV(a.ke, peta)} is not a functional interface`]
        return [`${this.teksV(a.dari!, peta)} cannot be converted to ${this.teksV(a.ke, peta)}`]
      case 'kondisional':
        return ['bad type in conditional expression', ...this.fragmenArgumen(a.dalam, peta)]
      default:
        return []
    }
  }

  /** Baris alasan gaya javac untuk kandidat yang tidak berlaku. */
  private barisAlasan(a: Alasan, k: KandidatMethod, peta: Map<string, string>): string[] {
    const vars = k.tipeParam.map((p) => peta.get(p.nama) ?? p.nama).join(',')
    const infer = (baris: string[]) => [`cannot infer type-variable(s) ${vars}`, ...baris.map((b, i) => `${i === 0 ? '(' : ''}${b}${i === baris.length - 1 ? ')' : ''}`)]
    switch (a.k) {
      case 'arity':
        return a.generik ? infer(['actual and formal argument lists differ in length']) : ['actual and formal argument lists differ in length']
      case 'arg':
      case 'lambda':
      case 'kondisional': {
        const baris = this.fragmenArgumen(a, peta)
        baris[0] = `${a.k !== 'lambda' && a.varargs ? 'varargs' : 'argument'} mismatch; ${baris[0]}`
        return a.generik ? infer(baris) : baris
      }
      case 'batas': {
        const v = peta.get(a.variabel) ?? a.variabel
        const daftar = (x: Tipe[]) => x.map((t) => this.teksV(t, peta)).join(',')
        const baris = [`inference variable ${v} has incompatible bounds`]
        if (a.sama.length) baris.push(`equality constraints: ${daftar(a.sama)}`)
        if (a.atas.length) baris.push(`upper bounds: ${daftar(a.atas)}`)
        if (a.bawah.length) baris.push(`lower bounds: ${daftar(a.bawah)}`)
        return baris
      }
    }
  }

  private fragmenKonversiV(dari: Tipe, ke: Tipe, peta: Map<string, string>): string {
    const pd = dari.k === 'primitif' && ke.k === 'primitif' && dari.nama !== 'boolean' && ke.nama !== 'boolean'
    return pd ? `possible lossy conversion from ${this.teksV(dari, peta)} to ${this.teksV(ke, peta)}` : `${this.teksV(dari, peta)} cannot be converted to ${this.teksV(ke, peta)}`
  }

  /** Tanda tangan kandidat untuk pesan: `Barang.Barang(String,int)`, `Collections.<T>sort(List<T>)`. */
  private teksKandidat(k: KandidatMethod, jenis: 'method' | 'constructor', peta: Map<string, string>): string {
    const pemilik = this.teks({ k: 'kelas', nama: k.data.pemilik.nama })
    const tp = k.tipeParam.length && jenis === 'method' ? `<${k.tipeParam.map((p) => peta.get(p.nama) ?? p.nama).join(',')}>` : ''
    const param = k.parameter.map((p) => this.teksV(p, peta))
    if (k.varargs && param.length) param[param.length - 1] = param[param.length - 1].replace(/\[\]$/, '...')
    return `${pemilik}.${tp}${k.nama}(${param.join(',')})`
  }

  private barisWhere(kandidat: KandidatMethod[], peta: Map<KandidatMethod, Map<string, string>>, jenis: 'method' | 'constructor'): string[] {
    const generik = kandidat.filter((k) => k.tipeParam.length && jenis === 'method')
    if (!generik.length) return []
    const nama: string[] = []
    const baris: string[] = []
    for (const k of generik) {
      const p = peta.get(k)!
      const tp = `<${k.tipeParam.map((x) => p.get(x.nama) ?? x.nama).join(',')}>`
      const param = k.parameter.map((x) => this.teksV(x, p))
      if (k.varargs && param.length) param[param.length - 1] = param[param.length - 1].replace(/\[\]$/, '...')
      for (const x of k.tipeParam) {
        const n = p.get(x.nama) ?? x.nama
        nama.push(n)
        baris.push(`${n} extends ${x.batas.map((b) => this.teksV(b, p)).join(',')} declared in method ${tp}${k.nama}(${param.join(',')})`)
      }
    }
    return [`where ${nama.join(',')} ${nama.length > 1 ? 'are type-variables' : 'is a type-variable'}:`, ...baris]
  }

  /**
   * Laporkan kegagalan resolusi seperti javac: kandidat yang gagal karena jumlah argumen (non-generik) disisihkan;
   * satu kandidat tersisa dengan argumen tidak cocok → pesan ringkas `incompatible types` di argumen itu.
   */
  protected laporResolusi(
    posisi: Span,
    nama: string,
    jenis: 'method' | 'constructor',
    hasil: HasilResolusi<DataKandidat>,
    kandidat: KandidatMethod[],
    args: ArgumenAwal[],
    pemilik: TipeKelas,
  ): void {
    if (hasil.ambigu) {
      const [a, b] = hasil.ambigu
      const lokasi = (k: KandidatMethod) => this.teks({ k: 'kelas', nama: k.data.pemilik.nama })
      const sig = (k: KandidatMethod) => `${k.nama}(${this.teksDaftar(k.parameter, k.varargs)})`
      this.lapor('referensi-ambigu', posisi, katalog.referensiAmbigu(nama, [`both ${jenis} ${sig(a)} in ${lokasi(a)} and ${jenis} ${sig(b)} in ${lokasi(b)} match`]))
      return
    }
    // Method pustaka yang belum didukung (removeIf, forEach, Comparator.comparing, …) memakai parameter `Object`
    // sebagai pengganti antarmuka fungsionalnya. Lambda yang ditolak di sana bukan kesalahan Java mahasiswa,
    // jadi laporkan keterbatasan simulator, bukan "Object is not a functional interface".
    const belum = kandidat.find((k) => k.data.pustaka?.belumDidukung && hasil.alasan.get(k)?.k !== 'arity')
    if (belum) {
      this.lapor('belum-didukung', posisi, katalog.belumDidukung(`Method ${nama}`, belum.data.pustaka!.belumDidukung!))
      return
    }
    const entri = kandidat.filter((k) => hasil.alasan.has(k)).map((k) => ({ k, a: hasil.alasan.get(k)! }))
    let tampil = entri.filter((x) => !(x.a.k === 'arity' && !x.a.generik))
    if (!tampil.length) tampil = entri
    const peta = this.namaVariabelTampil(tampil.map((x) => x.k))
    const teksArg = this.teksArgumen(args)
    if (tampil.length === 1) {
      const { k, a } = tampil[0]
      const p = peta.get(k)!
      const ringkas = this.tulisUlang(a, args, p)
      if (ringkas) {
        this.lapor(ringkas.kode, ringkas.span, ringkas.isi)
        return
      }
      const butuh = k.parameter.map((x) => this.teksV(x, p))
      if (k.varargs && butuh.length) butuh[butuh.length - 1] = butuh[butuh.length - 1].replace(/\[\]$/, '...')
      const namaPesan = jenis === 'constructor' ? this.teks({ k: 'kelas', nama: k.data.pemilik.nama }) : nama
      const pemilikPesan = jenis === 'constructor' ? this.lokasiTipe(k.data.pemilik) : this.lokasiTipe(k.data.pemilik, true)
      this.lapor(
        'method-tidak-cocok',
        posisi,
        katalog.methodTidakCocok(jenis, namaPesan, pemilikPesan, butuh.join(','), teksArg, this.barisAlasan(a, k, p), this.barisWhere([k], peta, jenis)),
      )
      return
    }
    const detail: string[] = []
    for (const { k, a } of tampil) {
      const p = peta.get(k)!
      detail.push(`${jenis} ${this.teksKandidat(k, jenis, p)} is not applicable`)
      const baris = this.barisAlasan(a, k, p)
      baris.forEach((b, i) => detail.push(`${i === 0 ? '(' : ''}${b}${i === baris.length - 1 ? ')' : ''}`))
    }
    detail.push(...this.barisWhere(tampil.map((x) => x.k), peta, jenis))
    const namaPesan = jenis === 'constructor' ? this.teks({ k: 'kelas', nama: pemilik.nama }) : nama
    this.lapor('tidak-ada-method-cocok', posisi, katalog.tidakAdaMethodCocok(jenis, namaPesan, teksArg, detail))
  }

  /** Pesan ringkas javac (`compact method diagnostics`) untuk satu kandidat dengan argumen tidak cocok. */
  private tulisUlang(a: Alasan, args: ArgumenAwal[], peta: Map<string, string>): { kode: string; span: Span; isi: IsiPesan } | undefined {
    if (a.k === 'arg' && !a.varargs) {
      const arg = args[a.indeks]
      const span = arg.e.span
      const lossy = a.dari.k === 'primitif' && a.ke.k === 'primitif' && a.dari.nama !== 'boolean' && a.ke.nama !== 'boolean'
      if (lossy) return { kode: 'konversi-lossy', span, isi: katalog.konversiLossy(this.teksV(a.dari, peta), this.teksV(a.ke, peta), this.diag.teks(span)) }
      return { kode: 'tipe-tidak-cocok', span, isi: katalog.tipeTidakCocok(this.teksV(a.dari, peta), this.teksV(a.ke, peta)) }
    }
    if (a.k === 'lambda') {
      const span = this.awalSaja(args[a.indeks].e.span)
      if (a.jenis === 'parameter') return { kode: 'lambda-parameter', span, isi: katalog.lambdaParameterTidakCocok() }
      if (a.jenis === 'bukan-fungsional') return { kode: 'bukan-fungsional', span, isi: katalog.bukanAntarmukaFungsional(this.teksV(a.ke, peta)) }
      return { kode: 'tipe-tidak-cocok', span, isi: katalog.tipeTidakCocok(this.teksV(a.dari!, peta), this.teksV(a.ke, peta)) }
    }
    if (a.k === 'kondisional' && !a.varargs) {
      // javac menunjuk cabang terdalam yang tidak cocok; tiap tingkat kondisional menambah satu baris detail.
      let e: A.Ekspresi = args[a.indeks].e
      let x: Alasan = a
      while (x.k === 'kondisional' && e.jenis === 'Kondisional') {
        e = x.cabang === 0 ? e.ya : e.tidak
        x = x.dalam
      }
      const span = x.k === 'lambda' ? this.awalSaja(e.span) : e.span
      const detail = this.fragmenArgumen(a, peta).slice(1)
      return { kode: 'kondisional-tidak-cocok', span, isi: katalog.kondisionalTidakCocok(detail) }
    }
    return undefined
  }

  // ---------- pembuatan objek ----------
  /** Cari objek luar untuk inner class yang class luarnya `luar`: jumlah lompatan, 'statik', atau null. */
  private cariObjekLuar(luar: A.InfoKelas): number | 'statik' | null {
    let statikSaja = this.ctx.statik
    let hop = 0
    for (let k: A.InfoKelas | undefined = this.ctx.kelas; k; k = k.luar) {
      if (k === luar) return statikSaja ? 'statik' : hop
      if (k.statik) statikSaja = true
      hop++
    }
    return null
  }

  protected siapkanBaru(e: A.BaruObjek): PersiapanBaru {
    const ada = this.persiapanBaru.get(e)
    if (ada) return ada
    const p: PersiapanBaru = { tipe: null, diamond: false, args: [], kandidat: [], gagal: false }
    this.persiapanBaru.set(e, p)
    const tipe = this.tipeDari(e.tipeNode, true)
    const posisiNew = this.awalSaja(e.span)
    if (tipe.k !== 'kelas') {
      p.args = e.argumen.map((a) => this.argumenAwal(a))
      p.gagal = true
      return p
    }
    p.diamond = tipe.argumen?.length === 0
    const u = this.kelasUser.get(tipe.nama)
    if (u && !u.statik && u.luar) {
      const luar = this.cariObjekLuar(u.luar)
      if (luar === null) {
        this.lapor('butuh-objek-luar', posisiNew, katalog.butuhObjekLuar(this.namaTampil(u)))
        p.gagal = true
      } else if (luar === 'statik') {
        this.lapor('konteks-statik-variabel', posisiNew, katalog.konteksStatikVariabel('this'))
        p.gagal = true
      } else {
        p.luar = luar
        this.tandaiPakaiThis()
      }
    }
    p.args = e.argumen.map((a) => this.argumenAwal(a))
    if (!p.gagal && !u && this.dunia.antarmuka(tipe.nama)) {
      this.lapor('kelas-abstrak', posisiNew, {
        pesan: `${this.teks({ k: 'kelas', nama: tipe.nama })} is abstract; cannot be instantiated`,
        artinya: `${this.teks({ k: 'kelas', nama: tipe.nama })} adalah antarmuka, bukan class, sehingga tidak bisa dibuat langsung dengan new.`,
        saran: tipe.nama === 'List' ? 'Gunakan class implementasinya, mis. new ArrayList<>().' : tipe.nama === 'Map' ? 'Gunakan new HashMap<>().' : tipe.nama === 'Set' ? 'Gunakan new HashSet<>().' : undefined,
      })
      p.gagal = true
    }
    if (p.gagal) return p
    const dasar: TipeKelas = { k: 'kelas', nama: tipe.nama }
    p.tipe = p.diamond ? dasar : tipe
    let kandidat = this.kandidatKonstruktor(dasar)
    if (!p.diamond && kandidat.some((k) => k.tipeParam.length)) {
      const par = this.dunia.parameterKelas(tipe.nama)
      const peta = new Map(par.map((n, i) => [n, tipe.argumen?.[i] ?? T.Object]))
      kandidat = kandidat.map((k) => ({
        ...k,
        tipeParam: [],
        parameter: k.parameter.map((x) => (tipe.argumen ? substitusi(x, peta) : this.hapusGenerikTipe(x))),
        kembali: tipe,
      }))
    }
    p.kandidat = kandidat
    return p
  }

  private hapusGenerikTipe(t: Tipe): Tipe {
    return memuatVariabel(t) || t.k === 'kelas' ? this.hapusVariabel(t.k === 'kelas' ? { k: 'kelas', nama: t.nama } : t) : t
  }

  /** Resolusi konstruktor (dengan inferensi diamond dari target). `lapor` false = coba diam-diam (argumen poli). */
  protected selesaikanBaru(e: A.BaruObjek, p: PersiapanBaru, target: Tipe | undefined, lapor: boolean): Tipe | null {
    if (!p.tipe || p.gagal) return lapor ? T.error : null
    if (this.adaArgumenError(p.args)) return lapor ? (p.diamond ? T.error : p.tipe) : null
    const nama = this.teks({ k: 'kelas', nama: p.tipe.nama })
    if (!p.kandidat.length) {
      if (lapor) this.lapor('akses-privat', this.awalSaja(e.span), katalog.aksesPrivat(`${nama}()`, nama))
      return lapor ? T.error : null
    }
    const hasil = resolusi(this.dunia, p.kandidat, p.args.map((x) => x.a), p.diamond ? target : undefined)
    if (!hasil.pilih) {
      if (lapor) this.laporResolusi(this.awalSaja(e.span), nama, 'constructor', hasil, p.kandidat, p.args, p.tipe)
      return lapor ? T.error : null
    }
    const pilih = hasil.pilih
    const tipeHasil = p.diamond ? this.hapusVariabel(pilih.kembali) : p.tipe
    if (!lapor) return tipeHasil
    const d = pilih.kandidat.data
    if (!this.bolehAkses(d.akses, d.kelasUser)) {
      this.lapor('akses-privat', this.awalSaja(e.span), katalog.aksesPrivat(this.tandaTanganKandidat(pilih.kandidat), nama))
      return T.error
    }
    this.selesaikanArgumen(p.args, pilih.kandidat, pilih.parameter, pilih.fase)
    e.pakaiVarargs = pilih.fase === 3
    if (d.pustaka) {
      e.target = {
        k: 'pustaka',
        id: d.pustaka.id,
        parameter: pilih.parameter.map((x) => this.hapusVariabel(x)),
        kembali: tipeHasil,
        statik: true,
        varargs: d.pustaka.varargs,
      }
    } else {
      const info = this.kelasUser.get(p.tipe.nama)!
      e.target = { k: 'user', kelas: info, ...(d.user ? { konstruktor: d.user } : {}), ...(p.luar ? { luar: p.luar } : {}) }
    }
    return tipeHasil
  }

  private baruObjek(e: A.BaruObjek, target?: Tipe): Tipe {
    const p = this.siapkanBaru(e)
    return this.selesaikanBaru(e, p, target, true) ?? T.error
  }

  private baruArray(e: A.BaruArray): Tipe {
    const dasar = this.tipeDari(e.elemen)
    for (const d of e.dimensi) {
      const t = this.ekspresi(d)
      if (adalahError(t)) continue
      const p = this.dunia.primitifDari(t)
      if (!p || !adalahNumerik(p)) this.lapor('tipe-tidak-cocok', d.span, katalog.tipeTidakCocok(this.teks(t), 'int'))
      else if (!samaTipe(promosiUnary(p), T.int)) this.lapor('konversi-lossy', d.span, katalog.konversiLossy(this.teks(t), 'int', this.diag.teks(d.span)))
    }
    if (adalahError(dasar)) return T.error
    const tipe = tipeArray(dasar, e.dimensi.length + e.dimensiKosong)
    if (e.init) this.inisialisasiArray(e.init, tipe)
    if (dasar.k === 'kelas' && dasar.argumen && dasar.argumen.length > 0) {
      this.lapor('array-generik', this.awalSaja(e.span), katalog.arrayGenerik())
      return T.error
    }
    return tipe
  }

  /** `this(...)` / `super(...)` (hanya sah sebagai pernyataan pertama konstruktor). */
  private panggilKonstruktor(e: A.PanggilKonstruktor): Tipe {
    const d = this.ctx.deklarasi
    const awal = d?.badan.pernyataan[0]
    const pertama = this.ctx.konstruktor && !this.ctx.lambda && awal?.jenis === 'PernyataanEkspresi' && awal.ekspresi === e
    if (!pertama) {
      this.lapor('panggil-konstruktor', e.span, katalog.panggilKonstruktorPertama(e.bentuk))
      return T.void
    }
    const args = e.argumen.map((a) => this.argumenAwal(a))
    if (this.adaArgumenError(args)) return T.void
    const kelas = this.ctx.kelas
    const tipe: TipeKelas = e.bentuk === 'this' ? this.tipeKelasUser(kelas) : ((kelas.induk as TipeKelas | undefined) ?? (T.Object as TipeKelas))
    const kandidat = this.kandidatKonstruktor(tipe)
    const nama = this.teks({ k: 'kelas', nama: tipe.nama })
    const hasil = resolusi(this.dunia, kandidat, args.map((x) => x.a))
    if (!hasil.pilih) {
      this.laporResolusi(this.awalSaja(e.span), nama, 'constructor', hasil, kandidat, args, tipe)
      return T.void
    }
    const pilih = hasil.pilih
    const dk = pilih.kandidat.data
    if (!this.bolehAkses(dk.akses, dk.kelasUser)) {
      this.lapor('akses-privat', this.awalSaja(e.span), katalog.aksesPrivat(this.tandaTanganKandidat(pilih.kandidat), nama))
      return T.void
    }
    this.selesaikanArgumen(args, pilih.kandidat, pilih.parameter, pilih.fase)
    e.pakaiVarargs = pilih.fase === 3
    if (dk.pustaka) e.target = { k: 'pustaka', id: dk.pustaka.id, parameter: pilih.parameter }
    else e.target = { k: 'user', kelas: this.kelasUser.get(tipe.nama)!, ...(dk.user ? { konstruktor: dk.user } : {}) }
    return T.void
  }

  /**
   * `super()` implisit di awal konstruktor (tertulis tanpa this/super, atau konstruktor bawaan): seperti javac,
   * konstruktor tanpa argumen class induk harus ada dan boleh diakses. Error di `posisi` (kurawal badan konstruktor,
   * atau kata kunci `class` untuk konstruktor bawaan).
   */
  protected cekSuperImplisit(posisi: Span): void {
    const induk = this.ctx.kelas.induk
    if (!induk || induk.k !== 'kelas') return
    const tipe: TipeKelas = { k: 'kelas', nama: induk.nama }
    const kandidat = this.kandidatKonstruktor(tipe)
    const nama = this.teks(tipe)
    const hasil = resolusi(this.dunia, kandidat, [])
    if (!hasil.pilih) {
      this.laporResolusi(posisi, nama, 'constructor', hasil, kandidat, [], tipe)
      return
    }
    const dk = hasil.pilih.kandidat.data
    if (!this.bolehAkses(dk.akses, dk.kelasUser)) this.lapor('akses-privat', posisi, katalog.aksesPrivat(this.tandaTanganKandidat(hasil.pilih.kandidat), nama))
  }

  // ---------- operator ----------
  private unary(e: A.Unary): Tipe {
    const t = this.ekspresi(e.operand)
    if (adalahError(t)) return T.error
    const p = this.dunia.primitifDari(t)
    const k = e.operand.konstan
    if (e.op === '!') {
      if (!p || !adalahBoolean(p)) {
        this.lapor('operand-unary-salah', e.span, katalog.operandUnarySalah('!', this.teks(t)))
        return T.error
      }
      if (k !== undefined) e.konstan = !k
      return T.boolean
    }
    if (!p || (e.op === '~' ? !adalahIntegral(p) : !adalahNumerik(p))) {
      this.lapor('operand-unary-salah', e.span, katalog.operandUnarySalah(e.op, this.teks(t)))
      return T.error
    }
    const hasil = promosiUnary(p) as Prim
    if (k !== undefined && t.k === 'primitif') {
      const v = konversiPrimitif(k as number | bigint, t.nama, hasil.nama)
      e.konstan = (e.op === '+' ? v : e.op === '-' ? negasi(v, hasil.nama) : bitNot(v, hasil.nama)) as A.NilaiKonstan
    }
    return hasil
  }

  /** Apakah blank final `f` boleh diisi di sini (konstruktor class pemiliknya, lewat `f` atau `this.f`). */
  private bolehIsiBlankFinal(f: A.SimbolField, target: A.Ekspresi): boolean {
    if (f.deklarasi.init || f.statik || this.ctx.lambda) return false
    if (!this.ctx.konstruktor || this.ctx.kelas.nama !== f.kelas) return false
    if (target.jenis === 'Nama') return target.ikatan?.k === 'field' && !target.ikatan.luar
    return target.jenis === 'AksesField' && target.objek.jenis === 'This' && !target.objek.kualifier
  }

  /** Pastikan ekspresi adalah variabel yang bisa diubah; laporkan error bila tidak. */
  protected cekTargetVariabel(target: A.Ekspresi, tipe: Tipe): boolean {
    if (adalahError(tipe)) return false
    if (target.jenis === 'Nama' && target.ikatan?.k === 'lokal') return true
    if ((target.jenis === 'Nama' || target.jenis === 'AksesField') && target.ikatan?.k === 'field') {
      const f = target.ikatan.field
      if (f.final && !this.bolehIsiBlankFinal(f, target)) {
        this.lapor('final-diubah', target.span, f.statik ? { ...katalog.finalDiubah(f.nama), pesan: `cannot assign a value to static final variable ${f.nama}` } : katalog.finalDiubah(f.nama))
        return false
      }
      return true
    }
    if (target.jenis === 'AksesArray') return true
    if (target.jenis === 'AksesField' && (target.ikatan?.k === 'panjang-array' || target.ikatan?.k === 'field-pustaka')) {
      this.lapor('final-diubah', target.span, katalog.finalDiubah(target.nama))
      return false
    }
    this.lapor('tipe-tak-terduga', target.span, katalog.tipeTakTerduga('variable', 'value'))
    return false
  }

  protected cekFinalLokal(target: A.Ekspresi): void {
    if (target.jenis === 'Nama' && target.ikatan?.k === 'lokal' && target.ikatan.info.final) {
      const info = target.ikatan.info
      // Variabel final lokal tanpa nilai awal boleh diisi sekali.
      if (info.parameter || info.punyaInit) this.lapor('final-diubah', target.span, katalog.finalDiubah(info.nama))
    }
  }

  private incDec(e: A.IncDec): Tipe {
    const t = this.ekspresi(e.target)
    if (adalahError(t)) return T.error
    const p = this.dunia.primitifDari(t)
    if (!p || !adalahNumerik(p)) {
      this.lapor('operand-unary-salah', e.span, katalog.operandUnarySalah(e.op, this.teks(t)))
      return T.error
    }
    if (this.cekTargetVariabel(e.target, t)) this.cekFinalLokal(e.target)
    return t
  }

  private biner(e: A.Biner): Tipe {
    const ta = this.ekspresi(e.kiri)
    const tb = this.ekspresi(e.kanan)
    if (adalahError(ta) || adalahError(tb)) return e.op === '+' && (adalahString(ta) || adalahString(tb)) ? T.String : T.error
    const salah = () => {
      this.lapor('operand-biner-salah', e.span, katalog.operandBinerSalah(e.op, this.teks(ta), this.teks(tb)))
      return T.error
    }
    const ka = e.kiri.konstan
    const kb = e.kanan.konstan
    const op = e.op
    const pa = this.dunia.primitifDari(ta)
    const pb = this.dunia.primitifDari(tb)
    const nama = (t: Tipe) => (t as Prim).nama
    if (op === '+' && (adalahString(ta) || adalahString(tb))) {
      if (ta.k === 'void' || tb.k === 'void') {
        // javac menunjuk ke operand yang bertipe void.
        this.lapor('void-tidak-boleh', ta.k === 'void' ? e.kiri.span : e.kanan.span, katalog.voidTidakBoleh())
        return T.error
      }
      e.tipeOperasi = T.String
      if (ka !== undefined && kb !== undefined) e.konstan = konstanKeString(ka, ta) + konstanKeString(kb, tb)
      return T.String
    }
    const konstanPrimitif = ka !== undefined && kb !== undefined && ta.k === 'primitif' && tb.k === 'primitif'
    if (OP_ARITMETIKA.has(op)) {
      if (!pa || !pb || !adalahNumerik(pa) || !adalahNumerik(pb)) return salah()
      const hasil = promosiBiner(pa, pb) as Prim
      e.tipeOperasi = hasil
      if (konstanPrimitif) {
        try {
          const a = konversiPrimitif(ka as number, nama(ta), hasil.nama)
          const b = konversiPrimitif(kb as number, nama(tb), hasil.nama)
          e.konstan = aritmetika(op as '+', a, b, hasil.nama).nilai as A.NilaiKonstan
        } catch (err) {
          if (!(err instanceof LemparanJava)) throw err
        }
      }
      return hasil
    }
    if (op === '<<' || op === '>>' || op === '>>>') {
      if (!pa || !pb || !adalahIntegral(pa) || !adalahIntegral(pb)) return salah()
      const hasil = promosiUnary(pa) as Prim
      e.tipeOperasi = hasil
      if (konstanPrimitif) {
        const a = konversiPrimitif(ka as number, nama(ta), hasil.nama)
        e.konstan = geser(op, a, kb as number | bigint, hasil.nama) as A.NilaiKonstan
      }
      return hasil
    }
    if (OP_RELASIONAL.has(op)) {
      if (!pa || !pb || !adalahNumerik(pa) || !adalahNumerik(pb)) return salah()
      const p = promosiBiner(pa, pb) as Prim
      e.tipeOperasi = p
      if (konstanPrimitif) {
        const a = konversiPrimitif(ka as number, nama(ta), p.nama)
        const b = konversiPrimitif(kb as number, nama(tb), p.nama)
        e.konstan = bandingkan(op as '<', a, b)
      }
      return T.boolean
    }
    if (op === '==' || op === '!=') {
      const satuPrimitif = ta.k === 'primitif' || tb.k === 'primitif'
      if (satuPrimitif && pa && pb && adalahNumerik(pa) && adalahNumerik(pb)) {
        const p = promosiBiner(pa, pb) as Prim
        e.tipeOperasi = p
        if (konstanPrimitif) {
          const a = konversiPrimitif(ka as number, nama(ta), p.nama)
          const b = konversiPrimitif(kb as number, nama(tb), p.nama)
          e.konstan = bandingkan(op, a, b)
        }
        return T.boolean
      }
      if (satuPrimitif && pa && pb && adalahBoolean(pa) && adalahBoolean(pb)) {
        e.tipeOperasi = T.boolean
        if (konstanPrimitif) e.konstan = op === '==' ? ka === kb : ka !== kb
        return T.boolean
      }
      if (ta.k !== 'primitif' && tb.k !== 'primitif' && ta.k !== 'void' && tb.k !== 'void') {
        if (this.dunia.bisaCast(ta, tb) || this.dunia.bisaCast(tb, ta)) {
          e.tipeOperasi = T.Object
          return T.boolean
        }
        this.lapor('tak-terbandingkan', e.span, katalog.takTerbandingkan(this.teks(ta), this.teks(tb)))
        return T.error
      }
      if (ta.k === 'primitif' && tb.k === 'primitif') {
        this.lapor('tak-terbandingkan', e.span, katalog.takTerbandingkan(this.teks(ta), this.teks(tb)))
        return T.error
      }
      return salah()
    }
    if (op === '&&' || op === '||') {
      if (!pa || !pb || !adalahBoolean(pa) || !adalahBoolean(pb)) return salah()
      e.tipeOperasi = T.boolean
      if (konstanPrimitif) e.konstan = op === '&&' ? (ka as boolean) && (kb as boolean) : (ka as boolean) || (kb as boolean)
      return T.boolean
    }
    // & | ^
    if (pa && pb && adalahBoolean(pa) && adalahBoolean(pb)) {
      e.tipeOperasi = T.boolean
      if (konstanPrimitif) e.konstan = operasiBit(op as '&', ka as boolean, kb as boolean, 'boolean') as boolean
      return T.boolean
    }
    if (pa && pb && adalahIntegral(pa) && adalahIntegral(pb)) {
      const p = promosiBiner(pa, pb) as Prim
      e.tipeOperasi = p
      if (konstanPrimitif) {
        const a = konversiPrimitif(ka as number, nama(ta), p.nama)
        const b = konversiPrimitif(kb as number, nama(tb), p.nama)
        e.konstan = operasiBit(op as '&', a, b, p.nama) as A.NilaiKonstan
      }
      return p
    }
    return salah()
  }

  private assign(e: A.Assign): Tipe {
    const tt = this.ekspresi(e.target)
    const tv = e.nilai.jenis === 'InisialisasiArray' ? T.error : this.ekspresi(e.nilai, e.op === '=' && !adalahError(tt) ? tt : undefined)
    if (adalahError(tt)) return T.error
    const variabel = this.cekTargetVariabel(e.target, tt)
    if (variabel) this.cekFinalLokal(e.target)
    if (adalahError(tv)) return tt
    if (e.op === '=') {
      const poli = e.nilai.jenis === 'Lambda' || (e.nilai.jenis === 'Kondisional' && this.kondisionalPoli.has(e.nilai))
      if (!poli) this.cekKonversi(tv, tt, e.nilai.konstan, e.nilai.span)
      return tt
    }
    const op = e.op.slice(0, -1)
    if (op === '+' && adalahString(tt)) {
      if (tv.k === 'void') this.lapor('void-tidak-boleh', e.nilai.span, { pesan: "'void' type not allowed here", artinya: 'Method void tidak menghasilkan nilai.' })
      e.tipeOperasi = T.String
      return tt
    }
    const salah = () => {
      this.lapor('operand-biner-salah', e.span, katalog.operandBinerSalah(op, this.teks(tt), this.teks(tv)))
      return tt
    }
    const pt = this.dunia.primitifDari(tt)
    const pv = this.dunia.primitifDari(tv)
    if (OP_ARITMETIKA.has(op)) {
      if (!pt || !pv || !adalahNumerik(pt) || !adalahNumerik(pv)) return salah()
      e.tipeOperasi = promosiBiner(pt, pv)
      return tt
    }
    if (op === '<<' || op === '>>' || op === '>>>') {
      if (!pt || !pv || !adalahIntegral(pt) || !adalahIntegral(pv)) return salah()
      e.tipeOperasi = promosiUnary(pt)
      return tt
    }
    if (pt && pv && adalahBoolean(pt) && adalahBoolean(pv)) {
      e.tipeOperasi = T.boolean
      return tt
    }
    if (pt && pv && adalahIntegral(pt) && adalahIntegral(pv)) {
      e.tipeOperasi = promosiBiner(pt, pv)
      return tt
    }
    return salah()
  }

  /** Tipe kondisional numerik (JLS 15.25.2). */
  private tipeKondisionalNumerik(ta: Tipe, tb: Tipe, pa: Prim, pb: Prim, ka: A.NilaiKonstan | undefined, kb: A.NilaiKonstan | undefined): Tipe {
    if (ta.k === 'primitif' && tb.k === 'kelas' && pb.nama === ta.nama) return ta
    if (tb.k === 'primitif' && ta.k === 'kelas' && pa.nama === tb.nama) return tb
    const kecil = ['byte', 'short', 'char']
    if ((pa.nama === 'byte' && pb.nama === 'short') || (pa.nama === 'short' && pb.nama === 'byte')) return T.short
    const muat = (t: Tipe, k: A.NilaiKonstan | undefined, sasaran: Prim) =>
      samaTipe(t, T.int) && typeof k === 'number' && this.dunia.cekAssign(T.int, sasaran, k) === 'ok'
    if (kecil.includes(pa.nama) && muat(tb, kb, pa)) return pa
    if (kecil.includes(pb.nama) && muat(ta, ka, pb)) return pb
    return promosiBiner(pa, pb)
  }

  /**
   * Seperti `isBooleanOrNumeric` javac: literal numerik/boolean/null, kondisional yang kedua cabangnya demikian,
   * atau ekspresi bertipe primitif/pembungkus. Bila salah satu cabang tidak demikian dan ada tipe target,
   * kondisional itu ekspresi poli (cabangnya dicek terhadap target).
   */
  protected numerikAtauBoolean(e: A.Ekspresi): boolean {
    switch (e.jenis) {
      case 'Literal':
        return e.jenisLiteral !== 'string'
      case 'Lambda':
        return false
      case 'Kondisional':
        return this.numerikAtauBoolean(e.ya) && this.numerikAtauBoolean(e.tidak)
      default: {
        const t = e.tipe
        if (!t || adalahError(t) || t.k === 'void') return false
        return t.k === 'primitif' || this.dunia.unboks(t) !== undefined
      }
    }
  }

  /** Kondisional yang diperiksa sebagai ekspresi poli (tipenya = tipe target). */
  protected readonly kondisionalPoli = new WeakSet<A.Kondisional>()

  /** Tipe kondisional mandiri (JLS 15.25): boolean, numerik (dengan unboxing), atau referensi. */
  protected tipeKondisionalStandalone(e: A.Kondisional, ta: Tipe, tb: Tipe): Tipe {
    if (adalahError(ta) || adalahError(tb)) return T.error
    const pa = this.dunia.primitifDari(ta)
    const pb = this.dunia.primitifDari(tb)
    let hasil: Tipe
    if (pa && pb && adalahBoolean(pa) && adalahBoolean(pb)) hasil = ta.k === 'kelas' && tb.k === 'kelas' ? ta : T.boolean
    else if (pa && pb && adalahNumerik(pa) && adalahNumerik(pb)) hasil = samaTipe(ta, tb) ? ta : this.tipeKondisionalNumerik(ta, tb, pa, pb, e.ya.konstan, e.tidak.konstan)
    else if (ta.k === 'null' && tb.k === 'null') hasil = T.null
    else if (ta.k === 'null') hasil = this.dunia.boksBila(tb)
    else if (tb.k === 'null') hasil = this.dunia.boksBila(ta)
    else {
      const a = this.dunia.boksBila(ta)
      const b = this.dunia.boksBila(tb)
      if (this.dunia.subtipe(a, b)) hasil = b
      else if (this.dunia.subtipe(b, a)) hasil = a
      else hasil = T.Object
    }
    this.lipatKonstanKondisional(e, hasil)
    return hasil
  }

  /** Lipat konstanta `c ? a : b` bila ketiganya konstan (javac: dikonversi ke tipe kondisional). */
  private lipatKonstanKondisional(e: A.Kondisional, hasil: Tipe): void {
    const k = e.kondisi.konstan
    if (k === undefined || e.ya.konstan === undefined || e.tidak.konstan === undefined) return
    const dipilih = k ? e.ya : e.tidak
    if (!dipilih.tipe) return
    const v = konversiKonstan(dipilih.konstan!, dipilih.tipe, hasil)
    if (v !== undefined) e.konstan = v
  }

  private kondisional(e: A.Kondisional, target: Tipe | undefined): Tipe {
    const t = this.atributKondisional(e, target)
    if (this.kondisionalPoli.has(e)) this.cekCabangPoli(e, t, [])
    return t
  }

  /** Atribusi kondisional; cabang kondisional poli dilaporkan oleh kondisional terluar (lihat `cekCabangPoli`). */
  private atributKondisional(e: A.Kondisional, target: Tipe | undefined): Tipe {
    this.kondisi(e.kondisi)
    const sasaran = target !== undefined && !adalahError(target) && target.k !== 'void' ? target : undefined
    const cabang = (x: A.Ekspresi): Tipe => {
      if (x.jenis !== 'Kondisional') return this.ekspresi(x, sasaran)
      const t = this.atributKondisional(x, sasaran)
      x.tipe = t
      return t
    }
    const ta = cabang(e.ya)
    const tb = cabang(e.tidak)
    if (sasaran && !(this.numerikAtauBoolean(e.ya) && this.numerikAtauBoolean(e.tidak))) {
      this.kondisionalPoli.add(e)
      this.lipatKonstanKondisional(e, sasaran)
      return sasaran
    }
    return this.tipeKondisionalStandalone(e, ta, tb)
  }

  /** Tiap cabang kondisional poli harus cocok dengan target (`bad type in conditional expression`). */
  private cekCabangPoli(e: A.Kondisional, target: Tipe, awalan: string[]): void {
    for (const x of [e.ya, e.tidak]) {
      if (x.jenis === 'Kondisional' && this.kondisionalPoli.has(x)) {
        this.cekCabangPoli(x, target, [...awalan, 'bad type in conditional expression'])
        continue
      }
      // Lambda dan diamond sudah diperiksa terhadap target saat atribusi.
      if (x.jenis === 'Lambda') continue
      const t = x.tipe
      if (!t || adalahError(t)) continue
      const h = t.k === 'void' ? 'tidak-cocok' : this.dunia.cekAssign(t, target, x.konstan)
      if (h !== 'ok') this.lapor('kondisional-tidak-cocok', x.span, katalog.kondisionalTidakCocok([...awalan, this.fragmenKonversi(t, target)]))
    }
  }

  private cast(e: A.Cast): Tipe {
    const ke = this.tipeDari(e.tipeNode)
    const lambda = e.ekspresi.jenis === 'Lambda'
    const dari = this.ekspresi(e.ekspresi, lambda && !adalahError(ke) ? ke : undefined)
    if (adalahError(ke) || adalahError(dari)) return adalahError(ke) ? T.error : ke
    if (lambda) return ke
    if (!this.dunia.bisaCast(dari, ke)) {
      // javac menunjuk ke ekspresi yang di-cast, bukan ke tanda kurung tipe.
      this.lapor('tipe-tidak-cocok', { ...e.span, fokus: e.ekspresi.span.fokus ?? e.ekspresi.span.awal }, katalog.tipeTidakCocok(this.teks(dari), this.teks(ke)))
      return ke
    }
    if (e.ekspresi.konstan !== undefined && (ke.k === 'primitif' || adalahString(ke))) {
      const v = konversiKonstan(e.ekspresi.konstan, dari, ke)
      if (v !== undefined) e.konstan = v
    }
    return ke
  }

  // ---------- lambda ----------
  /** Lambda bertarget `Comparator<T>`: parameter dari target (atau tipe eksplisit), badan ekspresi/blok. */
  private lambda(e: A.Lambda, target: Tipe | undefined): Tipe {
    const awal = this.awalSaja(e.span)
    if (!target) {
      this.lapor('lambda-tak-terduga', awal, {
        pesan: 'lambda expression not expected here',
        artinya: 'Ekspresi lambda hanya boleh ditulis di tempat yang mengharapkan antarmuka fungsional, mis. sebagai argumen sort atau disimpan ke variabel Comparator.',
      })
      return T.error
    }
    if (adalahError(target)) return T.error
    if (target.k !== 'kelas' || aritasFungsional(target) === undefined) {
      this.lapor('bukan-fungsional', awal, katalog.bukanAntarmukaFungsional(this.teks(target)))
      return T.error
    }
    if (target.nama !== 'Comparator') {
      this.lapor('belum-didukung', awal, katalog.belumDidukung(`Lambda untuk ${this.teks(target)}`, 'Lambda hanya didukung untuk Comparator. Gunakan class atau perulangan biasa.'))
      return T.error
    }
    if (e.parameter.length !== 2) {
      this.lapor('lambda-parameter', awal, katalog.lambdaParameterTidakCocok())
      return T.error
    }
    let paramTipe = parameterComparator(target)
    if (e.parameter.some((p) => p.tipeNode)) {
      const eksplisit = e.parameter.map((p) => (p.tipeNode ? this.tipeDari(p.tipeNode) : T.error))
      if (eksplisit.some(adalahError)) return T.error
      const sama = eksplisit.every((x) => samaTipe(x, eksplisit[0]))
      const disimpulkan: Tipe = { k: 'kelas', nama: 'Comparator', argumen: [this.dunia.boksBila(eksplisit[0])] }
      if (!sama || !this.dunia.subtipe(disimpulkan, target)) {
        const wildcard = target.argumen?.[0]?.k === 'wildcard'
        if (sama && wildcard) this.lapor('tipe-tidak-cocok', awal, katalog.tipeTidakCocok(this.teks(disimpulkan), this.teks(target)))
        else this.lapor('lambda-parameter', awal, katalog.lambdaParameterTidakCocok())
        return T.error
      }
      paramTipe = eksplisit[0]
    }
    const kl: KonteksLambda = { node: e, induk: this.ctx.lambda, batasLingkup: this.ctx.lingkup.length, tangkapan: new Map(), urutan: [], pakaiThis: false }
    const simpan = {
      slotBerikut: this.ctx.slotBerikut,
      kembali: this.ctx.kembali,
      lambda: this.ctx.lambda,
      loop: this.ctx.kedalamanLoop,
      sw: this.ctx.kedalamanSwitch,
    }
    this.masukLingkup()
    this.ctx.slotBerikut = 0
    this.ctx.kedalamanLoop = 0
    this.ctx.kedalamanSwitch = 0
    for (const p of e.parameter) {
      this.cekSudahAda(p.nama, p.spanNama)
      p.info = this.deklarasiLokal(p.nama, paramTipe, false, true, p.spanNama)
      p.info.punyaInit = true
    }
    this.ctx.lambda = kl
    this.ctx.kembali = T.int
    try {
      // Pra-pindai: variabel luar yang dipakai mendapat slot tangkapan sesuai urutan kemunculan pertama.
      for (const n of namaDalam(e.badan)) this.cariLokal(n)
      if (e.badan.jenis === 'Blok') {
        this.periksaBlok(e.badan)
        if (this.bisaSelesaiNormal(e.badan)) this.lapor('lambda-kembalian', awal, katalog.lambdaKembalianSalah('missing return value'))
      } else {
        const t = this.ekspresi(e.badan)
        if (!adalahError(t)) {
          const h = t.k === 'void' ? 'tidak-cocok' : this.dunia.cekAssign(t, T.int, e.badan.konstan)
          if (h !== 'ok') this.lapor('lambda-kembalian', e.badan.span, katalog.lambdaKembalianSalah(this.fragmenKonversi(t, T.int)))
        }
      }
    } finally {
      this.keluarLingkup()
      e.jumlahSlot = this.ctx.slotBerikut
      this.ctx.slotBerikut = simpan.slotBerikut
      this.ctx.kembali = simpan.kembali
      this.ctx.lambda = simpan.lambda
      this.ctx.kedalamanLoop = simpan.loop
      this.ctx.kedalamanSwitch = simpan.sw
    }
    e.tangkapan = kl.urutan
    e.pakaiThis = kl.pakaiThis
    e.fungsional = { antarmuka: 'Comparator', parameter: [paramTipe, paramTipe], kembali: T.int }
    const daftar = this.lambdaKelas.get(this.ctx.kelas) ?? []
    daftar.push({ lambda: e, pemilik: this.ctx.pemilikLambda })
    this.lambdaKelas.set(this.ctx.kelas, daftar)
    return { k: 'kelas', nama: 'Comparator', argumen: [this.dunia.boksBila(paramTipe)] }
  }

  /** Apakah sedang memeriksa badan lambda (untuk aturan `return`). */
  protected dalamLambda(): boolean {
    return this.ctx.lambda !== null
  }

  /** Tipe kembali method mahasiswa yang berupa tipe pustaka berparameter tipe (dipakai pemeriksa pernyataan). */
  protected tipeKembaliPustaka(m: MethodPustaka): Tipe {
    return m.kembali
  }
}

/** Nama variabel (simpul `Nama`) di dalam sebuah badan, menurut urutan kemunculan di kode. */
function namaDalam(n: A.Pernyataan | A.Ekspresi, hasil: string[] = []): string[] {
  if (n.jenis === 'Nama') hasil.push(n.nama)
  for (const a of anakNode(n)) namaDalam(a, hasil)
  return hasil
}

/** Hasil persiapan `new`: tipe class (null bila error), argumen yang sudah diperiksa, dan kandidat konstruktor. */
interface PersiapanBaru {
  tipe: TipeKelas | null
  diamond: boolean
  args: ArgumenAwal[]
  kandidat: KandidatMethod[]
  /** Jumlah lompatan ke objek luar untuk inner class. */
  luar?: number
  gagal: boolean
}
