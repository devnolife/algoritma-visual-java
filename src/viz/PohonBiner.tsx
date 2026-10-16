import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import type { StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, NilaiBerubah, type Sorotan } from './bersama'
import { KepalaVisual, KeteranganPenunjuk, lebarMono, PesanJalur, SkalaMuat } from './bagian'
import { bangunPohon, type HasilPohon, type OpsiPohon } from './dataStruktur'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'
import { jenisSorotan } from './sorotan'

export interface KonfigPohon extends OpsiPohon {
  jenis: 'pohon'
  judul?: string
}

/** Simpul siap gambar untuk `GambarPohon` (pohon objek, pohon merah-hitam TreeMap, atau heap array). */
export interface SimpulGambar {
  kunci: string
  /** Id objek heap (untuk ujung panah dari panel memori). */
  idHeap?: number
  teks: string
  teks2?: string
  /** Kolom (urutan inorder) dan kedalaman. */
  x: number
  y: number
  induk?: string
  label: string[]
  warna?: 'merah' | 'hitam'
  /** Ditunjuk penunjuk: diisi warna penunjuk. */
  tunjuk?: boolean
  /** Pada jalur dari akar ke simpul yang ditunjuk. */
  jalur?: boolean
  baru?: boolean
  sorotData?: 'tulis' | 'baca' | null
  /** Sorotan sisi dari induk ke simpul ini. */
  sorotSisi?: 'tulis' | 'baca' | null
  /** Indeks kecil di bawah simpul (heap array). */
  catatan?: string
}

const TINGGI = 34
const TINGGI_DUA = 46
const JARAK_Y = 66
const BARIS_LABEL = 14

function SimpulPohonDiv({ s, px, py, w, h, instan }: { s: SimpulGambar; px: number; py: number; w: number; h: number; instan: boolean }) {
  const jangkar = useJangkar(s.idHeap !== undefined ? `heap:${s.idHeap}` : `pohon:${s.kunci}`)
  return (
    <motion.div
      className="absolute top-0 left-0"
      style={{ width: w, height: h }}
      initial={{ opacity: 0, transform: `translate(${px - w / 2}px, ${py - 8}px)` }}
      animate={{ opacity: 1, transform: `translate(${px - w / 2}px, ${py}px)` }}
      exit={{ opacity: 0 }}
      transition={instan ? { duration: 0 } : { duration: 0.24, ease: EASE_KELUAR }}
    >
      {s.label.length > 0 && (
        <span className="absolute bottom-full left-1/2 mb-0.5 flex -translate-x-1/2 flex-col items-center font-mono text-[11.5px] leading-[14px] font-bold whitespace-nowrap text-banding-teks">
          {s.label.map((l) => (
            <span key={l} className="rounded-sm bg-card/90 px-0.5">
              {l}
            </span>
          ))}
        </span>
      )}
      <div
        ref={jangkar}
        className={cn(
          'relative flex size-full flex-col items-center justify-center border-[1.5px] font-mono leading-tight transition-[background-color,border-color,box-shadow] duration-200',
          w === h ? 'rounded-full' : 'rounded-lg',
          s.warna === 'merah' && 'border-[oklch(0.45_0.17_27)] bg-[oklch(0.55_0.19_27)] text-white',
          s.warna === 'hitam' && 'border-[oklch(0.55_0.015_262)] bg-[oklch(0.24_0.015_262)] text-white',
          !s.warna && (s.tunjuk ? 'border-banding bg-banding-lembut' : s.jalur ? 'border-banding bg-card' : 'border-input bg-card'),
          !s.warna && s.sorotData === 'tulis' && 'bg-tulis-lembut',
          !s.warna && s.sorotData === 'baca' && 'ring-2 ring-baca/40',
          s.tunjuk && 'ring-2 ring-banding/35',
          s.baru && 'border-tulis ring-2 ring-tulis/35',
        )}
      >
        <span data-sasaran-panah="" aria-hidden="true" className="absolute top-0 left-0 h-3 w-px" />
        <span className="text-[14px] font-semibold">
          <NilaiBerubah teks={s.teks} instan={instan} />
        </span>
        {s.teks2 !== undefined && <span className={cn('text-[11px]', s.warna ? 'text-white' : 'text-muted-foreground')}>{s.teks2}</span>}
      </div>
      {s.catatan && <span className="absolute top-full left-1/2 mt-0.5 -translate-x-1/2 font-mono text-[10.5px] text-muted-foreground">{s.catatan}</span>}
    </motion.div>
  )
}

/** Pohon biner tersusun rapi: kolom = urutan inorder, baris = kedalaman. */
export function GambarPohon({ simpul, instan, ringkasan }: { simpul: SimpulGambar[]; instan: boolean; ringkasan: string }) {
  const tata = useMemo(() => {
    const ukuran = new Map(
      simpul.map((s) => {
        const lebarTeks = Math.max(lebarMono(s.teks, 14), s.teks2 ? lebarMono(s.teks2, 11) : 0)
        const h = s.teks2 !== undefined ? TINGGI_DUA : TINGGI
        return [s.kunci, { w: Math.max(h, lebarTeks + 16), h }] as const
      }),
    )
    const kolom = Math.max(44, ...[...ukuran.values()].map((u) => u.w + 10))
    const atas = Math.max(0, ...simpul.filter((s) => s.y === 0).map((s) => s.label.length)) * BARIS_LABEL + 6
    const posisi = new Map(simpul.map((s) => [s.kunci, { px: s.x * kolom + kolom / 2, py: atas + s.y * JARAK_Y }]))
    const lebar = (Math.max(-1, ...simpul.map((s) => s.x)) + 1) * kolom
    const tinggi = atas + Math.max(0, ...simpul.map((s) => s.y)) * JARAK_Y + Math.max(TINGGI, ...simpul.map((s) => ukuran.get(s.kunci)!.h)) + (simpul.some((s) => s.catatan) ? 16 : 4)
    const sisi = simpul.flatMap((s) => {
      const induk = s.induk ? posisi.get(s.induk) : undefined
      const p = posisi.get(s.kunci)!
      if (!induk || !s.induk) return []
      const hInduk = ukuran.get(s.induk)!.h
      return [{ kunci: s.kunci, x1: induk.px, y1: induk.py + hInduk, x2: p.px, y2: p.py, s }]
    })
    return { ukuran, posisi, lebar, tinggi, sisi }
  }, [simpul])

  return (
    <SkalaMuat lebar={Math.max(tata.lebar, 44)} tinggi={tata.tinggi} label={ringkasan}>
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={tata.lebar} height={tata.tinggi} aria-hidden="true">
          <AnimatePresence initial={false}>
            {tata.sisi.map((g) => {
              const warna = g.s.sorotSisi === 'tulis' ? 'var(--tulis)' : g.s.sorotSisi === 'baca' ? 'var(--baca)' : g.s.jalur ? 'var(--banding)' : 'var(--muted-foreground)'
              const tebal = g.s.sorotSisi || g.s.jalur ? 2.5 : 1.5
              return (
                <motion.line
                  key={`${g.kunci}:${g.x1},${g.y1},${g.x2},${g.y2}`}
                  x1={g.x1}
                  y1={g.y1}
                  x2={g.x2}
                  y2={g.y2}
                  stroke={warna}
                  strokeOpacity={g.s.sorotSisi || g.s.jalur ? 1 : 0.55}
                  strokeWidth={tebal}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={instan ? { duration: 0 } : { duration: 0.18, delay: 0.1 }}
                />
              )
            })}
          </AnimatePresence>
        </svg>
        <AnimatePresence initial={false}>
          {simpul.map((s) => {
            const p = tata.posisi.get(s.kunci)!
            const u = tata.ukuran.get(s.kunci)!
            return <SimpulPohonDiv key={s.kunci} s={s} px={p.px} py={p.py} w={u.w} h={u.h} instan={instan} />
          })}
        </AnimatePresence>
    </SkalaMuat>
  )
}

/** Simpul gambar dari hasil `susunPohon`, beserta sorotan langkah ini. */
export function simpulDariPohon(h: Extract<HasilPohon, { ok: true }>, sorotan: Sorotan): SimpulGambar[] {
  return h.simpul.map((s) => ({
    kunci: String(s.id),
    idHeap: s.id,
    teks: s.teks,
    teks2: s.teks2,
    x: s.x,
    y: s.y,
    induk: s.induk !== null ? String(s.induk) : undefined,
    label: s.label,
    warna: s.merah === undefined ? undefined : s.merah ? 'merah' : 'hitam',
    tunjuk: s.ditunjuk,
    jalur: s.diJalur,
    baru: sorotan.baru.has(`obj:${s.id}`),
    sorotData: h.fieldData ? jenisSorotan(sorotan, [`field:${s.id}:${h.fieldData}`]) : null,
    sorotSisi: s.induk !== null && s.sisi ? jenisSorotan(sorotan, [`field:${s.induk}:${s.sisi === 'kiri' ? h.fieldKiri : h.fieldKanan}`]) : null,
  }))
}

function ringkasanPohon(h: Extract<HasilPohon, { ok: true }>, akar: string): string {
  if (h.simpul.length === 0) return `Pohon ${akar} kosong (null).`
  const urut = h.simpul
    .filter((s) => s.kelompok === 0)
    .sort((a, b) => a.x - b.x)
    .map((s) => s.teks)
  const tunjuk = h.simpul.flatMap((s) => s.label.filter((l) => l !== akar || s.induk !== null).map((l) => `${l} di simpul ${s.teks}`))
  return `Pohon ${akar}: ${h.jumlahUtama} simpul, tinggi ${h.tinggi}. Urutan inorder: ${urut.join(', ')}.${tunjuk.length ? ` ${tunjuk.join(', ')}.` : ''}${h.siklus ? ' Ada siklus.' : ''}`
}

export function PohonView({
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
  konfig: KonfigPohon
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const h = useMemo(() => bangunPohon(state, konfig), [state, konfig])
  const simpul = useMemo(() => (h.ok ? simpulDariPohon(h, sorotan) : []), [h, sorotan])
  if (!h.ok) return <PesanJalur state={state} jalur={konfig.akar} masalah={h.masalah} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  return (
    <div className="flex w-full max-w-full flex-col gap-2">
      <KepalaVisual>
        {h.kelas && <BadgeTipe tipe={h.kelas} />}
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.akar}</span>
        <span className="text-muted-foreground">· {h.jumlahUtama === 0 ? 'kosong (null)' : `${h.jumlahUtama} simpul, tinggi ${h.tinggi}`}</span>
        {h.jalur.length > 1 && (
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span aria-hidden="true" className="inline-block h-[3px] w-4 rounded-full bg-banding" /> jalur dari akar
          </span>
        )}
        {h.siklus && <span className="rounded-full bg-galat-lembut px-2 py-px text-[12px] font-semibold text-galat">ada siklus</span>}
        {h.terpotong && <span className="text-[12px] text-muted-foreground">· sebagian simpul tidak digambar</span>}
        <KeteranganPenunjuk nol={h.penunjukNull} />
      </KepalaVisual>
      {h.simpul.length === 0 ? (
        <span className="w-fit rounded-md border border-dashed border-muted-foreground/50 px-2 py-0.5 font-mono text-[12.5px] text-muted-foreground">
          {konfig.akar} = null
        </span>
      ) : (
        <GambarPohon simpul={simpul} instan={instan} ringkasan={ringkasanPohon(h, konfig.akar)} />
      )}
    </div>
  )
}
