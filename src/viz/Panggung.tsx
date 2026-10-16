import { useMemo } from 'react'
import type { Langkah, StateMesin, Trace } from '@/engine'
import { cn } from '@/lib/utils'
import { AntrianView, type KonfigAntrian } from './Antrian'
import { Array2DView, ArrayView, idArrayDari, type KonfigArray, type KonfigArray2D } from './ArrayView'
import { hitungSorotan, namaVariabelDiTrace } from './bersama'
import { adalahObjekKoleksi } from './dataKoleksi'
import { bangunAntrian, bangunPohon, bangunRantai, bangunTabelHash, bangunTumpukan, daftarKetetanggaan } from './dataStruktur'
import { GrafView, type KonfigGraf } from './Graf'
import { bagianJalur, ikutiJalur, adalahPrimitif } from './jalur'
import { KoleksiView, type KonfigKoleksi } from './Koleksi'
import { Evaluasi, InputView, Konsol, StringView, type KonfigString } from './LainLain'
import { Memori, objekTerjangkau, panahHeap } from './Memori'
import { WadahPanah, type Panah } from './panah'
import { PohonPanggilan, type KonfigPohonPanggilan } from './PohonPanggilan'
import { PohonView, type KonfigPohon } from './PohonBiner'
import { RantaiView, type KonfigRantai } from './Rantai'
import { alurException } from './sorotan'
import { TabelHashView, type KonfigTabelHash } from './TabelHash'
import { TumpukanView, type KonfigTumpukan } from './Tumpukan'

export type KonfigVisual =
  | KonfigArray
  | KonfigArray2D
  | KonfigString
  | KonfigGraf
  | KonfigPohonPanggilan
  | KonfigRantai
  | KonfigPohon
  | KonfigTumpukan
  | KonfigAntrian
  | KonfigTabelHash
  | KonfigKoleksi
  | { jenis: 'memori'; stringSebagaiObjek?: boolean }
  | { jenis: 'evaluasi' }
  | { jenis: 'konsol' }
  | { jenis: 'input' }

export const VISUAL_BAWAAN: KonfigVisual[] = [{ jenis: 'evaluasi' }, { jenis: 'memori' }]

export interface PropsPanggung {
  trace: Trace
  state: StateMesin
  indeks: number
  output: string
  stdin: string
  konfig: KonfigVisual[]
  instan: boolean
}

/** Nama variabel akar sebuah konfigurasi visual (untuk pesan "tidak ditemukan di kodemu"). */
function namaAkar(k: KonfigVisual): string | undefined {
  switch (k.jenis) {
    case 'rantai':
      return bagianJalur(k.kepala)[0]
    case 'pohon':
      return bagianJalur(k.akar)[0]
    case 'tumpukan':
    case 'antrian':
    case 'tabelHash':
    case 'koleksi':
      return bagianJalur(k.variabel)[0]
    default:
      return 'variabel' in k ? k.variabel : undefined
  }
}

/**
 * Objek heap yang digambar oleh renderer selain Memori (tidak digambar lagi di kolom Heap), beserta nama penunjuk
 * yang sudah tampil sebagai label di simpul renderer struktur (panah Memori dari variabel itu tidak digambar lagi).
 */
function objekDigambar(state: StateMesin, konfig: KonfigVisual[]): { ids: Set<number>; label: Map<number, Set<string>> } {
  const ids = new Set<number>()
  const label = new Map<number, Set<string>>()
  const beriLabel = (id: number, nama: string) => {
    const ada = label.get(id)
    if (ada) ada.add(nama)
    else label.set(id, new Set([nama]))
  }
  const dariKunci = (kunci: string[]) => {
    for (const k of kunci) {
      const m = /^obj:(\d+)$/.exec(k)
      if (m) ids.add(Number(m[1]))
    }
  }
  for (const k of konfig) {
    switch (k.jenis) {
      case 'array':
      case 'array2d':
      case 'graf': {
        const id = idArrayDari(state, k.variabel)
        if (typeof id === 'number') {
          ids.add(id)
          const o = state.heap[id]
          if (k.jenis !== 'array' && o?.k === 'array') for (const r of o.nilai) if (typeof r === 'number') ids.add(r)
        } else if (k.jenis === 'graf') {
          const v = ikutiJalur(state, k.variabel).nilai
          if (typeof v === 'number' && daftarKetetanggaan(state.heap, v)) ids.add(v)
        }
        break
      }
      case 'rantai': {
        const h = bangunRantai(state, k)
        if (!h.ok) break
        for (const s of Object.values(h.simpul)) {
          ids.add(s.id)
          for (const l of s.label) beriLabel(s.id, l)
        }
        for (const b of h.baris) if (b.simpul.length) beriLabel(b.simpul[0], b.asal)
        break
      }
      case 'pohon': {
        const h = bangunPohon(state, k)
        if (!h.ok) break
        for (const s of h.simpul) {
          ids.add(s.id)
          for (const l of s.label) beriLabel(s.id, l)
        }
        break
      }
      case 'tumpukan':
      case 'antrian': {
        const h = k.jenis === 'tumpukan' ? bangunTumpukan(state, k) : bangunAntrian(state, k)
        if (!h.ok) break
        ids.add(h.idObjek)
        const sel = 'sel' in h ? h.sel : h.urutan
        if (h.sumber === 'rantai') dariKunci(sel.flatMap((s) => s.kunci))
        break
      }
      case 'tabelHash': {
        const h = bangunTabelHash(state, k)
        if (!h.ok) break
        ids.add(h.idObjek)
        if (h.idLarik !== null) ids.add(h.idLarik)
        for (const b of h.bucket) {
          for (const s of b.simpul) {
            ids.add(s.id)
            for (const l of s.label) beriLabel(s.id, l)
          }
        }
        break
      }
      case 'koleksi': {
        const v = ikutiJalur(state, k.variabel).nilai
        if (typeof v === 'number' && adalahObjekKoleksi(state.heap, v)) ids.add(v)
        break
      }
    }
  }
  return { ids, label }
}

export function Panggung({ trace, state, indeks, output, stdin, konfig, instan }: PropsPanggung) {
  const langkah: Langkah | undefined = trace.langkah[indeks]
  const sorotan = useMemo(() => hitungSorotan(langkah), [langkah])
  const alur = useMemo(() => alurException(langkah), [langkah])
  const namaDiKode = useMemo(() => namaVariabelDiTrace(trace), [trace])

  const { ids: sudahTampil, label: labelStruktur } = useMemo(() => objekDigambar(state, konfig), [state, konfig])
  const stringObjek = konfig.some((k) => k.jenis === 'memori' && k.stringSebagaiObjek)
  const adaMemori = konfig.some((k) => k.jenis === 'memori')
  const diMemori = useMemo(() => new Set(adaMemori ? objekTerjangkau(state, stringObjek, sudahTampil) : []), [adaMemori, state, stringObjek, sudahTampil])

  const panah: Panah[] = []
  if (adaMemori) {
    const digambar = (id: number) => sudahTampil.has(id) || diMemori.has(id)
    // Variabel yang namanya sudah tampil sebagai label di simpul rantai/pohon/tabel hash tidak perlu panah lagi.
    const berlabel = (id: number, nama: string) => labelStruktur.get(id)?.has(nama) ?? false
    const idTeratas = state.frames[state.frames.length - 1]?.id
    for (const f of state.frames) {
      for (const v of f.vars) {
        if (typeof v.nilai !== 'number' || adalahPrimitif(v.tipe) || berlabel(v.nilai, v.nama)) continue
        // Frame yang tidak aktif (mis. rekursi yang sedang menunggu) memakai panah redup agar tidak menumpuk.
        if (digambar(v.nilai)) panah.push({ dari: `var:${f.id}:${v.slot}`, ke: `heap:${v.nilai}`, redup: f.id !== idTeratas && f.method !== 'main' })
      }
    }
    for (const v of state.statik) {
      if (typeof v.nilai === 'number' && !adalahPrimitif(v.tipe) && digambar(v.nilai) && !berlabel(v.nilai, v.nama)) panah.push({ dari: `statik:${v.nama}`, ke: `heap:${v.nilai}` })
    }
    panah.push(...panahHeap(state, diMemori, digambar))
  }

  const kembali = langkah?.peristiwa.find((p) => p.k === 'kembali')
  const nilaiKembali = kembali && kembali.k === 'kembali' && kembali.nilai !== undefined ? { frame: kembali.frame, nilai: kembali.nilai } : undefined
  const adaException = langkah?.peristiwa.some((p) => p.k === 'exception') ?? false

  return (
    <WadahPanah panah={panah} pemicu={indeks} className={cn('flex flex-col gap-4', instan && 'instan')}>
      {konfig.map((k, i) => {
        const akar = namaAkar(k)
        const adaDiKode = akar === undefined || akar === 'this' || namaDiKode.has(akar)
        switch (k.jenis) {
          case 'array':
            return <ArrayView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} galat={adaException} />
          case 'array2d':
            return <Array2DView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'string':
            return <StringView key={i} state={state} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'graf':
            return <GrafView key={i} state={state} sorotan={sorotan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'rantai':
            return <RantaiView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'pohon':
            return <PohonView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'tumpukan':
            return <TumpukanView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'antrian':
            return <AntrianView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'tabelHash':
            return <TabelHashView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'koleksi':
            // Kunci memuat opsi agar status "Lihat isi dalam" mulai ulang saat pelajaran/konfigurasi berganti.
            return <KoleksiView key={`${i}:${k.variabel}:${k.isiDalam ? 1 : 0}`} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={adaDiKode} adaMemori={adaMemori} />
          case 'pohonPanggilan':
            return <PohonPanggilan key={i} trace={trace} indeks={indeks} konfig={k} instan={instan} />
          case 'evaluasi':
            return <Evaluasi key={i} langkah={langkah} instan={instan} />
          case 'konsol':
            return <Konsol key={i} output={output} langkah={langkah} rentangErr={trace.rentangErr} />
          case 'input':
            return <InputView key={i} stdin={stdin} state={state} langkah={langkah} />
          case 'memori':
            return (
              <Memori key={i} state={state} sorotan={sorotan} instan={instan} sudahTampil={sudahTampil} stringObjek={stringObjek} nilaiKembali={nilaiKembali} alur={alur} />
            )
        }
      })}
    </WadahPanah>
  )
}
