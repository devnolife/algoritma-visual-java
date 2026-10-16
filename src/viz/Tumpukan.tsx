import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import type { StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, NilaiBerubah, type Sorotan } from './bersama'
import { KepalaVisual, PesanJalur } from './bagian'
import { bangunTumpukan, type OpsiTumpukan, type SelUrut } from './dataStruktur'
import { ikutiJalur } from './jalur'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'
import { kelasSorotanBanyak } from './sorotan'

export interface KonfigTumpukan extends OpsiTumpukan {
  jenis: 'tumpukan'
  judul?: string
}

/**
 * Tumpukan vertikal, puncak di atas. `sel` urut dari dasar; bila `aktif` diberikan (tumpukan array),
 * hanya `aktif` sel terbawah yang termasuk tumpukan dan sisanya digambar sebagai slot kosong/sisa.
 */
export function TumpukanSel({
  sel,
  aktif,
  sorotan,
  instan,
  namaPuncak,
  ringkasan,
  denganIndeks = false,
}: {
  sel: SelUrut[]
  aktif?: number
  sorotan: Sorotan
  instan: boolean
  namaPuncak?: string
  ringkasan: string
  denganIndeks?: boolean
}) {
  const jumlah = aktif ?? sel.length
  const dariAtas = [...sel.keys()].reverse()
  return (
    <div role="img" aria-label={ringkasan} className="flex w-fit flex-col items-stretch">
      {jumlah === 0 && aktif === undefined && (
        <div className="flex h-10 w-32 items-center justify-center rounded-lg border-[1.5px] border-dashed border-muted-foreground/40 text-[12.5px] text-muted-foreground">kosong</div>
      )}
      <AnimatePresence initial={false} mode="popLayout">
        {dariAtas.map((i, urut) => {
          const s = sel[i]
          const isi = i < jumlah
          const puncak = i === jumlah - 1
          return (
            <motion.div
              key={s.kunciReact}
              layout="position"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={instan ? { duration: 0 } : { duration: 0.22, ease: EASE_KELUAR }}
            >
              <span className={cn('w-16 text-right font-mono text-[11.5px] font-bold whitespace-nowrap text-banding-teks', !puncak && 'invisible')}>
                {namaPuncak ?? 'puncak'} <span aria-hidden="true">▶</span>
              </span>
              <div
                className={cn(
                  'flex h-10 w-32 items-center justify-center border-x-[1.5px] border-t-[1.5px] font-mono text-[15px] font-semibold transition-[background-color,border-color,opacity] duration-200',
                  isi ? kelasSorotanBanyak(sorotan, s.kunci) : 'border-dashed border-muted-foreground/35 bg-transparent text-muted-foreground/70',
                  urut === 0 && 'rounded-t-lg',
                  i === 0 && 'rounded-b-lg border-b-[1.5px]',
                  !isi && 'text-[13px] font-normal',
                )}
              >
                <NilaiBerubah teks={s.teks} instan={instan} />
              </div>
              {denganIndeks && s.indeks !== undefined && <span className="w-8 font-mono text-[11px] text-muted-foreground">[{s.indeks}]</span>}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {(jumlah > 0 || aktif !== undefined) && (
        <span className="mt-1 ml-[4.5rem] w-32 text-center text-[11px] tracking-[0.06em] text-muted-foreground uppercase">dasar</span>
      )}
    </div>
  )
}

export function TumpukanView({
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
  konfig: KonfigTumpukan
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const h = useMemo(() => bangunTumpukan(state, konfig), [state, konfig])
  const jangkar = useJangkar(h.ok ? `heap:${h.idObjek}` : `heap:kosong:${konfig.variabel}`)
  if (!h.ok) return <PesanJalur state={state} jalur={konfig.variabel} masalah={h.masalah} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  const tipe = ikutiJalur(state, konfig.variabel).tipe
  const array = h.sumber === 'array'
  const isi = array ? h.sel.slice(0, h.jumlah) : h.sel
  const ringkasan = `Tumpukan ${konfig.variabel}: ${h.jumlah === 0 ? 'kosong' : `${h.jumlah} elemen, dari puncak: ${[...isi].reverse().map((s) => s.teks).join(', ')}`}.`
  return (
    <div ref={jangkar} className="inline-flex max-w-full flex-col gap-2">
      <KepalaVisual>
        <BadgeTipe tipe={tipe} />
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.variabel}</span>
        <span className="text-muted-foreground">
          · {h.jumlah} elemen{array ? ` dari kapasitas ${h.kapasitas}` : ''}
        </span>
        {array && konfig.puncak && (
          <span className="font-mono text-[12px] text-banding-teks">
            · {konfig.puncak} = {h.puncak}
            {h.puncak === -1 ? ' (kosong)' : ''}
          </span>
        )}
      </KepalaVisual>
      {h.catatan && <p className="text-[12px] text-muted-foreground">{h.catatan}</p>}
      <TumpukanSel
        sel={h.sel}
        aktif={array ? h.jumlah : undefined}
        sorotan={sorotan}
        instan={instan}
        namaPuncak={array ? konfig.puncak : undefined}
        ringkasan={ringkasan}
        denganIndeks={array}
      />
    </div>
  )
}
