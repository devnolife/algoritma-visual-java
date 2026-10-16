import { AnimatePresence, motion } from 'motion/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { tampilNilai, type FrameState, type ObjekHeap, type StateMesin, type VarState } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, kelasSorotan, NilaiBerubah, type Sorotan } from './bersama'
import { useJangkar } from './panah'
import { infoTipe, kelasTipe } from './warnaTipe'

const adalahReferensi = (tipe: string) => tipe.endsWith('[]') || tipe === 'Scanner' || tipe === 'Object'

export function BadgeTipe({ tipe }: { tipe: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className={cn('cursor-help rounded-[5px] px-1.5 py-px font-mono text-[11px] font-semibold', kelasTipe(tipe))}>
          {tipe}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-[12.5px] leading-snug">
        {infoTipe(tipe)}
      </TooltipContent>
    </Tooltip>
  )
}

function KotakVariabel({
  v,
  kunci,
  heap,
  sorotan,
  instan,
  stringObjek,
}: {
  v: VarState
  kunci: string
  heap: StateMesin['heap']
  sorotan: Sorotan
  instan: boolean
  stringObjek: boolean
}) {
  const jangkar = useJangkar(kunci)
  const referensi = adalahReferensi(v.tipe) || (stringObjek && v.tipe === 'String')
  const belum = v.nilai === undefined
  let isi: React.ReactNode
  if (belum) {
    isi = (
      <span className="text-muted-foreground" title="Belum diisi nilai">
        ?
      </span>
    )
  } else if (referensi && v.nilai !== null) {
    isi = <span ref={jangkar} role="img" className="block size-2.5 rounded-full bg-tipe-ref" aria-label={`menunjuk ke ${tampilNilai(v.nilai, v.tipe, heap)}`} />
  } else {
    const teks = tampilNilai(v.nilai, v.tipe, heap)
    isi = (
      <span className="flex items-baseline gap-1">
        <NilaiBerubah teks={teks} instan={instan} />
        {v.tipe === 'char' && typeof v.nilai === 'number' && (
          <span className="font-sans text-[10px] font-normal text-muted-foreground" title="Kode Unicode karakter ini">
            {v.nilai}
          </span>
        )}
      </span>
    )
  }
  return (
    <motion.div
      className="gerak flex min-w-[88px] flex-col gap-1"
      initial={{ opacity: 0, transform: 'translateY(6px) scale(0.97)' }}
      animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
      exit={{ opacity: 0, transform: 'scale(0.97)' }}
      transition={instan ? { duration: 0 } : { duration: 0.2, ease: EASE_KELUAR }}
    >
      <div className="flex items-center gap-1.5 font-mono text-[13px] font-semibold">
        <BadgeTipe tipe={v.tipe} />
        <span>{v.nama}</span>
      </div>
      <div
        data-kotak-nilai
        className={cn(
          'flex h-11 min-w-[88px] items-center justify-center rounded-lg border-[1.5px] px-3 font-mono text-lg font-semibold transition-[background-color,border-color,box-shadow] duration-300 ease-out',
          kelasSorotan(sorotan, kunci),
        )}
      >
        {isi}
      </div>
    </motion.div>
  )
}

function labelFrame(f: FrameState, heap: StateMesin['heap']): string {
  const param = f.vars.filter((v) => v.param && !(f.method === 'main' && v.nama === 'args'))
  // Parameter array cukup ditulis namanya (isinya sudah terlihat lewat panah); String panjang dipotong.
  const teks = (p: (typeof param)[number]) => {
    if (p.tipe.endsWith('[]')) return p.nama
    const nilai = tampilNilai(p.nilai, p.tipe, heap)
    return `${p.nama} = ${nilai.length > 14 ? `${nilai.slice(0, 12)}…${nilai.endsWith('"') ? '"' : ''}` : nilai}`
  }
  return `${f.method}(${param.map(teks).join(', ')})`
}

function KotakFrame({
  f,
  aktif,
  state,
  sorotan,
  instan,
  stringObjek,
  nilaiKembali,
}: {
  f: FrameState
  aktif: boolean
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  stringObjek: boolean
  nilaiKembali?: string
}) {
  const vars = f.vars.filter((v) => !(f.method === 'main' && v.param && v.nama === 'args'))
  return (
    <motion.section
      layout="position"
      data-bingkai
      className={cn('gerak relative rounded-xl border bg-card/80 px-4 pb-3.5 pt-5', aktif ? 'border-primary/45 shadow-sm' : 'border-dashed border-border')}
      initial={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }}
      animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
      exit={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }}
      transition={instan ? { duration: 0 } : { duration: 0.2, ease: EASE_KELUAR }}
      aria-label={`Frame ${f.method}`}
    >
      <span
        className={cn(
          'absolute -top-2.5 left-3 rounded-md border bg-card px-2 font-mono text-[11.5px]',
          aktif ? 'border-primary/45 text-foreground' : 'text-muted-foreground',
        )}
      >
        {labelFrame(f, state.heap)}
      </span>
      {nilaiKembali !== undefined && (
        <span className="absolute -top-2.5 right-3 rounded-md border border-tulis bg-tulis-lembut px-2 font-mono text-[11.5px] font-semibold">
          return {nilaiKembali}
        </span>
      )}
      {vars.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Belum ada variabel.</p>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <AnimatePresence initial={false}>
            {vars.map((v) => (
              <KotakVariabel
                key={`${f.id}:${v.slot}`}
                v={v}
                kunci={`var:${f.id}:${v.slot}`}
                heap={state.heap}
                sorotan={sorotan}
                instan={instan}
                stringObjek={stringObjek}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  )
}

function ObjekDiHeap({ id, o, state, sorotan, instan }: { id: number; o: ObjekHeap; state: StateMesin; sorotan: Sorotan; instan: boolean }) {
  const jangkar = useJangkar(`heap:${id}`)
  if (o.k === 'string') {
    return (
      <div ref={jangkar} className="rounded-lg border-[1.5px] border-input bg-card px-3 py-2 font-mono text-[14px]">
        <span className="mr-2 text-[11px] text-tipe-string">String</span>"{o.nilai}"
      </div>
    )
  }
  if (o.k === 'scanner') {
    return (
      <div ref={jangkar} className="rounded-lg border-[1.5px] border-input bg-card px-3 py-2 font-mono text-[13px] text-muted-foreground">
        Scanner(System.in)
      </div>
    )
  }
  return (
    <div ref={jangkar} className="flex flex-col gap-1">
      <span className="font-mono text-[11px] text-muted-foreground">
        {o.tipeElemen}[{o.nilai.length}]
      </span>
      <div className="flex flex-wrap gap-1">
        {o.nilai.map((x, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              data-sasaran-panah={i === 0 ? '' : undefined}
              className={cn(
                'flex h-9 min-w-9 items-center justify-center rounded-md border-[1.5px] px-1.5 font-mono text-[13px] font-semibold transition-[background-color,border-color] duration-300',
                kelasSorotan(sorotan, `el:${id}:${i}`),
              )}
            >
              {o.tipeElemen.endsWith('[]') && x !== null ? '●' : <NilaiBerubah teks={tampilNilai(x, o.tipeElemen, state.heap)} instan={instan} />}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">[{i}]</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Id objek heap yang dirujuk variabel (langsung maupun lewat array referensi). */
export function objekTerjangkau(state: StateMesin, stringObjek: boolean): number[] {
  const hasil: number[] = []
  const lihat = new Set<number>()
  const kunjungi = (id: number) => {
    if (lihat.has(id)) return
    const o = state.heap[id]
    if (!o) return
    if (o.k === 'string' && !stringObjek) return
    lihat.add(id)
    hasil.push(id)
    if (o.k === 'array' && (o.tipeElemen.endsWith('[]') || (stringObjek && o.tipeElemen === 'String'))) {
      for (const x of o.nilai) if (typeof x === 'number') kunjungi(x)
    }
  }
  for (const f of state.frames) {
    for (const v of f.vars) {
      if (f.method === 'main' && v.param && v.nama === 'args') continue
      if (typeof v.nilai === 'number' && (adalahReferensi(v.tipe) || v.tipe === 'String')) kunjungi(v.nilai)
    }
  }
  for (const v of state.statik) if (typeof v.nilai === 'number' && (adalahReferensi(v.tipe) || v.tipe === 'String')) kunjungi(v.nilai)
  return hasil
}

export interface PropsMemori {
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  /** Objek heap yang sudah digambar renderer lain (tidak digambar ulang di sini). */
  sudahTampil: Set<number>
  stringObjek?: boolean
  nilaiKembali?: { frame: number; nilai: string }
}

export function Memori({ state, sorotan, instan, sudahTampil, stringObjek = false, nilaiKembali }: PropsMemori) {
  const heap = objekTerjangkau(state, stringObjek).filter((id) => !sudahTampil.has(id))
  const frames = state.frames
  return (
    <div className="flex items-start gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Istilah "call stack" baru relevan saat ada pemanggilan method. */}
        {frames.length > 1 && <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Call stack</span>}
        {state.statik.length > 0 && (
          <section data-bingkai className="rounded-xl border border-dashed bg-card/60 px-4 pb-3.5 pt-3">
            <span className="mb-2 block text-[11px] text-muted-foreground">Variabel class (static)</span>
            <div className="flex flex-wrap gap-x-4 gap-y-3">
              {state.statik.map((v) => (
                <KotakVariabel key={v.nama} v={v} kunci={`statik:${v.nama}`} heap={state.heap} sorotan={sorotan} instan={instan} stringObjek={stringObjek} />
              ))}
            </div>
          </section>
        )}
        <div className="flex flex-col-reverse gap-4 pt-2">
          <AnimatePresence initial={false}>
            {frames.map((f, i) => (
              <KotakFrame
                key={f.id}
                f={f}
                aktif={i === frames.length - 1}
                state={state}
                sorotan={sorotan}
                instan={instan}
                stringObjek={stringObjek}
                nilaiKembali={nilaiKembali?.frame === f.id ? nilaiKembali.nilai : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      {heap.length > 0 && (
        <div className="flex max-w-[45%] flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Heap</span>
          {heap.map((id) => (
            <ObjekDiHeap key={id} id={id} o={state.heap[id]} state={state} sorotan={sorotan} instan={instan} />
          ))}
        </div>
      )}
    </div>
  )
}
