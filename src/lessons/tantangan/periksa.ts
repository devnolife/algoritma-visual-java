import type { Diagnostik, Trace } from '@/engine'
import { kalimatKesimpulan, klasifikasi, labelKelas, namaUkuran, urutanKelas, type HasilPertumbuhan, type KonfigPertumbuhan } from '@/engine/pertumbuhan'
import { PembacaTrace, type StateMesin } from '@/engine/trace'
import { isiRantai, telusuriPohon, type NilaiSederhana } from '@/viz/dataStruktur'
import type { Cek, Tantangan } from '../skema'

/** Hasil satu kali menjalankan kode mahasiswa (bentuk minimal dari HasilEngine worker). */
export interface HasilJalan {
  ok: boolean
  diagnostik: Diagnostik[]
  konstruksi: string[]
  trace?: Pick<Trace, 'output' | 'rentangErr' | 'status' | 'exception' | 'akhirMain' | 'akhirStatik' | 'pesanSimulator'> & { langkah: { length: number } }
  galat?: string
  timeout?: boolean
}

export type Penjalan = (sumber: string, input: string) => Promise<HasilJalan>

/** Mengukur program pada beberapa ukuran n (untuk cek `kompleksitas`). */
export type Pengukur = (sumber: string, konfig: KonfigPertumbuhan) => Promise<HasilPertumbuhan>

export interface OpsiPeriksa {
  ukur?: Pengukur
  /** Konfigurasi `pertumbuhan` pelajaran, dipakai cek kompleksitas yang tidak menulis konfigurasinya sendiri. */
  pertumbuhan?: KonfigPertumbuhan
}

export interface HasilCek {
  cek: Cek
  lulus: boolean
  /** Ringkasan satu kalimat, ditampilkan di samping ✔/✘. */
  pesan: string
  /** Rincian tambahan (mis. perbandingan output). */
  rincian?: string
}

export interface HasilTantangan {
  lulus: boolean
  butir: HasilCek[]
}

const NAMA_KONSTRUKSI: Record<string, string> = {
  for: 'perulangan `for`',
  while: 'perulangan `while`',
  'do-while': 'perulangan `do-while`',
  'for-each': 'perulangan for-each (`for (tipe x : array)`)',
  if: 'percabangan `if`',
  switch: 'percabangan `switch`',
  casting: 'casting tipe, mis. `(int) x`',
  ternary: 'operator ternary `? :`',
  array: 'array',
  scanner: '`Scanner` untuk membaca input',
  rekursi: 'rekursi (method yang memanggil dirinya sendiri)',
  break: '`break`',
  continue: '`continue`',
}

export function namaKonstruksi(k: string): string {
  if (k.startsWith('method:')) return `method \`${k.slice(7)}\``
  if (k.startsWith('pustaka:')) return `\`${k.slice(8)}\``
  return NAMA_KONSTRUKSI[k] ?? `\`${k}\``
}

const butuhJalan = (c: Cek) => c.jenis !== 'harusMemakai' && c.jenis !== 'dilarangMemakai' && c.jenis !== 'kompleksitas'
const inputCek = (c: Cek) => ('input' in c ? c.input : '')

/** Output stdout saja (bagian stderr seperti pesan exception dibuang). */
export function stdoutDari(trace: NonNullable<HasilJalan['trace']>): string {
  if (trace.rentangErr.length === 0) return trace.output
  let hasil = ''
  let pos = 0
  for (const [a, b] of trace.rentangErr) {
    hasil += trace.output.slice(pos, a)
    pos = b
  }
  return hasil + trace.output.slice(pos)
}

/** Samakan akhir baris dan abaikan spasi di ujung baris serta baris kosong di akhir output. */
export function rapikanOutput(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((b) => b.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
}

const tampilInput = (input: string) => (input === '' ? '' : ` untuk input \`${input.replace(/\n/g, '⏎').trim()}\``)

function bedaOutput(harapan: string, hasil: string): string {
  const h = harapan.split('\n')
  const k = hasil.split('\n')
  for (let i = 0; i < Math.max(h.length, k.length); i++) {
    if (h[i] !== k[i]) {
      const hb = h[i] === undefined ? '(tidak ada baris lagi)' : `"${h[i]}"`
      const kb = k[i] === undefined ? '(tidak ada baris lagi)' : `"${k[i]}"`
      return `Baris ke-${i + 1} output berbeda.\nDiharapkan: ${hb}\nOutput-mu:  ${kb}`
    }
  }
  return ''
}

/**
 * Mengapa program tidak selesai normal (untuk melengkapi pesan cek), atau null bila selesai.
 * Teks ini tampil apa adanya di blok rincian, jadi tidak memakai format `kode`.
 */
function alasanBerhenti(t: NonNullable<HasilJalan['trace']>): string | null {
  switch (t.status) {
    case 'selesai':
    case 'keluar':
      return null
    case 'exception':
      return `Program berhenti karena ${t.exception?.kelas.split('.').pop() ?? 'exception'} di baris ${t.exception?.baris ?? '?'}.`
    case 'batas-langkah':
      return 'Program dihentikan karena melebihi batas langkah (mungkin perulangan tak berujung).'
    default:
      return t.pesanSimulator ?? 'Program dihentikan oleh simulator.'
  }
}

/** Objek JSON biasa (nilai akhir objek class mahasiswa atau Map), bukan array/null. */
const adalahObjekBiasa = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

/** Kesamaan nilai akhir: angka pecahan dengan toleransi, array per elemen, objek per field (kunci harus sama persis). */
export function samaNilai(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isInteger(a) && Number.isInteger(b)) return a === b
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => samaNilai(x, b[i]))
  if (adalahObjekBiasa(a) && adalahObjekBiasa(b)) {
    const kunci = Object.keys(a)
    return kunci.length === Object.keys(b).length && kunci.every((k) => Object.hasOwn(b, k) && samaNilai(a[k], b[k]))
  }
  return a === b
}

const WRAPPER: Record<string, string> = { Integer: 'int', Long: 'long', Double: 'double', Float: 'float', Short: 'short', Byte: 'byte', Character: 'char', Boolean: 'boolean' }

/** Argumen tipe generik tingkat teratas, mis. `Map<String,List<Integer>>` → [`String`, `List<Integer>`]. */
function argumenTipe(tipe: string | undefined): string[] {
  const i = tipe?.indexOf('<') ?? -1
  if (!tipe || i < 0 || !tipe.endsWith('>')) return []
  const hasil: string[] = []
  let dalam = 0
  let awal = i + 1
  for (let j = awal; j < tipe.length - 1; j++) {
    const c = tipe[j]
    if (c === '<') dalam++
    else if (c === '>') dalam--
    else if (c === ',' && dalam === 0) {
      hasil.push(tipe.slice(awal, j).trim())
      awal = j + 1
    }
  }
  hasil.push(tipe.slice(awal, -1).trim())
  return hasil
}

/**
 * Nilai akhir seperti ditulis di pesan cek: array `{1, 2}`, koleksi `[1, 2]` (tipe generik), Map `{"a"=1}`,
 * objek `{nama="Ani", ipk=3.5}`, String `"hai"`, char `'A'`, pecahan `7.0`.
 */
export const teksNilai = (v: unknown, tipe?: string): string => {
  const t = tipe ? (WRAPPER[tipe] ?? tipe) : undefined
  const argumen = argumenTipe(t)
  if (Array.isArray(v)) {
    if (argumen.length === 1 && !t?.endsWith('[]')) return `[${v.map((x) => teksNilai(x, argumen[0])).join(', ')}]`
    return `{${v.map((x) => teksNilai(x, t?.replace(/\[\]$/, ''))).join(', ')}}`
  }
  if (adalahObjekBiasa(v)) {
    // Map<K,V>: kunci JSON selalu teks; kunci String ditulis berkutip seperti nilai String lainnya.
    const peta = argumen.length === 2
    const isi = Object.entries(v).map(([k, x]) => `${peta && argumen[0] === 'String' ? `"${k}"` : k}=${teksNilai(x, peta ? argumen[1] : undefined)}`)
    return `{${isi.join(', ')}}`
  }
  if (typeof v === 'string') return t === 'char' ? `'${v}'` : `"${v}"`
  // Bilangan pecahan ditulis seperti Java mencetaknya: 7.0, bukan 7.
  if (typeof v === 'number' && (t === 'double' || t === 'float') && Number.isInteger(v)) return `${v}.0`
  return String(v)
}

type CekJalan = Exclude<Cek, { jenis: 'kompleksitas' }>

/** State mesin di akhir program (untuk cek struktur data), bila trace lengkap tersedia. */
function stateAkhir(t: NonNullable<HasilJalan['trace']>): StateMesin | undefined {
  const lengkap = t as Partial<Trace>
  if (!Array.isArray(lengkap.langkah) || !Array.isArray(lengkap.checkpoint) || lengkap.langkah.length === 0 || lengkap.checkpoint.length === 0) return undefined
  return new PembacaTrace(lengkap as Trace).stateDi(lengkap.langkah.length - 1)
}

const teksDaftar = (xs: readonly NilaiSederhana[]) => `[${xs.map((x) => (typeof x === 'string' ? `"${x}"` : String(x))).join(', ')}]`

/** Kode belum bisa dinilai sama sekali (timeout, galat simulator, atau error kompilasi). */
function gagalAwal(c: Cek, h: HasilJalan): HasilCek | null {
  const gagal = (pesan: string, rincian?: string): HasilCek => ({ cek: c, lulus: false, pesan, rincian })
  if (h.timeout) return gagal('Program berjalan terlalu lama dan dihentikan. Periksa apakah ada perulangan yang tidak pernah berhenti.')
  if (h.galat) return gagal('Simulator mengalami galat saat menjalankan kode ini.', h.galat.split('\n')[0])
  if (!h.ok) {
    const d = h.diagnostik[0]
    return gagal('Kode belum bisa dikompilasi. Perbaiki dulu error di tab Masalah.', d ? `Baris ${d.baris}: ${d.pesan}` : undefined)
  }
  return null
}

async function periksaKompleksitas(c: Extract<Cek, { jenis: 'kompleksitas' }>, sumber: string, h: HasilJalan, opsi: OpsiPeriksa): Promise<HasilCek> {
  const gagal = (pesan: string, rincian?: string): HasilCek => ({ cek: c, lulus: false, pesan, rincian })
  const awal = gagalAwal(c, h)
  if (awal) return awal
  const konfig = c.pertumbuhan ?? opsi.pertumbuhan
  if (!konfig || !opsi.ukur) return gagal('Cek kompleksitas ini belum dikonfigurasi dengan benar (hubungi dosen).')
  const hasil = await opsi.ukur(sumber, konfig)
  if (hasil.galat) return gagal('Pertumbuhan program belum bisa diukur.', hasil.galat)
  const daftar = c.seri ? hasil.seri.filter((s) => s.nama === c.seri) : hasil.seri
  if (daftar.length === 0) return gagal(`Seri "${c.seri}" tidak ada di konfigurasi pertumbuhan (hubungi dosen).`)
  const rincian: string[] = []
  let terburuk: { kelas: Parameters<typeof labelKelas>[0]; nama: string } | null = null
  for (const s of daftar) {
    const k = klasifikasi(s.titik)
    const macet = s.titik.find((t) => t.status === 'batas' || t.status === 'exception' || t.status === 'galat')
    const dalamSeri = daftar.length > 1 ? ` (seri ${s.nama})` : ''
    if (macet) return gagal(`Program tidak selesai normal untuk n = ${macet.n}${dalamSeri}.`, macet.pesan ?? macet.status)
    if (!k) {
      const semuaNol = s.titik.every((t) => t.nilai === 0)
      return semuaNol
        ? gagal(
            `Nilai yang diukur (${namaUkuran(konfig.ukur).replace(/`/g, '')}) selalu 0${dalamSeri}, jadi pertumbuhannya tidak bisa disimpulkan.`,
            'Pastikan bagian kode yang diukur benar-benar dijalankan untuk setiap ukuran n.',
          )
        : gagal(`Belum cukup titik untuk menyimpulkan pola pertumbuhan${dalamSeri}.`)
    }
    rincian.push(`${daftar.length > 1 ? `${s.nama}: ` : ''}${kalimatKesimpulan(k, konfig.ukur).replace(/\*\*/g, '')}`)
    if (!terburuk || urutanKelas(k.kelas) > urutanKelas(terburuk.kelas)) terburuk = { kelas: k.kelas, nama: s.nama }
  }
  const kelas = terburuk!.kelas
  if (urutanKelas(kelas) <= urutanKelas(c.maks)) {
    return { cek: c, lulus: true, pesan: `Pertumbuhannya ${labelKelas(kelas)}, tidak lebih buruk dari ${labelKelas(c.maks)}.` }
  }
  return gagal(
    `Pertumbuhannya masih ${labelKelas(kelas)}${daftar.length > 1 ? ` (seri ${terburuk!.nama})` : ''}; yang diminta paling buruk ${labelKelas(c.maks)}.`,
    rincian.join('\n'),
  )
}

function periksaSatu(c: CekJalan, h: HasilJalan): HasilCek {
  const gagal = (pesan: string, rincian?: string): HasilCek => ({ cek: c, lulus: false, pesan, rincian })
  const lulus = (pesan: string): HasilCek => ({ cek: c, lulus: true, pesan })

  const awal = gagalAwal(c, h)
  if (awal) return awal

  switch (c.jenis) {
    case 'harusMemakai':
      return h.konstruksi.includes(c.konstruksi)
        ? lulus(`Memakai ${namaKonstruksi(c.konstruksi)}.`)
        : gagal(`Kode harus memakai ${namaKonstruksi(c.konstruksi)}.`)
    case 'dilarangMemakai':
      return h.konstruksi.includes(c.konstruksi)
        ? gagal(`Selesaikan tanpa memakai ${namaKonstruksi(c.konstruksi)}.`)
        : lulus(`Tidak memakai ${namaKonstruksi(c.konstruksi)}.`)
  }

  const t = h.trace
  if (!t) return gagal('Program tidak menghasilkan jejak eksekusi.')
  const berhenti = alasanBerhenti(t)
  const out = rapikanOutput(stdoutDari(t))
  const inp = tampilInput(c.input)

  switch (c.jenis) {
    case 'output': {
      const harapan = rapikanOutput(c.harapan)
      if (out === harapan) return lulus(`Output sesuai${inp}.`)
      return gagal(`Output belum sesuai${inp}.`, [berhenti, bedaOutput(harapan, out)].filter(Boolean).join('\n'))
    }
    case 'outputMemuat':
      return out.includes(c.harapan)
        ? lulus(`Output memuat "${c.harapan}"${inp}.`)
        : gagal(`Output belum memuat "${c.harapan}"${inp}.`, [berhenti, `Output-mu:\n${out || '(kosong)'}`].filter(Boolean).join('\n'))
    case 'outputPola': {
      let pola: RegExp
      try {
        pola = new RegExp(c.pola, 'm')
      } catch {
        return gagal('Pola cek di tantangan ini tidak valid (hubungi dosen).')
      }
      return pola.test(out)
        ? lulus(`Bentuk output sesuai${inp}.`)
        : gagal(`Bentuk output belum sesuai yang diminta${inp}.`, [berhenti, `Output-mu:\n${out || '(kosong)'}`].filter(Boolean).join('\n'))
    }
    case 'variabel': {
      const v = t.akhirMain[c.nama] ?? t.akhirStatik?.[c.nama]
      if (!v) return gagal(`Variabel \`${c.nama}\` tidak ditemukan di akhir method main.`, berhenti ?? `Pastikan ${c.nama} dideklarasikan langsung di dalam main (bukan di dalam blok if/for) atau sebagai field static.`)
      if (c.tipe && v.tipe !== c.tipe) return gagal(`Variabel \`${c.nama}\` harus bertipe \`${c.tipe}\`, bukan \`${v.tipe}\`.`)
      if (!samaNilai(v.nilai, c.harapan)) return gagal(`Nilai akhir \`${c.nama}\` belum tepat${inp}.`, [berhenti, `Diharapkan ${teksNilai(c.harapan, v.tipe)}, ternyata ${teksNilai(v.nilai, v.tipe)}.`].filter(Boolean).join('\n'))
      return lulus(`\`${c.nama}\` bernilai ${teksNilai(c.harapan, v.tipe)}${inp}.`)
    }
    case 'arrayTerurut': {
      const v = t.akhirMain[c.nama] ?? t.akhirStatik?.[c.nama]
      if (!v || !Array.isArray(v.nilai)) return gagal(`Array \`${c.nama}\` tidak ditemukan di akhir method main.`, berhenti ?? undefined)
      const a = v.nilai as unknown[]
      const terurut = a.every((x, i) => i === 0 || (c.arah === 'naik' ? (a[i - 1] as number) <= (x as number) : (a[i - 1] as number) >= (x as number)))
      const arah = c.arah === 'naik' ? 'dari kecil ke besar' : 'dari besar ke kecil'
      return terurut ? lulus(`\`${c.nama}\` sudah terurut ${arah}.`) : gagal(`\`${c.nama}\` belum terurut ${arah}.`, `Isi akhir: ${teksNilai(a, v.tipe)}`)
    }
    case 'tanpaError':
      return berhenti ? gagal(`Program belum berjalan sampai selesai${inp}.`, berhenti) : lulus(`Program berjalan sampai selesai tanpa error${inp}.`)
    case 'maksLangkah':
      return t.langkah.length <= c.batas
        ? lulus(`Selesai dalam ${t.langkah.length} langkah (batas ${c.batas}).`)
        : gagal(`Program memakai ${t.langkah.length} langkah, padahal batasnya ${c.batas}. Cari cara yang lebih efisien.`)
    case 'isiRantai':
    case 'isiPohon': {
      const s = stateAkhir(t)
      if (!s) return gagal('Isi struktur data tidak bisa dibaca dari jejak eksekusi.', berhenti ?? undefined)
      const rantai = c.jenis === 'isiRantai'
      const nama = rantai ? c.kepala : c.akar
      const h = rantai ? isiRantai(s, c) : telusuriPohon(s, c, c.urutan)
      const apa = rantai ? `Isi rantai \`${nama}\`` : `Isi pohon \`${nama}\` (${c.urutan})`
      if (!h.ok) return gagal(`${apa} belum bisa dibaca di akhir program: ${h.masalah}.`, berhenti ?? undefined)
      if (samaNilai(h.nilai, c.harapan)) return lulus(`${apa} sesuai: ${teksDaftar(c.harapan)}${inp}.`)
      return gagal(`${apa} belum sesuai${inp}.`, [berhenti, `Diharapkan ${teksDaftar(c.harapan)}, ternyata ${teksDaftar(h.nilai)}.`].filter(Boolean).join('\n'))
    }
  }
}

/** Jalankan semua cek sebuah tantangan. Program dijalankan sekali untuk setiap input uji yang berbeda. */
export async function periksaTantangan(t: Tantangan, sumber: string, jalankan: Penjalan, opsi: OpsiPeriksa = {}): Promise<HasilTantangan> {
  const masukan = new Set(t.cek.filter(butuhJalan).map(inputCek))
  if (masukan.size === 0) masukan.add('')
  const hasilPer = new Map<string, HasilJalan>()
  for (const input of masukan) hasilPer.set(input, await jalankan(sumber, input))
  const pertama = hasilPer.values().next().value as HasilJalan
  const butir: HasilCek[] = []
  for (const c of t.cek) {
    if (c.jenis === 'kompleksitas') butir.push(await periksaKompleksitas(c, sumber, pertama, opsi))
    else butir.push(periksaSatu(c, butuhJalan(c) ? hasilPer.get(inputCek(c))! : pertama))
  }
  return { lulus: butir.every((b) => b.lulus), butir }
}
