import type { StateMesin } from '@/engine'
import { tampilNilai } from '@/engine'
import type { Nilai } from '@/engine/nilai'
import { cn } from '@/lib/utils'
import { cariVariabel, kelasSorotanBanyak, PesanVariabel, type Sorotan } from './bersama'
import { idArrayDari } from './ArrayView'
import { objekInternal } from './dataKoleksi'
import { sisiDariMatriks, TAK_HINGGA, type Sisi } from './dataGraf'
import { daftarKetetanggaan, type DaftarTetangga } from './dataStruktur'
import { useJangkar } from './panah'

export interface KonfigGraf {
  jenis: 'graf'
  /** Matriks ketetanggaan int[][]/boolean[][], atau daftar ketetanggaan (ArrayList<ArrayList<Integer>>, ArrayList<Integer>[]). */
  variabel: string
  nama?: string | (string | number)[]
  berarah?: boolean
  dikunjungi?: string
  label?: string
  simpul?: string[]
  posisi?: [number, number][]
  kosong?: number
}

function teksLabel(v: Nilai | undefined, tipe: string, heap: StateMesin['heap']): string {
  if (v === undefined) return ''
  if (typeof v === 'number' && Math.abs(v) >= TAK_HINGGA) return '∞'
  if (typeof v === 'bigint' && (v >= BigInt(TAK_HINGGA) || v <= -BigInt(TAK_HINGGA))) return '∞'
  return tampilNilai(v, tipe, heap)
}

export function GrafView({ state, sorotan, konfig, adaDiKode = true, adaMemori = true }: { state: StateMesin; sorotan: Sorotan; konfig: KonfigGraf; adaDiKode?: boolean; adaMemori?: boolean }) {
  const hasil = cariVariabel(state, konfig.variabel)
  const idLangsung = hasil && typeof hasil.v.nilai === 'number' ? hasil.v.nilai : undefined
  const id = hasil?.v.tipe.endsWith('[][]') ? idArrayDari(state, konfig.variabel) : idLangsung
  const jangkar = useJangkar(typeof id === 'number' ? `heap:${id}` : `heap:kosong:${konfig.variabel}`)
  if (!hasil) return <PesanVariabel nama={konfig.variabel} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  const luar = typeof id === 'number' ? state.heap[id] : undefined

  let n: number
  let sisi: Sisi[]
  let berbobot = false
  let simetris: boolean
  let daftar: DaftarTetangga | undefined
  // Sisi yang sel matriksnya dibaca/ditulis pada langkah ini.
  const sisiDibaca = new Set<string>()
  if (luar && luar.k === 'array' && hasil.v.tipe.endsWith('[][]')) {
    const idBaris = luar.nilai as (number | null)[]
    const baris = idBaris.map((r) => (typeof r === 'number' && state.heap[r]?.k === 'array' ? (state.heap[r] as { nilai: Nilai[] }).nilai : []))
    n = baris.length
    ;({ sisi, berbobot, simetris } = sisiDariMatriks(baris, hasil.v.tipe.slice(0, -4), konfig.kosong))
    idBaris.forEach((r, i) => {
      if (typeof r !== 'number') return
      for (let j = 0; j < n; j++) if (sorotan.baca.has(`el:${r}:${j}`) || sorotan.tulis.has(`el:${r}:${j}`)) sisiDibaca.add(`${i}-${j}`)
    })
  } else if (typeof id === 'number' && (daftar = daftarKetetanggaan(state.heap, id))) {
    n = daftar.tetangga.length
    const ada = new Set<string>()
    sisi = []
    daftar.tetangga.forEach((tetangga, u) => {
      for (const v of tetangga) {
        if (v < 0 || v >= n || ada.has(`${u}-${v}`)) continue
        ada.add(`${u}-${v}`)
        sisi.push({ dari: u, ke: v, bobot: null })
      }
    })
    simetris = sisi.every((s) => ada.has(`${s.ke}-${s.dari}`))
  } else {
    return (
      <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">
        <code className="kode-sebaris">{konfig.variabel}</code> belum berisi matriks ketetanggaan atau daftar ketetanggaan.
      </p>
    )
  }
  const berarah = konfig.berarah ?? !simetris

  // Nama simpul.
  let nama = Array.from({ length: n }, (_, i) => String(i))
  if (Array.isArray(konfig.nama)) nama = nama.map((x, i) => String(konfig.nama![i] ?? x))
  else if (konfig.nama) {
    const v = cariVariabel(state, konfig.nama)
    const o = v && typeof v.v.nilai === 'number' ? state.heap[v.v.nilai] : undefined
    if (o?.k === 'array') nama = nama.map((x, i) => (i < o.nilai.length ? tampilNilai(o.nilai[i], o.tipeElemen, state.heap).replace(/^["']|["']$/g, '') : x))
    else if (o?.k === 'string') nama = nama.map((x, i) => o.nilai[i] ?? x)
  }

  const arrayDari = (namaVar?: string) => {
    if (!namaVar) return undefined
    const v = cariVariabel(state, namaVar)
    const o = v && typeof v.v.nilai === 'number' ? state.heap[v.v.nilai] : undefined
    return o?.k === 'array' ? o : undefined
  }
  const dikunjungi = arrayDari(konfig.dikunjungi)
  const label = arrayDari(konfig.label)
  const penunjuk = (konfig.simpul ?? []).map((v) => {
    const p = cariVariabel(state, v)
    return p && typeof p.v.nilai === 'number' && p.v.nilai >= 0 && p.v.nilai < n ? { nama: v, i: p.v.nilai } : null
  })
  const aktif = penunjuk[0]?.i
  const tetangga = penunjuk[1]?.i

  // Tata letak.
  const W = Math.max(320, Math.min(520, 120 + n * 46))
  const H = Math.max(240, Math.min(380, 100 + n * 34))
  const R = 17
  const pos = Array.from({ length: n }, (_, i) => {
    const p = konfig.posisi?.[i]
    if (p) return { x: 30 + (p[0] / 100) * (W - 60), y: 30 + (p[1] / 100) * (H - 60) }
    const sudut = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n)
    return { x: W / 2 + Math.cos(sudut) * (W / 2 - 42), y: H / 2 + Math.sin(sudut) * (H / 2 - 36) }
  })

  const digambar = berarah ? sisi : sisi.filter((s) => s.dari < s.ke || !sisi.some((t) => t.dari === s.ke && t.ke === s.dari))
  const sudahDikunjungi = (i: number) => dikunjungi !== undefined && (dikunjungi.nilai[i] === true || dikunjungi.nilai[i] === 1)
  const ringkasan = `Graf ${n} simpul, ${digambar.length} sisi${berarah ? ' berarah' : ''}${aktif !== undefined ? `, simpul aktif ${nama[aktif]}` : ''}${
    dikunjungi ? `, ${konfig.dikunjungi} bernilai true untuk: ${nama.filter((_, i) => sudahDikunjungi(i)).join(', ') || 'belum ada'}` : ''
  }.`

  return (
    <div ref={jangkar} className="inline-flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
        <span className="font-mono font-semibold">{konfig.variabel}</span>
        <span className="text-muted-foreground">
          · graf {n} simpul{berarah ? ', berarah' : ''}
          {berbobot ? ', berbobot' : ''}
          {daftar ? ', daftar ketetanggaan' : ''}
        </span>
        {dikunjungi && (
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span aria-hidden="true" className="inline-block size-3 rounded-full border-[1.5px] border-tulis bg-tulis-lembut" />
            <span className="font-mono">{konfig.dikunjungi}</span> = true
          </span>
        )}
        {penunjuk[0] && (
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span aria-hidden="true" className="inline-block size-3 rounded-full border-[2.5px] border-banding" /> {penunjuk[0].nama}
          </span>
        )}
        {penunjuk[1] && (
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span aria-hidden="true" className="inline-block size-3 rounded-full border-[2.5px] border-baca" /> {penunjuk[1].nama}
          </span>
        )}
      </div>
      <svg width={W} height={H} role="img" aria-label={ringkasan} className="overflow-visible font-mono">
        <defs>
          {['biasa', 'sorot'].map((jenis) => (
            <marker key={jenis} id={`panah-graf-${jenis}-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={jenis === 'sorot' ? 'var(--banding)' : 'var(--muted-foreground)'} />
            </marker>
          ))}
        </defs>
        {digambar.map((s) => {
          const a = pos[s.dari]
          const b = pos[s.ke]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const pj = Math.hypot(dx, dy) || 1
          const ux = dx / pj
          const uy = dy / pj
          // Dua sisi berlawanan arah digeser sedikit agar tidak bertumpuk.
          const kembar = berarah && sisi.some((t) => t.dari === s.ke && t.ke === s.dari)
          const geser = kembar ? 5 : 0
          const ox = -uy * geser
          const oy = ux * geser
          const x1 = a.x + ux * R + ox
          const y1 = a.y + uy * R + oy
          const x2 = b.x - ux * (R + (berarah ? 3 : 0)) + ox
          const y2 = b.y - uy * (R + (berarah ? 3 : 0)) + oy
          const sorot =
            sisiDibaca.has(`${s.dari}-${s.ke}`) ||
            (!berarah && sisiDibaca.has(`${s.ke}-${s.dari}`)) ||
            (aktif !== undefined && tetangga !== undefined && ((s.dari === aktif && s.ke === tetangga) || (!berarah && s.ke === aktif && s.dari === tetangga)))
          const mx = (x1 + x2) / 2 + ox * 1.6
          const my = (y1 + y2) / 2 + oy * 1.6
          return (
            <g key={`${s.dari}-${s.ke}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={sorot ? 'var(--banding)' : 'var(--muted-foreground)'}
                strokeOpacity={sorot ? 1 : 0.55}
                strokeWidth={sorot ? 2.5 : 1.5}
                markerEnd={berarah ? `url(#panah-graf-${sorot ? 'sorot' : 'biasa'}-${id})` : undefined}
                className="transition-[stroke,stroke-width] duration-200"
              />
              {berbobot && s.bobot !== null && (
                <g>
                  <rect x={mx - 11} y={my - 8} width={22} height={16} rx={4} fill="var(--card)" stroke={sorot ? 'var(--banding)' : 'var(--border)'} />
                  <text x={mx} y={my} dy="0.34em" textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--foreground)">
                    {s.bobot}
                  </text>
                </g>
              )}
            </g>
          )
        })}
        {pos.map((p, i) => {
          const kunjung = sudahDikunjungi(i)
          const isAktif = i === aktif
          const isTetangga = i === tetangga
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={R}
                fill={kunjung ? 'var(--tulis-lembut)' : 'var(--card)'}
                stroke={isAktif ? 'var(--banding)' : isTetangga ? 'var(--baca)' : kunjung ? 'var(--tulis)' : 'var(--input)'}
                strokeWidth={isAktif || isTetangga ? 3 : 1.75}
                className="transition-[fill,stroke,stroke-width] duration-200"
              />
              <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--foreground)">
                {nama[i]}
              </text>
              {label && i < label.nilai.length && (
                <text x={p.x} y={p.y + R + 13} textAnchor="middle" fontSize={11.5} fontWeight={600} className={cn(isAktif ? 'fill-banding-teks' : 'fill-muted-foreground')}>
                  {konfig.label}={teksLabel(label.nilai[i], label.tipeElemen, state.heap)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {daftar && <PanelTetangga daftar={daftar} nama={nama} aktif={aktif} tetangga={tetangga} state={state} sorotan={sorotan} variabel={konfig.variabel} />}
    </div>
  )
}

/** Daftar ketetanggaan apa adanya: satu baris per simpul, `u → [v1, v2]`. */
function PanelTetangga({
  daftar,
  nama,
  aktif,
  tetangga,
  state,
  sorotan,
  variabel,
}: {
  daftar: DaftarTetangga
  nama: string[]
  aktif?: number
  tetangga?: number
  state: StateMesin
  sorotan: Sorotan
  variabel: string
}) {
  return (
    <div role="list" aria-label={`Daftar ketetanggaan ${variabel}`} className="flex flex-col gap-1 font-mono text-[13px]">
      {daftar.tetangga.map((ts, u) => {
        const dalam = daftar.idDalam[u]
        const berubah = dalam !== null && objekInternal(state.heap, dalam).some((x) => sorotan.berubah.has(x))
        const kunci = [...daftar.kunciDalam[u], ...(dalam !== null ? [`obj:${dalam}`] : [])]
        return (
          <div key={u} role="listitem" className="flex items-center gap-2">
            <span className={cn('w-8 shrink-0 text-right text-[11.5px] font-semibold', u === aktif ? 'text-banding-teks' : 'text-muted-foreground')}>{nama[u]}</span>
            <span aria-hidden="true" className="text-muted-foreground">
              →
            </span>
            <span
              className={cn(
                'rounded-md border-[1.5px] px-2 py-0.5 transition-[background-color,border-color] duration-200',
                berubah ? 'border-tulis bg-tulis-lembut' : u === aktif ? 'border-banding bg-banding-lembut' : kelasSorotanBanyak(sorotan, kunci),
              )}
            >
              [
              {ts.map((v, k) => (
                <span key={k}>
                  {k > 0 && ', '}
                  <span className={cn(u === aktif && v === tetangga && 'rounded-sm bg-baca/20 font-bold')}>{v}</span>
                </span>
              ))}
              ]
            </span>
          </div>
        )
      })}
    </div>
  )
}
