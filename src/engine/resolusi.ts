/**
 * Resolusi overload (JLS 15.12.2: fase strict → loose → varargs, lalu method paling spesifik) dan inferensi
 * sederhana untuk method generik pustaka serta diamond (JLS 18, cukup untuk subset Fase 2).
 * Modul ini murni: tidak melapor diagnostik, hanya mengembalikan hasil atau alasan kegagalan per kandidat.
 */
import type * as A from './ast'
import type { ParamTipe } from './pustaka/daftar'
import type { DuniaTipe, TipeKelas } from './relasiTipe'
import { memuatVariabel, samaTipe, substitusi, T, tipeBoks, type Tipe } from './tipe'

export interface Kandidat<D = unknown> {
  nama: string
  /** Parameter setelah substitusi argumen tipe penerima; boleh memuat variabel tipe milik method (generik). */
  parameter: Tipe[]
  kembali: Tipe
  varargs: boolean
  /** Parameter tipe milik method generik (untuk diamond: parameter tipe class). */
  tipeParam: ParamTipe[]
  data: D
}

export type Argumen =
  | { k: 'biasa'; tipe: Tipe }
  /** Lambda; `eksplisit` berisi tipe parameter bila semua parameternya ditulis bertipe. */
  | { k: 'lambda'; node: A.Lambda; eksplisit?: Tipe[] }
  /**
   * Ekspresi poli (diamond, pemanggilan generik) yang tipenya bergantung pada target. `tunda`: tipe mandirinya
   * belum bisa disimpulkan tanpa target (mis. `Comparator.naturalOrder()`), dan itu bukan error.
   */
  | { k: 'poly'; tipe: Tipe; denganTarget: (target: Tipe) => Tipe | null; tunda?: boolean }
  /** Kondisional referensi (poli): kedua cabangnya masing-masing harus cocok dengan tipe parameter. */
  | { k: 'kondisional'; node: A.Kondisional; cabang: [Argumen, Argumen] }

export type Alasan =
  | { k: 'arity'; generik: boolean }
  | { k: 'arg'; indeks: number; dari: Tipe; ke: Tipe; lossy: boolean; varargs: boolean; generik: boolean }
  /** Lambda tidak cocok: parameter (jumlah/tipe), target bukan antarmuka fungsional, atau tipe eksplisit salah. */
  | { k: 'lambda'; indeks: number; jenis: 'parameter' | 'bukan-fungsional' | 'eksplisit'; ke: Tipe; dari?: Tipe; generik: boolean }
  /** Salah satu cabang kondisional (0 = setelah `?`, 1 = setelah `:`) tidak cocok; `dalam` = alasan cabang itu. */
  | { k: 'kondisional'; indeks: number; cabang: 0 | 1; dalam: Alasan; varargs: boolean; generik: boolean }
  | { k: 'batas'; variabel: string; sama: Tipe[]; atas: Tipe[]; bawah: Tipe[] }

export interface Terpilih<D> {
  kandidat: Kandidat<D>
  fase: 1 | 2 | 3
  /** Argumen tipe hasil inferensi untuk method generik. */
  peta: Map<string, Tipe>
  /** Tipe parameter akhir (setelah inferensi). */
  parameter: Tipe[]
  kembali: Tipe
  /** true bila memerlukan konversi unchecked (tipe kembali di-erase). */
  unchecked: boolean
}

export interface HasilResolusi<D> {
  pilih?: Terpilih<D>
  ambigu?: [Kandidat<D>, Kandidat<D>]
  /** Alasan setiap kandidat yang tidak berlaku (urutan sesuai kandidat). */
  alasan: Map<Kandidat<D>, Alasan>
}

/** Antarmuka fungsional pustaka yang dikenal beserta jumlah parameter function type-nya. */
const FUNGSIONAL: Record<string, number> = { Comparator: 2, Comparable: 1, Iterable: 0 }

export function aritasFungsional(t: Tipe): number | undefined {
  return t.k === 'kelas' ? FUNGSIONAL[t.nama] : undefined
}

/**
 * Function type dari Comparator<X> (JLS 9.9): parameter `[X', X']`, kembali int. Wildcard `? super Y`/`? extends Y`
 * memakai Y, `?` dan raw memakai Object.
 */
export function parameterComparator(t: Tipe): Tipe {
  if (t.k !== 'kelas' || !t.argumen?.length) return T.Object
  const a = t.argumen[0]
  if (a.k === 'wildcard') return a.tipe ?? T.Object
  return a
}

interface Batas {
  sama: Tipe[]
  bawah: Tipe[]
  atas: Tipe[]
}

class Inferensi {
  readonly batas = new Map<string, Batas>()
  gagal = false

  constructor(
    private readonly d: DuniaTipe,
    readonly variabel: ReadonlySet<string>,
    private readonly longgar: boolean,
  ) {
    for (const v of variabel) this.batas.set(v, { sama: [], bawah: [], atas: [] })
  }

  private bebas(t: Tipe): boolean {
    return !memuatVariabel(t, this.variabel)
  }

  /** ⟨a → f⟩: a kompatibel dengan f (konteks pemanggilan). */
  kompatibel(a: Tipe, f: Tipe): void {
    if (this.gagal || a.k === 'error') return
    if (this.bebas(f)) {
      if (!(this.longgar ? this.d.longgar(a, f) : this.d.strict(a, f))) this.gagal = true
      return
    }
    if (a.k === 'primitif') {
      if (!this.longgar) {
        this.gagal = true
        return
      }
      a = tipeBoks(a.nama)
    }
    this.subtipe(a, f)
  }

  /** ⟨a <: f⟩ dengan f memuat variabel inferensi. */
  subtipe(a: Tipe, f: Tipe): void {
    if (this.gagal || a.k === 'error') return
    if (a.k === 'null') return
    if (f.k === 'variabel' && this.variabel.has(f.nama)) {
      this.batas.get(f.nama)!.bawah.push(a)
      return
    }
    if (this.bebas(f)) {
      if (!this.d.subtipe(a, f) && !this.d.unchecked(a, f)) this.gagal = true
      return
    }
    if (f.k === 'array') {
      if (a.k !== 'array') {
        this.gagal = true
        return
      }
      // JLS 18.2.3: elemen primitif hanya cocok dengan primitif yang sama (tidak ada boxing di dalam array).
      if (a.elemen.k === 'primitif' || f.elemen.k === 'primitif') {
        if (!samaTipe(a.elemen, f.elemen)) this.gagal = true
      } else this.subtipe(a.elemen, f.elemen)
      return
    }
    if (f.k === 'kelas') {
      const s = this.d.asSuper(a, f.nama)
      if (!s) {
        this.gagal = true
        return
      }
      if (!s.argumen || !f.argumen) return
      f.argumen.forEach((fa, i) => this.mengandung(s.argumen![i], fa))
      return
    }
    this.gagal = true
  }

  /** ⟨s <= fa⟩: argumen tipe `s` termuat dalam `fa` (yang mungkin wildcard). */
  mengandung(s: Tipe, fa: Tipe): void {
    if (fa.k === 'wildcard') {
      if (!fa.batas || !fa.tipe) return
      if (fa.batas === 'extends') {
        const atas = s.k === 'wildcard' ? (s.batas === 'extends' && s.tipe ? s.tipe : T.Object) : s
        this.subtipe(atas, fa.tipe)
      } else {
        const bawah = s.k === 'wildcard' ? (s.batas === 'super' && s.tipe ? s.tipe : undefined) : s
        if (!bawah) return
        this.superTipe(fa.tipe, bawah)
      }
      return
    }
    if (s.k === 'wildcard') {
      // Capture disederhanakan: wildcard dipandang sebagai batasnya.
      this.sama(s.tipe ?? T.Object, fa)
      return
    }
    this.sama(s, fa)
  }

  /** ⟨f <: b⟩ dengan f memuat variabel inferensi dan b tipe biasa. */
  superTipe(f: Tipe, b: Tipe): void {
    if (f.k === 'variabel' && this.variabel.has(f.nama)) {
      this.batas.get(f.nama)!.atas.push(b)
      return
    }
    if (this.bebas(f)) {
      if (!this.d.subtipe(f, b)) this.gagal = true
      return
    }
    if (f.k === 'kelas' && b.k === 'kelas') {
      const s = this.d.asSuper(f, b.nama)
      if (!s) {
        this.gagal = true
        return
      }
      if (!s.argumen || !b.argumen) return
      b.argumen.forEach((ba, i) => {
        const sa = s.argumen![i]
        if (ba.k === 'wildcard') {
          if (ba.batas === 'extends' && ba.tipe) this.superTipe(sa, ba.tipe)
          else if (ba.batas === 'super' && ba.tipe) this.subtipe(ba.tipe, sa)
        } else this.sama(ba, sa)
      })
      return
    }
    this.gagal = true
  }

  /** ⟨a = f⟩ */
  sama(a: Tipe, f: Tipe): void {
    if (this.gagal) return
    if (f.k === 'variabel' && this.variabel.has(f.nama)) {
      if (a.k === 'primitif') this.gagal = true
      else this.batas.get(f.nama)!.sama.push(a)
      return
    }
    if (a.k === 'variabel' && this.variabel.has(a.nama)) {
      if (f.k === 'primitif') this.gagal = true
      else this.batas.get(a.nama)!.sama.push(f)
      return
    }
    if (this.bebas(f)) {
      if (!samaTipe(a, f) && a.k !== 'error') this.gagal = true
      return
    }
    if (f.k === 'kelas' && a.k === 'kelas' && a.nama === f.nama && a.argumen && f.argumen && a.argumen.length === f.argumen.length) {
      f.argumen.forEach((fa, i) => {
        const aa = a.argumen![i]
        if (fa.k === 'wildcard' && aa.k === 'wildcard') {
          if (fa.tipe && aa.tipe && fa.batas === aa.batas) this.sama(aa.tipe, fa.tipe)
        } else this.sama(aa, fa)
      })
      return
    }
    if (f.k === 'array' && a.k === 'array') {
      this.sama(a.elemen, f.elemen)
      return
    }
    this.gagal = true
  }
}

/** Batas atas teruntuk (least upper bound) yang disederhanakan: supertipe bersama pertama. */
function lub(d: DuniaTipe, tipe: Tipe[]): Tipe {
  const unik: Tipe[] = []
  for (const t of tipe) if (!unik.some((u) => samaTipe(u, t))) unik.push(t)
  if (unik.length === 1) return unik[0]
  const umum = unik.find((u) => unik.every((t) => d.subtipe(t, u)))
  if (umum) return umum
  // Telusuri supertipe tipe pertama secara melebar; ambil yang menjadi supertipe semua.
  const antrian: Tipe[] = [unik[0]]
  const dilihat = new Set<string>()
  while (antrian.length) {
    const t = antrian.shift()!
    if (t.k !== 'kelas') break
    if (dilihat.has(t.nama)) continue
    dilihat.add(t.nama)
    if (t.nama !== 'Object' && unik.every((u) => d.asSuper(u, t.nama) !== null)) return { k: 'kelas', nama: t.nama }
    antrian.push(...d.superLangsung(t as TipeKelas))
  }
  return T.Object
}

/** Hasil inferensi: peta variabel → tipe, atau alasan gagal batas. */
function selesaikan(d: DuniaTipe, inf: Inferensi, tipeParam: ParamTipe[]): { peta: Map<string, Tipe> } | { alasan: Alasan } {
  const peta = new Map<string, Tipe>()
  const bebas = (t: Tipe) => !memuatVariabel(t, inf.variabel)
  for (const p of tipeParam) {
    const b = inf.batas.get(p.nama)!
    const sama = b.sama.filter(bebas)
    let nilai: Tipe
    if (sama.length) {
      nilai = sama[0]
      if (sama.some((s) => !samaTipe(s, nilai))) return { alasan: { k: 'batas', variabel: p.nama, sama, atas: [], bawah: [] } }
      if (b.bawah.some((x) => !d.subtipe(x, nilai))) return { alasan: { k: 'batas', variabel: p.nama, sama, atas: [], bawah: b.bawah } }
    } else if (b.bawah.length) nilai = lub(d, b.bawah)
    else {
      const atas = b.atas.filter(bebas)
      if (atas.length) nilai = atas.find((a) => atas.every((x) => d.subtipe(a, x))) ?? atas[0]
      else nilai = p.batas.find((x) => bebas(x) && !(x.k === 'kelas' && x.nama === 'Object')) ?? T.Object
    }
    peta.set(p.nama, nilai)
  }
  // Batas atas eksplisit (dari ? super T) dan batas deklarasi (T extends Comparable<? super T>).
  for (const p of tipeParam) {
    const nilai = peta.get(p.nama)!
    const b = inf.batas.get(p.nama)!
    const atasEksplisit = b.atas.filter((x) => !memuatVariabel(x, inf.variabel))
    const deklarasi = p.batas.filter((x) => !(x.k === 'kelas' && x.nama === 'Object'))
    const melanggar =
      atasEksplisit.some((x) => !d.subtipe(nilai, x)) || deklarasi.some((x) => !d.subtipe(nilai, substitusi(x, peta)))
    if (melanggar) {
      return {
        alasan: {
          k: 'batas',
          variabel: p.nama,
          sama: b.sama.filter(bebas),
          atas: [...atasEksplisit, ...p.batas.filter((x) => !(x.k === 'kelas' && x.nama === 'Object') || p.batas.length > 1)],
          bawah: b.bawah,
        },
      }
    }
  }
  return { peta }
}

/** Tipe parameter ke-i untuk pemanggilan dengan `n` argumen (fase 3: elemen varargs untuk sisa argumen). */
function parameterKe(k: Kandidat, i: number, fase: 1 | 2 | 3): Tipe {
  const p = k.parameter
  if (fase === 3 && k.varargs && i >= p.length - 1) {
    const akhir = p[p.length - 1]
    return akhir.k === 'array' ? akhir.elemen : akhir
  }
  return p[i]
}

function arityCocok(k: Kandidat, n: number, fase: 1 | 2 | 3): boolean {
  if (fase === 3) return k.varargs && n >= k.parameter.length - 1
  return k.parameter.length === n
}

interface HasilCoba {
  ok: boolean
  alasan?: Alasan
  peta?: Map<string, Tipe>
  unchecked?: boolean
}

function cobaKandidat(d: DuniaTipe, k: Kandidat, arg: Argumen[], fase: 1 | 2 | 3, target: Tipe | undefined): HasilCoba {
  const generik = k.tipeParam.length > 0
  if (!arityCocok(k, arg.length, fase)) return { ok: false, alasan: { k: 'arity', generik } }
  const longgar = fase !== 1
  const variabel = new Set(k.tipeParam.map((p) => p.nama))
  const inf = new Inferensi(d, variabel, longgar)
  let unchecked = false
  /** Periksa satu argumen (atau cabang kondisional) terhadap parameter `f`; undefined = cocok. */
  const cek = (a: Argumen, f: Tipe, i: number, varargsBagian: boolean): Alasan | undefined => {
    if (a.k === 'kondisional') {
      for (const c of [0, 1] as const) {
        const r = cek(a.cabang[c], f, i, varargsBagian)
        if (r) return { k: 'kondisional', indeks: i, cabang: c, dalam: r, varargs: varargsBagian, generik }
      }
      return undefined
    }
    if (a.k === 'lambda') {
      const fBebas = !memuatVariabel(f, variabel)
      if (f.k === 'variabel' && variabel.has(f.nama)) return undefined
      const aritas = aritasFungsional(f)
      if (aritas === undefined) return { k: 'lambda', indeks: i, jenis: 'bukan-fungsional', ke: f, generik }
      if (aritas !== a.node.parameter.length) return { k: 'lambda', indeks: i, jenis: 'parameter', ke: f, generik }
      if (a.eksplisit && fBebas && f.k === 'kelas' && f.nama === 'Comparator') {
        const p = a.eksplisit[0]
        const sama = a.eksplisit.every((x) => samaTipe(x, p))
        const disimpulkan: Tipe = { k: 'kelas', nama: 'Comparator', argumen: [d.boksBila(p)] }
        if (!sama || !d.subtipe(disimpulkan, f)) return { k: 'lambda', indeks: i, jenis: 'eksplisit', ke: f, dari: disimpulkan, generik }
      }
      return undefined
    }
    if (a.k === 'poly' && !memuatVariabel(f, variabel)) {
      const t = a.denganTarget(f)
      if (t === null || !(longgar ? d.longgar(t, f) : d.strict(t, f))) {
        return { k: 'arg', indeks: i, dari: t ?? a.tipe, ke: f, lossy: false, varargs: varargsBagian, generik }
      }
      return undefined
    }
    if (a.k === 'poly' && a.tunda) {
      // Tipe kembalinya baru disimpulkan setelah target pasti; untuk sekarang cukup kelasnya yang harus cocok
      // (Comparator tidak bisa menjadi Collection), tanpa menyumbang batas inferensi.
      const t = a.tipe
      if (t.k === 'kelas' && f.k === 'kelas' && !d.asSuper(t, f.nama)) return { k: 'arg', indeks: i, dari: t, ke: f, lossy: false, varargs: varargsBagian, generik }
      return undefined
    }
    const tipeArg = a.tipe
    if (tipeArg.k === 'error') return undefined
    if (!memuatVariabel(f, variabel)) {
      const cocok = longgar ? d.longgar(tipeArg, f) : d.strict(tipeArg, f)
      if (!cocok) {
        const lossy = tipeArg.k === 'primitif' && f.k === 'primitif' && tipeArg.nama !== 'boolean' && f.nama !== 'boolean'
        return { k: 'arg', indeks: i, dari: tipeArg, ke: f, lossy, varargs: varargsBagian, generik }
      }
      if (d.unchecked(tipeArg, f) && !d.subtipe(tipeArg, f)) unchecked = true
      return undefined
    }
    inf.kompatibel(tipeArg, f)
    if (inf.gagal) return { k: 'arg', indeks: i, dari: tipeArg, ke: f, lossy: false, varargs: varargsBagian, generik }
    if (d.mentah(tipeArg)) unchecked = true
    return undefined
  }
  for (let i = 0; i < arg.length; i++) {
    const r = cek(arg[i], parameterKe(k, i, fase), i, fase === 3 && i >= k.parameter.length - 1)
    if (r) return { ok: false, alasan: r }
  }
  if (!generik) return { ok: true, peta: new Map(), unchecked }
  // Target (konteks assignment) ikut membatasi variabel yang muncul di tipe kembali.
  if (target && target.k !== 'void' && memuatVariabel(k.kembali, variabel) && !unchecked) {
    const coba = new Inferensi(d, variabel, longgar)
    for (const [v, b] of inf.batas) coba.batas.set(v, { sama: [...b.sama], bawah: [...b.bawah], atas: [...b.atas] })
    coba.superTipe(k.kembali.k === 'primitif' ? tipeBoks(k.kembali.nama) : k.kembali, d.boksBila(target))
    if (!coba.gagal) {
      const h = selesaikan(d, coba, k.tipeParam)
      if ('peta' in h) return { ok: true, peta: h.peta, unchecked }
    }
  }
  const h = selesaikan(d, inf, k.tipeParam)
  if ('alasan' in h) return { ok: false, alasan: h.alasan }
  // Periksa ulang argumen (termasuk cabang kondisional) terhadap parameter hasil substitusi.
  const cekUlang = (a: Argumen, f: Tipe, i: number): Alasan | undefined => {
    if (a.k === 'kondisional') {
      for (const c of [0, 1] as const) {
        const r = cekUlang(a.cabang[c], f, i)
        if (r) return { k: 'kondisional', indeks: i, cabang: c, dalam: r, varargs: fase === 3 && i >= k.parameter.length - 1, generik }
      }
      return undefined
    }
    if (a.k !== 'biasa' || a.tipe.k === 'error') return undefined
    if (longgar ? d.longgar(a.tipe, f) : d.strict(a.tipe, f)) return undefined
    return { k: 'arg', indeks: i, dari: a.tipe, ke: f, lossy: false, varargs: fase === 3 && i >= k.parameter.length - 1, generik }
  }
  for (let i = 0; i < arg.length; i++) {
    const r = cekUlang(arg[i], substitusi(parameterKe(k, i, fase), h.peta), i)
    if (r) return { ok: false, alasan: r }
  }
  return { ok: true, peta: h.peta, unchecked }
}

/** m1 lebih spesifik daripada m2 untuk pemanggilan dengan `n` argumen (JLS 15.12.2.5, disederhanakan). */
function lebihSpesifik(d: DuniaTipe, m1: Kandidat, m2: Kandidat, arg: Argumen[], fase: 1 | 2 | 3): boolean {
  const n = fase === 3 ? Math.max(arg.length, m1.parameter.length, m2.parameter.length) : arg.length
  const hapus = (k: Kandidat, t: Tipe) => {
    if (!k.tipeParam.length) return t
    const peta = new Map(k.tipeParam.map((p) => [p.nama, p.batas.find((b) => !memuatVariabel(b)) ?? T.Object]))
    return substitusi(t, peta)
  }
  for (let i = 0; i < n; i++) {
    const t1 = hapus(m1, parameterKe(m1, Math.min(i, fase === 3 ? i : m1.parameter.length - 1), fase))
    const t2 = hapus(m2, parameterKe(m2, Math.min(i, fase === 3 ? i : m2.parameter.length - 1), fase))
    if (!t1 || !t2) continue
    const a = arg[i]
    if (a?.k === 'lambda' && aritasFungsional(t1) !== undefined && aritasFungsional(t2) !== undefined) continue
    if (!d.subtipe(t1, t2)) return false
  }
  return true
}

/** Jalankan resolusi tiga fase atas kandidat; `target` = tipe yang diharapkan konteks (untuk inferensi). */
export function resolusi<D>(d: DuniaTipe, kandidat: Kandidat<D>[], arg: Argumen[], target?: Tipe): HasilResolusi<D> {
  const alasan = new Map<Kandidat<D>, Alasan>()
  for (const fase of [1, 2, 3] as const) {
    const berlaku: { k: Kandidat<D>; h: HasilCoba }[] = []
    for (const k of kandidat) {
      if (fase === 3 && !k.varargs) continue
      const h = cobaKandidat(d, k, arg, fase, target)
      if (h.ok) berlaku.push({ k, h })
      else if (fase >= 2) alasan.set(k, h.alasan!)
    }
    if (berlaku.length === 0) continue
    let maksimal = berlaku
    if (berlaku.length > 1) {
      maksimal = berlaku.filter((x) => berlaku.every((y) => y === x || lebihSpesifik(d, x.k, y.k, arg, fase)))
      if (maksimal.length !== 1) {
        const [a, b] = maksimal.length > 1 ? maksimal : berlaku
        return { ambigu: [a.k, b.k], alasan }
      }
    }
    const { k, h } = maksimal[0]
    const peta = h.peta ?? new Map()
    const parameter = k.parameter.map((p) => substitusi(p, peta))
    let kembali = substitusi(k.kembali, peta)
    if (h.unchecked && kembali.k === 'kelas') kembali = { k: 'kelas', nama: kembali.nama }
    return { pilih: { kandidat: k, fase, peta, parameter, kembali, unchecked: h.unchecked ?? false }, alasan }
  }
  return { alasan }
}
