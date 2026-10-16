/**
 * Narasi Fase 2: objek & konstruktor, field, jebakan `data = data`, alur exception, boxing (cache Integer),
 * dan operasi koleksi. Dipanggil dari `narasikan` untuk menambah kalimat/peringatan pada sebuah langkah.
 */
import type { ObjekHeap, Peristiwa, StateMesin } from './trace'
import { namaKelasTampil, tampilNilai } from './trace'

const k = (s: string) => '`' + s + '`'

const PRIMITIF = new Set(['int', 'long', 'short', 'byte', 'char', 'double', 'float', 'boolean'])
const adalahRef = (tipe: string | undefined) => tipe !== undefined && !PRIMITIF.has(tipe)
const internal = (o: ObjekHeap | undefined) => o?.k === 'objek' && o.kelas.startsWith('java.') && !/Exception|Error/.test(o.kelas)

/** Nama yang mudah dibaca untuk objek heap: variabel/`this`, field static, atau satu langkah jalur (`daftar.head`, `arr[2]`). */
export function namaObjek(id: number, state: StateMesin): string | undefined {
  const atas = state.frames[state.frames.length - 1]
  const vars = [...(atas?.vars ?? []), ...state.statik]
  for (const v of vars) if (v.nilai === id && adalahRef(v.tipe)) return v.nama
  for (const v of vars) {
    if (typeof v.nilai !== 'number' || !adalahRef(v.tipe)) continue
    const o = state.heap[v.nilai]
    if (o?.k === 'objek' && !internal(o)) {
      for (const [f, x] of Object.entries(o.field)) if (x === id && adalahRef(o.tipeField[f])) return `${v.nama}.${f}`
    } else if (o?.k === 'array' && adalahRef(o.tipeElemen)) {
      const i = o.nilai.indexOf(id)
      if (i >= 0) return `${v.nama}[${i}]`
    }
  }
  return undefined
}

const PENJELASAN_EXCEPTION_FASE2: Record<string, string> = {
  'java.lang.ClassCastException': 'Objek ini tidak bisa diperlakukan sebagai tipe tujuan casting, karena class aslinya berbeda.',
  'java.util.ConcurrentModificationException':
    'Koleksi diubah (ditambah/dihapus) saat sedang ditelusuri dengan for-each atau iterator. Gunakan `iterator.remove()` atau telusuri salinannya.',
  'java.util.EmptyStackException': 'Stack kosong, jadi tidak ada elemen yang bisa diambil dengan pop() atau peek().',
  'java.lang.IndexOutOfBoundsException': 'Indeks yang diminta berada di luar isi list. Indeks yang sah adalah 0 sampai size() − 1.',
  'java.lang.UnsupportedOperationException': 'Koleksi ini tidak bisa diubah (mis. hasil List.of atau ukuran tetap Arrays.asList).',
  'java.lang.IllegalStateException': 'Method dipanggil pada saat objek tidak dalam keadaan yang tepat.',
}

/** Penjelasan exception Fase 2 (undefined bila tidak ada). */
export function penjelasanExceptionFase2(kelas: string): string | undefined {
  return PENJELASAN_EXCEPTION_FASE2[kelas]
}

type Cari = <K extends Peristiwa['k']>(jenis: K) => Extract<Peristiwa, { k: K }>[]

/** Kalimat pembuka langkah `panggil` untuk konstruktor dan lambda. undefined = pakai narasi biasa. */
export function narasiPanggilFase2(pg: Extract<Peristiwa, { k: 'panggil' }>, cari: Cari, sesudah: StateMesin): string[] | undefined {
  const tampil = (v: Parameters<typeof tampilNilai>[0], tipe: string) => tampilNilai(v, tipe, sesudah.heap)
  if (pg.jenis === 'konstruktor') {
    const baru = cari('alokasi').filter((a) => a.objek.k === 'objek' && !internal(a.objek))
    const a = baru[baru.length - 1]
    const kalimat: string[] = []
    if (a && a.objek.k === 'objek') {
      const o = a.objek
      const field = Object.entries(o.field)
        .filter(([f]) => f !== 'this$0')
        .map(([f, x]) => `${k(f)} = ${k(tampil(x, o.tipeField[f] ?? 'Object'))}`)
      kalimat.push(
        `Membuat objek ${k(namaKelasTampil(o.kelas))} baru di heap` +
          (field.length ? `. Semua field-nya mula-mula bernilai default: ${field.join(', ')}.` : '.'),
      )
    }
    const param = pg.frame.vars.filter((v) => v.nama !== 'this').map((v) => `${k(v.nama)} = ${k(tampil(v.nilai, v.tipe))}`)
    kalimat.push(
      `Konstruktor ${k(`${pg.method}(${pg.argumen.join(', ')})`)} dijalankan. ${k('this')} menunjuk objek yang sedang dibuat` +
        (param.length ? `, dan parameternya ${param.join(', ')}.` : '.'),
    )
    return kalimat
  }
  if (pg.jenis === 'lambda') {
    const param = pg.frame.vars.filter((v) => v.param && v.nama !== 'this').map((v) => `${k(v.nama)} = ${k(tampil(v.nilai, v.tipe))}`)
    return [`Lambda Comparator dipanggil untuk membandingkan dua elemen${param.length ? `: ${param.join(', ')}` : ''}. Hasil negatif berarti elemen pertama di depan, positif berarti di belakang, nol berarti setara.`]
  }
  return undefined
}

/** Kalimat tambahan langkah `pernyataan` (dan langkah lain) untuk peristiwa Fase 2. */
export function narasiPernyataanFase2(
  cari: Cari,
  sesudah: StateMesin,
  teks: string,
  ubah: (nama: string, tipe: string, lama: unknown, baru: unknown, op?: string, operand?: string) => string,
): { kalimat: string[]; peringatan: string[] } {
  const kalimat: string[] = []
  const peringatan: string[] = []

  // Tulis field objek mahasiswa (objek internal koleksi dinarasikan lewat peristiwa `pustaka`).
  for (const t of cari('tulis-field')) {
    const o = sesudah.heap[t.id]
    if (internal(o)) continue
    const pemilik = namaObjek(t.id, sesudah) ?? `objek ${o?.k === 'objek' ? namaKelasTampil(o.kelas) : ''}`.trim()
    kalimat.push(ubah(`${pemilik}.${t.field}`, t.tipe, t.lama, t.baru, t.op, t.operand))
  }

  // Jebakan `data = data`: parameter diisi dengan dirinya sendiri, field objek tidak berubah.
  const m = /^(\w+)\s*=\s*\1\s*;?$/.exec(teks)
  if (m) {
    const atas = sesudah.frames[sesudah.frames.length - 1]
    const ini = atas?.vars.find((v) => v.nama === 'this')
    const o = typeof ini?.nilai === 'number' ? sesudah.heap[ini.nilai] : undefined
    if (o?.k === 'objek' && m[1] in o.field) {
      peringatan.push(
        `Hati-hati: ${k(`${m[1]} = ${m[1]}`)} hanya mengisi **parameter** ${k(m[1])} dengan dirinya sendiri, sehingga field objek tidak berubah. Gunakan ${k(`this.${m[1]} = ${m[1]}`)}.`,
      )
    }
  }

  // Boxing / unboxing (cukup yang pertama per langkah agar tidak bertele-tele).
  const bx = cari('boxing')[0]
  if (bx) {
    if (bx.arah === 'box') {
      kalimat.push(
        bx.cache
          ? `${k(bx.nilai)} dibungkus (autoboxing) menjadi objek ${k(bx.kelas)}. Nilai ${bx.kelas === 'Character' ? 'karakter berkode 0..127' : bx.kelas === 'Boolean' ? 'boolean' : '−128..127'} memakai **objek cache yang sama**, jadi dua boxing nilai ini menunjuk objek yang sama.`
          : `${k(bx.nilai)} dibungkus (autoboxing) menjadi objek ${k(bx.kelas)} **baru**. Karena itu ${k('==')} antara dua objek ${k(bx.kelas)} membandingkan alamat objek, bukan nilainya; gunakan ${k('equals')}.`,
      )
    } else {
      kalimat.push(`Objek ${k(bx.kelas)} dibuka (unboxing) menjadi nilai primitif ${k(bx.nilai)}.`)
    }
  }

  // Operasi koleksi & StringBuilder.
  for (const p of cari('pustaka')) {
    const nama = namaObjek(p.id, sesudah) ?? namaKelasTampil(p.kelas)
    let s = `${k(`${nama}.${p.metode}`)} pada ${k(namaKelasTampil(p.kelas))}`
    if (p.hasil !== undefined) s += ` menghasilkan ${k(p.hasil)}`
    kalimat.push(s + '.')
  }
  // Kapasitas ArrayList/ArrayDeque/PriorityQueue/HashMap bertambah: array internal baru dialokasikan lalu isinya disalin.
  for (const a of cari('alokasi')) {
    if (a.objek.k !== 'array' || !cari('salin-elemen').some((s) => s.id === a.id)) continue
    const lama = cari('tulis-field').find((t) => t.baru === a.id)
    if (!lama || typeof lama.lama !== 'number') continue
    const arrLama = sesudah.heap[lama.lama]
    if (arrLama?.k !== 'array') continue
    kalimat.push(
      `Kapasitas penuh (${arrLama.nilai.length}), jadi ${k(namaKelasTampil(sesudah.heap[lama.id]?.k === 'objek' ? (sesudah.heap[lama.id] as { kelas: string }).kelas : 'koleksi'))} membuat array baru berkapasitas ${a.objek.nilai.length} lalu menyalin isinya.`,
    )
  }
  return { kalimat, peringatan }
}

/** Narasi alur exception: lempar → frame dibuang → ditangkap, dan blok finally. */
export function narasiExceptionFase2(cari: Cari): string[] {
  const kalimat: string[] = []
  for (const lp of cari('lempar')) {
    kalimat.push(`${k(namaKelasTampil(lp.kelas))} dilempar${lp.pesan !== null ? ` dengan pesan ${k(lp.pesan)}` : ''}.`)
  }
  const rambat = cari('rambat')
  if (rambat.length) {
    kalimat.push(
      `Tidak ada catch yang cocok di ${rambat.map((r) => k(r.method)).join(', ')}, jadi ${rambat.length > 1 ? 'frame-frame itu' : 'frame itu'} dibuang dan exception merambat ke pemanggilnya.`,
    )
  }
  for (const t of cari('tangkap')) {
    kalimat.push(`Exception ditangkap oleh ${k(`catch (${t.tipe} ${t.variabel})`)}, jadi eksekusi berlanjut ke blok catch.`)
  }
  for (const f of cari('finally')) {
    const sebab: Record<string, string> = {
      normal: 'setelah blok try/catch selesai',
      exception: 'walaupun ada exception yang belum tertangkap',
      return: 'sebelum return benar-benar terjadi',
      break: 'sebelum break dijalankan',
      continue: 'sebelum continue dijalankan',
    }
    kalimat.push(`Blok ${k('finally')} dijalankan ${sebab[f.sebab]}. Blok ini selalu dijalankan.`)
  }
  return kalimat
}
