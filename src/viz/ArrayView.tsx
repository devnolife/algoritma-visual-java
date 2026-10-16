import { tampilNilai, type StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { cariVariabel, kelasSorotan, NilaiBerubah, PesanVariabel, type Sorotan } from './bersama'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'

export interface KonfigArray {
  jenis: 'array'
  variabel: string
  gaya?: 'sel' | 'batang'
  penunjuk?: string[]
  judul?: string
}

function Kosong({ teks }: { teks: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">{teks}</p>
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
}: {
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  konfig: KonfigArray
  adaDiKode?: boolean
  adaMemori?: boolean
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
      const p = cariVariabel(state, nama)
      return p && typeof p.v.nilai === 'number' && ['int', 'short', 'byte'].includes(p.v.tipe) ? { nama, nilai: p.v.nilai } : null
    })
    .filter((x): x is { nama: string; nilai: number } => x !== null)
  const luarBatas = penunjuk.filter((p) => p.nilai < 0 || p.nilai >= o.nilai.length)
  // Sel bayangan (di luar array) untuk penunjuk yang keluar batas, mis. i = 5 pada array panjang 5.
  const selHantu = (sisi: 'kiri' | 'kanan') => {
    const ps = luarBatas.filter((p) => (sisi === 'kiri' ? p.nilai < 0 : p.nilai >= o.nilai.length))
    if (ps.length === 0) return null
    const indeks = sisi === 'kiri' ? Math.max(...ps.map((p) => p.nilai)) : Math.min(...ps.map((p) => p.nilai))
    return (
      <div role="listitem" aria-label={`indeks ${indeks} berada di luar array`} className="flex w-14 shrink-0 flex-col items-center gap-1">
        <div
          className={cn(
            'flex w-14 items-center justify-center rounded-lg border-[1.5px] border-dashed border-galat bg-galat-lembut/60 font-mono text-[15px] font-semibold text-galat',
            batang ? 'h-28' : 'h-13',
          )}
        >
          ✕
        </div>
        <span className="font-mono text-[11px] font-semibold text-galat">[{indeks}]</span>
        <div className="flex min-h-6 flex-col items-center leading-none">
          {ps.map((p) => (
            <span key={p.nama} className="flex flex-col items-center font-mono text-[11.5px] font-bold text-galat">
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
        {luarBatas.length > 0 && (
          <span className="font-mono text-[12px] font-semibold text-galat">
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
          return (
            <div key={i} role="listitem" className="flex w-14 shrink-0 flex-col items-center gap-1">
              {batang ? (
                <div data-sasaran-panah={i === 0 ? '' : undefined} className="flex h-28 w-full flex-col items-center justify-end">
                  <span className="mb-1 font-mono text-[12px] font-semibold">
                    <NilaiBerubah teks={teks} instan={instan} />
                  </span>
                  <div
                    className={cn(
                      'gerak w-10 origin-bottom rounded-t-md border-[1.5px] border-b-0 transition-[transform,background-color,border-color] duration-200',
                      kelasSorotan(sorotan, kunci),
                    )}
                    style={{ height: '88px', transform: `scaleY(${Math.max(0.04, Math.abs(angka[i]) / maks)})`, transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)' }}
                  />
                </div>
              ) : (
                <div
                  data-sasaran-panah={i === 0 ? '' : undefined}
                  className={cn(
                    'flex h-13 w-14 items-center justify-center rounded-lg border-[1.5px] font-mono text-[17px] font-semibold transition-[background-color,border-color,box-shadow] duration-300 ease-out',
                    kelasSorotan(sorotan, kunci),
                  )}
                >
                  <NilaiBerubah teks={teks} instan={instan} />
                </div>
              )}
              <span className="font-mono text-[11px] text-muted-foreground">[{i}]</span>
              <div className="flex min-h-6 flex-col items-center leading-none">
                {disini.map((p) => (
                  <span key={p.nama} className="flex flex-col items-center font-mono text-[11.5px] font-bold text-banding">
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
  if (!hasil) return <PesanVariabel nama={konfig.variabel} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  if (id === undefined || id === null) return <Kosong teks={<><code className="kode-sebaris">{konfig.variabel}</code> belum menunjuk array.</>} />
  const luar = state.heap[id]
  if (!luar || luar.k !== 'array') return null
  const nilaiPenunjuk = (nama?: string) => {
    if (!nama) return undefined
    const p = cariVariabel(state, nama)
    return p && typeof p.v.nilai === 'number' ? p.v.nilai : undefined
  }
  const pb = nilaiPenunjuk(konfig.baris)
  const pk = nilaiPenunjuk(konfig.kolom)
  const barisArr = luar.nilai.map((r) => (typeof r === 'number' ? state.heap[r] : undefined))
  const jumlahKolom = Math.max(0, ...barisArr.map((r) => (r && r.k === 'array' ? r.nilai.length : 0)))
  return (
    <div ref={jangkar} className="inline-flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[13px]">
        <BadgeTipe tipe={hasil.v.tipe} />
        <span className="font-mono font-semibold">{konfig.variabel}</span>
        <span className="text-muted-foreground">
          · {luar.nilai.length} baris × {jumlahKolom} kolom
        </span>
      </div>
      <table className="border-separate border-spacing-1 font-mono">
        <thead>
          <tr>
            <th />
            {Array.from({ length: jumlahKolom }, (_, j) => (
              <th key={j} className={cn('text-[11px] font-normal text-muted-foreground', pk === j && 'font-bold text-banding')}>
                [{j}]{pk === j && konfig.kolom ? ` ${konfig.kolom}` : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {barisArr.map((r, i) => (
            <tr key={i}>
              <th className={cn('pr-1 text-right text-[11px] font-normal text-muted-foreground', pb === i && 'font-bold text-banding')}>
                {pb === i && konfig.baris ? `${konfig.baris} ` : ''}[{i}]
              </th>
              {Array.from({ length: jumlahKolom }, (_, j) => {
                if (!r || r.k !== 'array' || j >= r.nilai.length) return <td key={j} />
                const idBaris = luar.nilai[i] as number
                const kunci = `el:${idBaris}:${j}`
                return (
                  <td key={j}>
                    <div
                      data-sasaran-panah={i === 0 && j === 0 ? '' : undefined}
                      className={cn(
                        'flex h-11 min-w-12 items-center justify-center rounded-md border-[1.5px] px-1 text-[15px] font-semibold transition-[background-color,border-color] duration-300',
                        kelasSorotan(sorotan, kunci),
                        pb === i && pk === j && !sorotan.tulis.has(kunci) && 'ring-2 ring-banding/40',
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
    </div>
  )
}
