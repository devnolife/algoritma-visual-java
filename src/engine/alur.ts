/**
 * Analisis alur (meniru javac Flow): dijalankan hanya bila tidak ada error tipe.
 * 1. Keterjangkauan (AliveAnalyzer): `unreachable statement`, `missing return statement`.
 * 2. Penugasan pasti (AssignAnalyzer): `variable x might not have been initialized`,
 *    `variable x might already have been assigned`, `variable x might be assigned in loop`.
 * Seperti javac, semua error keterjangkauan dilaporkan lebih dulu, baru error penugasan.
 */
import type * as A from './ast'
import { katalog, type PengumpulDiagnostik } from './diagnostik'
import type { Span } from './sumber'

type Simpul = A.Pernyataan
type Target = A.While | A.DoWhile | A.For | A.ForEach | A.Switch

const benar = (e: A.Ekspresi | undefined) => e !== undefined && e.konstan === true
const salah = (e: A.Ekspresi | undefined) => e !== undefined && e.konstan === false

function posisiPernyataan(p: Simpul): Span {
  return p.jenis === 'DeklarasiLokal' && p.deklarator.length > 0 ? p.deklarator[0].spanNama : p.span
}

// ====================== Keterjangkauan ======================
type Hidup = 'hidup' | 'mati' | 'pulih'
const dari = (x: boolean): Hidup => (x ? 'hidup' : 'mati')
const atau = (a: Hidup, b: Hidup): Hidup => (a === 'hidup' ? 'hidup' : a === 'mati' ? b : b === 'hidup' ? 'hidup' : 'pulih')
const dan = (a: Hidup, b: Hidup): Hidup => (a === 'hidup' ? b : a === 'mati' ? 'mati' : b === 'mati' ? 'mati' : 'pulih')

class AnalisisHidup {
  private hidup: Hidup = 'hidup'
  private keluar: { jenis: 'break' | 'continue' | 'return'; target?: Target }[] = []
  private target: { node: Target; loop: boolean }[] = []

  constructor(private readonly diag: PengumpulDiagnostik) {}

  /** Dibaca lewat method agar TypeScript tidak mempersempit tipe setelah pemanggilan yang mengubahnya. */
  private status(): Hidup {
    return this.hidup
  }

  method(m: A.DeklarasiMethod): void {
    this.hidup = 'hidup'
    this.keluar = []
    this.target = []
    this.satu(m.badan)
    const kembali = m.simbol?.kembali
    if (this.hidup === 'hidup' && kembali && kembali.k !== 'void') this.diag.tambah('return-hilang', m.spanTutup, katalog.returnHilang())
  }

  private satu(p: Simpul): void {
    if (this.hidup === 'mati') {
      this.diag.tambah('tidak-terjangkau', posisiPernyataan(p), katalog.tidakTerjangkau())
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
    }
  }
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
}

class AnalisisPenugasan {
  private inits: Bits = new Set()
  private uninits: Bits = new Set()
  private initsT: Bits = new Set()
  private initsF: Bits = new Set()
  private uninitsT: Bits = new Set()
  private uninitsF: Bits = new Set()
  /** true bila hasil kondisi terakhir masih terpisah (whenTrue/whenFalse). */
  private terpisah = false
  /** Slot yang sudah dideklarasikan di method ini (untuk menandai kode mati). */
  private terdeklarasi: number[] = []
  private readonly finalLokal = new Set<number>()
  private spekulatif = false
  private keluar: Keluar[] = []
  private target: { node: Target; loop: boolean }[] = []

  constructor(private readonly diag: PengumpulDiagnostik) {}

  method(m: A.DeklarasiMethod): void {
    this.inits = new Set()
    this.uninits = new Set()
    this.terdeklarasi = []
    this.keluar = []
    this.target = []
    this.spekulatif = false
    for (const p of m.parameter) {
      if (!p.info) continue
      this.terdeklarasi.push(p.info.slot)
      this.inits.add(p.info.slot)
    }
    this.pernyataan(m.badan)
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

  private varBaru(info: A.InfoLokal, final: boolean): void {
    if (!this.terdeklarasi.includes(info.slot)) this.terdeklarasi.push(info.slot)
    this.inits.delete(info.slot)
    this.uninits.add(info.slot)
    if (final) this.finalLokal.add(info.slot)
  }

  private isi(info: A.InfoLokal, span: Span): void {
    if (this.finalLokal.has(info.slot) && !info.parameter) {
      if (!this.uninits.has(info.slot)) {
        this.diag.tambah(
          'final-mungkin-terisi',
          span,
          this.spekulatif ? katalog.finalDiisiDalamLoop(info.nama) : katalog.finalMungkinSudahDiisi(info.nama),
        )
      } else this.uninits.delete(info.slot)
    }
    this.inits.add(info.slot)
  }

  private cekBaca(info: A.InfoLokal, span: Span): void {
    if (!this.inits.has(info.slot)) {
      this.diag.tambah('belum-diinisialisasi', span, katalog.belumDiinisialisasi(info.nama))
      this.inits.add(info.slot)
    }
  }

  private lokalDari(e: A.Ekspresi): A.InfoLokal | undefined {
    return e.jenis === 'Nama' && e.ikatan?.k === 'lokal' ? e.ikatan.info : undefined
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
        return
      case 'Nama': {
        const info = this.lokalDari(e)
        if (info) this.cekBaca(info, e.span)
        return
      }
      case 'AksesField':
        this.ekspresi(e.objek)
        return
      case 'AksesArray':
        this.ekspresi(e.array)
        this.ekspresi(e.indeks)
        return
      case 'PanggilMethod':
        if (e.objek) this.ekspresi(e.objek)
        for (const a of e.argumen) this.ekspresi(a)
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
      case 'Unary':
        if (e.op === '!') {
          this.kondisi(e.operand)
          ;[this.initsT, this.initsF] = [this.initsF, this.initsT]
          ;[this.uninitsT, this.uninitsF] = [this.uninitsF, this.uninitsT]
        } else this.ekspresi(e.operand)
        return
      case 'IncDec': {
        this.ekspresi(e.target)
        const info = this.lokalDari(e.target)
        if (info) this.isi(info, e.target.span)
        return
      }
      case 'Assign': {
        const info = this.lokalDari(e.target)
        // Seperti javac: target berupa nama tidak dibaca pada `=`, tetapi dibaca pada `+=` dkk.
        if (e.op !== '=' || e.target.jenis !== 'Nama') this.ekspresi(e.target)
        this.ekspresi(e.nilai)
        if (info) this.isi(info, e.target.span)
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

  // ---------- pernyataan ----------
  private catatKeluar(jenis: Keluar['jenis'], target?: Target): void {
    this.keluar.push({ jenis, target, inits: new Set(this.inits), uninits: new Set(this.uninits) })
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
    const errorAwal = this.diag.daftar.length
    // Variabel yang dideklarasikan di dalam loop tidak ikut dibandingkan (setara `excludeFrom(nextadr)` javac).
    const sebelum = new Set(this.terdeklarasi)
    let skip: { skipI: Bits; skipU: Bits } | null = null
    this.target.push({ node, loop: true })
    for (;;) {
      const masuk = new Set([...this.uninits].filter((s) => sebelum.has(s)))
      const h = putaran()
      if (!this.spekulatif && h) skip = h
      // Putaran kedua (spekulatif) hanya bila ada variabel final yang bisa terisi lagi di putaran berikutnya.
      const berubah = [...masuk].some((s) => this.finalLokal.has(s) && !this.uninits.has(s))
      if (this.diag.daftar.length !== errorAwal || this.spekulatif || !berubah) break
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
          this.varBaru(d.info, p.final)
          if (d.init) {
            this.ekspresi(d.init)
            this.isi(d.info, d.spanNama)
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
          this.varBaru(p.info, p.final)
          this.isi(p.info, p.spanNama)
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
          if (p.panah) this.catatKeluar('break', p)
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
        this.catatKeluar('break', this.target[this.target.length - 1]?.node)
        return
      case 'Continue':
        this.catatKeluar('continue', [...this.target].reverse().find((t) => t.loop)?.node)
        return
      case 'Return':
        this.ekspresi(p.ekspresi)
        this.catatKeluar('return')
        return
    }
  }
}

/** Jalankan analisis alur untuk semua method sebuah class (urutan error mengikuti javac). */
export function analisisAlur(kelas: A.DeklarasiKelas, diag: PengumpulDiagnostik): void {
  const hidup = new AnalisisHidup(diag)
  for (const m of kelas.method) hidup.method(m)
  const penugasan = new AnalisisPenugasan(diag)
  for (const m of kelas.method) penugasan.method(m)
}
