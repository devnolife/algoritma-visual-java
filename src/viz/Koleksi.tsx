import { Layers } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import { namaKelasTampil, type StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, NilaiBerubah, type Sorotan } from './bersama'
import { BarisAntrian } from './Antrian'
import { KepalaVisual, PesanJalur, PesanVisual } from './bagian'
import { isiDalam, ringkasKoleksi, type IsiDalam, type RingkasanElemen, type RingkasanKoleksi, type RingkasanPeta, type SelInternal } from './dataKoleksi'
import { susunHeap, susunPohon, susunRantai } from './dataStruktur'
import { ikutiJalur } from './jalur'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'
import { GambarPohon, simpulDariPohon, type SimpulGambar } from './PohonBiner'
import { GambarRantai } from './Rantai'
import { jenisSorotan, kelasSorotan, kelasSorotanBanyak } from './sorotan'
import { DaftarBucket, type BarisBucketData } from './TabelHash'
import { TumpukanSel } from './Tumpukan'

export interface KonfigKoleksi {
  jenis: 'koleksi'
  variabel: string
  /** Tampilkan isi dalam sejak awal. */
  isiDalam?: boolean
  /**
   * Cara menggambar Deque/LinkedList: `tumpukan` (vertikal, puncak = elemen depan, untuk push/pop) atau
   * `antrian` (depan → belakang, untuk offer/poll). Tanpa opsi ini Deque tampil sebagai antrean dua ujung.
   */
  sebagai?: 'tumpukan' | 'antrian'
  judul?: string
}

type Heap = StateMesin['heap']

const KETERANGAN: Record<string, string> = {
  list: 'elemen berindeks',
  set: 'himpunan, tanpa duplikat',
  map: 'pasangan kunci → nilai',
  deque: 'antrean dua ujung',
  tumpukan: 'tumpukan (puncak di atas)',
  pq: 'antrean prioritas (min-heap)',
}

function ringkasanAria(r: RingkasanKoleksi, nama: string): string {
  if (r.ukuran === 0) return `${r.nama} ${nama} kosong.`
  if (r.jenis === 'map') return `${r.nama} ${nama} berisi ${r.ukuran} pasangan: ${r.entri.map((e) => `${e.teksKunci} ke ${e.teksNilai}`).join(', ')}.`
  const isi = r.elemen.map((e) => e.teks).join(', ')
  if (r.jenis === 'pq') return `${r.nama} ${nama}, ${r.ukuran} elemen dalam urutan array heap: ${isi}. Elemen terkecil di akar.`
  if (r.jenis === 'tumpukan') return `${r.nama} ${nama}, ${r.ukuran} elemen dari dasar ke puncak: ${isi}.`
  if (r.jenis === 'deque') return `${r.nama} ${nama}, ${r.ukuran} elemen dari depan ke belakang: ${isi}.`
  return `${r.nama} ${nama} berisi ${r.ukuran} elemen: ${isi}.`
}

// ---------- Tampilan abstrak ----------
/** Elemen yang lebih panjang dari ini (mis. objek `Mahasiswa{…}`) membuat daftar ditata vertikal. */
const PANJANG_VERTIKAL = 14

function SelDaftar({ r, sorotan, instan }: { r: RingkasanElemen; sorotan: Sorotan; instan: boolean }) {
  const vertikal = r.elemen.some((e) => e.teks.length > PANJANG_VERTIKAL)
  return (
    <div className={cn('flex max-w-full gap-1.5 overflow-x-auto pb-1', vertikal && 'flex-col items-start')}>
      <AnimatePresence initial={false} mode="popLayout">
        {r.elemen.map((e, i) => (
          <motion.div
            key={e.kunciReact}
            layout="position"
            className={cn('flex shrink-0 items-center gap-1', vertikal ? 'gap-2' : 'flex-col')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={instan ? { duration: 0 } : { duration: 0.22, ease: EASE_KELUAR }}
          >
            {vertikal && <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">[{i}]</span>}
            <div
              className={cn(
                'flex min-w-11 items-center justify-center rounded-lg border-[1.5px] px-2 font-mono font-semibold whitespace-nowrap transition-[background-color,border-color] duration-200',
                vertikal ? 'h-9 px-2.5 text-[13.5px]' : 'h-11 text-[15px]',
                kelasSorotanBanyak(sorotan, e.kunci),
              )}
            >
              <NilaiBerubah teks={e.teks} instan={instan} />
            </div>
            {!vertikal && <span className="font-mono text-[11px] text-muted-foreground">[{i}]</span>}
          </motion.div>
        ))}
      </AnimatePresence>
      {r.terpotong && <span className={cn('font-mono text-[13px] text-muted-foreground', vertikal ? 'ml-10' : 'self-center')}>… {r.ukuran - r.elemen.length} lagi</span>}
    </div>
  )
}

function ChipHimpunan({ r, sorotan, instan }: { r: RingkasanElemen; sorotan: Sorotan; instan: boolean }) {
  return (
    <div className="flex max-w-full flex-wrap items-center gap-1.5 font-mono">
      <span aria-hidden="true" className="text-[22px] leading-none font-light text-muted-foreground">
        {'{'}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        {r.elemen.map((e) => (
          <motion.span
            key={e.kunciReact}
            layout="position"
            className={cn('rounded-full border-[1.5px] px-2.5 py-1 text-[14px] font-semibold whitespace-nowrap transition-[background-color,border-color] duration-200', kelasSorotanBanyak(sorotan, e.kunci))}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={instan ? { duration: 0 } : { duration: 0.2, ease: EASE_KELUAR }}
          >
            {e.teks}
          </motion.span>
        ))}
      </AnimatePresence>
      {r.terpotong && <span className="text-[13px] text-muted-foreground">…</span>}
      <span aria-hidden="true" className="text-[22px] leading-none font-light text-muted-foreground">
        {'}'}
      </span>
    </div>
  )
}

function TabelPeta({ r, sorotan, instan }: { r: RingkasanPeta; sorotan: Sorotan; instan: boolean }) {
  if (r.entri.length === 0) return <PesanVisual>Map ini kosong.</PesanVisual>
  return (
    <table className="w-fit border-separate border-spacing-y-1 font-mono text-[14px]">
      <thead>
        <tr className="text-left font-sans text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
          <th scope="col" className="pr-2 font-semibold">
            kunci
          </th>
          <th aria-hidden="true" />
          <th scope="col" className="pl-2 font-semibold">
            nilai
          </th>
        </tr>
      </thead>
      <tbody>
        {r.entri.map((e) => {
          const kelas = kelasSorotanBanyak(sorotan, e.sumber)
          return (
            <tr key={e.kunciReact}>
              <td className={cn('rounded-l-lg border-[1.5px] border-r-0 px-2.5 py-1 font-semibold whitespace-nowrap transition-colors duration-200', kelas)}>{e.teksKunci}</td>
              <td aria-hidden="true" className={cn('border-y-[1.5px] px-1 text-muted-foreground transition-colors duration-200', kelas)}>
                →
              </td>
              <td className={cn('rounded-r-lg border-[1.5px] border-l-0 px-2.5 py-1 whitespace-nowrap transition-colors duration-200', kelas)}>
                <NilaiBerubah teks={e.teksNilai} instan={instan} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** Pohon heap dari sel array (indeks i: anak 2i+1 dan 2i+2). */
function simpulHeap(sel: { teks: string; kunci: string[] }[], sorotan: Sorotan): SimpulGambar[] {
  const pos = susunHeap(sel.length)
  return sel.map((s, i) => ({
    kunci: `i${i}`,
    teks: s.teks,
    x: pos[i].x,
    y: pos[i].y,
    induk: i > 0 ? `i${(i - 1) >> 1}` : undefined,
    label: i === 0 ? ['peek()'] : [],
    sorotData: jenisSorotan(sorotan, s.kunci),
    catatan: `[${i}]`,
  }))
}

/** Kelas yang bisa digambar sebagai tumpukan atau antrean (opsi `sebagai`). */
const BISA_DIPAKAI_SEBAGAI = new Set(['java.util.ArrayDeque', 'java.util.LinkedList'])

/** Deque/LinkedList yang dipakai sebagai tumpukan atau antrean; jenis lain selalu memakai tampilan bawaannya. */
function modeTampil(r: RingkasanKoleksi, sebagai: KonfigKoleksi['sebagai']): 'tumpukan' | 'antrian' | undefined {
  return sebagai && BISA_DIPAKAI_SEBAGAI.has(r.kelas) ? sebagai : undefined
}

function TampilanAbstrak({ r, nama, sebagai, sorotan, instan }: { r: RingkasanKoleksi; nama: string; sebagai: KonfigKoleksi['sebagai']; sorotan: Sorotan; instan: boolean }) {
  const aria = ringkasanAria(r, nama)
  if (r.jenis === 'map') {
    return (
      <div role="img" aria-label={aria} className="max-w-full overflow-x-auto">
        <TabelPeta r={r} sorotan={sorotan} instan={instan} />
      </div>
    )
  }
  const urut = r.elemen.map((e) => ({ teks: e.teks, kunci: e.kunci, kunciReact: e.kunciReact }))
  const mode = modeTampil(r, sebagai)
  if (mode === 'tumpukan') {
    // Elemen depan (head) adalah puncak: push/pop/peek bekerja di sana.
    const dariDasar = [...urut].reverse()
    const ringkasan = r.ukuran === 0 ? `${r.nama} ${nama} dipakai sebagai tumpukan, kosong.` : `${r.nama} ${nama} dipakai sebagai tumpukan, ${r.ukuran} elemen dari puncak: ${urut.map((e) => e.teks).join(', ')}.`
    return <TumpukanSel sel={dariDasar} sorotan={sorotan} instan={instan} ringkasan={ringkasan} namaPuncak="peek()" />
  }
  if (r.jenis === 'deque' || mode === 'antrian') return <BarisAntrian urutan={urut} sorotan={sorotan} instan={instan} ringkasan={aria} />
  if (r.jenis === 'tumpukan') return <TumpukanSel sel={urut} sorotan={sorotan} instan={instan} ringkasan={aria} namaPuncak="peek()" />
  if (r.jenis === 'pq') {
    if (r.elemen.length === 0) return <PesanVisual>PriorityQueue ini kosong.</PesanVisual>
    return (
      <div className="flex flex-col gap-1">
        <GambarPohon simpul={simpulHeap(urut, sorotan)} instan={instan} ringkasan={aria} />
        <span className="text-[12px] text-muted-foreground">Setiap induk ≤ anaknya, jadi elemen terkecil selalu di akar dan diambil lebih dulu oleh poll().</span>
      </div>
    )
  }
  if (r.elemen.length === 0) return <PesanVisual>{r.nama} ini kosong.</PesanVisual>
  return (
    <div role="img" aria-label={aria} className="max-w-full">
      {r.jenis === 'set' ? <ChipHimpunan r={r} sorotan={sorotan} instan={instan} /> : <SelDaftar r={r} sorotan={sorotan} instan={instan} />}
    </div>
  )
}

// ---------- Isi dalam (struktur internal JDK) ----------
function ChipField({ field, sorotan }: { field: { nama: string; teks: string; kunci: string }[]; sorotan: Sorotan }) {
  if (field.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {field.map((f) => (
        <span key={f.nama} className={cn('rounded-md border-[1.5px] px-1.5 py-px font-mono text-[12px] transition-[background-color,border-color] duration-200', kelasSorotan(sorotan, f.kunci))}>
          <span className="text-muted-foreground">{f.nama} =</span> <span className="font-semibold">{f.teks}</span>
        </span>
      ))}
    </div>
  )
}

/** Sel array internal dengan penanda `size` dan penunjuk indeks (head/tail). */
function LarikInternal({
  nama,
  sel,
  terisi,
  batas,
  penunjuk,
  sorotan,
  instan,
}: {
  nama: string
  sel: SelInternal[]
  /** Sel yang termasuk isi koleksi. */
  terisi: (i: number) => boolean
  /** Garis batas setelah sel ke-(n−1), mis. `size = 3`. */
  batas?: { n: number; label: string }
  penunjuk?: { nama: string; indeks: number }[]
  sorotan: Sorotan
  instan: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[12px] text-muted-foreground">
        {nama} <span className="text-[11px]">(Object[{sel.length}], kapasitas {sel.length})</span>
      </span>
      <div role="list" aria-label={`Array ${nama} berkapasitas ${sel.length}`} className="flex max-w-full items-start overflow-x-auto pt-1 pb-1">
        {sel.map((s) => {
          const di = (penunjuk ?? []).filter((p) => p.indeks === s.indeks)
          return (
            <div key={s.indeks} className="flex items-start">
              {batas && batas.n === s.indeks && <BatasUkuran label={batas.label} />}
              <div role="listitem" className="flex w-12 shrink-0 flex-col items-center gap-1 px-[3px]">
                <div
                  className={cn(
                    'flex h-10 w-full items-center justify-center rounded-md border-[1.5px] font-mono text-[13px] font-semibold whitespace-nowrap transition-[background-color,border-color] duration-200',
                    terisi(s.indeks) ? kelasSorotan(sorotan, s.kunci) : cn('border-dashed font-normal text-muted-foreground/75', sorotan.tulis.has(s.kunci) ? 'border-tulis bg-tulis-lembut' : 'border-muted-foreground/35'),
                  )}
                >
                  <NilaiBerubah teks={s.kosong ? 'null' : s.teks} instan={instan} className={s.kosong ? 'text-[11px]' : ''} />
                </div>
                <span className="font-mono text-[10.5px] text-muted-foreground">[{s.indeks}]</span>
                {di.length > 0 && (
                  <span className="flex flex-col items-center font-mono text-[11px] leading-tight font-bold text-banding-teks">
                    {di.map((p) => (
                      <span key={p.nama}>
                        <span aria-hidden="true">▲ </span>
                        {p.nama}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {batas && batas.n >= sel.length && <BatasUkuran label={batas.label} />}
      </div>
    </div>
  )
}

function BatasUkuran({ label }: { label: string }) {
  return (
    <span className="relative mx-0.5 flex h-10 w-0.5 shrink-0 self-start rounded-full bg-banding">
      <span className="absolute top-full left-1/2 mt-5 -translate-x-1/2 font-mono text-[11px] font-bold whitespace-nowrap text-banding-teks">{label}</span>
    </span>
  )
}

function PanelIsiDalam({ dalam, heap, sorotan, instan }: { dalam: IsiDalam; heap: Heap; sorotan: Sorotan; instan: boolean }) {
  switch (dalam.k) {
    case 'larik':
      return (
        <div className="flex flex-col gap-2">
          <ChipField field={dalam.field} sorotan={sorotan} />
          <LarikInternal
            nama={dalam.namaLarik}
            sel={dalam.sel}
            terisi={(i) => i < dalam.ukuran}
            batas={dalam.namaUkuran ? { n: dalam.ukuran, label: `${dalam.namaUkuran} = ${dalam.ukuran}` } : undefined}
            sorotan={sorotan}
            instan={instan}
          />
          {dalam.namaUkuran && (
            <p className="text-[12px] text-muted-foreground">
              Hanya {dalam.ukuran} sel pertama yang berisi elemen; sisanya cadangan kapasitas. Saat penuh, array baru yang lebih besar dibuat dan isinya disalin.
            </p>
          )}
        </div>
      )
    case 'melingkar': {
      const cap = dalam.sel.length
      const isi = (i: number) => (cap ? (((i - dalam.head) % cap) + cap) % cap < (((dalam.tail - dalam.head) % cap) + cap) % cap : false)
      return (
        <div className="flex flex-col gap-2">
          <ChipField field={dalam.field} sorotan={sorotan} />
          <LarikInternal
            nama={dalam.namaLarik}
            sel={dalam.sel}
            terisi={isi}
            penunjuk={[
              { nama: 'head', indeks: dalam.head },
              { nama: 'tail', indeks: dalam.tail },
            ]}
            sorotan={sorotan}
            instan={instan}
          />
          <p className="text-[12px] text-muted-foreground">Array melingkar: elemen ada dari head sampai sebelum tail, dan boleh melewati ujung array kembali ke indeks 0. Satu slot selalu kosong.</p>
        </div>
      )
    }
    case 'heap':
      return (
        <div className="flex flex-col gap-2">
          <ChipField field={dalam.field} sorotan={sorotan} />
          <LarikInternal nama={dalam.namaLarik} sel={dalam.sel} terisi={(i) => i < dalam.ukuran} batas={{ n: dalam.ukuran, label: `size = ${dalam.ukuran}` }} sorotan={sorotan} instan={instan} />
          <p className="text-[12px] text-muted-foreground">Pohon heap disimpan di array: anak dari indeks i ada di 2i+1 dan 2i+2.</p>
        </div>
      )
    case 'berantai': {
      const h = susunRantai(heap, { nama: 'first', nilai: dalam.first }, [{ nama: 'last', nilai: dalam.last, ada: true }], { berikut: 'next', sebelum: 'prev', data: 'item' })
      return (
        <div className="flex flex-col gap-2">
          <ChipField field={dalam.field} sorotan={sorotan} />
          {h.ok ? <GambarRantai h={h} sorotan={sorotan} instan={instan} /> : <PesanVisual>{h.masalah}</PesanVisual>}
        </div>
      )
    }
    case 'tabel': {
      const baris: BarisBucketData[] = dalam.bucket.map((b) => ({
        indeks: b.indeks,
        kunci: b.kunci,
        ujung: 'null',
        penunjuk: [],
        simpul: b.simpul.map((s) => {
          const f = (n: string) => s.isi.find((x) => x.nama === n)
          return {
            id: s.id,
            teks: f('key')?.teks ?? '?',
            teks2: f('value')?.teks,
            kecil: f('hash') ? `hash ${f('hash')!.teks}` : undefined,
            label: [],
            sorotUtama: [f('key')?.kunci ?? '', `obj:${s.id}`],
            sorotKedua: [f('value')?.kunci ?? ''],
            sorotBerikut: [`field:${s.id}:next`],
          }
        }),
      }))
      const teksKunci = (id: number) => dalam.bucket.flatMap((b) => b.simpul).find((s) => s.id === id)?.isi.find((x) => x.nama === 'key')?.teks ?? '?'
      return (
        <div className="flex flex-col gap-2">
          <ChipField field={dalam.field} sorotan={sorotan} />
          {dalam.idLarik === null ? (
            <PesanVisual>
              <code className="kode-sebaris">table</code> masih null: array bucket baru dibuat saat put() pertama.
            </PesanVisual>
          ) : (
            <>
              <span className="font-mono text-[12px] text-muted-foreground">
                table <span className="text-[11px]">(HashMap.Node[{dalam.bucket.length}]; indeks bucket = hash &amp; {dalam.bucket.length - 1})</span>
              </span>
              <DaftarBucket baris={baris} sorotan={sorotan} instan={instan} kolomPenunjuk={false} label={`table dengan ${dalam.bucket.length} bucket`} />
            </>
          )}
          {dalam.urutan && (
            <div className="flex flex-wrap items-center gap-1 font-mono text-[12.5px]">
              <span className="font-sans text-[12px] text-muted-foreground">Urutan sisip (head → after → … → tail):</span>
              {dalam.urutan.map((id, i) => (
                <span key={id} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true" className="text-muted-foreground">⇄</span>}
                  <span className={cn('rounded-md border-[1.5px] px-1.5 py-px', kelasSorotanBanyak(sorotan, [`obj:${id}`, `field:${id}:before`, `field:${id}:after`]))}>{teksKunci(id)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }
    case 'pohon': {
      const h = susunPohon(heap, { nama: 'root', nilai: dalam.akar }, [], { kiri: 'left', kanan: 'right', data: 'key', nilai: 'value', warna: 'color' })
      return (
        <div className="flex flex-col gap-2">
          <ChipField field={dalam.field} sorotan={sorotan} />
          {!h.ok ? (
            <PesanVisual>{h.masalah}</PesanVisual>
          ) : h.simpul.length === 0 ? (
            <PesanVisual>
              <code className="kode-sebaris">root</code> masih null.
            </PesanVisual>
          ) : (
            <>
              <GambarPohon simpul={simpulDariPohon(h, sorotan)} instan={instan} ringkasan={`Pohon merah-hitam dengan ${h.jumlahUtama} entri, tinggi ${h.tinggi}.`} />
              <p className="flex flex-wrap items-center gap-x-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block size-3 rounded-full bg-[oklch(0.55_0.19_27)]" /> merah
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block size-3 rounded-full border border-[oklch(0.55_0.015_262)] bg-[oklch(0.24_0.015_262)]" /> hitam
                </span>
                <span>Pohon pencarian biner yang seimbang: kunci kiri &lt; induk &lt; kunci kanan.</span>
              </p>
            </>
          )}
        </div>
      )
    }
    case 'bungkus':
      return (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-muted-foreground">
            Field <code className="kode-sebaris">{dalam.namaField}</code> menunjuk{' '}
            {dalam.dalam ? <code className="kode-sebaris">{namaKelasTampil(dalam.dalam.kelas)}</code> : 'map'} penopangnya
            {/(HashSet|TreeSet)$/.test(dalam.kelas) ? '; setiap elemen disimpan sebagai kunci dengan nilai bersama PRESENT.' : '.'}
          </p>
          <div className="rounded-lg border border-dashed p-2.5">{dalam.dalam ? <PanelIsiDalam dalam={dalam.dalam} heap={heap} sorotan={sorotan} instan={instan} /> : <PesanVisual>Map penopang tidak ditemukan.</PesanVisual>}</div>
        </div>
      )
  }
}

export function KoleksiView({
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
  konfig: KonfigKoleksi
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const [lihatDalam, setLihatDalam] = useState(konfig.isiDalam ?? false)
  const h = ikutiJalur(state, konfig.variabel)
  const id = typeof h.nilai === 'number' ? h.nilai : undefined
  const r = useMemo(() => (id !== undefined ? ringkasKoleksi(state.heap, id) : undefined), [state, id])
  const dalam = useMemo(() => (lihatDalam && id !== undefined ? isiDalam(state.heap, id) : null), [state, id, lihatDalam])
  const jangkar = useJangkar(id !== undefined ? `heap:${id}` : `heap:kosong:${konfig.variabel}`)
  if (h.masalah) return <PesanJalur state={state} jalur={konfig.variabel} masalah={`\`${h.pada ?? konfig.variabel}\` belum tersedia`} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  if (h.nilai === null) {
    return (
      <PesanVisual>
        <code className="kode-sebaris">{konfig.variabel} = null</code> (belum menunjuk koleksi apa pun)
      </PesanVisual>
    )
  }
  if (!r || id === undefined) {
    return (
      <PesanVisual>
        <code className="kode-sebaris">{konfig.variabel}</code> bukan koleksi java.util (List, Set, Map, Queue/Deque, Stack, PriorityQueue).
      </PesanVisual>
    )
  }
  const mode = modeTampil(r, konfig.sebagai)
  const keterangan = mode === 'tumpukan' ? 'dipakai sebagai tumpukan' : mode === 'antrian' ? 'dipakai sebagai antrean' : KETERANGAN[r.jenis]
  return (
    <div ref={jangkar} className="inline-flex max-w-full flex-col gap-2">
      <KepalaVisual>
        <BadgeTipe tipe={h.tipe} />
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.variabel}</span>
        <span className="text-muted-foreground">
          · {r.nama}, {keterangan} · size() = {r.ukuran}
        </span>
        <Toggle size="sm" variant="outline" pressed={lihatDalam} onPressedChange={setLihatDalam} className="ml-1 gap-1.5 text-[12.5px]">
          <Layers aria-hidden="true" />
          Lihat isi dalam
        </Toggle>
      </KepalaVisual>
      <TampilanAbstrak r={r} nama={konfig.variabel} sebagai={konfig.sebagai} sorotan={sorotan} instan={instan} />
      {lihatDalam && (
        <motion.section
          aria-label={`Isi dalam ${r.nama} (field privat JDK 21)`}
          className="flex max-w-full flex-col gap-2 rounded-xl border bg-card/70 p-3"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={instan ? { duration: 0 } : { duration: 0.2, ease: EASE_KELUAR }}
        >
          <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Isi dalam · {namaKelasTampil(r.kelas)} (field privat JDK 21)
          </span>
          {dalam ? <PanelIsiDalam dalam={dalam} heap={state.heap} sorotan={sorotan} instan={instan} /> : <PesanVisual>Struktur internal koleksi ini belum bisa digambar.</PesanVisual>}
        </motion.section>
      )}
    </div>
  )
}
