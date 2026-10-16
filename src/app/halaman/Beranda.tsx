import { ArrowRight, FlaskConical } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { DAFTAR_MODUL } from '@/lessons/muat'
import type { Modul } from '@/lessons/urai'
import { KerangkaDemo, KerangkaGalat } from '../komponen/BingkaiDemo'
import { Kepala } from '../komponen/Kepala'
import { useProgres } from '../progres'

// Demo memakai mesin Java Mini dan renderer pemutar; dimuat terpisah agar teks hero tampil lebih dulu.
const DemoLangkah = lazy(() => import('../komponen/DemoLangkah').then((m) => ({ default: m.DemoLangkah })))
const ContohGalat = lazy(() => import('../komponen/ContohGalat').then((m) => ({ default: m.ContohGalat })))

/** Modul yang belum ada di folder content/. Otomatis hilang begitu modul dengan urutan yang sama ditambahkan. */
const SEGERA = [
  { urutan: 2, judul: 'Modul 2: Struktur Data', ringkasan: 'Class dan objek, exception, ArrayList, linked list, stack, queue, hash map, pohon, heap, dan graf.' },
  { urutan: 3, judul: 'Modul 3: Strategi Algoritma', ringkasan: 'Kompleksitas, searching dan sorting, divide and conquer, greedy, dynamic programming, backtracking.' },
]

/** Modul yang tersedia dan modul yang segera hadir, diurutkan menurut nomor modul. */
const PETA = [
  ...DAFTAR_MODUL.map((modul) => ({ urutan: modul.meta.urutan, modul })),
  ...SEGERA.filter((s) => !DAFTAR_MODUL.some((m) => m.meta.urutan === s.urutan)).map((segera) => ({ urutan: segera.urutan, segera })),
].sort((a, b) => a.urutan - b.urutan)

/** Jumlah judul pelajaran yang ditampilkan sebagai gambaran isi modul. */
const TOPIK_DITAMPILKAN = 6

const WADAH = 'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10'

function BarisModul({ modul }: { modul: Modul }) {
  const dibuka = useProgres((s) => s.dibuka)
  const lulus = useProgres((s) => s.lulus)
  const total = modul.pelajaran.length
  const sudah = modul.pelajaran.filter((p) => dibuka[p.kunci]).length
  const tantanganTotal = modul.pelajaran.reduce((n, p) => n + p.tantangan.length, 0)
  const tantanganLulus = modul.pelajaran.reduce((n, p) => n + (lulus[p.kunci]?.length ?? 0), 0)
  const topik = modul.pelajaran.slice(0, TOPIK_DITAMPILKAN)
  const sisa = total - topik.length
  return (
    <li className="group relative grid gap-x-12 gap-y-4 rounded-xl border bg-card/50 px-5 py-6 transition-[background-color,border-color] duration-200 hover:border-foreground/25 hover:bg-card has-[a:focus-visible]:border-ring has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/40 md:grid-cols-[minmax(0,1fr)_auto] md:px-7">
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-[21px] leading-snug md:text-[23px]">
          <Link to={`/modul/${modul.slug}`} className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-xl">
            {modul.meta.judul}
          </Link>
        </h3>
        <p className="max-w-[64ch] text-[15.5px] leading-relaxed text-muted-foreground">{modul.meta.ringkasan}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Sebagian pelajaran di ${modul.meta.judul}`}>
          {topik.map((p) => (
            <li key={p.kunci} className="rounded-md border bg-background px-2 py-0.5 text-[13px]">
              {p.meta.judul}
            </li>
          ))}
          {sisa > 0 && <li className="px-1 py-0.5 text-[13px] text-muted-foreground">dan {sisa} lainnya</li>}
        </ul>
      </div>
      <div className="flex items-end justify-between gap-6 text-[14px] text-muted-foreground md:flex-col md:items-end md:justify-between md:text-right">
        <p className="flex flex-col gap-1">
          <span>
            {total} pelajaran · {tantanganTotal} tantangan
          </span>
          {(sudah > 0 || tantanganLulus > 0) && (
            <span className="text-foreground">
              Kemajuanmu: {sudah} dibuka, {tantanganLulus} tantangan lulus
            </span>
          )}
        </p>
        <ArrowRight className="size-5 shrink-0 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
      </div>
    </li>
  )
}

export function Beranda() {
  useEffect(() => {
    document.title = 'Algoritma & Pemrograman · Java'
  }, [])
  const modul1 = DAFTAR_MODUL[0]

  return (
    <div className="flex min-h-dvh flex-col">
      <Kepala />
      <main className="flex-1">
        <section className={`${WADAH} grid items-center gap-10 pb-16 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14 lg:pb-20 lg:pt-6`}>
          <div className="flex flex-col gap-6">
            <h1 className="muncul text-[34px] leading-[1.1] tracking-[-0.025em] sm:text-[40px]">Algoritma &amp; pemrograman, langkah demi langkah.</h1>
            <p className="muncul max-w-[44ch] text-[17px] leading-relaxed text-muted-foreground [animation-delay:70ms]">
              Tulis atau ubah kode Java, lalu geser slider untuk melihat isi memori berubah di setiap langkah.
            </p>
            <div className="muncul flex flex-wrap items-center gap-3 [animation-delay:140ms]">
              {modul1 && modul1.pelajaran[0] && (
                <Button size="lg" asChild>
                  <Link to={`/modul/${modul1.slug}`}>
                    Mulai {modul1.meta.judul.split(':')[0]}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link to="/ruang-coba">
                  <FlaskConical data-icon="inline-start" />
                  Ruang Coba
                </Link>
              </Button>
            </div>
          </div>
          <div className="muncul min-w-0 [animation-delay:200ms]">
            <Suspense fallback={<KerangkaDemo />}>
              <DemoLangkah />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="judul-peta" className={`${WADAH} flex flex-col gap-6 pb-20`}>
          <h2 id="judul-peta" className="text-[28px] tracking-[-0.02em] md:text-[32px]">
            Peta belajar
          </h2>
          <ol className="flex flex-col gap-3">
            {PETA.map((e) =>
              'modul' in e ? (
                <BarisModul key={e.modul.slug} modul={e.modul} />
              ) : (
                <li
                  key={`segera-${e.segera.urutan}`}
                  className="grid gap-x-12 gap-y-3 rounded-xl border border-dashed px-5 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:px-7"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[21px] leading-snug text-muted-foreground md:text-[23px]">{e.segera.judul}</h3>
                    <p className="max-w-[64ch] text-[15.5px] leading-relaxed text-muted-foreground">{e.segera.ringkasan}</p>
                  </div>
                  <span className="text-[14px] font-semibold text-muted-foreground">Segera hadir</span>
                </li>
              ),
            )}
          </ol>
        </section>

        <section aria-labelledby="judul-galat" className="border-y bg-card/40">
          <div className={`${WADAH} flex flex-col gap-8 py-16 lg:py-20`}>
            <div className="flex max-w-[60ch] flex-col gap-3">
              <h2 id="judul-galat" className="text-[28px] tracking-[-0.02em] md:text-[32px]">
                Pesan error persis seperti javac
              </h2>
              <p className="text-[16.5px] leading-relaxed text-muted-foreground">
                Setiap error dilengkapi penjelasan dan saran perbaikan dalam Bahasa Indonesia, jadi kamu tahu bagian mana yang perlu diubah.
              </p>
            </div>
            <Suspense fallback={<KerangkaGalat />}>
              <ContohGalat />
            </Suspense>
          </div>
        </section>
      </main>

      <footer className={`${WADAH} flex flex-col gap-1.5 py-8 text-[14px] text-muted-foreground md:flex-row md:items-center md:justify-between`}>
        <span className="font-semibold text-foreground">Algoritma &amp; Pemrograman · Java</span>
        <span>Kode Java dijalankan langsung di browser. Kode dan progresmu tersimpan di perangkat ini.</span>
      </footer>
    </div>
  )
}
