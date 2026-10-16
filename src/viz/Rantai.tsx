import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import type { StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, NilaiBerubah, type Sorotan } from './bersama'
import { DefsPanah, KepalaVisual, KeteranganPenunjuk, lebarMono, PesanJalur, SkalaMuat, useMarkerPanah, warnaPanah, type WarnaPanah } from './bagian'
import { bangunRantai, type BarisRantai, type HasilRantai, type OpsiRantai, type SimpulRantai } from './dataStruktur'
import { BadgeTipe } from './Memori'
import { jalurSiku, useJangkar } from './panah'
import { jenisSorotan } from './sorotan'

export interface KonfigRantai extends OpsiRantai {
  jenis: 'rantai'
  judul?: string
}

type RantaiOk = Extract<HasilRantai, { ok: true }>

const T = 40
const P = 18
const CELAH = 36
const BARIS_LABEL = 14
const NULL_W = 38

interface TataSimpul {
  s: SimpulRantai
  x: number
  y: number
  w: number
  /** Simpul terakhir di barisnya (null/… digambar di sebelah kanannya). */
  ujung?: BarisRantai
}

interface TataBaris {
  b: BarisRantai
  y: number
  lebarAsal: number
}

interface Lengkung {
  kunci: string
  d: string
  /** Simpul asal dan field-nya (untuk sorotan tulis/baca). */
  dari: number
  jenis: 'berikut' | 'sebelum'
  melingkar: boolean
}

function tataRantai(h: RantaiOk, dua: boolean) {
  const simpul = new Map<number, TataSimpul>()
  const baris: TataBaris[] = []
  let y = 0
  let lebar = 0
  for (const b of h.baris) {
    const maksLabel = Math.max(0, ...b.simpul.map((id) => h.simpul[id].label.length))
    const atas = y + (maksLabel ? maksLabel * BARIS_LABEL + 12 : 0)
    const lebarAsal = Math.max(34, lebarMono(b.asal, 12.5) + 22)
    let x = lebarAsal + CELAH
    for (const id of b.simpul) {
      const s = h.simpul[id]
      const w = Math.max(38, lebarMono(s.teks) + 18) + P + (dua ? P : 0)
      simpul.set(id, { s, x, y: atas, w })
      x += w + CELAH
    }
    const akhir = b.simpul.length ? simpul.get(b.simpul[b.simpul.length - 1]) : undefined
    if (akhir) akhir.ujung = b
    lebar = Math.max(lebar, x + NULL_W)
    baris.push({ b, y: atas, lebarAsal })
    // Ruang di bawah baris untuk panah lengkung (melingkar/gabung/prev yang tidak bersebelahan).
    const adaLengkung = b.ujung === 'melingkar' || b.simpul.some((id) => h.simpul[id].sebelum?.k === 'simpul' && !(h.simpul[id].sebelum as { sebelah: boolean }).sebelah)
    y = atas + T + (adaLengkung ? 34 : 20)
  }

  const lengkung: Lengkung[] = []
  const tengah = (t: TataSimpul) => t.y + T / 2 - (dua ? 6 : 0)
  for (const t of simpul.values()) {
    const b = t.s.berikut
    if (b.k === 'simpul' && !b.sebelah) {
      const tuju = simpul.get(b.id)
      if (tuju) {
        const xDot = t.x + t.w - P / 2
        const xKanan = t.x + t.w + 12
        const cx = tuju.x + tuju.w / 2 + (dua ? 6 : 0)
        const lajur = tuju.y === t.y ? t.y + T + 14 : tuju.y + T + 12
        lengkung.push({
          kunci: `b${t.s.id}-${b.id}`,
          d: jalurSiku([
            [xDot, tengah(t)],
            [xKanan, tengah(t)],
            [xKanan, lajur],
            [cx, lajur],
            [cx, tuju.y + T + 2],
          ]),
          dari: t.s.id,
          jenis: 'berikut',
          melingkar: tuju.y === t.y,
        })
      }
    }
    const p = t.s.sebelum
    if (p?.k === 'simpul' && !p.sebelah) {
      const tuju = simpul.get(p.id)
      if (tuju) {
        const xDot = t.x + P / 2
        const xKiri = t.x - 10
        const cx = tuju.x + tuju.w / 2 - 6
        const lajur = t.y + T + 24
        lengkung.push({
          kunci: `p${t.s.id}-${p.id}`,
          d: jalurSiku([
            [xDot, t.y + T / 2 + 6],
            [xKiri, t.y + T / 2 + 6],
            [xKiri, lajur],
            [cx, lajur],
            [cx, tuju.y + T + 2],
          ]),
          dari: t.s.id,
          jenis: 'sebelum',
          melingkar: false,
        })
      }
    }
  }
  return { simpul, baris, lengkung, lebar, tinggi: Math.max(T, y - 8) }
}

/** Ringkasan isi rantai untuk pembaca layar. */
function ringkasanRantai(h: RantaiOk): string {
  const bagian = h.baris.map((b) => {
    const isi = b.simpul.map((id) => h.simpul[id].teks)
    const ujung = b.ujung === 'null' ? 'null' : b.ujung === 'melingkar' ? `kembali ke ${h.simpul[b.ke!]?.teks} (melingkar)` : b.ujung === 'gabung' ? `bergabung ke ${h.simpul[b.ke!]?.teks}` : '…'
    return `${b.asal}: ${[...isi, ujung].join(' → ')}`
  })
  const label = Object.values(h.simpul).flatMap((s) => s.label.map((l) => `${l} menunjuk ${s.teks}`))
  return `Rantai ${bagian.join('; ')}${label.length ? `. ${label.join(', ')}` : ''}.`
}

function KotakSimpul({ t, dua, h, sorotan, instan, marker }: { t: TataSimpul; dua: boolean; h: RantaiOk; sorotan: Sorotan; instan: boolean; marker: (w: WarnaPanah) => string }) {
  const jangkar = useJangkar(`heap:${t.s.id}`)
  const id = t.s.id
  const baru = sorotan.baru.has(`obj:${id}`)
  const sData = h.fieldData ? jenisSorotan(sorotan, [`field:${id}:${h.fieldData}`]) : null
  const sBerikut = jenisSorotan(sorotan, [`field:${id}:${h.fieldBerikut}`])
  const sSebelum = h.fieldSebelum ? jenisSorotan(sorotan, [`field:${id}:${h.fieldSebelum}`]) : null
  const warnaB: WarnaPanah = sBerikut ?? 'biasa'
  const warnaP: WarnaPanah = sSebelum ?? 'biasa'
  const yN = T / 2 - (dua ? 6 : 0)
  const yP = T / 2 + 6
  const b = t.s.berikut
  const keNull = b.k === 'null' || b.k === 'lain' || (b.k === 'simpul' && !b.sebelah) || t.ujung?.ujung === 'terpotong'
  const titik = (null_: boolean, warna: WarnaPanah) =>
    null_ ? (
      <span className="text-[13px] leading-none text-muted-foreground" title="null">
        ∅
      </span>
    ) : (
      <span className="block size-2 rounded-full" style={{ background: warnaPanah(warna === 'biasa' ? 'biasa' : warna) }} />
    )
  return (
    <motion.div
      className="absolute top-0 left-0"
      style={{ width: t.w, height: T }}
      initial={{ opacity: 0, transform: `translate(${t.x}px, ${t.y + 8}px)` }}
      animate={{ opacity: 1, transform: `translate(${t.x}px, ${t.y}px)` }}
      exit={{ opacity: 0 }}
      transition={instan ? { duration: 0 } : { duration: 0.24, ease: EASE_KELUAR }}
    >
      {t.s.label.length > 0 && (
        <span className="absolute bottom-full left-1/2 mb-0.5 flex -translate-x-1/2 flex-col items-center font-mono text-[11.5px] leading-[14px] font-bold whitespace-nowrap text-banding-teks">
          {t.s.label.map((l) => (
            <span key={l}>{l}</span>
          ))}
          <span aria-hidden="true" className="text-[9px] leading-[10px]">
            ▼
          </span>
        </span>
      )}
      <div
        ref={jangkar}
        className={cn(
          'relative flex h-full overflow-hidden rounded-lg border-[1.5px] bg-card font-mono transition-[border-color,box-shadow] duration-200',
          t.s.label.length ? 'border-banding' : 'border-input',
          baru && 'border-tulis ring-2 ring-tulis/30',
        )}
      >
        <span data-sasaran-panah="" aria-hidden="true" className="absolute top-0 left-0 h-3 w-px" />
        {dua && (
          <span className={cn('flex shrink-0 items-center justify-center border-r border-input', sSebelum === 'tulis' && 'bg-tulis-lembut')} style={{ width: P }}>
            {titik(t.s.sebelum?.k === 'null', warnaP)}
          </span>
        )}
        <span
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center px-1 text-[15px] font-semibold transition-colors duration-200',
            sData === 'tulis' && 'bg-tulis-lembut',
            sData === 'baca' && (sorotan.banding ? 'bg-banding-lembut' : 'bg-baca/15'),
          )}
        >
          <NilaiBerubah teks={t.s.teks} instan={instan} />
        </span>
        <span className={cn('flex shrink-0 items-center justify-center border-l border-input', sBerikut === 'tulis' && 'bg-tulis-lembut')} style={{ width: P }}>
          {/* next = null tetap bertitik: panahnya menuju tanda null di ujung baris. */}
          {titik(b.k === 'null' && !t.ujung, warnaB)}
        </span>
      </div>
      <svg className="pointer-events-none absolute top-0 left-0 overflow-visible" width={t.w + CELAH + NULL_W} height={T} aria-hidden="true">
        <DefsPanah marker={marker} />
        {b.k === 'simpul' && b.sebelah && (
          <line x1={t.w - P / 2} y1={yN} x2={t.w + CELAH - 1} y2={yN} stroke={warnaPanah(warnaB)} strokeWidth={warnaB === 'biasa' ? 1.6 : 2.4} markerEnd={`url(#${marker(warnaB)})`} />
        )}
        {keNull && t.ujung && (t.ujung.ujung === 'null' || t.ujung.ujung === 'lain' || t.ujung.ujung === 'terpotong') && (
          <line x1={t.w - P / 2} y1={yN} x2={t.w + CELAH - 1} y2={yN} stroke={warnaPanah(warnaB)} strokeWidth={warnaB === 'biasa' ? 1.6 : 2.4} markerEnd={`url(#${marker(warnaB)})`} />
        )}
        {dua && t.s.sebelum?.k === 'simpul' && t.s.sebelum.sebelah && (
          <line x1={P / 2} y1={yP} x2={-CELAH + 1} y2={yP} stroke={warnaPanah(warnaP)} strokeWidth={warnaP === 'biasa' ? 1.6 : 2.4} markerEnd={`url(#${marker(warnaP)})`} />
        )}
      </svg>
      {t.ujung && t.ujung.ujung !== 'melingkar' && t.ujung.ujung !== 'gabung' && (
        <span
          className="absolute flex h-6 items-center justify-center rounded-md border border-dashed border-muted-foreground/50 px-1.5 font-mono text-[12px] text-muted-foreground"
          style={{ left: t.w + CELAH, top: yN - 12, minWidth: NULL_W - 4 }}
        >
          {t.ujung.ujung === 'null' ? 'null' : t.ujung.ujung === 'terpotong' ? '…' : b.k === 'lain' ? b.teks : '?'}
        </span>
      )}
    </motion.div>
  )
}

function AsalBaris({ tb, dua, instan, marker, kosong }: { tb: TataBaris; dua: boolean; instan: boolean; marker: (w: WarnaPanah) => string; kosong: boolean }) {
  const yN = T / 2 - (dua && !kosong ? 6 : 0)
  return (
    <motion.div
      className="absolute top-0 left-0"
      style={{ height: T }}
      initial={false}
      animate={{ transform: `translate(0px, ${tb.y}px)` }}
      transition={instan ? { duration: 0 } : { duration: 0.24, ease: EASE_KELUAR }}
    >
      <span
        className="absolute flex h-7 items-center gap-1.5 rounded-md border-[1.5px] border-tipe-ref/45 bg-card px-2 font-mono text-[12.5px] font-semibold whitespace-nowrap"
        style={{ top: yN - 14, width: tb.lebarAsal }}
      >
        {tb.b.asal}
        <span aria-hidden="true" className="ml-auto block size-2 shrink-0 rounded-full bg-tipe-ref" />
      </span>
      <svg className="pointer-events-none absolute top-0 left-0 overflow-visible" width={tb.lebarAsal + CELAH} height={T} aria-hidden="true">
        <DefsPanah marker={marker} />
        <line x1={tb.lebarAsal - 6} y1={yN} x2={tb.lebarAsal + CELAH - 1} y2={yN} stroke={warnaPanah('biasa')} strokeWidth={1.6} markerEnd={`url(#${marker('biasa')})`} />
      </svg>
      {kosong && (
        <span
          className="absolute flex h-6 items-center justify-center rounded-md border border-dashed border-muted-foreground/50 px-1.5 font-mono text-[12px] text-muted-foreground"
          style={{ left: tb.lebarAsal + CELAH, top: yN - 12, minWidth: NULL_W - 4 }}
        >
          null
        </span>
      )}
    </motion.div>
  )
}

/** Gambar rantai dari hasil `susunRantai` (dipakai renderer `rantai` dan "isi dalam" LinkedList). */
export function GambarRantai({ h, sorotan, instan, ringkasan }: { h: RantaiOk; sorotan: Sorotan; instan: boolean; ringkasan?: string }) {
  const dua = h.fieldSebelum !== undefined
  const tata = useMemo(() => tataRantai(h, dua), [h, dua])
  const marker = useMarkerPanah()
  return (
    <SkalaMuat lebar={tata.lebar} tinggi={tata.tinggi} label={ringkasan ?? ringkasanRantai(h)}>
        {tata.baris.map((tb) => (
          <AsalBaris key={`a${tb.b.asal}`} tb={tb} dua={dua} instan={instan} marker={marker} kosong={tb.b.simpul.length === 0} />
        ))}
        <AnimatePresence initial={false}>
          {[...tata.simpul.values()].map((t) => (
            <KotakSimpul key={t.s.id} t={t} dua={dua} h={h} sorotan={sorotan} instan={instan} marker={marker} />
          ))}
        </AnimatePresence>
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={tata.lebar} height={tata.tinggi} aria-hidden="true">
          <DefsPanah marker={marker} />
          <AnimatePresence initial={false}>
            {tata.lengkung.map((l) => {
              const field = l.jenis === 'berikut' ? h.fieldBerikut : h.fieldSebelum
              const sorot = field ? jenisSorotan(sorotan, [`field:${l.dari}:${field}`]) : null
              // next yang kembali ke baris yang sama (melingkar) disorot; prev yang tidak bersebelahan digambar putus-putus.
              const warna: WarnaPanah = sorot ?? (l.melingkar ? 'jalur' : l.jenis === 'sebelum' ? 'redup' : 'biasa')
              return (
                <motion.path
                  key={`${l.kunci}:${l.d}`}
                  d={l.d}
                  fill="none"
                  stroke={warnaPanah(warna)}
                  strokeWidth={warna === 'biasa' || warna === 'redup' ? 1.6 : 2.2}
                  strokeDasharray={l.jenis === 'sebelum' ? '4 3' : undefined}
                  markerEnd={`url(#${marker(warna)})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={instan ? { duration: 0 } : { duration: 0.2, delay: 0.12 }}
                />
              )
            })}
          </AnimatePresence>
        </svg>
    </SkalaMuat>
  )
}

export function RantaiView({
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
  konfig: KonfigRantai
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const h = useMemo(() => bangunRantai(state, konfig), [state, konfig])
  if (!h.ok) return <PesanJalur state={state} jalur={konfig.kepala} masalah={h.masalah} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  return (
    <div className="flex w-full max-w-full flex-col gap-2">
      <KepalaVisual>
        {h.kelas && <BadgeTipe tipe={h.kelas} />}
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.kepala}</span>
        <span className="text-muted-foreground">
          · {h.jumlah === 0 ? 'kosong (null)' : `${h.jumlah} simpul`}
          {h.fieldSebelum ? ', dua arah' : ''}
        </span>
        {h.melingkar && (
          <span className="rounded-full bg-banding-lembut px-2 py-px text-[12px] font-semibold text-banding-teks">
            <span aria-hidden="true">⟲ </span>melingkar
          </span>
        )}
        <KeteranganPenunjuk nol={h.penunjukNull} />
      </KepalaVisual>
      <GambarRantai h={h} sorotan={sorotan} instan={instan} />
    </div>
  )
}
