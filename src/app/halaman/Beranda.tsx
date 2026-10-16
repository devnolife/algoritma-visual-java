import { ArrowRight, Check, FlaskConical } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { DAFTAR_MODUL } from '@/lessons/muat'
import { cn } from '@/lib/utils'
import { Kepala } from '../komponen/Kepala'
import { useProgres } from '../progres'

/** Modul yang belum ada di folder content/. Otomatis hilang begitu modul dengan urutan yang sama ditambahkan. */
const SEGERA = [
  { urutan: 2, judul: 'Struktur Data', ringkasan: 'ArrayList, linked list, stack, queue, hash map, pohon, heap, dan graf.' },
  { urutan: 3, judul: 'Strategi Algoritma', ringkasan: 'Kompleksitas, searching & sorting, divide & conquer, greedy, dynamic programming, backtracking.' },
]

/** Modul yang tersedia dan modul yang segera hadir, diurutkan menurut nomor modul. */
const PETA = [
  ...DAFTAR_MODUL.map((modul) => ({ urutan: modul.meta.urutan, modul })),
  ...SEGERA.filter((s) => !DAFTAR_MODUL.some((m) => m.meta.urutan === s.urutan)).map((segera) => ({ urutan: segera.urutan, segera })),
].sort((a, b) => a.urutan - b.urutan)

/** Ilustrasi kecil: satu baris kode dan kotak variabelnya di memori. */
function Ilustrasi() {
  return (
    <div className="relative w-full max-w-[420px]" aria-hidden="true">
      <div className="rotate-[-1.2deg] rounded-xl border bg-card p-4 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
        <div className="mb-3 flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground">Main.java</span>
          <span>· langkah 3 dari 8</span>
        </div>
        <pre className="font-mono text-[13.5px] leading-[1.9]">
          <span className="text-muted-foreground"> 3 </span>
          <span className="font-semibold text-tipe-int">int</span> umur = <span className="text-[var(--kode-angka)]">19</span>;{'\n'}
          <span className="-mx-4 block bg-baris-aktif px-4">
            <span className="text-banding-teks">▶</span>
            <span className="text-muted-foreground">4 </span>
            umur = umur + <span className="text-[var(--kode-angka)]">1</span>;
          </span>
          <span className="text-muted-foreground"> 5 </span>
          <span className="font-semibold text-tipe-pecahan">double</span> ipk = <span className="text-[var(--kode-angka)]">3.75</span>;
        </pre>
      </div>
      <div className="kertas-petak absolute -bottom-12 -right-4 flex rotate-[1.5deg] gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold">
            <span className="rounded-[5px] bg-tipe-int/10 px-1.5 text-[10.5px] text-tipe-int">int</span>umur
          </span>
          <span className="flex h-10 min-w-20 items-center justify-center rounded-lg border-[1.5px] border-tulis bg-tulis-lembut font-mono text-lg font-semibold">20</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold">
            <span className="rounded-[5px] bg-tipe-pecahan/10 px-1.5 text-[10.5px] text-tipe-pecahan">double</span>ipk
          </span>
          <span className="flex h-10 min-w-20 items-center justify-center rounded-lg border-[1.5px] border-dashed border-input font-mono text-lg text-muted-foreground">?</span>
        </div>
      </div>
    </div>
  )
}

export function Beranda() {
  const dibuka = useProgres((s) => s.dibuka)
  const lulus = useProgres((s) => s.lulus)
  useEffect(() => {
    document.title = 'Algoritma & Pemrograman · Java'
  }, [])
  const modul1 = DAFTAR_MODUL[0]

  return (
    <div className="flex min-h-dvh flex-col">
      <Kepala />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-20 px-10 pb-20 pt-16">
        <section className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-12">
          <div className="flex flex-col gap-6">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">Belajar dengan melihat kode berjalan</p>
            <h1 className="text-[52px] leading-[1.05]" style={{ fontVariationSettings: "'opsz' 96" }}>
              Algoritma &amp; pemrograman, <em className="font-normal">langkah demi langkah.</em>
            </h1>
            <p className="max-w-[54ch] text-[17px] leading-relaxed text-muted-foreground">
              Tulis atau ubah kode Java, lalu geser slider untuk melihat isi memori, percabangan, dan perulangan bekerja—satu langkah setiap kali.
              Salah tipe? Kamu langsung mendapat pesan error ala <code className="kode-sebaris">javac</code> beserta penjelasannya.
            </p>
            <div className="flex items-center gap-3">
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
                  Buka Ruang Coba
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center pb-12">
            <Ilustrasi />
          </div>
        </section>

        <section aria-labelledby="judul-peta" className="flex flex-col gap-5">
          <h2 id="judul-peta" className="text-[28px]">
            Peta belajar
          </h2>
          <ol className="flex flex-col border-t">
            {PETA.map((e) => {
              if (!('modul' in e)) {
                const s = e.segera
                return (
                  <li key={`segera-${s.urutan}`} className="grid grid-cols-[72px_minmax(0,1fr)_200px_24px] items-center gap-6 border-b py-6">
                    <span className="font-heading text-[40px] leading-none text-muted-foreground">{String(s.urutan).padStart(2, '0')}</span>
                    <span className="flex flex-col gap-1">
                      <span className="font-heading text-[22px] leading-tight text-muted-foreground">{s.judul}</span>
                      <span className="text-[15px] text-muted-foreground">{s.ringkasan}</span>
                    </span>
                    <span className="w-fit rounded-full border border-dashed px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Segera hadir
                    </span>
                    <span />
                  </li>
                )
              }
              const m = e.modul
              const total = m.pelajaran.length
              const sudah = m.pelajaran.filter((p) => dibuka[p.kunci]).length
              const tantanganTotal = m.pelajaran.reduce((n, p) => n + p.tantangan.length, 0)
              const tantanganLulus = m.pelajaran.reduce((n, p) => n + (lulus[p.kunci]?.length ?? 0), 0)
              return (
                <li key={m.slug} className="border-b">
                  <Link
                    to={`/modul/${m.slug}`}
                    className="group grid grid-cols-[72px_minmax(0,1fr)_200px_24px] items-center gap-6 py-6 outline-none focus-visible:bg-secondary/60"
                  >
                    <span className="font-heading text-[40px] leading-none text-muted-foreground">{String(m.meta.urutan).padStart(2, '0')}</span>
                    <span className="flex flex-col gap-1">
                      <span className="font-heading text-[22px] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                        {m.meta.judul}
                      </span>
                      <span className="text-[15px] text-muted-foreground">{m.meta.ringkasan}</span>
                    </span>
                    <span className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
                      <span>
                        {sudah}/{total} pelajaran dibuka · {tantanganLulus}/{tantanganTotal} tantangan
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${total ? sudah / total : 0})` }} />
                      </span>
                    </span>
                    <ArrowRight className="size-5 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="grid grid-cols-3 gap-8 border-t pt-10 text-[15px]">
          {[
            ['Strong typing yang terlihat', 'Setiap variabel tampil sebagai kotak bertipe. Warna tipenya sama dengan di kode, jadi int, double, char, dan String mudah dibedakan.'],
            ['Ubah kode, animasi ikut berubah', 'Hapus atau ganti satu baris. Program dijalankan ulang otomatis dan langkah-langkahnya langsung menyesuaikan.'],
            ['Tanpa instalasi', 'Kode Java dijalankan oleh simulator langsung di browser. Progres dan kode tersimpan otomatis di perangkatmu.'],
          ].map(([judul, isi]) => (
            <div key={judul} className="flex flex-col gap-2">
              <span className="flex items-center gap-2 font-semibold">
                <Check className="size-4 text-tulis" aria-hidden="true" />
                {judul}
              </span>
              <p className={cn('leading-relaxed text-muted-foreground')}>{isi}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
