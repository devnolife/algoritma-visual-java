/**
 * Data murni untuk renderer struktur data Modul 2: rantai (linked list), pohon biner, tumpukan, antrian,
 * tabel hash, dan daftar ketetanggaan graf. Semua dibaca dari `StateMesin` tanpa mengubahnya, dan dipakai
 * bersama oleh renderer, visual otomatis Ruang Coba, serta cek tantangan `isiRantai`/`isiPohon`.
 */
import type { Nilai } from '@/engine/nilai'
import { namaKelasTampil, tampilNilai, type StateMesin } from '@/engine/trace'
import { ringkasKoleksi, teksElemen, type RingkasanKoleksi } from './dataKoleksi'
import { adalahPrimitif, ikutiJalur, objekDari, pesanMasalahJalur, type HasilJalur, type Objek } from './jalur'

type Heap = StateMesin['heap']

/** Nama sederhana class dari nama biner atau nama tipe: `Main$Node` → `Node`, `java.util.LinkedList$Node` → `Node`. */
export const namaSederhana = (s: string) => s.slice(Math.max(s.lastIndexOf('.'), s.lastIndexOf('$')) + 1)

/** Field yang bertipe class objek itu sendiri (penghubung antarsimpul), urut deklarasi. */
export function fieldDiri(o: Objek): string[] {
  const nama = namaSederhana(o.kelas)
  return Object.keys(o.field).filter((f) => namaSederhana(o.tipeField[f] ?? '') === nama)
}

const NAMA_SEBELUM = /^(prev|previous|sebelum|sblm|before|induk|parent)$/i

/** Field "berikutnya" pada simpul rantai: pilihan dosen, `next`/`berikut`, atau field penghubung pertama. */
export function pilihFieldBerikut(o: Objek, pilihan?: string): string | undefined {
  if (pilihan) return pilihan in o.field ? pilihan : undefined
  for (const f of ['next', 'berikut', 'selanjutnya', 'lanjut']) if (f in o.field) return f
  return fieldDiri(o).find((f) => !NAMA_SEBELUM.test(f))
}

/** Field anak kiri/kanan simpul pohon: pilihan dosen, `left`/`right`, `kiri`/`kanan`, atau dua field penghubung pertama. */
export function pilihFieldAnak(o: Objek, kiri?: string, kanan?: string): [string, string] | undefined {
  if (kiri && kanan) return kiri in o.field && kanan in o.field ? [kiri, kanan] : undefined
  let hasil: [string, string] | undefined
  if ('left' in o.field && 'right' in o.field) hasil = ['left', 'right']
  else if ('kiri' in o.field && 'kanan' in o.field) hasil = ['kiri', 'kanan']
  else {
    const diri = fieldDiri(o).filter((f) => !NAMA_SEBELUM.test(f))
    if (diri.length >= 2) hasil = [diri[0], diri[1]]
  }
  if (!hasil) return undefined
  const [a, b] = [kiri ?? hasil[0], kanan ?? hasil[1]]
  return a in o.field && b in o.field ? [a, b] : undefined
}

const PREFERENSI_DATA = ['data', 'nilai', 'val', 'value', 'item', 'isi', 'key', 'kunci', 'info']

/** Field data simpul: pilihan dosen, nama lazim (`data`, `nilai`, `val`, …), atau field pertama yang bukan penghubung. */
export function pilihFieldData(o: Objek, pilihan: string | undefined, kecuali: readonly string[], preferensi = PREFERENSI_DATA): string | undefined {
  if (pilihan) return pilihan in o.field ? pilihan : undefined
  for (const f of preferensi) if (f in o.field && !kecuali.includes(f)) return f
  const diri = new Set(fieldDiri(o))
  return Object.keys(o.field).find((f) => !kecuali.includes(f) && !diri.has(f) && f !== 'this$0')
}

/** Teks field data sebuah simpul, mis. `5`, `"Ani"`, `'A'`. */
export function teksData(heap: Heap, o: Objek, f: string | undefined): string {
  if (!f) return ''
  const v = o.field[f]
  const tipe = o.tipeField[f] ?? 'Object'
  if (adalahPrimitif(tipe) || tipe === 'String') return tampilNilai(v, tipe, heap)
  return teksElemen(v, heap, 1)
}

const PRIMITIF_BOKS: Record<string, string> = {
  Integer: 'int', Long: 'long', Double: 'double', Float: 'float', Short: 'short', Byte: 'byte', Character: 'char', Boolean: 'boolean',
}

export type NilaiSederhana = number | string | boolean | null

/** Nilai ramah-JSON untuk cek tantangan: angka, teks (String/char), boolean, atau null. Wrapper dibuka. */
export function nilaiSederhana(heap: Heap, v: Nilai | undefined, tipe: string): NilaiSederhana {
  if (v === undefined || v === null) return null
  switch (tipe) {
    case 'char':
      return String.fromCharCode(v as number)
    case 'long':
      return Number(v as bigint)
    case 'boolean':
      return v as boolean
    case 'int':
    case 'short':
    case 'byte':
    case 'double':
    case 'float':
      return v as number
  }
  if (typeof v !== 'number') return typeof v === 'bigint' ? Number(v) : (v as boolean)
  const o = heap[v]
  if (o?.k === 'string') return o.nilai
  if (o?.k === 'boks') return nilaiSederhana(heap, o.nilai, PRIMITIF_BOKS[o.kelas] ?? 'int')
  if (o?.k === 'pembangun') return o.nilai
  return teksElemen(v, heap, 1)
}

const masalahJalur = (h: HasilJalur, jalur: string) => (h.masalah ? pesanMasalahJalur(h, jalur) : undefined)

// =====================================================================================
// Rantai (linked list)
// =====================================================================================
export interface OpsiRantai {
  /** Jalur ke simpul pertama: `head`, `daftar.head`, `this.head`, atau field static. */
  kepala: string
  berikut?: string
  sebelum?: string
  data?: string
  /** Variabel/jalur penunjuk, mis. `[curr, prev, tail]`. */
  penunjuk?: string[]
}

export type TujuanRef = { k: 'null' } | { k: 'simpul'; id: number; sebelah: boolean } | { k: 'lain'; teks: string }

export interface SimpulRantai {
  id: number
  baris: number
  kolom: number
  teks: string
  /** Penunjuk yang menunjuk simpul ini (nama asal baris tidak diulang pada simpul pertamanya). */
  label: string[]
  berikut: TujuanRef
  sebelum?: TujuanRef
}

export interface BarisRantai {
  /** Awal baris: kepala untuk baris pertama, nama penunjuk untuk baris lain. */
  asal: string
  simpul: number[]
  /** null; melingkar (kembali ke simpul di baris yang sama); gabung (masuk ke simpul baris lain); terpotong; lain (bukan simpul). */
  ujung: 'null' | 'melingkar' | 'gabung' | 'terpotong' | 'lain'
  ke?: number
}

export type HasilRantai =
  | {
      ok: true
      /** Nama class simpul (kosong bila belum ada simpul). */
      kelas: string
      fieldBerikut: string
      fieldSebelum?: string
      fieldData?: string
      baris: BarisRantai[]
      simpul: Record<number, SimpulRantai>
      melingkar: boolean
      penunjukNull: string[]
      penunjukBelumAda: string[]
      jumlah: number
    }
  | { ok: false; masalah: string }

/** Nilai penunjuk yang sudah diselesaikan: `ada` false bila variabel/jalurnya belum ada pada langkah ini. */
export interface PenunjukSiap {
  nama: string
  nilai: Nilai | undefined
  ada: boolean
}

const siapkanPenunjuk = (state: StateMesin, daftar: readonly string[] | undefined): PenunjukSiap[] =>
  (daftar ?? []).map((nama) => {
    const h = ikutiJalur(state, nama, 'dalam')
    return { nama, nilai: h.nilai, ada: !h.masalah }
  })

export function bangunRantai(state: StateMesin, opsi: OpsiRantai, maks = 40): HasilRantai {
  const kepala = ikutiJalur(state, opsi.kepala, 'luar')
  const salah = masalahJalur(kepala, opsi.kepala)
  if (salah) return { ok: false, masalah: salah }
  return susunRantai(state.heap, { nama: opsi.kepala, nilai: kepala.nilai ?? null }, siapkanPenunjuk(state, opsi.penunjuk), opsi, maks)
}

/**
 * Tata letak rantai dari nilai kepala dan penunjuk yang sudah diketahui (dipakai juga oleh "isi dalam" LinkedList):
 * baris pertama dari kepala; penunjuk yang menunjuk simpul di luar baris itu membuka baris baru.
 */
export function susunRantai(
  heap: Heap,
  kepala: { nama: string; nilai: Nilai },
  penunjuk: readonly PenunjukSiap[],
  opsi: Pick<OpsiRantai, 'berikut' | 'sebelum' | 'data'>,
  maks = 40,
): HasilRantai {
  const contoh = [kepala.nilai, ...penunjuk.map((p) => p.nilai)].map((v) => objekDari(heap, v)).find((o) => o !== undefined)
  if (kepala.nilai !== null && !objekDari(heap, kepala.nilai)) return { ok: false, masalah: `\`${kepala.nama}\` bukan referensi ke objek simpul` }
  const penunjukNull = penunjuk.filter((p) => p.nilai === null && p.ada).map((p) => p.nama)
  const penunjukBelumAda = penunjuk.filter((p) => !p.ada).map((p) => p.nama)
  if (!contoh) {
    return {
      ok: true, kelas: '', fieldBerikut: opsi.berikut ?? 'next', baris: [{ asal: kepala.nama, simpul: [], ujung: 'null' }],
      simpul: {}, melingkar: false, penunjukNull, penunjukBelumAda, jumlah: 0,
    }
  }
  const fBerikut = pilihFieldBerikut(contoh, opsi.berikut)
  if (!fBerikut) {
    return { ok: false, masalah: opsi.berikut ? `class ${namaKelasTampil(contoh.kelas)} tidak punya field \`${opsi.berikut}\`` : `field penghubung (mis. \`next\`) tidak ditemukan di class ${namaKelasTampil(contoh.kelas)}` }
  }
  if (opsi.sebelum && !(opsi.sebelum in contoh.field)) return { ok: false, masalah: `class ${namaKelasTampil(contoh.kelas)} tidak punya field \`${opsi.sebelum}\`` }
  const fSebelum = opsi.sebelum
  const fData = pilihFieldData(contoh, opsi.data, [fBerikut, ...(fSebelum ? [fSebelum] : [])])
  if (opsi.data && !fData) return { ok: false, masalah: `class ${namaKelasTampil(contoh.kelas)} tidak punya field \`${opsi.data}\`` }

  const adalahSimpul = (v: Nilai | undefined): v is number => {
    const o = objekDari(heap, v)
    return o !== undefined && fBerikut in o.field
  }
  const posisi = new Map<number, { baris: number; kolom: number }>()
  const baris: BarisRantai[] = []
  let jumlah = 0
  const bangunBaris = (asal: string, mulai: number | null) => {
    const b: BarisRantai = { asal, simpul: [], ujung: 'null' }
    let x = mulai
    while (x !== null) {
      const ada = posisi.get(x)
      if (ada) {
        b.ujung = ada.baris === baris.length ? 'melingkar' : 'gabung'
        b.ke = x
        break
      }
      if (jumlah >= maks) {
        b.ujung = 'terpotong'
        break
      }
      posisi.set(x, { baris: baris.length, kolom: b.simpul.length })
      b.simpul.push(x)
      jumlah++
      const n = objekDari(heap, x)!.field[fBerikut]
      if (n === null || n === undefined) break
      if (!adalahSimpul(n)) {
        b.ujung = 'lain'
        break
      }
      x = n
    }
    baris.push(b)
  }
  bangunBaris(kepala.nama, adalahSimpul(kepala.nilai) ? kepala.nilai : null)
  for (const p of penunjuk) if (adalahSimpul(p.nilai) && !posisi.has(p.nilai)) bangunBaris(p.nama, p.nilai)

  const tujuan = (v: Nilai | undefined, dari: { baris: number; kolom: number }, geser: number): TujuanRef => {
    if (v === null || v === undefined) return { k: 'null' }
    const p = typeof v === 'number' ? posisi.get(v) : undefined
    if (p) return { k: 'simpul', id: v as number, sebelah: p.baris === dari.baris && p.kolom === dari.kolom + geser }
    return { k: 'lain', teks: adalahSimpul(v) ? '…' : teksElemen(v, heap, 1) }
  }
  const simpul: Record<number, SimpulRantai> = {}
  for (const [id, p] of posisi) {
    const o = objekDari(heap, id)!
    const awalBaris = baris[p.baris].simpul[0] === id ? baris[p.baris].asal : undefined
    simpul[id] = {
      id,
      baris: p.baris,
      kolom: p.kolom,
      teks: teksData(heap, o, fData),
      label: penunjuk.filter((x) => x.nilai === id && x.nama !== awalBaris).map((x) => x.nama),
      berikut: tujuan(o.field[fBerikut], p, 1),
      sebelum: fSebelum ? tujuan(o.field[fSebelum], p, -1) : undefined,
    }
  }
  return {
    ok: true,
    kelas: namaKelasTampil(contoh.kelas),
    fieldBerikut: fBerikut,
    fieldSebelum: fSebelum,
    fieldData: fData,
    baris,
    simpul,
    melingkar: baris.some((b) => b.ujung === 'melingkar'),
    penunjukNull,
    penunjukBelumAda,
    jumlah,
  }
}

export type HasilIsi = { ok: true; nilai: NilaiSederhana[] } | { ok: false; masalah: string }

/** Isi rantai dari `kepala` mengikuti `berikut` (untuk cek `isiRantai`). Rantai melingkar dilaporkan sebagai masalah. */
export function isiRantai(state: StateMesin, opsi: Pick<OpsiRantai, 'kepala' | 'berikut' | 'data'>, maks = 10_000): HasilIsi {
  const heap = state.heap
  const kepala = ikutiJalur(state, opsi.kepala, 'luar')
  const salah = masalahJalur(kepala, opsi.kepala)
  if (salah) return { ok: false, masalah: salah }
  if (kepala.nilai === null) return { ok: true, nilai: [] }
  const awal = objekDari(heap, kepala.nilai)
  if (!awal) return { ok: false, masalah: `\`${opsi.kepala}\` bukan referensi ke objek simpul` }
  const fBerikut = pilihFieldBerikut(awal, opsi.berikut)
  if (!fBerikut) return { ok: false, masalah: `field \`${opsi.berikut ?? 'next'}\` tidak ada di class ${namaKelasTampil(awal.kelas)}` }
  const fData = pilihFieldData(awal, opsi.data, [fBerikut])
  if (!fData) return { ok: false, masalah: `field \`${opsi.data ?? 'data'}\` tidak ada di class ${namaKelasTampil(awal.kelas)}` }
  const nilai: NilaiSederhana[] = []
  const lihat = new Set<number>()
  for (let x: Nilai | undefined = kepala.nilai; x !== null; ) {
    const o = objekDari(heap, x)
    if (!o || !(fBerikut in o.field)) return { ok: false, masalah: `\`${fBerikut}\` sebuah simpul menunjuk sesuatu yang bukan simpul` }
    if (lihat.has(x as number)) return { ok: false, masalah: `rantainya melingkar: \`${fBerikut}\` sebuah simpul menunjuk kembali ke simpul sebelumnya` }
    if (nilai.length >= maks) return { ok: false, masalah: `rantainya terlalu panjang (lebih dari ${maks} simpul)` }
    lihat.add(x as number)
    nilai.push(nilaiSederhana(heap, o.field[fData], o.tipeField[fData] ?? 'Object'))
    x = o.field[fBerikut] ?? null
  }
  return { ok: true, nilai }
}

// =====================================================================================
// Pohon biner
// =====================================================================================
export interface OpsiPohon {
  akar: string
  kiri?: string
  kanan?: string
  data?: string
  penunjuk?: string[]
}

export type TujuanAnak = { k: 'null' } | { k: 'simpul'; id: number } | { k: 'lain'; teks: string }

export interface SimpulPohon {
  id: number
  teks: string
  /** Teks kedua di bawah data (mis. nilai entri TreeMap). */
  teks2?: string
  /** Simpul merah pohon merah-hitam (TreeMap). */
  merah?: boolean
  /** Kolom = urutan inorder (pohon utama lebih dulu, lalu subpohon lepas). */
  x: number
  /** Kedalaman (akar = 0). */
  y: number
  induk: number | null
  /** Field induk yang menunjuk simpul ini. */
  sisi: 'kiri' | 'kanan' | null
  kiri: TujuanAnak
  kanan: TujuanAnak
  label: string[]
  /** Ditunjuk salah satu penunjuk (bukan sekadar akar). */
  ditunjuk: boolean
  /** Pada jalur dari akar ke simpul yang ditunjuk penunjuk. */
  diJalur: boolean
  /** 0 = pohon utama, 1.. = subpohon lepas yang ditunjuk penunjuk. */
  kelompok: number
}

export type HasilPohon =
  | {
      ok: true
      kelas: string
      fieldKiri: string
      fieldKanan: string
      fieldData?: string
      simpul: SimpulPohon[]
      kolom: number
      /** Jumlah tingkat pohon utama (dari akar), sejalan dengan `jumlahUtama`. */
      tinggi: number
      jalur: number[]
      penunjukNull: string[]
      penunjukBelumAda: string[]
      siklus: boolean
      jumlahUtama: number
      terpotong: boolean
    }
  | { ok: false; masalah: string }

const MAKS_POHON = 127
const DALAM_MAKS = 24

export function bangunPohon(state: StateMesin, opsi: OpsiPohon): HasilPohon {
  const akar = ikutiJalur(state, opsi.akar, 'luar')
  const salah = masalahJalur(akar, opsi.akar)
  if (salah) return { ok: false, masalah: salah }
  return susunPohon(state.heap, { nama: opsi.akar, nilai: akar.nilai ?? null }, siapkanPenunjuk(state, opsi.penunjuk), opsi)
}

export interface OpsiSusunPohon {
  kiri?: string
  kanan?: string
  data?: string
  /** Field kedua yang ditampilkan di bawah data (mis. `value`). */
  nilai?: string
  /** Field boolean warna pohon merah-hitam (`false` = merah, seperti TreeMap$Entry.color). */
  warna?: string
}

/** Tata letak pohon biner dari nilai akar dan penunjuk yang sudah diketahui (dipakai juga oleh "isi dalam" TreeMap). */
export function susunPohon(heap: Heap, akar: { nama: string; nilai: Nilai }, penunjuk: readonly PenunjukSiap[], opsi: OpsiSusunPohon): HasilPohon {
  if (akar.nilai !== null && !objekDari(heap, akar.nilai)) return { ok: false, masalah: `\`${akar.nama}\` bukan referensi ke objek simpul` }
  const penunjukNull = penunjuk.filter((p) => p.nilai === null && p.ada).map((p) => p.nama)
  const penunjukBelumAda = penunjuk.filter((p) => !p.ada).map((p) => p.nama)
  const contoh = [akar.nilai, ...penunjuk.map((p) => p.nilai)].map((v) => objekDari(heap, v)).find((o) => o !== undefined)
  if (!contoh) {
    return {
      ok: true, kelas: '', fieldKiri: opsi.kiri ?? 'left', fieldKanan: opsi.kanan ?? 'right', simpul: [], kolom: 0, tinggi: 0, jalur: [],
      penunjukNull, penunjukBelumAda, siklus: false, jumlahUtama: 0, terpotong: false,
    }
  }
  const anak = pilihFieldAnak(contoh, opsi.kiri, opsi.kanan)
  if (!anak) {
    const diminta = [opsi.kiri, opsi.kanan].filter(Boolean).map((f) => `\`${f}\``).join('/')
    return { ok: false, masalah: diminta ? `class ${namaKelasTampil(contoh.kelas)} tidak punya field ${diminta}` : `field anak kiri/kanan tidak ditemukan di class ${namaKelasTampil(contoh.kelas)}` }
  }
  const [fKiri, fKanan] = anak
  const fData = pilihFieldData(contoh, opsi.data, [fKiri, fKanan])
  if (opsi.data && !fData) return { ok: false, masalah: `class ${namaKelasTampil(contoh.kelas)} tidak punya field \`${opsi.data}\`` }
  const adalahSimpul = (v: Nilai | undefined): v is number => {
    const o = objekDari(heap, v)
    return o !== undefined && fKiri in o.field && fKanan in o.field
  }

  const simpul = new Map<number, SimpulPohon>()
  let x = 0
  let siklus = false
  let terpotong = false
  let tinggi = 0
  const kunjungi = (id: number, y: number, induk: number | null, kelompok: number, sisi: 'kiri' | 'kanan' | null) => {
    const o = objekDari(heap, id)!
    const s: SimpulPohon = { id, teks: teksData(heap, o, fData), x: -1, y, induk, sisi, kiri: { k: 'null' }, kanan: { k: 'null' }, label: [], ditunjuk: false, diJalur: false, kelompok }
    if (opsi.nilai && opsi.nilai in o.field) s.teks2 = teksData(heap, o, opsi.nilai)
    if (opsi.warna && opsi.warna in o.field) s.merah = o.field[opsi.warna] === false
    simpul.set(id, s)
    tinggi = Math.max(tinggi, y)
    const anakDari = (v: Nilai | undefined): TujuanAnak | number => {
      if (v === null || v === undefined) return { k: 'null' }
      if (!adalahSimpul(v)) return { k: 'lain', teks: teksElemen(v, heap, 1) }
      if (simpul.has(v)) {
        siklus = true
        return { k: 'lain', teks: '↺' }
      }
      if (simpul.size >= MAKS_POHON || y + 1 > DALAM_MAKS) {
        terpotong = true
        return { k: 'lain', teks: '…' }
      }
      return v
    }
    const ki = anakDari(o.field[fKiri])
    if (typeof ki === 'number') {
      kunjungi(ki, y + 1, id, kelompok, 'kiri')
      s.kiri = { k: 'simpul', id: ki }
    } else s.kiri = ki
    s.x = x++
    const ka = anakDari(o.field[fKanan])
    if (typeof ka === 'number') {
      kunjungi(ka, y + 1, id, kelompok, 'kanan')
      s.kanan = { k: 'simpul', id: ka }
    } else s.kanan = ka
  }
  if (adalahSimpul(akar.nilai)) kunjungi(akar.nilai, 0, null, 0, null)
  const jumlahUtama = simpul.size
  /** Tinggi pohon utama (jumlah tingkat); pohon lain yang ditunjuk penunjuk tidak ikut dihitung. */
  const tinggiUtama = simpul.size ? tinggi + 1 : 0
  let kelompok = 0
  for (const p of penunjuk) {
    if (!adalahSimpul(p.nilai) || simpul.has(p.nilai) || simpul.size >= MAKS_POHON) continue
    if (simpul.size > 0) x++ // satu kolom kosong sebagai pemisah
    kunjungi(p.nilai, 0, null, ++kelompok, null)
  }

  // Label: nama akar di atas akar, lalu penunjuk.
  if (adalahSimpul(akar.nilai)) simpul.get(akar.nilai)?.label.push(akar.nama)
  for (const p of penunjuk) {
    const s = typeof p.nilai === 'number' ? simpul.get(p.nilai) : undefined
    if (!s) continue
    s.label.push(p.nama)
    s.ditunjuk = true
  }

  // Jalur dari akar ke setiap simpul yang ditunjuk penunjuk (pohon utama saja).
  const jalur = new Set<number>()
  for (const p of penunjuk) {
    if (typeof p.nilai !== 'number') continue
    let s = simpul.get(p.nilai)
    if (!s || s.kelompok !== 0) continue
    while (s) {
      jalur.add(s.id)
      s = s.induk !== null ? simpul.get(s.induk) : undefined
    }
  }
  for (const id of jalur) simpul.get(id)!.diJalur = true
  return {
    ok: true,
    kelas: namaKelasTampil(contoh.kelas),
    fieldKiri: fKiri,
    fieldKanan: fKanan,
    fieldData: fData,
    simpul: [...simpul.values()],
    kolom: x,
    tinggi: tinggiUtama,
    jalur: [...jalur],
    penunjukNull,
    penunjukBelumAda,
    siklus,
    jumlahUtama,
    terpotong,
  }
}

export type UrutanTelusur = 'inorder' | 'preorder' | 'postorder'

/** Posisi (kolom inorder, kedalaman) simpul heap array berukuran n: anak i adalah 2i+1 dan 2i+2. */
export function susunHeap(n: number): { x: number; y: number }[] {
  const pos: { x: number; y: number }[] = Array.from({ length: n }, () => ({ x: 0, y: 0 }))
  let x = 0
  const kunjungi = (i: number, y: number) => {
    if (i >= n) return
    kunjungi(2 * i + 1, y + 1)
    pos[i] = { x: x++, y }
    kunjungi(2 * i + 2, y + 1)
  }
  kunjungi(0, 0)
  return pos
}

/** Isi pohon dalam urutan penelusuran (untuk cek `isiPohon`). Siklus dilaporkan sebagai masalah. */
export function telusuriPohon(state: StateMesin, opsi: Pick<OpsiPohon, 'akar' | 'kiri' | 'kanan' | 'data'>, urutan: UrutanTelusur, maks = 10_000): HasilIsi {
  const heap = state.heap
  const akar = ikutiJalur(state, opsi.akar, 'luar')
  const salah = masalahJalur(akar, opsi.akar)
  if (salah) return { ok: false, masalah: salah }
  if (akar.nilai === null) return { ok: true, nilai: [] }
  const awal = objekDari(heap, akar.nilai)
  if (!awal) return { ok: false, masalah: `\`${opsi.akar}\` bukan referensi ke objek simpul` }
  const anak = pilihFieldAnak(awal, opsi.kiri, opsi.kanan)
  if (!anak) return { ok: false, masalah: `field anak kiri/kanan tidak ditemukan di class ${namaKelasTampil(awal.kelas)}` }
  const [fKiri, fKanan] = anak
  const fData = pilihFieldData(awal, opsi.data, [fKiri, fKanan])
  if (!fData) return { ok: false, masalah: `field \`${opsi.data ?? 'data'}\` tidak ada di class ${namaKelasTampil(awal.kelas)}` }
  const nilai: NilaiSederhana[] = []
  const lihat = new Set<number>()
  let masalah: string | undefined
  // Penelusuran dengan tumpukan eksplisit (pohon miring yang dalam tidak menghabiskan stack JavaScript).
  type Kerja = { id: number; tahap: 0 | 1 | 2 }
  const tumpukan: Kerja[] = [{ id: akar.nilai as number, tahap: 0 }]
  lihat.add(akar.nilai as number)
  const ambil = (o: Objek) => nilaiSederhana(heap, o.field[fData], o.tipeField[fData] ?? 'Object')
  const dorong = (v: Nilai | undefined) => {
    if (v === null || v === undefined || masalah) return
    const o = objekDari(heap, v)
    if (!o || !(fKiri in o.field) || !(fKanan in o.field)) {
      masalah = `ada anak yang bukan simpul pohon`
      return
    }
    if (lihat.has(v as number)) {
      masalah = `pohonnya punya siklus: sebuah simpul ditunjuk lebih dari sekali`
      return
    }
    if (lihat.size >= maks) {
      masalah = `pohonnya terlalu besar (lebih dari ${maks} simpul)`
      return
    }
    lihat.add(v as number)
    tumpukan.push({ id: v as number, tahap: 0 })
  }
  while (tumpukan.length && !masalah) {
    const k = tumpukan[tumpukan.length - 1]
    const o = objekDari(heap, k.id)!
    if (k.tahap === 0) {
      if (urutan === 'preorder') nilai.push(ambil(o))
      k.tahap = 1
      dorong(o.field[fKiri])
    } else if (k.tahap === 1) {
      if (urutan === 'inorder') nilai.push(ambil(o))
      k.tahap = 2
      dorong(o.field[fKanan])
    } else {
      if (urutan === 'postorder') nilai.push(ambil(o))
      tumpukan.pop()
    }
  }
  return masalah ? { ok: false, masalah } : { ok: true, nilai }
}

// =====================================================================================
// Tumpukan & antrian
// =====================================================================================
export interface SelUrut {
  teks: string
  /** Kunci sorotan sumber (sel array `el:` atau simpul `obj:`/`field:`). */
  kunci: string[]
  /** Kunci React stabil antarlangkah. */
  kunciReact: string
  /** Indeks array (sumber array). */
  indeks?: number
}

export type SumberUrut = 'koleksi' | 'array' | 'rantai'

/** Nilai int sebuah variabel/jalur, atau undefined. */
function nilaiInt(state: StateMesin, nama: string | undefined): number | undefined {
  if (!nama) return undefined
  const h = ikutiJalur(state, nama, 'dalam')
  return typeof h.nilai === 'number' && ['int', 'short', 'byte', 'long'].includes(h.tipe) ? h.nilai : typeof h.nilai === 'bigint' ? Number(h.nilai) : undefined
}

/** Simpul berantai dari `awal` mengikuti field berikut (untuk tumpukan/antrian berbasis node). */
function urutRantai(heap: Heap, awal: number, berikut?: string, data?: string, maks = 40): { sel: SelUrut[]; masalah?: string; melingkar: boolean } {
  const o0 = objekDari(heap, awal)!
  const fB = pilihFieldBerikut(o0, berikut)
  if (!fB) return { sel: [], masalah: `field penghubung (mis. \`next\`) tidak ditemukan di class ${namaKelasTampil(o0.kelas)}`, melingkar: false }
  const fD = pilihFieldData(o0, data, [fB])
  const sel: SelUrut[] = []
  const lihat = new Set<number>()
  let melingkar = false
  for (let x: Nilai | undefined = awal; typeof x === 'number' && sel.length < maks; ) {
    if (lihat.has(x)) {
      melingkar = true
      break
    }
    lihat.add(x)
    const o = objekDari(heap, x)
    if (!o) break
    sel.push({ teks: teksData(heap, o, fD), kunci: [`obj:${x}`, ...(fD ? [`field:${x}:${fD}`] : [])], kunciReact: `n${x}` })
    x = o.field[fB]
  }
  return { sel, melingkar }
}

function selKoleksi(r: Exclude<RingkasanKoleksi, { jenis: 'map' }>): SelUrut[] {
  return r.elemen.map((e) => ({ teks: e.teks, kunci: e.kunci, kunciReact: e.kunciReact }))
}

export interface OpsiTumpukan {
  variabel: string
  /** Variabel int: indeks elemen teratas (−1 = kosong). */
  puncak?: string
  /** Variabel int: jumlah elemen (alternatif `puncak`). */
  ukuran?: string
  berikut?: string
  data?: string
}

export type HasilTumpukan =
  | {
      ok: true
      sumber: SumberUrut
      /** Nama koleksi/class simpul. */
      nama?: string
      /** Sel dari dasar (indeks 0) ke atas; untuk array: semua slot, `jumlah` slot terbawah yang terisi. */
      sel: SelUrut[]
      jumlah: number
      kapasitas?: number
      /** Indeks array elemen teratas (−1 = kosong). */
      puncak?: number
      idObjek: number
      catatan?: string
    }
  | { ok: false; masalah: string }

export function bangunTumpukan(state: StateMesin, opsi: OpsiTumpukan): HasilTumpukan {
  const heap = state.heap
  const h = ikutiJalur(state, opsi.variabel, 'dalam')
  const salah = masalahJalur(h, opsi.variabel)
  if (salah) return { ok: false, masalah: salah }
  if (h.nilai === null) return { ok: false, masalah: `\`${opsi.variabel}\` bernilai null` }
  if (typeof h.nilai !== 'number' || !heap[h.nilai]) return { ok: false, masalah: `\`${opsi.variabel}\` bukan tumpukan (Stack/Deque, array, atau simpul)` }
  const id = h.nilai
  const o = heap[id]
  if (o.k === 'array') {
    const kapasitas = o.nilai.length
    const atas = nilaiInt(state, opsi.puncak)
    const ukuran = nilaiInt(state, opsi.ukuran)
    if (atas === undefined && ukuran === undefined) {
      return { ok: false, masalah: opsi.puncak || opsi.ukuran ? `\`${opsi.puncak ?? opsi.ukuran}\` belum berisi bilangan bulat` : 'tumpukan berbasis array butuh opsi `puncak` (indeks teratas) atau `ukuran` (jumlah elemen)' }
    }
    const puncak = atas ?? ukuran! - 1
    const sel = o.nilai.map((x, i) => ({ teks: tampilNilai(x, o.tipeElemen, heap), kunci: [`el:${id}:${i}`], kunciReact: `s${i}`, indeks: i }))
    return { ok: true, sumber: 'array', sel, jumlah: Math.max(0, Math.min(kapasitas, puncak + 1)), kapasitas, puncak, idObjek: id }
  }
  const r = ringkasKoleksi(heap, id)
  if (r) {
    if (r.jenis === 'map') return { ok: false, masalah: `\`${opsi.variabel}\` adalah Map, bukan tumpukan` }
    const sel = selKoleksi(r)
    // Deque (ArrayDeque/LinkedList) dipakai sebagai stack lewat push/pop di depan: elemen pertama adalah puncak.
    const puncakDiDepan = r.kelas === 'java.util.ArrayDeque' || r.kelas === 'java.util.LinkedList'
    return {
      ok: true,
      sumber: 'koleksi',
      nama: r.nama,
      sel: puncakDiDepan ? sel.reverse() : sel,
      jumlah: r.ukuran,
      idObjek: id,
      catatan: r.jenis === 'pq' ? 'PriorityQueue bukan tumpukan: urutan di bawah adalah urutan array heap-nya.' : undefined,
    }
  }
  if (o.k === 'objek') {
    const rantai = urutRantai(heap, id, opsi.berikut, opsi.data)
    if (rantai.masalah) return { ok: false, masalah: rantai.masalah }
    return {
      ok: true,
      sumber: 'rantai',
      nama: namaKelasTampil(o.kelas),
      sel: rantai.sel.reverse(),
      jumlah: rantai.sel.length,
      idObjek: id,
      catatan: rantai.melingkar ? 'Rantai simpulnya melingkar.' : undefined,
    }
  }
  return { ok: false, masalah: `\`${opsi.variabel}\` bukan tumpukan (Stack/Deque, array, atau simpul)` }
}

export interface OpsiAntrian {
  variabel: string
  /** Variabel int: indeks elemen terdepan. */
  depan?: string
  /** Variabel int: indeks elemen terakhir. */
  belakang?: string
  /** Variabel int: jumlah elemen (disarankan untuk array melingkar). */
  ukuran?: string
  berikut?: string
  data?: string
}

export interface SelLarikAntrian {
  teks: string
  indeks: number
  kunci: string
  /** Posisi dalam antrean (0 = depan), undefined bila slot ini tidak termasuk antrean. */
  ke?: number
}

export type HasilAntrian =
  | {
      ok: true
      sumber: SumberUrut
      nama?: string
      /** Urutan logis depan → belakang. */
      urutan: SelUrut[]
      jumlah: number
      /** Slot array fisik (sumber array). */
      larik?: SelLarikAntrian[]
      depan?: number
      belakang?: number
      /** Isi antrean melewati ujung array lalu kembali ke indeks 0. */
      melingkar: boolean
      idObjek: number
      catatan?: string
    }
  | { ok: false; masalah: string }

export function bangunAntrian(state: StateMesin, opsi: OpsiAntrian): HasilAntrian {
  const heap = state.heap
  const h = ikutiJalur(state, opsi.variabel, 'dalam')
  const salah = masalahJalur(h, opsi.variabel)
  if (salah) return { ok: false, masalah: salah }
  if (h.nilai === null) return { ok: false, masalah: `\`${opsi.variabel}\` bernilai null` }
  if (typeof h.nilai !== 'number' || !heap[h.nilai]) return { ok: false, masalah: `\`${opsi.variabel}\` bukan antrean (Queue/Deque, array, atau simpul)` }
  const id = h.nilai
  const o = heap[id]
  if (o.k === 'array') {
    const cap = o.nilai.length
    const d = nilaiInt(state, opsi.depan)
    const b = nilaiInt(state, opsi.belakang)
    const u = nilaiInt(state, opsi.ukuran)
    if (d === undefined) return { ok: false, masalah: opsi.depan ? `\`${opsi.depan}\` belum berisi bilangan bulat` : 'antrean berbasis array butuh opsi `depan` (indeks elemen terdepan)' }
    let jumlah: number
    if (u !== undefined) jumlah = Math.max(0, Math.min(cap, u))
    else if (b !== undefined) jumlah = b >= d ? b - d + 1 : b === d - 1 ? 0 : cap - d + b + 1
    else return { ok: false, masalah: opsi.belakang || opsi.ukuran ? `\`${opsi.belakang ?? opsi.ukuran}\` belum berisi bilangan bulat` : 'antrean berbasis array butuh opsi `belakang` atau `ukuran`' }
    if (d < 0 || d >= cap) jumlah = 0
    jumlah = Math.max(0, Math.min(cap, jumlah))
    const ke = new Map<number, number>()
    for (let k = 0; k < jumlah; k++) ke.set((d + k) % cap, k)
    const larik = o.nilai.map((x, i): SelLarikAntrian => ({ teks: tampilNilai(x, o.tipeElemen, heap), indeks: i, kunci: `el:${id}:${i}`, ke: ke.get(i) }))
    const urutan = Array.from({ length: jumlah }, (_, k) => {
      const i = (d + k) % cap
      return { teks: larik[i].teks, kunci: [larik[i].kunci], kunciReact: `s${i}`, indeks: i }
    })
    return { ok: true, sumber: 'array', urutan, jumlah, larik, depan: d, belakang: b, melingkar: d + jumlah > cap, idObjek: id }
  }
  const r = ringkasKoleksi(heap, id)
  if (r) {
    if (r.jenis === 'map') return { ok: false, masalah: `\`${opsi.variabel}\` adalah Map, bukan antrean` }
    return {
      ok: true,
      sumber: 'koleksi',
      nama: r.nama,
      urutan: selKoleksi(r),
      jumlah: r.ukuran,
      melingkar: false,
      idObjek: id,
      catatan:
        r.jenis === 'pq'
          ? 'Urutan di atas adalah urutan array heap PriorityQueue, bukan urutan keluar: poll() selalu mengambil elemen terkecil (akar heap).'
          : r.jenis === 'tumpukan'
            ? 'Stack dibaca dari dasar ke puncak.'
            : undefined,
    }
  }
  if (o.k === 'objek') {
    const rantai = urutRantai(heap, id, opsi.berikut, opsi.data)
    if (rantai.masalah) return { ok: false, masalah: rantai.masalah }
    return { ok: true, sumber: 'rantai', nama: namaKelasTampil(o.kelas), urutan: rantai.sel, jumlah: rantai.sel.length, melingkar: false, idObjek: id, catatan: rantai.melingkar ? 'Rantai simpulnya melingkar.' : undefined }
  }
  return { ok: false, masalah: `\`${opsi.variabel}\` bukan antrean (Queue/Deque, array, atau simpul)` }
}

// =====================================================================================
// Tabel hash (chaining)
// =====================================================================================
export interface OpsiTabelHash {
  /** Array bucket berisi simpul (atau HashMap/HashSet: memakai `table` di dalamnya). */
  variabel: string
  berikut?: string
  kunci?: string
  nilai?: string
  /** Penunjuk: variabel int menandai bucket, variabel simpul menandai simpul. */
  penunjuk?: string[]
}

export interface SimpulHash {
  id: number
  teksKunci: string
  teksNilai?: string
  label: string[]
  /** Kunci sorotan field kunci/nilai/berikut. */
  sorotKunci: string
  sorotNilai?: string
  sorotBerikut: string
}

export interface BucketHash {
  indeks: number
  /** Kunci sorotan sel bucket (`el:<array>:<i>`). */
  kunci: string
  jenis: 'kosong' | 'nilai' | 'rantai'
  /** Isi bucket yang bukan simpul (pengalamatan terbuka). */
  teks?: string
  simpul: SimpulHash[]
  ujung: 'null' | 'melingkar' | 'terpotong' | 'lain'
  /** Penunjuk int yang bernilai indeks bucket ini. */
  penunjuk: string[]
}

export type HasilTabelHash =
  | {
      ok: true
      sumber: 'array' | 'koleksi'
      idObjek: number
      idLarik: number | null
      tipeElemen: string
      bucket: BucketHash[]
      jumlahEntri: number
      /** Jumlah tabrakan: simpul selain yang pertama di setiap bucket. */
      tabrakan: number
      fieldKunci?: string
      fieldNilai?: string
      penunjukNull: string[]
      catatan?: string
    }
  | { ok: false; masalah: string }

export function bangunTabelHash(state: StateMesin, opsi: OpsiTabelHash, maksRantai = 24): HasilTabelHash {
  const heap = state.heap
  const h = ikutiJalur(state, opsi.variabel, 'dalam')
  const salah = masalahJalur(h, opsi.variabel)
  if (salah) return { ok: false, masalah: salah }
  if (h.nilai === null) return { ok: false, masalah: `\`${opsi.variabel}\` bernilai null` }
  if (typeof h.nilai !== 'number' || !heap[h.nilai]) return { ok: false, masalah: `\`${opsi.variabel}\` bukan array bucket` }
  const idObjek = h.nilai
  let idLarik: number | null = idObjek
  let sumber: 'array' | 'koleksi' = 'array'
  let fKunci = opsi.kunci
  let fNilai = opsi.nilai
  let fBerikut = opsi.berikut
  let tanpaNilai = false
  const o = heap[idObjek]
  if (o.k === 'objek') {
    const peta = o.kelas === 'java.util.HashSet' || o.kelas === 'java.util.LinkedHashSet' ? o.field.map : o.kelas === 'java.util.HashMap' || o.kelas === 'java.util.LinkedHashMap' ? idObjek : undefined
    const m = objekDari(heap, peta)
    if (!m) return { ok: false, masalah: `\`${opsi.variabel}\` bukan array bucket atau HashMap/HashSet` }
    sumber = 'koleksi'
    idLarik = typeof m.field.table === 'number' ? m.field.table : null
    fKunci = 'key'
    fNilai = 'value'
    fBerikut = 'next'
    tanpaNilai = m !== o
  } else if (o.k !== 'array') return { ok: false, masalah: `\`${opsi.variabel}\` bukan array bucket` }
  const larik = idLarik !== null ? heap[idLarik] : undefined
  if (idLarik !== null && larik?.k !== 'array') return { ok: false, masalah: `\`${opsi.variabel}\` bukan array bucket` }
  const isi = larik?.k === 'array' ? larik.nilai : []
  const tipeElemen = larik?.k === 'array' ? larik.tipeElemen : 'Object'

  const penunjuk = (opsi.penunjuk ?? []).map((nama) => ({ nama, h: ikutiJalur(state, nama, 'dalam') }))
  const penunjukNull = penunjuk.filter((p) => p.h.nilai === null && !p.h.masalah).map((p) => p.nama)
  const penunjukInt = penunjuk.filter((p) => typeof p.h.nilai === 'number' && adalahPrimitif(p.h.tipe))
  const penunjukRef = penunjuk.filter((p) => typeof p.h.nilai === 'number' && !adalahPrimitif(p.h.tipe))

  let jumlahEntri = 0
  let tabrakan = 0
  const bucket = isi.map((v, i): BucketHash => {
    const b: BucketHash = { indeks: i, kunci: `el:${idLarik}:${i}`, jenis: 'kosong', simpul: [], ujung: 'null', penunjuk: penunjukInt.filter((p) => p.h.nilai === i).map((p) => p.nama) }
    if (v === null || v === undefined) return b
    const awal = adalahPrimitif(tipeElemen) ? undefined : objekDari(heap, v)
    const fB = awal ? pilihFieldBerikut(awal, fBerikut) : undefined
    if (!awal || !fB) {
      b.jenis = 'nilai'
      b.teks = tampilNilai(v, adalahPrimitif(tipeElemen) ? tipeElemen : 'Object', heap)
      jumlahEntri++
      return b
    }
    b.jenis = 'rantai'
    const fK = pilihFieldData(awal, fKunci, [fB], ['key', 'kunci', 'data', 'nilai', 'val', 'value', 'item', 'isi'])
    const fV = tanpaNilai || !fK ? undefined : pilihFieldData(awal, fNilai, [fB, fK], ['value', 'nilai', 'val', 'data', 'isi'])
    const lihat = new Set<number>()
    for (let x: Nilai | undefined = v; x !== null && x !== undefined; ) {
      const s = objekDari(heap, x)
      if (!s || !(fB in s.field)) {
        b.ujung = 'lain'
        break
      }
      if (lihat.has(x as number)) {
        b.ujung = 'melingkar'
        break
      }
      if (b.simpul.length >= maksRantai) {
        b.ujung = 'terpotong'
        break
      }
      lihat.add(x as number)
      const id = x as number
      b.simpul.push({
        id,
        teksKunci: teksData(heap, s, fK),
        teksNilai: fV ? teksData(heap, s, fV) : undefined,
        label: penunjukRef.filter((p) => p.h.nilai === id).map((p) => p.nama),
        sorotKunci: `field:${id}:${fK}`,
        sorotNilai: fV ? `field:${id}:${fV}` : undefined,
        sorotBerikut: `field:${id}:${fB}`,
      })
      x = s.field[fB]
    }
    jumlahEntri += b.simpul.length
    tabrakan += Math.max(0, b.simpul.length - 1)
    if (fK) fKunci = fK
    if (fV) fNilai = fV
    return b
  })
  return {
    ok: true,
    sumber,
    idObjek,
    idLarik,
    tipeElemen,
    bucket,
    jumlahEntri,
    tabrakan,
    fieldKunci: fKunci,
    fieldNilai: tanpaNilai ? undefined : fNilai,
    penunjukNull,
    catatan: sumber === 'koleksi' && idLarik === null ? 'table masih null: HashMap baru membuat array bucket saat put() pertama.' : undefined,
  }
}

// =====================================================================================
// Daftar ketetanggaan graf
// =====================================================================================
export interface DaftarTetangga {
  /** Daftar tetangga setiap simpul (indeks simpul tujuan). */
  tetangga: number[][]
  /** Teks setiap daftar, mis. `[1, 2]`. */
  teks: string[]
  /** Id koleksi/array luar dan id daftar dalam (untuk sorotan). */
  idLuar: number
  idDalam: (number | null)[]
  /** Kunci sorotan sumber tiap daftar dalam (sel array luar / sel elementData). */
  kunciDalam: string[][]
}

/**
 * Daftar ketetanggaan dari `ArrayList<ArrayList<Integer>>`/`List<List<Integer>>` atau array of list
 * (`ArrayList<Integer>[]`). undefined bila nilai bukan bentuk itu.
 */
export function daftarKetetanggaan(heap: Heap, id: number): DaftarTetangga | undefined {
  const luar = heap[id]
  if (!luar) return undefined
  let dalam: { id: Nilai; kunci: string[] }[]
  if (luar.k === 'array') {
    if (adalahPrimitif(luar.tipeElemen) || luar.tipeElemen.endsWith('[]')) return undefined
    dalam = luar.nilai.map((x, i) => ({ id: x, kunci: [`el:${id}:${i}`] }))
  } else {
    const r = ringkasKoleksi(heap, id)
    if (!r || r.jenis === 'map') return undefined
    dalam = r.elemen.map((e) => ({ id: e.nilai, kunci: e.kunci }))
  }
  const tetangga: number[][] = []
  const teks: string[] = []
  for (const d of dalam) {
    if (d.id === null) {
      tetangga.push([])
      teks.push('null')
      continue
    }
    const r = typeof d.id === 'number' ? ringkasKoleksi(heap, d.id) : undefined
    if (!r || r.jenis === 'map') return undefined
    const angka = r.elemen.map((e) => nilaiSederhana(heap, e.nilai, 'Object'))
    if (angka.some((a) => typeof a !== 'number' || !Number.isInteger(a))) return undefined
    tetangga.push(angka as number[])
    teks.push(`[${r.elemen.map((e) => e.teks).join(', ')}]`)
  }
  return { tetangga, teks, idLuar: id, idDalam: dalam.map((d) => (typeof d.id === 'number' ? d.id : null)), kunciDalam: dalam.map((d) => d.kunci) }
}
