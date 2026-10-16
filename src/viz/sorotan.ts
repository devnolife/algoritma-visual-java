import type { Langkah, Peristiwa } from '@/engine/trace'

/** Sorotan yang diturunkan dari peristiwa sebuah langkah. */
export interface Sorotan {
  /**
   * Kunci: `var:<frame>:<slot>`, `statik:<nama>`, `el:<id>:<indeks>`, `field:<id>:<nama>` (field objek),
   * dan `obj:<id>` (objek utuh: baru dibuat, isi StringBuilder berubah, atau dipakai ulang dari cache).
   */
  baca: Set<string>
  tulis: Set<string>
  baru: Set<string>
  /** Langkah kondisi: elemen yang dibaca sedang dibandingkan. */
  banding: boolean
  /** Id objek/array heap yang isinya ditulis atau yang baru dibuat pada langkah ini. */
  berubah: Set<number>
}

export function hitungSorotan(l: Langkah | undefined): Sorotan {
  const s: Sorotan = { baca: new Set(), tulis: new Set(), baru: new Set(), banding: l?.jenis === 'kondisi', berubah: new Set() }
  for (const p of l?.peristiwa ?? []) {
    switch (p.k) {
      case 'baca':
        s.baca.add(`var:${p.frame}:${p.slot}`)
        break
      case 'baca-statik':
        s.baca.add(`statik:${p.nama}`)
        break
      case 'baca-elemen':
        s.baca.add(`el:${p.id}:${p.indeks}`)
        break
      case 'baca-field':
        s.baca.add(`field:${p.id}:${p.field}`)
        break
      case 'tulis':
        s.tulis.add(`var:${p.frame}:${p.slot}`)
        break
      case 'tulis-statik':
        s.tulis.add(`statik:${p.nama}`)
        break
      case 'tulis-elemen':
        s.tulis.add(`el:${p.id}:${p.indeks}`)
        s.berubah.add(p.id)
        break
      case 'salin-elemen':
        for (let i = 0; i < p.nilai.length; i++) s.tulis.add(`el:${p.id}:${p.mulai + i}`)
        if (p.nilai.length) s.berubah.add(p.id)
        break
      case 'tulis-field':
        s.tulis.add(`field:${p.id}:${p.field}`)
        s.berubah.add(p.id)
        break
      case 'tulis-pembangun':
        s.tulis.add(`obj:${p.id}`)
        s.berubah.add(p.id)
        break
      case 'alokasi':
        s.baru.add(`obj:${p.id}`)
        s.berubah.add(p.id)
        break
      case 'boxing':
        // Objek wrapper dari cache JDK (atau yang di-unbox) sudah ada sebelumnya: tandai sebagai dibaca/dipakai ulang.
        if (p.arah === 'unbox' || p.cache) s.baca.add(`obj:${p.id}`)
        break
      case 'pustaka':
        s.baca.add(`obj:${p.id}`)
        break
      case 'deklarasi':
        s.baru.add(`var:${p.frame}:${p.slot}`)
        break
      case 'deklarasi-statik':
        s.baru.add(`statik:${p.nama}`)
        break
    }
  }
  return s
}

/** Kelas sorotan untuk sebuah kotak nilai. `batang` = isi batang grafik (warna diam lebih pekat agar tetap kontras). */
export function kelasSorotan(sorotan: Sorotan, kunci: string, batang = false): string {
  if (sorotan.tulis.has(kunci) || sorotan.baru.has(kunci)) return 'border-tulis bg-tulis-lembut'
  if (sorotan.baca.has(kunci)) return sorotan.banding ? 'border-banding bg-banding-lembut' : 'border-baca ring-2 ring-baca/25'
  return batang ? 'border-muted-foreground/60 bg-muted-foreground/15' : 'border-input bg-card'
}

/** Jenis sorotan pertama yang cocok untuk salah satu kunci (urutan prioritas: tulis/baru, lalu baca). */
export function jenisSorotan(sorotan: Sorotan, kunci: readonly string[]): 'tulis' | 'baca' | null {
  for (const k of kunci) if (sorotan.tulis.has(k) || sorotan.baru.has(k)) return 'tulis'
  for (const k of kunci) if (sorotan.baca.has(k)) return 'baca'
  return null
}

/** Kelas sorotan untuk elemen yang punya beberapa kunci sumber (mis. sel abstrak koleksi). */
export function kelasSorotanBanyak(sorotan: Sorotan, kunci: readonly string[]): string {
  const j = jenisSorotan(sorotan, kunci)
  if (j === 'tulis') return 'border-tulis bg-tulis-lembut'
  if (j === 'baca') return sorotan.banding ? 'border-banding bg-banding-lembut' : 'border-baca ring-2 ring-baca/25'
  return 'border-input bg-card'
}

// ---------- Alur exception ----------
type Ambil<K extends Peristiwa['k']> = Omit<Extract<Peristiwa, { k: K }>, 'k'>

/** Peristiwa alur exception pada satu langkah: dilempar → merambat keluar frame → ditangkap → finally. */
export interface AlurException {
  lempar?: Ambil<'lempar'>
  /** Frame yang dibuang karena exception merambat keluar, urut dari yang terdalam. */
  rambat: Ambil<'rambat'>[]
  tangkap?: Ambil<'tangkap'>
  finally?: Ambil<'finally'>
  /** Exception tidak tertangkap sampai keluar dari main: program berhenti. */
  takTertangkap?: Ambil<'exception'>
}

export function alurException(l: Langkah | undefined): AlurException | null {
  const a: AlurException = { rambat: [] }
  let ada = false
  for (const p of l?.peristiwa ?? []) {
    const { k: _k, ...isi } = p
    switch (p.k) {
      case 'lempar':
        a.lempar = isi as Ambil<'lempar'>
        ada = true
        break
      case 'rambat':
        a.rambat.push(isi as Ambil<'rambat'>)
        ada = true
        break
      case 'tangkap':
        a.tangkap = isi as Ambil<'tangkap'>
        ada = true
        break
      case 'finally':
        a.finally = isi as Ambil<'finally'>
        ada = true
        break
      case 'exception':
        a.takTertangkap = isi as Ambil<'exception'>
        ada = true
        break
    }
  }
  return ada ? a : null
}

/** Id objek exception yang sedang "bergerak" pada langkah ini (dilempar atau ditangkap). */
export function idExceptionAktif(a: AlurException | null): number | undefined {
  return a?.tangkap?.id ?? a?.lempar?.id
}
