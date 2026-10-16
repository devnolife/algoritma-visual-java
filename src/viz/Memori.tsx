import { ArrowUp, CircleCheck, CornerDownRight, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { namaKelasTampil, tampilNilai, type FrameState, type ObjekHeap, type StateMesin, type VarState } from '@/engine'
import type { Nilai } from '@/engine/nilai'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, kelasSorotan, NilaiBerubah, type Sorotan } from './bersama'
import {
  adalahEntri,
  adalahException,
  adalahIterator,
  adalahObjekKoleksi,
  namaKoleksi,
  objekInternal,
  pesanException,
  ringkasKoleksi,
  teksElemen,
  teksRingkasKoleksi,
} from './dataKoleksi'
import { adalahPrimitif } from './jalur'
import { useJangkar } from './panah'
import { idExceptionAktif, type AlurException } from './sorotan'
import { infoTipe, kelasTipe } from './warnaTipe'

type Heap = StateMesin['heap']
type Objek = Extract<ObjekHeap, { k: 'objek' }>

/**
 * Nilai yang digambar sebagai titik + panah ke objeknya di heap: semua referensi non-null, kecuali String yang
 * ditulis langsung di kotaknya (selama String tidak sedang ditampilkan sebagai objek).
 */
export function tampilSebagaiPanah(tipe: string, nilai: Nilai | undefined, heap: Heap, stringObjek: boolean): boolean {
  if (adalahPrimitif(tipe) || typeof nilai !== 'number') return false
  const o = heap[nilai]
  if (!o) return false
  return o.k !== 'string' || stringObjek
}

/** Objek class mahasiswa (termasuk exception buatan sendiri): kotak berfield di heap Memori. */
const objekMahasiswa = (heap: Heap, id: number): Objek | undefined => {
  const o = heap[id]
  return o?.k === 'objek' && !o.kelas.startsWith('java.') ? o : undefined
}

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
  const referensi = tampilSebagaiPanah(v.tipe, v.nilai, heap, stringObjek)
  const belum = v.nilai === undefined
  let isi: React.ReactNode
  if (belum) {
    isi = (
      <span className="text-muted-foreground" title="Belum diisi nilai">
        ?
      </span>
    )
  } else if (referensi) {
    isi = <span ref={jangkar} role="img" className="block size-2.5 rounded-full bg-tipe-ref" aria-label={`menunjuk ke ${teksElemen(v.nilai, heap)}`} />
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

/** Frame konstruktor: punya `this` yang objeknya bernama sama dengan method frame. */
function adalahKonstruktor(f: FrameState, heap: Heap): boolean {
  const ini = f.vars.find((v) => v.nama === 'this')
  const o = typeof ini?.nilai === 'number' ? heap[ini.nilai] : undefined
  return o?.k === 'objek' && namaKelasTampil(o.kelas) === f.method
}

function labelFrame(f: FrameState, heap: StateMesin['heap']): string {
  const param = f.vars.filter((v) => v.param && v.nama !== 'this' && !(f.method === 'main' && v.nama === 'args'))
  // Parameter array/objek cukup ditulis namanya (isinya sudah terlihat lewat panah); String panjang dipotong.
  const teks = (p: (typeof param)[number]) => {
    if (p.tipe.endsWith('[]') || (typeof p.nilai === 'number' && heap[p.nilai]?.k === 'objek')) return p.nama
    const nilai = tampilNilai(p.nilai, p.tipe, heap)
    return `${p.nama} = ${nilai.length > 14 ? `${nilai.slice(0, 12)}…${nilai.endsWith('"') ? '"' : ''}` : nilai}`
  }
  return `${adalahKonstruktor(f, heap) ? 'new ' : ''}${f.method}(${param.map(teks).join(', ')})`
}

function KotakFrame({
  f,
  aktif,
  state,
  sorotan,
  instan,
  stringObjek,
  nilaiKembali,
  menangkap,
}: {
  f: FrameState
  aktif: boolean
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  stringObjek: boolean
  nilaiKembali?: string
  /** Blok catch di frame ini menangkap exception pada langkah ini. */
  menangkap?: string
}) {
  const vars = f.vars.filter((v) => !(f.method === 'main' && v.param && v.nama === 'args'))
  return (
    <motion.section
      layout="position"
      data-bingkai
      className={cn(
        'gerak relative rounded-xl border bg-card/80 px-4 pb-3.5 pt-5',
        aktif ? 'border-primary/45 shadow-sm' : 'border-dashed border-border',
        menangkap && 'border-tulis ring-2 ring-tulis/25',
      )}
      initial={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }}
      animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
      exit={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }}
      transition={instan ? { duration: 0 } : { duration: 0.2, ease: EASE_KELUAR }}
      aria-label={`Frame ${f.method}`}
    >
      <span
        title={labelFrame(f, state.heap)}
        className={cn(
          'absolute -top-2.5 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-md border bg-card px-2 font-mono text-[11.5px] whitespace-nowrap',
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
      {menangkap && nilaiKembali === undefined && (
        <span title={menangkap} className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-md border border-tulis bg-tulis-lembut px-2 font-mono text-[11.5px] font-semibold whitespace-nowrap">
          <CircleCheck className="size-3 text-tulis-teks" aria-hidden="true" />
          catch
          <span className="sr-only">: {menangkap}</span>
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

/** Frame yang baru saja dibuang karena exception merambat keluar darinya (digambar memudar). */
function FrameDibuang({ method, kelas, instan }: { method: string; kelas: string; instan: boolean }) {
  return (
    <motion.section
      className="relative rounded-xl border-[1.5px] border-dashed border-galat/60 bg-galat-lembut/40 px-3 pb-2 pt-3.5"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 0.6 }}
      transition={instan ? { duration: 0 } : { duration: 0.32, ease: EASE_KELUAR }}
      aria-label={`Frame ${method} dibuang karena ${namaKelasTampil(kelas)} merambat keluar`}
    >
      <span className="absolute -top-2.5 left-3 rounded-md border border-galat/50 bg-card px-2 font-mono text-[11.5px] text-muted-foreground line-through decoration-galat/70">{method}(…)</span>
      <p className="flex items-center gap-1.5 text-[12px]">
        <ArrowUp className="size-3.5 shrink-0 text-galat" aria-hidden="true" />
        dibuang: exception merambat keluar
      </p>
    </motion.section>
  )
}

/** Ringkasan alur exception pada langkah ini: dilempar → merambat → ditangkap → finally. */
function StripAlurException({ alur, heap }: { alur: AlurException; heap: Heap }) {
  const sebabFinally: Record<string, string> = {
    normal: 'blok try selesai normal',
    exception: 'ada exception',
    return: 'ada return',
    break: 'ada break',
    continue: 'ada continue',
  }
  const pesanDari = (id: number | undefined, pesan: string | null) => {
    const o = id !== undefined ? heap[id] : undefined
    return o?.k === 'objek' ? pesanException(heap, o) : pesan
  }
  const bagian: React.ReactNode[] = []
  if (alur.lempar) {
    const p = pesanDari(alur.lempar.id, alur.lempar.pesan)
    bagian.push(
      <span key="lempar" className="flex items-center gap-1.5 rounded-full border border-galat/50 bg-galat-lembut px-2.5 py-0.5">
        <Zap className="size-3.5 text-galat" aria-hidden="true" />
        <span>
          dilempar <code className="font-mono font-semibold">{namaKelasTampil(alur.lempar.kelas)}</code>
          {p !== null && <span className="font-mono">: "{p}"</span>}
        </span>
      </span>,
    )
  }
  if (alur.rambat.length) {
    bagian.push(
      <span key="rambat" className="flex items-center gap-1.5 rounded-full border border-dashed border-galat/50 px-2.5 py-0.5">
        <ArrowUp className="size-3.5 text-galat" aria-hidden="true" />
        keluar dari <code className="font-mono font-semibold">{alur.rambat.map((r) => `${r.method}()`).join(', ')}</code>
      </span>,
    )
  }
  if (alur.tangkap) {
    bagian.push(
      <span key="tangkap" className="flex items-center gap-1.5 rounded-full border border-tulis/60 bg-tulis-lembut px-2.5 py-0.5">
        <CircleCheck className="size-3.5 text-tulis-teks" aria-hidden="true" />
        ditangkap <code className="font-mono font-semibold">catch ({alur.tangkap.tipe} {alur.tangkap.variabel})</code>
      </span>,
    )
  }
  if (alur.finally) {
    bagian.push(
      <span key="finally" className="flex items-center gap-1.5 rounded-full border border-banding/60 bg-banding-lembut px-2.5 py-0.5">
        <CornerDownRight className="size-3.5 text-banding-teks" aria-hidden="true" />
        <code className="font-mono font-semibold">finally</code> dijalankan ({sebabFinally[alur.finally.sebab] ?? alur.finally.sebab})
      </span>,
    )
  }
  if (alur.takTertangkap) {
    bagian.push(
      <span key="tak" className="flex items-center gap-1.5 rounded-full border border-galat bg-galat-lembut px-2.5 py-0.5 font-semibold">
        <Zap className="size-3.5 text-galat" aria-hidden="true" />
        <code className="font-mono">{namaKelasTampil(alur.takTertangkap.kelas)}</code> tidak tertangkap: program berhenti
      </span>,
    )
  }
  return (
    <div role="group" aria-label="Alur exception pada langkah ini" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px]">
      {bagian.map((b, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span aria-hidden="true" className="text-muted-foreground">
              →
            </span>
          )}
          {b}
        </span>
      ))}
    </div>
  )
}

// ---------- Objek heap ----------
function BarisField({
  id,
  nama,
  tipe,
  nilai,
  heap,
  sorotan,
  instan,
  stringObjek,
}: {
  id: number
  nama: string
  tipe: string
  nilai: Nilai
  heap: Heap
  sorotan: Sorotan
  instan: boolean
  stringObjek: boolean
}) {
  const kunci = `field:${id}:${nama}`
  const jangkar = useJangkar(kunci)
  const panah = tampilSebagaiPanah(tipe, nilai, heap, stringObjek)
  return (
    <>
      <BadgeTipe tipe={tipe} />
      <span className="font-mono text-[13px] font-semibold">{nama}</span>
      <div
        data-kotak-nilai
        className={cn(
          'flex h-9 min-w-[64px] items-center rounded-lg border-[1.5px] px-2.5 font-mono text-[15px] font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow] duration-300 ease-out',
          panah ? 'justify-end' : 'justify-center',
          kelasSorotan(sorotan, kunci),
        )}
      >
        {panah ? (
          <span ref={jangkar} role="img" className="block size-2.5 rounded-full bg-tipe-ref" aria-label={`${nama} menunjuk ke ${teksElemen(nilai, heap)}`} />
        ) : (
          <NilaiBerubah teks={tampilNilai(nilai, tipe, heap)} instan={instan} />
        )}
      </div>
    </>
  )
}

const LABEL_KOTAK = 'absolute -top-2.5 left-3 rounded-md border bg-card px-2 font-mono text-[11.5px] font-semibold whitespace-nowrap'

/** Pengganjal tak terlihat selebar label kotak, agar kotak tidak lebih sempit daripada labelnya. */
function SpasiLabel({ teks }: { teks: string }) {
  return (
    <span aria-hidden="true" className="invisible block h-0 overflow-hidden px-2 font-mono text-[11.5px] font-semibold whitespace-nowrap">
      {teks}
    </span>
  )
}

function KotakObjek({
  id,
  o,
  state,
  sorotan,
  instan,
  stringObjek,
  exceptionAktif,
}: {
  id: number
  o: Objek
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  stringObjek: boolean
  exceptionAktif: boolean
}) {
  const jangkar = useJangkar(`heap:${id}`)
  const exc = adalahException(o)
  const field = Object.keys(o.field).filter((f) => f !== 'this$0' && !(exc && ['detailMessage', 'cause', 'stackTrace', 'suppressedExceptions'].includes(f)))
  const pesan = exc ? pesanException(state.heap, o) : null
  const baru = sorotan.baru.has(`obj:${id}`)
  return (
    <div
      ref={jangkar}
      data-bingkai
      data-heap-memori=""
      className={cn(
        'relative w-fit rounded-xl border-[1.5px] bg-card px-3 pb-2.5 pt-4 transition-[border-color,box-shadow] duration-200',
        exc ? 'border-galat/45' : 'border-input',
        baru && 'border-tulis ring-2 ring-tulis/25',
        exceptionAktif && 'border-galat ring-2 ring-galat/30',
      )}
    >
      <span data-sasaran-panah="" className={cn(LABEL_KOTAK, exc ? 'border-galat/45 text-galat' : 'text-tipe-ref')}>
        {namaKelasTampil(o.kelas)}
      </span>
      <SpasiLabel teks={namaKelasTampil(o.kelas)} />
      {exc && (
        <div className="mb-1.5 flex flex-col gap-0.5">
          <span className="font-mono text-[13.5px]">{pesan === null ? <span className="text-muted-foreground">(tanpa pesan)</span> : `"${pesan}"`}</span>
          {o.jejak?.[0] && (
            <span title={o.jejak.map((j) => j.trim()).join('\n')} className="max-w-52 truncate font-mono text-[11px] text-muted-foreground">
              {o.jejak[0].trim()}
            </span>
          )}
        </div>
      )}
      {field.length > 0 ? (
        <div className="grid grid-cols-[auto_auto_minmax(64px,1fr)] items-center gap-x-2 gap-y-1.5">
          {field.map((f) => (
            <BarisField key={f} id={id} nama={f} tipe={o.tipeField[f] ?? 'Object'} nilai={o.field[f]} heap={state.heap} sorotan={sorotan} instan={instan} stringObjek={stringObjek} />
          ))}
        </div>
      ) : (
        !exc && <p className="text-[12px] text-muted-foreground">tanpa field</p>
      )}
    </div>
  )
}

const CACHE: Record<string, (n: number) => boolean> = {
  Integer: (n) => n >= -128 && n <= 127,
  Short: (n) => n >= -128 && n <= 127,
  Byte: () => true,
  Character: (n) => n <= 127,
  Boolean: () => true,
}

function KotakKecil({ id, label, sorotan, children, kunciSorot, labelKelas }: { id: number; label: string; sorotan: Sorotan; children: React.ReactNode; kunciSorot?: string; labelKelas?: string }) {
  const jangkar = useJangkar(`heap:${id}`)
  return (
    <div
      ref={jangkar}
      data-bingkai
      data-heap-memori=""
      className={cn('relative flex w-fit max-w-full flex-col gap-0.5 rounded-lg border-[1.5px] px-3 pt-3.5 pb-2 font-mono transition-[background-color,border-color,box-shadow] duration-200', kelasSorotan(sorotan, kunciSorot ?? `obj:${id}`))}
    >
      <span data-sasaran-panah="" className={cn(LABEL_KOTAK, labelKelas ?? 'text-tipe-ref')}>
        {label}
      </span>
      <SpasiLabel teks={label} />
      {children}
    </div>
  )
}

function KartuKoleksi({ id, o, heap, sorotan }: { id: number; o: Objek; heap: Heap; sorotan: Sorotan }) {
  const r = ringkasKoleksi(heap, id, 9)
  const berubah = objekInternal(heap, id).some((x) => sorotan.berubah.has(x))
  const sorot: Sorotan = berubah ? { ...sorotan, tulis: new Set([`obj:${id}`]) } : sorotan
  return (
    <KotakKecil id={id} label={namaKoleksi(o.kelas)} sorotan={sorot}>
      <span className="text-[11px] text-muted-foreground">size() = {r?.ukuran ?? '?'}</span>
      <span className="max-w-72 truncate text-[14px] font-semibold" title={r ? teksRingkasKoleksi(r, 30) : undefined}>
        {r ? teksRingkasKoleksi(r) : '…'}
      </span>
    </KotakKecil>
  )
}

function ObjekDiHeap({
  id,
  o,
  state,
  sorotan,
  instan,
  stringObjek,
  exceptionAktif,
}: {
  id: number
  o: ObjekHeap
  state: StateMesin
  sorotan: Sorotan
  instan: boolean
  stringObjek: boolean
  exceptionAktif: boolean
}) {
  const jangkar = useJangkar(`heap:${id}`)
  if (o.k === 'string') {
    return (
      <div ref={jangkar} className="w-fit rounded-lg border-[1.5px] border-input bg-card px-3 py-2 font-mono text-[14px]">
        <span className="mr-2 text-[11px] text-tipe-string">String</span>"{o.nilai}"
      </div>
    )
  }
  if (o.k === 'scanner') {
    return (
      <div ref={jangkar} className="w-fit rounded-lg border-[1.5px] border-input bg-card px-3 py-2 font-mono text-[13px] text-muted-foreground">
        Scanner(System.in)
      </div>
    )
  }
  if (o.k === 'boks') {
    const n = typeof o.nilai === 'number' ? o.nilai : 0
    return (
      <KotakKecil id={id} label={o.kelas} sorotan={sorotan}>
        <span className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold">{tampilNilai(id, 'Object', state.heap)}</span>
          {CACHE[o.kelas]?.(n) && (
            <span className="font-sans text-[10.5px] text-muted-foreground" title="Objek ini diambil dari cache JDK: nilai yang sama selalu memakai objek yang sama.">
              dari cache
            </span>
          )}
        </span>
      </KotakKecil>
    )
  }
  if (o.k === 'pembangun') {
    return (
      <KotakKecil id={id} label="StringBuilder" sorotan={sorotan}>
        <span className="text-[14px] font-semibold">
          <NilaiBerubah teks={`"${o.nilai}"`} instan={instan} />
        </span>
        <span className="text-[11px] text-muted-foreground">length() = {o.nilai.length}</span>
      </KotakKecil>
    )
  }
  if (o.k === 'lambda') {
    return (
      <KotakKecil id={id} label="Comparator (lambda)" sorotan={sorotan}>
        <span className="max-w-80 text-[13px] whitespace-pre-wrap">{o.teks}</span>
        {o.tangkapan.length > 0 && (
          <span className="text-[11px] text-muted-foreground">menangkap {o.tangkapan.map((v) => `${v.nama} = ${tampilNilai(v.nilai, v.tipe, state.heap)}`).join(', ')}</span>
        )}
      </KotakKecil>
    )
  }
  if (o.k === 'objek') {
    if (adalahObjekKoleksi(state.heap, id)) return <KartuKoleksi id={id} o={o} heap={state.heap} sorotan={sorotan} />
    if (adalahEntri(o)) {
      return (
        <KotakKecil id={id} label="Map.Entry" sorotan={sorotan} kunciSorot={`field:${id}:value`}>
          <span className="text-[14px]">
            <span className="text-muted-foreground">key = </span>
            <span className="font-semibold">{teksElemen(o.field.key, state.heap, 1)}</span>
          </span>
          <span className="text-[14px]">
            <span className="text-muted-foreground">value = </span>
            <span className="font-semibold">{teksElemen(o.field.value, state.heap, 1)}</span>
          </span>
        </KotakKecil>
      )
    }
    if (adalahIterator(o)) {
      const pemilik = o.field.this$0
      const angka = Object.entries(o.field).filter(([f]) => adalahPrimitif(o.tipeField[f] ?? '') && f !== 'expectedModCount')
      return (
        <KotakKecil id={id} label={`Iterator (${namaKelasTampil(o.kelas)})`} sorotan={sorotan}>
          {angka.length > 0 && <span className="text-[12.5px]">{angka.map(([f, x]) => `${f} = ${tampilNilai(x, o.tipeField[f], state.heap)}`).join(', ')}</span>}
          {typeof pemilik === 'number' && <span className="text-[11px] text-muted-foreground">milik {teksElemen(pemilik, state.heap, 1)}</span>}
        </KotakKecil>
      )
    }
    if (o.kelas.startsWith('java.') && !adalahException(o)) {
      return (
        <KotakKecil id={id} label={namaKelasTampil(o.kelas)} sorotan={sorotan}>
          <span className="text-[12px] text-muted-foreground">objek pustaka</span>
        </KotakKecil>
      )
    }
    return <KotakObjek id={id} o={o} state={state} sorotan={sorotan} instan={instan} stringObjek={stringObjek} exceptionAktif={exceptionAktif} />
  }
  const elemenRef = !adalahPrimitif(o.tipeElemen) && !o.tipeElemen.endsWith('[]') && o.tipeElemen !== 'String'
  return (
    <div ref={jangkar} data-bingkai data-heap-memori="" className="flex flex-col gap-1">
      <span className="font-mono text-[11px] text-muted-foreground">
        {o.tipeElemen}[{o.nilai.length}]
      </span>
      <div className="flex flex-wrap gap-1">
        {o.nilai.map((x, i) => (
          <SelArray key={i} id={id} i={i} x={x} tipe={o.tipeElemen} elemenRef={elemenRef} state={state} sorotan={sorotan} instan={instan} />
        ))}
      </div>
    </div>
  )
}

function SelArray({ id, i, x, tipe, elemenRef, state, sorotan, instan }: { id: number; i: number; x: Nilai; tipe: string; elemenRef: boolean; state: StateMesin; sorotan: Sorotan; instan: boolean }) {
  const jangkar = useJangkar(`elref:${id}:${i}`)
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        data-sasaran-panah={i === 0 ? '' : undefined}
        data-kotak-nilai
        className={cn(
          'flex h-9 min-w-9 items-center justify-center rounded-md border-[1.5px] px-1.5 font-mono text-[13px] font-semibold transition-[background-color,border-color] duration-300',
          kelasSorotan(sorotan, `el:${id}:${i}`),
        )}
      >
        {elemenRef && typeof x === 'number' ? (
          <span ref={jangkar} role="img" aria-label={`elemen ${i} menunjuk ke ${teksElemen(x, state.heap)}`} className="block size-2 rounded-full bg-tipe-ref" />
        ) : tipe.endsWith('[]') && x !== null ? (
          '●'
        ) : (
          <NilaiBerubah teks={tampilNilai(x, tipe, state.heap)} instan={instan} />
        )}
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">[{i}]</span>
    </div>
  )
}

/**
 * Id objek heap yang dirujuk variabel (langsung maupun lewat array referensi dan field objek mahasiswa).
 * Koleksi java.util dan objek pustaka lain tidak ditelusuri ke dalam (isi dalamnya hanya lewat renderer `koleksi`);
 * objek di `berhenti` (sudah digambar renderer lain) tidak diambil dan tidak ditelusuri.
 */
export function objekTerjangkau(state: StateMesin, stringObjek: boolean, berhenti?: ReadonlySet<number>): number[] {
  const hasil: number[] = []
  const lihat = new Set<number>()
  const kunjungi = (id: number) => {
    if (lihat.has(id) || berhenti?.has(id)) return
    const o = state.heap[id]
    if (!o) return
    if (o.k === 'string' && !stringObjek) return
    lihat.add(id)
    hasil.push(id)
    if (o.k === 'array') {
      if (!adalahPrimitif(o.tipeElemen)) for (const x of o.nilai) if (typeof x === 'number') kunjungi(x)
    } else if (o.k === 'objek' && objekMahasiswa(state.heap, id)) {
      for (const [f, x] of Object.entries(o.field)) if (f !== 'this$0' && typeof x === 'number' && !adalahPrimitif(o.tipeField[f] ?? 'Object')) kunjungi(x)
    }
  }
  for (const f of state.frames) {
    for (const v of f.vars) {
      if (f.method === 'main' && v.param && v.nama === 'args') continue
      if (typeof v.nilai === 'number' && !adalahPrimitif(v.tipe)) kunjungi(v.nilai)
    }
  }
  for (const v of state.statik) if (typeof v.nilai === 'number' && !adalahPrimitif(v.tipe)) kunjungi(v.nilai)
  return hasil
}

/** Panah referensi antarobjek di kolom heap Memori (field objek, elemen array referensi). */
export function panahHeap(state: StateMesin, diMemori: ReadonlySet<number>, digambar: (id: number) => boolean): { dari: string; ke: string; jalur?: 'kanan' }[] {
  const hasil: { dari: string; ke: string; jalur?: 'kanan' }[] = []
  for (const id of diMemori) {
    const o = state.heap[id]
    if (o?.k === 'objek' && objekMahasiswa(state.heap, id)) {
      for (const [f, x] of Object.entries(o.field)) {
        if (f === 'this$0' || typeof x !== 'number' || adalahPrimitif(o.tipeField[f] ?? 'Object') || !digambar(x)) continue
        hasil.push({ dari: `field:${id}:${f}`, ke: `heap:${x}`, jalur: diMemori.has(x) ? 'kanan' : undefined })
      }
    } else if (o?.k === 'array' && !adalahPrimitif(o.tipeElemen) && !o.tipeElemen.endsWith('[]') && o.tipeElemen !== 'String') {
      o.nilai.forEach((x, i) => {
        if (typeof x === 'number' && digambar(x)) hasil.push({ dari: `elref:${id}:${i}`, ke: `heap:${x}` })
      })
    }
  }
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
  /** Alur exception pada langkah ini (lempar/rambat/tangkap/finally). */
  alur?: AlurException | null
}

export function Memori({ state, sorotan, instan, sudahTampil, stringObjek = false, nilaiKembali, alur }: PropsMemori) {
  const heap = objekTerjangkau(state, stringObjek, sudahTampil)
  const frames = state.frames
  const idException = idExceptionAktif(alur ?? null)
  const menangkap = alur?.tangkap ? `catch (${alur.tangkap.tipe} ${alur.tangkap.variabel})` : undefined
  return (
    <div className="flex flex-col gap-3">
      {alur && <StripAlurException alur={alur} heap={state.heap} />}
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
                  menangkap={i === frames.length - 1 ? menangkap : undefined}
                />
              ))}
            </AnimatePresence>
            {/* Frame yang dibuang karena exception: terdalam paling atas. */}
            {[...(alur?.rambat ?? [])].reverse().map((r) => (
              <FrameDibuang key={`dibuang-${r.frame}`} method={r.method} kelas={r.kelas} instan={instan} />
            ))}
          </div>
        </div>
        {heap.length > 0 && (
          // Kotak objek berfield butuh ruang lebih lebar daripada array (yang bisa membungkus ke baris berikutnya).
          <div className={cn('flex flex-col gap-3', heap.some((id) => state.heap[id]?.k === 'objek') ? 'max-w-[62%]' : 'max-w-[45%]')}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Heap</span>
            {heap.map((id) => (
              <ObjekDiHeap key={id} id={id} o={state.heap[id]} state={state} sorotan={sorotan} instan={instan} stringObjek={stringObjek} exceptionAktif={id === idException} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
