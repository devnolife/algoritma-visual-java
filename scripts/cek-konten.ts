/**
 * Validator materi: `pnpm cek-konten`
 * - skema modul.yaml, frontmatter pelajaran.md, dan tantangan.yaml valid;
 * - kode awal (Main.java) bisa dikompilasi dan dijalankan;
 * - setiap tantangan punya solusi `solusi/<id>.java` yang lulus semua cek;
 * - kode awal belum langsung lulus tantangan;
 * - setiap penanda `// #nama` punya `## Catatan #nama`, dan sebaliknya;
 * - variabel yang disebut di `visual`/`pantau` memang muncul saat program berjalan, termasuk akar jalur dan nama field
 *   pada visual struktur data (`daftar.head`, `berikut: next`);
 * - grafik `pertumbuhan` bisa diukur pada kode awal.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { jalankan, kompilasi, PembacaTrace, type Trace } from '@/engine'
import { analisisKonstruksi } from '@/engine/analisis'
import { ukurPertumbuhan } from '@/engine/ukurPertumbuhan'
import type { KonfigVisualPelajaran } from '@/lessons/skema'
import { periksaTantangan } from '@/lessons/tantangan/periksa'
import { pengukurLangsung, penjalanLangsung } from '@/lessons/tantangan/penjalanLangsung'
import { GalatKonten, susunKonten, type Pelajaran } from '@/lessons/urai'
import { bagianJalur } from '@/viz/jalur'

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
    const s = pembaca.stateDi(i)
    for (const f of s.frames) for (const v of f.vars) nama.add(v.nama)
    for (const v of s.statik) nama.add(v.nama)
  }
  return nama
}

/** Nama field semua objek yang pernah dibuat (class mahasiswa maupun simpul internal koleksi). */
function namaFieldTerpakai(trace: Trace): Set<string> {
  const nama = new Set<string>()
  for (const l of trace.langkah) {
    for (const p of l.peristiwa) if (p.k === 'alokasi' && p.objek.k === 'objek') for (const f of Object.keys(p.objek.field)) nama.add(f)
  }
  return nama
}

/**
 * Jalur dan nama field yang disebut renderer struktur data. Jalur seperti `daftar.head`, `this.top`,
 * `Main.kepala`, atau `Antrean.depan` dicek dari akarnya; nama field dicek terhadap objek yang pernah dibuat.
 */
function sebutanStruktur(v: KonfigVisualPelajaran): { jalur: string[]; field: [opsi: string, nama: string | undefined][] } | undefined {
  switch (v.jenis) {
    case 'rantai':
      return { jalur: [v.kepala, ...(v.penunjuk ?? [])], field: [['berikut', v.berikut], ['sebelum', v.sebelum], ['data', v.data]] }
    case 'pohon':
      return { jalur: [v.akar, ...(v.penunjuk ?? [])], field: [['kiri', v.kiri], ['kanan', v.kanan], ['data', v.data]] }
    case 'tumpukan':
      return { jalur: [v.variabel, v.puncak, v.ukuran].filter((x) => x !== undefined), field: [['berikut', v.berikut], ['data', v.data]] }
    case 'antrian':
      return { jalur: [v.variabel, v.depan, v.belakang, v.ukuran].filter((x) => x !== undefined), field: [['berikut', v.berikut], ['data', v.data]] }
    case 'tabelHash':
      return { jalur: [v.variabel, ...(v.penunjuk ?? [])], field: [['berikut', v.berikut], ['kunci', v.kunci], ['nilai', v.nilai]] }
    case 'koleksi':
      return { jalur: [v.variabel], field: [] }
    default:
      return undefined
  }
}

/** Pesan bila jalur tidak cocok dengan program, atau undefined bila akarnya dan semua field-nya pernah ada. */
function masalahJalur(jalur: string, variabel: Set<string>, field: Set<string>): string | undefined {
  const b = bagianJalur(jalur)
  let pakai = 1
  if (!variabel.has(b[0])) {
    const statik = b.length >= 2 && (variabel.has(`${b[0]}.${b[1]}`) || (b[0] === 'Main' && variabel.has(b[1])))
    if (!statik) return b[0] === 'this' ? 'tidak ada method objek (`this`) yang berjalan' : `variabel \`${b[0]}\` tidak pernah muncul`
    pakai = 2
  }
  const hilang = b.slice(pakai).find((f) => !field.has(f))
  return hilang ? `field \`${hilang}\` tidak ada di objek mana pun` : undefined
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
    if ('variabel' in v && !sebutanStruktur(v)) disebut.add(v.variabel)
    if (v.jenis === 'array') for (const x of [...(v.penunjuk ?? []), ...(v.rentang ?? [])]) disebut.add(x)
    if (v.jenis === 'array2d') {
      for (const x of [v.baris, v.kolom]) if (x) disebut.add(x)
      for (const x of [v.labelBaris, v.labelKolom]) if (typeof x === 'string') disebut.add(x)
    }
    if (v.jenis === 'graf') {
      for (const x of [v.dikunjungi, v.label, ...(v.simpul ?? [])]) if (x) disebut.add(x)
      if (typeof v.nama === 'string') disebut.add(v.nama)
    }
    if (v.jenis === 'pohonPanggilan' && v.method && !analisisKonstruksi(k.program!).includes(`method:${v.method}`)) {
      peringatan(`${lokasi}/pelajaran.md`, `Visual pohonPanggilan memfilter method \`${v.method}\`, tetapi method itu tidak ada di Main.java.`)
    }
  }
  for (const n of disebut) if (!terpakai.has(n)) peringatan(`${lokasi}/pelajaran.md`, `Variabel \`${n}\` disebut di visual/pantau, tetapi tidak pernah muncul saat kode awal dijalankan.`)
  const fieldTerpakai = namaFieldTerpakai(trace)
  for (const v of p.meta.visual) {
    const s = sebutanStruktur(v)
    if (!s) continue
    for (const j of new Set(s.jalur)) {
      const m = masalahJalur(j, terpakai, fieldTerpakai)
      if (m) peringatan(`${lokasi}/pelajaran.md`, `Visual ${v.jenis} menyebut \`${j}\`, tetapi ${m} saat kode awal dijalankan.`)
    }
    for (const [opsi, f] of s.field) {
      if (f && !fieldTerpakai.has(f)) peringatan(`${lokasi}/pelajaran.md`, `Visual ${v.jenis} memakai field \`${f}\` (opsi \`${opsi}\`), tetapi tidak ada objek dengan field itu saat kode awal dijalankan.`)
    }
  }

  // 4. Grafik pertumbuhan bisa diukur pada kode awal.
  if (p.meta.pertumbuhan) {
    const h = ukurPertumbuhan(k, p.meta.pertumbuhan, { stdin: p.meta.input, anggaranMs: Infinity })
    if (h.galat) error(`${lokasi}/pelajaran.md`, `Grafik pertumbuhan tidak bisa diukur: ${h.galat}`)
    for (const s of h.seri) {
      const ok = s.titik.filter((t) => t.status === 'ok')
      if (ok.length < 2) error(`${lokasi}/pelajaran.md`, `Seri pertumbuhan "${s.nama}" butuh minimal 2 ukuran n yang selesai normal.`)
      for (const t of s.titik.filter((x) => x.status !== 'ok')) {
        peringatan(`${lokasi}/pelajaran.md`, `Seri "${s.nama}", n = ${t.n}: ${t.status}${t.pesan ? ` (${t.pesan})` : ''}. Pertimbangkan ukuran n yang lebih kecil.`)
      }
    }
  }

  // 5. Tantangan: solusi lulus, kode awal belum lulus.
  const jalan = penjalanLangsung(p.meta.batasLangkah)
  const opsiPeriksa = { ukur: pengukurLangsung(p.meta.input), pertumbuhan: p.meta.pertumbuhan }
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
    const hs = await periksaTantangan(t, solusi, jalan, opsiPeriksa)
    if (!hs.lulus) {
      const gagal = hs.butir.filter((b) => !b.lulus).map((b) => `- ${b.pesan}${b.rincian ? `\n  ${b.rincian.replace(/\n/g, '\n  ')}` : ''}`)
      error(`${lokasi}/solusi/${t.id}.java`, `Solusi tidak lulus tantangan "${t.id}":\n${gagal.join('\n')}`)
    }
    const ha = await periksaTantangan(t, p.kode, jalan, opsiPeriksa)
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
