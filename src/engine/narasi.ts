import type { Langkah, Peristiwa, PohonEval, StateMesin, Trace } from './trace'
import { tampilNilai } from './trace'

export interface KonteksNarasi {
  /** Kode sumber lengkap. */
  sumber: string
  /** Catatan dosen: nama penanda → isi (Markdown). */
  catatan?: Record<string, string>
  /** Penanda dari komentar `// #nama`: baris → nama. */
  penanda?: Record<number, string>
}

export interface Narasi {
  /** Kalimat penjelasan; mendukung `kode` dan **tebal**. */
  kalimat: string[]
  /** Peringatan penting (overflow, jebakan nextLine, dll.). */
  peringatan: string[]
  catatan?: { nama: string; isi: string }
}

const k = (s: string) => '`' + s + '`'

const PENJELASAN_EXCEPTION: Record<string, string> = {
  'java.lang.ArithmeticException': 'Pembagian bilangan bulat dengan nol tidak diperbolehkan di Java.',
  'java.lang.ArrayIndexOutOfBoundsException': 'Indeks yang diakses berada di luar batas array. Indeks yang sah adalah 0 sampai panjang − 1.',
  'java.lang.NullPointerException': 'Program memakai variabel yang bernilai null, yaitu belum menunjuk ke objek atau array apa pun.',
  'java.lang.NegativeArraySizeException': 'Ukuran array tidak boleh negatif.',
  'java.lang.StringIndexOutOfBoundsException': 'Posisi karakter yang diminta berada di luar panjang String. Posisi yang sah adalah 0 sampai length() − 1.',
  'java.lang.NumberFormatException': 'Teks tersebut tidak bisa diubah menjadi angka.',
  'java.util.InputMismatchException': 'Input yang dibaca Scanner tidak cocok dengan tipe yang diminta, mis. huruf saat memanggil nextInt().',
  'java.util.NoSuchElementException': 'Scanner kehabisan input. Isi tab Input dengan data yang dibutuhkan program.',
  'java.lang.StackOverflowError': 'Pemanggilan method terlalu dalam. Biasanya karena rekursi tidak pernah mencapai base case.',
  'java.util.IllegalFormatConversionException': 'Penentu format printf tidak cocok dengan tipe argumennya, mis. %d dipakai untuk double.',
  'java.util.MissingFormatArgumentException': 'Jumlah argumen printf lebih sedikit daripada penentu format (%d, %s, …).',
  'java.util.UnknownFormatConversionException': 'Ada penentu format yang tidak dikenal di printf.',
  'java.lang.IllegalArgumentException': 'Argumen yang diberikan ke method tidak valid.',
  'java.lang.ClassCastException': 'Nilai tidak bisa diubah ke tipe tersebut.',
}

function ringkas(s: string, maks = 90): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > maks ? t.slice(0, maks - 1) + '…' : t
}

function teksLangkah(l: Langkah, sumber: string): string {
  return l.span ? ringkas(sumber.slice(l.span.awal, l.span.akhir)) : ''
}

function teksBaris(sumber: string, baris: number): string {
  return sumber.split(/\r\n|\r|\n/)[baris - 1]?.trim() ?? ''
}

/** Cari nama variabel yang menunjuk ke array `id` (termasuk elemen array 2D). */
export function namaArray(id: number, state: StateMesin): string | undefined {
  const semua = [...[...state.frames].reverse().flatMap((f) => f.vars), ...state.statik]
  for (const v of semua) if (v.nilai === id && v.tipe.endsWith('[]')) return v.nama
  for (const v of semua) {
    if (typeof v.nilai !== 'number' || !v.tipe.endsWith('[][]')) continue
    const o = state.heap[v.nilai]
    if (o?.k === 'array') {
      const i = o.nilai.indexOf(id)
      if (i >= 0) return `${v.nama}[${i}]`
    }
  }
  return undefined
}

function narasiAritmetika(p: Extract<Peristiwa, { k: 'aritmetika' }>): { kalimat?: string; peringatan?: string } {
  switch (p.jenis) {
    case 'bagi-bulat':
      return { kalimat: `${k(p.teks)} = ${k(p.hasil)}. Karena keduanya bilangan bulat (${p.tipe}), bagian desimal hasil bagi dibuang.` }
    case 'sisa':
      return { kalimat: `${k(p.teks)} = ${k(p.hasil)}, yaitu **sisa** pembagian.` }
    case 'overflow':
      return {
        peringatan: `Overflow! ${k(p.teks)} seharusnya ${p.tepat}, tetapi ${p.tipe} hanya ${p.tipe === 'long' ? '64' : '32'}-bit sehingga hasilnya "berputar" menjadi ${k(p.hasil)}.`,
      }
    case 'bagi-nol-pecahan':
      return { kalimat: `${k(p.teks)} = ${k(p.hasil)}. Pembagian ${p.tipe} dengan nol tidak error, tetapi menghasilkan Infinity atau NaN.` }
  }
}

function narasiCast(p: Extract<Peristiwa, { k: 'cast' }>): string {
  const awal = `Casting ${k(`(${p.ke}) ${p.sebelum}`)} menghasilkan ${k(p.sesudah)}`
  if ((p.dari === 'double' || p.dari === 'float') && ['int', 'long', 'short', 'byte'].includes(p.ke)) {
    return `${awal}: bagian desimal **dipotong**, bukan dibulatkan.`
  }
  if (p.ke === 'char') return `${awal}: angka diubah menjadi karakter dengan kode Unicode tersebut.`
  if (p.dari === 'char') return `${awal}: karakter diubah menjadi kode Unicode-nya.`
  if ((p.ke === 'byte' || p.ke === 'short') && p.sebelum !== p.sesudah) {
    return `${awal}: ${p.ke} hanya muat ${p.ke === 'byte' ? '−128 sampai 127' : '−32768 sampai 32767'}, jadi nilainya berputar.`
  }
  return `${awal}.`
}

/** Narasi Bahasa Indonesia untuk langkah ke-i. */
export function narasikan(trace: Trace, i: number, sesudah: StateMesin, ktx: KonteksNarasi): Narasi {
  const l = trace.langkah[i]
  const hasil: Narasi = { kalimat: [], peringatan: [] }
  if (!l) return hasil
  const heap = sesudah.heap
  const tampil = (v: Parameters<typeof tampilNilai>[0], tipe: string) => tampilNilai(v, tipe, heap)
  const kalimat = hasil.kalimat
  const p = l.peristiwa
  const cari = <K extends Peristiwa['k']>(jenis: K) => p.filter((x): x is Extract<Peristiwa, { k: K }> => x.k === jenis)
  const baris = teksBaris(ktx.sumber, l.baris)
  const teks = teksLangkah(l, ktx.sumber)

  switch (l.jenis) {
    case 'mulai': {
      kalimat.push(`Program dimulai. Java selalu mulai menjalankan perintah dari method ${k('main')}.`)
      // Field static bisa muncul dua kali (nilai default, lalu penginisialisasinya); cukup sebut nilai terakhirnya.
      const statik = new Map(cari('deklarasi-statik').map((s) => [s.nama, s]))
      for (const s of statik.values()) kalimat.push(`Variabel class ${k(s.nama)} (${s.tipe}) disiapkan dengan nilai ${k(tampil(s.nilai, s.tipe))}.`)
      break
    }
    case 'panggil': {
      const pg = cari('panggil')[0]
      if (pg) {
        const params = pg.frame.vars.map((v) => `${k(v.nama)} = ${k(tampil(v.nilai, v.tipe))}`)
        kalimat.push(
          `Memanggil ${k(`${pg.method}(${pg.argumen.join(', ')})`)}. Java membuat **frame baru** di call stack untuk method ini` +
            (params.length ? ` dengan parameter ${params.join(', ')}.` : '.'),
        )
      }
      break
    }
    case 'kembali': {
      const kb = cari('kembali')[0]
      if (kb) {
        kalimat.push(
          kb.nilai !== undefined
            ? `Method ${k(kb.method)} selesai dan **mengembalikan** ${k(kb.nilai)} ke pemanggilnya. Frame-nya akan dibuang dari call stack.`
            : `Method ${k(kb.method)} selesai. Program kembali ke pemanggilnya dan frame-nya dibuang.`,
        )
      }
      break
    }
    case 'selesai':
      kalimat.push(
        trace.status === 'keluar'
          ? `Program dihentikan oleh ${k(`System.exit(${trace.kodeKeluar ?? 0})`)}.`
          : `Program selesai: method ${k('main')} sudah sampai di akhir.`,
      )
      break
    case 'exception': {
      const ex = cari('exception')[0]
      if (ex) {
        const nama = ex.kelas.split('.').pop()
        kalimat.push(`Terjadi **${nama}**${ex.pesan ? `: ${k(ex.pesan)}` : ''}. Program berhenti di baris ${l.baris}.`)
        const jelas = PENJELASAN_EXCEPTION[ex.kelas]
        if (jelas) kalimat.push(jelas)
      } else if (trace.exception) {
        kalimat.push(`Program berhenti: ${trace.exception.pesan ?? trace.exception.kelas}.`)
      }
      if (trace.pesanSimulator) hasil.peringatan.push(trace.pesanSimulator)
      break
    }
    case 'batas':
      kalimat.push(trace.pesanSimulator ?? 'Program dihentikan oleh simulator.')
      break
    case 'kondisi': {
      const ev = cari('evaluasi')[0]
      if (!ev) break
      if (ev.konteks === 'switch') {
        const cocok = cari('cocok-case')[0]
        kalimat.push(
          cocok?.label
            ? `Nilai ${k(ev.teks)} adalah ${k(ev.hasil)}, jadi eksekusi lompat ke ${k(cocok.label)}.`
            : `Nilai ${k(ev.teks)} adalah ${k(ev.hasil)} dan tidak ada case yang cocok, jadi switch dilewati.`,
        )
        break
      }
      const benar = ev.hasil === 'true'
      const tahap = tahapEvaluasi(ev.pohon)
      const rumus = tahap.length > 2 ? `${k(tahap[0])} → ${k(tahap[1])} bernilai **${ev.hasil}**` : `${k(ev.teks)} bernilai **${ev.hasil}**`
      if (ev.konteks === 'if') {
        kalimat.push(
          `Cek kondisi ${rumus}, ` +
            (benar ? 'jadi isi blok if dijalankan.' : ev.adaLain ? 'jadi bagian else yang dijalankan.' : 'jadi isi blok if dilewati.'),
        )
      } else if (ev.konteks === 'do-while') {
        kalimat.push(`Setelah badan perulangan dijalankan, kondisi dicek: ${rumus}, ` + (benar ? 'jadi perulangan diulang.' : 'jadi perulangan berhenti.'))
      } else {
        kalimat.push(
          `Cek kondisi ${rumus}, ` +
            (benar
              ? ev.pertama
                ? 'jadi badan perulangan mulai dijalankan.'
                : 'jadi badan perulangan dijalankan lagi.'
              : ev.pertama
                ? 'jadi badan perulangan tidak dijalankan sama sekali.'
                : 'jadi perulangan selesai.'),
        )
      }
      break
    }
    case 'pernyataan': {
      const deklarasi = cari('deklarasi')
      const tulis = cari('tulis')
      const tulisStatik = cari('tulis-statik')
      const tulisElemen = cari('tulis-elemen')
      const forEach = /^for\s*\(/.test(baris) && cari('baca-elemen').length > 0 && (deklarasi.length > 0 || tulis.length > 0) && baris.includes(':')
      if (forEach) {
        const v = deklarasi.length > 0 ? deklarasi[0] : tulis[0]
        const be = cari('baca-elemen')[0]
        const nama = be ? namaArray(be.id, sesudah) : undefined
        const nilai = v.k === 'tulis' ? v.baru : v.nilai
        kalimat.push(`Elemen berikutnya diambil: ${k(v.nama)} = ${nama ? k(`${nama}[${be!.indeks}]`) + ' = ' : ''}${k(tampil(nilai, v.tipe))}.`)
        break
      }
      if (/^for\s*\(/.test(baris) && deklarasi.length > 0 && teks && !teks.startsWith('for')) {
        kalimat.push(`Inisialisasi perulangan: ${deklarasi.map((d) => `${k(d.nama)} dibuat dengan nilai ${k(tampil(d.nilai, d.tipe))}`).join(', ')}. Bagian ini hanya dijalankan sekali.`)
        break
      }
      const updateFor = /^for\s*\(/.test(baris) && deklarasi.length === 0 && teks !== '' && !teks.startsWith('for')
      for (const d of deklarasi) {
        if (d.nilai === undefined) kalimat.push(`Membuat variabel ${k(d.nama)} bertipe ${k(d.tipe)}. Variabel ini belum diisi nilai.`)
        else kalimat.push(`Membuat variabel ${k(d.nama)} bertipe ${k(d.tipe)} dan mengisinya dengan ${k(tampil(d.nilai, d.tipe))}.`)
      }
      const ubah = (nama: string, tipe: string, lama: unknown, baru: unknown, op?: string, operand?: string) => {
        const tl = tampil(lama as never, tipe)
        const tb = tampil(baru as never, tipe)
        if (op === '++' || op === '--') {
          return `${k(nama + op)} ${op === '++' ? 'menambah' : 'mengurangi'} ${k(nama)} dengan 1: dari ${k(tl)} menjadi ${k(tb)}.`
        }
        if (op && op !== '=' && operand !== undefined) {
          const opBiner = op.slice(0, -1)
          // Tampilkan teks kode aslinya (mis. `jumlah += data[i]`) bila langkah ini memang compound assignment tersebut.
          const asli = teksLangkah(l, ktx.sumber).replace(/;$/, '')
          const kode = asli.startsWith(nama) && asli.slice(nama.length).trimStart().startsWith(op) ? asli : `${nama} ${op} ${operand}`
          return `${k(kode)} berarti ${k(nama)} = ${tl} ${opBiner} ${operand} = ${k(tb)}.`
        }
        if (lama === undefined) return `${k(nama)} diisi dengan ${k(tb)}.`
        return tl === tb ? `${k(nama)} diisi ${k(tb)} (nilainya sama seperti sebelumnya).` : `${k(nama)} berubah dari ${k(tl)} menjadi ${k(tb)}.`
      }
      for (const t of tulis) kalimat.push((updateFor ? 'Update perulangan: ' : '') + ubah(t.nama, t.tipe, t.lama, t.baru, t.op, t.operand))
      for (const t of tulisStatik) kalimat.push(ubah(t.nama, t.tipe, t.lama, t.baru, t.op, t.operand))
      for (const t of tulisElemen) {
        const nama = namaArray(t.id, sesudah) ?? 'array'
        kalimat.push(ubah(`${nama}[${t.indeks}]`, t.tipe, t.lama, t.baru, t.op, t.operand))
      }
      {
        // Array terluar dialokasikan paling akhir (baris-baris array 2D dibuat lebih dulu).
        const larik = cari('alokasi').filter((a) => a.objek.k === 'array')
        const a = larik[larik.length - 1]
        if (a && a.objek.k === 'array' && deklarasi.length + tulis.length > 0) {
          const tipeElemen = a.objek.tipeElemen
          const n = a.objek.nilai.length
          const baris = larik.slice(0, -1).map((x) => (x.objek.k === 'array' ? x.objek.nilai.length : 0))
          if (tipeElemen.endsWith('[]') && baris.length === n && n > 0) {
            const dasar = tipeElemen.slice(0, -2)
            const seragam = baris.every((c) => c === baris[0])
            kalimat.push(
              seragam
                ? `Array 2 dimensi ${k(`${dasar}[${n}][${baris[0]}]`)} dibuat di memori: ${n} baris × ${baris[0]} kolom. Setiap baris adalah array ${k(`${dasar}[]`)} tersendiri.`
                : `Array 2 dimensi ${k(`${dasar}[${n}][]`)} dibuat di memori: ${n} baris dengan panjang berbeda-beda (${baris.join(', ')}).`,
            )
          } else {
            kalimat.push(`Array baru ${k(`${tipeElemen}[${n}]`)} dibuat di memori: ${k(tampil(a.id, tipeElemen + '[]'))}.`)
          }
        }
      }
      for (const s of cari('scanner')) {
        if (s.metode === 'nextLine') {
          if (s.token === '') {
            // Cari pembacaan token terakhir sebelum langkah ini (nextInt, nextDouble, next, …).
            let sebelum: string | undefined
            for (let j = i - 1; j >= 0 && !sebelum; j--) {
              for (const q of trace.langkah[j].peristiwa) if (q.k === 'scanner' && q.id === s.id && q.metode !== 'nextLine') sebelum = q.metode
            }
            hasil.peringatan.push(
              sebelum
                ? `${k('nextLine()')} mengambil sisa baris yang **kosong**. Ini jebakan klasik: ${k(`${sebelum}()`)} sebelumnya hanya membaca tokennya dan tidak ikut membaca tombol Enter.`
                : `${k('nextLine()')} membaca baris yang **kosong** dari input.`,
            )
          } else kalimat.push(`${k('nextLine()')} membaca satu baris input: ${k(s.token)}.`)
        } else kalimat.push(`${k(`${s.metode}()`)} membaca token ${k(s.token)} dari input.`)
      }
      for (const c of cari('cetak')) {
        const tanpaBaris = c.teks.replace(/\n$/, '')
        if (c.err) continue
        if (tanpaBaris.length === 0) kalimat.push('Mencetak baris kosong ke layar.')
        else kalimat.push(`Mencetak ${k(ringkas(tanpaBaris, 60))} ke layar${c.teks.endsWith('\n') ? ' lalu pindah baris' : ''}.`)
      }
      for (const lp of cari('lompat')) {
        kalimat.push(
          lp.jenis === 'break'
            ? `${k('break')} langsung keluar dari perulangan atau switch terdekat.`
            : `${k('continue')} melewati sisa badan perulangan dan lanjut ke putaran berikutnya.`,
        )
      }
      if (kalimat.length === 0 && teks) kalimat.push(`Menjalankan ${k(teks)}.`)
      break
    }
  }

  for (const a of cari('aritmetika')) {
    const n = narasiAritmetika(a)
    if (n.kalimat) kalimat.push(n.kalimat)
    if (n.peringatan) hasil.peringatan.push(n.peringatan)
  }
  for (const c of cari('cast')) kalimat.push(narasiCast(c))

  const nama = ktx.penanda?.[l.baris]
  // Saat exception, fokus pada errornya; catatan dosen untuk baris itu tidak ditampilkan.
  if (nama && ktx.catatan?.[nama] && l.jenis !== 'exception') hasil.catatan = { nama, isi: ktx.catatan[nama] }
  return hasil
}

// ---------- Tahap evaluasi kondisi ----------
const PRESEDENSI: Record<string, number> = {
  '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7,
  '<<': 8, '>>': 8, '>>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10,
}

function tinggi(p: PohonEval): number {
  if (p.k === 'daun') return 0
  if (p.k === 'unary') return 1 + tinggi(p.operand)
  return 1 + Math.max(tinggi(p.kiri), tinggi(p.kanan))
}

function cetakPohon(p: PohonEval, tahap: number, induk = 0): string {
  if (p.k === 'daun') return tahap >= 1 && !p.literal && p.nilai !== undefined ? p.nilai : p.teks
  if (tahap >= 1 && p.nilai !== undefined && tinggi(p) <= tahap - 1) return p.nilai
  if (p.k === 'unary') return `${p.op}${cetakPohon(p.operand, tahap, 11)}`
  const pr = PRESEDENSI[p.op] ?? 0
  const isi = `${cetakPohon(p.kiri, tahap, pr)} ${p.op} ${cetakPohon(p.kanan, tahap, pr + 1)}`
  return pr < induk ? `(${isi})` : isi
}

/** Tulis ulang kondisi bertahap, mis. `nilai[i] > maks` → `7 > 9` → `false`. */
export function tahapEvaluasi(pohon: PohonEval): string[] {
  const hasil: string[] = []
  const t = tinggi(pohon)
  for (let s = 0; s <= t + 1; s++) {
    const teks = cetakPohon(pohon, s)
    if (hasil[hasil.length - 1] !== teks) hasil.push(teks)
  }
  return hasil
}
