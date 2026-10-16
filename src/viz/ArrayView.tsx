import { Crown } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { tampilNilai, type StateMesin } from '@/engine'
import type { Nilai } from '@/engine/nilai'
import { cn } from '@/lib/utils'
import { cariVariabel, kelasSorotan, NilaiBerubah, PesanVariabel, type Sorotan } from './bersama'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'

export interface KonfigArray {
  jenis: 'array'
  variabel: string
  gaya?: 'sel' | 'batang'
  penunjuk?: string[]
  /** Dua variabel int [kiri, kanan]; elemen di luar rentang dipudarkan. */
  rentang?: [string, string]
  judul?: string
}

function Kosong({ teks }: { teks: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">{teks}</p>
}

/** Nilai variabel bilangan bulat (int/short/byte) yang terlihat pada langkah ini. */
function nilaiInt(state: StateMesin, nama: string): number | undefined {
  const p = cariVariabel(state, nama)
  return p && typeof p.v.nilai === 'number' && ['int', 'short', 'byte'].includes(p.v.tipe) ? p.v.nilai : undefined
}

export function idArrayDari(state: StateMesin, variabel: string): number | null | undefined {
  const hasil = cariVariabel(state, variabel)
  if (!hasil || !hasil.v.tipe.endsWith('[]')) return undefined
  return hasil.v.nilai === undefined ? undefined : (hasil.v.nilai as number | null)
}

export function ArrayView({
  state,
  sorotan,
  instan,
  konfig,
  adaDiKode = true,
  adaMemori = true,
  galat = false,
}: {
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  konfig: KonfigArray
  adaDiKode?: boolean
  adaMemori?: boolean
  /** true bila langkah ini memicu exception: penunjuk di luar batas ditampilkan merah. */
  galat?: boolean
}) {
  const hasil = cariVariabel(state, konfig.variabel)
  const id = idArrayDari(state, konfig.variabel)
  const jangkar = useJangkar(typeof id === 'number' ? `heap:${id}` : `heap:kosong:${konfig.variabel}`)
  if (!hasil) return <PesanVariabel nama={konfig.variabel} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  if (!hasil.v.tipe.endsWith('[]')) return <Kosong teks={<>Variabel <code className="kode-sebaris">{konfig.variabel}</code> bukan array.</>} />
  if (id === undefined) return <Kosong teks={<><code className="kode-sebaris">{konfig.variabel}</code> belum diisi.</>} />
  if (id === null) return <Kosong teks={<><code className="kode-sebaris">{konfig.variabel} = null</code> (belum menunjuk array apa pun)</>} />
  const o = state.heap[id]
  if (!o || o.k !== 'array') return null
  const tipe = o.tipeElemen
  const batang = konfig.gaya === 'batang' && ['int', 'long', 'short', 'byte', 'double', 'float', 'char'].includes(tipe)
  const angka = o.nilai.map((x) => (typeof x === 'bigint' ? Number(x) : typeof x === 'number' ? x : 0))
  const maks = Math.max(1, ...angka.map(Math.abs))
  const penunjuk = (konfig.penunjuk ?? [])
    .map((nama) => {
      const nilai = nilaiInt(state, nama)
      return nilai === undefined ? null : { nama, nilai }
    })
    .filter((x): x is { nama: string; nilai: number } => x !== null)
  const luarBatas = penunjuk.filter((p) => p.nilai < 0 || p.nilai >= o.nilai.length)
  const ra = konfig.rentang ? nilaiInt(state, konfig.rentang[0]) : undefined
  const rb = konfig.rentang ? nilaiInt(state, konfig.rentang[1]) : undefined
  const adaRentang = ra !== undefined && rb !== undefined
  const diLuarRentang = (i: number) => adaRentang && (i < ra || i > rb)
  // Sel bayangan (di luar array) untuk penunjuk yang keluar batas, mis. i = 5 pada array panjang 5.
  const selHantu = (sisi: 'kiri' | 'kanan') => {
    const ps = luarBatas.filter((p) => (sisi === 'kiri' ? p.nilai < 0 : p.nilai >= o.nilai.length))
    if (ps.length === 0) return null
    const indeks = sisi === 'kiri' ? Math.max(...ps.map((p) => p.nilai)) : Math.min(...ps.map((p) => p.nilai))
    return (
      <div role="listitem" aria-label={`indeks ${indeks} berada di luar array`} className="flex w-14 shrink-0 flex-col items-center gap-1">
        <div
          className={cn(
            'flex w-14 items-center justify-center rounded-lg border-[1.5px] border-dashed font-mono text-[15px] font-semibold',
            galat ? 'border-galat bg-galat-lembut/60 text-galat' : 'border-muted-foreground/40 text-muted-foreground',
            batang ? 'h-28' : 'h-13',
          )}
        >
          {galat ? '✕' : <span aria-hidden="true">·</span>}
        </div>
        <span className={cn('font-mono text-[11px]', galat ? 'font-semibold text-galat' : 'text-muted-foreground')}>[{indeks}]</span>
        <div className="flex min-h-6 flex-col items-center leading-none">
          {ps.map((p) => (
            <span key={p.nama} className={cn('flex flex-col items-center font-mono text-[11.5px] font-bold', galat ? 'text-galat' : 'text-banding-teks')}>
              <span aria-hidden="true">▲</span>
              {p.nama}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={jangkar} className="inline-flex max-w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
        <BadgeTipe tipe={hasil.v.tipe} />
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.variabel}</span>
        <span className="text-muted-foreground">· panjang {o.nilai.length}</span>
        {adaRentang && konfig.rentang && (
          <span className="font-mono text-[12px] text-banding-teks">
            {ra! <= rb!
              ? `· rentang ${konfig.rentang[0]}..${konfig.rentang[1]} = ${ra}..${rb}`
              : `· rentang kosong (${konfig.rentang[0]} = ${ra} > ${konfig.rentang[1]} = ${rb})`}
          </span>
        )}
        {luarBatas.length > 0 && (
          <span className={cn('font-mono text-[12px]', galat ? 'font-semibold text-galat' : 'text-muted-foreground')}>
            · {luarBatas.map((p) => `${p.nama} = ${p.nilai}`).join(', ')} di luar indeks 0…{o.nilai.length - 1}
          </span>
        )}
      </div>
      <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1" role="list" aria-label={`Isi array ${konfig.variabel}`}>
        {selHantu('kiri')}
        {o.nilai.map((x, i) => {
          const kunci = `el:${id}:${i}`
          const teks = tampilNilai(x, tipe, state.heap)
          const disini = penunjuk.filter((p) => p.nilai === i)
          const luar = diLuarRentang(i)
          // Angka panjang (mis. Integer.MAX_VALUE) memperkecil huruf dan melebarkan sel, bukan meluber ke sel tetangga.
          const ukuranHuruf = teks.length <= 4 ? 'text-[17px]' : teks.length <= 6 ? 'text-[14px]' : 'text-[12px]'
          return (
            <div key={i} role="listitem" className={cn('flex w-14 min-w-10 shrink flex-col items-center gap-1 transition-opacity duration-200 ease-out', teks.length > 6 && 'w-auto shrink-0', luar && 'opacity-30')}>
              {batang ? (
                <div data-sasaran-panah={i === 0 ? '' : undefined} className="flex h-28 w-full flex-col items-center justify-end">
                  <span className={cn('mb-1 font-mono font-semibold whitespace-nowrap', teks.length > 5 ? 'text-[10.5px]' : 'text-[12px]')}>
                    <NilaiBerubah teks={teks} instan={instan} />
                  </span>
                  <div
                    className={cn(
                      'gerak w-[72%] origin-bottom rounded-t-md border-[1.5px] border-b-0 transition-[transform,background-color,border-color] duration-200',
                      kelasSorotan(sorotan, kunci, true),
                    )}
                    style={{ height: '88px', transform: `scaleY(${Math.max(0.04, Math.abs(angka[i]) / maks)})`, transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)' }}
                  />
                </div>
              ) : (
                <div
                  data-sasaran-panah={i === 0 ? '' : undefined}
                  className={cn(
                    'flex h-13 w-full items-center justify-center rounded-lg border-[1.5px] px-1 font-mono font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow] duration-300 ease-out',
                    ukuranHuruf,
                    kelasSorotan(sorotan, kunci),
                  )}
                >
                  <NilaiBerubah teks={teks} instan={instan} />
                </div>
              )}
              <span className="font-mono text-[11px] text-muted-foreground">
                [{i}]{luar && <span className="sr-only"> (di luar rentang)</span>}
              </span>
              {adaRentang && (
                <span
                  aria-hidden="true"
                  className={cn('-mt-0.5 h-[3px] w-[calc(100%+6px)] rounded-full transition-colors duration-200', luar ? 'bg-transparent' : 'bg-banding/55')}
                />
              )}
              <div className="flex min-h-6 flex-col items-center leading-none">
                {disini.map((p) => (
                  <span key={p.nama} className="flex flex-col items-center font-mono text-[11.5px] font-bold text-banding-teks">
                    <span aria-hidden="true">▲</span>
                    {p.nama}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
        {selHantu('kanan')}
      </div>
    </div>
  )
}

export interface KonfigArray2D {
  jenis: 'array2d'
  variabel: string
  baris?: string
  kolom?: string
  /** grid (bawaan), tabel (DP berlabel + panah sel sumber), papan (papan catur, mis. N-Queens). */
  gaya?: 'grid' | 'tabel' | 'papan'
  labelBaris?: string | (string | number)[]
  labelKolom?: string | (string | number)[]
}

/** Label baris/kolom dari daftar teks atau dari variabel String/array; bila kurang satu, baris/kolom 0 dianggap kasus dasar. */
function labelDari(state: StateMesin, spek: KonfigArray2D['labelBaris'], jumlah: number): string[] | undefined {
  if (spek === undefined) return undefined
  let daftar: string[]
  if (Array.isArray(spek)) daftar = spek.map(String)
  else {
    const v = cariVariabel(state, spek)
    if (!v || typeof v.v.nilai !== 'number') return undefined
    const o = state.heap[v.v.nilai]
    if (o?.k === 'string') daftar = [...o.nilai]
    else if (o?.k === 'array') daftar = o.nilai.map((x) => tampilNilai(x, o.tipeElemen, state.heap).replace(/^["']|["']$/g, ''))
    else return undefined
  }
  return daftar.length === jumlah - 1 ? ['∅', ...daftar] : daftar
}

/** Isi sel papan: ratu untuk 1/true/'Q', kosong untuk 0/false/'.'/'-'. */
function isiPapan(nilai: Nilai, tipe: string): 'ratu' | 'kosong' | null {
  if (tipe === 'boolean') return nilai ? 'ratu' : 'kosong'
  if (tipe === 'char') return nilai === 81 || nilai === 113 ? 'ratu' : nilai === 46 || nilai === 45 || nilai === 32 || nilai === 48 ? 'kosong' : null
  if (typeof nilai === 'number') return nilai === 1 ? 'ratu' : nilai === 0 ? 'kosong' : null
  return null
}

interface Garis {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function Array2DView({
  state,
  sorotan,
  instan,
  konfig,
  adaDiKode = true,
  adaMemori = true,
}: {
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  konfig: KonfigArray2D
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const hasil = cariVariabel(state, konfig.variabel)
  const id = idArrayDari(state, konfig.variabel)
  const jangkar = useJangkar(typeof id === 'number' ? `heap:${id}` : `heap:kosong:${konfig.variabel}`)
  const wadah = useRef<HTMLDivElement>(null)
  const sel = useRef(new Map<string, HTMLElement>())
  const [garis, setGaris] = useState<Garis[]>([])
  const gaya = konfig.gaya ?? 'grid'
  const luar = typeof id === 'number' ? state.heap[id] : undefined
  const barisArr = luar && luar.k === 'array' ? luar.nilai.map((r) => (typeof r === 'number' ? state.heap[r] : undefined)) : []

  // Tabel DP: hubungkan sel yang dibaca pada langkah ini ke sel yang ditulis.
  const kunciSel = new Set(
    luar && luar.k === 'array' ? luar.nilai.flatMap((r) => (typeof r === 'number' && state.heap[r]?.k === 'array' ? (state.heap[r] as { nilai: Nilai[] }).nilai.map((_, j) => `el:${r}:${j}`) : [])) : [],
  )
  const ditulis = [...sorotan.tulis].filter((k) => kunciSel.has(k))
  const dibaca = [...sorotan.baca].filter((k) => kunciSel.has(k) && !ditulis.includes(k))
  const sumberPanah = gaya === 'tabel' && ditulis.length === 1 ? dibaca.join('|') + '>' + ditulis[0] : ''
  useLayoutEffect(() => {
    if (!sumberPanah || !wadah.current) {
      setGaris((g) => (g.length ? [] : g))
      return
    }
    const kotak = wadah.current.getBoundingClientRect()
    const pusat = (k: string) => {
      const el = sel.current.get(k)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left - kotak.left + r.width / 2, y: r.top - kotak.top + r.height / 2, w: r.width / 2, h: r.height / 2 }
    }
    const tujuan = pusat(ditulis[0])
    if (!tujuan) return
    const baru: Garis[] = []
    for (const k of dibaca) {
      const a = pusat(k)
      if (!a) continue
      // Mulai dan berhenti di tepi sel, bukan di tengahnya.
      const dx = tujuan.x - a.x
      const dy = tujuan.y - a.y
      const pj = Math.hypot(dx, dy) || 1
      const potong = (w: number, h: number) => Math.min(w / Math.max(Math.abs(dx / pj), 1e-6), h / Math.max(Math.abs(dy / pj), 1e-6))
      const s = potong(a.w, a.h)
      const e = potong(tujuan.w, tujuan.h) + 3
      baru.push({ x1: a.x + (dx / pj) * s, y1: a.y + (dy / pj) * s, x2: tujuan.x - (dx / pj) * e, y2: tujuan.y - (dy / pj) * e })
    }
    setGaris(baru)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sumberPanah])

  if (!hasil) return <PesanVariabel nama={konfig.variabel} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  if (id === undefined || id === null) return <Kosong teks={<><code className="kode-sebaris">{konfig.variabel}</code> belum menunjuk array.</>} />
  if (!luar || luar.k !== 'array') return null
  const nilaiPenunjuk = (nama?: string) => (nama ? nilaiInt(state, nama) : undefined)
  const pb = nilaiPenunjuk(konfig.baris)
  const pk = nilaiPenunjuk(konfig.kolom)
  const jumlahKolom = Math.max(0, ...barisArr.map((r) => (r && r.k === 'array' ? r.nilai.length : 0)))
  const papan = gaya === 'papan'
  const labelBaris = labelDari(state, konfig.labelBaris, barisArr.length)
  const labelKolom = labelDari(state, konfig.labelKolom, jumlahKolom)

  return (
    <div ref={jangkar} className="inline-flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[13px]">
        <BadgeTipe tipe={hasil.v.tipe} />
        <span className="font-mono font-semibold">{konfig.variabel}</span>
        <span className="text-muted-foreground">
          · {barisArr.length} baris × {jumlahKolom} kolom
        </span>
      </div>
      <div ref={wadah} className={cn('relative', instan && 'instan')}>
        <table className={cn('font-mono', papan ? 'border-separate border-spacing-0' : 'border-separate border-spacing-1')}>
          <thead>
            <tr>
              <th />
              {Array.from({ length: jumlahKolom }, (_, j) => (
                <th key={j} scope="col" className={cn('px-0.5 pb-0.5 text-[11px] font-normal text-muted-foreground', pk === j && 'font-bold text-banding-teks')}>
                  {labelKolom?.[j] !== undefined && <span className="block text-[13px] font-semibold text-foreground">{labelKolom[j]}</span>}
                  [{j}]{pk === j && konfig.kolom ? ` ${konfig.kolom}` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {barisArr.map((r, i) => (
              <tr key={i}>
                <th scope="row" className={cn('pr-1.5 text-right text-[11px] font-normal whitespace-nowrap text-muted-foreground', pb === i && 'font-bold text-banding-teks')}>
                  {pb === i && konfig.baris ? `${konfig.baris} ` : ''}
                  {labelBaris?.[i] !== undefined && <span className="mr-1 text-[13px] font-semibold text-foreground">{labelBaris[i]}</span>}[{i}]
                </th>
                {Array.from({ length: jumlahKolom }, (_, j) => {
                  if (!r || r.k !== 'array' || j >= r.nilai.length) return <td key={j} />
                  const idBaris = luar.nilai[i] as number
                  const kunci = `el:${idBaris}:${j}`
                  const posisi = pb === i && pk === j
                  if (papan) {
                    const isi = isiPapan(r.nilai[j], r.tipeElemen)
                    const gelap = (i + j) % 2 === 1
                    return (
                      <td key={j} className="p-0">
                        <div
                          ref={(el) => void (el ? sel.current.set(kunci, el) : sel.current.delete(kunci))}
                          className={cn(
                            'flex size-11 items-center justify-center text-[15px] font-semibold transition-[background-color,box-shadow] duration-200',
                            gelap ? 'bg-muted' : 'bg-card',
                            sorotan.tulis.has(kunci) && 'bg-tulis-lembut',
                            sorotan.baca.has(kunci) && 'shadow-[inset_0_0_0_2px_var(--banding)]',
                            posisi && 'shadow-[inset_0_0_0_2.5px_var(--banding-teks)]',
                          )}
                        >
                          {isi === 'ratu' ? (
                            <Crown className="size-6 text-foreground" aria-label="ratu" />
                          ) : isi === 'kosong' ? (
                            <span className="sr-only">kosong</span>
                          ) : (
                            <NilaiBerubah teks={tampilNilai(r.nilai[j], r.tipeElemen, state.heap)} instan={instan} />
                          )}
                        </div>
                      </td>
                    )
                  }
                  return (
                    <td key={j}>
                      <div
                        ref={(el) => void (el ? sel.current.set(kunci, el) : sel.current.delete(kunci))}
                        data-sasaran-panah={i === 0 && j === 0 ? '' : undefined}
                        className={cn(
                          'flex h-11 min-w-12 items-center justify-center rounded-md border-[1.5px] px-1 text-[15px] font-semibold transition-[background-color,border-color] duration-300',
                          kelasSorotan(sorotan, kunci),
                          posisi && !sorotan.tulis.has(kunci) && 'ring-2 ring-banding/40',
                        )}
                      >
                        <NilaiBerubah teks={tampilNilai(r.nilai[j], r.tipeElemen, state.heap)} instan={instan} />
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {garis.length > 0 && (
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <defs>
              <marker id={`ujung-dp-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--banding)" />
              </marker>
            </defs>
            {garis.map((g, k) => (
              <line key={k} {...g} stroke="var(--banding)" strokeWidth={1.75} strokeLinecap="round" markerEnd={`url(#ujung-dp-${id})`} />
            ))}
          </svg>
        )}
      </div>
      {gaya === 'tabel' && garis.length > 0 && (
        <p className="text-[12px] text-muted-foreground">Panah: sel yang dibaca untuk mengisi sel hijau pada langkah ini.</p>
      )}
    </div>
  )
}