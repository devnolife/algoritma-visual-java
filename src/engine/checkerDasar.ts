/**
 * Dasar type checker Fase 2: status pemeriksaan, lingkup variabel lokal (termasuk tangkapan lambda),
 * penamaan tipe gaya javac, resolusi nama tipe (class mahasiswa, impor, java.lang), dan pencarian anggota
 * (field, method, konstruktor) pada tipe class mahasiswa maupun pustaka.
 */
import type * as A from './ast'
import { katalog, type IsiPesan, type PengumpulDiagnostik } from './diagnostik'
import { adalahTipePustaka, paketPustaka, semuaTipePustaka, tipePustaka } from './hierarki'
import { deklarasiUlangObject, kelasPustaka, type FieldPustaka, type MethodPustaka } from './pustaka/daftar'
import { DuniaTipe, type TipeKelas } from './relasiTipe'
import type { Kandidat } from './resolusi'
import type { Span } from './sumber'
import { hapusGenerik, namaTampilKelas, substitusi, T, teksTipe, type Tipe } from './tipe'

export interface KonteksLambda {
  node: A.Lambda
  induk: KonteksLambda | null
  /** Indeks lingkup pertama milik lambda ini; variabel di lingkup sebelumnya milik method luar. */
  batasLingkup: number
  /** Variabel luar → salinannya di frame lambda. */
  tangkapan: Map<A.InfoLokal, A.InfoLokal>
  urutan: { luar: A.InfoLokal; dalam: A.InfoLokal }[]
  /** Slot berikut di frame lambda (untuk tangkapan susulan). */
  pakaiThis: boolean
}

export interface Konteks {
  kelas: A.InfoKelas
  deklarasi: A.DeklarasiMethod | null
  metode: A.SimbolMethod | null
  statik: boolean
  konstruktor: boolean
  /** Komponen nama method sintetis lambda: nama method, `new` (konstruktor/field instance), atau `static`. */
  pemilikLambda: string
  /** Lokasi gaya javac untuk pesan `already defined`: `method main(String[])`, `constructor Titik(int)`. */
  lokasi: string
  lingkup: Map<string, A.InfoLokal>[]
  /** Slot yang dideklarasikan pada tiap lingkup (sejajar dengan `lingkup`). */
  slotLingkup: number[][]
  slotBerikut: number
  kedalamanLoop: number
  kedalamanSwitch: number
  /** Tipe yang diharapkan pernyataan `return` (void untuk konstruktor). */
  kembali: Tipe
  lambda: KonteksLambda | null
}

/** Data kandidat method/konstruktor untuk resolusi. */
export interface DataKandidat {
  user?: A.SimbolMethod
  pustaka?: MethodPustaka
  /** Konstruktor bawaan class mahasiswa (tanpa deklarasi). */
  bawaan?: A.InfoKelas
  /** Tipe pemilik deklarasi sebagai supertipe penerima (untuk substitusi, pesan, dan deskripsi JVM). */
  pemilik: TipeKelas
  statik: boolean
  akses: A.Akses
  /** Nama kanonik class pemilik (class mahasiswa) untuk aturan akses private. */
  kelasUser?: string
}

export type KandidatMethod = Kandidat<DataKandidat>

/** Hasil pencarian nama tipe. */
export type HasilKelas = { k: 'user'; info: A.InfoKelas } | { k: 'pustaka'; nama: string }

const KELAS_JAVA_LANG = new Set(semuaTipePustaka().filter((n) => paketPustaka(n) === 'java.lang'))
const KELAS_JAVA_UTIL_SEMUA = new Set(semuaTipePustaka().filter((n) => paketPustaka(n) === 'java.util'))

/** Skor kemiripan ejaan (jarak edit Levenshtein). */
function jarakEdit(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}

/** Nama yang ejaannya paling mirip (beda huruf besar/kecil atau salah ketik kecil). */
export function saranMirip(nama: string, kandidat: Iterable<string>): string | undefined {
  let terbaik: string | undefined
  let skor = Infinity
  for (const k of kandidat) {
    if (k === nama) continue
    const s = k.toLowerCase() === nama.toLowerCase() ? 0 : jarakEdit(k.toLowerCase(), nama.toLowerCase())
    if (s < skor) {
      skor = s
      terbaik = k
    }
  }
  const batas = nama.length <= 3 ? 1 : 2
  return skor <= batas ? terbaik : undefined
}

/** Tingkat akses untuk perbandingan "lebih lemah" (JLS 8.4.8.3). */
export const TINGKAT_AKSES: Record<A.Akses, number> = { public: 0, protected: 1, paket: 2, private: 3 }

export function aksesDari(modifier: string[]): A.Akses {
  if (modifier.includes('public')) return 'public'
  if (modifier.includes('private')) return 'private'
  if (modifier.includes('protected')) return 'protected'
  return 'paket'
}

export abstract class PemeriksaDasar {
  /** Semua class mahasiswa menurut nama kanonik. */
  protected readonly kelasUser = new Map<string, A.InfoKelas>()
  /** Class top-level menurut nama sederhana. */
  protected readonly kelasTopLevel = new Map<string, A.InfoKelas>()
  /** Urutan class (pre-order seperti javac Enter). */
  protected readonly urutanKelas: A.InfoKelas[] = []
  protected readonly dunia = new DuniaTipe(this.kelasUser)
  /** Impor tunggal: nama sederhana → nama tipe pustaka (`Entry` → `Map.Entry`). */
  protected readonly imporTunggal = new Map<string, string>()
  protected imporUtilSemua = false
  protected imporMapSemua = false
  protected ctx!: Konteks

  constructor(
    protected readonly unit: A.UnitKompilasi,
    protected readonly diag: PengumpulDiagnostik,
  ) {}

  protected lapor(kode: string, span: Span, isi: IsiPesan): void {
    this.diag.tambah(kode, span, isi)
  }

  /** Span tanpa fokus (error menunjuk ke awal node). */
  protected awalSaja(span: Span): Span {
    return { awal: span.awal, akhir: span.akhir }
  }

  // ---------- penamaan gaya javac ----------
  /** Nama tampil class mahasiswa: nama sederhana, diawali class luar bila inner class (`Main.Kamar`). */
  protected namaTampil(info: A.InfoKelas): string {
    let nama = info.sederhana
    for (let k = info; !k.statik && k.luar; k = k.luar) nama = `${k.luar.sederhana}.${nama}`
    return nama
  }

  /** Teks tipe untuk pesan error (tanpa spasi; inner class dengan nama luarnya). */
  protected teks(t: Tipe): string {
    switch (t.k) {
      case 'kelas': {
        const u = this.kelasUser.get(t.nama)
        const nama = u ? this.namaTampil(u) : namaTampilKelas(t.nama)
        return nama + (t.argumen ? `<${t.argumen.map((a) => this.teks(a)).join(',')}>` : '')
      }
      case 'array':
        return this.teks(t.elemen) + '[]'
      case 'wildcard':
        return t.batas && t.tipe ? `? ${t.batas} ${this.teks(t.tipe)}` : '?'
      default:
        return teksTipe(t)
    }
  }

  protected teksDaftar(t: Tipe[], varargs = false): string {
    const s = t.map((x) => this.teks(x))
    if (varargs && s.length) s[s.length - 1] = s[s.length - 1].replace(/\[\]$/, '...')
    return s.join(',')
  }

  /** `class X` / `interface X<E>` untuk baris `location:` atau pemilik method. */
  protected lokasiTipe(t: Tipe, denganParameter = false): string {
    if (t.k !== 'kelas') return `class ${this.teks(t)}`
    const jenis = this.dunia.antarmuka(t.nama) ? 'interface' : 'class'
    if (denganParameter && !t.argumen) {
      const p = this.dunia.parameterKelas(t.nama)
      if (p.length) return `${jenis} ${namaTampilKelas(t.nama)}<${p.join(',')}>`
    }
    return `${jenis} ${this.teks(t)}`
  }

  protected lokasiKelas(info: A.InfoKelas): string {
    return `class ${this.namaTampil(info)}`
  }

  protected tipeKelasUser(info: A.InfoKelas): TipeKelas {
    return { k: 'kelas', nama: info.nama }
  }

  /** Class top-level yang membungkus `info` (untuk aturan akses private). */
  protected topLevel(info: A.InfoKelas): A.InfoKelas {
    let k = info
    while (k.luar) k = k.luar
    return k
  }

  // ---------- lingkup & variabel lokal ----------
  /** Variabel lokal yang terlihat; variabel luar lambda dipetakan ke slot tangkapan lambda. */
  protected cariLokal(nama: string): A.InfoLokal | undefined {
    const lingkup = this.ctx.lingkup
    for (let i = lingkup.length - 1; i >= 0; i--) {
      const info = lingkup[i].get(nama)
      if (info) return this.tangkapBila(info, i)
    }
    return undefined
  }

  /** Variabel lokal tanpa pemetaan tangkapan (untuk cek "already defined"). */
  protected cariLokalMentah(nama: string): A.InfoLokal | undefined {
    const lingkup = this.ctx.lingkup
    for (let i = lingkup.length - 1; i >= 0; i--) {
      const info = lingkup[i].get(nama)
      if (info) return info
    }
    return undefined
  }

  private tangkapBila(info: A.InfoLokal, indeks: number): A.InfoLokal {
    const rantai: KonteksLambda[] = []
    for (let l = this.ctx.lambda; l && l.batasLingkup > indeks; l = l.induk) rantai.unshift(l)
    let hasil = info
    for (const l of rantai) hasil = this.tangkap(l, hasil)
    return hasil
  }

  /** Salinan variabel luar `luar` di frame lambda `l` (dibuat bila belum ada). */
  protected tangkap(l: KonteksLambda, luar: A.InfoLokal): A.InfoLokal {
    let dalam = l.tangkapan.get(luar)
    if (!dalam) {
      dalam = { nama: luar.nama, tipe: luar.tipe, slot: this.slotTangkapanBaru(l), final: luar.final, parameter: false, punyaInit: true, span: luar.span }
      if (luar.konstan !== undefined) dalam.konstan = luar.konstan
      l.tangkapan.set(luar, dalam)
      l.urutan.push({ luar, dalam })
    }
    return dalam
  }

  /** Slot untuk tangkapan yang ditemukan setelah pra-pindai (jarang): diambil dari penghitung slot frame lambda. */
  protected abstract slotTangkapanBaru(l: KonteksLambda): number

  protected masukLingkup(): void {
    this.ctx.lingkup.push(new Map())
    this.ctx.slotLingkup.push([])
  }

  protected keluarLingkup(): number[] {
    this.ctx.lingkup.pop()
    return this.ctx.slotLingkup.pop() ?? []
  }

  protected deklarasiLokal(nama: string, tipe: Tipe, final: boolean, parameter: boolean, span: Span): A.InfoLokal {
    const info: A.InfoLokal = { nama, tipe, slot: this.ctx.slotBerikut++, final, parameter, span }
    this.ctx.lingkup[this.ctx.lingkup.length - 1].set(nama, info)
    this.ctx.slotLingkup[this.ctx.slotLingkup.length - 1].push(info.slot)
    return info
  }

  /** Lapor `already defined` bila nama sudah dipakai variabel lokal yang terlihat (termasuk milik method luar lambda). */
  protected cekSudahAda(nama: string, span: Span): void {
    if (this.cariLokalMentah(nama)) this.lapor('sudah-didefinisikan', span, katalog.sudahDidefinisikan(nama, this.ctx.lokasi))
  }

  // ---------- resolusi nama tipe ----------
  /** Class bersarang langsung bernama `nama` di class `info` (termasuk warisan dari superclass mahasiswa). */
  protected kelasAnggota(info: A.InfoKelas, nama: string): A.InfoKelas | undefined {
    for (let k: A.InfoKelas | undefined = info; k; ) {
      const d = k.deklarasi.kelas.find((x) => x.nama === nama)
      if (d?.info) return d.info
      const induk: A.InfoKelas | undefined = k.induk?.k === 'kelas' ? this.kelasUser.get(k.induk.nama) : undefined
      k = induk
    }
    return undefined
  }

  /** Cari tipe bernama sederhana dari dalam class `dari` (JLS 6.5.5.1). */
  protected cariKelasSederhana(nama: string, dari: A.InfoKelas | null): HasilKelas | undefined {
    for (let k = dari; k; k = k.luar ?? null) {
      const anggota = this.kelasAnggota(k, nama)
      if (anggota) return { k: 'user', info: anggota }
      if (!k.luar && k.sederhana === nama) return { k: 'user', info: k }
    }
    const top = this.kelasTopLevel.get(nama)
    if (top) return { k: 'user', info: top }
    const impor = this.imporTunggal.get(nama)
    if (impor) return { k: 'pustaka', nama: impor }
    if (KELAS_JAVA_LANG.has(nama)) return { k: 'pustaka', nama }
    if (this.imporUtilSemua && KELAS_JAVA_UTIL_SEMUA.has(nama)) return { k: 'pustaka', nama }
    if (this.imporMapSemua && nama === 'Entry') return { k: 'pustaka', nama: 'Map.Entry' }
    return undefined
  }

  /** Anggota class `seg` dari hasil pencarian sebelumnya (nama bertitik `Main.Node`, `Map.Entry`). */
  protected anggotaTipe(h: HasilKelas, seg: string): HasilKelas | undefined {
    if (h.k === 'user') {
      const a = this.kelasAnggota(h.info, seg)
      return a ? { k: 'user', info: a } : undefined
    }
    const gabung = `${h.nama}.${seg}`
    return adalahTipePustaka(gabung) ? { k: 'pustaka', nama: gabung } : undefined
  }

  /** Nama tipe dari hasil pencarian (kanonik untuk class mahasiswa). */
  protected namaHasil(h: HasilKelas): string {
    return h.k === 'user' ? h.info.nama : h.nama
  }

  /** Nama tampil hasil pencarian untuk pesan. */
  protected tampilHasil(h: HasilKelas): string {
    return h.k === 'user' ? this.namaTampil(h.info) : namaTampilKelas(h.nama)
  }

  /**
   * Tipe dari node tipe di kode sumber. `lokasi` = class tempat tipe ditulis (untuk baris `location:`).
   * `bolehDiamond` untuk `new X<>()`: argumen kosong dibiarkan (diisi inferensi pemanggil).
   */
  protected tipeDari(n: A.NodeTipe, bolehDiamond = false): Tipe {
    switch (n.jenis) {
      case 'TipePrimitif':
        return { k: 'primitif', nama: n.nama }
      case 'TipeArray': {
        const e = this.tipeDari(n.elemen)
        return e.k === 'error' ? T.error : { k: 'array', elemen: e }
      }
      case 'TipeWildcard':
        this.lapor('belum-didukung', n.span, katalog.belumDidukung('Wildcard (?) pada argumen tipe', 'Tulis tipe yang konkret, mis. List<Integer>.'))
        return T.error
      case 'TipeNama':
        return this.tipeNama(n, bolehDiamond)
    }
  }

  private tipeNama(n: Extract<A.NodeTipe, { jenis: 'TipeNama' }>, bolehDiamond: boolean): Tipe {
    let nama = n.nama
    let dariPaket = false
    for (const p of ['java.lang.', 'java.util.']) {
      if (nama.startsWith(p)) {
        nama = nama.slice(p.length)
        dariPaket = true
      }
    }
    const lokasi = this.ctx?.kelas ?? null
    const bagian = nama.split('.')
    if (nama === 'var' && !n.argumen) return T.error
    let h: HasilKelas | undefined = dariPaket && adalahTipePustaka(bagian[0]) ? { k: 'pustaka', nama: bagian[0] } : this.cariKelasSederhana(bagian[0], lokasi)
    const spanNama = { awal: n.span.awal, akhir: n.span.awal + nama.length }
    if (!h) {
      const isi = katalog.simbolTidakDitemukan('class', bagian[0], lokasi ? this.lokasiKelas(lokasi) : 'class Main')
      const perluImpor = KELAS_JAVA_UTIL_SEMUA.has(bagian[0])
      this.lapor('simbol-tidak-ditemukan', spanNama, perluImpor ? { ...isi, saran: `Tambahkan \`import java.util.${bagian[0]};\` di baris paling atas.` } : isi)
      return T.error
    }
    for (let i = 1; i < bagian.length; i++) {
      const lanjut = this.anggotaTipe(h, bagian[i])
      if (!lanjut) {
        const pemilik = h.k === 'user' ? this.lokasiKelas(h.info) : this.lokasiTipe({ k: 'kelas', nama: h.nama })
        this.lapor('simbol-tidak-ditemukan', spanNama, katalog.simbolTidakDitemukan('class', bagian[i], pemilik))
        return T.error
      }
      if (lanjut.k === 'user' && lokasi && lanjut.info.deklarasi.modifier.includes('private') && this.topLevel(lanjut.info) !== this.topLevel(lokasi)) {
        const titik = n.span.awal + bagian.slice(0, i).join('.').length
        this.lapor('akses-privat', { awal: titik, akhir: titik + 1 }, katalog.aksesPrivat(lanjut.info.sederhana, this.namaTampil(lanjut.info.luar!)))
        return T.error
      }
      h = lanjut
    }
    const namaTipe = this.namaHasil(h)
    if (h.k === 'user') {
      if (n.argumen && n.argumen.length > 0) {
        this.lapor('tipe-tidak-generik', n.span, { pesan: `type ${this.tampilHasil(h)} does not take parameters`, artinya: `Class ${this.tampilHasil(h)} bukan class generik, jadi tidak menerima argumen tipe < >.` })
        return T.error
      }
      return { k: 'kelas', nama: namaTipe }
    }
    const parameter = this.dunia.parameterKelas(namaTipe)
    if (!n.argumen) return { k: 'kelas', nama: namaTipe }
    if (n.argumen.length === 0) return bolehDiamond ? { k: 'kelas', nama: namaTipe, argumen: [] } : { k: 'kelas', nama: namaTipe }
    if (parameter.length === 0) {
      this.lapor('tipe-tidak-generik', n.span, { pesan: `type ${namaTampilKelas(namaTipe)} does not take parameters`, artinya: `${namaTampilKelas(namaTipe)} bukan tipe generik, jadi tidak menerima argumen tipe < >.` })
      return T.error
    }
    const argumen: Tipe[] = []
    let rusak = false
    for (const a of n.argumen) {
      const t = this.tipeDari(a)
      if (t.k === 'primitif') {
        this.lapor('tipe-tak-terduga', this.awalSaja(a.span), katalog.tipeTakTerdugaGenerik(t.nama))
        rusak = true
      } else if (t.k === 'error') rusak = true
      argumen.push(t)
    }
    if (rusak) return T.error
    if (argumen.length !== parameter.length) {
      this.lapor('jumlah-argumen-tipe', n.span, katalog.jumlahArgumenTipe(parameter.length))
      return T.error
    }
    return { k: 'kelas', nama: namaTipe, argumen }
  }

  // ---------- anggota tipe ----------
  /** Field bernama `nama` milik class mahasiswa `info` atau superclass mahasiswanya. */
  protected fieldDiKelas(info: A.InfoKelas, nama: string): A.SimbolField | undefined {
    for (let k: A.InfoKelas | undefined = info; k; ) {
      const f = k.field.get(nama)
      if (f) return f
      k = k.induk?.k === 'kelas' ? this.kelasUser.get(k.induk.nama) : undefined
    }
    return undefined
  }

  /** Cari field pada tipe `t` (class mahasiswa lalu pustaka). */
  protected cariField(t: Tipe, nama: string): { user: A.SimbolField } | { pustaka: FieldPustaka; pemilik: string } | undefined {
    if (t.k !== 'kelas') return undefined
    const antrian: TipeKelas[] = [t]
    const dilihat = new Set<string>()
    while (antrian.length) {
      const s = antrian.shift()!
      if (dilihat.has(s.nama)) continue
      dilihat.add(s.nama)
      const u = this.kelasUser.get(s.nama)
      if (u) {
        const f = u.field.get(nama)
        if (f) return { user: f }
      } else {
        const f = kelasPustaka(s.nama)?.field.get(nama)
        if (f) return { pustaka: f, pemilik: s.nama }
      }
      antrian.push(...this.dunia.superLangsung(s))
    }
    return undefined
  }

  /**
   * Kandidat method bernama `nama` untuk penerima bertipe `t`: method class itu dan supertipenya, dengan argumen
   * tipe penerima sudah disubstitusi. Method yang di-override (tanda tangan sama) hanya diambil yang terdekat.
   */
  protected kandidatMethod(t: Tipe, nama: string): KandidatMethod[] {
    const hasil: KandidatMethod[] = []
    const awal: TipeKelas = t.k === 'kelas' ? t : (T.Object as TipeKelas)
    const antrian: TipeKelas[] = [awal]
    const dilihat = new Set<string>()
    const tanda = (p: Tipe[]) => p.map((x) => teksTipe(hapusGenerik(x))).join(',')
    const sudah = new Set<string>()
    while (antrian.length) {
      const s = antrian.shift()!
      if (dilihat.has(s.nama)) continue
      dilihat.add(s.nama)
      const u = this.kelasUser.get(s.nama)
      if (u) {
        for (const m of u.method.get(nama) ?? []) {
          const kunci = tanda(m.parameter)
          if (sudah.has(kunci)) continue
          sudah.add(kunci)
          hasil.push({
            nama,
            parameter: m.parameter,
            kembali: m.kembali,
            varargs: m.varargs,
            tipeParam: [],
            data: { user: m, pemilik: s, statik: m.statik, akses: m.akses ?? 'paket', kelasUser: u.nama },
          })
        }
      } else {
        const kp = kelasPustaka(s.nama)
        const antarmuka = this.dunia.antarmuka(s.nama)
        const daftar = [...(kp?.instance.get(nama) ?? []), ...(antarmuka && s !== awal ? [] : (kp?.statik.get(nama) ?? []))]
        for (const m of daftar) {
          const sub = this.substitusiAnggota(s, m)
          const kunci = tanda(sub.parameter)
          if (sudah.has(kunci)) continue
          sudah.add(kunci)
          hasil.push({
            nama,
            parameter: sub.parameter,
            kembali: sub.kembali,
            varargs: m.varargs,
            tipeParam: m.tipeParam ?? [],
            data: { pustaka: m, pemilik: s, statik: m.statik, akses: 'public' },
          })
        }
      }
      antrian.push(...this.dunia.superLangsung(s))
    }
    return hasil
  }

  /** Tipe parameter/kembali anggota pustaka `m` milik tipe `s` (substitusi argumen tipe; raw → erasure). */
  protected substitusiAnggota(s: TipeKelas, m: MethodPustaka): { parameter: Tipe[]; kembali: Tipe } {
    if (m.statik) return { parameter: m.parameter, kembali: m.kembali }
    const par = this.dunia.parameterKelas(s.nama)
    if (!par.length) return { parameter: m.parameter, kembali: m.kembali }
    if (!s.argumen) {
      const metode = new Set((m.tipeParam ?? []).map((p) => p.nama))
      const hapus = (t: Tipe) => (metode.size ? t : hapusGenerik(t))
      return { parameter: m.parameter.map(hapus), kembali: hapus(m.kembali) }
    }
    const peta = new Map<string, Tipe>()
    par.forEach((p, i) => peta.set(p, s.argumen![i] ?? T.Object))
    const kembali = this.kapturKembali(substitusi(m.kembali, peta))
    const parameter = m.parameter.map((p) => this.kapturParameter(substitusi(p, peta)))
    return { parameter, kembali }
  }

  /** Wildcard di posisi parameter setelah substitusi: `? super X` menerima X; selainnya batasnya. */
  private kapturParameter(t: Tipe): Tipe {
    if (t.k === 'wildcard') return t.tipe ?? T.Object
    return t
  }

  /** Wildcard di posisi tipe kembali: `? extends X` menjadi X; `?`/`? super X` menjadi Object. */
  private kapturKembali(t: Tipe): Tipe {
    if (t.k === 'wildcard') return t.batas === 'extends' && t.tipe ? t.tipe : T.Object
    return t
  }

  /** Kandidat konstruktor class `t` (mahasiswa: deklarasi atau bawaan; pustaka: daftar konstruktor). */
  protected kandidatKonstruktor(t: TipeKelas): KandidatMethod[] {
    const u = this.kelasUser.get(t.nama)
    if (u) {
      if (u.konstruktor.length === 0) {
        return [{ nama: u.sederhana, parameter: [], kembali: t, varargs: false, tipeParam: [], data: { bawaan: u, pemilik: t, statik: true, akses: aksesDari(u.deklarasi.modifier), kelasUser: u.nama } }]
      }
      return u.konstruktor.map((m) => ({
        nama: u.sederhana,
        parameter: m.parameter,
        kembali: t,
        varargs: m.varargs,
        tipeParam: [],
        data: { user: m, pemilik: t, statik: true, akses: m.akses ?? 'paket', kelasUser: u.nama },
      }))
    }
    const kp = kelasPustaka(t.nama)
    const par = this.dunia.parameterKelas(t.nama)
    return (kp?.konstruktor ?? []).map((m) => ({
      nama: namaTampilKelas(t.nama),
      parameter: m.parameter,
      kembali: m.kembali,
      varargs: m.varargs,
      tipeParam: par.map((p) => ({ nama: p, batas: [T.Object] })),
      data: { pustaka: m, pemilik: t, statik: true, akses: 'public' },
    }))
  }

  /** Apakah anggota ber-akses `akses` milik class mahasiswa `kelasUser` boleh dipakai dari class saat ini. */
  protected bolehAkses(akses: A.Akses, kelasUser: string | undefined): boolean {
    if (akses !== 'private') return kelasUser !== undefined || akses === 'public'
    if (!kelasUser) return false
    const pemilik = this.kelasUser.get(kelasUser)
    return pemilik !== undefined && this.topLevel(pemilik) === this.topLevel(this.ctx.kelas)
  }

  // ---------- deskripsi JVM (pesan NPE) ----------
  /** Nama tipe gaya JVM: String/Object disingkat, pustaka lengkap, class mahasiswa nama biner. */
  protected namaJvm(t: Tipe): string {
    switch (t.k) {
      case 'primitif':
        return t.nama
      case 'array':
        return this.namaJvm(t.elemen) + '[]'
      case 'kelas': {
        if (t.nama === 'String' || t.nama === 'Object') return t.nama
        const u = this.kelasUser.get(t.nama)
        if (u) return u.biner
        const lengkap = tipePustaka(t.nama)?.lengkap
        if (lengkap) return lengkap
        const paket = paketPustaka(t.nama)
        return paket ? `${paket}.${t.nama}` : t.nama
      }
      default:
        return 'Object'
    }
  }

  /** Deskripsi JVM pemanggilan pustaka: tipe statis penerima + nama + tipe parameter ter-erase. */
  protected deskripsiJvm(penerima: Tipe | undefined, m: MethodPustaka): string {
    const batasMetode = new Map((m.tipeParam ?? []).map((p) => [p.nama, p.batas.find((b) => !(b.k === 'kelas' && b.nama === 'Object')) ?? T.Object]))
    const param = m.parameter.map((p) => this.namaJvm(hapusGenerik(p, (n) => batasMetode.get(n)))).join(', ')
    let kualifier: string
    if (m.statik || !penerima) kualifier = this.namaJvm({ k: 'kelas', nama: m.kelas })
    else if (m.kelas === 'Object' && !this.deklarasiUlang(penerima, m.nama)) kualifier = 'Object'
    else kualifier = this.namaJvm(penerima.k === 'kelas' ? { k: 'kelas', nama: penerima.nama } : penerima)
    return `${kualifier}.${m.nama}(${param})`
  }

  /** Apakah method Object `nama` dideklarasikan ulang di rantai supertipe `t` (selain Object). */
  private deklarasiUlang(t: Tipe, nama: string): boolean {
    if (t.k !== 'kelas') return false
    const antrian: TipeKelas[] = [t]
    const dilihat = new Set<string>()
    while (antrian.length) {
      const s = antrian.shift()!
      if (s.nama === 'Object' || dilihat.has(s.nama)) continue
      dilihat.add(s.nama)
      const u = this.kelasUser.get(s.nama)
      if (u ? (u.method.get(nama)?.length ?? 0) > 0 : deklarasiUlangObject(s.nama, nama)) return true
      antrian.push(...this.dunia.superLangsung(s))
    }
    return false
  }
}
