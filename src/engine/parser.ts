import type * as A from './ast'
import { katalog, type IsiPesan, type PengumpulDiagnostik } from './diagnostik'
import type { Token } from './lexer'
import type { Span } from './sumber'
import type { NamaPrimitif } from './tipe'

class GagalParse extends Error {}

const PRIMITIF = new Set(['byte', 'short', 'int', 'long', 'float', 'double', 'char', 'boolean'])
const MODIFIER = new Set([
  'public', 'private', 'protected', 'static', 'final', 'abstract', 'native', 'synchronized', 'transient',
  'volatile', 'strictfp', 'default',
])
const OP_ASSIGN = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>='])
const PRESEDENSI: Record<string, number> = {
  '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7,
  '<<': 8, '>>': 8, '>>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10,
}

export function parse(token: Token[], diag: PengumpulDiagnostik): A.UnitKompilasi {
  return new Parser(token, diag).unit()
}

class Parser {
  private i = 0
  private id = 1
  /** Riwayat perubahan token (pemecahan `>>` pada generik) agar bisa dipulihkan saat parsing spekulatif. */
  private perubahan: { i: number; tk: Token }[] = []
  /** true saat mengurai label `case` (tanda `->` setelah label bukan lambda). */
  private dalamLabelCase = false

  constructor(
    private readonly tok: Token[],
    private readonly diag: PengumpulDiagnostik,
  ) {}

  private titikSimpan() {
    return { i: this.i, id: this.id, perubahan: this.perubahan.length, diag: this.diag.daftar.length }
  }

  private pulihkan(s: ReturnType<Parser['titikSimpan']>): void {
    while (this.perubahan.length > s.perubahan) {
      const p = this.perubahan.pop()!
      this.tok[p.i] = p.tk
    }
    this.i = s.i
    this.id = s.id
    this.diag.daftar.length = s.diag
  }

  // ---------- utilitas ----------
  private get t(): Token {
    return this.tok[this.i]
  }
  private lihat(k: number): Token {
    return this.tok[Math.min(this.i + k, this.tok.length - 1)]
  }
  private get sebelumnya(): Token {
    return this.tok[Math.max(0, this.i - 1)]
  }
  private adalah(teks: string, tk: Token = this.t): boolean {
    return (tk.jenis === 'op' || tk.jenis === 'kunci') && tk.teks === teks
  }
  private adalahIdent(tk: Token = this.t): boolean {
    return tk.jenis === 'ident'
  }
  private get eof(): boolean {
    return this.t.jenis === 'eof'
  }
  private ambil(): Token {
    const tk = this.t
    if (tk.jenis !== 'eof') this.i++
    return tk
  }
  private nodeId(): number {
    return this.id++
  }
  private spanDari(awal: number): Span {
    return { awal, akhir: Math.max(awal, this.sebelumnya.akhir) }
  }

  private gagal(kode: string, span: Span, isi: IsiPesan): never {
    this.diag.tambah(kode, span, isi)
    throw new GagalParse()
  }

  /** Error "X expected" dilaporkan di akhir token sebelumnya, sama seperti javac. */
  private gagalDiharapkan(teks: string): never {
    const posisi = this.i > 0 ? this.sebelumnya.akhir : this.t.awal
    const span = { awal: posisi, akhir: posisi }
    if (this.eof) this.gagal('akhir-file', span, katalog.akhirFile())
    if (teks === ';') this.gagal('titik-koma', span, katalog.titikKoma())
    if (teks === '<identifier>') this.gagal('identifier-diharapkan', span, katalog.identifierDiharapkan())
    this.gagal('token-diharapkan', span, katalog.tokenDiharapkan(teks))
  }

  private harap(teks: string): Token {
    if (this.adalah(teks)) return this.ambil()
    this.gagalDiharapkan(teks)
  }

  private harapIdent(): Token {
    if (this.adalahIdent()) return this.ambil()
    this.gagalDiharapkan('<identifier>')
  }

  private belumDidukung(span: Span, fitur: string, alternatif?: string): never {
    this.gagal('belum-didukung', span, katalog.belumDidukung(fitur, alternatif))
  }

  // ---------- tingkat file & class ----------
  unit(): A.UnitKompilasi {
    const hasil: A.UnitKompilasi = { impor: [], kelas: [] }
    try {
      if (this.adalah('package')) {
        this.ambil()
        this.namaBertitik()
        this.harap(';')
      }
      while (this.adalah('import')) hasil.impor.push(this.impor())
      while (!this.eof) {
        if (this.adalah(';')) {
          this.ambil()
          continue
        }
        hasil.kelas.push(this.kelas())
      }
    } catch (e) {
      if (!(e instanceof GagalParse)) throw e
    }
    return hasil
  }

  private namaBertitik(): string {
    let nama = this.harapIdent().teks
    while (this.adalah('.') && this.adalahIdent(this.lihat(1))) {
      this.ambil()
      nama += '.' + this.ambil().teks
    }
    return nama
  }

  private impor(): A.Impor {
    const awal = this.ambil().awal
    let statik = false
    if (this.adalah('static')) {
      this.ambil()
      statik = true
    }
    let nama = this.harapIdent().teks
    let wildcard = false
    while (this.adalah('.')) {
      this.ambil()
      if (this.adalah('*')) {
        this.ambil()
        wildcard = true
        break
      }
      nama += '.' + this.harapIdent().teks
    }
    this.harap(';')
    return { id: this.nodeId(), span: this.spanDari(awal), nama, wildcard, statik }
  }

  private modifier(): string[] {
    const hasil: string[] = []
    for (;;) {
      if (this.t.jenis === 'kunci' && MODIFIER.has(this.t.teks)) {
        hasil.push(this.ambil().teks)
        continue
      }
      if (this.adalah('@')) {
        // Anotasi (mis. @SuppressWarnings) dilewati.
        this.ambil()
        if (this.adalah('interface')) this.belumDidukung(this.spanDari(this.sebelumnya.awal), 'Deklarasi anotasi')
        this.namaBertitik()
        if (this.adalah('(')) this.lewatiSeimbang('(', ')')
        continue
      }
      return hasil
    }
  }

  private lewatiSeimbang(buka: string, tutup: string): void {
    let kedalaman = 0
    do {
      if (this.adalah(buka)) kedalaman++
      else if (this.adalah(tutup)) kedalaman--
      if (this.eof) this.gagalDiharapkan(tutup)
      this.ambil()
    } while (kedalaman > 0)
  }

  private kelas(): A.DeklarasiKelas {
    const awal = this.t.awal
    const modifier = this.modifier()
    if (this.adalah('interface') || this.adalah('enum') || this.adalah('record')) {
      this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, `Deklarasi ${this.t.teks}`, 'Gunakan class Main dengan method static.')
    }
    if (!this.adalah('class')) {
      if (this.adalahIdent() && this.t.teks === 'record') this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Deklarasi record')
      this.gagal('class-diharapkan', { awal: this.t.awal, akhir: this.t.akhir }, katalog.kelasDiharapkan())
    }
    this.ambil()
    const namaTok = this.harapIdent()
    if (this.adalah('extends') || this.adalah('implements')) {
      this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Pewarisan (extends/implements)', 'Pewarisan akan dibahas di Modul 2.')
    }
    if (this.adalah('<')) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Class generik')
    this.harap('{')
    const kelas: A.DeklarasiKelas = {
      id: this.nodeId(),
      span: { awal, akhir: awal },
      nama: namaTok.teks,
      spanNama: { awal: namaTok.awal, akhir: namaTok.akhir },
      modifier,
      field: [],
      method: [],
      anggota: [],
    }
    while (!this.adalah('}')) {
      if (this.eof) this.gagalDiharapkan('}')
      this.anggota(kelas)
    }
    this.ambil()
    kelas.span = this.spanDari(awal)
    return kelas
  }

  private anggota(kelas: A.DeklarasiKelas): void {
    if (this.adalah(';')) {
      this.ambil()
      return
    }
    const awal = this.t.awal
    const modifier = this.modifier()
    const spanT = { awal: this.t.awal, akhir: this.t.akhir }
    if (this.adalah('class') || this.adalah('interface') || this.adalah('enum')) {
      this.belumDidukung(spanT, 'Class di dalam class (nested class)', 'Class buatan sendiri akan dibahas di Modul 2.')
    }
    if (this.adalahIdent() && this.t.teks === 'record' && this.adalahIdent(this.lihat(1))) this.belumDidukung(spanT, 'Deklarasi record')
    if (this.adalah('{')) this.belumDidukung(spanT, 'Blok inisialisasi')
    if (this.adalah('<')) this.belumDidukung(spanT, 'Method generik')
    let tipeKembali: A.NodeTipe | null = null
    if (this.adalah('void')) {
      this.ambil()
    } else {
      if (this.adalahIdent() && this.adalah('(', this.lihat(1))) {
        this.belumDidukung(spanT, 'Konstruktor', 'Konstruktor akan dibahas di Modul 2 bersama class dan objek.')
      }
      tipeKembali = this.tipe()
    }
    const namaTok = this.harapIdent()
    if (this.adalah('(')) {
      const m = this.method(awal, modifier, tipeKembali, namaTok)
      kelas.method.push(m)
      kelas.anggota.push(m)
      return
    }
    if (tipeKembali === null) this.gagalDiharapkan('(')
    const deklarator = [this.deklarator(namaTok)]
    while (this.adalah(',')) {
      this.ambil()
      deklarator.push(this.deklarator(this.harapIdent()))
    }
    this.harap(';')
    const f: A.DeklarasiField = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'DeklarasiField', modifier, tipeNode: tipeKembali, deklarator }
    kelas.field.push(f)
    kelas.anggota.push(f)
  }

  private method(awal: number, modifier: string[], tipeKembali: A.NodeTipe | null, namaTok: Token): A.DeklarasiMethod {
    this.harap('(')
    const parameter: A.Parameter[] = []
    if (!this.adalah(')')) {
      for (;;) {
        parameter.push(this.parameter())
        if (!this.adalah(',')) break
        this.ambil()
      }
    }
    this.harap(')')
    while (this.adalah('[')) {
      this.ambil()
      this.harap(']')
    }
    if (this.adalah('throws')) {
      this.ambil()
      this.namaBertitik()
      while (this.adalah(',')) {
        this.ambil()
        this.namaBertitik()
      }
    }
    if (this.adalah(';')) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Method tanpa badan (abstract)')
    const badan = this.blok()
    return {
      id: this.nodeId(),
      span: this.spanDari(awal),
      jenis: 'DeklarasiMethod',
      modifier,
      tipeKembali,
      nama: namaTok.teks,
      spanNama: { awal: namaTok.awal, akhir: namaTok.akhir },
      parameter,
      badan,
      spanTutup: { awal: this.sebelumnya.awal, akhir: this.sebelumnya.akhir },
    }
  }

  private parameter(): A.Parameter {
    const awal = this.t.awal
    let final = false
    for (;;) {
      if (this.adalah('final')) {
        this.ambil()
        final = true
      } else if (this.adalah('@')) {
        this.ambil()
        this.namaBertitik()
      } else break
    }
    let tipeNode = this.tipe()
    let varargs = false
    if (this.adalah('...')) {
      this.ambil()
      varargs = true
      tipeNode = { id: this.nodeId(), span: this.spanDari(tipeNode.span.awal), jenis: 'TipeArray', elemen: tipeNode }
    }
    const namaTok = this.harapIdent()
    while (this.adalah('[')) {
      this.ambil()
      this.harap(']')
      tipeNode = { id: this.nodeId(), span: this.spanDari(tipeNode.span.awal), jenis: 'TipeArray', elemen: tipeNode }
    }
    return { id: this.nodeId(), span: this.spanDari(awal), final, tipeNode, nama: namaTok.teks, spanNama: { awal: namaTok.awal, akhir: namaTok.akhir }, varargs }
  }

  // ---------- tipe ----------
  private tipe(): A.NodeTipe {
    const awal = this.t.awal
    let t: A.NodeTipe
    if (this.t.jenis === 'kunci' && PRIMITIF.has(this.t.teks)) {
      const nama = this.ambil().teks as NamaPrimitif
      t = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'TipePrimitif', nama }
    } else if (this.adalahIdent()) {
      const nama = this.namaBertitik()
      let argumen: A.NodeTipe[] | undefined
      if (this.adalah('<')) argumen = this.argumenTipe()
      t = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'TipeNama', nama, argumen }
    } else if (this.adalah('void')) {
      this.gagal('token-diharapkan', { awal: this.t.awal, akhir: this.t.akhir }, katalog.awalTipeIlegal())
    } else {
      this.gagalDiharapkan('<identifier>')
    }
    while (this.adalah('[') && this.adalah(']', this.lihat(1))) {
      this.ambil()
      this.ambil()
      t = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'TipeArray', elemen: t }
    }
    return t
  }

  private argumenTipe(): A.NodeTipe[] {
    this.harap('<')
    const hasil: A.NodeTipe[] = []
    if (this.adalah('>')) {
      this.ambil()
      return hasil
    }
    for (;;) {
      if (this.adalah('?')) {
        this.ambil()
        if (this.adalah('extends') || this.adalah('super')) {
          this.ambil()
          hasil.push(this.tipe())
        }
      } else hasil.push(this.tipe())
      if (!this.adalah(',')) break
      this.ambil()
    }
    this.tutupSudut()
    return hasil
  }

  /** Menutup `>` generik; memecah token `>>`/`>>>` bila perlu. */
  private tutupSudut(): void {
    const tk = this.t
    if (tk.jenis === 'op' && (tk.teks === '>>' || tk.teks === '>>>' || tk.teks === '>=' || tk.teks === '>>=')) {
      this.perubahan.push({ i: this.i, tk })
      this.tok[this.i] = { ...tk, teks: tk.teks.slice(1), awal: tk.awal + 1 }
      return
    }
    this.harap('>')
  }

  /** Coba baca tipe tanpa melaporkan error; kembalikan null (dan posisi dipulihkan) bila gagal. */
  private cobaTipe(): A.NodeTipe | null {
    const simpan = this.titikSimpan()
    try {
      return this.tipe()
    } catch (e) {
      if (!(e instanceof GagalParse)) throw e
      this.pulihkan(simpan)
      return null
    }
  }

  private tampakDeklarasi(): boolean {
    if (this.t.jenis === 'kunci' && PRIMITIF.has(this.t.teks)) return !this.adalah('.', this.lihat(1))
    if (!this.adalahIdent()) return false
    const simpan = this.titikSimpan()
    const t = this.cobaTipe()
    const hasil = t !== null && this.adalahIdent()
    this.pulihkan(simpan)
    return hasil
  }

  // ---------- pernyataan ----------
  private blok(): A.Blok {
    const awal = this.t.awal
    this.harap('{')
    const pernyataan: A.Pernyataan[] = []
    while (!this.adalah('}')) {
      if (this.eof) this.gagalDiharapkan('}')
      pernyataan.push(this.pernyataan())
    }
    this.ambil()
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Blok', pernyataan }
  }

  private pernyataan(): A.Pernyataan {
    const awal = this.t.awal
    const spanT = { awal: this.t.awal, akhir: this.t.akhir }
    const tk = this.t
    if (tk.jenis === 'kunci' || tk.jenis === 'op') {
      switch (tk.teks) {
        case '{':
          return this.blok()
        case ';':
          this.ambil()
          return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Kosong' }
        case 'if':
          return this.pernyataanIf()
        case 'while': {
          this.ambil()
          this.harap('(')
          const kondisi = this.ekspresi()
          this.harap(')')
          const badan = this.pernyataan()
          return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'While', kondisi, badan }
        }
        case 'do': {
          this.ambil()
          const badan = this.pernyataan()
          const awalKondisi = this.t.awal
          this.harap('while')
          this.harap('(')
          const kondisi = this.ekspresi()
          this.harap(')')
          const spanKondisi = this.spanDari(awalKondisi)
          this.harap(';')
          return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'DoWhile', badan, kondisi, spanKondisi }
        }
        case 'for':
          return this.pernyataanFor()
        case 'switch':
          return this.pernyataanSwitch()
        case 'break':
        case 'continue': {
          this.ambil()
          if (this.adalahIdent()) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, `Label pada ${tk.teks}`)
          this.harap(';')
          return { id: this.nodeId(), span: this.spanDari(awal), jenis: tk.teks === 'break' ? 'Break' : 'Continue' }
        }
        case 'return': {
          this.ambil()
          let ekspresi: A.Ekspresi | undefined
          if (!this.adalah(';')) ekspresi = this.ekspresi()
          this.harap(';')
          return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Return', ekspresi }
        }
        case 'else':
          this.gagal('else-tanpa-if', spanT, katalog.elseTanpaIf())
          break
        case 'try':
          this.belumDidukung(spanT, 'Penanganan exception try/catch', 'try/catch akan dibahas di Modul 2.')
          break
        case 'throw':
          this.belumDidukung(spanT, 'Pernyataan throw', 'throw akan dibahas di Modul 2.')
          break
        case 'class':
        case 'interface':
        case 'enum':
          this.belumDidukung(spanT, 'Class lokal di dalam method')
          break
        case 'assert':
        case 'synchronized':
          this.belumDidukung(spanT, `Pernyataan ${tk.teks}`)
          break
        case 'final':
          return this.deklarasiLokal(true)
        case 'case':
        case 'default':
          this.gagal('awal-ekspresi-ilegal', spanT, katalog.awalEkspresiIlegal())
      }
    }
    if (this.adalahIdent() && tk.teks === 'var' && this.adalahIdent(this.lihat(1))) {
      this.belumDidukung(spanT, 'Kata kunci var', 'Simulator meminta tipe ditulis eksplisit (mis. int, double, String) agar kamu terbiasa dengan strong typing.')
    }
    if (this.adalahIdent() && tk.teks === 'yield') this.belumDidukung(spanT, 'Pernyataan yield')
    if (this.adalahIdent() && this.adalah(':', this.lihat(1))) this.belumDidukung(spanT, 'Label pernyataan')
    if (this.tampakDeklarasi()) return this.deklarasiLokal(false)
    const ekspresi = this.ekspresi()
    this.cekPernyataanEkspresi(ekspresi)
    this.harap(';')
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'PernyataanEkspresi', ekspresi }
  }

  private cekPernyataanEkspresi(e: A.Ekspresi): void {
    if (e.jenis === 'Assign' || e.jenis === 'IncDec' || e.jenis === 'PanggilMethod' || e.jenis === 'BaruObjek') return
    this.gagal('bukan-pernyataan', e.span, katalog.bukanPernyataan())
  }

  private deklarasiLokal(final: boolean, harapTitikKoma = true): A.DeklarasiLokal {
    const awal = this.t.awal
    if (final) {
      this.ambil()
      while (this.adalah('final')) this.ambil()
    }
    if (this.adalahIdent() && this.t.teks === 'var' && this.adalahIdent(this.lihat(1))) {
      this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Kata kunci var', 'Tulis tipenya secara eksplisit, mis. int atau String.')
    }
    const tipeNode = this.tipe()
    const deklarator = [this.deklarator(this.harapIdent())]
    while (this.adalah(',')) {
      this.ambil()
      deklarator.push(this.deklarator(this.harapIdent()))
    }
    if (harapTitikKoma) this.harap(';')
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'DeklarasiLokal', final, tipeNode, deklarator }
  }

  private deklarator(namaTok: Token): A.Deklarator {
    let dimensiTambahan = 0
    while (this.adalah('[')) {
      this.ambil()
      this.harap(']')
      dimensiTambahan++
    }
    let init: A.Ekspresi | undefined
    if (this.adalah('=')) {
      this.ambil()
      init = this.adalah('{') ? this.inisialisasiArray() : this.ekspresi()
    }
    return {
      id: this.nodeId(),
      span: this.spanDari(namaTok.awal),
      nama: namaTok.teks,
      spanNama: { awal: namaTok.awal, akhir: namaTok.akhir },
      dimensiTambahan,
      init,
    }
  }

  private pernyataanIf(): A.If {
    const awal = this.ambil().awal
    this.harap('(')
    const kondisi = this.ekspresi()
    this.harap(')')
    const maka = this.pernyataan()
    let lain: A.Pernyataan | undefined
    if (this.adalah('else')) {
      this.ambil()
      lain = this.pernyataan()
    }
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'If', kondisi, maka, lain }
  }

  private pernyataanFor(): A.For | A.ForEach {
    const awal = this.ambil().awal
    this.harap('(')
    // for-each: [final] Tipe nama :
    const simpan = this.titikSimpan()
    let final = false
    while (this.adalah('final')) {
      this.ambil()
      final = true
    }
    const t = this.cobaTipe()
    if (t && this.adalahIdent() && this.adalah(':', this.lihat(1))) {
      const namaTok = this.ambil()
      this.ambil()
      const iterable = this.ekspresi()
      this.harap(')')
      const badan = this.pernyataan()
      return {
        id: this.nodeId(),
        span: this.spanDari(awal),
        jenis: 'ForEach',
        final,
        tipeNode: t,
        nama: namaTok.teks,
        spanNama: { awal: namaTok.awal, akhir: namaTok.akhir },
        iterable,
        badan,
      }
    }
    this.pulihkan(simpan)
    const init: (A.DeklarasiLokal | A.PernyataanEkspresi)[] = []
    if (!this.adalah(';')) {
      if (this.adalah('final')) init.push(this.deklarasiLokal(true, false))
      else if (this.tampakDeklarasi()) init.push(this.deklarasiLokal(false, false))
      else {
        for (;;) {
          const e = this.ekspresi()
          this.cekPernyataanEkspresi(e)
          init.push({ id: this.nodeId(), span: e.span, jenis: 'PernyataanEkspresi', ekspresi: e })
          if (!this.adalah(',')) break
          this.ambil()
        }
      }
    }
    this.harap(';')
    let kondisi: A.Ekspresi | undefined
    if (!this.adalah(';')) kondisi = this.ekspresi()
    this.harap(';')
    const update: A.Ekspresi[] = []
    if (!this.adalah(')')) {
      for (;;) {
        const e = this.ekspresi()
        this.cekPernyataanEkspresi(e)
        update.push(e)
        if (!this.adalah(',')) break
        this.ambil()
      }
    }
    this.harap(')')
    const badan = this.pernyataan()
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'For', init, kondisi, update, badan }
  }

  private pernyataanSwitch(): A.Switch {
    const awal = this.ambil().awal
    const kurung = this.harap('(')
    const selektor = this.ekspresi()
    const tutup = this.harap(')')
    const spanSelektor = { awal: kurung.awal, akhir: tutup.akhir }
    this.harap('{')
    const grup: A.GrupCase[] = []
    let panah = false
    while (!this.adalah('}')) {
      if (this.eof) this.gagalDiharapkan('}')
      const awalGrup = this.t.awal
      const label: (A.Ekspresi | 'default')[] = []
      let bentukPanah = false
      // Satu grup bisa punya beberapa label: `case 1: case 2:` atau `case 1, 2 ->`.
      for (;;) {
        if (this.adalah('case')) {
          this.ambil()
          for (;;) {
            if (this.adalah('default')) {
              this.ambil()
              label.push('default')
            } else {
              // `case NAMA -> …` bukan lambda: tanda panah di sini milik switch.
              this.dalamLabelCase = true
              try {
                label.push(this.ternary())
              } finally {
                this.dalamLabelCase = false
              }
            }
            if (!this.adalah(',')) break
            this.ambil()
          }
        } else if (this.adalah('default')) {
          this.ambil()
          label.push('default')
        } else {
          this.gagal('token-diharapkan', { awal: this.t.awal, akhir: this.t.akhir }, {
            ...katalog.tokenDiharapkan('case'),
            pesan: "case, default, or '}' expected",
            artinya: 'Di dalam switch, setiap kelompok pernyataan harus diawali case atau default.',
          })
        }
        if (this.adalah('->')) {
          this.ambil()
          bentukPanah = true
          break
        }
        if (!this.adalah(':')) {
          const posisi = this.sebelumnya.akhir
          this.gagal('token-diharapkan', { awal: posisi, akhir: posisi }, {
            pesan: ': or -> expected',
            artinya: 'Setelah label case harus ada titik dua (:) atau tanda panah (->).',
            saran: 'Tambahkan titik dua, mis. case 1:',
          })
        }
        this.harap(':')
        if (!(this.adalah('case') || this.adalah('default'))) break
      }
      const pernyataan: A.Pernyataan[] = []
      if (bentukPanah) {
        panah = true
        if (this.adalah('{')) pernyataan.push(this.blok())
        else if (this.adalah('throw')) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Pernyataan throw')
        else {
          const awalE = this.t.awal
          const e = this.ekspresi()
          this.cekPernyataanEkspresi(e)
          this.harap(';')
          pernyataan.push({ id: this.nodeId(), span: this.spanDari(awalE), jenis: 'PernyataanEkspresi', ekspresi: e })
        }
      } else {
        while (!this.adalah('case') && !this.adalah('default') && !this.adalah('}')) {
          if (this.eof) this.gagalDiharapkan('}')
          pernyataan.push(this.pernyataan())
        }
      }
      grup.push({ id: this.nodeId(), span: this.spanDari(awalGrup), label, pernyataan })
    }
    this.ambil()
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Switch', selektor, spanSelektor, grup, panah }
  }

  // ---------- ekspresi ----------
  ekspresi(): A.Ekspresi {
    const awal = this.t.awal
    const kiri = this.ternary()
    if ((this.t.jenis === 'op') && OP_ASSIGN.has(this.t.teks)) {
      const op = this.ambil().teks as A.OpAssign
      const nilai = this.adalah('{') ? this.inisialisasiArrayIlegal() : this.ekspresi()
      return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Assign', op, target: kiri, nilai }
    }
    return kiri
  }

  private inisialisasiArrayIlegal(): never {
    this.gagal('awal-ekspresi-ilegal', { awal: this.t.awal, akhir: this.t.akhir }, {
      ...katalog.awalEkspresiIlegal(),
      artinya: 'Bentuk {1, 2, 3} hanya boleh dipakai saat deklarasi array.',
      saran: 'Tulis new int[]{1, 2, 3} bila ingin mengisi ulang array.',
    })
  }

  private ternary(): A.Ekspresi {
    const awal = this.t.awal
    const kondisi = this.biner(1)
    if (this.adalah('?')) {
      this.ambil()
      const ya = this.ekspresi()
      this.harap(':')
      const tidak = this.ternaryAtauLambda()
      return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Kondisional', kondisi, ya, tidak }
    }
    return kondisi
  }

  private ternaryAtauLambda(): A.Ekspresi {
    return this.ternary()
  }

  private biner(minimum: number): A.Ekspresi {
    const awal = this.t.awal
    let kiri = this.unary()
    for (;;) {
      const tk = this.t
      if (tk.jenis === 'kunci' && tk.teks === 'instanceof') {
        this.belumDidukung({ awal: tk.awal, akhir: tk.akhir }, 'Operator instanceof')
      }
      if (tk.jenis !== 'op') break
      const p = PRESEDENSI[tk.teks]
      if (p === undefined || p < minimum) break
      this.ambil()
      const kanan = this.biner(p + 1)
      kiri = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Biner', op: tk.teks as A.OpBiner, kiri, kanan }
    }
    return kiri
  }

  private unary(): A.Ekspresi {
    const awal = this.t.awal
    const tk = this.t
    if (tk.jenis === 'op') {
      if (tk.teks === '-' && (this.lihat(1).jenis === 'int' || this.lihat(1).jenis === 'long') && this.lihat(1).perluMinus) {
        this.ambil()
        const lit = this.ambil()
        const e = this.postfix(this.literal(lit, true))
        return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Unary', op: '-', operand: e }
      }
      if (tk.teks === '+' || tk.teks === '-' || tk.teks === '!' || tk.teks === '~') {
        this.ambil()
        const operand = this.unary()
        return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Unary', op: tk.teks, operand }
      }
      if (tk.teks === '++' || tk.teks === '--') {
        this.ambil()
        const target = this.unary()
        return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'IncDec', op: tk.teks, prefix: true, target }
      }
      if (tk.teks === '(' && this.tampakCast()) {
        this.ambil()
        const tipeNode = this.tipe()
        this.harap(')')
        const ekspresi = this.unary()
        return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'Cast', tipeNode, ekspresi }
      }
    }
    return this.postfix(this.primer())
  }

  private tampakCast(): boolean {
    let k: number
    const tk = this.lihat(1)
    if (tk.jenis === 'kunci' && PRIMITIF.has(tk.teks)) {
      k = 2
      while (this.adalah('[', this.lihat(k)) && this.adalah(']', this.lihat(k + 1))) k += 2
      return this.adalah(')', this.lihat(k))
    }
    if (tk.jenis !== 'ident') return false
    k = 2
    while (this.adalah('.', this.lihat(k)) && this.lihat(k + 1).jenis === 'ident') k += 2
    if (this.adalah('<', this.lihat(k))) {
      let kedalaman = 0
      do {
        const x = this.lihat(k)
        if (x.jenis === 'eof') return false
        if (this.adalah('<', x)) kedalaman++
        else if (this.adalah('>', x)) kedalaman--
        else if (this.adalah('>>', x)) kedalaman -= 2
        else if (!(x.jenis === 'ident' || this.adalah(',', x) || this.adalah('?', x) || this.adalah('.', x))) return false
        k++
      } while (kedalaman > 0)
    }
    while (this.adalah('[', this.lihat(k)) && this.adalah(']', this.lihat(k + 1))) k += 2
    if (!this.adalah(')', this.lihat(k))) return false
    const setelah = this.lihat(k + 1)
    if (setelah.jenis === 'ident' || setelah.jenis === 'string' || setelah.jenis === 'char') return true
    if (['int', 'long', 'float', 'double'].includes(setelah.jenis)) return true
    if (setelah.jenis === 'kunci' && ['this', 'new', 'super', 'true', 'false', 'null'].includes(setelah.teks)) return true
    return this.adalah('(', setelah) || this.adalah('!', setelah) || this.adalah('~', setelah)
  }

  private postfix(e: A.Ekspresi): A.Ekspresi {
    const awal = e.span.awal
    for (;;) {
      if (this.adalah('.')) {
        this.ambil()
        if (this.adalah('<')) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Argumen tipe eksplisit pada pemanggilan method')
        if (this.t.jenis === 'kunci') {
          const tk = this.t
          if (tk.teks === 'class') this.belumDidukung({ awal: tk.awal, akhir: tk.akhir }, 'Ekspresi .class')
          if (tk.teks === 'new') this.belumDidukung({ awal: tk.awal, akhir: tk.akhir }, 'Inner class')
          if (tk.teks === 'this' || tk.teks === 'super') this.belumDidukung({ awal: tk.awal, akhir: tk.akhir }, `Ekspresi .${tk.teks}`)
        }
        const namaTok = this.harapIdent()
        const spanNama = { awal: namaTok.awal, akhir: namaTok.akhir }
        if (this.adalah('(')) {
          const argumen = this.argumen()
          e = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'PanggilMethod', objek: e, nama: namaTok.teks, spanNama, argumen }
        } else {
          e = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'AksesField', objek: e, nama: namaTok.teks, spanNama }
        }
        continue
      }
      if (this.adalah('[')) {
        this.ambil()
        const indeks = this.ekspresi()
        this.harap(']')
        e = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'AksesArray', array: e, indeks }
        continue
      }
      if (this.adalah('++') || this.adalah('--')) {
        const op = this.ambil().teks as '++' | '--'
        e = { id: this.nodeId(), span: this.spanDari(awal), jenis: 'IncDec', op, prefix: false, target: e }
        continue
      }
      if (this.adalah('::')) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Method reference (::)')
      return e
    }
  }

  private argumen(): A.Ekspresi[] {
    this.harap('(')
    const hasil: A.Ekspresi[] = []
    if (!this.adalah(')')) {
      for (;;) {
        hasil.push(this.ekspresi())
        if (!this.adalah(',')) break
        this.ambil()
      }
    }
    this.harap(')')
    return hasil
  }

  private literal(tk: Token, denganMinus = false): A.Literal {
    const span = { awal: tk.awal, akhir: tk.akhir }
    const id = this.nodeId()
    switch (tk.jenis) {
      case 'int':
      case 'long': {
        let nilai = tk.nilai as bigint
        if (tk.perluMinus && !denganMinus) {
          this.diag.tambah('angka-terlalu-besar', span, katalog.angkaTerlaluBesar())
        }
        if (tk.perluMinus && denganMinus) nilai = -nilai
        // Disimpan positif; negasi diterapkan oleh Unary '-'. Batas 2^31 hanya muncul di bawah minus.
        if (tk.jenis === 'int') return { id, span, jenis: 'Literal', jenisLiteral: 'int', nilai: Number(BigInt.asIntN(32, nilai)), perluMinus: tk.perluMinus }
        return { id, span, jenis: 'Literal', jenisLiteral: 'long', nilai: BigInt.asIntN(64, nilai), perluMinus: tk.perluMinus }
      }
      case 'float':
        return { id, span, jenis: 'Literal', jenisLiteral: 'float', nilai: tk.nilai as number }
      case 'double':
        return { id, span, jenis: 'Literal', jenisLiteral: 'double', nilai: tk.nilai as number }
      case 'char':
        return { id, span, jenis: 'Literal', jenisLiteral: 'char', nilai: tk.nilai as number }
      case 'string':
        return { id, span, jenis: 'Literal', jenisLiteral: 'string', nilai: tk.nilai as string }
      default:
        if (tk.teks === 'true' || tk.teks === 'false') return { id, span, jenis: 'Literal', jenisLiteral: 'boolean', nilai: tk.teks === 'true' }
        return { id, span, jenis: 'Literal', jenisLiteral: 'null', nilai: null }
    }
  }

  private primer(): A.Ekspresi {
    const awal = this.t.awal
    const tk = this.t
    const spanT = { awal: tk.awal, akhir: tk.akhir }
    switch (tk.jenis) {
      case 'int':
      case 'long':
      case 'float':
      case 'double':
      case 'char':
      case 'string':
        this.ambil()
        return this.literal(tk)
      case 'ident': {
        if (!this.dalamLabelCase && this.adalah('->', this.lihat(1))) this.belumDidukung(spanT, 'Ekspresi lambda')
        this.ambil()
        if (this.adalah('(')) {
          const argumen = this.argumen()
          return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'PanggilMethod', nama: tk.teks, spanNama: spanT, argumen }
        }
        return { id: this.nodeId(), span: spanT, jenis: 'Nama', nama: tk.teks }
      }
      case 'kunci':
        switch (tk.teks) {
          case 'true':
          case 'false':
          case 'null':
            this.ambil()
            return this.literal(tk)
          case 'new':
            return this.baru()
          case 'this':
            this.belumDidukung(spanT, 'Kata kunci this', 'this dipakai bersama objek, yang akan dibahas di Modul 2.')
            break
          case 'super':
            this.belumDidukung(spanT, 'Kata kunci super')
            break
          case 'switch':
            this.belumDidukung(spanT, 'Switch sebagai ekspresi', 'Gunakan switch sebagai pernyataan biasa.')
            break
        }
        if (PRIMITIF.has(tk.teks) && this.adalah('.', this.lihat(1))) this.belumDidukung(spanT, 'Ekspresi .class')
        break
      case 'op':
        if (tk.teks === '(') {
          if (!this.dalamLabelCase && this.tampakLambda()) this.belumDidukung(spanT, 'Ekspresi lambda')
          this.ambil()
          const e = this.ekspresi()
          this.harap(')')
          return e
        }
        break
      case 'eof':
        this.gagalDiharapkan('<identifier>')
    }
    this.gagal('awal-ekspresi-ilegal', spanT, katalog.awalEkspresiIlegal())
  }

  private tampakLambda(): boolean {
    let k = 1
    let kedalaman = 1
    while (kedalaman > 0) {
      const x = this.lihat(k)
      if (x.jenis === 'eof') return false
      if (this.adalah('(', x)) kedalaman++
      else if (this.adalah(')', x)) kedalaman--
      k++
    }
    return this.adalah('->', this.lihat(k))
  }

  private baru(): A.Ekspresi {
    const awal = this.ambil().awal
    const awalTipe = this.t.awal
    let dasar: A.NodeTipe
    if (this.t.jenis === 'kunci' && PRIMITIF.has(this.t.teks)) {
      const nama = this.ambil().teks as NamaPrimitif
      dasar = { id: this.nodeId(), span: this.spanDari(awalTipe), jenis: 'TipePrimitif', nama }
    } else if (this.adalahIdent()) {
      const nama = this.namaBertitik()
      let argumen: A.NodeTipe[] | undefined
      if (this.adalah('<')) argumen = this.argumenTipe()
      dasar = { id: this.nodeId(), span: this.spanDari(awalTipe), jenis: 'TipeNama', nama, argumen }
    } else {
      this.gagalDiharapkan('<identifier>')
    }
    if (this.adalah('[')) {
      const dimensi: A.Ekspresi[] = []
      let dimensiKosong = 0
      while (this.adalah('[')) {
        this.ambil()
        if (this.adalah(']')) {
          this.ambil()
          dimensiKosong++
          continue
        }
        if (dimensiKosong > 0) this.gagalDiharapkan(']')
        dimensi.push(this.ekspresi())
        this.harap(']')
      }
      let init: A.InisialisasiArray | undefined
      if (dimensi.length === 0) {
        if (!this.adalah('{')) {
          this.gagal('token-diharapkan', { awal: this.t.awal, akhir: this.t.akhir }, {
            pesan: 'array dimension missing',
            artinya: 'Saat membuat array dengan new, ukurannya harus ditulis, mis. new int[5], atau isinya, mis. new int[]{1, 2}.',
          })
        }
        init = this.inisialisasiArray()
      } else if (this.adalah('{')) {
        this.gagal('token-diharapkan', { awal: this.t.awal, akhir: this.t.akhir }, {
          pesan: 'array creation with both dimension expression and initialization is illegal',
          artinya: 'Ukuran array dan isi {…} tidak boleh ditulis bersamaan.',
          saran: 'Pilih salah satu: new int[3] atau new int[]{1, 2, 3}.',
        })
      }
      return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'BaruArray', elemen: dasar, dimensi, dimensiKosong, init }
    }
    if (this.adalah('(')) {
      const argumen = this.argumen()
      if (this.adalah('{')) this.belumDidukung({ awal: this.t.awal, akhir: this.t.akhir }, 'Anonymous class')
      return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'BaruObjek', tipeNode: dasar, argumen }
    }
    this.gagal('token-diharapkan', { awal: this.sebelumnya.akhir, akhir: this.sebelumnya.akhir }, {
      ...katalog.tokenDiharapkan('('),
      pesan: "'(' or '[' expected",
    })
  }

  private inisialisasiArray(): A.InisialisasiArray {
    const awal = this.harap('{').awal
    const elemen: A.Ekspresi[] = []
    while (!this.adalah('}')) {
      elemen.push(this.adalah('{') ? this.inisialisasiArray() : this.ekspresi())
      if (!this.adalah(',')) break
      this.ambil()
    }
    this.harap('}')
    return { id: this.nodeId(), span: this.spanDari(awal), jenis: 'InisialisasiArray', elemen }
  }
}
