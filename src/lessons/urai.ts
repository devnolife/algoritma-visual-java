import { parse as parseYaml } from 'yaml'
import { skemaFrontmatter, skemaModul, skemaTantangan, type Frontmatter, type MetaModul, type Tantangan } from './skema'

export interface Pelajaran {
  /** `modul/slug`, mis. `modul-1-dasar/11-nilai-maksimum`. */
  kunci: string
  modul: string
  slug: string
  meta: Frontmatter
  /** Isi materi (Markdown) tanpa bagian catatan. */
  materi: string
  /** Catatan dosen per penanda: nama → isi Markdown. */
  catatan: Record<string, string>
  kode: string
  tantangan: Tantangan[]
}

export interface Modul {
  slug: string
  meta: MetaModul
  pelajaran: Pelajaran[]
}

export class GalatKonten extends Error {
  constructor(
    readonly berkas: string,
    pesan: string,
  ) {
    super(`${berkas}: ${pesan}`)
  }
}

function pesanZod(e: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return e.issues.map((i) => `${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`).join('; ')
}

/** Pisahkan frontmatter YAML (di antara `---`) dan isi Markdown. */
export function pisahFrontmatter(teks: string, berkas: string): { data: unknown; isi: string } {
  const m = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(teks)
  if (!m) throw new GalatKonten(berkas, 'frontmatter (--- … ---) tidak ditemukan di awal file')
  try {
    return { data: parseYaml(m[1]), isi: teks.slice(m[0].length) }
  } catch (e) {
    throw new GalatKonten(berkas, `YAML frontmatter tidak valid: ${(e as Error).message}`)
  }
}

/** Ambil bagian `## Catatan #nama` dari Markdown. */
export function pisahCatatan(isi: string): { materi: string; catatan: Record<string, string> } {
  const catatan: Record<string, string> = {}
  const pola = /^##\s+Catatan\s+#([\p{L}\p{N}_-]+)\s*$/gmu
  const posisi: { nama: string; awal: number; akhirJudul: number }[] = []
  let m: RegExpExecArray | null
  while ((m = pola.exec(isi))) posisi.push({ nama: m[1], awal: m.index, akhirJudul: m.index + m[0].length })
  if (posisi.length === 0) return { materi: isi.trim(), catatan }
  posisi.forEach((p, i) => {
    const akhir = i + 1 < posisi.length ? posisi[i + 1].awal : isi.length
    catatan[p.nama] = isi.slice(p.akhirJudul, akhir).trim()
  })
  return { materi: isi.slice(0, posisi[0].awal).trim(), catatan }
}

export function uraiPelajaran(kunci: string, md: string, kode: string, tantanganYaml: string | undefined): Pelajaran {
  const [modul, slug] = kunci.split('/')
  const berkasMd = `content/${kunci}/pelajaran.md`
  const { data, isi } = pisahFrontmatter(md, berkasMd)
  const meta = skemaFrontmatter.safeParse(data)
  if (!meta.success) throw new GalatKonten(berkasMd, pesanZod(meta.error))
  const { materi, catatan } = pisahCatatan(isi)
  let tantangan: Tantangan[] = []
  if (tantanganYaml !== undefined) {
    const berkas = `content/${kunci}/tantangan.yaml`
    let mentah: unknown
    try {
      mentah = parseYaml(tantanganYaml) ?? []
    } catch (e) {
      throw new GalatKonten(berkas, `YAML tidak valid: ${(e as Error).message}`)
    }
    const t = skemaTantangan.safeParse(mentah)
    if (!t.success) throw new GalatKonten(berkas, pesanZod(t.error))
    tantangan = t.data
  }
  return { kunci, modul, slug, meta: meta.data, materi, catatan, kode: kode.replace(/\r\n/g, '\n'), tantangan }
}

export function uraiModul(slug: string, yaml: string): MetaModul {
  const berkas = `content/${slug}/modul.yaml`
  let mentah: unknown
  try {
    mentah = parseYaml(yaml)
  } catch (e) {
    throw new GalatKonten(berkas, `YAML tidak valid: ${(e as Error).message}`)
  }
  const m = skemaModul.safeParse(mentah)
  if (!m.success) throw new GalatKonten(berkas, pesanZod(m.error))
  return m.data
}

/** Susun daftar modul dari kumpulan berkas (kunci = path relatif terhadap folder content). */
export function susunKonten(berkas: Record<string, string>): Modul[] {
  const modul = new Map<string, Modul>()
  for (const [path, isi] of Object.entries(berkas)) {
    const m = /^([^/]+)\/modul\.yaml$/.exec(path)
    if (m) modul.set(m[1], { slug: m[1], meta: uraiModul(m[1], isi), pelajaran: [] })
  }
  for (const path of Object.keys(berkas)) {
    const m = /^([^/]+)\/([^/]+)\/pelajaran\.md$/.exec(path)
    if (!m) continue
    const kunci = `${m[1]}/${m[2]}`
    const kode = berkas[`${kunci}/Main.java`]
    if (kode === undefined) throw new GalatKonten(`content/${kunci}`, 'Main.java tidak ditemukan')
    const mod = modul.get(m[1])
    if (!mod) throw new GalatKonten(`content/${m[1]}`, 'modul.yaml tidak ditemukan')
    mod.pelajaran.push(uraiPelajaran(kunci, berkas[path], kode, berkas[`${kunci}/tantangan.yaml`]))
  }
  const hasil = [...modul.values()].sort((a, b) => a.meta.urutan - b.meta.urutan)
  for (const m of hasil) m.pelajaran.sort((a, b) => a.meta.urutan - b.meta.urutan)
  return hasil
}
