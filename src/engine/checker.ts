import type * as A from './ast'
import { katalog, type IsiPesan, type PengumpulDiagnostik } from './diagnostik'
import { primitifKeString } from './format'
import { aritmetika, bandingkan, bitNot, geser, konversiPrimitif, LemparanJava, negasi, operasiBit } from './nilai'
import { KELAS_JAVA_UTIL, kelasPustaka, type MethodPustaka } from './pustaka/daftar'
import type { Span } from './sumber'
import {
  adalahBoolean, adalahError, adalahIntegral, adalahNumerik, adalahPrimitif, adalahReferensi, adalahString,
  bisaCast, bisaKonversiLonggar, bisaKonversiMethod, cekAssign, promosiBiner, promosiUnary, samaTipe, T, teksTipe,
  tipeArray, type NamaPrimitif, type Tipe,
} from './tipe'

export interface ProgramTerperiksa {
  unit: A.UnitKompilasi
  kelas: A.DeklarasiKelas
  method: Map<string, A.SimbolMethod[]>
  field: Map<string, A.SimbolField>
  main?: A.SimbolMethod
}

/** Class Java yang dikenal tetapi baru didukung di fase berikutnya. */
const KELAS_FASE_2 = new Set([
  'ArrayList', 'LinkedList', 'List', 'HashMap', 'Map', 'HashSet', 'Set', 'TreeMap', 'TreeSet', 'Stack', 'Queue',
  'Deque', 'ArrayDeque', 'PriorityQueue', 'Iterator', 'Integer', 'Double', 'Character', 'Boolean', 'Long', 'Float',
  'Short', 'Byte', 'Random', 'StringBuilder', 'StringBuffer', 'BufferedReader', 'Collections', 'Optional',
])

const OP_ARITMETIKA = new Set(['+', '-', '*', '/', '%'])
const OP_RELASIONAL = new Set(['<', '>', '<=', '>='])

interface Konteks {
  deklarasi: A.DeklarasiMethod | null
  metode: A.SimbolMethod | null
  statik: boolean
  lingkup: Map<string, A.InfoLokal>[]
  /** Slot yang dideklarasikan pada tiap lingkup (sejajar dengan `lingkup`). */
  slotLingkup: number[][]
  slotBerikut: number
  kedalamanLoop: number
  kedalamanSwitch: number
}

export function periksa(unit: A.UnitKompilasi, diag: PengumpulDiagnostik): ProgramTerperiksa | null {
  return new Pemeriksa(unit, diag).jalankan()
}

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
export function saranMirip(nama: string, kandidat: string[]): string | undefined {
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

class Pemeriksa {
  private kelas!: A.DeklarasiKelas
  private readonly method = new Map<string, A.SimbolMethod[]>()
  private readonly field = new Map<string, A.SimbolField>()
  private readonly imporUtil = new Set<string>()
  private ctx: Konteks = this.konteksBaru(null, null, true)

  constructor(
    private readonly unit: A.UnitKompilasi,
    private readonly diag: PengumpulDiagnostik,
  ) {}

  private konteksBaru(deklarasi: A.DeklarasiMethod | null, metode: A.SimbolMethod | null, statik: boolean): Konteks {
    return { deklarasi, metode, statik, lingkup: [new Map()], slotLingkup: [[]], slotBerikut: 0, kedalamanLoop: 0, kedalamanSwitch: 0 }
  }

  private lapor(kode: string, span: Span, isi: IsiPesan): void {
    this.diag.tambah(kode, span, isi)
  }

  jalankan(): ProgramTerperiksa | null {
    for (const imp of this.unit.impor) {
      if (imp.wildcard && imp.nama === 'java.util') KELAS_JAVA_UTIL.forEach((k) => this.imporUtil.add(k))
      else if (imp.nama.startsWith('java.util.')) this.imporUtil.add(imp.nama.slice('java.util.'.length))
    }
    if (this.unit.kelas.length === 0) {
      this.lapor('tidak-ada-main', { awal: 0, akhir: 0 }, katalog.tidakAdaMain())
      return null
    }
    this.kelas = this.unit.kelas[0]
    for (const lain of this.unit.kelas.slice(1)) {
      this.lapor('belum-didukung', lain.spanNama, katalog.belumDidukung('Lebih dari satu class dalam satu file', 'Class buatan sendiri akan dibahas di Modul 2.'))
    }
    if (this.kelas.nama !== 'Main') {
      if (this.kelas.modifier.includes('public')) this.lapor('kelas-publik-nama-file', this.kelas.spanNama, katalog.kelasPublikNamaFile(this.kelas.nama))
      else this.lapor('tidak-ada-main', this.kelas.spanNama, { ...katalog.tidakAdaMain(), saran: `Ganti nama class ${this.kelas.nama} menjadi Main.` })
    }
    this.kumpulkanField()
    this.kumpulkanMethod()
    for (const f of this.kelas.field) this.periksaField(f)
    for (const m of this.kelas.method) this.periksaMethod(m)
    const kandidatMain = this.method.get('main')?.find(
      (m) => m.statik && m.kembali.k === 'void' && m.parameter.length === 1 && samaTipe(m.parameter[0], tipeArray(T.String)),
    )
    return { unit: this.unit, kelas: this.kelas, method: this.method, field: this.field, main: kandidatMain }
  }

  // ---------- deklarasi class ----------
  private kumpulkanField(): void {
    for (const f of this.kelas.field) {
      const dasar = this.tipeDari(f.tipeNode)
      for (const d of f.deklarator) {
        const tipe = tipeArray(dasar, d.dimensiTambahan)
        d.tipe = tipe
        if (this.field.has(d.nama)) {
          this.lapor('sudah-didefinisikan', d.spanNama, {
            ...katalog.sudahDidefinisikan(d.nama, ''),
            pesan: `variable ${d.nama} is already defined in class ${this.kelas.nama}`,
          })
          continue
        }
        this.field.set(d.nama, { nama: d.nama, tipe, statik: f.modifier.includes('static'), final: f.modifier.includes('final'), deklarasi: d })
      }
    }
  }

  private kumpulkanMethod(): void {
    for (const m of this.kelas.method) {
      const parameter = m.parameter.map((p) => this.tipeDari(p.tipeNode))
      const kembali = m.tipeKembali ? this.tipeDari(m.tipeKembali) : T.void
      const varargs = m.parameter.length > 0 && m.parameter[m.parameter.length - 1].varargs
      const tandaTangan = `${m.nama}(${parameter.map(teksTipe).join(',').replace(/\[\]$/, varargs ? '...' : '[]')})`
      const simbol: A.SimbolMethod = { nama: m.nama, parameter, kembali, statik: m.modifier.includes('static'), varargs, deklarasi: m, tandaTangan }
      const daftar = this.method.get(m.nama) ?? []
      if (daftar.some((lain) => lain.parameter.length === parameter.length && lain.parameter.every((t, i) => samaTipe(t, parameter[i])))) {
        this.lapor('method-sudah-ada', m.spanNama, katalog.methodSudahAda(tandaTangan))
      }
      daftar.push(simbol)
      this.method.set(m.nama, daftar)
      m.simbol = simbol
    }
  }

  private periksaField(f: A.DeklarasiField): void {
    const statik = f.modifier.includes('static')
    this.ctx = this.konteksBaru(null, null, statik)
    for (const d of f.deklarator) {
      if (!d.init || !d.tipe) continue
      this.periksaInisialisasi(d.init, d.tipe)
      const simbol = this.field.get(d.nama)
      if (simbol && simbol.deklarasi === d && simbol.final && d.init.konstan !== undefined && (d.tipe.k === 'primitif' || adalahString(d.tipe))) {
        simbol.konstan = konversiKonstan(d.init.konstan, d.init.tipe!, d.tipe)
      }
    }
  }

  private periksaMethod(m: A.DeklarasiMethod): void {
    const simbol = m.simbol!
    this.ctx = this.konteksBaru(m, simbol, simbol.statik)
    m.parameter.forEach((p, i) => {
      if (this.cariLokal(p.nama)) {
        this.lapor('sudah-didefinisikan', p.spanNama, katalog.sudahDidefinisikan(p.nama, this.namaMethodJavac()))
      }
      p.info = this.deklarasiLokal(p.nama, simbol.parameter[i], p.final, true, p.spanNama)
    })
    this.periksaBlok(m.badan, false)
    m.jumlahSlot = this.ctx.slotBerikut
  }

  private namaMethodJavac(): string {
    const s = this.ctx.metode
    if (!s) return ''
    return s.tandaTangan
  }

  // ---------- tipe ----------
  private tipeDari(n: A.NodeTipe): Tipe {
    switch (n.jenis) {
      case 'TipePrimitif':
        return { k: 'primitif', nama: n.nama }
      case 'TipeArray':
        return { k: 'array', elemen: this.tipeDari(n.elemen) }
      case 'TipeNama': {
        const nama = n.nama.startsWith('java.lang.') ? n.nama.slice(10) : n.nama.startsWith('java.util.') ? n.nama.slice(10) : n.nama
        if (n.argumen) {
          this.lapor('belum-didukung', n.span, katalog.belumDidukung(`Tipe generik ${nama}<…>`, 'Koleksi generik seperti ArrayList akan dibahas di Modul 2.'))
          return T.error
        }
        if (nama === 'String' || nama === 'Object') return { k: 'kelas', nama }
        if (nama === 'Scanner') {
          if (!this.imporUtil.has('Scanner') && !n.nama.startsWith('java.util.')) {
            this.lapor('simbol-tidak-ditemukan', n.span, katalog.simbolTidakDitemukan('class', 'Scanner', `class ${this.kelas.nama}`))
            return T.error
          }
          return { k: 'kelas', nama }
        }
        if (nama === 'var') return T.error
        if (KELAS_FASE_2.has(nama)) {
          this.lapor('belum-didukung', n.span, katalog.belumDidukung(`Tipe ${nama}`, nama === 'Random' ? 'Gunakan Math.random() untuk bilangan acak.' : 'Tipe ini akan dibahas di Modul 2.'))
          return T.error
        }
        this.lapor('simbol-tidak-ditemukan', n.span, katalog.simbolTidakDitemukan('class', nama, `class ${this.kelas.nama}`))
        return T.error
      }
    }
  }

  // ---------- lingkup & variabel lokal ----------
  private cariLokal(nama: string): A.InfoLokal | undefined {
    for (let i = this.ctx.lingkup.length - 1; i >= 0; i--) {
      const x = this.ctx.lingkup[i].get(nama)
      if (x) return x
    }
    return undefined
  }

  private masukLingkup(): void {
    this.ctx.lingkup.push(new Map())
    this.ctx.slotLingkup.push([])
  }

  private keluarLingkup(): number[] {
    this.ctx.lingkup.pop()
    return this.ctx.slotLingkup.pop() ?? []
  }

  private deklarasiLokal(nama: string, tipe: Tipe, final: boolean, parameter: boolean, span: Span): A.InfoLokal {
    const info: A.InfoLokal = { nama, tipe, slot: this.ctx.slotBerikut++, final, parameter, span }
    this.ctx.lingkup[this.ctx.lingkup.length - 1].set(nama, info)
    this.ctx.slotLingkup[this.ctx.slotLingkup.length - 1].push(info.slot)
    return info
  }

  // ---------- pernyataan ----------
  private periksaBlok(b: A.Blok, lingkupBaru = true): void {
    if (lingkupBaru) this.masukLingkup()
    for (const p of b.pernyataan) this.periksaPernyataan(p)
    if (lingkupBaru) b.slotLokal = this.keluarLingkup()
    else b.slotLokal = [...(this.ctx.slotLingkup[this.ctx.slotLingkup.length - 1] ?? [])].filter((s) => !this.ctx.deklarasi?.parameter.some((p) => p.info?.slot === s))
  }

  /** Pernyataan tunggal sebagai badan if/loop: deklarasi tidak diizinkan di sini. */
  private periksaBadan(p: A.Pernyataan): void {
    if (p.jenis === 'DeklarasiLokal') {
      this.lapor('deklarasi-tidak-diizinkan', p.span, {
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
      case 'Return': {
        const kembali = this.ctx.metode?.kembali ?? T.void
        if (kembali.k === 'void') {
          if (p.ekspresi) {
            this.ekspresi(p.ekspresi)
            this.lapor('return-tak-terduga', p.ekspresi.span, katalog.returnTakTerduga())
          }
        } else if (!p.ekspresi) {
          this.lapor('return-tanpa-nilai', p.span, katalog.returnTanpaNilai())
        } else {
          this.periksaInisialisasi(p.ekspresi, kembali)
        }
        return
      }
    }
  }

  private periksaDeklarasiLokal(p: A.DeklarasiLokal): void {
    const dasar = this.tipeDari(p.tipeNode)
    for (const d of p.deklarator) {
      const tipe = tipeArray(dasar, d.dimensiTambahan)
      d.tipe = tipe
      if (this.cariLokal(d.nama)) {
        this.lapor('sudah-didefinisikan', d.spanNama, katalog.sudahDidefinisikan(d.nama, this.namaMethodJavac()))
      }
      const info = this.deklarasiLokal(d.nama, tipe, p.final, false, d.spanNama)
      info.punyaInit = d.init !== undefined
      d.info = info
      if (d.init) {
        this.periksaInisialisasi(d.init, tipe)
        if (p.final && d.init.konstan !== undefined && (tipe.k === 'primitif' || adalahString(tipe)) && !adalahError(d.init.tipe!)) {
          info.konstan = konversiKonstan(d.init.konstan, d.init.tipe!, tipe)
        }
      }
    }
  }

  private periksaForEach(p: A.ForEach): void {
    const tipeIter = this.ekspresi(p.iterable)
    const tipeVar = this.tipeDari(p.tipeNode)
    this.masukLingkup()
    if (this.cariLokal(p.nama)) this.lapor('sudah-didefinisikan', p.spanNama, katalog.sudahDidefinisikan(p.nama, this.namaMethodJavac()))
    p.info = this.deklarasiLokal(p.nama, tipeVar, p.final, false, p.spanNama)
    p.info.punyaInit = true
    if (!adalahError(tipeIter)) {
      if (tipeIter.k !== 'array') this.lapor('foreach-tidak-berlaku', p.iterable.span, katalog.foreachTidakBerlaku(teksTipe(tipeIter)))
      else this.cekKonversi(tipeIter.elemen, tipeVar, undefined, p.iterable.span)
    }
    this.ctx.kedalamanLoop++
    this.periksaBadan(p.badan)
    this.ctx.kedalamanLoop--
    this.keluarLingkup()
  }

  private periksaSwitch(p: A.Switch): void {
    const t = this.ekspresi(p.selektor)
    const bolehSelektor =
      adalahError(t) || adalahString(t) || (t.k === 'primitif' && ['int', 'char', 'short', 'byte'].includes(t.nama))
    if (!bolehSelektor) this.lapor('selektor-switch', p.spanSelektor, katalog.selektorSwitch(teksTipe(t)))
    const terlihat = new Set<string>()
    let adaDefault = false
    this.masukLingkup()
    this.ctx.kedalamanSwitch++
    for (const g of p.grup) {
      for (const l of g.label) {
        if (l === 'default') {
          if (adaDefault) this.lapor('case-duplikat', g.span, { ...katalog.caseDuplikat(), pesan: 'duplicate default label' })
          adaDefault = true
          continue
        }
        const tl = this.ekspresi(l)
        if (adalahError(tl) || adalahError(t)) continue
        // Seperti javac: kecocokan tipe dicek dulu (`case nilai > 70` → boolean vs int), baru syarat konstanta.
        if (!adalahString(t) && !adalahString(tl) && cekAssign(tl, t, l.konstan) === 'tidak-cocok') {
          this.lapor('tipe-tidak-cocok', l.span, katalog.tipeTidakCocok(teksTipe(tl), teksTipe(t)))
          continue
        }
        if (l.konstan === undefined) {
          this.lapor('butuh-konstanta', l.span, katalog.butuhKonstanta())
          continue
        }
        if (adalahString(t) !== adalahString(tl) || (!adalahString(t) && cekAssign(tl, t, l.konstan) !== 'ok')) {
          this.lapor('label-case', l.span, cekAssign(tl, t, l.konstan) === 'lossy' && !adalahString(t)
            ? katalog.konversiLossy(teksTipe(tl), teksTipe(t), this.diag.teks(l.span))
            : katalog.labelCaseTidakCocok(teksTipe(tl), teksTipe(t)))
          continue
        }
        const kunci = String(adalahString(t) ? l.konstan : konversiKonstan(l.konstan, tl, t))
        if (terlihat.has(kunci)) this.lapor('case-duplikat', l.span, katalog.caseDuplikat())
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
  }

  private kondisi(e: A.Ekspresi): void {
    const t = this.ekspresi(e)
    if (!adalahError(t) && !adalahBoolean(t)) this.lapor('tipe-tidak-cocok', e.span, katalog.tipeTidakCocok(teksTipe(t), 'boolean'))
  }

  /** Periksa ekspresi dalam konteks assignment ke tipe `ke` (termasuk inisialisasi array). */
  private periksaInisialisasi(e: A.Ekspresi, ke: Tipe): void {
    if (e.jenis === 'InisialisasiArray') {
      this.inisialisasiArray(e, ke)
      return
    }
    const t = this.ekspresi(e)
    this.cekKonversi(t, ke, e.konstan, e.span)
  }

  private inisialisasiArray(e: A.InisialisasiArray, ke: Tipe): void {
    if (adalahError(ke)) {
      for (const x of e.elemen) if (x.jenis !== 'InisialisasiArray') this.ekspresi(x)
      e.tipe = T.error
      return
    }
    if (ke.k !== 'array') {
      this.lapor('inisialisasi-ilegal', e.span, {
        pesan: `illegal initializer for ${teksTipe(ke)}`,
        artinya: `Bentuk {…} hanya untuk array, sedangkan tipe tujuannya ${teksTipe(ke)}.`,
      })
      e.tipe = T.error
      return
    }
    e.tipe = ke
    for (const x of e.elemen) this.periksaInisialisasi(x, ke.elemen)
  }

  private cekKonversi(dari: Tipe, ke: Tipe, konstan: A.NilaiKonstan | undefined, span: Span): void {
    if (adalahError(dari) || adalahError(ke)) return
    if (dari.k === 'void') {
      this.lapor('tipe-tidak-cocok', span, katalog.tipeTidakCocok('void', teksTipe(ke)))
      return
    }
    const narrowing = typeof konstan === 'number' ? konstan : undefined
    const hasil = cekAssign(dari, ke, narrowing)
    if (hasil === 'lossy') this.lapor('konversi-lossy', span, katalog.konversiLossy(teksTipe(dari), teksTipe(ke), this.diag.teks(span)))
    else if (hasil === 'tidak-cocok') this.lapor('tipe-tidak-cocok', span, katalog.tipeTidakCocok(teksTipe(dari), teksTipe(ke)))
  }

  // ---------- ekspresi ----------
  private ekspresi(e: A.Ekspresi): Tipe {
    const t = this.ekspresiInti(e)
    e.tipe = t
    return t
  }

  private ekspresiInti(e: A.Ekspresi): Tipe {
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
        return this.panggil(e)
      case 'BaruArray':
        return this.baruArray(e)
      case 'BaruObjek':
        return this.baruObjek(e)
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
        return this.kondisional(e)
      case 'Cast':
        return this.cast(e)
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

  private adalahNamaKelas(nama: string): boolean {
    return nama === this.kelas.nama || kelasPustaka(nama) !== undefined || KELAS_FASE_2.has(nama)
  }

  private namaTerlihat(): string[] {
    const hasil = new Set<string>()
    for (const l of this.ctx.lingkup) for (const k of l.keys()) hasil.add(k)
    for (const k of this.field.keys()) hasil.add(k)
    return [...hasil]
  }

  /** Untuk `Sytem.out.println(...)`: javac menganggap nama tak dikenal di depan dua titik sebagai package. */
  private cekPaket(objek: A.Ekspresi): boolean {
    if (objek.jenis !== 'AksesField' || objek.objek.jenis !== 'Nama') return false
    const n = objek.objek.nama
    if (this.cariLokal(n) || this.field.has(n) || this.adalahNamaKelas(n)) return false
    const mirip = saranMirip(n, ['System', 'Math', 'String', 'Integer', 'Double', 'Character', 'Arrays', this.kelas.nama])
    this.lapor('paket-tidak-ada', objek.objek.span, katalog.paketTidakAda(n, mirip))
    return true
  }

  private nama(e: A.Nama): Tipe {
    const lokal = this.cariLokal(e.nama)
    if (lokal) {
      e.ikatan = { k: 'lokal', info: lokal }
      if (lokal.konstan !== undefined) e.konstan = lokal.konstan
      return lokal.tipe
    }
    const f = this.field.get(e.nama)
    if (f) {
      e.ikatan = { k: 'field', field: f }
      if (!f.statik && this.ctx.statik) this.lapor('konteks-statik-variabel', e.span, katalog.konteksStatikVariabel(e.nama))
      if (f.konstan !== undefined) e.konstan = f.konstan
      return f.tipe
    }
    const isi = katalog.simbolTidakDitemukan('variable', e.nama, `class ${this.kelas.nama}`)
    const mirip = saranMirip(e.nama, this.namaTerlihat())
    this.lapor('simbol-tidak-ditemukan', e.span, mirip ? { ...isi, saran: `Mungkin maksudmu \`${mirip}\`? Java membedakan huruf besar dan kecil.` } : isi)
    return T.error
  }

  /** Nama kelas sebagai kualifier (mis. `Math` pada `Math.max`), atau undefined bila ekspresi biasa. */
  private kualifierKelas(e: A.Ekspresi): string | undefined {
    if (e.jenis !== 'Nama') return undefined
    if (this.cariLokal(e.nama) || this.field.has(e.nama)) return undefined
    if (!this.adalahNamaKelas(e.nama)) return undefined
    e.ikatan = { k: 'kelas', nama: e.nama }
    e.tipe = { k: 'kelas', nama: e.nama }
    return e.nama
  }

  private lokasiObjek(objek: A.Ekspresi, tipe: Tipe): string {
    if (objek.jenis === 'Nama' && objek.ikatan?.k === 'lokal') return `variable ${objek.nama} of type ${teksTipe(tipe)}`
    return `class ${teksTipe(tipe)}`
  }

  private aksesField(e: A.AksesField): Tipe {
    if (this.cekPaket(e.objek)) return T.error
    const kelasQ = this.kualifierKelas(e.objek)
    if (kelasQ !== undefined) {
      if (kelasQ === this.kelas.nama) {
        const f = this.field.get(e.nama)
        if (f) {
          e.ikatan = { k: 'field', field: f }
          if (!f.statik) this.lapor('konteks-statik-variabel', e.spanNama, katalog.konteksStatikVariabel(e.nama))
          if (f.konstan !== undefined) e.konstan = f.konstan
          return f.tipe
        }
      } else if (KELAS_FASE_2.has(kelasQ) && !kelasPustaka(kelasQ)) {
        this.lapor('belum-didukung', e.objek.span, katalog.belumDidukung(`Class ${kelasQ}`))
        return T.error
      } else {
        const fp = kelasPustaka(kelasQ)?.field.get(e.nama)
        if (fp) {
          e.ikatan = { k: 'field-pustaka', id: fp.id }
          if (fp.konstan !== undefined) e.konstan = fp.konstan
          return fp.tipe
        }
      }
      this.lapor('simbol-tidak-ditemukan', e.spanNama, katalog.simbolTidakDitemukan('variable', e.nama, `class ${kelasQ}`))
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
    this.lapor('simbol-tidak-ditemukan', e.spanNama, {
      ...katalog.simbolTidakDitemukan('variable', e.nama, this.lokasiObjek(e.objek, t)),
      saran: adalahString(t) && e.nama === 'length' ? 'Untuk String, length adalah method: tulis teks.length() dengan tanda kurung.' : undefined,
    })
    return T.error
  }

  private aksesArray(e: A.AksesArray): Tipe {
    const ta = this.ekspresi(e.array)
    const ti = this.ekspresi(e.indeks)
    if (!adalahError(ti)) {
      const p = promosiUnary(ti)
      if (!adalahNumerik(ti)) this.lapor('tipe-tidak-cocok', e.indeks.span, katalog.tipeTidakCocok(teksTipe(ti), 'int'))
      else if (!samaTipe(p, T.int)) this.lapor('konversi-lossy', e.indeks.span, katalog.konversiLossy(teksTipe(ti), 'int', this.diag.teks(e.indeks.span)))
    }
    if (adalahError(ta)) return T.error
    if (ta.k !== 'array') {
      this.lapor('butuh-array', e.span, katalog.butuhArray(teksTipe(ta)))
      return T.error
    }
    return ta.elemen
  }

  // ---------- pemanggilan method ----------
  private panggil(e: A.PanggilMethod): Tipe {
    let kelasQ: string | undefined
    let tipeObjek: Tipe | undefined
    if (e.objek) {
      if (this.cekPaket(e.objek)) {
        e.argumen.forEach((a) => this.ekspresi(a))
        return T.error
      }
      kelasQ = this.kualifierKelas(e.objek)
      if (kelasQ === undefined) tipeObjek = this.ekspresi(e.objek)
    }
    const argTipe = e.argumen.map((a) => this.ekspresi(a))
    const teksArg = argTipe.map(teksTipe).join(',')
    if (argTipe.some(adalahError)) return this.tipeKembaliSaatError(e, kelasQ, tipeObjek)

    // Method milik class Main.
    if ((!e.objek || kelasQ === this.kelas.nama)) {
      const kandidat = this.method.get(e.nama)
      if (!kandidat) {
        const isi = katalog.simbolTidakDitemukan('method', `${e.nama}(${teksArg})`, `class ${this.kelas.nama}`)
        const mirip = saranMirip(e.nama, [...this.method.keys()])
        const salahTempat = ['println', 'print', 'printf'].includes(e.nama)
        this.lapor('simbol-tidak-ditemukan', e.spanNama, {
          ...isi,
          saran: salahTempat
            ? `Untuk mencetak, tulis lengkap: \`System.out.${e.nama}(...)\`.`
            : mirip
              ? `Mungkin maksudmu \`${mirip}\`?`
              : 'Pastikan method sudah dibuat di dalam class dan ejaannya sama persis.',
        })
        return T.error
      }
      const pilih = this.pilihOverload(kandidat.map((m) => ({ parameter: m.parameter, varargs: m.varargs, ref: m })), argTipe)
      if (!pilih.hasil) {
        this.laporTidakCocok(e, kandidat.map((m) => ({ parameter: m.parameter, varargs: m.varargs })), argTipe, pilih.ambigu, this.kelas.nama)
        return T.error
      }
      const m = pilih.hasil.ref as A.SimbolMethod
      if (!m.statik && this.ctx.statik) {
        this.lapor('konteks-statik-method', e.spanNama, katalog.konteksStatikMethod(m.tandaTangan))
      }
      e.target = { k: 'user', method: m }
      e.pakaiVarargs = pilih.varargs
      return m.kembali
    }

    // Method pustaka statik (Math.max, Integer.parseInt, Arrays.toString, …) atau instance (String, Scanner, PrintStream).
    let namaKelas: string
    let statik: boolean
    if (kelasQ !== undefined) {
      if (KELAS_FASE_2.has(kelasQ) && !kelasPustaka(kelasQ)) {
        this.lapor('belum-didukung', e.objek!.span, katalog.belumDidukung(`Class ${kelasQ}`))
        return T.error
      }
      if (KELAS_JAVA_UTIL.has(kelasQ) && !this.imporUtil.has(kelasQ)) {
        this.lapor('simbol-tidak-ditemukan', e.objek!.span, katalog.simbolTidakDitemukan('variable', kelasQ, `class ${this.kelas.nama}`))
        return T.error
      }
      namaKelas = kelasQ
      statik = true
    } else {
      const t = tipeObjek!
      if (adalahError(t)) return T.error
      if (t.k === 'primitif') {
        this.lapor('dereference-primitif', e.spanNama, katalog.dereferencePrimitif(t.nama))
        return T.error
      }
      if (t.k === 'array' || t.k === 'null') {
        this.lapor('simbol-tidak-ditemukan', e.spanNama, {
          ...katalog.simbolTidakDitemukan('method', `${e.nama}(${teksArg})`, this.lokasiObjek(e.objek!, t)),
          saran: t.k === 'array' && e.nama === 'length' ? 'Untuk array, length adalah field: tulis arr.length tanpa tanda kurung.' : undefined,
        })
        return T.error
      }
      namaKelas = (t as { nama: string }).nama
      statik = false
    }
    const kelas = kelasPustaka(namaKelas)
    const kandidat = statik ? kelas?.statik.get(e.nama) : (kelas?.instance.get(e.nama) ?? kelasPustaka('Object')?.instance.get(e.nama))
    if (!kandidat) {
      const instanceSalah = statik && kelas?.instance.get(e.nama)
      if (instanceSalah) {
        this.lapor('konteks-statik-method', e.spanNama, katalog.konteksStatikMethod(`${e.nama}(${instanceSalah[0].parameter.map(teksTipe).join(',')})`))
        return T.error
      }
      const lokasi = statik ? `class ${namaKelas}` : this.lokasiObjek(e.objek!, tipeObjek!)
      const semuaNama = [...(statik ? kelas?.statik.keys() ?? [] : kelas?.instance.keys() ?? [])]
      const mirip = saranMirip(e.nama, semuaNama)
      const isi = katalog.simbolTidakDitemukan('method', `${e.nama}(${teksArg})`, lokasi)
      this.lapor('simbol-tidak-ditemukan', e.spanNama, mirip ? { ...isi, saran: `Mungkin maksudmu \`${mirip}\`?` } : isi)
      return T.error
    }
    const pilih = this.pilihOverload(kandidat.map((m) => ({ parameter: m.parameter, varargs: m.varargs, ref: m })), argTipe)
    if (!pilih.hasil) {
      this.laporTidakCocok(e, kandidat.map((m) => ({ parameter: m.parameter, varargs: m.varargs })), argTipe, pilih.ambigu, namaKelas)
      return T.error
    }
    const mp = pilih.hasil.ref as MethodPustaka
    // `Arrays.copyOf(T[], …)` generik: hasilnya bertipe sama dengan array argumen (mis. String[]).
    const kembali = mp.id.startsWith('Arrays.copyOf') && mp.parameter[0].k === 'array' && adalahReferensi(mp.parameter[0].elemen) ? argTipe[0] : mp.kembali
    e.target = { k: 'pustaka', id: mp.id, parameter: mp.parameter, kembali, statik: mp.statik, varargs: mp.varargs }
    e.pakaiVarargs = pilih.varargs
    return kembali
  }

  private tipeKembaliSaatError(e: A.PanggilMethod, kelasQ: string | undefined, tipeObjek: Tipe | undefined): Tipe {
    // Tebak tipe kembali bila hanya ada satu kandidat, agar error tidak berantai.
    if (!e.objek || kelasQ === this.kelas.nama) {
      const k = this.method.get(e.nama)
      return k && k.length === 1 ? k[0].kembali : T.error
    }
    const nama = kelasQ ?? (tipeObjek && tipeObjek.k === 'kelas' ? tipeObjek.nama : undefined)
    if (!nama) return T.error
    const kls = kelasPustaka(nama)
    const k = kelasQ ? kls?.statik.get(e.nama) : kls?.instance.get(e.nama)
    if (k && k.every((x) => samaTipe(x.kembali, k[0].kembali))) return k[0].kembali
    return T.error
  }

  private pilihOverload<R>(
    kandidat: { parameter: Tipe[]; varargs: boolean; ref: R }[],
    arg: Tipe[],
  ): { hasil?: { parameter: Tipe[]; varargs: boolean; ref: R }; ambigu?: boolean; varargs?: boolean } {
    const fase = (cocok: (dari: Tipe, ke: Tipe) => boolean) =>
      kandidat.filter((k) => k.parameter.length === arg.length && arg.every((a, i) => cocok(a, k.parameter[i])))
    let berlaku = fase(bisaKonversiMethod)
    let pakaiVarargs = false
    if (berlaku.length === 0) berlaku = fase(bisaKonversiLonggar)
    if (berlaku.length === 0) {
      pakaiVarargs = true
      berlaku = kandidat.filter((k) => {
        if (!k.varargs) return false
        const n = k.parameter.length
        if (arg.length < n - 1) return false
        const elemen = (k.parameter[n - 1] as { elemen: Tipe }).elemen
        return arg.every((a, i) => bisaKonversiLonggar(a, i < n - 1 ? k.parameter[i] : elemen))
      })
    }
    if (berlaku.length === 0) return {}
    if (berlaku.length === 1) return { hasil: berlaku[0], varargs: pakaiVarargs }
    const lebihSpesifik = (a: Tipe[], b: Tipe[]) => a.every((t, i) => bisaKonversiMethod(t, b[i]))
    const maksimal = berlaku.filter((k) => berlaku.every((l) => l === k || lebihSpesifik(k.parameter, l.parameter)))
    if (maksimal.length === 1) return { hasil: maksimal[0], varargs: pakaiVarargs }
    return { ambigu: true }
  }

  private laporTidakCocok(
    e: A.PanggilMethod,
    kandidat: { parameter: Tipe[]; varargs: boolean }[],
    arg: Tipe[],
    ambigu: boolean | undefined,
    namaKelas: string,
  ): void {
    const teksArg = arg.map(teksTipe).join(',')
    if (ambigu) {
      this.lapor('referensi-ambigu', e.spanNama, katalog.referensiAmbigu(e.nama))
      return
    }
    if (kandidat.length > 1) {
      this.lapor('tidak-ada-method-cocok', e.spanNama, katalog.tidakAdaMethodCocok(e.nama, teksArg))
      return
    }
    const k = kandidat[0]
    const butuh = k.parameter.map(teksTipe).join(',')
    let alasan = 'actual and formal argument lists differ in length'
    if (k.parameter.length === arg.length) {
      const i = arg.findIndex((a, idx) => !bisaKonversiLonggar(a, k.parameter[idx]))
      const hasil = cekAssign(arg[i], k.parameter[i])
      alasan =
        hasil === 'lossy'
          ? `argument mismatch; possible lossy conversion from ${teksTipe(arg[i])} to ${teksTipe(k.parameter[i])}`
          : `argument mismatch; ${teksTipe(arg[i])} cannot be converted to ${teksTipe(k.parameter[i])}`
    }
    const isi =
      namaKelas === this.kelas.nama
        ? katalog.methodTidakCocok(e.nama, butuh, teksArg, alasan)
        : katalog.methodPustakaTidakCocok(e.nama, namaKelas, butuh, teksArg, alasan)
    this.lapor('method-tidak-cocok', e.spanNama, isi)
  }

  private baruArray(e: A.BaruArray): Tipe {
    const dasar = this.tipeDari(e.elemen)
    for (const d of e.dimensi) {
      const t = this.ekspresi(d)
      if (adalahError(t)) continue
      if (!adalahNumerik(t)) this.lapor('tipe-tidak-cocok', d.span, katalog.tipeTidakCocok(teksTipe(t), 'int'))
      else if (!samaTipe(promosiUnary(t), T.int)) this.lapor('konversi-lossy', d.span, katalog.konversiLossy(teksTipe(t), 'int', this.diag.teks(d.span)))
    }
    if (adalahError(dasar)) return T.error
    const tipe = tipeArray(dasar, e.dimensi.length + e.dimensiKosong)
    if (e.init) this.inisialisasiArray(e.init, tipe)
    return tipe
  }

  private baruObjek(e: A.BaruObjek): Tipe {
    const argTipe = e.argumen.map((a) => this.ekspresi(a))
    const tipe = this.tipeDari(e.tipeNode)
    if (adalahError(tipe) || argTipe.some(adalahError)) return adalahError(tipe) ? T.error : tipe
    const nama = (tipe as { nama: string }).nama
    const kelas = tipe.k === 'kelas' ? kelasPustaka(nama) : undefined
    if (!kelas || kelas.konstruktor.length === 0) {
      this.lapor('belum-didukung', e.span, katalog.pemanggilanKonstruktor(teksTipe(tipe)))
      return T.error
    }
    const pilih = this.pilihOverload(kelas.konstruktor.map((m) => ({ parameter: m.parameter, varargs: false, ref: m })), argTipe)
    if (!pilih.hasil) {
      const teksArg = argTipe.map(teksTipe).join(',')
      this.lapor('tidak-ada-method-cocok', e.span, {
        ...katalog.tidakAdaMethodCocok(nama, teksArg),
        pesan: `no suitable constructor found for ${nama}(${teksArg})`,
        saran: nama === 'Scanner' ? 'Tulis new Scanner(System.in) untuk membaca input.' : undefined,
      })
      return T.error
    }
    const mp = pilih.hasil.ref as MethodPustaka
    e.target = { k: 'pustaka', id: mp.id, parameter: mp.parameter, kembali: tipe, statik: true, varargs: false }
    return tipe
  }

  // ---------- operator ----------
  private unary(e: A.Unary): Tipe {
    const t = this.ekspresi(e.operand)
    if (adalahError(t)) return T.error
    const k = e.operand.konstan
    if (e.op === '!') {
      if (!adalahBoolean(t)) {
        this.lapor('operand-unary-salah', e.span, katalog.operandUnarySalah('!', teksTipe(t)))
        return T.error
      }
      if (k !== undefined) e.konstan = !k
      return T.boolean
    }
    if (e.op === '~' ? !adalahIntegral(t) : !adalahNumerik(t)) {
      this.lapor('operand-unary-salah', e.span, katalog.operandUnarySalah(e.op, teksTipe(t)))
      return T.error
    }
    const hasil = promosiUnary(t) as { k: 'primitif'; nama: NamaPrimitif }
    if (k !== undefined) {
      const v = konversiPrimitif(k as number | bigint, (t as { nama: NamaPrimitif }).nama, hasil.nama)
      e.konstan = (e.op === '+' ? v : e.op === '-' ? negasi(v, hasil.nama) : bitNot(v, hasil.nama)) as A.NilaiKonstan
    }
    return hasil
  }

  /** Pastikan ekspresi adalah variabel yang bisa diubah; laporkan error bila tidak. */
  private cekTargetVariabel(target: A.Ekspresi, tipe: Tipe): boolean {
    if (adalahError(tipe)) return false
    if (target.jenis === 'Nama' && target.ikatan?.k === 'lokal') {
      return true
    }
    if ((target.jenis === 'Nama' || target.jenis === 'AksesField') && target.ikatan?.k === 'field') {
      const f = target.ikatan.field
      if (f.final) {
        this.lapor('final-diubah', target.span, katalog.finalDiubah(f.nama))
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

  private cekFinalLokal(target: A.Ekspresi): void {
    if (target.jenis === 'Nama' && target.ikatan?.k === 'lokal' && target.ikatan.info.final) {
      const info = target.ikatan.info
      // Variabel final lokal tanpa nilai awal boleh diisi sekali.
      if (info.parameter || info.punyaInit) {
        this.lapor('final-diubah', target.span, katalog.finalDiubah(info.nama))
      }
    }
  }

  private incDec(e: A.IncDec): Tipe {
    const t = this.ekspresi(e.target)
    if (adalahError(t)) return T.error
    if (!adalahNumerik(t)) {
      this.lapor('operand-unary-salah', e.span, katalog.operandUnarySalah(e.op, teksTipe(t)))
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
      this.lapor('operand-biner-salah', e.span, katalog.operandBinerSalah(e.op, teksTipe(ta), teksTipe(tb)))
      return T.error
    }
    const ka = e.kiri.konstan
    const kb = e.kanan.konstan
    const op = e.op
    if (op === '+' && (adalahString(ta) || adalahString(tb))) {
      if (ta.k === 'void' || tb.k === 'void') {
        this.lapor('void-tidak-boleh', e.span, { pesan: "'void' type not allowed here", artinya: 'Method void tidak menghasilkan nilai, jadi tidak bisa digabung dengan teks.' })
        return T.error
      }
      e.tipeOperasi = T.String
      if (ka !== undefined && kb !== undefined) e.konstan = konstanKeString(ka, ta) + konstanKeString(kb, tb)
      return T.String
    }
    if (OP_ARITMETIKA.has(op)) {
      if (!adalahNumerik(ta) || !adalahNumerik(tb)) return salah()
      const hasil = promosiBiner(ta, tb) as { k: 'primitif'; nama: NamaPrimitif }
      e.tipeOperasi = hasil
      if (ka !== undefined && kb !== undefined) {
        try {
          const a = konversiPrimitif(ka as number, (ta as { nama: NamaPrimitif }).nama, hasil.nama)
          const b = konversiPrimitif(kb as number, (tb as { nama: NamaPrimitif }).nama, hasil.nama)
          e.konstan = aritmetika(op as '+', a, b, hasil.nama).nilai as A.NilaiKonstan
        } catch (err) {
          if (!(err instanceof LemparanJava)) throw err
        }
      }
      return hasil
    }
    if (op === '<<' || op === '>>' || op === '>>>') {
      if (!adalahIntegral(ta) || !adalahIntegral(tb)) return salah()
      const hasil = promosiUnary(ta) as { k: 'primitif'; nama: NamaPrimitif }
      e.tipeOperasi = hasil
      if (ka !== undefined && kb !== undefined) {
        const a = konversiPrimitif(ka as number, (ta as { nama: NamaPrimitif }).nama, hasil.nama)
        e.konstan = geser(op, a, kb as number | bigint, hasil.nama) as A.NilaiKonstan
      }
      return hasil
    }
    if (OP_RELASIONAL.has(op)) {
      if (!adalahNumerik(ta) || !adalahNumerik(tb)) return salah()
      const p = promosiBiner(ta, tb) as { k: 'primitif'; nama: NamaPrimitif }
      e.tipeOperasi = p
      if (ka !== undefined && kb !== undefined) {
        const a = konversiPrimitif(ka as number, (ta as { nama: NamaPrimitif }).nama, p.nama)
        const b = konversiPrimitif(kb as number, (tb as { nama: NamaPrimitif }).nama, p.nama)
        e.konstan = bandingkan(op as '<', a, b)
      }
      return T.boolean
    }
    if (op === '==' || op === '!=') {
      if (adalahNumerik(ta) && adalahNumerik(tb)) {
        const p = promosiBiner(ta, tb) as { k: 'primitif'; nama: NamaPrimitif }
        e.tipeOperasi = p
        if (ka !== undefined && kb !== undefined) {
          const a = konversiPrimitif(ka as number, (ta as { nama: NamaPrimitif }).nama, p.nama)
          const b = konversiPrimitif(kb as number, (tb as { nama: NamaPrimitif }).nama, p.nama)
          e.konstan = bandingkan(op, a, b)
        }
        return T.boolean
      }
      if (adalahBoolean(ta) && adalahBoolean(tb)) {
        e.tipeOperasi = T.boolean
        if (ka !== undefined && kb !== undefined) e.konstan = op === '==' ? ka === kb : ka !== kb
        return T.boolean
      }
      if (adalahReferensi(ta) && adalahReferensi(tb)) {
        if (bisaCast(ta, tb) || bisaCast(tb, ta)) {
          e.tipeOperasi = T.Object
          return T.boolean
        }
        this.lapor('tak-terbandingkan', e.span, katalog.takTerbandingkan(teksTipe(ta), teksTipe(tb)))
        return T.error
      }
      if (adalahPrimitif(ta) && adalahPrimitif(tb)) {
        this.lapor('tak-terbandingkan', e.span, katalog.takTerbandingkan(teksTipe(ta), teksTipe(tb)))
        return T.error
      }
      return salah()
    }
    if (op === '&&' || op === '||') {
      if (!adalahBoolean(ta) || !adalahBoolean(tb)) return salah()
      e.tipeOperasi = T.boolean
      if (ka !== undefined && kb !== undefined) e.konstan = op === '&&' ? (ka as boolean) && (kb as boolean) : (ka as boolean) || (kb as boolean)
      return T.boolean
    }
    // & | ^
    if (adalahBoolean(ta) && adalahBoolean(tb)) {
      e.tipeOperasi = T.boolean
      if (ka !== undefined && kb !== undefined) e.konstan = operasiBit(op as '&', ka as boolean, kb as boolean, 'boolean') as boolean
      return T.boolean
    }
    if (adalahIntegral(ta) && adalahIntegral(tb)) {
      const p = promosiBiner(ta, tb) as { k: 'primitif'; nama: NamaPrimitif }
      e.tipeOperasi = p
      if (ka !== undefined && kb !== undefined) {
        const a = konversiPrimitif(ka as number, (ta as { nama: NamaPrimitif }).nama, p.nama)
        const b = konversiPrimitif(kb as number, (tb as { nama: NamaPrimitif }).nama, p.nama)
        e.konstan = operasiBit(op as '&', a, b, p.nama) as A.NilaiKonstan
      }
      return p
    }
    return salah()
  }

  private assign(e: A.Assign): Tipe {
    const tt = this.ekspresi(e.target)
    const tv = e.nilai.jenis === 'InisialisasiArray' ? T.error : this.ekspresi(e.nilai)
    if (adalahError(tt)) return T.error
    const variabel = this.cekTargetVariabel(e.target, tt)
    if (variabel) this.cekFinalLokal(e.target)
    if (adalahError(tv)) return tt
    if (e.op === '=') {
      this.cekKonversi(tv, tt, e.nilai.konstan, e.nilai.span)
      return tt
    }
    const op = e.op.slice(0, -1)
    if (op === '+' && adalahString(tt)) {
      if (tv.k === 'void') {
        this.lapor('void-tidak-boleh', e.nilai.span, { pesan: "'void' type not allowed here", artinya: 'Method void tidak menghasilkan nilai.' })
      }
      e.tipeOperasi = T.String
      return tt
    }
    const salah = () => {
      this.lapor('operand-biner-salah', e.span, katalog.operandBinerSalah(op, teksTipe(tt), teksTipe(tv)))
      return tt
    }
    if (OP_ARITMETIKA.has(op)) {
      if (!adalahNumerik(tt) || !adalahNumerik(tv)) return salah()
      e.tipeOperasi = promosiBiner(tt, tv)
      return tt
    }
    if (op === '<<' || op === '>>' || op === '>>>') {
      if (!adalahIntegral(tt) || !adalahIntegral(tv)) return salah()
      e.tipeOperasi = promosiUnary(tt)
      return tt
    }
    if (adalahBoolean(tt) && adalahBoolean(tv)) {
      e.tipeOperasi = T.boolean
      return tt
    }
    if (adalahIntegral(tt) && adalahIntegral(tv)) {
      e.tipeOperasi = promosiBiner(tt, tv)
      return tt
    }
    return salah()
  }

  private kondisional(e: A.Kondisional): Tipe {
    this.kondisi(e.kondisi)
    const ta = this.ekspresi(e.ya)
    const tb = this.ekspresi(e.tidak)
    if (adalahError(ta) || adalahError(tb)) return T.error
    let hasil: Tipe
    if (samaTipe(ta, tb)) hasil = ta
    else if (adalahNumerik(ta) && adalahNumerik(tb)) {
      const muat = (t: Tipe, k: A.NilaiKonstan | undefined, sasaran: Tipe) =>
        samaTipe(t, T.int) && typeof k === 'number' && cekAssign(T.int, sasaran, k) === 'ok'
      if (['byte', 'short', 'char'].includes((ta as { nama: string }).nama) && muat(tb, e.tidak.konstan, ta)) hasil = ta
      else if (['byte', 'short', 'char'].includes((tb as { nama: string }).nama) && muat(ta, e.ya.konstan, tb)) hasil = tb
      else hasil = promosiBiner(ta, tb)
    } else if (ta.k === 'null' && adalahReferensi(tb)) hasil = tb
    else if (tb.k === 'null' && adalahReferensi(ta)) hasil = ta
    else if (adalahBoolean(ta) && adalahBoolean(tb)) hasil = T.boolean
    else hasil = T.Object
    const k = e.kondisi.konstan
    if (k !== undefined && e.ya.konstan !== undefined && e.tidak.konstan !== undefined) {
      const dipilih = k ? e.ya : e.tidak
      e.konstan = konversiKonstan(dipilih.konstan!, dipilih.tipe!, hasil)
    }
    return hasil
  }

  private cast(e: A.Cast): Tipe {
    const ke = this.tipeDari(e.tipeNode)
    const dari = this.ekspresi(e.ekspresi)
    if (adalahError(ke) || adalahError(dari)) return adalahError(ke) ? T.error : ke
    if (!bisaCast(dari, ke)) {
      this.lapor('tipe-tidak-cocok', e.span, katalog.tipeTidakCocok(teksTipe(dari), teksTipe(ke)))
      return ke
    }
    if (e.ekspresi.konstan !== undefined && (ke.k === 'primitif' || adalahString(ke))) {
      e.konstan = konversiKonstan(e.ekspresi.konstan, dari, ke)
    }
    return ke
  }
}
