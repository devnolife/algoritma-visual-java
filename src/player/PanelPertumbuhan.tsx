import { Expand, LoaderCircle } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  fungsiKelas, kalimatKesimpulan, klasifikasi, labelKelas, namaUkuran, ringkasanSeri, type HasilPertumbuhan, type KelasKompleksitas,
  type KonfigPertumbuhan, type SeriPertumbuhan, type TitikPertumbuhan,
} from '@/engine/pertumbuhan'
import { cn } from '@/lib/utils'
import { usePemutar } from './store'
import { TeksSebaris } from './TeksSebaris'

const WARNA_SERI = ['var(--baca)', 'var(--banding)', 'var(--tulis)']
const ringkas = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })
const penuh = new Intl.NumberFormat('id-ID')

const PESAN_STATUS: Record<Exclude<TitikPertumbuhan['status'], 'ok'>, string> = {
  batas: 'menabrak batas langkah',
  exception: 'berhenti karena exception',
  waktu: 'tidak sempat diukur',
  galat: 'dihentikan simulator',
}

function useUkuran<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [ukuran, setUkuran] = useState({ lebar: 0, tinggi: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setUkuran({ lebar: Math.floor(e.contentRect.width), tinggi: Math.floor(e.contentRect.height) }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, ukuran] as const
}

/** Batas atas sumbu y yang "rapi" (1, 2, 2.5, 5 × 10^k). */
function rapikanAtas(x: number): number {
  if (x <= 1) return 1
  const p = 10 ** Math.floor(Math.log10(x))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= x) return m * p
  return 10 * p
}

const titikValid = (s: SeriPertumbuhan) => s.titik.filter((t): t is TitikPertumbuhan & { nilai: number } => t.nilai !== null)

interface Kurva {
  kelas: KelasKompleksitas
  warna: string
  /** Faktor pengali agar kurva melewati titik terukur terakhir. */
  c: number
}

export function GrafikPertumbuhan({ hasil, konfig, besar = false }: { hasil: HasilPertumbuhan; konfig: KonfigPertumbuhan; besar?: boolean }) {
  const [ref, { lebar, tinggi }] = useUkuran<HTMLDivElement>()
  const ukuran = [...new Set(konfig.nilai)].sort((a, b) => a - b)
  const nMin = ukuran[0]
  const nMaks = ukuran[ukuran.length - 1]
  const semua = hasil.seri.flatMap(titikValid)
  const yMaks = rapikanAtas(Math.max(1, ...semua.map((t) => t.nilai)) * 1.08)

  const kurva: Kurva[] = []
  hasil.seri.forEach((s, i) => {
    const v = titikValid(s)
    const akhir = v[v.length - 1]
    if (!s.kelas || !akhir) return
    kurva.push({ kelas: s.kelas, warna: WARNA_SERI[i], c: akhir.nilai / fungsiKelas(s.kelas, akhir.n) })
  })
  const acuanPertama = titikValid(hasil.seri[0] ?? { nama: '', titik: [] }).at(-1)
  for (const kelas of konfig.acuan ?? []) {
    if (!acuanPertama || kurva.some((k) => k.kelas === kelas)) continue
    kurva.push({ kelas, warna: 'var(--muted-foreground)', c: acuanPertama.nilai / fungsiKelas(kelas, acuanPertama.n) })
  }

  const huruf = besar ? 12 : 10.5
  const kiri = besar ? 52 : 38
  const kanan = besar ? 64 : 48
  const atas = besar ? 14 : 8
  const bawah = besar ? 34 : 18
  const lebarArea = Math.max(1, lebar - kiri - kanan)
  const tinggiArea = Math.max(1, tinggi - atas - bawah)
  const x = (n: number) => kiri + (nMaks === 0 ? 0 : (n / nMaks) * lebarArea)
  const y = (v: number) => atas + tinggiArea - (Math.min(v, yMaks) / yMaks) * tinggiArea
  // Label sumbu x yang terlalu rapat dilewati (n terbesar selalu ditampilkan).
  const labelX: number[] = []
  for (const n of ukuran) {
    const terakhir = labelX[labelX.length - 1]
    if (terakhir !== undefined && x(n) - x(terakhir) < (besar ? 30 : 24)) {
      if (n === nMaks) labelX[labelX.length - 1] = n
      continue
    }
    labelX.push(n)
  }

  // Kurva acuan: titik-titiknya, lalu label di ujung yang digeser agar tidak bertumpuk.
  const kurvaGambar = kurva
    .map((k) => {
      const titik: { x: number; y: number }[] = []
      for (let i = 0; i <= 48; i++) {
        const n = nMin + ((nMaks - nMin) * i) / 48
        const v = k.c * fungsiKelas(k.kelas, n)
        if (v > yMaks) break
        titik.push({ x: x(n), y: y(v) })
      }
      return { ...k, titik, ly: titik.length ? titik[titik.length - 1].y : 0 }
    })
    .filter((k) => k.titik.length >= 2)
    .sort((a, b) => a.ly - b.ly)
  for (let i = 1; i < kurvaGambar.length; i++) {
    if (kurvaGambar[i].ly - kurvaGambar[i - 1].ly < huruf + 1) kurvaGambar[i].ly = kurvaGambar[i - 1].ly + huruf + 1
  }

  const kl = klasifikasi(hasil.seri[0]?.titik ?? [])
  const label = kl ? kalimatKesimpulan(kl, konfig.ukur).replace(/\*\*|`/g, '') : 'Grafik pertumbuhan program'

  return (
    <div ref={ref} className="h-full min-h-0 w-full min-w-0">
      {lebar > 0 && tinggi > 0 && (
        <svg width={lebar} height={tinggi} role="img" aria-label={label} className="block overflow-visible font-mono">
          {[0, yMaks / 2, yMaks].map((v) => (
            <g key={v}>
              <line x1={kiri} x2={kiri + lebarArea} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray={v === 0 ? undefined : '2 3'} />
              <text x={kiri - 6} y={y(v)} dy="0.32em" textAnchor="end" fontSize={huruf} fill="var(--muted-foreground)">
                {ringkas.format(v)}
              </text>
            </g>
          ))}
          {labelX.map((n) => (
            <text key={n} x={x(n)} y={atas + tinggiArea + (besar ? 16 : 13)} textAnchor="middle" fontSize={huruf} fill="var(--muted-foreground)">
              {n}
            </text>
          ))}
          {besar && (
            <>
              <text x={kiri + lebarArea / 2} y={tinggi - 2} textAnchor="middle" fontSize={huruf} fill="var(--muted-foreground)">
                ukuran n
              </text>
              <text x={kiri} y={atas - 4} fontSize={huruf} fill="var(--muted-foreground)">
                {namaUkuran(konfig.ukur).replace(/`/g, '')}
              </text>
            </>
          )}

          {kurvaGambar.map((k) => {
            const akhir = k.titik[k.titik.length - 1]
            return (
              <g key={`${k.kelas}-${k.warna}`} opacity={0.6}>
                <polyline points={k.titik.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(' ')} fill="none" stroke={k.warna} strokeWidth={1.5} strokeDasharray="4 3" />
                <text x={akhir.x + 8} y={k.ly} dy="0.32em" fontSize={huruf} fill={k.warna === 'var(--muted-foreground)' ? 'var(--muted-foreground)' : 'var(--foreground)'}>
                  {labelKelas(k.kelas)}
                </text>
              </g>
            )
          })}

          {hasil.seri.map((s, i) => {
            const v = titikValid(s)
            return (
              <g key={s.nama} style={{ color: WARNA_SERI[i] }}>
                {v.length > 1 && <polyline points={v.map((t) => `${x(t.n)},${y(t.nilai)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth={2} />}
                {v.map((t) => (
                  <circle key={t.n} cx={x(t.n)} cy={y(t.nilai)} r={besar ? 4.5 : 3.5} fill="var(--card)" stroke="currentColor" strokeWidth={2}>
                    <title>{`n = ${t.n}: ${penuh.format(t.nilai)}`}</title>
                  </circle>
                ))}
                {s.titik
                  .filter((t) => t.status !== 'ok' && t.status !== 'waktu')
                  .map((t) => (
                    <text key={t.n} x={x(t.n)} y={atas + 2} textAnchor="middle" dy="0.6em" fontSize={huruf + 1} fontWeight={700} fill="var(--galat)">
                      ×<title>{`n = ${t.n}: ${PESAN_STATUS[t.status as Exclude<TitikPertumbuhan['status'], 'ok'>]}`}</title>
                    </text>
                  ))}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

function TabelPertumbuhan({ hasil, konfig, className }: { hasil: HasilPertumbuhan; konfig: KonfigPertumbuhan; className?: string }) {
  const ukuran = [...new Set(konfig.nilai)].sort((a, b) => a - b)
  return (
    <table className={cn('w-full border-collapse text-[13px]', className)}>
      <caption className="sr-only">{`Hasil pengukuran: ${namaUkuran(konfig.ukur).replace(/`/g, '')} untuk setiap n`}</caption>
      <thead>
        <tr className="border-b text-left text-muted-foreground">
          <th scope="col" className="py-1.5 pr-3 font-medium">n</th>
          {hasil.seri.map((s) => (
            <th key={s.nama} scope="col" className="py-1.5 pr-3 font-medium">
              {hasil.seri.length > 1 ? s.nama : namaUkuran(konfig.ukur).replace(/`/g, '')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="font-mono tabular-nums">
        {ukuran.map((n, i) => (
          <tr key={n} className="border-b border-border/60">
            <th scope="row" className="py-1 pr-3 text-left font-semibold">{n}</th>
            {hasil.seri.map((s) => {
              const t = s.titik.find((p) => p.n === n)
              const sebelum = i > 0 ? s.titik.find((p) => p.n === ukuran[i - 1]) : undefined
              if (!t || t.nilai === null) {
                return (
                  <td key={s.nama} className="py-1 pr-3 font-sans text-galat">
                    {t ? PESAN_STATUS[t.status as Exclude<TitikPertumbuhan['status'], 'ok'>] : '—'}
                  </td>
                )
              }
              const faktor = sebelum?.nilai ? t.nilai / sebelum.nilai : undefined
              return (
                <td key={s.nama} className="py-1 pr-3">
                  {penuh.format(t.nilai)}
                  {faktor !== undefined && <span className="ml-1.5 text-muted-foreground">({faktor.toLocaleString('id-ID', { maximumFractionDigits: 2 })}×)</span>}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Penanda({ indeks }: { indeks: number }) {
  return <span aria-hidden="true" className="mt-[5px] inline-block size-2.5 shrink-0 rounded-full" style={{ background: WARNA_SERI[indeks] }} />
}

/** Isi tab Pertumbuhan: grafik kecil, kesimpulan, dan tombol untuk grafik besar beserta tabelnya. */
export function PanelPertumbuhan({ konfig }: { konfig: KonfigPertumbuhan }) {
  const hasil = usePemutar((s) => s.pertumbuhan)
  const memuat = usePemutar((s) => s.memuatPertumbuhan)
  const daftarN = [...new Set(konfig.nilai)].sort((a, b) => a - b).join(', ')

  if (!hasil) {
    return (
      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
        {memuat && <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        {memuat ? `Mengukur program untuk n = ${daftarN}…` : 'Grafik muncul setelah program berhasil dijalankan.'}
      </p>
    )
  }
  if (hasil.galat) {
    return (
      <p className="text-[13px] leading-relaxed">
        <b className="text-galat">Grafik belum bisa dibuat.</b> <TeksSebaris teks={hasil.galat} />
      </p>
    )
  }

  const banyak = hasil.seri.length > 1
  const kl = klasifikasi(hasil.seri[0].titik)
  return (
    <div className={cn('flex h-full min-h-0 gap-3 transition-opacity duration-200', memuat && 'opacity-60')} aria-busy={memuat}>
      <div className="min-h-[96px] min-w-0 flex-1">
        <GrafikPertumbuhan hasil={hasil} konfig={konfig} />
      </div>
      <div className="flex w-[44%] shrink-0 flex-col gap-1.5 overflow-auto text-[12.5px] leading-snug">
        {banyak ? (
          hasil.seri.map((s, i) => {
            const k = klasifikasi(s.titik)
            return (
              <p key={s.nama} className="flex gap-1.5">
                <Penanda indeks={i} />
                <span>
                  <span className="font-semibold">{s.nama}</span>: {k ? <TeksSebaris teks={ringkasanSeri(k)} /> : 'belum cukup titik'}
                </span>
              </p>
            )
          })
        ) : (
          <p>{kl ? <TeksSebaris teks={kalimatKesimpulan(kl, konfig.ukur)} /> : 'Belum cukup titik untuk menyimpulkan pola.'}</p>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-auto -ml-2 self-start">
              <Expand data-icon="inline-start" />
              Perbesar & tabel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Grafik pertumbuhan</DialogTitle>
              <DialogDescription>
                Program dijalankan ulang untuk n = {daftarN}. Garis putus-putus adalah kurva acuan yang diskalakan agar melewati titik terakhir.
              </DialogDescription>
            </DialogHeader>
            <div className="h-72">
              <GrafikPertumbuhan hasil={hasil} konfig={konfig} besar />
            </div>
            <div className="flex flex-col gap-1.5 text-[14px] leading-relaxed">
              {hasil.seri.map((s, i) => {
                const k = klasifikasi(s.titik)
                return (
                  <p key={s.nama} className="flex gap-2">
                    <Penanda indeks={i} />
                    <span>
                      {banyak && <span className="font-semibold">{s.nama}: </span>}
                      {k ? <TeksSebaris teks={kalimatKesimpulan(k, konfig.ukur)} /> : 'Belum cukup titik untuk menyimpulkan pola.'}
                    </span>
                  </p>
                )
              })}
            </div>
            <TabelPertumbuhan hasil={hasil} konfig={konfig} />
          </DialogContent>
        </Dialog>
      </div>
      <TabelPertumbuhan hasil={hasil} konfig={konfig} className="sr-only" />
    </div>
  )
}
