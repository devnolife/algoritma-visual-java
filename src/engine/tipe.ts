export type NamaPrimitif = 'byte' | 'short' | 'int' | 'long' | 'float' | 'double' | 'char' | 'boolean'

/**
 * Tipe statis.
 * - `kelas.nama`: untuk class pustaka berupa nama sederhana seperti di `hierarki.ts` (`String`, `ArrayList`,
 *   `Map.Entry`, `IllegalStateException`); untuk class mahasiswa berupa nama kanonik (`Main`, `Node`,
 *   `Main.Node`, `Main.Gudang.Rak`). `argumen` hanya ada untuk tipe generik berparameter (tanpa = raw/non-generik).
 * - `variabel`: variabel tipe di tanda tangan pustaka (`E`, `K`, `V`, `T`), diganti saat substitusi.
 * - `wildcard`: hanya sebagai argumen tipe, mis. `Comparator<? super E>`.
 */
export type Tipe =
  | { k: 'primitif'; nama: NamaPrimitif }
  | { k: 'kelas'; nama: string; argumen?: Tipe[] }
  | { k: 'variabel'; nama: string }
  | { k: 'wildcard'; batas: 'extends' | 'super' | null; tipe?: Tipe }
  | { k: 'array'; elemen: Tipe }
  | { k: 'null' }
  | { k: 'void' }
  | { k: 'error' }

const primitif = (nama: NamaPrimitif): Tipe => ({ k: 'primitif', nama })

export const T = {
  byte: primitif('byte'),
  short: primitif('short'),
  int: primitif('int'),
  long: primitif('long'),
  float: primitif('float'),
  double: primitif('double'),
  char: primitif('char'),
  boolean: primitif('boolean'),
  String: { k: 'kelas', nama: 'String' } as Tipe,
  Object: { k: 'kelas', nama: 'Object' } as Tipe,
  null: { k: 'null' } as Tipe,
  void: { k: 'void' } as Tipe,
  error: { k: 'error' } as Tipe,
}

export const NAMA_PRIMITIF: readonly NamaPrimitif[] = ['byte', 'short', 'int', 'long', 'float', 'double', 'char', 'boolean']

export function tipeArray(elemen: Tipe, dimensi = 1): Tipe {
  let t = elemen
  for (let i = 0; i < dimensi; i++) t = { k: 'array', elemen: t }
  return t
}

/** Tipe class dengan argumen tipe opsional, mis. `kelas('ArrayList', kelas('Integer'))`. */
export function kelas(nama: string, ...argumen: Tipe[]): Tipe {
  return argumen.length ? { k: 'kelas', nama, argumen } : { k: 'kelas', nama }
}

/** Variabel tipe pustaka, mis. `E`. */
export const variabel = (nama: string): Tipe => ({ k: 'variabel', nama })

/** Ganti variabel tipe menurut `peta`; variabel yang tidak ada di peta dibiarkan. */
export function substitusi(t: Tipe, peta: ReadonlyMap<string, Tipe>): Tipe {
  switch (t.k) {
    case 'variabel':
      return peta.get(t.nama) ?? t
    case 'kelas':
      return t.argumen ? { k: 'kelas', nama: t.nama, argumen: t.argumen.map((a) => substitusi(a, peta)) } : t
    case 'wildcard':
      return t.tipe ? { k: 'wildcard', batas: t.batas, tipe: substitusi(t.tipe, peta) } : t
    case 'array':
      return { k: 'array', elemen: substitusi(t.elemen, peta) }
    default:
      return t
  }
}

/** Apakah `t` memuat variabel tipe (bila `nama` diberikan: salah satu dari nama itu). */
export function memuatVariabel(t: Tipe, nama?: ReadonlySet<string>): boolean {
  switch (t.k) {
    case 'variabel':
      return nama === undefined || nama.has(t.nama)
    case 'kelas':
      return t.argumen !== undefined && t.argumen.some((a) => memuatVariabel(a, nama))
    case 'wildcard':
      return t.tipe !== undefined && memuatVariabel(t.tipe, nama)
    case 'array':
      return memuatVariabel(t.elemen, nama)
    default:
      return false
  }
}

/** Erasure (JLS 4.6): argumen tipe dibuang, variabel tipe menjadi batasnya (Object bila tidak ada). */
export function hapusGenerik(t: Tipe, batas?: (nama: string) => Tipe | undefined): Tipe {
  switch (t.k) {
    case 'variabel': {
      const b = batas?.(t.nama)
      return b ? hapusGenerik(b) : T.Object
    }
    case 'kelas':
      return t.argumen ? { k: 'kelas', nama: t.nama } : t
    case 'wildcard':
      return t.batas === 'extends' && t.tipe ? hapusGenerik(t.tipe, batas) : T.Object
    case 'array':
      return { k: 'array', elemen: hapusGenerik(t.elemen, batas) }
    default:
      return t
  }
}

/** Nama sederhana untuk tampilan: segmen setelah titik terakhir (`Main.Node` → `Node`, `Map.Entry` → `Entry`). */
export function namaTampilKelas(nama: string): string {
  const i = nama.lastIndexOf('.')
  return i < 0 ? nama : nama.slice(i + 1)
}

/**
 * Nama tipe seperti yang ditulis javac, mis. `int`, `String`, `double[][]`, `<null>`,
 * `ArrayList<Integer>`, `Map<String,Integer>` (tanpa spasi), `Comparator<? super Integer>`.
 * Class bersarang ditulis dengan nama sederhananya (javac memakai nama sederhana bila tidak ambigu).
 */
export function teksTipe(t: Tipe): string {
  switch (t.k) {
    case 'primitif':
      return t.nama
    case 'kelas':
      return namaTampilKelas(t.nama) + (t.argumen ? `<${t.argumen.map(teksTipe).join(',')}>` : '')
    case 'variabel':
      return t.nama
    case 'wildcard':
      return t.batas && t.tipe ? `? ${t.batas} ${teksTipe(t.tipe)}` : '?'
    case 'array':
      return teksTipe(t.elemen) + '[]'
    case 'null':
      return '<null>'
    case 'void':
      return 'void'
    case 'error':
      return '<error>'
  }
}

export function samaTipe(a: Tipe, b: Tipe): boolean {
  if (a.k !== b.k) return false
  switch (a.k) {
    case 'primitif':
      return a.nama === (b as { nama: string }).nama
    case 'kelas': {
      const bk = b as { nama: string; argumen?: Tipe[] }
      if (a.nama !== bk.nama) return false
      const x = a.argumen ?? []
      const y = bk.argumen ?? []
      return x.length === y.length && x.every((t, i) => samaTipe(t, y[i]))
    }
    case 'variabel':
      return a.nama === (b as { nama: string }).nama
    case 'wildcard': {
      const bw = b as { batas: string | null; tipe?: Tipe }
      return a.batas === bw.batas && (a.tipe === undefined ? bw.tipe === undefined : bw.tipe !== undefined && samaTipe(a.tipe, bw.tipe))
    }
    case 'array':
      return samaTipe(a.elemen, (b as { elemen: Tipe }).elemen)
    default:
      return true
  }
}

export const adalahPrimitif = (t: Tipe): t is { k: 'primitif'; nama: NamaPrimitif } => t.k === 'primitif'

/** Kelas pembungkus (wrapper) untuk tiap tipe primitif (JLS 5.1.7). */
export const PEMBUNGKUS: Readonly<Record<NamaPrimitif, string>> = {
  byte: 'Byte',
  short: 'Short',
  int: 'Integer',
  long: 'Long',
  float: 'Float',
  double: 'Double',
  char: 'Character',
  boolean: 'Boolean',
}

const PRIMITIF_DARI_PEMBUNGKUS: Readonly<Record<string, NamaPrimitif>> = Object.fromEntries(
  Object.entries(PEMBUNGKUS).map(([p, w]) => [w, p as NamaPrimitif]),
)

/** Tipe hasil boxing, mis. int → Integer. */
export const tipeBoks = (p: NamaPrimitif): Tipe => ({ k: 'kelas', nama: PEMBUNGKUS[p] })

/** Tipe primitif hasil unboxing bila `t` adalah wrapper (Integer → int), selain itu undefined. */
export function tipeUnboks(t: Tipe): { k: 'primitif'; nama: NamaPrimitif } | undefined {
  if (t.k !== 'kelas') return undefined
  const p = PRIMITIF_DARI_PEMBUNGKUS[t.nama]
  return p ? { k: 'primitif', nama: p } : undefined
}
export const adalahBoolean = (t: Tipe) => t.k === 'primitif' && t.nama === 'boolean'
export const adalahNumerik = (t: Tipe) => t.k === 'primitif' && t.nama !== 'boolean'
export const adalahIntegral = (t: Tipe) =>
  t.k === 'primitif' && (t.nama === 'byte' || t.nama === 'short' || t.nama === 'int' || t.nama === 'long' || t.nama === 'char')
export const adalahString = (t: Tipe) => t.k === 'kelas' && t.nama === 'String'
export const adalahReferensi = (t: Tipe) => t.k === 'kelas' || t.k === 'array' || t.k === 'null' || t.k === 'variabel'
export const adalahError = (t: Tipe) => t.k === 'error'
export const adalahNamaPrimitif = (t: Tipe, nama: NamaPrimitif) => t.k === 'primitif' && t.nama === nama

/** Promosi numerik unary: byte, short, char menjadi int. */
export function promosiUnary(t: Tipe): Tipe {
  if (t.k === 'primitif' && (t.nama === 'byte' || t.nama === 'short' || t.nama === 'char')) return T.int
  return t
}

/** Promosi numerik biner (JLS 5.6.2). */
export function promosiBiner(a: Tipe, b: Tipe): Tipe {
  const na = (a as { nama: string }).nama
  const nb = (b as { nama: string }).nama
  if (na === 'double' || nb === 'double') return T.double
  if (na === 'float' || nb === 'float') return T.float
  if (na === 'long' || nb === 'long') return T.long
  return T.int
}

const URUTAN_WIDENING: Record<string, readonly string[]> = {
  byte: ['short', 'int', 'long', 'float', 'double'],
  short: ['int', 'long', 'float', 'double'],
  char: ['int', 'long', 'float', 'double'],
  int: ['long', 'float', 'double'],
  long: ['float', 'double'],
  float: ['double'],
  double: [],
  boolean: [],
}

/** Konversi widening primitif (JLS 5.1.2), tidak termasuk identitas. */
export function bisaWidening(dari: Tipe, ke: Tipe): boolean {
  if (dari.k !== 'primitif' || ke.k !== 'primitif') return false
  return URUTAN_WIDENING[dari.nama].includes(ke.nama)
}

/** Konversi pemanggilan "strict" (JLS 5.3): identitas, widening primitif, widening referensi. */
export function bisaKonversiMethod(dari: Tipe, ke: Tipe): boolean {
  if (adalahError(dari) || adalahError(ke)) return true
  if (samaTipe(dari, ke)) return true
  if (dari.k === 'primitif' && ke.k === 'primitif') return bisaWidening(dari, ke)
  if (dari.k === 'primitif' || ke.k === 'primitif') return false
  if (dari.k === 'null') return adalahReferensi(ke)
  if (ke.k === 'kelas' && ke.nama === 'Object') return true
  if (dari.k === 'array' && ke.k === 'array') {
    if (dari.elemen.k === 'primitif' || ke.elemen.k === 'primitif') return samaTipe(dari.elemen, ke.elemen)
    return bisaKonversiMethod(dari.elemen, ke.elemen)
  }
  return false
}

/** Konversi "loose": strict ditambah boxing primitif ke Object (dipakai mis. oleh printf). */
export function bisaKonversiLonggar(dari: Tipe, ke: Tipe): boolean {
  if (bisaKonversiMethod(dari, ke)) return true
  return dari.k === 'primitif' && ke.k === 'kelas' && ke.nama === 'Object'
}

export type HasilAssign = 'ok' | 'lossy' | 'tidak-cocok'

/** Batas nilai konstanta yang boleh dipersempit otomatis ke byte/short/char (JLS 5.2). */
function konstantaMuat(nilai: number, ke: NamaPrimitif): boolean {
  if (ke === 'byte') return nilai >= -128 && nilai <= 127
  if (ke === 'short') return nilai >= -32768 && nilai <= 32767
  if (ke === 'char') return nilai >= 0 && nilai <= 0xffff
  return false
}

/**
 * Aturan konversi assignment (JLS 5.2). `konstan` diisi bila nilai sumber adalah
 * ekspresi konstan bertipe int/short/char/byte.
 */
export function cekAssign(dari: Tipe, ke: Tipe, konstan?: unknown): HasilAssign {
  if (bisaKonversiMethod(dari, ke)) return 'ok'
  if (dari.k === 'primitif' && ke.k === 'primitif') {
    if (dari.nama === 'boolean' || ke.nama === 'boolean') return 'tidak-cocok'
    if (
      typeof konstan === 'number' &&
      (dari.nama === 'int' || dari.nama === 'short' || dari.nama === 'char' || dari.nama === 'byte') &&
      (ke.nama === 'byte' || ke.nama === 'short' || ke.nama === 'char') &&
      konstantaMuat(konstan, ke.nama)
    ) {
      return 'ok'
    }
    return 'lossy'
  }
  return 'tidak-cocok'
}

/** Apakah casting `(ke) nilai_bertipe_dari` diizinkan. */
export function bisaCast(dari: Tipe, ke: Tipe): boolean {
  if (adalahError(dari) || adalahError(ke)) return true
  if (samaTipe(dari, ke)) return true
  if (dari.k === 'primitif' && ke.k === 'primitif') {
    return (dari.nama === 'boolean') === (ke.nama === 'boolean')
  }
  if (dari.k === 'primitif' || ke.k === 'primitif') return false
  if (dari.k === 'null') return true
  if (ke.k === 'kelas' && ke.nama === 'Object') return true
  if (dari.k === 'kelas' && dari.nama === 'Object') return true
  return bisaKonversiMethod(dari, ke)
}

/** Tipe untuk pesan error/visualisasi bila sebuah nilai disimpan sebagai teks tipe. */
export function parseTeksTipe(teks: string): Tipe {
  let dimensi = 0
  let dasar = teks.trim()
  while (dasar.endsWith('[]')) {
    dimensi++
    dasar = dasar.slice(0, -2)
  }
  const t: Tipe = (NAMA_PRIMITIF as readonly string[]).includes(dasar)
    ? { k: 'primitif', nama: dasar as NamaPrimitif }
    : { k: 'kelas', nama: dasar }
  return tipeArray(t, dimensi)
}
