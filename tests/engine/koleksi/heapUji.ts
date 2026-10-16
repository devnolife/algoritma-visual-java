import { LemparanJava, type Nilai } from '@/engine/nilai'
import {
  adalahEntri,
  adalahKoleksi,
  adalahMap,
  EntriModel,
  modelDari,
  modelMapDari,
  type HeapKoleksi,
  type OperasiElemen,
} from '@/engine/pustaka/koleksi'
import { buatAcak } from './skenario'

/**
 * Heap uji sederhana di memori + OperasiElemen untuk elemen boks. Padanan Java tiap boks ada di harness
 * scripts/fixture-koleksi.ts: Integer & String asli, K = kunci pencatat (`FixtureKoleksi$K`),
 * S = pembungkus pengurutan (`UrutKoleksi$S`), Orang = objek non-Comparable (`FixtureKoleksi$Orang`).
 */
export type KelasBoks = 'Integer' | 'String' | 'K' | 'H' | 'S' | 'Orang'

export type ObjekUji =
  | { k: 'objek'; kelas: string; field: Record<string, Nilai>; tipe: Record<string, string> }
  | { k: 'array'; tipeElemen: string; isi: Nilai[] }
  | { k: 'boks'; kelas: KelasBoks; nilai: number | string; seri: number }
  | { k: 'pembanding'; jenis: JenisPembanding }

/**
 * log = lambda pencatat `cmpr a b`; terbalik = Collections.reverseOrder(); urut/kacau = harness pengurutan;
 * ubah = lambda yang menambah 99 ke koleksi `c` pada panggilan pertama (uji CME/semantik in-place).
 */
export type JenisPembanding = 'log' | 'terbalik' | 'urut' | 'kacau' | 'ubah'

const KELAS_JAVA_BOKS: Record<KelasBoks, string> = {
  Integer: 'java.lang.Integer',
  String: 'java.lang.String',
  K: 'FixtureKoleksi$K',
  H: 'FixtureKoleksi$H',
  S: 'UrutKoleksi$S',
  Orang: 'FixtureKoleksi$Orang',
}

const TIPE_PRIMITIF = new Set(['int', 'boolean', 'float', 'double', 'long', 'short', 'byte', 'char'])

export class HeapUji implements HeapKoleksi {
  private readonly isi: ObjekUji[] = []
  private readonly statikPeta = new Map<string, Nilai>()
  private readonly cacheInteger = new Map<number, number>()
  private readonly internString = new Map<string, number>()
  private readonly pembandingPeta = new Map<JenisPembanding, number>()
  private seriK = 0
  private seriH = 0
  /** Jumlah perubahan state (alokasi dan tulisan) yang lewat API heap. */
  jumlahTulis = 0

  ambil(id: number): ObjekUji {
    const o = this.isi[id - 1]
    if (!o) throw new Error(`Heap uji: id ${id} tidak ada`)
    return o
  }

  private baru(o: ObjekUji): number {
    this.isi.push(o)
    this.jumlahTulis++
    return this.isi.length
  }

  private objek(id: number) {
    const o = this.ambil(id)
    if (o.k !== 'objek') throw new Error(`Heap uji: id ${id} bukan objek (${o.k})`)
    return o
  }

  private array(id: number) {
    const o = this.ambil(id)
    if (o.k !== 'array') throw new Error(`Heap uji: id ${id} bukan array (${o.k})`)
    return o
  }

  private cekNilai(tipe: string, nilai: Nilai, konteks: string): void {
    const sah =
      tipe === 'int'
        ? typeof nilai === 'number' && Number.isInteger(nilai) && (nilai | 0) === nilai
        : tipe === 'boolean'
          ? typeof nilai === 'boolean'
          : tipe === 'long'
            ? typeof nilai === 'bigint'
            : TIPE_PRIMITIF.has(tipe)
              ? typeof nilai === 'number'
              : nilai === null || (typeof nilai === 'number' && this.isi[nilai - 1] !== undefined)
    if (!sah) throw new Error(`Heap uji: nilai ${String(nilai)} tidak sah untuk ${tipe} (${konteks})`)
  }

  baruObjek(kelas: string, field: Record<string, Nilai>, tipeField: Record<string, string>): number {
    const nama = Object.keys(field)
    if (nama.length !== Object.keys(tipeField).length || nama.some((n) => !(n in tipeField))) {
      throw new Error(`Heap uji: field dan tipeField ${kelas} tidak cocok`)
    }
    for (const n of nama) this.cekNilai(tipeField[n], field[n], `${kelas}.${n}`)
    return this.baru({ k: 'objek', kelas, field: { ...field }, tipe: { ...tipeField } })
  }

  bacaField(id: number, nama: string): Nilai {
    const o = this.objek(id)
    if (!(nama in o.field)) throw new Error(`Heap uji: ${o.kelas} tidak punya field ${nama}`)
    return o.field[nama]
  }

  tulisField(id: number, nama: string, nilai: Nilai): void {
    const o = this.objek(id)
    if (!(nama in o.field)) throw new Error(`Heap uji: ${o.kelas} tidak punya field ${nama}`)
    this.cekNilai(o.tipe[nama], nilai, `${o.kelas}.${nama}`)
    o.field[nama] = nilai
    this.jumlahTulis++
  }

  baruArray(tipeElemen: string, panjang: number): number {
    if (!Number.isInteger(panjang) || panjang < 0) throw new Error(`Heap uji: panjang array ${panjang}`)
    return this.baru({ k: 'array', tipeElemen, isi: new Array<Nilai>(panjang).fill(null) })
  }

  panjangArray(id: number): number {
    return this.array(id).isi.length
  }

  bacaElemen(id: number, i: number): Nilai {
    const a = this.array(id)
    if (!Number.isInteger(i) || i < 0 || i >= a.isi.length)
      throw new Error(`Heap uji: baca indeks ${i} dari panjang ${a.isi.length}`)
    return a.isi[i]
  }

  tulisElemen(id: number, i: number, nilai: Nilai): void {
    const a = this.array(id)
    if (!Number.isInteger(i) || i < 0 || i >= a.isi.length)
      throw new Error(`Heap uji: tulis indeks ${i} ke panjang ${a.isi.length}`)
    this.cekNilai(TIPE_PRIMITIF.has(a.tipeElemen) ? a.tipeElemen : 'ref', nilai, `${a.tipeElemen}[${i}]`)
    a.isi[i] = nilai
    this.jumlahTulis++
  }

  salinArray(sumber: number, posSumber: number, tujuan: number, posTujuan: number, panjang: number): void {
    const s = this.array(sumber)
    const t = this.array(tujuan)
    if (
      posSumber < 0 ||
      posTujuan < 0 ||
      panjang < 0 ||
      posSumber + panjang > s.isi.length ||
      posTujuan + panjang > t.isi.length
    ) {
      throw new Error(`Heap uji: salinArray di luar batas (${posSumber}, ${posTujuan}, ${panjang})`)
    }
    // Seperti System.arraycopy: sumber dan tujuan yang tumpang-tindih disalin lewat salinan sementara.
    const potong = s.isi.slice(posSumber, posSumber + panjang)
    for (let i = 0; i < panjang; i++) t.isi[posTujuan + i] = potong[i]
    this.jumlahTulis++
  }

  kelasDari(id: number): string {
    const o = this.ambil(id)
    switch (o.k) {
      case 'objek':
        return o.kelas
      case 'array':
        return `${o.tipeElemen}[]`
      case 'boks':
        return KELAS_JAVA_BOKS[o.kelas]
      case 'pembanding':
        return `Pembanding$${o.jenis}`
    }
  }

  statik(kelas: string, nama: string, buat: () => Nilai): Nilai {
    const kunci = `${kelas}.${nama}`
    if (!this.statikPeta.has(kunci)) this.statikPeta.set(kunci, buat())
    return this.statikPeta.get(kunci) as Nilai
  }

  /** Field static yang sudah ada (tanpa membuat). */
  bacaStatik(kelas: string, nama: string): Nilai | undefined {
    return this.statikPeta.get(`${kelas}.${nama}`)
  }

  // ---------- Pembuat elemen ----------
  /** Integer.valueOf: -128..127 di-cache seperti JDK. */
  integer(n: number): number {
    if (n >= -128 && n <= 127) {
      const ada = this.cacheInteger.get(n)
      if (ada !== undefined) return ada
      const id = this.baru({ k: 'boks', kelas: 'Integer', nilai: n, seri: 0 })
      this.cacheInteger.set(n, id)
      return id
    }
    return this.baru({ k: 'boks', kelas: 'Integer', nilai: n, seri: 0 })
  }

  /** Literal String (diinternir). */
  string(s: string): number {
    const ada = this.internString.get(s)
    if (ada !== undefined) return ada
    const id = this.baru({ k: 'boks', kelas: 'String', nilai: s, seri: 0 })
    this.internString.set(s, id)
    return id
  }

  /** `new K(v)`: nomor seri naik seperti K.seri di harness Java. */
  k(v: number): number {
    return this.baru({ k: 'boks', kelas: 'K', nilai: v, seri: ++this.seriK })
  }

  /** `new H(v)`: kunci pencatat dengan hashCode v / 10. */
  hk(v: number): number {
    return this.baru({ k: 'boks', kelas: 'H', nilai: v, seri: ++this.seriH })
  }

  /** `new S(v, i)` untuk pengurutan. */
  s(v: number, i: number): number {
    return this.baru({ k: 'boks', kelas: 'S', nilai: v, seri: i })
  }

  orang(): number {
    return this.baru({ k: 'boks', kelas: 'Orang', nilai: 0, seri: 0 })
  }

  /** Pembanding bersama (satu instance per jenis, seperti field static di harness). */
  pembanding(jenis: JenisPembanding): number {
    const ada = this.pembandingPeta.get(jenis)
    if (ada !== undefined) return ada
    const id = this.baru({ k: 'pembanding', jenis })
    this.pembandingPeta.set(jenis, id)
    return id
  }

  boks(x: Nilai): Extract<ObjekUji, { k: 'boks' }> | null {
    if (typeof x !== 'number') return null
    const o = this.ambil(x)
    return o.k === 'boks' ? o : null
  }
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return h
}

function bandingString(a: string, b: string): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const d = a.charCodeAt(i) - b.charCodeAt(i)
    if (d !== 0) return d
  }
  return a.length - b.length
}

const bandingInt = (a: number, b: number) => (a < b ? -1 : a === b ? 0 : 1)

const modulBoks = (kelas: string) =>
  kelas.startsWith('java.') ? "module java.base of loader 'bootstrap'" : "unnamed module of loader 'app'"

/** Pesan ClassCastException HotSpot untuk cast `dari` → `ke`. */
export function pesanCast(dari: string, ke: string): string {
  const mDari = modulBoks(dari)
  const mKe = modulBoks(ke)
  const keterangan =
    mDari === mKe ? `${dari} and ${ke} are in ${mDari}` : `${dari} is in ${mDari}; ${ke} is in ${mKe}`
  return `class ${dari} cannot be cast to class ${ke} (${keterangan})`
}

/**
 * OperasiElemen untuk elemen boks, dengan pencatatan yang sama persis dengan harness Java:
 * `eq a b`, `hash a`, `cmp a b` (compareTo K/H), `cmpr a b` (pembanding log), `str a` (toString K/H).
 */
export class OpsUji implements OperasiElemen {
  log: string[] = []
  catat = false
  /** Pencatat pasangan indeks asli untuk fixture pengurutan (elemen S). */
  rekam: ((a: number, b: number) => void) | null = null
  /** LCG pembanding 'kacau'. */
  acak: () => number = buatAcak(0)
  /** Aksi pembanding 'ubah' (dipasang pemutar skenario) dan penandanya. */
  ubah: (() => void) | null = null
  sudahUbah = false

  constructor(readonly h: HeapUji) {}

  private tulisLog(s: string): void {
    if (this.catat) this.log.push(s)
  }

  /** Padanan `nama(x)` di harness: identitas K tampak lewat nomor seri. */
  nama(x: Nilai): string {
    if (x === null) return 'null'
    const b = this.h.boks(x)
    if (!b) return this.adalahPresent(x) ? 'PRESENT' : '?'
    if (b.kelas === 'K' || b.kelas === 'H') return `${b.kelas}${b.nilai}#${b.seri}`
    if (b.kelas === 'Orang') return 'Orang'
    return String(b.nilai)
  }

  /** Padanan `nilai(x)` di harness (Integer atau K). */
  nilai(x: Nilai): number {
    const b = this.h.boks(x)
    if (!b || (b.kelas !== 'Integer' && b.kelas !== 'K' && b.kelas !== 'H'))
      throw new Error(`nilai() untuk ${this.nama(x)}`)
    return b.nilai as number
  }

  hashCode(x: number): number {
    const b = this.h.boks(x)
    if (b) {
      if (b.kelas === 'String') return hashString(b.nilai as string)
      if (b.kelas === 'K' || b.kelas === 'H') this.tulisLog(`hash ${this.nama(x)}`)
      if (b.kelas === 'Orang') throw new Error('hashCode identitas tidak dimodelkan di heap uji')
      return b.kelas === 'H' ? Math.trunc((b.nilai as number) / 10) : (b.nilai as number)
    }
    if (adalahEntri(this.h, x)) return EntriModel.hashCode(this.h, this, x)
    if (adalahMap(this.h, x)) return modelMapDari(this.h, x).hashCode(this.h, this, x)
    const hash = modelDari(this.h, x).hashCode
    if (!hash) throw new Error(`hashCode identitas ${this.h.kelasDari(x)} tidak dimodelkan`)
    return hash(this.h, this, x)
  }

  equals(a: number, b: Nilai): boolean {
    const ba = this.h.boks(a)
    if (ba) {
      const bb = this.h.boks(b)
      if (ba.kelas === 'K' || ba.kelas === 'H') this.tulisLog(`eq ${this.nama(a)} ${this.nama(b)}`)
      if (ba.kelas === 'Orang') return a === b
      return bb !== null && bb.kelas === ba.kelas && bb.nilai === ba.nilai
    }
    if (adalahEntri(this.h, a)) return EntriModel.equals(this.h, this, a, b)
    if (adalahMap(this.h, a)) return modelMapDari(this.h, a).equals(this.h, this, a, b)
    if (!adalahKoleksi(this.h, a)) return a === b
    const sama = modelDari(this.h, a).equals
    return sama ? sama(this.h, this, a, b) : a === b
  }

  compareTo(a: number, b: Nilai): number {
    const ba = this.h.boks(a)
    if (!ba || ba.kelas === 'Orang') {
      throw new LemparanJava(
        'java.lang.ClassCastException',
        pesanCast(this.h.kelasDari(a), 'java.lang.Comparable'),
      )
    }
    if (ba.kelas === 'K' || ba.kelas === 'H') this.tulisLog(`cmp ${this.nama(a)} ${this.nama(b)}`)
    if (ba.kelas === 'S') {
      const bb = this.h.boks(b)
      this.rekam?.(ba.seri, bb?.seri ?? -1)
      return bandingInt(ba.nilai as number, bb?.nilai as number)
    }
    if (b === null) {
      const nama = ba.kelas === 'Integer' ? 'anotherInteger' : ba.kelas === 'String' ? 'anotherString' : 'o'
      const field = ba.kelas === 'K' ? 'v' : 'value'
      throw new LemparanJava(
        'java.lang.NullPointerException',
        `Cannot read field "${field}" because "${nama}" is null`,
      )
    }
    const bb = this.h.boks(b)
    if (!bb || bb.kelas !== ba.kelas) {
      throw new LemparanJava(
        'java.lang.ClassCastException',
        pesanCast(this.h.kelasDari(b as number), this.h.kelasDari(a)),
      )
    }
    if (ba.kelas === 'String') return bandingString(ba.nilai as string, bb.nilai as string)
    return bandingInt(ba.nilai as number, bb.nilai as number)
  }

  compare(pembanding: number, a: Nilai, b: Nilai): number {
    const o = this.h.ambil(pembanding)
    if (o.k !== 'pembanding') throw new Error('bukan pembanding')
    switch (o.jenis) {
      case 'log':
        this.tulisLog(`cmpr ${this.nama(a)} ${this.nama(b)}`)
        return bandingInt(this.nilai(a), this.nilai(b))
      case 'terbalik':
        if (b === null) throw new Error('reverseOrder dengan null tidak dimodelkan')
        return this.compareTo(b as number, a)
      case 'urut': {
        const ba = this.h.boks(a)
        const bb = this.h.boks(b)
        this.rekam?.(ba?.seri ?? -1, bb?.seri ?? -1)
        return bandingInt(ba?.nilai as number, bb?.nilai as number)
      }
      case 'ubah':
        if (!this.sudahUbah) {
          this.sudahUbah = true
          this.ubah?.()
        }
        return bandingInt(this.nilai(a), this.nilai(b))
      case 'kacau': {
        const ba = this.h.boks(a)
        const bb = this.h.boks(b)
        this.rekam?.(ba?.seri ?? -1, bb?.seri ?? -1)
        return (this.acak() % 3) - 1
      }
    }
  }

  teks(x: Nilai): string {
    if (x === null) return 'null'
    const b = this.h.boks(x)
    if (b) {
      if (b.kelas === 'K' || b.kelas === 'H') {
        this.tulisLog(`str ${this.nama(x)}`)
        return `${b.kelas}${b.nilai}`
      }
      if (b.kelas === 'Orang') return 'Orang'
      return String(b.nilai)
    }
    if (adalahEntri(this.h, x)) return EntriModel.toString(this.h, this, x as number)
    if (adalahMap(this.h, x)) return modelMapDari(this.h, x as number).teks(this.h, this, x as number)
    if (adalahKoleksi(this.h, x)) return modelDari(this.h, x as number).teks(this.h, this, x as number)
    return `?${this.h.kelasDari(x as number)}`
  }

  /** HashSet.PRESENT atau TreeSet.PRESENT. */
  adalahPresent(x: Nilai): boolean {
    return (
      x !== null &&
      (x === this.h.bacaStatik('java.util.HashSet', 'PRESENT') ||
        x === this.h.bacaStatik('java.util.TreeSet', 'PRESENT'))
    )
  }

  pastikanComparable(x: number): void {
    const b = this.h.boks(x)
    if (!b || b.kelas === 'Orang') {
      throw new LemparanJava(
        'java.lang.ClassCastException',
        pesanCast(this.h.kelasDari(x), 'java.lang.Comparable'),
      )
    }
  }
}
