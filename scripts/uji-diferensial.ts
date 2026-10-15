/**
 * Uji diferensial: bandingkan mesin Java Mini dengan JDK asli. `pnpm uji:diferensial [filter]`
 * - tests/korpus/*.java (+ .in): stdout, stderr (exception + stack trace), dan kode keluar harus identik.
 * - tests/korpus-error/*.java: baris dan teks error pertama harus sama dengan javac (kolom dilaporkan bila beda).
 * Hasil JDK disimpan di node_modules/.cache/uji-diferensial agar run berikutnya cepat.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { jalankan, kompilasi } from '@/engine'

const VERSI_CACHE = 'v1'
const CACHE = join('node_modules', '.cache', 'uji-diferensial')
const PARALEL = 6
const filter = process.argv[2] ?? ''

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

async function jdkJalan(sumber: string, input: string): Promise<HasilProses & { galatKompilasi?: string }> {
  const kunci = hash(VERSI_CACHE, 'jalan', sumber, input)
  return denganCache(kunci, async () => {
    const dir = await siapkanDir(kunci, sumber)
    try {
      const c = await proses('javac', JAVAC, { cwd: dir })
      if (c.kode !== 0) return { stdout: '', stderr: '', kode: null, galatKompilasi: c.stderr }
      return await proses('java', JAVA, { cwd: dir, stdin: input })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
}

interface ErrorPertama {
  baris: number
  kolom: number
  pesan: string
}

async function jdkError(sumber: string): Promise<ErrorPertama | null> {
  const kunci = hash(VERSI_CACHE, 'error', sumber)
  const keluaran = await denganCache(kunci, async () => {
    const dir = await siapkanDir(kunci, sumber)
    try {
      return (await proses('javac', JAVAC, { cwd: dir })).stderr
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
  const baris = keluaran.split('\n')
  const i = baris.findIndex((b) => /^Main\.java:\d+: error: /.test(b))
  if (i < 0) return null
  const m = /^Main\.java:(\d+): error: (.*)$/.exec(baris[i])!
  const caret = baris.slice(i + 1).find((b) => /^\s*\^\s*$/.test(b))
  // javac menampilkan TAB apa adanya; kolom dihitung sebagai indeks karakter + 1.
  return { baris: Number(m[1]), pesan: m[2], kolom: caret ? caret.indexOf('^') + 1 : 0 }
}

function mesinJalan(sumber: string, input: string): { stdout: string; stderr: string; kode: number | null; catatan?: string } {
  const k = kompilasi(sumber)
  if (!k.ok) {
    const d = k.diagnostik[0]
    return { stdout: '', stderr: '', kode: null, catatan: `gagal kompilasi: ${d?.baris}: ${d?.pesan}` }
  }
  const t = jalankan(k, { stdin: input })
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

function bedaTeks(nama: string, jdk: string, mesin: string): string | null {
  if (jdk === mesin) return null
  const a = jdk.split('\n')
  const b = mesin.split('\n')
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      const f = (s: string | undefined) => (s === undefined ? redup('(tidak ada)') : JSON.stringify(s))
      return `${nama} berbeda di baris ${i + 1}:\n      JDK:   ${f(a[i])}\n      Mesin: ${f(b[i])}`
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

async function ujiKorpus(): Promise<{ total: number; gagal: number }> {
  const dir = join('tests', 'korpus')
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
    const e = bedaTeks('stderr', jdk.stderr, mesin.stderr)
    if (e) masalah.push(e)
    if (!mesin.catatan && jdk.kode !== mesin.kode) masalah.push(`kode keluar berbeda: JDK ${jdk.kode}, mesin ${mesin.kode}`)
    return { f, masalah }
  })
  console.log(`\n${'Korpus program'} ${redup(`(${dir})`)}`)
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
  const dir = join('tests', 'korpus-error')
  const berkas = daftarBerkas(dir)
  let bedaKolom = 0
  const hasil = await paralel(berkas, async (f) => {
    const sumber = rapikan(readFileSync(join(dir, f), 'utf8'))
    const jdk = await jdkError(sumber)
    const k = kompilasi(sumber)
    const d = k.diagnostik[0]
    if (!jdk) return { f, masalah: 'javac tidak melaporkan error (perbaiki korpus)' }
    if (!d) return { f, masalah: `mesin tidak menemukan error; javac: ${jdk.baris}: ${jdk.pesan}` }
    if (d.baris !== jdk.baris || d.pesan !== jdk.pesan) {
      return { f, masalah: `error pertama berbeda:\n      JDK:   ${jdk.baris}:${jdk.kolom} ${jdk.pesan}\n      Mesin: ${d.baris}:${d.kolom} ${d.pesan}` }
    }
    if (jdk.kolom && d.kolom !== jdk.kolom) {
      bedaKolom++
      return { f, masalah: null, peringatan: `kolom berbeda (JDK ${jdk.kolom}, mesin ${d.kolom}) untuk "${jdk.pesan}"` }
    }
    return { f, masalah: null }
  })
  console.log(`\n${'Korpus error kompilasi'} ${redup(`(${dir})`)}`)
  for (const h of hasil) {
    if (h.masalah) console.log(`  ${merah('✘')} ${h.f}\n    ${h.masalah}`)
    else if ('peringatan' in h && h.peringatan) console.log(`  ${kuning('!')} ${h.f}\n    ${h.peringatan}`)
  }
  const gagal = hasil.filter((h) => h.masalah).length
  console.log(`  ${gagal === 0 ? hijau('✔') : merah('✘')} ${hasil.length - gagal}/${hasil.length} cocok${bedaKolom ? kuning(` (${bedaKolom} beda kolom)`) : ''}`)
  return { total: hasil.length, gagal }
}

async function utama(): Promise<void> {
  const mulai = performance.now()
  const a = await ujiKorpus()
  const b = await ujiKorpusError()
  const durasi = ((performance.now() - mulai) / 1000).toFixed(1)
  const gagal = a.gagal + b.gagal
  console.log(`\n${a.total + b.total} program dibandingkan dengan JDK dalam ${durasi} dtk: ${gagal ? merah(`${gagal} berbeda`) : hijau('semua cocok')}.`)
  process.exit(gagal ? 1 : 0)
}

void utama()
