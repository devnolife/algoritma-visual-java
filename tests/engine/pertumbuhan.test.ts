import { describe, expect, it } from 'vitest'
import { jalankan, kompilasi } from '@/engine'
import { kalimatKesimpulan, klasifikasi, fungsiKelas, KELAS_KOMPLEKSITAS, type KonfigPertumbuhan } from '@/engine/pertumbuhan'
import { ukurPertumbuhan } from '@/engine/ukurPertumbuhan'

const kode = (isi: string, lain = '') => `import java.util.Scanner;\npublic class Main {\n${lain}\n    public static void main(String[] args) {\n${isi}\n    }\n}\n`

function k(teks: string) {
  const h = kompilasi(teks)
  if (!h.ok) throw new Error(h.diagnostik.map((d) => `${d.baris}: ${d.pesan}`).join('\n'))
  return h
}

const BUBBLE = kode(
  `        int n = 8;
        boolean terurut = false;
        int[] data = new int[n];
        for (int i = 0; i < n; i++) data[i] = terurut ? i : (i * 37 + 11) % n;
        int perbandingan = 0;
        for (int i = 0; i < n - 1; i++) {
            boolean tukar = false;
            for (int j = 0; j < n - 1 - i; j++) {
                perbandingan++;
                if (data[j] > data[j + 1]) {
                    int t = data[j]; data[j] = data[j + 1]; data[j + 1] = t;
                    tukar = true;
                }
            }
            if (!tukar) break;
        }
        System.out.println(perbandingan);`,
)

describe('opsi ganti', () => {
  it('mengganti nilai awal variabel main tanpa mengevaluasi initializer', () => {
    const h = k(kode('        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        String s = sc.next();\n        System.out.println(n + " " + s);'))
    const t = jalankan(h, { stdin: '5 lima', ganti: { n: 42 } })
    expect(t.output).toBe('42 5\n')
    expect(t.gantiDipakai).toEqual(['n'])
  })

  it('hanya berlaku di frame main dan hanya untuk deklarasi pertama', () => {
    const h = k(kode('        int n = 1;\n        System.out.println(f(3) + n);\n        { }', '    static int f(int x) { int n = x * 2; return n; }'))
    expect(jalankan(h, { ganti: { n: 100 } }).output).toBe('106\n')
  })

  it('menolak nilai yang tidak cocok dengan tipe', () => {
    const h = k(kode('        boolean terurut = false;\n        System.out.println(terurut);'))
    expect(() => jalankan(h, { ganti: { terurut: 3 } })).toThrow(/tidak cocok untuk variabel terurut bertipe boolean/)
    expect(jalankan(h, { ganti: { terurut: true } }).output).toBe('true\n')
  })
})

describe('mode hitung', () => {
  it('menghitung langkah yang sama tanpa merekam langkah, checkpoint, atau output', () => {
    const h = k(BUBBLE)
    const biasa = jalankan(h)
    const hitung = jalankan(h, { modeHitung: true })
    expect(hitung.langkah).toHaveLength(0)
    expect(hitung.checkpoint).toHaveLength(0)
    expect(hitung.output).toBe('')
    expect(hitung.jumlahLangkah).toBe(biasa.langkah.length)
    expect(hitung.akhirMain.perbandingan.nilai).toBe(biasa.akhirMain.perbandingan.nilai)
  })

  it('ukurMethod menghitung langkah selama method berjalan, termasuk panggilan di dalamnya', () => {
    const h = k(kode('        System.out.println(f(4));', '    static int f(int n) { return n == 0 ? 0 : 1 + g(n - 1); }\n    static int g(int n) { return f(n); }'))
    const t = jalankan(h, { ukurMethod: 'g' })
    const total = t.langkah.length
    expect(t.langkahUkur).toBeGreaterThan(0)
    expect(t.langkahUkur).toBeLessThan(total)
  })

  it('cukup cepat untuk ratusan ribu langkah', () => {
    const h = k(BUBBLE)
    const mulai = performance.now()
    const t = jalankan(h, { modeHitung: true, ganti: { n: 256 }, batasLangkah: 2_000_000 })
    const durasi = performance.now() - mulai
    expect(t.status).toBe('selesai')
    expect(t.jumlahLangkah).toBeGreaterThan(100_000)
    expect(durasi).toBeLessThan(1_500)
  })
})

describe('klasifikasi', () => {
  const ukuran = [8, 16, 32, 64, 128]
  const data = (f: (n: number) => number) => ukuran.map((n) => ({ n, nilai: f(n) }))

  it('mengenali setiap kelas dari data murni', () => {
    for (const kelas of KELAS_KOMPLEKSITAS) {
      const ns = kelas === '2^n' ? [4, 6, 8, 10, 12] : ukuran
      expect(klasifikasi(ns.map((n) => ({ n, nilai: 3 * fungsiKelas(kelas, n) })))?.kelas, kelas).toBe(kelas)
    }
  })

  it('tahan terhadap suku orde rendah', () => {
    expect(klasifikasi(data((n) => 2 * n * n + 30 * n + 50))?.kelas).toBe('n^2')
    expect(klasifikasi(data((n) => 4 * n * Math.log2(n) + 10 * n + 20))?.kelas).toBe('n log n')
    expect(klasifikasi(data((n) => 6 * Math.log2(n) + 4))?.kelas).toBe('log n')
    expect(klasifikasi(data((n) => 5 * n + 40))?.kelas).toBe('n')
    expect(klasifikasi(data(() => 12))?.kelas).toBe('1')
  })

  it('mengabaikan titik yang gagal dan butuh minimal dua titik', () => {
    expect(klasifikasi([{ n: 8, nilai: 64 }])).toBeNull()
    expect(klasifikasi([{ n: 8, nilai: 64 }, { n: 16, nilai: null }, { n: 32, nilai: 1024 }])?.kelas).toBe('n^2')
  })

  it('menyusun kalimat kesimpulan', () => {
    const kl = klasifikasi(data((n) => n * n))!
    expect(kalimatKesimpulan(kl, 'langkah')).toBe('Saat n naik dari 64 ke 128 (2×), jumlah langkah naik 4×. Pola ini paling mirip **O(n²)**.')
  })
})

describe('ukurPertumbuhan', () => {
  const konfig: KonfigPertumbuhan = {
    variabel: 'n',
    nilai: [8, 16, 32, 64, 128],
    ukur: 'perbandingan',
    seri: [
      { nama: 'data acak', ganti: {} },
      { nama: 'data terurut', ganti: { terurut: true } },
    ],
  }

  it('bubble sort: n² untuk data acak, n untuk data terurut (berhenti dini)', () => {
    const hasil = ukurPertumbuhan(k(BUBBLE), konfig)
    expect(hasil.galat).toBeUndefined()
    expect(hasil.seri.map((s) => s.kelas)).toEqual(['n^2', 'n'])
    expect(hasil.seri[1].titik.map((t) => t.nilai)).toEqual([7, 15, 31, 63, 127])
  })

  it('ukur langkah total dan method', () => {
    const hasil = ukurPertumbuhan(k(BUBBLE), { ...konfig, ukur: 'langkah', seri: [{ nama: 'p', ganti: {} }] })
    expect(hasil.seri[0].kelas).toBe('n^2')
    expect(hasil.seri[0].titik.every((t) => t.status === 'ok' && t.nilai! > 0)).toBe(true)
  })

  it('melaporkan variabel ukuran atau penghitung yang tidak ada', () => {
    expect(ukurPertumbuhan(k(BUBBLE), { ...konfig, variabel: 'ukuran' }).galat).toMatch(/`ukuran` tidak ditemukan/)
    expect(ukurPertumbuhan(k(BUBBLE), { ...konfig, ukur: 'hitungan' }).galat).toMatch(/penghitung `hitungan` tidak ditemukan/)
  })

  it('menandai ukuran yang menabrak batas langkah', () => {
    const hasil = ukurPertumbuhan(k(BUBBLE), { ...konfig, ukur: 'langkah', seri: [{ nama: 'p', ganti: {} }] }, { batasLangkah: 20_000 })
    const status = hasil.seri[0].titik.map((t) => t.status)
    expect(status.slice(0, 3)).toEqual(['ok', 'ok', 'ok'])
    expect(status.at(-1)).toBe('batas')
  })
})
