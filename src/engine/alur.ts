/**
 * Analisis alur (meniru javac Flow), dijalankan per class top-level hanya bila belum ada error:
 * 1. Keterjangkauan (AliveAnalyzer): `unreachable statement`, `missing return statement`.
 * 2. Penugasan pasti (AssignAnalyzer): `variable x might not have been initialized`, `might already have been
 *    assigned`, `might be assigned in loop`, field final di konstruktor; sekaligus menghitung *effectively final*.
 * 3. Exception (FlowAnalyzer): `unreported exception`, `is never thrown in body of corresponding try statement`,
 *    `has already been caught`.
 * 4. Tangkapan lambda (CaptureAnalyzer): variabel lokal yang dipakai lambda wajib (effectively) final.
 * Seperti javac, keempat analisis dijalankan berurutan untuk seluruh class, termasuk class bersarangnya.
 */
import { anakNode } from './analisis'
import type * as A from './ast'
import { katalog, type IsiPesan, type PengumpulDiagnostik } from './diagnostik'
import type { DuniaTipe } from './relasiTipe'
import type { Span } from './sumber'
import type { Tipe } from './tipe'

type Simpul = A.Pernyataan
type Target = A.While | A.DoWhile | A.For | A.ForEach | A.Switch
type Lapor = (kode: string, span: Span, isi: IsiPesan) => void

const benar = (e: A.Ekspresi | undefined) => e !== undefined && e.konstan === true
const salah = (e: A.Ekspresi | undefined) => e !== undefined && e.konstan === false

function posisiPernyataan(p: Simpul): Span {
  return p.jenis === 'DeklarasiLokal' && p.deklarator.length > 0 ? p.deklarator[0].spanNama : p.span
}

/** Ekspresi yang dimiliki langsung oleh sebuah pernyataan (bukan milik pernyataan anaknya). */
function ekspresiLangsung(p: Simpul): A.Ekspresi[] {
  switch (p.jenis) {
    case 'DeklarasiLokal':
      return p.deklarator.flatMap((d) => (d.init ? [d.init] : []))
    case 'PernyataanEkspresi':
      return [p.ekspresi]
    case 'If':
    case 'While':
    case 'DoWhile':
      return [p.kondisi]
    case 'For':
      return [...(p.kondisi ? [p.kondisi] : []), ...p.update]
    case 'ForEach':
      return [p.iterable]
    case 'Switch':
      return [p.selektor]
    case 'Return':
      return p.ekspresi ? [p.ekspresi] : []
    case 'Throw':
      return [p.ekspresi]
    default:
      return []
  }
}

/** Lambda di dalam ekspresi (tanpa masuk ke badan lambda itu sendiri), urut menurut kemunculan. */
function lambdaDalam(e: A.Ekspresi | A.Pernyataan, hasil: A.Lambda[] = []): A.Lambda[] {
  if (e.jenis === 'Lambda') {
    hasil.push(e)
    return hasil
  }
  for (const a of anakNode(e)) lambdaDalam(a, hasil)
  return hasil
}

/** Anggota class dalam urutan javac Flow: initializer/class bersarang static, lalu instance, lalu method. */
function urutanAnggota(k: A.DeklarasiKelas): { statik: (A.DeklarasiField | A.DeklarasiKelas)[]; instance: (A.DeklarasiField | A.DeklarasiKelas)[]; method: A.DeklarasiMethod[] } {
  const statik: (A.DeklarasiField | A.DeklarasiKelas)[] = []
  const instance: (A.DeklarasiField | A.DeklarasiKelas)[] = []
  const method: A.DeklarasiMethod[] = []
  for (const a of k.anggota) {
    if (a.jenis === 'DeklarasiMethod') method.push(a)
    else if (a.modifier.includes('static') || (a.jenis !== 'DeklarasiField' && !a.info?.luar)) statik.push(a)
    else instance.push(a)
  }
  return { statik, instance, method }
}

// ====================== Keterjangkauan ======================
type Hidup = 'hidup' | 'mati' | 'pulih'
const dari = (x: boolean): Hidup => (x ? 'hidup' : 'mati')
const atau = (a: Hidup, b: Hidup): Hidup => (a === 'hidup' ? 'hidup' : a === 'mati' ? b : b === 'hidup' ? 'hidup' : 'pulih')
const dan = (a: Hidup, b: Hidup): Hidup => (a === 'hidup' ? b : a === 'mati' ? 'mati' : b === 'mati' ? 'mati' : 'pulih')

interface KeluarHidup {
  jenis: 'break' | 'continue' | 'return'
  target?: Target
}

class AnalisisHidup {
  private hidup: Hidup = 'hidup'
  private keluar: KeluarHidup[] = []
  private target: { node: Target; loop: boolean }[] = []

  constructor(private readonly lapor: Lapor) {}

  /** Dibaca lewat method agar TypeScript tidak mempersempit tipe setelah pemanggilan yang mengubahnya. */
  private status(): Hidup {
    return this.hidup
  }

  kelas(k: A.DeklarasiKelas): void {
    const { statik, instance, method } = urutanAnggota(k)
    for (const a of [...statik, ...instance]) {
      if (a.jenis === 'DeklarasiField') {
        for (const d of a.deklarator) if (d.init) this.lambdaDiEkspresi(d.init)
      } else this.kelas(a)
    }
    for (const m of method) this.method(m)
  }

  method(m: A.DeklarasiMethod): void {
    this.hidup = 'hidup'
    this.keluar = []
    this.target = []
    this.satu(m.badan)
    const kembali = m.simbol?.kembali
    if (!m.konstruktor && this.hidup === 'hidup' && kembali && kembali.k !== 'void') this.lapor('return-hilang', m.spanTutup, katalog.returnHilang())
  }

  /** Apakah blok (badan lambda) bisa selesai normal. */
  bisaSelesai(b: A.Blok): boolean {
    this.hidup = 'hidup'
    this.keluar = []
    this.target = []
    this.satu(b)
    return (this.hidup as string) !== 'mati'
  }

  private lambdaDiEkspresi(e: A.Ekspresi): void {
    for (const l of lambdaDalam(e)) this.lambda(l)
  }

  private lambda(l: A.Lambda): void {
    if (l.badan.jenis !== 'Blok') {
      this.lambdaDiEkspresi(l.badan)
      return
    }
    const simpan = { hidup: this.hidup, keluar: this.keluar, target: this.target }
    this.hidup = 'hidup'
    this.keluar = []
    this.target = []
    this.satu(l.badan)
    this.hidup = simpan.hidup
    this.keluar = simpan.keluar
    this.target = simpan.target
  }

  private satu(p: Simpul): void {
    if (this.hidup === 'mati') {
      this.lapor('tidak-terjangkau', posisiPernyataan(p), katalog.tidakTerjangkau())
      if (p.jenis !== 'Kosong') this.hidup = 'pulih'
    }
    this.pernyataan(p)
  }

  private daftar(ps: Simpul[]): void {
    for (const p of ps) this.satu(p)
  }

  private selesaikan(node: Target, jenis: 'break' | 'continue'): Hidup {
    let ada = false
    this.keluar = this.keluar.filter((k) => {
      if (k.jenis === jenis && k.target === node) {
        ada = true
        return false
      }
      return true
    })
    return dari(ada)
  }

  private dalam<T>(node: Target, loop: boolean, f: () => T): T {
    this.target.push({ node, loop })
    try {
      return f()
    } finally {
      this.target.pop()
    }
  }

  private pernyataan(p: Simpul): void {
    for (const e of ekspresiLangsung(p)) this.lambdaDiEkspresi(e)
    switch (p.jenis) {
      case 'Blok':
        this.daftar(p.pernyataan)
        return
      case 'DeklarasiLokal':
      case 'PernyataanEkspresi':
      case 'Kosong':
        return
      case 'If': {
        this.satu(p.maka)
        if (p.lain) {
          const setelahMaka = this.hidup
          this.hidup = 'hidup'
          this.satu(p.lain)
          this.hidup = atau(this.hidup, setelahMaka)
        } else this.hidup = 'hidup'
        return
      }
      case 'While':
        this.dalam(p, true, () => {
          this.hidup = dari(!salah(p.kondisi))
          this.satu(p.badan)
          this.hidup = atau(this.hidup, this.selesaikan(p, 'continue'))
          this.hidup = atau(this.selesaikan(p, 'break'), dari(!benar(p.kondisi)))
        })
        return
      case 'DoWhile':
        this.dalam(p, true, () => {
          this.satu(p.badan)
          this.hidup = atau(this.hidup, this.selesaikan(p, 'continue'))
          this.hidup = dan(this.hidup, dari(!benar(p.kondisi)))
          this.hidup = atau(this.hidup, this.selesaikan(p, 'break'))
        })
        return
      case 'For':
        this.daftar(p.init)
        this.dalam(p, true, () => {
          this.hidup = p.kondisi ? dari(!salah(p.kondisi)) : 'hidup'
          this.satu(p.badan)
          this.hidup = atau(this.hidup, this.selesaikan(p, 'continue'))
          this.hidup = atau(this.selesaikan(p, 'break'), dari(p.kondisi !== undefined && !benar(p.kondisi)))
        })
        return
      case 'ForEach':
        this.dalam(p, true, () => {
          this.satu(p.badan)
          this.selesaikan(p, 'continue')
          this.selesaikan(p, 'break')
          this.hidup = 'hidup'
        })
        return
      case 'Switch':
        this.dalam(p, false, () => {
          for (const g of p.grup) {
            this.hidup = 'hidup'
            this.daftar(g.pernyataan)
            // Bentuk `case ->`: badan yang selesai normal keluar dari switch (break sintetis).
            if (p.panah && this.status() !== 'mati') {
              this.keluar.push({ jenis: 'break', target: p })
              this.hidup = 'mati'
            }
          }
          const adaDefault = p.grup.some((g) => g.label.includes('default'))
          if (!adaDefault) this.hidup = 'hidup'
          this.hidup = atau(this.hidup, this.selesaikan(p, 'break'))
        })
        return
      case 'Break': {
        const t = this.target[this.target.length - 1]
        this.keluar.push({ jenis: 'break', target: t?.node })
        this.hidup = 'mati'
        return
      }
      case 'Continue': {
        const t = [...this.target].reverse().find((x) => x.loop)
        this.keluar.push({ jenis: 'continue', target: t?.node })
        this.hidup = 'mati'
        return
      }
      case 'Return':
        this.keluar.push({ jenis: 'return' })
        this.hidup = 'mati'
        return
      case 'Throw':
        this.hidup = 'mati'
        return
      case 'Try': {
        const keluarLama = this.keluar
        this.keluar = []
        this.satu(p.blok)
        let akhir = this.hidup
        for (const c of p.tangkap) {
          this.hidup = 'hidup'
          this.satu(c.badan)
          akhir = atau(akhir, this.hidup)
        }
        const keluarTry = this.keluar
        this.keluar = keluarLama
        if (p.akhirnya) {
          this.hidup = 'hidup'
          this.satu(p.akhirnya)
          if (this.status() !== 'mati') {
            this.keluar.push(...keluarTry)
            this.hidup = akhir
          }
        } else {
          this.hidup = akhir
          this.keluar.push(...keluarTry)
        }
        return
      }
    }
  }
}

/** Apakah badan lambda berbentuk blok bisa selesai normal (dipakai type checker, tanpa laporan). */
export function bisaSelesaiNormal(b: A.Blok): boolean {
  return new AnalisisHidup(() => {}).bisaSelesai(b)
}

// ====================== Penugasan pasti ======================
type Bits = Set<number>
const iris = (a: Bits, b: Bits): Bits => {
  const h = new Set<number>()
  for (const x of a) if (b.has(x)) h.add(x)
  return h
}

interface Keluar {
  jenis: 'break' | 'continue' | 'return'
  target?: Target
  inits: Bits
  uninits: Bits
  span: Span
}

/** Rujukan variabel yang bisa diisi: lokal atau field final yang dilacak. */
type Rujukan = { lokal: A.InfoLokal } | { field: A.SimbolField }

class AnalisisPenugasan {
  private inits: Bits = new Set()
  private uninits: Bits = new Set()
  private initsT: Bits = new Set()
  private initsF: Bits = new Set()
  private uninitsT: Bits = new Set()
  private uninitsF: Bits = new Set()
  /** true bila hasil kondisi terakhir masih terpisah (whenTrue/whenFalse). */
  private terpisah = false
  /** Alamat yang dideklarasikan di unit sekarang (untuk menandai kode mati). */
  private terdeklarasi: number[] = []
  private spekulatif = false
  private keluar: Keluar[] = []
  private target: { node: Target; loop: boolean }[] = []
  /** Variabel yang pasti belum diisi di sepanjang blok try terdalam (JLS 16.2.15). */
  private uninitsTry: Bits = new Set()
  private readonly alamatPeta = new Map<object, number>()
  /** Field final instance/static yang sedang dilacak (konstruktor awal / initializer). */
  private fieldDilacak = new Set<A.SimbolField>()
  /** Salinan tangkapan lambda → variabel luarnya. */
  private readonly tangkapanLuar = new Map<A.InfoLokal, A.InfoLokal>()
  /** Variabel lokal yang kehilangan status effectively final. */
  readonly bukanEF = new Set<A.InfoLokal>()

  constructor(private readonly lapor: Lapor) {}

  private alamat(x: object): number {
    let a = this.alamatPeta.get(x)
    if (a === undefined) {
      a = this.alamatPeta.size
      this.alamatPeta.set(x, a)
    }
    return a
  }

  /** Variabel asli di method luar untuk salinan tangkapan lambda. */
  akar(info: A.InfoLokal): A.InfoLokal {
    let x = info
    for (let luar = this.tangkapanLuar.get(x); luar; luar = this.tangkapanLuar.get(x)) x = luar
    return x
  }

  // ---------- class ----------
  kelas(k: A.DeklarasiKelas): void {
    const info = k.info
    if (!info) return
    const simpan = { inits: this.inits, uninits: this.uninits, terdeklarasi: this.terdeklarasi, dilacak: this.fieldDilacak, keluar: this.keluar, target: this.target, uTry: this.uninitsTry }
    this.inits = new Set()
    this.uninits = new Set()
    this.uninitsTry = new Set()
    this.terdeklarasi = []
    this.fieldDilacak = new Set()
    this.keluar = []
    this.target = []
    const { statik, instance, method } = urutanAnggota(k)
    const blank = (s: boolean) => [...info.field.values()].filter((f) => f.statik === s && f.final && !f.deklarasi.init && f.kelas === info.nama)
    for (const f of blank(true)) this.fieldBaru(f)
    this.initializer(statik)
    for (const f of blank(true)) {
      if (!this.inits.has(this.alamat(f))) this.lapor('belum-diinisialisasi', f.deklarasi.spanNama, katalog.belumDiinisialisasi(f.nama))
    }
    for (const f of blank(false)) this.fieldBaru(f)
    this.initializer(instance)
    const awalI = new Set(this.inits)
    const awalU = new Set(this.uninits)
    const fieldInstance = blank(false)
    // Konstruktor bawaan (disisipkan javac di awal daftar anggota).
    if (info.konstruktor.length === 0) {
      for (const f of fieldInstance) {
        if (!awalI.has(this.alamat(f))) this.lapor('final-belum-diisi', f.deklarasi.spanNama, katalog.finalBelumDiisiKonstruktorBawaan(f.nama))
      }
    }
    for (const m of method) {
      this.inits = new Set(awalI)
      this.uninits = new Set(awalU)
      this.method(m, fieldInstance)
    }
    Object.assign(this, { inits: simpan.inits, uninits: simpan.uninits, terdeklarasi: simpan.terdeklarasi, fieldDilacak: simpan.dilacak, keluar: simpan.keluar, target: simpan.target, uninitsTry: simpan.uTry })
  }

  private fieldBaru(f: A.SimbolField): void {
    const a = this.alamat(f)
    this.fieldDilacak.add(f)
    this.terdeklarasi.push(a)
    this.inits.delete(a)
    this.uninits.add(a)
  }

  private initializer(anggota: (A.DeklarasiField | A.DeklarasiKelas)[]): void {
    for (const a of anggota) {
      if (a.jenis === 'DeklarasiField') {
        for (const d of a.deklarator) if (d.init) this.ekspresi(d.init)
        this.keluar = []
      } else this.kelas(a)
    }
  }

  private method(m: A.DeklarasiMethod, fieldInstance: A.SimbolField[]): void {
    const awalPanggil = m.badan.pernyataan[0]
    const konstruktorAwal =
      m.konstruktor &&
      !(awalPanggil?.jenis === 'PernyataanEkspresi' && awalPanggil.ekspresi.jenis === 'PanggilKonstruktor' && awalPanggil.ekspresi.bentuk === 'this')
    const simpanDilacak = this.fieldDilacak
    const simpanTerdeklarasi = this.terdeklarasi
    if (!konstruktorAwal) {
      // Field hanya dilacak di konstruktor awal (yang tidak memanggil this(...)).
      this.fieldDilacak = new Set()
      this.terdeklarasi = []
    } else this.terdeklarasi = [...this.terdeklarasi]
    this.keluar = []
    this.target = []
    this.spekulatif = false
    this.uninitsTry = new Set()
    for (const p of m.parameter) {
      if (!p.info) continue
      const a = this.alamat(p.info)
      this.terdeklarasi.push(a)
      this.inits.add(a)
      this.uninits.delete(a)
    }
    this.pernyataan(m.badan)
    if (konstruktorAwal) {
      const tutup = m.spanTutup
      for (const f of fieldInstance) {
        if (!this.inits.has(this.alamat(f))) this.lapor('belum-diinisialisasi', tutup, katalog.belumDiinisialisasi(f.nama))
      }
      for (const k of this.keluar) {
        if (k.jenis !== 'return') continue
        for (const f of fieldInstance) {
          if (!k.inits.has(this.alamat(f))) this.lapor('belum-diinisialisasi', k.span, katalog.belumDiinisialisasi(f.nama))
        }
      }
    }
    this.keluar = []
    this.fieldDilacak = simpanDilacak
    this.terdeklarasi = simpanTerdeklarasi
  }

  // ---------- himpunan ----------
  private tandaiMati(): void {
    for (const s of this.terdeklarasi) {
      this.inits.add(s)
      this.uninits.add(s)
    }
  }

  private gabung(): void {
    if (!this.terpisah) return
    this.inits = iris(this.initsT, this.initsF)
    this.uninits = iris(this.uninitsT, this.uninitsF)
    this.terpisah = false
  }

  private pisah(): void {
    this.initsT = new Set(this.inits)
    this.initsF = new Set(this.inits)
    this.uninitsT = new Set(this.uninits)
    this.uninitsF = new Set(this.uninits)
    this.terpisah = true
  }

  private varBaru(info: A.InfoLokal): void {
    const a = this.alamat(info)
    if (!this.terdeklarasi.includes(a)) this.terdeklarasi.push(a)
    this.inits.delete(a)
    this.uninits.add(a)
  }

  private uninit(a: number): void {
    if (!this.inits.has(a)) this.uninitsTry.delete(a)
    this.uninits.delete(a)
  }

  /** javac letInit: penugasan ke variabel (lokal, atau field final yang dilacak). */
  private isi(r: Rujukan, span: Span): void {
    if ('lokal' in r) {
      const info = this.akar(r.lokal)
      const a = this.alamat(info)
      if (info.final) {
        if (!info.parameter) {
          if (!this.uninits.has(a)) {
            this.lapor('final-mungkin-terisi', span, this.spekulatif ? katalog.finalDiisiDalamLoop(info.nama) : katalog.finalMungkinSudahDiisi(info.nama))
          } else this.uninit(a)
        }
      } else if (!this.uninits.has(a)) this.bukanEF.add(info)
      else this.uninit(a)
      this.inits.add(a)
      return
    }
    const f = r.field
    if (this.fieldDilacak.has(f)) {
      const a = this.alamat(f)
      if (!this.uninits.has(a)) {
        this.lapor('final-mungkin-terisi', span, this.spekulatif ? katalog.finalDiisiDalamLoop(f.nama) : katalog.finalMungkinSudahDiisi(f.nama))
      } else this.uninit(a)
      this.inits.add(a)
    } else if (f.final) {
      this.lapor('final-mungkin-terisi', span, katalog.finalMungkinSudahDiisi(f.nama))
    }
  }

  private cekBaca(r: Rujukan, span: Span): void {
    let a: number
    let nama: string
    if ('lokal' in r) {
      const info = this.akar(r.lokal)
      a = this.alamat(info)
      nama = info.nama
    } else {
      if (!this.fieldDilacak.has(r.field)) return
      a = this.alamat(r.field)
      nama = r.field.nama
    }
    if (!this.inits.has(a)) {
      this.lapor('belum-diinisialisasi', span, katalog.belumDiinisialisasi(nama))
      this.inits.add(a)
    }
  }

  /** Variabel yang dirujuk ekspresi target assignment (nama lokal, field via nama atau `this.f`). */
  private rujukan(e: A.Ekspresi): Rujukan | undefined {
    if (e.jenis === 'Nama') {
      if (e.ikatan?.k === 'lokal') return { lokal: e.ikatan.info }
      if (e.ikatan?.k === 'field' && !e.ikatan.luar && e.ikatan.field.final) return { field: e.ikatan.field }
      return undefined
    }
    if (e.jenis === 'AksesField' && e.objek.jenis === 'This' && !e.objek.kualifier && e.ikatan?.k === 'field' && e.ikatan.field.final) {
      return { field: e.ikatan.field }
    }
    return undefined
  }

  // ---------- ekspresi ----------
  private ekspresi(e: A.Ekspresi | undefined): void {
    if (!e) return
    this.scan(e)
    this.gabung()
  }

  private kondisi(e: A.Ekspresi): void {
    if (salah(e)) {
      this.gabung()
      this.initsT = new Set([...this.inits, ...this.terdeklarasi])
      this.uninitsT = new Set([...this.uninits, ...this.terdeklarasi])
      this.initsF = new Set(this.inits)
      this.uninitsF = new Set(this.uninits)
      this.terpisah = true
    } else if (benar(e)) {
      this.gabung()
      this.initsF = new Set([...this.inits, ...this.terdeklarasi])
      this.uninitsF = new Set([...this.uninits, ...this.terdeklarasi])
      this.initsT = new Set(this.inits)
      this.uninitsT = new Set(this.uninits)
      this.terpisah = true
    } else {
      this.scan(e)
      if (!this.terpisah) this.pisah()
    }
  }

  /** Setelah `kondisi()`, masuk ke cabang true/false. */
  private ambilCabang(benar: boolean): void {
    this.inits = new Set(benar ? this.initsT : this.initsF)
    this.uninits = new Set(benar ? this.uninitsT : this.uninitsF)
    this.terpisah = false
  }

  private scan(e: A.Ekspresi): void {
    switch (e.jenis) {
      case 'Literal':
      case 'This':
        return
      case 'Nama': {
        const r = this.rujukan(e)
        if (r) this.cekBaca(r, e.span)
        return
      }
      case 'AksesField': {
        this.ekspresi(e.objek)
        const r = this.rujukan(e)
        if (r) this.cekBaca(r, e.span)
        return
      }
      case 'AksesArray':
        this.ekspresi(e.array)
        this.ekspresi(e.indeks)
        return
      case 'PanggilMethod':
        if (e.objek) this.ekspresi(e.objek)
        for (const a of e.argumen) this.ekspresi(a)
        return
      case 'PanggilKonstruktor':
        for (const a of e.argumen) this.ekspresi(a)
        if (e.bentuk === 'this') {
          // Setelah this(...), semua field final dianggap sudah terisi oleh konstruktor yang dipanggil.
          for (const f of this.fieldDilacak) if (!f.statik) this.inits.add(this.alamat(f))
        }
        return
      case 'InisialisasiArray':
        for (const x of e.elemen) this.ekspresi(x)
        return
      case 'BaruArray':
        for (const x of e.dimensi) this.ekspresi(x)
        if (e.init) this.ekspresi(e.init)
        return
      case 'BaruObjek':
        for (const a of e.argumen) this.ekspresi(a)
        return
      case 'Cast':
        this.ekspresi(e.ekspresi)
        return
      case 'Lambda':
        this.lambda(e)
        return
      case 'Unary':
        if (e.op === '!') {
          this.kondisi(e.operand)
          ;[this.initsT, this.initsF] = [this.initsF, this.initsT]
          ;[this.uninitsT, this.uninitsF] = [this.uninitsF, this.uninitsT]
        } else this.ekspresi(e.operand)
        return
      case 'IncDec': {
        this.ekspresi(e.target)
        const r = this.rujukan(e.target)
        if (r) this.isi(r, e.target.span)
        return
      }
      case 'Assign': {
        const r = this.rujukan(e.target)
        // Seperti javac: target berupa nama tidak dibaca pada `=`, tetapi dibaca pada `+=` dkk.
        if (e.op !== '=' || !r) this.ekspresi(e.op === '=' && e.target.jenis === 'AksesField' ? e.target.objek : e.target)
        this.ekspresi(e.nilai)
        if (r) this.isi(r, e.target.span)
        return
      }
      case 'Biner':
        if (e.op === '&&' || e.op === '||') {
          const dan = e.op === '&&'
          this.kondisi(e.kiri)
          const sisaI = new Set(dan ? this.initsF : this.initsT)
          const sisaU = new Set(dan ? this.uninitsF : this.uninitsT)
          this.ambilCabang(dan)
          this.kondisi(e.kanan)
          if (dan) {
            this.initsF = iris(this.initsF, sisaI)
            this.uninitsF = iris(this.uninitsF, sisaU)
          } else {
            this.initsT = iris(this.initsT, sisaI)
            this.uninitsT = iris(this.uninitsT, sisaU)
          }
          return
        }
        this.ekspresi(e.kiri)
        this.ekspresi(e.kanan)
        return
      case 'Kondisional': {
        this.kondisi(e.kondisi)
        const lainI = new Set(this.initsF)
        const lainU = new Set(this.uninitsF)
        this.ambilCabang(true)
        const boolean = e.ya.tipe?.k === 'primitif' && e.ya.tipe.nama === 'boolean' && e.tidak.tipe?.k === 'primitif' && e.tidak.tipe.nama === 'boolean'
        if (boolean) {
          this.kondisi(e.ya)
          const [tI, fI, tU, fU] = [new Set(this.initsT), new Set(this.initsF), new Set(this.uninitsT), new Set(this.uninitsF)]
          this.inits = lainI
          this.uninits = lainU
          this.terpisah = false
          this.kondisi(e.tidak)
          this.initsT = iris(this.initsT, tI)
          this.initsF = iris(this.initsF, fI)
          this.uninitsT = iris(this.uninitsT, tU)
          this.uninitsF = iris(this.uninitsF, fU)
        } else {
          this.ekspresi(e.ya)
          const [aI, aU] = [new Set(this.inits), new Set(this.uninits)]
          this.inits = lainI
          this.uninits = lainU
          this.ekspresi(e.tidak)
          this.inits = iris(this.inits, aI)
          this.uninits = iris(this.uninits, aU)
        }
        return
      }
    }
  }

  /** Badan lambda: parameter terisi; tidak ada variabel luar yang dianggap pasti belum diisi (JLS 16.1.10). */
  private lambda(l: A.Lambda): void {
    const simpan = {
      inits: new Set(this.inits),
      uninits: new Set(this.uninits),
      uTry: new Set(this.uninitsTry),
      keluar: this.keluar,
      target: this.target,
      terdeklarasi: this.terdeklarasi,
      spekulatif: this.spekulatif,
    }
    for (const t of l.tangkapan ?? []) this.tangkapanLuar.set(t.dalam, t.luar)
    this.uninits = new Set()
    this.keluar = []
    this.target = []
    this.spekulatif = false
    this.terdeklarasi = [...this.terdeklarasi]
    for (const p of l.parameter) {
      if (!p.info) continue
      const a = this.alamat(p.info)
      this.terdeklarasi.push(a)
      this.inits.add(a)
    }
    if (l.badan.jenis === 'Blok') this.pernyataan(l.badan)
    else this.ekspresi(l.badan)
    Object.assign(this, { inits: simpan.inits, uninits: simpan.uninits, uninitsTry: simpan.uTry, keluar: simpan.keluar, target: simpan.target, terdeklarasi: simpan.terdeklarasi, spekulatif: simpan.spekulatif })
    this.terpisah = false
  }

  // ---------- pernyataan ----------
  private catatKeluar(jenis: Keluar['jenis'], span: Span, target?: Target): void {
    this.keluar.push({ jenis, target, inits: new Set(this.inits), uninits: new Set(this.uninits), span })
    this.tandaiMati()
  }

  private selesaikan(node: Target, jenis: 'break' | 'continue'): void {
    this.keluar = this.keluar.filter((k) => {
      if (k.jenis === jenis && k.target === node) {
        this.inits = iris(this.inits, k.inits)
        this.uninits = iris(this.uninits, k.uninits)
        return false
      }
      return true
    })
  }

  private loop(node: A.While | A.For | A.DoWhile | A.ForEach, putaran: () => { skipI: Bits; skipU: Bits } | null): void {
    const modeLama = this.spekulatif
    this.spekulatif = false
    const keluarLama = this.keluar
    this.keluar = []
    const errorAwal = this.jumlahError()
    // Variabel yang dideklarasikan di dalam loop tidak ikut dibandingkan (setara `excludeFrom(nextadr)` javac).
    const sebelum = new Set(this.terdeklarasi)
    let skip: { skipI: Bits; skipU: Bits } | null = null
    this.target.push({ node, loop: true })
    for (;;) {
      const masuk = new Set([...this.uninits].filter((s) => sebelum.has(s)))
      const h = putaran()
      if (!this.spekulatif && h) skip = h
      // Putaran kedua (spekulatif) hanya bila ada variabel final yang bisa terisi lagi di putaran berikutnya.
      const berubah = [...masuk].some((s) => this.finalDilacak(s) && !this.uninits.has(s))
      if (this.jumlahError() !== errorAwal || this.spekulatif || !berubah) break
      this.uninits = iris(masuk, this.uninits)
      this.spekulatif = true
    }
    this.target.pop()
    this.spekulatif = modeLama
    if (skip) {
      this.inits = skip.skipI
      this.uninits = skip.skipU
    }
    this.selesaikan(node, 'break')
    this.keluar = [...keluarLama, ...this.keluar]
  }

  /** Penghitung error (diisi pemanggil) untuk menghentikan putaran spekulatif. */
  jumlahError: () => number = () => 0

  /** Alamat milik variabel final (lokal final atau field final yang dilacak). */
  private finalDilacak(a: number): boolean {
    for (const [x, adr] of this.alamatPeta) {
      if (adr !== a) continue
      const info = x as A.InfoLokal & A.SimbolField
      return info.final === true
    }
    return false
  }

  private pernyataan(p: Simpul): void {
    switch (p.jenis) {
      case 'Blok':
        for (const s of p.pernyataan) this.pernyataan(s)
        return
      case 'Kosong':
        return
      case 'DeklarasiLokal':
        for (const d of p.deklarator) {
          if (!d.info) continue
          this.varBaru(d.info)
          if (d.init) {
            this.ekspresi(d.init)
            this.isi({ lokal: d.info }, d.spanNama)
          }
        }
        return
      case 'PernyataanEkspresi':
        this.ekspresi(p.ekspresi)
        return
      case 'If': {
        this.kondisi(p.kondisi)
        const lainI = new Set(this.initsF)
        const lainU = new Set(this.uninitsF)
        this.ambilCabang(true)
        this.pernyataan(p.maka)
        if (p.lain) {
          const [mI, mU] = [new Set(this.inits), new Set(this.uninits)]
          this.inits = lainI
          this.uninits = lainU
          this.pernyataan(p.lain)
          this.inits = iris(this.inits, mI)
          this.uninits = iris(this.uninits, mU)
        } else {
          this.inits = iris(this.inits, lainI)
          this.uninits = iris(this.uninits, lainU)
        }
        return
      }
      case 'While':
        this.loop(p, () => {
          this.kondisi(p.kondisi)
          const skip = { skipI: new Set(this.initsF), skipU: new Set(this.uninitsF) }
          this.ambilCabang(true)
          this.pernyataan(p.badan)
          this.selesaikan(p, 'continue')
          return skip
        })
        return
      case 'DoWhile':
        this.loop(p, () => {
          this.pernyataan(p.badan)
          this.selesaikan(p, 'continue')
          this.kondisi(p.kondisi)
          const skip = { skipI: new Set(this.initsF), skipU: new Set(this.uninitsF) }
          this.ambilCabang(true)
          return skip
        })
        return
      case 'For':
        for (const i of p.init) this.pernyataan(i)
        this.loop(p, () => {
          let skip: { skipI: Bits; skipU: Bits }
          if (p.kondisi) {
            this.kondisi(p.kondisi)
            skip = { skipI: new Set(this.initsF), skipU: new Set(this.uninitsF) }
            this.ambilCabang(true)
          } else {
            skip = { skipI: new Set([...this.inits, ...this.terdeklarasi]), skipU: new Set([...this.uninits, ...this.terdeklarasi]) }
          }
          this.pernyataan(p.badan)
          this.selesaikan(p, 'continue')
          for (const u of p.update) this.ekspresi(u)
          return skip
        })
        return
      case 'ForEach': {
        this.ekspresi(p.iterable)
        const awalI = new Set(this.inits)
        const awalU = new Set(this.uninits)
        if (p.info) {
          this.varBaru(p.info)
          this.isi({ lokal: p.info }, p.spanNama)
        }
        this.loop(p, () => {
          this.pernyataan(p.badan)
          this.selesaikan(p, 'continue')
          return null
        })
        this.inits = awalI
        this.uninits = iris(awalU, this.uninits)
        return
      }
      case 'Switch': {
        const keluarLama = this.keluar
        this.keluar = []
        this.ekspresi(p.selektor)
        const swI = new Set(this.inits)
        const swU = new Set(this.uninits)
        this.target.push({ node: p, loop: false })
        for (const g of p.grup) {
          this.inits = new Set(swI)
          this.uninits = iris(this.uninits, swU)
          for (const s of g.pernyataan) this.pernyataan(s)
          if (p.panah) this.catatKeluar('break', g.span, p)
        }
        this.target.pop()
        if (!p.grup.some((g) => g.label.includes('default'))) {
          this.inits = swI
          this.uninits = iris(this.uninits, swU)
        }
        this.selesaikan(p, 'break')
        this.keluar = [...keluarLama, ...this.keluar]
        return
      }
      case 'Break':
        this.catatKeluar('break', p.span, this.target[this.target.length - 1]?.node)
        return
      case 'Continue':
        this.catatKeluar('continue', p.span, [...this.target].reverse().find((t) => t.loop)?.node)
        return
      case 'Return':
        this.ekspresi(p.ekspresi)
        this.catatKeluar('return', p.span)
        return
      case 'Throw':
        this.ekspresi(p.ekspresi)
        this.tandaiMati()
        return
      case 'Try':
        this.tryCatch(p)
        return
    }
  }

  /** JLS 16.2.15: try/catch/finally. */
  private tryCatch(p: A.Try): void {
    const uninitsTryLama = new Set(this.uninitsTry)
    const keluarLama = this.keluar
    this.keluar = []
    const initsTry = new Set(this.inits)
    this.uninitsTry = new Set(this.uninits)
    this.pernyataan(p.blok)
    this.uninitsTry = iris(this.uninitsTry, this.uninits)
    let initsAkhir = new Set(this.inits)
    let uninitsAkhir = new Set(this.uninits)
    const initsCatch = new Set(initsTry)
    const uninitsCatch = new Set(this.uninitsTry)
    for (const c of p.tangkap) {
      this.inits = new Set(initsCatch)
      this.uninits = new Set(uninitsCatch)
      if (c.info) {
        this.varBaru(c.info)
        this.isi({ lokal: c.info }, c.spanNama)
      }
      this.pernyataan(c.badan)
      initsAkhir = iris(initsAkhir, this.inits)
      uninitsAkhir = iris(uninitsAkhir, this.uninits)
    }
    if (p.akhirnya) {
      this.inits = new Set(initsTry)
      this.uninits = new Set(this.uninitsTry)
      const keluarTry = this.keluar
      this.keluar = keluarLama
      this.pernyataan(p.akhirnya)
      if (bisaSelesaiNormal(p.akhirnya)) {
        this.uninits = iris(this.uninits, uninitsAkhir)
        for (const k of keluarTry) {
          for (const x of this.inits) k.inits.add(x)
          k.uninits = iris(k.uninits, this.uninits)
          this.keluar.push(k)
        }
        for (const x of initsAkhir) this.inits.add(x)
      }
    } else {
      this.inits = initsAkhir
      this.uninits = uninitsAkhir
      this.keluar = [...keluarLama, ...this.keluar]
    }
    this.uninitsTry = iris(iris(this.uninitsTry, uninitsTryLama), this.uninits)
  }
}

// ====================== Exception (checked) ======================
const KELAS_TAK_DICEK: Tipe[] = [
  { k: 'kelas', nama: 'RuntimeException' },
  { k: 'kelas', nama: 'Error' },
]

class AnalisisException {
  private caught: Tipe[] = []
  private thrown: Tipe[] = []
  private pending: { span: Span; tipe: Tipe }[] = []
  /** Tipe lemparan presisi parameter catch (untuk `throw e;` dari dalam catch). */
  private readonly presisi = new Map<A.InfoLokal, Tipe[]>()

  constructor(
    private readonly lapor: Lapor,
    private readonly d: DuniaTipe,
    private readonly teks: (t: Tipe) => string,
    private readonly penugasan: AnalisisPenugasan,
  ) {}

  kelas(k: A.DeklarasiKelas): void {
    const simpan = { caught: this.caught, thrown: this.thrown, pending: this.pending }
    this.caught = []
    this.thrown = []
    this.pending = []
    const { statik, instance, method } = urutanAnggota(k)
    for (const a of [...statik, ...instance]) {
      if (a.jenis === 'DeklarasiField') {
        for (const d of a.deklarator) if (d.init) this.kunjungi(d.init)
        this.laporPending()
      } else this.kelas(a)
    }
    for (const m of method) {
      this.caught = (m.simbol?.throws ?? []).filter((t) => t.k === 'kelas')
      this.thrown = []
      this.pending = []
      this.kunjungi(m.badan)
      this.laporPending()
    }
    this.caught = simpan.caught
    this.thrown = simpan.thrown
    this.pending = simpan.pending
  }

  private laporPending(): void {
    for (const p of this.pending) this.lapor('exception-tidak-dilaporkan', p.span, katalog.exceptionTidakDilaporkan(this.teks(p.tipe)))
    this.pending = []
  }

  private subset(t: Tipe, daftar: Tipe[]): boolean {
    return daftar.some((x) => this.d.subtipe(t, x))
  }

  private bersinggungan(t: Tipe, daftar: Tipe[]): boolean {
    return daftar.some((x) => this.d.subtipe(t, x) || this.d.subtipe(x, t))
  }

  private tambah(t: Tipe, daftar: Tipe[]): Tipe[] {
    return this.subset(t, daftar) ? daftar : [...daftar.filter((x) => !this.d.subtipe(x, t)), t]
  }

  /** javac markThrown. */
  private tandai(span: Span, t: Tipe): void {
    if (t.k !== 'kelas' || !this.d.checked(t)) return
    if (!this.subset(t, this.caught)) this.pending.push({ span, tipe: t })
    this.thrown = this.tambah(t, this.thrown)
  }

  private kunjungi(n: A.Pernyataan | A.Ekspresi): void {
    switch (n.jenis) {
      case 'Try':
        this.tryCatch(n)
        return
      case 'Throw': {
        this.kunjungi(n.ekspresi)
        const e = n.ekspresi
        const info = e.jenis === 'Nama' && e.ikatan?.k === 'lokal' ? this.penugasan.akar(e.ikatan.info) : undefined
        const tepat = info && (info.final || !this.penugasan.bukanEF.has(info)) ? this.presisi.get(info) : undefined
        if (tepat) for (const t of tepat) this.tandai(n.span, t)
        else if (e.tipe) this.tandai(n.span, e.tipe)
        return
      }
      case 'Lambda': {
        const simpan = { caught: this.caught, thrown: this.thrown, pending: this.pending }
        this.caught = []
        this.thrown = []
        this.pending = []
        this.kunjungi(n.badan)
        this.laporPending()
        this.caught = simpan.caught
        this.thrown = simpan.thrown
        this.pending = simpan.pending
        return
      }
      case 'PanggilMethod':
        for (const a of anakNode(n)) this.kunjungi(a)
        if (n.target?.k === 'user') for (const t of n.target.method.throws ?? []) this.tandai(n.span, t)
        return
      case 'BaruObjek':
        for (const a of n.argumen) this.kunjungi(a)
        if (n.target?.k === 'user' && n.target.konstruktor) for (const t of n.target.konstruktor.throws ?? []) this.tandai({ awal: n.span.awal, akhir: n.span.akhir }, t)
        return
      case 'PanggilKonstruktor':
        for (const a of n.argumen) this.kunjungi(a)
        if (n.target?.k === 'user' && n.target.konstruktor) for (const t of n.target.konstruktor.throws ?? []) this.tandai(n.span, t)
        return
      default:
        for (const a of anakNode(n)) this.kunjungi(a)
    }
  }

  private tryCatch(p: A.Try): void {
    const caughtLama = this.caught
    const thrownLama = this.thrown
    const pendingLama = this.pending
    this.thrown = []
    this.pending = []
    for (const c of p.tangkap) for (const t of c.tipeTangkap ?? []) if (t.k === 'kelas') this.caught = this.tambah(t, this.caught)
    this.kunjungi(p.blok)
    const thrownDiTry = [...this.thrown, ...KELAS_TAK_DICEK]
    this.thrown = thrownLama
    this.caught = caughtLama
    let ditangkap: Tipe[] = []
    for (const c of p.tangkap) {
      const tipe = (c.tipeTangkap ?? []).filter((t) => t.k === 'kelas')
      const dilempar = thrownDiTry.filter((t) => !this.subset(t, ditangkap))
      c.tipe.forEach((n, i) => {
        const t = c.tipeTangkap?.[i]
        if (!t || t.k !== 'kelas' || t.nama === 'Object') return
        const span = c.tipe.length > 1 ? { awal: n.span.awal, akhir: n.span.akhir } : { awal: c.span.awal, akhir: c.span.awal + 5 }
        if (this.subset(t, ditangkap)) this.lapor('sudah-ditangkap', span, katalog.exceptionSudahDitangkap(this.teks(t)))
        else if (this.d.checked(t) && t.nama !== 'Exception' && t.nama !== 'Throwable' && !this.bersinggungan(t, thrownDiTry)) {
          this.lapor('tidak-pernah-dilempar', span, katalog.exceptionTidakPernahDilempar(this.teks(t)))
        }
        ditangkap = this.tambah(t, ditangkap)
      })
      if (c.info) {
        const tepat: Tipe[] = []
        for (const ct of tipe) {
          for (const x of dilempar) {
            if (this.d.subtipe(x, ct)) tepat.push(x)
            else if (this.d.subtipe(ct, x)) tepat.push(ct)
          }
        }
        this.presisi.set(c.info, tepat)
      }
      this.kunjungi(c.badan)
    }
    if (p.akhirnya) {
      const pendingTry = this.pending
      this.pending = []
      this.kunjungi(p.akhirnya)
      this.pending = bisaSelesaiNormal(p.akhirnya) ? [...pendingLama, ...this.pending, ...pendingTry] : [...pendingLama, ...this.pending]
    } else this.pending = [...pendingLama, ...this.pending]
  }
}

// ====================== Tangkapan lambda (effectively final) ======================
class AnalisisTangkapan {
  private lambda: A.Lambda | null = null
  private readonly salinan = new Set<A.InfoLokal>()

  constructor(
    private readonly lapor: Lapor,
    private readonly penugasan: AnalisisPenugasan,
  ) {}

  kelas(k: A.DeklarasiKelas): void {
    for (const a of k.anggota) {
      if (a.jenis === 'DeklarasiField') {
        for (const d of a.deklarator) if (d.init) this.kunjungi(d.init)
      } else if (a.jenis === 'DeklarasiMethod') this.kunjungi(a.badan)
      else this.kelas(a)
    }
  }

  private cek(e: A.Ekspresi): void {
    if (!this.lambda || e.jenis !== 'Nama' || e.ikatan?.k !== 'lokal' || !this.salinan.has(e.ikatan.info)) return
    const akar = this.penugasan.akar(e.ikatan.info)
    if (!akar.final && this.penugasan.bukanEF.has(akar)) this.lapor('lambda-tidak-final', e.span, katalog.lambdaVariabelTidakFinal())
  }

  private kunjungi(n: A.Pernyataan | A.Ekspresi): void {
    switch (n.jenis) {
      case 'Lambda': {
        for (const t of n.tangkapan ?? []) this.salinan.add(t.dalam)
        const simpan = this.lambda
        this.lambda = n
        this.kunjungi(n.badan)
        this.lambda = simpan
        return
      }
      case 'Nama':
        this.cek(n)
        return
      case 'Assign':
        if (n.target.jenis !== 'Nama') this.kunjungi(n.target)
        this.kunjungi(n.nilai)
        this.cek(n.target)
        return
      default:
        for (const a of anakNode(n)) this.kunjungi(a)
    }
  }
}

/** Jalankan analisis alur untuk satu class top-level (beserta class bersarangnya), urutan error mengikuti javac. */
export function analisisAlurKelas(kelas: A.DeklarasiKelas, diag: PengumpulDiagnostik, dunia: DuniaTipe, teks: (t: Tipe) => string): void {
  const lapor: Lapor = (kode, span, isi) => diag.tambah(kode, span, isi)
  new AnalisisHidup(lapor).kelas(kelas)
  const penugasan = new AnalisisPenugasan(lapor)
  penugasan.jumlahError = () => diag.daftar.length
  penugasan.kelas(kelas)
  new AnalisisException(lapor, dunia, teks, penugasan).kelas(kelas)
  new AnalisisTangkapan(lapor, penugasan).kelas(kelas)
}
