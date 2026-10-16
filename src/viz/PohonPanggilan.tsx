import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import type { Trace } from '@/engine'
import { cn } from '@/lib/utils'

export interface KonfigPohonPanggilan {
  jenis: 'pohonPanggilan'
  /** Hanya tampilkan pemanggilan method ini. */
  method?: string
  /** Batas simpul yang digambar (bawaan 63). */
  maks?: number
}

export interface SimpulPanggilan {
  /** Id frame. */
  id: number
  method: string
  argumen: string[]
  induk: number | null
  /** Indeks langkah saat method dipanggil. */
  mulai: number
  /** Indeks langkah saat method mengembalikan nilai. */
  kembali?: number
  nilai?: string
  /** Indeks langkah saat frame dibuang dari call stack. */
  selesai?: number
  urutan: number
}

/** Argumen ringkas untuk label simpul: array cukup `[…]`, String panjang dipotong. */
function argumenRingkas(argumen: string[], tipe: string[]): string[] {
  return argumen.map((a, i) => {
    if (tipe[i]?.endsWith('[]') || a.startsWith('[')) return '[…]'
    return a.length > 12 ? `${a.slice(0, 10)}…${a.endsWith('"') ? '"' : ''}` : a
  })
}

/** Semua pemanggilan method dalam trace (tanpa `main`), urut menurut waktu pemanggilan. */
export function bangunPohonPanggilan(trace: Trace, method?: string): SimpulPanggilan[] {
  const semua = new Map<number, SimpulPanggilan & { indukAsli: number | null }>()
  const tumpukan: number[] = []
  let urutan = 0
  trace.langkah.forEach((l, i) => {
    for (const p of l.peristiwa) {
      if (p.k === 'panggil') {
        const induk = tumpukan.length ? tumpukan[tumpukan.length - 1] : null
        const tipe = p.frame.vars.filter((v) => v.param).map((v) => v.tipe)
        semua.set(p.frame.id, { id: p.frame.id, method: p.method, argumen: argumenRingkas(p.argumen, tipe), induk: null, indukAsli: induk, mulai: i, urutan: urutan++ })
        tumpukan.push(p.frame.id)
      } else if (p.k === 'kembali') {
        const s = semua.get(p.frame)
        if (s) {
          s.kembali = i
          s.nilai = p.nilai
        }
      } else if (p.k === 'buang-frame') {
        const s = semua.get(p.frame)
        if (s) s.selesai = i
        const j = tumpukan.lastIndexOf(p.frame)
        if (j >= 0) tumpukan.splice(j, 1)
      }
    }
  })
  const lolos = (s: { method: string; indukAsli: number | null }) => (method ? s.method === method : s.indukAsli !== null)
  const hasil: SimpulPanggilan[] = []
  for (const s of semua.values()) {
    if (!lolos(s)) continue
    // Induk = leluhur terdekat yang juga ikut ditampilkan.
    let induk = s.indukAsli
    while (induk !== null && !lolos(semua.get(induk)!)) induk = semua.get(induk)!.indukAsli
    const { indukAsli: _abaikan, ...simpul } = s
    hasil.push({ ...simpul, induk })
  }
  return hasil
}

const TINGGI_BARIS = 62
const TINGGI_SIMPUL = 40
const LEBAR_HURUF = 7.3

interface Tata {
  s: SimpulPanggilan
  x: number
  y: number
  lebar: number
  status: 'aktif' | 'tumpukan' | 'selesai'
  berulang: boolean
}

export function PohonPanggilan({ trace, indeks, konfig, instan }: { trace: Trace; indeks: number; konfig: KonfigPohonPanggilan; instan: boolean }) {
  const semua = useMemo(() => bangunPohonPanggilan(trace, konfig.method), [trace, konfig.method])
  const kurangiGerak = useReducedMotion()
  const refGulir = useRef<HTMLDivElement>(null)
  const maks = konfig.maks ?? 63

  const { tata, garis, lebar, tinggi, tersembunyi, idAktif } = useMemo(() => {
    const terlihat = semua.filter((s) => s.mulai <= indeks)
    const diTumpukan = terlihat.filter((s) => s.selesai === undefined || s.selesai > indeks)
    const aktif = diTumpukan.length ? diTumpukan.reduce((a, b) => (b.mulai > a.mulai ? b : a)) : undefined
    const peta = new Map(terlihat.map((s) => [s.id, s]))

    let dipakai = new Set(terlihat.map((s) => s.id))
    if (terlihat.length > maks) {
      dipakai = new Set(diTumpukan.map((s) => s.id))
      for (const s of [...terlihat].reverse()) {
        if (dipakai.size >= maks) break
        dipakai.add(s.id)
      }
      // Leluhur setiap simpul ikut digambar agar pohon tetap tersambung.
      for (const id of [...dipakai]) {
        let induk = peta.get(id)?.induk ?? null
        while (induk !== null && !dipakai.has(induk)) {
          dipakai.add(induk)
          induk = peta.get(induk)?.induk ?? null
        }
      }
    }

    const anak = new Map<number | null, SimpulPanggilan[]>()
    for (const s of terlihat) {
      if (!dipakai.has(s.id)) continue
      const daftar = anak.get(s.induk) ?? []
      daftar.push(s)
      anak.set(s.induk, daftar)
    }
    const label = (s: SimpulPanggilan) => `${s.method}(${s.argumen.join(', ')})`
    const lebarSimpul = (s: SimpulPanggilan) => Math.max(46, Math.max(label(s).length, (s.nilai ?? '').length + 2) * LEBAR_HURUF + 20)
    const lebarSlot = Math.max(46, ...terlihat.filter((s) => dipakai.has(s.id)).map(lebarSimpul)) + 12

    const posisi = new Map<number, { slot: number; dalam: number }>()
    let slot = 0
    let terdalam = 0
    const kunjungi = (s: SimpulPanggilan, dalam: number) => {
      terdalam = Math.max(terdalam, dalam)
      const daftar = anak.get(s.id) ?? []
      if (daftar.length === 0) {
        posisi.set(s.id, { slot: slot++, dalam })
        return
      }
      for (const a of daftar) kunjungi(a, dalam + 1)
      posisi.set(s.id, { slot: (posisi.get(daftar[0].id)!.slot + posisi.get(daftar[daftar.length - 1].id)!.slot) / 2, dalam })
    }
    for (const akar of anak.get(null) ?? []) kunjungi(akar, 0)

    const sudahAda = new Set<string>()
    const tata: Tata[] = []
    for (const s of terlihat) {
      const p = posisi.get(s.id)
      if (!p) continue
      const kunci = label(s)
      const berulang = sudahAda.has(kunci)
      sudahAda.add(kunci)
      const w = lebarSimpul(s)
      tata.push({
        s,
        lebar: w,
        x: p.slot * lebarSlot + (lebarSlot - w) / 2,
        y: p.dalam * TINGGI_BARIS,
        status: s === aktif ? 'aktif' : diTumpukan.includes(s) ? 'tumpukan' : 'selesai',
        berulang,
      })
    }
    const petaTata = new Map(tata.map((t) => [t.s.id, t]))
    const garis = tata.flatMap((t) => {
      const induk = t.s.induk !== null ? petaTata.get(t.s.induk) : undefined
      if (!induk) return []
      return [
        {
          id: t.s.id,
          x1: induk.x + induk.lebar / 2,
          y1: induk.y + TINGGI_SIMPUL,
          x2: t.x + t.lebar / 2,
          y2: t.y,
          jalur: t.status !== 'selesai',
        },
      ]
    })
    return {
      tata,
      garis,
      lebar: Math.max(1, slot) * lebarSlot,
      tinggi: (terdalam + 1) * TINGGI_BARIS - (TINGGI_BARIS - TINGGI_SIMPUL),
      tersembunyi: terlihat.length - tata.length,
      idAktif: aktif?.id,
    }
  }, [semua, indeks, maks])

  useEffect(() => {
    // Gulir horizontal di dalam wadah pohon saja; panggung tidak ikut digeser agar visual lain tetap terlihat.
    const w = refGulir.current
    const t = tata.find((x) => x.status === 'aktif')
    if (!w || !t) return
    const perilaku: ScrollBehavior = instan || kurangiGerak ? 'auto' : 'smooth'
    if (t.x < w.scrollLeft) w.scrollTo({ left: Math.max(0, t.x - 16), behavior: perilaku })
    else if (t.x + t.lebar > w.scrollLeft + w.clientWidth) w.scrollTo({ left: t.x + t.lebar - w.clientWidth + 16, behavior: perilaku })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAktif, instan, kurangiGerak])

  const transisi = instan || kurangiGerak ? { duration: 0 } : { duration: 0.22, ease: [0.77, 0, 0.175, 1] as const }
  const jumlah = tata.length + tersembunyi

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
        <span className="font-semibold">Pohon panggilan{konfig.method ? ` ${konfig.method}` : ''}</span>
        <span className="text-muted-foreground">· {jumlah} panggilan sampai langkah ini</span>
        {tersembunyi > 0 && <span className="text-muted-foreground">· {tersembunyi} panggilan lama tidak digambar</span>}
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-3 w-4 rounded-[4px] border-[1.5px] border-banding bg-banding-lembut" /> aktif
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-3 w-4 rounded-[4px] border-[1.5px] border-dashed border-muted-foreground" /> dihitung ulang
        </span>
      </div>
      {tata.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">
          Belum ada pemanggilan{konfig.method ? ` ${konfig.method}` : ' method'} pada langkah ini.
        </p>
      ) : (
        <div ref={refGulir} className="max-w-full overflow-x-auto pb-1">
        <div role="group" aria-label={`Pohon panggilan dengan ${jumlah} panggilan`} className="relative" style={{ width: lebar, height: tinggi }}>
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width={lebar} height={tinggi} aria-hidden="true">
            {garis.map((g) => (
              <motion.line
                key={g.id}
                initial={false}
                animate={{ x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2 }}
                transition={transisi}
                stroke={g.jalur ? 'var(--banding)' : 'var(--border)'}
                strokeWidth={g.jalur ? 2 : 1.5}
              />
            ))}
          </svg>
          {tata.map((t) => (
            <motion.div
              key={t.s.id}
              initial={{ opacity: 0, transform: `translate(${t.x}px, ${t.y}px) scale(0.96)` }}
              animate={{ opacity: 1, transform: `translate(${t.x}px, ${t.y}px) scale(1)` }}
              transition={transisi}
              aria-label={`${t.s.method}(${t.s.argumen.join(', ')})${t.s.nilai !== undefined && t.s.kembali! <= indeks ? `, mengembalikan ${t.s.nilai}` : ''}${t.status === 'aktif' ? ', sedang berjalan' : ''}`}
              className={cn(
                'absolute top-0 left-0 flex flex-col items-center justify-center rounded-lg border-[1.5px] px-2 font-mono leading-tight transition-[background-color,border-color,box-shadow] duration-200',
                t.status === 'aktif' && 'border-banding bg-banding-lembut ring-2 ring-banding/30',
                t.status === 'tumpukan' && 'border-banding/70 bg-card',
                t.status === 'selesai' && 'border-input bg-card',
                t.berulang && 'border-dashed',
              )}
              style={{ width: t.lebar, height: TINGGI_SIMPUL }}
            >
              <span className={cn('text-[12px] font-semibold whitespace-nowrap', t.status === 'selesai' && 'text-muted-foreground')}>
                {t.s.method}({t.s.argumen.join(', ')})
              </span>
              {t.s.nilai !== undefined && t.s.kembali! <= indeks && (
                <span className="text-[11px] font-semibold whitespace-nowrap text-tulis-teks">↩ {t.s.nilai}</span>
              )}
            </motion.div>
          ))}
        </div>
        </div>
      )}
    </div>
  )
}
