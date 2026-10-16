import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import type { StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { EASE_KELUAR, type Sorotan } from './bersama'
import { KepalaVisual, KeteranganPenunjuk, MuatLebar, PanahPendek, PesanJalur } from './bagian'
import { bangunTabelHash, type OpsiTabelHash } from './dataStruktur'
import { ikutiJalur } from './jalur'
import { BadgeTipe } from './Memori'
import { useJangkar } from './panah'
import { jenisSorotan, kelasSorotan } from './sorotan'

export interface KonfigTabelHash extends OpsiTabelHash {
  jenis: 'tabelHash'
  judul?: string
}

/** Simpul dalam satu bucket, siap gambar. */
export interface SimpulBucket {
  id: number
  /** Teks utama (kunci). */
  teks: string
  /** Teks kedua (nilai), ditulis setelah tanda `=`. */
  teks2?: string
  /** Keterangan kecil di atas teks (mis. `hash 97`). */
  kecil?: string
  label: string[]
  sorotUtama: string[]
  sorotKedua: string[]
  sorotBerikut: string[]
}

export interface BarisBucketData {
  indeks: number
  kunci: string
  /** Isi langsung bucket (pengalamatan terbuka), bukan simpul. */
  teks?: string
  simpul: SimpulBucket[]
  ujung: 'null' | 'melingkar' | 'terpotong' | 'lain'
  penunjuk: string[]
}

function KotakSimpulBucket({ s, sorotan, instan }: { s: SimpulBucket; sorotan: Sorotan; instan: boolean }) {
  const jangkar = useJangkar(`heap:${s.id}`)
  const baru = sorotan.baru.has(`obj:${s.id}`)
  const sUtama = jenisSorotan(sorotan, s.sorotUtama)
  const sKedua = jenisSorotan(sorotan, s.sorotKedua)
  const latar = (j: 'tulis' | 'baca' | null) => (j === 'tulis' ? 'bg-tulis-lembut' : j === 'baca' ? 'bg-baca/15' : '')
  return (
    <motion.div
      className="relative flex shrink-0 flex-col items-center"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={instan ? { duration: 0 } : { duration: 0.22, ease: EASE_KELUAR }}
    >
      {s.label.length > 0 && (
        <span className="absolute bottom-full mb-px flex flex-col items-center font-mono text-[11px] leading-[13px] font-bold whitespace-nowrap text-banding-teks">
          {s.label.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      )}
      <div
        ref={jangkar}
        className={cn(
          'relative flex h-9 items-stretch overflow-hidden rounded-lg border-[1.5px] bg-card font-mono text-[13.5px] whitespace-nowrap transition-[border-color,box-shadow] duration-200',
          s.label.length ? 'border-banding' : 'border-input',
          baru && 'border-tulis ring-2 ring-tulis/30',
        )}
      >
        <span data-sasaran-panah="" aria-hidden="true" className="absolute top-0 left-0 h-3 w-px" />
        <span className={cn('flex flex-col items-center justify-center px-2 font-semibold leading-none', latar(sUtama))}>
          {s.kecil && <span className="mb-0.5 font-sans text-[9.5px] font-normal text-muted-foreground">{s.kecil}</span>}
          {s.teks}
        </span>
        {s.teks2 !== undefined && <span className={cn('flex items-center border-l border-input px-2', latar(sKedua))}>{s.teks2}</span>}
      </div>
    </motion.div>
  )
}

/** Satu baris bucket: sel indeks, lalu rantai simpulnya sampai null. */
export function BarisBucket({ b, sorotan, instan, kolomPenunjuk = true }: { b: BarisBucketData; sorotan: Sorotan; instan: boolean; kolomPenunjuk?: boolean }) {
  const kosong = b.simpul.length === 0 && b.teks === undefined
  return (
    <div role="listitem" className={cn('flex items-center', kosong ? 'min-h-8' : 'min-h-12', b.simpul.some((s) => s.label.length) && 'pt-3.5')}>
      {kolomPenunjuk && (
        <span className={cn('w-12 shrink-0 pr-1 text-right font-mono text-[11px] font-bold whitespace-nowrap text-banding-teks', !b.penunjuk.length && 'invisible')}>
          {b.penunjuk.join(', ') || '·'} <span aria-hidden="true">▶</span>
        </span>
      )}
      <span
        className={cn(
          'flex h-8 min-w-10 shrink-0 items-center justify-center rounded-md border-[1.5px] px-1.5 font-mono text-[12px] text-muted-foreground transition-[background-color,border-color] duration-200',
          kelasSorotan(sorotan, b.kunci),
          b.penunjuk.length > 0 && 'border-banding',
        )}
      >
        [{b.indeks}]
      </span>
      {b.teks !== undefined ? (
        <span className="ml-2 font-mono text-[14px] font-semibold">{b.teks}</span>
      ) : kosong ? (
        <span className="ml-2 font-mono text-[12px] text-muted-foreground/80">null</span>
      ) : (
        <div className="flex items-center">
          <AnimatePresence initial={false}>
            {b.simpul.map((s, k) => (
              <div key={s.id} className="flex items-center">
                <PanahPendek lebar={18} warna={jenisSorotan(sorotan, k === 0 ? [b.kunci] : b.simpul[k - 1].sorotBerikut) ?? 'biasa'} />
                <KotakSimpulBucket s={s} sorotan={sorotan} instan={instan} />
              </div>
            ))}
          </AnimatePresence>
          <PanahPendek lebar={16} warna={jenisSorotan(sorotan, b.simpul[b.simpul.length - 1]?.sorotBerikut ?? []) ?? 'biasa'} />
          <span className="font-mono text-[12px] text-muted-foreground">{b.ujung === 'null' ? 'null' : b.ujung === 'melingkar' ? '↺ melingkar' : '…'}</span>
        </div>
      )}
    </div>
  )
}

/** Daftar bucket; tiga bucket kosong berurutan atau lebih diringkas menjadi satu baris. */
export function DaftarBucket({ baris, sorotan, instan, kolomPenunjuk, label }: { baris: BarisBucketData[]; sorotan: Sorotan; instan: boolean; kolomPenunjuk: boolean; label: string }) {
  const kosong = (b: BarisBucketData) => b.simpul.length === 0 && b.teks === undefined && b.penunjuk.length === 0 && !sorotan.tulis.has(b.kunci) && !sorotan.baca.has(b.kunci)
  const kelompok: (BarisBucketData | BarisBucketData[])[] = []
  for (const b of baris) {
    const akhir = kelompok[kelompok.length - 1]
    if (kosong(b) && Array.isArray(akhir)) akhir.push(b)
    else kelompok.push(kosong(b) ? [b] : b)
  }
  return (
    <MuatLebar>
      <div role="list" aria-label={label} className="flex flex-col">
        {kelompok.flatMap((k) => {
          if (!Array.isArray(k)) return [<BarisBucket key={k.indeks} b={k} sorotan={sorotan} instan={instan} kolomPenunjuk={kolomPenunjuk} />]
          if (k.length < 3) return k.map((b) => <BarisBucket key={b.indeks} b={b} sorotan={sorotan} instan={instan} kolomPenunjuk={kolomPenunjuk} />)
          return [
            <div key={k[0].indeks} role="listitem" className="flex min-h-8 items-center">
              {kolomPenunjuk && <span className="w-12 shrink-0" />}
              <span className="flex h-8 shrink-0 items-center justify-center rounded-md border-[1.5px] border-dashed border-input px-1.5 font-mono text-[12px] text-muted-foreground">
                [{k[0].indeks}]–[{k[k.length - 1].indeks}]
              </span>
              <span className="ml-2 text-[12px] text-muted-foreground">{k.length} bucket kosong (null)</span>
            </div>,
          ]
        })}
      </div>
    </MuatLebar>
  )
}

export function TabelHashView({
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
  konfig: KonfigTabelHash
  adaDiKode?: boolean
  adaMemori?: boolean
}) {
  const h = useMemo(() => bangunTabelHash(state, konfig), [state, konfig])
  const jangkar = useJangkar(h.ok ? `heap:${h.idObjek}` : `heap:kosong:${konfig.variabel}`)
  if (!h.ok) return <PesanJalur state={state} jalur={konfig.variabel} masalah={h.masalah} adaDiKode={adaDiKode} adaMemori={adaMemori} />
  const tipe = ikutiJalur(state, konfig.variabel).tipe
  const baris: BarisBucketData[] = h.bucket.map((b) => ({
    indeks: b.indeks,
    kunci: b.kunci,
    teks: b.jenis === 'nilai' ? b.teks : undefined,
    ujung: b.ujung,
    penunjuk: b.penunjuk,
    simpul: b.simpul.map((s) => ({
      id: s.id,
      teks: s.teksKunci,
      teks2: s.teksNilai,
      label: s.label,
      sorotUtama: [s.sorotKunci],
      sorotKedua: s.sorotNilai ? [s.sorotNilai] : [],
      sorotBerikut: [s.sorotBerikut],
    })),
  }))
  const terisi = h.bucket.filter((b) => b.jenis !== 'kosong').length
  const ringkasan = `Tabel hash ${konfig.variabel}: ${h.bucket.length} bucket, ${h.jumlahEntri} entri, ${h.tabrakan} tabrakan. ${h.bucket
    .filter((b) => b.jenis !== 'kosong')
    .map((b) => `bucket ${b.indeks}: ${b.jenis === 'nilai' ? b.teks : b.simpul.map((s) => s.teksKunci).join(' → ')}`)
    .join('; ')}`
  return (
    <div ref={jangkar} className="inline-flex max-w-full flex-col gap-2">
      <KepalaVisual>
        <BadgeTipe tipe={tipe} />
        <span className="font-mono font-semibold">{konfig.judul ?? konfig.variabel}</span>
        <span className="text-muted-foreground">
          · {h.bucket.length} bucket, {h.jumlahEntri} entri ({terisi} bucket terisi), {h.tabrakan} tabrakan
        </span>
        <KeteranganPenunjuk nol={h.penunjukNull} />
      </KepalaVisual>
      {h.catatan && <p className="text-[12px] text-muted-foreground">{h.catatan}</p>}
      <DaftarBucket baris={baris} sorotan={sorotan} instan={instan} kolomPenunjuk={(konfig.penunjuk?.length ?? 0) > 0} label={ringkasan} />
    </div>
  )
}
