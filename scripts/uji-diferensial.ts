/**
 * Uji diferensial: bandingkan mesin Java Mini dengan JDK asli. `pnpm uji:diferensial [filter] [--opsi]`
 * - tests/korpus/*.java (+ .in): stdout, stderr (exception + stack trace), dan kode keluar harus identik.
 * - tests/korpus-error/*.java: baris dan teks error pertama harus sama dengan javac (kolom dilaporkan bila beda).
 * Hasil JDK disimpan di node_modules/.cache/uji-diferensial agar run berikutnya cepat.
 * `filter` mempersempit berkas berdasarkan nama, mis. `pnpm uji:diferensial hashmap`.
 *
 * `--hanya-jdk`: proses korpus dengan JDK saja, tanpa mesin, lalu tampilkan cuplikan hasilnya untuk diperiksa mata.
 * Dipakai untuk memeriksa program korpus baru sebelum mesin mendukungnya (persempit dengan filter).
 * `--ulang` (bersama `--hanya-jdk`): jalankan tiap program dua kali lagi tanpa cache dan laporkan keluaran yang berubah.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type * as Mesin from '@/engine'

const VERSI_CACHE = 'v2'
const CACHE = join('node_modules', '.cache', 'uji-diferensial')
const PARALEL = 6

const OPSI = ['--hanya-jdk', '--ulang']
// Pemisah `--` (pnpm 10 membuangnya sendiri, pemanggil lain bisa meneruskannya) bukan opsi; abaikan.
const argumen = process.argv.slice(2).filter((a) => a !== '--')
const bendera = argumen.filter((a) => a.startsWith('--'))
const filter = argumen.find((a) => !a.startsWith('--')) ?? ''
const opsiAsing = bendera.filter((b) => !OPSI.includes(b))
if (opsiAsing.length > 0) {
  console.error(`Opsi tidak dikenal: ${opsiAsing.join(', ')}. Opsi yang tersedia: ${OPSI.join(', ')}.`)
  process.exit(2)
}
const hanyaJdk = bendera.includes('--hanya-jdk')
const ulang = bendera.includes('--ulang')
if (ulang && !hanyaJdk) {
  console.error('Opsi --ulang hanya berlaku bersama --hanya-jdk.')
  process.exit(2)
}

/** Dimuat dinamis agar mode `--hanya-jdk` tetap berjalan walau mesin sedang diubah atau rusak. */
let modulMesin: typeof Mesin

const warna = (kode: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${kode}m${s}\x1b[0m` : s)
const merah = warna(31)
const hijau = warna(32)
const kuning = warna(33)
const redup = warna(2)

const rapikan = (s: string) => s.replace(/\r\n/g, '\n')
const hash = (...bagian: string[]) => createHash('sha1').update(bagian.join('\0')).digest('hex').slice(0, 16)

interface HasilProses {
  stdout: string
  stderr: string
  kode: number | null
}

function proses(perintah: string, argumen: string[], opsi: { cwd: string; stdin?: string; batasMs?: number }): Promise<HasilProses> {
  return new Promise((resolve) => {
    const p = spawn(perintah, argumen, { cwd: opsi.cwd, windowsHide: true })
    let stdout = ''
    let stderr = ''
    p.stdout.setEncoding('utf8').on('data', (d: string) => (stdout += d))
    p.stderr.setEncoding('utf8').on('data', (d: string) => (stderr += d))
    const timer = setTimeout(() => p.kill(), opsi.batasMs ?? 10_000)
    p.on('close', (kode) => {
      clearTimeout(timer)
      resolve({ stdout: rapikan(stdout), stderr: rapikan(stderr), kode })
    })
    p.stdin.end(opsi.stdin ?? '')
  })
}

async function denganCache<T>(kunci: string, hitung: () => Promise<T>): Promise<T> {
  const berkas = join(CACHE, `${kunci}.json`)
  if (existsSync(berkas)) return JSON.parse(readFileSync(berkas, 'utf8')) as T
  const hasil = await hitung()
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(berkas, JSON.stringify(hasil))
  return hasil
}

async function siapkanDir(kunci: string, sumber: string): Promise<string> {
  const dir = join(tmpdir(), 'uji-diferensial', kunci)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(join(dir, 'out'), { recursive: true })
  writeFileSync(join(dir, 'Main.java'), sumber)
  return dir
}

const JAVAC = ['-J-Duser.language=en', '-J-Duser.country=US', '-encoding', 'UTF-8', '-g', '-d', 'out', 'Main.java']
const JAVA = ['-Duser.language=en', '-Duser.country=US', '-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', '-cp', 'out', 'Main']

/** Frame internal JDK (`at java.base/...`) tidak disimulasikan; yang dibandingkan hanya pesan + frame kode mahasiswa. */
const tanpaFrameJdk = (s: string) =>
  s
    .split('\n')
    .filter((b) => !/^\tat java\.base\//.test(b))
    .join('\n')

type HasilJdk = HasilProses & { galatKompilasi?: string }

/** Kompilasi sekali lalu jalankan `kali` kali, selalu tanpa cache. */
async function jdkJalanLangsung(kunci: string, sumber: string, input: string, kali: number): Promise<HasilJdk[]> {
  const dir = await siapkanDir(kunci, sumber)
  try {
    const c = await proses('javac', JAVAC, { cwd: dir })
    if (c.kode !== 0) return [{ stdout: '', stderr: '', kode: null, galatKompilasi: c.stderr }]
    const hasil: HasilJdk[] = []
    for (let i = 0; i < kali; i++) hasil.push(await proses('java', JAVA, { cwd: dir, stdin: input }))
    return hasil
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function jdkJalan(sumber: string, input: string): Promise<HasilJdk> {
  const kunci = hash(VERSI_CACHE, 'jalan', sumber, input)
  return denganCache(kunci, async () => (await jdkJalanLangsung(kunci, sumber, input, 1))[0])
}

interface ErrorPertama {
  baris: number
  kolom: number
  pesan: string
  /** Baris detail setelah caret, mis. `symbol:   method printn(String)` dan `location: …`. */
  detail: string[]
}

/** Keluaran stderr javac apa adanya (dari cache bila ada). */
async function javacStderr(sumber: string): Promise<string> {
  const kunci = hash(VERSI_CACHE, 'error', sumber)
  return denganCache(kunci, async () => {
    const dir = await siapkanDir(kunci, sumber)
    try {
      return (await proses('javac', JAVAC, { cwd: dir })).stderr
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
}

function errorPertama(keluaran: string): ErrorPertama | null {
  const baris = keluaran.split('\n')
  const i = baris.findIndex((b) => /^Main\.java:\d+: error: /.test(b))
  if (i < 0) return null
  const m = /^Main\.java:(\d+): error: (.*)$/.exec(baris[i])!
  const iCaret = baris.findIndex((b, j) => j > i && /^\s*\^\s*$/.test(b))
  const caret = iCaret >= 0 ? baris[iCaret] : undefined
  const detail: string[] = []
  for (let j = iCaret + 1; iCaret >= 0 && j < baris.length; j++) {
    const b = baris[j]
    if (/^Main\.java:\d+: /.test(b) || /^\d+ errors?$/.test(b) || b.startsWith('Note:') || b.trim() === '') break
    detail.push(b.trim())
  }
  // javac menampilkan TAB apa adanya; kolom dihitung sebagai indeks karakter + 1.
  return { baris: Number(m[1]), pesan: m[2], kolom: caret ? caret.indexOf('^') + 1 : 0, detail }
}

async function jdkError(sumber: string): Promise<ErrorPertama | null> {
  return errorPertama(await javacStderr(sumber))
}

function mesinJalan(sumber: string, input: string): { stdout: string; stderr: string; kode: number | null; catatan?: string } {
  const k = modulMesin.kompilasi(sumber)
  if (!k.ok) {
    const d = k.diagnostik[0]
    return { stdout: '', stderr: '', kode: null, catatan: `gagal kompilasi: ${d?.baris}: ${d?.pesan}` }
  }
  const t = modulMesin.jalankan(k, { stdin: input })
  let stdout = ''
  let stderr = ''
  let pos = 0
  for (const [a, b] of t.rentangErr) {
    stdout += t.output.slice(pos, a)
    stderr += t.output.slice(a, b)
    pos = b
  }
  stdout += t.output.slice(pos)
  const kode = t.status === 'selesai' ? 0 : t.status === 'exception' ? 1 : t.status === 'keluar' ? (t.kodeKeluar ?? 0) : null
  const catatan = kode === null ? `mesin berhenti: ${t.status}${t.pesanSimulator ? ` (${t.pesanSimulator})` : ''}` : undefined
  return { stdout, stderr, kode, catatan }
}

function bedaTeks(nama: string, jdk: string, mesin: string, label: [string, string] = ['JDK', 'Mesin']): string | null {
  if (jdk === mesin) return null
  const a = jdk.split('\n')
  const b = mesin.split('\n')
  const lebar = Math.max(label[0].length, label[1].length) + 2
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      const f = (s: string | undefined) => (s === undefined ? redup('(tidak ada)') : JSON.stringify(s))
      return `${nama} berbeda di baris ${i + 1}:\n      ${`${label[0]}:`.padEnd(lebar)}${f(a[i])}\n      ${`${label[1]}:`.padEnd(lebar)}${f(b[i])}`
    }
  }
  return `${nama} berbeda`
}

async function paralel<T, H>(daftar: T[], f: (x: T) => Promise<H>): Promise<H[]> {
  const hasil: H[] = new Array(daftar.length)
  let berikut = 0
  await Promise.all(
    Array.from({ length: Math.min(PARALEL, daftar.length) }, async () => {
      while (berikut < daftar.length) {
        const i = berikut++
        hasil[i] = await f(daftar[i])
      }
    }),
  )
  return hasil
}

function daftarBerkas(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.java') && f.includes(filter))
    .sort()
}

const DIR_KORPUS = join('tests', 'korpus')
const DIR_KORPUS_ERROR = join('tests', 'korpus-error')

async function ujiKorpus(): Promise<{ total: number; gagal: number }> {
  const dir = DIR_KORPUS
  const berkas = daftarBerkas(dir)
  const hasil = await paralel(berkas, async (f) => {
    const sumber = rapikan(readFileSync(join(dir, f), 'utf8'))
    const fileInput = join(dir, f.replace(/\.java$/, '.in'))
    const input = existsSync(fileInput) ? rapikan(readFileSync(fileInput, 'utf8')) : ''
    const jdk = await jdkJalan(sumber, input)
    const masalah: string[] = []
    if (jdk.galatKompilasi !== undefined) {
      masalah.push(`javac gagal mengompilasi (perbaiki korpus):\n      ${jdk.galatKompilasi.split('\n').slice(0, 3).join('\n      ')}`)
      return { f, masalah }
    }
    let mesin
    try {
      mesin = mesinJalan(sumber, input)
    } catch (e) {
      masalah.push(`mesin melempar galat internal: ${(e as Error).message}`)
      return { f, masalah }
    }
    if (mesin.catatan) masalah.push(mesin.catatan)
    const o = bedaTeks('stdout', jdk.stdout, mesin.stdout)
    if (o) masalah.push(o)
    const e = bedaTeks('stderr', tanpaFrameJdk(jdk.stderr), mesin.stderr)
    if (e) masalah.push(e)
    if (!mesin.catatan && jdk.kode !== mesin.kode) masalah.push(`kode keluar berbeda: JDK ${jdk.kode}, mesin ${mesin.kode}`)
    return { f, masalah }
  })
  console.log(`\nKorpus program ${redup(`(${dir})`)}`)
  for (const h of hasil) {
    if (h.masalah.length === 0) continue
    console.log(`  ${merah('✘')} ${h.f}`)
    for (const m of h.masalah) console.log(`    ${m}`)
  }
  const gagal = hasil.filter((h) => h.masalah.length > 0).length
  console.log(`  ${gagal === 0 ? hijau('✔') : merah('✘')} ${hasil.length - gagal}/${hasil.length} cocok`)
  return { total: hasil.length, gagal }
}

async function ujiKorpusError(): Promise<{ total: number; gagal: number }> {
  const dir = DIR_KORPUS_ERROR
  const berkas = daftarBerkas(dir)
  let bedaKolom = 0
  const hasil = await paralel(berkas, async (f) => {
    const sumber = rapikan(readFileSync(join(dir, f), 'utf8'))
    const jdk = await jdkError(sumber)
    const k = modulMesin.kompilasi(sumber)
    const d = k.diagnostik[0]
    if (!jdk) return { f, masalah: 'javac tidak melaporkan error (perbaiki korpus)' }
    if (!d) return { f, masalah: `mesin tidak menemukan error; javac: ${jdk.baris}: ${jdk.pesan}` }
    if (d.baris !== jdk.baris || d.pesan !== jdk.pesan) {
      return { f, masalah: `error pertama berbeda:\n      JDK:   ${jdk.baris}:${jdk.kolom} ${jdk.pesan}\n      Mesin: ${d.baris}:${d.kolom} ${d.pesan}` }
    }
    const detailMesin = d.detail.map((x) => x.trim())
    if (jdk.detail.join('\n') !== detailMesin.join('\n')) {
      return { f, masalah: `detail error berbeda untuk "${jdk.pesan}":\n      JDK:   ${JSON.stringify(jdk.detail)}\n      Mesin: ${JSON.stringify(detailMesin)}` }
    }
    if (jdk.kolom && d.kolom !== jdk.kolom) {
      bedaKolom++
      return { f, masalah: null, peringatan: `kolom berbeda (JDK ${jdk.kolom}, mesin ${d.kolom}) untuk "${jdk.pesan}"` }
    }
    return { f, masalah: null }
  })
  console.log(`\nKorpus error kompilasi ${redup(`(${dir})`)}`)
  for (const h of hasil) {
    if (h.masalah) console.log(`  ${merah('✘')} ${h.f}\n    ${h.masalah}`)
    else if ('peringatan' in h && h.peringatan) console.log(`  ${kuning('!')} ${h.f}\n    ${h.peringatan}`)
  }
  const gagal = hasil.filter((h) => h.masalah).length
  console.log(`  ${gagal === 0 ? hijau('✔') : merah('✘')} ${hasil.length - gagal}/${hasil.length} cocok${bedaKolom ? kuning(` (${bedaKolom} beda kolom)`) : ''}`)
  return { total: hasil.length, gagal }
}

/** Batas aman di bawah batas keluaran simulator (10.000 karakter). */
const BATAS_KELUARAN = 8_000
/** `Object.toString()` bawaan (mis. `Simpul@1b6d3586`, `[I@4554617c`) memuat hash identitas yang tidak bisa ditiru simulator. */
const POLA_HASH_IDENTITAS = /(?:\[+[BCDFIJSZ]|\[+L[\w$.]+;|\b[A-Z][\w$.]*)@[0-9a-f]{1,8}(?![\w.@])/

/** `n` baris pertama, ditambah keterangan jumlah baris yang disembunyikan. */
function cuplikan(teks: string, awalan: string, n = 2): string[] {
  const baris = teks.replace(/\n$/, '').split('\n')
  const tampil = baris.slice(0, n).map((b) => `      ${awalan} ${b}`)
  if (baris.length > n) tampil.push(`      ${awalan} ${redup(`… (+${baris.length - n} baris)`)}`)
  return tampil
}

/** Perbedaan stdout, stderr (tanpa frame JDK), dan kode keluar antara dua run JDK. */
function bedaRun(a: HasilJdk, b: HasilJdk, label: [string, string]): string[] {
  const beda = [bedaTeks('stdout', a.stdout, b.stdout, label), bedaTeks('stderr', tanpaFrameJdk(a.stderr), tanpaFrameJdk(b.stderr), label)]
  if (a.kode !== b.kode) beda.push(`kode keluar berbeda: ${label[0]} ${a.kode}, ${label[1]} ${b.kode}`)
  return beda.filter((x): x is string => x !== null)
}

async function ujiJdkKorpus(): Promise<{ total: number; gagal: number }> {
  const dir = DIR_KORPUS
  const berkas = daftarBerkas(dir)
  const hasil = await paralel(berkas, async (f) => {
    const sumber = rapikan(readFileSync(join(dir, f), 'utf8'))
    const fileInput = join(dir, f.replace(/\.java$/, '.in'))
    const input = existsSync(fileInput) ? rapikan(readFileSync(fileInput, 'utf8')) : ''
    const jdk = await jdkJalan(sumber, input)
    const masalah: string[] = []
    if (jdk.galatKompilasi !== undefined) {
      masalah.push(`javac gagal mengompilasi:\n      ${jdk.galatKompilasi.split('\n').slice(0, 3).join('\n      ')}`)
      return { f, kode: jdk.kode, masalah, info: [] }
    }
    const stderr = tanpaFrameJdk(jdk.stderr)
    const info = [...(jdk.stdout ? cuplikan(jdk.stdout, '│') : []), ...(stderr ? cuplikan(stderr, kuning('!')) : [])]
    if (jdk.kode === null) masalah.push('java dihentikan karena melewati batas waktu')
    const panjang = jdk.stdout.length + stderr.length
    if (panjang >= BATAS_KELUARAN) masalah.push(`keluaran ${panjang} karakter, melewati batas aman ${BATAS_KELUARAN}`)
    const identitas = POLA_HASH_IDENTITAS.exec(jdk.stdout + stderr)
    if (identitas) masalah.push(`keluaran memuat hash identitas "${identitas[0]}" (toString/hashCode bawaan Object tidak deterministik)`)
    if (ulang) {
      const [r1, r2] = await jdkJalanLangsung(hash(VERSI_CACHE, 'ulang', sumber, input), sumber, input, 2)
      if (r1.galatKompilasi !== undefined || !r2) masalah.push('run ulang: javac gagal mengompilasi')
      else {
        for (const b of bedaRun(r1, r2, ['Ulang 1', 'Ulang 2'])) masalah.push(`tidak deterministik, ${b}`)
        for (const b of bedaRun(jdk, r1, ['Awal', 'Ulang 1'])) masalah.push(`hasil awal (cache) tidak terulang, ${b}`)
      }
    }
    return { f, kode: jdk.kode, masalah, info }
  })
  console.log(`\nKorpus program, hanya JDK ${redup(`(${dir})`)}`)
  for (const h of hasil) {
    console.log(`  ${h.masalah.length ? merah('✘') : hijau('✔')} ${h.f} ${redup(`kode keluar ${h.kode}`)}`)
    for (const b of h.info) console.log(b)
    for (const m of h.masalah) console.log(`    ${merah(m)}`)
  }
  const gagal = hasil.filter((h) => h.masalah.length > 0).length
  console.log(`  ${gagal === 0 ? hijau('✔') : merah('✘')} ${hasil.length - gagal}/${hasil.length} lolos${ulang ? ' (termasuk cek determinisme)' : ''}`)
  return { total: hasil.length, gagal }
}

async function ujiJdkKorpusError(): Promise<{ total: number; gagal: number }> {
  const dir = DIR_KORPUS_ERROR
  const berkas = daftarBerkas(dir)
  const hasil = await paralel(berkas, async (f) => {
    const keluaran = await javacStderr(rapikan(readFileSync(join(dir, f), 'utf8')))
    const jdk = errorPertama(keluaran)
    if (!jdk) return { f, masalah: 'javac tidak melaporkan error', info: [] }
    const jumlah = /^(\d+) errors?$/m.exec(keluaran)?.[0] ?? '?'
    const info = [
      `      Main.java:${jdk.baris}: error: ${jdk.pesan} ${redup(`(kolom ${jdk.kolom}; javac: ${jumlah})`)}`,
      ...jdk.detail.map((d) => `        ${redup(d)}`),
    ]
    return { f, masalah: null, info }
  })
  console.log(`\nKorpus error kompilasi, hanya javac ${redup(`(${dir})`)}`)
  for (const h of hasil) {
    console.log(`  ${h.masalah ? merah('✘') : hijau('✔')} ${h.f}`)
    for (const b of h.info) console.log(b)
    if (h.masalah) console.log(`    ${merah(h.masalah)}`)
  }
  const gagal = hasil.filter((h) => h.masalah).length
  console.log(`  ${gagal === 0 ? hijau('✔') : merah('✘')} ${hasil.length - gagal}/${hasil.length} lolos`)
  return { total: hasil.length, gagal }
}

async function utamaHanyaJdk(): Promise<void> {
  const mulai = performance.now()
  const a = await ujiJdkKorpus()
  const b = await ujiJdkKorpusError()
  const durasi = ((performance.now() - mulai) / 1000).toFixed(1)
  const gagal = a.gagal + b.gagal
  console.log(`\n${a.total + b.total} program diperiksa dengan JDK dalam ${durasi} dtk: ${gagal ? merah(`${gagal} gagal`) : hijau('semua lolos')}.`)
  process.exit(gagal ? 1 : 0)
}

async function utama(): Promise<void> {
  if (hanyaJdk) return utamaHanyaJdk()
  modulMesin = await import('@/engine')
  const mulai = performance.now()
  const a = await ujiKorpus()
  const b = await ujiKorpusError()
  const durasi = ((performance.now() - mulai) / 1000).toFixed(1)
  const gagal = a.gagal + b.gagal
  console.log(`\n${a.total + b.total} program dibandingkan dengan JDK dalam ${durasi} dtk: ${gagal ? merah(`${gagal} berbeda`) : hijau('semua cocok')}.`)
  process.exit(gagal ? 1 : 0)
}

void utama()
