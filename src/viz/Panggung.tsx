import { useMemo } from 'react'
import type { Langkah, StateMesin, Trace } from '@/engine'
import { cn } from '@/lib/utils'
import { Array2DView, ArrayView, idArrayDari, type KonfigArray, type KonfigArray2D } from './ArrayView'
import { hitungSorotan, namaVariabelDiTrace } from './bersama'
import { Evaluasi, InputView, Konsol, StringView, type KonfigString } from './LainLain'
import { Memori, objekTerjangkau } from './Memori'
import { WadahPanah, type Panah } from './panah'

export type KonfigVisual =
  | KonfigArray
  | KonfigArray2D
  | KonfigString
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

export function Panggung({ trace, state, indeks, output, stdin, konfig, instan }: PropsPanggung) {
  const langkah: Langkah | undefined = trace.langkah[indeks]
  const sorotan = useMemo(() => hitungSorotan(langkah), [langkah])
  const namaDiKode = useMemo(() => namaVariabelDiTrace(trace), [trace])

  // Objek heap yang sudah digambar oleh renderer array (tidak digambar lagi di kolom Heap).
  const sudahTampil = new Set<number>()
  for (const k of konfig) {
    if (k.jenis !== 'array' && k.jenis !== 'array2d') continue
    const id = idArrayDari(state, k.variabel)
    if (typeof id !== 'number') continue
    sudahTampil.add(id)
    const o = state.heap[id]
    if (k.jenis === 'array2d' && o?.k === 'array') for (const r of o.nilai) if (typeof r === 'number') sudahTampil.add(r)
  }
  const stringObjek = konfig.some((k) => k.jenis === 'memori' && k.stringSebagaiObjek)
  const adaMemori = konfig.some((k) => k.jenis === 'memori')
  const tampilDiHeap = new Set(adaMemori ? objekTerjangkau(state, stringObjek) : [])

  const panah: Panah[] = []
  if (adaMemori) {
    for (const f of state.frames) {
      for (const v of f.vars) {
        if (typeof v.nilai !== 'number') continue
        if (sudahTampil.has(v.nilai) || tampilDiHeap.has(v.nilai)) panah.push({ dari: `var:${f.id}:${v.slot}`, ke: `heap:${v.nilai}` })
      }
    }
    for (const v of state.statik) {
      if (typeof v.nilai === 'number' && (sudahTampil.has(v.nilai) || tampilDiHeap.has(v.nilai))) panah.push({ dari: `statik:${v.nama}`, ke: `heap:${v.nilai}` })
    }
  }

  const kembali = langkah?.peristiwa.find((p) => p.k === 'kembali')
  const nilaiKembali = kembali && kembali.k === 'kembali' && kembali.nilai !== undefined ? { frame: kembali.frame, nilai: kembali.nilai } : undefined

  return (
    <WadahPanah panah={panah} pemicu={indeks} className={cn('flex flex-col gap-4', instan && 'instan')}>
      {konfig.map((k, i) => {
        switch (k.jenis) {
          case 'array':
            return <ArrayView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={namaDiKode.has(k.variabel)} adaMemori={adaMemori} />
          case 'array2d':
            return <Array2DView key={i} state={state} sorotan={sorotan} instan={instan} konfig={k} adaDiKode={namaDiKode.has(k.variabel)} adaMemori={adaMemori} />
          case 'string':
            return <StringView key={i} state={state} konfig={k} adaDiKode={namaDiKode.has(k.variabel)} adaMemori={adaMemori} />
          case 'evaluasi':
            return <Evaluasi key={i} langkah={langkah} instan={instan} />
          case 'konsol':
            return <Konsol key={i} output={output} langkah={langkah} rentangErr={trace.rentangErr} />
          case 'input':
            return <InputView key={i} stdin={stdin} state={state} langkah={langkah} />
          case 'memori':
            return (
              <Memori key={i} state={state} sorotan={sorotan} instan={instan} sudahTampil={sudahTampil} stringObjek={stringObjek} nilaiKembali={nilaiKembali} />
            )
        }
      })}
    </WadahPanah>
  )
}
