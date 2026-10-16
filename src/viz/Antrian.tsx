import { ArrowLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import type { StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, NilaiBerubah, type Sorotan } from './bersama'
import { KepalaVisual, PesanJalur } from './bagian'
import { bangunAntrian, type OpsiAntrian, type SelLarikAntrian, type SelUrut } from './dataStruktur'
import { ikutiJalur } from './jalur'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'
import { kelasSorotan, kelasSorotanBanyak } from './sorotan'

export interface KonfigAntrian extends OpsiAntrian {
  jenis: 'antrian'
  judul?: string
}

/** Antrean horizontal depan → belakang (dipakai juga oleh tampilan koleksi Queue/Deque). */
export function BarisAntrian({
  urutan,
  sorotan,
  instan,
  ringkasan,
  labelDepan = 'depan',
  labelBelakang = 'belakang',
}: {
  urutan: SelUrut[]
  sorotan: Sorotan
  instan: boolean
  ringkasan: string
  labelDepan?: string
  labelBelakang?: string
}) {
  return (
    <div role="img" aria-label={ringkasan} className="flex max-w-full items-start gap-2 overflow-x-auto pb-1">
      <span className="flex h-11 shrink-0 items-center gap-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
        keluar <ArrowLeft className="size-3.5" aria-hidden="true" />
      </span>
      <div className="flex items-start gap-1.5">
        {urutan.length === 0 && (
          <div className="flex h-11 w-24 items-center justify-center rounded-lg border-[1.5px] border-dashed border-muted-foreground/40 text-[12.5px] text-muted-foreground">kosong</div>
        )}
        <AnimatePresence initial={false} mode="popLayout">
          {urutan.map((s, k) => (
            <motion.div
              key={s.kunciReact}
              layout="position"
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={instan ? { duration: 0 } : { duration: 0.22, ease: EASE_KELUAR }}
            >
              <div
                className={cn(
                  'flex h-11 min-w-12 items-center justify-center rounded-lg border-[1.5px] px-2 font-mono text-[15px] font-semibold whitespace-nowrap transition-[background-color,border-color] duration-200',
                  kelasSorotanBanyak(sorotan, s.kunci),
                )}
              >
                <NilaiBerubah teks={s.teks} instan={instan} />
              </div>
              <span className="flex h-4 flex-col items-center font-mono text-[11px] leading-4 font-bold whitespace-nowrap text-banding-teks">
                {k === 0 ? labelDepan : k === urutan.length - 1 ? labelBelakang : ''}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <span className="flex h-11 shrink-0 items-center gap-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> masuk
      </span>
    </div>
  )
}

/** Slot array fisik antrean: urutan ke berapa dalam antrean, indeks, dan penunjuk depan/belakang. */
export function LarikAntrian({
  larik,
  sorotan,
  instan,
  penunjuk,
  label,
}: {
  larik: SelLarikAntrian[]
  sorotan: Sorotan
  instan: boolean
  /** Penunjuk di bawah sel, mis. `[{nama: 'depan', indeks: 3}]`. */
  penunjuk: { nama: string; indeks: number | undefined }[]
  label: string
}) {
  return (
    <div role="list" aria-label={label} className="flex max-w-full gap-1.5 overflow-x-auto pt-2 pb-1">
      {larik.map((s) => {
        const di = penunjuk.filter((p) => p.indeks === s.indeks)
        return (
          <div key={s.indeks} role="listitem" aria-label={`indeks ${s.indeks}: ${s.teks}${s.ke !== undefined ? `, urutan ke-${s.ke + 1} dalam antrean` : ', bukan bagian antrean'}`} className="flex w-12 shrink-0 flex-col items-center gap-1">
            <div
              className={cn(
                'relative flex h-11 w-12 items-center justify-center rounded-lg border-[1.5px] font-mono text-[14px] font-semibold transition-[background-color,border-color,opacity] duration-200',
                s.ke !== undefined ? kelasSorotan(sorotan, s.kunci) : 'border-dashed border-muted-foreground/35 font-normal text-muted-foreground/75',
              )}
            >
              <NilaiBerubah teks={s.teks} instan={instan} />
              {s.ke !== undefined && (
                <span aria-hidden="true" className="absolute -top-2 -right-1.5 min-w-4 rounded-full bg-banding px-1 text-center font-sans text-[10px] leading-4 font-bold text-[oklch(0.22_0.03_60)]">
                  {s.ke + 1}
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">[{s.indeks}]</span>
            <div className="flex min-h-5 flex-col items-center font-mono text-[11.5px] leading-tight font-bold whitespace-nowrap text-banding-teks">
              {di.length > 0 && <span aria-hidden="true">▲</span>}
              {di.map((p) => (
                <span key={p.nama}>{p.nama}</span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AntrianView({
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
  konfig: KonfigAntrian
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const h = useMemo(() => bangunAntrian(state, konfig), [state, konfig])
  const jangkar = useJangkar(h.ok ? `heap:${h.idObjek}` : `heap:kosong:${konfig.variabel}`)
  if (!h.ok) return <PesanJalur state={state} jalur={konfig.variabel} masalah={h.masalah} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  const tipe = ikutiJalur(state, konfig.variabel).tipe
  const ringkasan = `Antrean ${konfig.variabel}: ${h.jumlah === 0 ? 'kosong' : `${h.jumlah} elemen dari depan ke belakang: ${h.urutan.map((s) => s.teks).join(', ')}`}.`
  return (
    <div ref={jangkar} className="inline-flex max-w-full flex-col gap-2">
      <KepalaVisual>
        <BadgeTipe tipe={tipe} />
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.variabel}</span>
        <span className="text-muted-foreground">
          · {h.jumlah} elemen{h.larik ? ` dari kapasitas ${h.larik.length}` : ''}
        </span>
        {h.melingkar && (
          <span className="rounded-full bg-banding-lembut px-2 py-px text-[12px] font-semibold text-banding-teks">
            <span aria-hidden="true">↻ </span>melingkar
          </span>
        )}
      </KepalaVisual>
      <BarisAntrian urutan={h.urutan} sorotan={sorotan} instan={instan} ringkasan={ringkasan} />
      {h.larik && (
        <>
          <span className="mt-1 text-[12px] text-muted-foreground">
            Isi array <code className="kode-sebaris">{konfig.variabel}</code>: angka bulat kecil = urutan dalam antrean{h.melingkar ? '; setelah indeks terakhir, antrean berlanjut ke indeks 0' : ''}.
          </span>
          <LarikAntrian
            larik={h.larik}
            sorotan={sorotan}
            instan={instan}
            label={`Array ${konfig.variabel}`}
            penunjuk={[
              ...(konfig.depan ? [{ nama: konfig.depan, indeks: h.depan }] : []),
              ...(konfig.belakang ? [{ nama: konfig.belakang, indeks: h.belakang }] : []),
            ]}
          />
        </>
      )}
      {h.catatan && <p className="max-w-md text-[12px] text-muted-foreground">{h.catatan}</p>}
    </div>
  )
}
