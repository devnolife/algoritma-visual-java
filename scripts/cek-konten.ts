/**
 * Validator materi: `pnpm cek-konten`
 * - skema modul.yaml, frontmatter pelajaran.md, dan tantangan.yaml valid;
 * - kode awal (Main.java) bisa dikompilasi dan dijalankan;
 * - setiap tantangan punya solusi `solusi/<id>.java` yang lulus semua cek;
 * - kode awal belum langsung lulus tantangan;
 * - setiap penanda `// #nama` punya `## Catatan #nama`, dan sebaliknya;
 * - variabel yang disebut di `visual`/`pantau` memang muncul saat program berjalan.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { jalankan, kompilasi, PembacaTrace } from '@/engine'
import { periksaTantangan } from '@/lessons/tantangan/periksa'
import { penjalanLangsung } from '@/lessons/tantangan/penjalanLangsung'
import { GalatKonten, susunKonten, type Pelajaran } from '@/lessons/urai'

const AKAR = process.env.KONTEN ?? 'content'
const warna = (kode: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${kode}m${s}\x1b[0m` : s)
const merah = warna(31)
const kuning = warna(33)
const hijau = warna(32)
const redup = warna(2)

let jumlahError = 0
let jumlahPeringatan = 0
const error = (lokasi: string, pesan: string) => {
  jumlahError++
  console.log(`  ${merah('✘ error')} ${redup(lokasi)}\n    ${pesan.replace(/\n/g, '\n    ')}`)
}
const peringatan = (lokasi: string, pesan: string) => {
  jumlahPeringatan++
  console.log(`  ${kuning('! peringatan')} ${redup(lokasi)}\n    ${pesan.replace(/\n/g, '\n    ')}`)
}

function kumpulkanBerkas(): Record<string, string> {
  const hasil: Record<string, string> = {}
  for (const modul of readdirSync(AKAR)) {
    const dirModul = join(AKAR, modul)
    if (!statSync(dirModul).isDirectory()) continue
    if (existsSync(join(dirModul, 'modul.yaml'))) hasil[`${modul}/modul.yaml`] = readFileSync(join(dirModul, 'modul.yaml'), 'utf8')
    for (const pel of readdirSync(dirModul)) {
      const dir = join(dirModul, pel)
      if (!statSync(dir).isDirectory()) continue
      for (const nama of ['pelajaran.md', 'Main.java', 'tantangan.yaml']) {
        if (existsSync(join(dir, nama))) hasil[`${modul}/${pel}/${nama}`] = readFileSync(join(dir, nama), 'utf8')
      }
    }
  }
  return hasil
}

/** Semua nama variabel yang pernah ada di frame mana pun selama program berjalan. */
function namaVariabelTerpakai(sumber: string, input: string, batasLangkah?: number): Set<string> {
  const k = kompilasi(sumber)
  const nama = new Set<string>()
  if (!k.ok) return nama
  const trace = jalankan(k, { stdin: input, batasLangkah })
  const pembaca = new PembacaTrace(trace)
  for (let i = 0; i < trace.langkah.length; i++) {
    for (const f of pembaca.stateDi(i).frames) for (const v of f.vars) nama.add(v.nama)
  }
  return nama
}

async function cekPelajaran(p: Pelajaran): Promise<void> {
  const lokasi = `content/${p.kunci}`
  const dir = join(AKAR, p.modul, p.slug)

  // 1. Kode awal bisa dikompilasi & dijalankan.
  const k = kompilasi(p.kode)
  if (!k.ok) {
    const d = k.diagnostik[0]
    error(`${lokasi}/Main.java:${d?.baris ?? '?'}`, `Kode awal tidak bisa dikompilasi: ${d?.pesan ?? 'error tidak diketahui'}`)
    return
  }
  const trace = jalankan(k, { stdin: p.meta.input, batasLangkah: p.meta.batasLangkah })
  if (trace.status !== 'selesai' && trace.status !== 'exception') {
    peringatan(`${lokasi}/Main.java`, `Kode awal berhenti dengan status "${trace.status}" (${trace.langkah.length} langkah).`)
  }
  if (trace.status === 'exception') {
    peringatan(`${lokasi}/Main.java`, `Kode awal berakhir dengan ${trace.exception?.kelas} di baris ${trace.exception?.baris}. Pastikan ini disengaja.`)
  }

  // 2. Pasangan penanda ↔ catatan.
  const penanda = new Set(Object.values(k.penanda))
  for (const n of penanda) if (!p.catatan[n]) error(`${lokasi}/pelajaran.md`, `Penanda \`// #${n}\` di Main.java belum punya bagian "## Catatan #${n}".`)
  for (const n of Object.keys(p.catatan)) if (!penanda.has(n)) error(`${lokasi}/pelajaran.md`, `"## Catatan #${n}" tidak dipakai: tidak ada komentar \`// #${n}\` di Main.java.`)
  for (const [n, isi] of Object.entries(p.catatan)) if (!isi.trim()) error(`${lokasi}/pelajaran.md`, `"## Catatan #${n}" masih kosong.`)

  // 3. Variabel di konfigurasi visual & pantau memang ada.
  const terpakai = namaVariabelTerpakai(p.kode, p.meta.input, p.meta.batasLangkah)
  const disebut = new Set<string>(p.meta.pantau)
  for (const v of p.meta.visual) {
    if ('variabel' in v) disebut.add(v.variabel)
    if (v.jenis === 'array') for (const x of v.penunjuk ?? []) disebut.add(x)
    if (v.jenis === 'array2d') for (const x of [v.baris, v.kolom]) if (x) disebut.add(x)
  }
  for (const n of disebut) if (!terpakai.has(n)) peringatan(`${lokasi}/pelajaran.md`, `Variabel \`${n}\` disebut di visual/pantau, tetapi tidak pernah muncul saat kode awal dijalankan.`)

  // 4. Tantangan: solusi lulus, kode awal belum lulus.
  const jalan = penjalanLangsung(p.meta.batasLangkah)
  const idTantangan = new Set<string>()
  for (const t of p.tantangan) {
    if (idTantangan.has(t.id)) error(`${lokasi}/tantangan.yaml`, `id tantangan "${t.id}" dipakai lebih dari sekali.`)
    idTantangan.add(t.id)
    const berkasSolusi = join(dir, 'solusi', `${t.id}.java`)
    if (!existsSync(berkasSolusi)) {
      error(`${lokasi}/tantangan.yaml`, `Solusi untuk tantangan "${t.id}" belum ada. Buat berkas solusi/${t.id}.java.`)
      continue
    }
    const solusi = readFileSync(berkasSolusi, 'utf8').replace(/\r\n/g, '\n')
    const hs = await periksaTantangan(t, solusi, jalan)
    if (!hs.lulus) {
      const gagal = hs.butir.filter((b) => !b.lulus).map((b) => `- ${b.pesan}${b.rincian ? `\n  ${b.rincian.replace(/\n/g, '\n  ')}` : ''}`)
      error(`${lokasi}/solusi/${t.id}.java`, `Solusi tidak lulus tantangan "${t.id}":\n${gagal.join('\n')}`)
    }
    const ha = await periksaTantangan(t, p.kode, jalan)
    if (ha.lulus) error(`${lokasi}/tantangan.yaml`, `Kode awal sudah lulus tantangan "${t.id}" tanpa diubah. Tambahkan cek yang menuntut perubahan.`)
  }
  if (existsSync(join(dir, 'solusi'))) {
    for (const f of readdirSync(join(dir, 'solusi'))) {
      const id = f.replace(/\.java$/, '')
      if (!idTantangan.has(id)) peringatan(`${lokasi}/solusi/${f}`, `Tidak ada tantangan dengan id "${id}".`)
    }
  }
  if (p.tantangan.length === 0) peringatan(`${lokasi}`, 'Pelajaran ini belum punya tantangan.')
}

async function utama(): Promise<void> {
  const mulai = performance.now()
  let modul
  try {
    modul = susunKonten(kumpulkanBerkas())
  } catch (e) {
    if (e instanceof GalatKonten) {
      error(e.berkas, e.message.slice(e.berkas.length + 2))
      console.log(`\n${merah('Gagal')}: berkas materi tidak valid.`)
      process.exit(1)
    }
    throw e
  }
  let jumlahPelajaran = 0
  for (const m of modul) {
    console.log(`\n${m.meta.judul} ${redup(`(content/${m.slug})`)}`)
    const urutan = new Map<number, string>()
    for (const p of m.pelajaran) {
      jumlahPelajaran++
      const lama = urutan.get(p.meta.urutan)
      if (lama) error(`content/${p.kunci}/pelajaran.md`, `urutan ${p.meta.urutan} sama dengan pelajaran ${lama}.`)
      urutan.set(p.meta.urutan, p.slug)
      const sebelum = jumlahError
      await cekPelajaran(p)
      if (jumlahError === sebelum) console.log(`  ${hijau('✔')} ${p.meta.urutan}. ${p.meta.judul} ${redup(`· ${p.tantangan.length} tantangan`)}`)
    }
  }
  const durasi = ((performance.now() - mulai) / 1000).toFixed(1)
  console.log(`\n${jumlahPelajaran} pelajaran diperiksa dalam ${durasi} dtk: ${jumlahError ? merah(`${jumlahError} error`) : hijau('0 error')}, ${jumlahPeringatan} peringatan.`)
  process.exit(jumlahError ? 1 : 0)
}

void utama()
