import { jalankan, type HasilKompilasi } from './index'
import { klasifikasi, type HasilPertumbuhan, type KonfigPertumbuhan, type SeriPertumbuhan, type TitikPertumbuhan } from './pertumbuhan'
import { GalatGanti } from './runtime/interpreter'
import type { Trace } from './trace'

export interface OpsiUkur {
  stdin?: string
  seed?: number
  /** Batas langkah untuk setiap run. */
  batasLangkah?: number
  /** Total waktu maksimum; ukuran yang belum sempat dijalankan ditandai `waktu`. */
  anggaranMs?: number
}

const sekarang = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

function nilaiUkuran(trace: Trace, ukur: string): number | undefined {
  if (ukur === 'langkah') return trace.jumlahLangkah ?? trace.langkah.length
  if (ukur.startsWith('method:')) return trace.langkahUkur
  const v = trace.akhirMain[ukur] ?? trace.akhirStatik?.[ukur]
  return typeof v?.nilai === 'number' ? v.nilai : undefined
}

/** Jalankan program yang sudah dikompilasi untuk setiap ukuran n (mode hitung, tanpa rekaman langkah). */
export function ukurPertumbuhan(k: HasilKompilasi, konfig: KonfigPertumbuhan, opsi: OpsiUkur = {}): HasilPertumbuhan {
  const mulai = sekarang()
  const anggaran = opsi.anggaranMs ?? 2_000
  const ukuran = [...new Set(konfig.nilai)].sort((a, b) => a - b)
  const ukurMethod = konfig.ukur.startsWith('method:') ? konfig.ukur.slice(7) : undefined
  const seri: SeriPertumbuhan[] = []
  for (const s of konfig.seri) {
    const titik: TitikPertumbuhan[] = []
    let berhenti: TitikPertumbuhan['status'] | null = null
    for (const n of ukuran) {
      if (berhenti) {
        titik.push({ n, nilai: null, status: berhenti })
        continue
      }
      if (sekarang() - mulai > anggaran) {
        berhenti = 'waktu'
        titik.push({ n, nilai: null, status: 'waktu' })
        continue
      }
      const ganti = { ...s.ganti, [konfig.variabel]: n }
      let trace: Trace
      try {
        trace = jalankan(k, { stdin: opsi.stdin, seed: opsi.seed, batasLangkah: opsi.batasLangkah ?? 1_000_000, modeHitung: true, ganti, ukurMethod })
      } catch (e) {
        if (e instanceof GalatGanti) return { seri: [], galat: e.message }
        throw e
      }
      const tidakDipakai = Object.keys(ganti).find((nama) => !trace.gantiDipakai?.includes(nama))
      if (tidakDipakai) {
        return {
          seri: [],
          galat: `Variabel \`${tidakDipakai}\` tidak ditemukan sebagai variabel lokal di \`main\`, jadi ukurannya tidak bisa diubah. Grafik ini butuh deklarasi seperti \`int ${tidakDipakai} = 8;\`.`,
        }
      }
      if (trace.status === 'batas-langkah') {
        berhenti = 'batas'
        titik.push({ n, nilai: null, status: 'batas', pesan: trace.pesanSimulator })
        continue
      }
      if (trace.status === 'exception') {
        titik.push({ n, nilai: null, status: 'exception', pesan: `${trace.exception?.kelas.split('.').pop()} di baris ${trace.exception?.baris}` })
        continue
      }
      if (trace.status !== 'selesai' && trace.status !== 'keluar') {
        titik.push({ n, nilai: null, status: 'galat', pesan: trace.pesanSimulator })
        continue
      }
      const nilai = nilaiUkuran(trace, konfig.ukur)
      if (nilai === undefined) {
        return {
          seri: [],
          galat: `Variabel penghitung \`${konfig.ukur}\` tidak ditemukan sebagai variabel lokal \`main\` maupun field static bertipe angka.`,
        }
      }
      titik.push({ n, nilai, status: 'ok' })
    }
    seri.push({ nama: s.nama, titik, kelas: klasifikasi(titik)?.kelas })
  }
  return { seri }
}
