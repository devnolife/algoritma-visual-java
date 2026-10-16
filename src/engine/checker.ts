/**
 * Type checker Java Mini (Fase 1 + Fase 2). Urutan kerja meniru javac:
 * 1. Enter: daftarkan semua class (top-level lalu bersarang, pre-order); error class duplikat/modifier/nama file.
 * 2. Header + anggota: `extends`/`implements`, lalu tanda tangan field, method, dan konstruktor.
 * 3. Per class top-level (urutan sumber): Attr (cek kepala class, lalu anggota sesuai urutan; class bersarang
 *    diperiksa saat ditemui), lalu analisis alur (Flow) bila belum ada error sama sekali.
 * Error dilaporkan dalam urutan javac (tidak diurutkan menurut posisi).
 */
import { analisisAlurKelas, bisaSelesaiNormal } from './alur'
import type * as A from './ast'
import { aksesDari, TINGKAT_AKSES, type Konteks } from './checkerDasar'
import { konversiKonstan, PemeriksaEkspresi } from './checkerEkspresi'
import { katalog, type PengumpulDiagnostik } from './diagnostik'
import { adalahExceptionBawaan, adalahTipePustaka, rantaiException } from './hierarki'
import { kelasPustaka } from './pustaka/daftar'
import type { TipeKelas } from './relasiTipe'
import {
  adalahError, adalahString, hapusGenerik, namaTampilKelas, samaTipe, T, teksTipe, tipeArray, type Tipe,
} from './tipe'

export { konversiKonstan } from './checkerEkspresi'
export { saranMirip } from './checkerDasar'

export interface ProgramTerperiksa {
  unit: A.UnitKompilasi
  /** Deklarasi class `Main`. */
  kelas: A.DeklarasiKelas
  infoMain: A.InfoKelas
  /** Semua class mahasiswa menurut nama kanonik (`Main`, `Main.Node`, `Node`). */
  semuaKelas: Map<string, A.InfoKelas>
  /** Method class Main (kompatibel Fase 1). */
  method: Map<string, A.SimbolMethod[]>
  /** Field class Main (kompatibel Fase 1). */
  field: Map<string, A.SimbolField>
  main?: A.SimbolMethod
}

export function periksa(unit: A.UnitKompilasi, diag: PengumpulDiagnostik): ProgramTerperiksa | null {
  return new Pemeriksa(unit, diag).jalankan()
}

/** Urutan modifier di pesan javac (`Flags.asFlagSet`). */
const URUTAN_MODIFIER = ['public', 'private', 'protected', 'static', 'final', 'synchronized', 'volatile', 'transient', 'native', 'abstract', 'strictfp']

const samaParameter = (a: Tipe[], b: Tipe[]) =>
  a.length === b.length && a.every((t, i) => samaTipe(hapusGenerik(t), hapusGenerik(b[i])))

class Pemeriksa extends PemeriksaEkspresi {
  private readonly selesaiAttr = new Set<A.InfoKelas>()

  constructor(unit: A.UnitKompilasi, diag: PengumpulDiagnostik) {
    super(unit, diag)
  }

  jalankan(): ProgramTerperiksa | null {
    this.impor()
    if (this.unit.kelas.length === 0) {
      this.lapor('tidak-ada-main', { awal: 0, akhir: 0 }, katalog.tidakAdaMain())
      return null
    }
    for (const d of this.unit.kelas) this.masukKelas(d, undefined)
    const main = this.kelasTopLevel.get('Main')
    if (!main) {
      const pertama = this.unit.kelas[0]
      if (!pertama.modifier.includes('public')) {
        this.lapor('tidak-ada-main', pertama.spanNama, { ...katalog.tidakAdaMain(), saran: `Ganti nama class ${pertama.nama} menjadi Main.` })
      }
    }
    for (const info of this.urutanKelas) this.kepalaKelas(info)
    for (const info of this.urutanKelas) this.hitungRantaiException(info, new Set())
    for (const info of this.urutanKelas) this.anggotaKelas(info)
    for (const d of this.unit.kelas) {
      if (!d.info || this.kelasTopLevel.get(d.nama) !== d.info) continue
      this.attribKelas(d.info)
      if (!this.diag.adaError) analisisAlurKelas(d, this.diag, this.dunia, (t) => this.teks(t))
    }
    this.nomoriLambda()
    if (!main) return null
    const kandidatMain = main.method.get('main')?.find(
      (m) => m.statik && m.kembali.k === 'void' && m.parameter.length === 1 && samaTipe(m.parameter[0], tipeArray(T.String)),
    )
    return {
      unit: this.unit,
      kelas: main.deklarasi,
      infoMain: main,
      semuaKelas: this.kelasUser,
      method: main.method,
      field: main.field,
      main: kandidatMain,
    }
  }

  private impor(): void {
    for (const imp of this.unit.impor) {
      if (imp.statik) continue
      if (imp.wildcard) {
        if (imp.nama === 'java.util') this.imporUtilSemua = true
        if (imp.nama === 'java.util.Map') this.imporMapSemua = true
        continue
      }
      if (!imp.nama.startsWith('java.util.')) continue
      const sisa = imp.nama.slice('java.util.'.length)
      if (adalahTipePustaka(sisa)) this.imporTunggal.set(namaTampilKelas(sisa), sisa)
    }
  }

  private konteksBaru(kelas: A.InfoKelas, opsi: Partial<Konteks> = {}): Konteks {
    return {
      kelas,
      deklarasi: null,
      metode: null,
      statik: true,
      konstruktor: false,
      pemilikLambda: 'static',
      lokasi: `class ${this.namaTampil(kelas)}`,
      lingkup: [new Map()],
      slotLingkup: [[]],
      slotBerikut: 0,
      kedalamanLoop: 0,
      kedalamanSwitch: 0,
      kembali: T.void,
      lambda: null,
      ...opsi,
    }
  }

  // ---------- Enter ----------
  private masukKelas(d: A.DeklarasiKelas, luar: A.InfoKelas | undefined): void {
    const posKelas = { awal: d.posisiKataKelas, akhir: d.posisiKataKelas + 5 }
    if (!luar) {
      if (d.modifier.includes('public') && d.nama !== 'Main') {
        this.lapor('kelas-publik-nama-file', { ...d.spanNama, fokus: d.posisiKataKelas }, katalog.kelasPublikNamaFile(d.nama))
      }
      if (this.kelasTopLevel.has(d.nama)) {
        this.lapor('kelas-duplikat', posKelas, katalog.kelasDuplikat(d.nama))
        return
      }
    } else {
      const kembar = luar.deklarasi.kelas.find((x) => x !== d && x.nama === d.nama && x.info)
      let leluhur: A.InfoKelas | undefined = luar
      while (leluhur && leluhur.sederhana !== d.nama) leluhur = leluhur.luar
      if (kembar || leluhur) {
        const tempat = kembar ? luar : leluhur!.luar
        this.lapor('kelas-duplikat', posKelas, tempat ? katalog.kelasSudahAda(d.nama, this.namaTampil(tempat)) : katalog.kelasDuplikat(d.nama))
        return
      }
    }
    const terlarang = luar ? [] : URUTAN_MODIFIER.filter((m) => ['private', 'protected', 'static'].includes(m) && d.modifier.includes(m))
    if (terlarang.length) this.lapor('modifier-tidak-boleh', posKelas, katalog.modifierTidakBoleh(terlarang.join(',')))
    if (d.modifier.includes('abstract')) {
      this.lapor('belum-didukung', posKelas, katalog.belumDidukung('Class abstract buatan sendiri', 'Gunakan class biasa.'))
    }
    const nama = luar ? `${luar.nama}.${d.nama}` : d.nama
    const info: A.InfoKelas = {
      nama,
      sederhana: d.nama,
      biner: luar ? `${luar.biner}$${d.nama}` : d.nama,
      deklarasi: d,
      luar,
      statik: !luar || d.modifier.includes('static'),
      antarmuka: [],
      field: new Map(),
      method: new Map(),
      konstruktor: [],
    }
    d.info = info
    this.kelasUser.set(nama, info)
    if (!luar) this.kelasTopLevel.set(d.nama, info)
    this.urutanKelas.push(info)
    for (const k of d.kelas) this.masukKelas(k, info)
  }

  // ---------- header & anggota ----------
  private kepalaKelas(info: A.InfoKelas): void {
    this.ctx = this.konteksBaru(info)
    const d = info.deklarasi
    if (d.induk) {
      const t = this.tipeDari(d.induk)
      if (t.k === 'kelas') {
        if (t.nama === info.nama) {
          this.lapor('pewarisan-siklik', { awal: d.posisiKataKelas, akhir: d.posisiKataKelas + 5 }, { pesan: `cyclic inheritance involving ${this.namaTampil(info)}`, artinya: 'Sebuah class tidak boleh mewarisi dirinya sendiri.' })
        } else if (this.kelasUser.has(t.nama) || adalahExceptionBawaan(t.nama)) {
          info.induk = t
        } else {
          this.lapor('belum-didukung', d.induk.span, katalog.belumDidukung(`Pewarisan dari ${this.teks(t)}`, 'Simulator hanya mendukung extends untuk exception buatan sendiri, mis. class StokHabisException extends RuntimeException.'))
        }
      }
    }
    for (const a of d.antarmuka) {
      const t = this.tipeDari(a)
      if (t.k !== 'kelas') continue
      if (t.nama !== 'Comparable') {
        this.lapor('belum-didukung', a.span, katalog.belumDidukung(`implements ${this.teks(t)}`, 'Simulator hanya mendukung implements Comparable<T>.'))
        continue
      }
      info.antarmuka.push(t)
    }
  }

  /** Rantai leluhur exception untuk class yang mewarisi exception (bawaan atau buatan sendiri). */
  private hitungRantaiException(info: A.InfoKelas, dikunjungi: Set<A.InfoKelas>): void {
    if (info.exception !== undefined || !info.induk || dikunjungi.has(info)) return
    dikunjungi.add(info)
    const u = this.kelasUser.get(info.induk.k === 'kelas' ? info.induk.nama : '')
    if (u) {
      this.hitungRantaiException(u, dikunjungi)
      if (u.exception) info.exception = [info.nama, ...u.exception]
      else {
        this.ctx = this.konteksBaru(info)
        this.lapor('belum-didukung', info.deklarasi.induk!.span, katalog.belumDidukung('Pewarisan antar-class buatan sendiri', 'Simulator hanya mendukung extends untuk exception (turunan Exception/RuntimeException).'))
        info.induk = undefined
      }
      return
    }
    const r = info.induk.k === 'kelas' ? rantaiException(info.induk.nama) : []
    if (r.length) info.exception = [info.nama, ...r]
  }

  private anggotaKelas(info: A.InfoKelas): void {
    this.ctx = this.konteksBaru(info)
    for (const a of info.deklarasi.anggota) {
      if (a.jenis === 'DeklarasiField') this.deklarasiField(info, a)
      else if (a.jenis === 'DeklarasiMethod') this.deklarasiMethod(info, a)
    }
  }

  private deklarasiField(info: A.InfoKelas, f: A.DeklarasiField): void {
    const dasar = this.tipeDari(f.tipeNode)
    for (const d of f.deklarator) {
      const tipe = adalahError(dasar) ? T.error : tipeArray(dasar, d.dimensiTambahan)
      d.tipe = tipe
      if (info.field.has(d.nama)) {
        this.lapor('sudah-didefinisikan', d.spanNama, katalog.sudahDidefinisikan(d.nama, `class ${this.namaTampil(info)}`))
        continue
      }
      info.field.set(d.nama, {
        nama: d.nama,
        tipe,
        statik: f.modifier.includes('static'),
        final: f.modifier.includes('final'),
        deklarasi: d,
        kelas: info.nama,
        akses: aksesDari(f.modifier),
      })
    }
  }

  private deklarasiMethod(info: A.InfoKelas, m: A.DeklarasiMethod): void {
    const parameter = m.parameter.map((p) => this.tipeDari(p.tipeNode))
    const kembali = m.konstruktor || !m.tipeKembali ? T.void : this.tipeDari(m.tipeKembali)
    const throws = m.throws.map((n) => {
      const t = this.tipeDari(n)
      if (t.k === 'kelas' && !this.dunia.throwable(t)) {
        this.lapor('tipe-tidak-cocok', this.awalSaja(n.span), katalog.tipeTidakCocok(this.teks(t), 'Throwable'))
        return T.error
      }
      return t
    })
    const varargs = m.parameter.length > 0 && m.parameter[m.parameter.length - 1].varargs
    const nama = m.konstruktor ? info.sederhana : m.nama
    const tandaTangan = `${nama}(${this.teksDaftar(parameter, varargs)})`
    const simbol: A.SimbolMethod = {
      nama,
      parameter,
      kembali,
      statik: !m.konstruktor && m.modifier.includes('static'),
      varargs,
      deklarasi: m,
      tandaTangan,
      kelas: info.nama,
      akses: aksesDari(m.modifier),
      konstruktor: m.konstruktor,
      throws,
    }
    m.simbol = simbol
    if (m.konstruktor) {
      if (info.konstruktor.some((lain) => samaParameter(lain.parameter, parameter))) {
        this.lapor('method-sudah-ada', m.spanNama, katalog.methodSudahAda(tandaTangan, this.namaTampil(info), true))
      }
      info.konstruktor.push(simbol)
      return
    }
    const daftar = info.method.get(nama) ?? []
    if (daftar.some((lain) => samaParameter(lain.parameter, parameter))) {
      this.lapor('method-sudah-ada', m.spanNama, katalog.methodSudahAda(tandaTangan, this.namaTampil(info)))
    }
    daftar.push(simbol)
    info.method.set(nama, daftar)
  }

  // ---------- Attr per class ----------
  private attribKelas(info: A.InfoKelas): void {
    if (this.selesaiAttr.has(info)) return
    this.selesaiAttr.add(info)
    const indukUser = info.induk?.k === 'kelas' ? this.kelasUser.get(info.induk.nama) : undefined
    if (indukUser) this.attribKelas(indukUser)
    if (info.luar) this.attribKelas(info.luar)
    this.cekKepalaKelas(info)
    if (!info.deklarasi.konstruktor.length && info.induk) {
      // Konstruktor bawaan berisi `super()` implisit; javac memeriksanya lebih dulu (ditaruh di awal anggota).
      this.ctx = this.konteksBaru(info, { konstruktor: true, pemilikLambda: 'new', lokasi: `constructor ${info.sederhana}()`, kembali: T.void })
      const pos = info.deklarasi.posisiKataKelas
      this.cekSuperImplisit({ awal: pos, akhir: pos + 'class'.length })
    }
    for (const a of info.deklarasi.anggota) {
      if (a.jenis === 'DeklarasiField') {
        for (const d of a.deklarator) {
          const f = info.field.get(d.nama)
          if (f && f.deklarasi === d) this.periksaInitField(f)
        }
      } else if (a.jenis === 'DeklarasiMethod') this.periksaMethod(info, a)
      else if (a.info) this.attribKelas(a.info)
    }
  }

  protected periksaInitField(f: A.SimbolField): void {
    const d = f.deklarasi
    if (!d.init || this.fieldSelesai.has(d) || !d.tipe) return
    this.fieldSelesai.add(d)
    const info = this.kelasUser.get(f.kelas!)!
    const simpan = this.ctx
    this.ctx = this.konteksBaru(info, { statik: f.statik, pemilikLambda: f.statik ? 'static' : 'new' })
    try {
      this.periksaInisialisasi(d.init, d.tipe)
      if (f.final && d.init.konstan !== undefined && (d.tipe.k === 'primitif' || adalahString(d.tipe)) && d.init.tipe && !adalahError(d.init.tipe)) {
        f.konstan = konversiKonstan(d.init.konstan, d.init.tipe, d.tipe)
      }
    } finally {
      this.ctx = simpan
    }
  }

  protected namaMethodPustaka(kelas: string): string[] {
    const kp = kelasPustaka(kelas)
    return kp ? [...kp.instance.keys(), ...kp.statik.keys()] : []
  }

  /** Supertipe `info` (tanpa dirinya) dalam urutan javac: rantai superclass, tiap class diikuti antarmukanya. */
  private supertipe(info: A.InfoKelas): TipeKelas[] {
    const hasil: TipeKelas[] = []
    const antrian: TipeKelas[] = [...this.dunia.superLangsung(this.tipeKelasUser(info))]
    const dilihat = new Set<string>()
    while (antrian.length) {
      const s = antrian.shift()!
      if (dilihat.has(s.nama)) continue
      dilihat.add(s.nama)
      hasil.push(s)
      antrian.push(...this.dunia.superLangsung(s))
    }
    return hasil
  }

  /** Method yang di-override `m` di supertipe: tanda tangan (setelah substitusi) sama. */
  private yangDiOverride(info: A.InfoKelas, m: A.SimbolMethod): {
    pemilik: TipeKelas
    nama: string
    parameter: Tipe[]
    /** Parameter yang ditulis di deklarasi (mis. `T` untuk Comparable). */
    parameterDeklarasi: Tipe[]
    kembali: Tipe
    statik: boolean
    abstrak: boolean
    akses: A.Akses
    throws: Tipe[]
    antarmuka: boolean
  }[] {
    const hasil = []
    for (const s of this.supertipe(info)) {
      const u = this.kelasUser.get(s.nama)
      if (u) {
        for (const o of u.method.get(m.nama) ?? []) {
          if (o.akses === 'private' || !samaParameter(o.parameter, m.parameter)) continue
          hasil.push({ pemilik: s, nama: o.nama, parameter: o.parameter, parameterDeklarasi: o.parameter, kembali: o.kembali, statik: o.statik, abstrak: false, akses: o.akses ?? 'paket', throws: o.throws ?? [], antarmuka: false })
        }
        continue
      }
      const antarmuka = this.dunia.antarmuka(s.nama)
      for (const o of kelasPustaka(s.nama)?.instance.get(m.nama) ?? []) {
        if (o.belumDidukung) continue
        const sub = this.substitusiAnggota(s, o)
        if (!samaParameter(sub.parameter, m.parameter)) continue
        hasil.push({ pemilik: s, nama: o.nama, parameter: sub.parameter, parameterDeklarasi: o.parameter, kembali: sub.kembali, statik: false, abstrak: antarmuka, akses: 'public' as A.Akses, throws: [], antarmuka })
      }
    }
    return hasil
  }

  /** Tipe kembali `mk` bisa menggantikan `ok` (JLS 8.4.8.3). */
  private kembaliCocok(mk: Tipe, ok: Tipe): boolean {
    if (ok.k === 'primitif' || ok.k === 'void' || mk.k === 'primitif' || mk.k === 'void') return samaTipe(mk, ok)
    return this.dunia.subtipe(mk, ok) || this.dunia.unchecked(mk, ok)
  }

  /** Alasan override gagal (baris detail javac), atau undefined bila sah. */
  private alasanOverride(m: A.SimbolMethod, o: ReturnType<Pemeriksa['yangDiOverride']>[number]): string | undefined {
    if (m.statik && !o.statik) return 'overriding method is static'
    if (TINGKAT_AKSES[m.akses ?? 'paket'] > TINGKAT_AKSES[o.akses]) {
      return `attempting to assign weaker access privileges; was ${o.akses === 'paket' ? 'package' : o.akses}`
    }
    if (!this.kembaliCocok(m.kembali, o.kembali)) return `return type ${this.teks(m.kembali)} is not compatible with ${this.teks(o.kembali)}`
    const tidakDilempar = (m.throws ?? []).find((t) => this.dunia.checked(t) && !o.throws.some((x) => this.dunia.subtipe(t, x)))
    if (tidakDilempar) return `overridden method does not throw ${this.teks(tidakDilempar)}`
    return undefined
  }

  private teksMethodDiOverride(o: ReturnType<Pemeriksa['yangDiOverride']>[number]): string {
    const param = o.antarmuka ? o.parameterDeklarasi.map((p) => teksTipe(p)) : o.parameter.map((p) => this.teks(p))
    return `${o.nama}(${param.join(',')})`
  }

  /** Cek kepala class: implementasi `compareTo` untuk `implements Comparable<T>` (javac checkAllDefined/checkImplementations). */
  private cekKepalaKelas(info: A.InfoKelas): void {
    const posKelas = { awal: info.deklarasi.posisiKataKelas, akhir: info.deklarasi.posisiKataKelas + 5 }
    for (const a of info.antarmuka) {
      if (a.k !== 'kelas' || a.nama !== 'Comparable') continue
      const x = a.argumen?.[0] ?? T.Object
      const kandidat = (info.method.get('compareTo') ?? []).filter((m) => m.parameter.length === 1 && samaTipe(hapusGenerik(m.parameter[0]), hapusGenerik(x)))
      const implementasi = kandidat.find((m) => !m.statik && samaTipe(m.kembali, T.int))
      if (!implementasi) {
        this.lapor('tidak-abstrak', posKelas, katalog.tidakAbstrak(this.namaTampil(info), `compareTo(${this.teks(x)})`, 'Comparable'))
      }
      const m = kandidat[0]
      if (!m) continue
      const o = { pemilik: a as TipeKelas, nama: 'compareTo', parameter: [x], parameterDeklarasi: [{ k: 'variabel', nama: 'T' } as Tipe], kembali: T.int, statik: false, abstrak: true, akses: 'public' as A.Akses, throws: [], antarmuka: true }
      const alasan = this.alasanOverride(m, o)
      if (alasan) {
        this.lapor(
          'tidak-bisa-override',
          m.deklarasi.spanNama,
          katalog.tidakBisaOverride(m.tandaTangan, this.namaTampil(info), 'compareTo(T)', 'Comparable', alasan, 'implement', [
            'where T is a type-variable:',
            'T extends Object declared in interface Comparable',
          ]),
        )
      }
    }
  }

  /** Cek override method terhadap supertipe (javac Check.checkOverride) lalu validasi @Override. */
  private cekOverride(info: A.InfoKelas, m: A.DeklarasiMethod, simbol: A.SimbolMethod): void {
    const diOverride = this.yangDiOverride(info, simbol)
    for (const o of diOverride) {
      if (o.abstrak) continue
      const alasan = this.alasanOverride(simbol, o)
      if (alasan) {
        this.lapor(
          'tidak-bisa-override',
          m.spanNama,
          katalog.tidakBisaOverride(simbol.tandaTangan, this.namaTampil(info), this.teksMethodDiOverride(o), this.teks({ k: 'kelas', nama: o.pemilik.nama }), alasan),
        )
        break
      }
    }
    const override = m.anotasi.find((a) => a.nama === 'Override' || a.nama === 'java.lang.Override')
    if (!override) return
    if (simbol.statik) {
      this.lapor('override-static', override.span, { pesan: 'static methods cannot be annotated with @Override', artinya: 'Method static tidak menimpa method siapa pun, jadi tidak boleh diberi @Override.' })
      return
    }
    const sah = diOverride.some((o) => !o.statik && this.kembaliCocok(simbol.kembali, o.kembali))
    if (!sah) this.lapor('tidak-override', override.span, katalog.tidakMengoverride())
  }

  private periksaMethod(info: A.InfoKelas, m: A.DeklarasiMethod): void {
    const simbol = m.simbol!
    this.ctx = this.konteksBaru(info, {
      deklarasi: m,
      metode: simbol,
      statik: simbol.statik,
      konstruktor: m.konstruktor,
      pemilikLambda: m.konstruktor ? 'new' : m.nama,
      lokasi: `${m.konstruktor ? 'constructor' : 'method'} ${simbol.tandaTangan}`,
      kembali: m.konstruktor ? T.void : simbol.kembali,
    })
    if (!m.konstruktor) this.cekOverride(info, m, simbol)
    m.parameter.forEach((p, i) => {
      this.cekSudahAda(p.nama, p.spanNama)
      p.info = this.deklarasiLokal(p.nama, simbol.parameter[i], p.final, true, p.spanNama)
    })
    if (m.konstruktor) {
      const pertama = m.badan.pernyataan[0]
      const panggilEksplisit = pertama?.jenis === 'PernyataanEkspresi' && pertama.ekspresi.jenis === 'PanggilKonstruktor'
      if (!panggilEksplisit) this.cekSuperImplisit({ awal: m.badan.span.awal, akhir: m.badan.span.awal + 1 })
    }
    this.periksaBlok(m.badan, false)
    m.jumlahSlot = this.ctx.slotBerikut
  }

  private nomoriLambda(): void {
    for (const daftar of this.lambdaKelas.values()) {
      daftar.sort((a, b) => a.lambda.span.awal - b.lambda.span.awal)
      daftar.forEach((x, i) => (x.lambda.namaMethod = `lambda$${x.pemilik}$${i}`))
    }
  }

  protected bisaSelesaiNormal(b: A.Blok): boolean {
    return bisaSelesaiNormal(b)
  }

  // ---------- pernyataan ----------
  protected periksaBlok(b: A.Blok, lingkupBaru = true): void {
    if (lingkupBaru) this.masukLingkup()
    for (const p of b.pernyataan) this.periksaPernyataan(p)
    if (lingkupBaru) b.slotLokal = this.keluarLingkup()
    else b.slotLokal = [...(this.ctx.slotLingkup[this.ctx.slotLingkup.length - 1] ?? [])].filter((s) => !this.ctx.deklarasi?.parameter.some((p) => p.info?.slot === s))
  }

  /** Pernyataan tunggal sebagai badan if/loop: deklarasi tidak diizinkan di sini. */
  private periksaBadan(p: A.Pernyataan): void {
    if (p.jenis === 'DeklarasiLokal') {
      this.lapor('deklarasi-tidak-diizinkan', { ...p.span, fokus: p.deklarator[0]?.spanNama.awal }, {
        pesan: 'variable declaration not allowed here',
        artinya: 'Deklarasi variabel tidak boleh menjadi satu-satunya isi if/perulangan tanpa kurawal { }.',
        saran: 'Bungkus dengan kurawal: { int x = ...; }',
      })
    }
    this.masukLingkup()
    this.periksaPernyataan(p)
    this.keluarLingkup()
  }

  private periksaPernyataan(p: A.Pernyataan): void {
    switch (p.jenis) {
      case 'Blok':
        this.periksaBlok(p)
        return
      case 'Kosong':
        return
      case 'DeklarasiLokal':
        this.periksaDeklarasiLokal(p)
        return
      case 'PernyataanEkspresi':
        this.ekspresi(p.ekspresi)
        return
      case 'If':
        this.kondisi(p.kondisi)
        this.periksaBadan(p.maka)
        if (p.lain) this.periksaBadan(p.lain)
        return
      case 'While':
        this.kondisi(p.kondisi)
        this.ctx.kedalamanLoop++
        this.periksaBadan(p.badan)
        this.ctx.kedalamanLoop--
        return
      case 'DoWhile':
        this.ctx.kedalamanLoop++
        this.periksaBadan(p.badan)
        this.ctx.kedalamanLoop--
        this.kondisi(p.kondisi)
        return
      case 'For':
        this.masukLingkup()
        for (const i of p.init) {
          if (i.jenis === 'DeklarasiLokal') this.periksaDeklarasiLokal(i)
          else this.ekspresi(i.ekspresi)
        }
        if (p.kondisi) this.kondisi(p.kondisi)
        for (const u of p.update) this.ekspresi(u)
        this.ctx.kedalamanLoop++
        this.periksaBadan(p.badan)
        this.ctx.kedalamanLoop--
        p.slotLokal = this.keluarLingkup()
        return
      case 'ForEach':
        this.periksaForEach(p)
        return
      case 'Switch':
        this.periksaSwitch(p)
        return
      case 'Break':
        if (this.ctx.kedalamanLoop === 0 && this.ctx.kedalamanSwitch === 0) this.lapor('break-di-luar', p.span, katalog.breakDiLuar())
        return
      case 'Continue':
        if (this.ctx.kedalamanLoop === 0) this.lapor('continue-di-luar', p.span, katalog.continueDiLuar())
        return
      case 'Return':
        this.periksaReturn(p)
        return
      case 'Try':
        this.periksaTry(p)
        return
      case 'Throw': {
        const t = this.ekspresi(p.ekspresi)
        if (!adalahError(t) && t.k !== 'null' && !(t.k === 'kelas' && this.dunia.throwable(t))) {
          this.lapor('tipe-tidak-cocok', this.awalSaja(p.span), katalog.tipeTidakCocok(this.teks(t), 'Throwable'))
        }
        return
      }
    }
  }

  private periksaReturn(p: A.Return): void {
    if (this.dalamLambda()) {
      if (!p.ekspresi) {
        this.lapor('lambda-kembalian', p.span, katalog.lambdaKembalianSalah('missing return value'))
        return
      }
      const t = this.ekspresi(p.ekspresi, T.int)
      if (adalahError(t)) return
      const h = t.k === 'void' ? 'tidak-cocok' : this.dunia.cekAssign(t, T.int, p.ekspresi.konstan)
      if (h !== 'ok') this.lapor('lambda-kembalian', p.ekspresi.span, katalog.lambdaKembalianSalah(this.fragmenKonversi(t, T.int)))
      return
    }
    const kembali = this.ctx.kembali
    if (kembali.k === 'void') {
      if (p.ekspresi) {
        // javac melapor sebelum memeriksa ekspresinya.
        this.lapor('return-tak-terduga', p.ekspresi.span, katalog.returnTakTerduga())
        this.ekspresi(p.ekspresi)
      }
    } else if (!p.ekspresi) {
      this.lapor('return-tanpa-nilai', p.span, katalog.returnTanpaNilai())
    } else {
      this.periksaInisialisasi(p.ekspresi, kembali)
    }
  }

  private periksaDeklarasiLokal(p: A.DeklarasiLokal): void {
    const dasar = this.tipeDari(p.tipeNode)
    for (const d of p.deklarator) {
      const tipe = adalahError(dasar) ? T.error : tipeArray(dasar, d.dimensiTambahan)
      d.tipe = tipe
      this.cekSudahAda(d.nama, d.spanNama)
      const info = this.deklarasiLokal(d.nama, tipe, p.final, false, d.spanNama)
      info.punyaInit = d.init !== undefined
      d.info = info
      if (d.init) {
        this.periksaInisialisasi(d.init, tipe)
        if (p.final && d.init.konstan !== undefined && (tipe.k === 'primitif' || adalahString(tipe)) && d.init.tipe && !adalahError(d.init.tipe)) {
          info.konstan = konversiKonstan(d.init.konstan, d.init.tipe, tipe)
        }
      }
    }
  }

  private periksaForEach(p: A.ForEach): void {
    const tipeIter = this.ekspresi(p.iterable)
    let elemen: Tipe | undefined
    if (!adalahError(tipeIter)) {
      if (tipeIter.k === 'array') elemen = tipeIter.elemen
      else {
        const it = this.dunia.asSuper(tipeIter, 'Iterable')
        if (it) {
          const a = it.argumen?.[0]
          elemen = !a ? T.Object : a.k === 'wildcard' ? (a.batas === 'extends' && a.tipe ? a.tipe : T.Object) : a
        } else this.lapor('foreach-tidak-berlaku', p.iterable.span, katalog.foreachTidakBerlaku(this.teks(tipeIter)))
      }
    }
    const tipeVar = this.tipeDari(p.tipeNode)
    this.masukLingkup()
    this.cekSudahAda(p.nama, p.spanNama)
    p.info = this.deklarasiLokal(p.nama, tipeVar, p.final, false, p.spanNama)
    p.info.punyaInit = true
    if (elemen) {
      p.tipeElemen = elemen
      this.cekKonversi(elemen, tipeVar, undefined, p.iterable.span)
    }
    this.ctx.kedalamanLoop++
    this.periksaBadan(p.badan)
    this.ctx.kedalamanLoop--
    this.keluarLingkup()
  }

  private periksaSwitch(p: A.Switch): void {
    const t = this.ekspresi(p.selektor)
    const error = adalahError(t)
    // Seperti javac 21: switch "int" bila selektor bisa di-assign ke int (termasuk Integer/Character/Short/Byte).
    const intSwitch = !error && this.dunia.cekAssign(t, T.int) === 'ok'
    const stringSwitch = !error && adalahString(t)
    const primitifSalah = !error && t.k === 'primitif' && !intSwitch
    if (primitifSalah) this.lapor('selektor-switch', p.spanSelektor, katalog.selektorSwitch(this.teks(t)))
    // Selektor referensi lain (Long, Double, Boolean, Object, class sendiri) membuat switch pola Java 21.
    const switchPola = !error && !intSwitch && !stringSwitch && !primitifSalah
    const tKunci = this.dunia.unboks(t) ?? t
    let labelSalah = false
    const terlihat = new Set<string>()
    let adaDefault = false
    this.masukLingkup()
    this.ctx.kedalamanSwitch++
    for (const g of p.grup) {
      for (const [idx, l] of g.label.entries()) {
        if (l === 'default') {
          if (adaDefault) this.lapor('case-duplikat', { ...g.span, fokus: g.posisiLabel[idx] }, { ...katalog.caseDuplikat(), pesan: 'duplicate default label' })
          adaDefault = true
          continue
        }
        if (l.jenis === 'Literal' && l.jenisLiteral === 'null') {
          this.lapor('belum-didukung', l.span, katalog.belumDidukung('case null', 'Periksa null dengan if sebelum switch.'))
          labelSalah = true
          continue
        }
        const tl = this.ekspresi(l)
        if (adalahError(tl) || error || primitifSalah) continue
        // javac memeriksa label dengan tipe selektor sebagai tipe yang diharapkan (konversi assignment), baru
        // syarat konstanta, lalu kecocokan label konstanta untuk switch pola.
        if (!this.cekKonversi(tl, t, l.konstan, l.span)) {
          labelSalah = true
          continue
        }
        if (l.konstan === undefined) {
          const isi = stringSwitch
            ? { ...katalog.butuhKonstanta(), pesan: 'constant string expression required' }
            : switchPola
              ? { ...katalog.butuhKonstanta(), pesan: 'pattern or enum constant required' }
              : katalog.butuhKonstanta()
          this.lapor('butuh-konstanta', l.span, isi)
          labelSalah = true
          continue
        }
        if (switchPola) {
          this.lapor('label-case', l.span, katalog.labelCaseTidakCocok(this.teks(tl), this.teks(t)))
          labelSalah = true
          continue
        }
        const kunci = String(stringSwitch ? l.konstan : konversiKonstan(l.konstan, tl, tKunci))
        // javac menunjuk ke kata kunci `case` untuk label ganda.
        if (terlihat.has(kunci)) this.lapor('case-duplikat', { ...l.span, fokus: g.posisiLabel[idx] }, katalog.caseDuplikat())
        terlihat.add(kunci)
      }
      if (p.panah) {
        for (const s of g.pernyataan) {
          this.masukLingkup()
          this.periksaPernyataan(s)
          this.keluarLingkup()
        }
      } else {
        for (const s of g.pernyataan) this.periksaPernyataan(s)
      }
    }
    this.ctx.kedalamanSwitch--
    p.slotLokal = this.keluarLingkup()
    // Switch pola tanpa label konstanta (mis. hanya default) sah di Java 21, tetapi di luar subset simulator.
    if (switchPola && !labelSalah) {
      this.lapor('belum-didukung', p.spanSelektor, katalog.belumDidukung(`switch pada tipe ${this.teks(t)}`, 'Gunakan if/else, atau switch pada int, char, String, atau pembungkusnya.'))
    }
  }

  private periksaTry(p: A.Try): void {
    this.periksaBlok(p.blok)
    for (const c of p.tangkap) {
      this.masukLingkup()
      const tipe: Tipe[] = []
      const multi = c.tipe.length > 1
      for (const n of c.tipe) {
        const t = this.tipeDari(n)
        if (multi && !adalahError(t)) {
          if (!(t.k === 'kelas' && this.dunia.throwable(t))) {
            this.lapor('tipe-tidak-cocok', this.awalSaja(n.span), katalog.tipeTidakCocok(this.teks(t), 'Throwable'))
            tipe.push(T.error)
            continue
          }
          for (const lain of tipe) {
            if (lain.k !== 'kelas') continue
            const sub = this.dunia.subtipe(t, lain)
            const sup = this.dunia.subtipe(lain, t)
            if (sub || sup) this.lapor('multi-catch', this.awalSaja(n.span), katalog.multiCatchBersubkelas(this.teks(sub ? t : lain), this.teks(sub ? lain : t)))
          }
        }
        tipe.push(t)
      }
      this.cekSudahAda(c.nama, c.spanNama)
      if (!multi && !adalahError(tipe[0]) && !(tipe[0].k === 'kelas' && this.dunia.throwable(tipe[0]))) {
        this.lapor('tipe-tidak-cocok', this.awalSaja(c.tipe[0].span), katalog.tipeTidakCocok(this.teks(tipe[0]), 'Throwable'))
        tipe[0] = T.error
      }
      c.tipeTangkap = tipe
      const tipeVar = multi ? this.lubException(tipe) : tipe[0]
      c.info = this.deklarasiLokal(c.nama, tipeVar, c.final || multi, false, c.spanNama)
      c.info.punyaInit = true
      this.periksaBlok(c.badan)
      this.keluarLingkup()
    }
    if (p.akhirnya) this.periksaBlok(p.akhirnya)
  }

  /** Supertipe bersama terdekat alternatif multi-catch (untuk tipe variabel catch). */
  private lubException(tipe: Tipe[]): Tipe {
    const valid = tipe.filter((t): t is TipeKelas => t.k === 'kelas')
    if (valid.length !== tipe.length || !valid.length) return T.error
    const rantai = this.dunia.rantaiException(valid[0]) ?? []
    for (const nama of rantai) {
      if (valid.every((t) => this.dunia.asSuper(t, nama) !== null)) return { k: 'kelas', nama }
    }
    return { k: 'kelas', nama: 'Throwable' }
  }
}

