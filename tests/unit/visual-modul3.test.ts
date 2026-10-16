import { describe, expect, it } from 'vitest'
import { jalankan, kompilasi } from '@/engine'
import { sisiDariMatriks } from '@/viz/dataGraf'
import { bangunPohonPanggilan } from '@/viz/dataPohon'

function trace(kode: string) {
  const k = kompilasi(kode)
  if (!k.ok) throw new Error(k.diagnostik.map((d) => d.pesan).join('\n'))
  return jalankan(k)
}

const FIB = `public class Main {
    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
    public static void main(String[] args) {
        System.out.println(fib(4));
    }
}`

describe('bangunPohonPanggilan', () => {
  it('mencatat semua panggilan fib(4) beserta induk dan nilai kembalinya', () => {
    const t = trace(FIB)
    const pohon = bangunPohonPanggilan(t)
    expect(pohon).toHaveLength(9)
    expect(pohon.map((s) => `${s.method}(${s.argumen.join(',')})`).slice(0, 5)).toEqual(['fib(4)', 'fib(3)', 'fib(2)', 'fib(1)', 'fib(0)'])
    const akar = pohon[0]
    expect(akar.induk).toBeNull()
    expect(akar.nilai).toBe('3')
    expect(pohon.filter((s) => s.induk === akar.id).map((s) => s.argumen[0])).toEqual(['3', '2'])
    // Urutan waktu: kembali sebelum frame dibuang, dan semuanya sesudah dipanggil.
    for (const s of pohon) {
      expect(s.kembali!).toBeGreaterThan(s.mulai)
      expect(s.selesai!).toBeGreaterThan(s.kembali!)
    }
  })

  it('filter method melewati method lain dan menyambungkan ke leluhur terdekat', () => {
    const t = trace(`public class Main {
    static void cetak(int x) { System.out.println(x); }
    static void turun(int n) {
        if (n == 0) return;
        cetak(n);
        turun(n - 1);
    }
    public static void main(String[] args) {
        turun(3);
    }
}`)
    const pohon = bangunPohonPanggilan(t, 'turun')
    expect(pohon.map((s) => s.argumen[0])).toEqual(['3', '2', '1', '0'])
    expect(pohon[1].induk).toBe(pohon[0].id)
    expect(bangunPohonPanggilan(t).some((s) => s.method === 'cetak')).toBe(true)
  })

  it('meringkas argumen array dan String panjang', () => {
    const t = trace(`public class Main {
    static int jumlah(int[] a, String label) { return a.length; }
    public static void main(String[] args) {
        int[] data = {1, 2, 3};
        System.out.println(jumlah(data, "label yang sangat panjang"));
    }
}`)
    expect(bangunPohonPanggilan(t)[0].argumen).toEqual(['[…]', '"label yan…"'])
  })
})

describe('sisiDariMatriks', () => {
  it('mengenali graf tak berarah tanpa bobot', () => {
    const { sisi, berbobot, simetris } = sisiDariMatriks(
      [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ],
      'int',
    )
    expect(simetris).toBe(true)
    expect(berbobot).toBe(false)
    expect(sisi).toHaveLength(4)
  })

  it('mengenali graf berarah berbobot dan mengabaikan nilai tak hingga', () => {
    const INF = 2147483647
    const { sisi, berbobot, simetris } = sisiDariMatriks(
      [
        [0, 4, INF],
        [INF, 0, 7],
        [2, INF, 0],
      ],
      'int',
    )
    expect(simetris).toBe(false)
    expect(berbobot).toBe(true)
    expect(sisi.map((s) => `${s.dari}->${s.ke}:${s.bobot}`)).toEqual(['0->1:4', '1->2:7', '2->0:2'])
  })

  it('mendukung matriks boolean dan nilai "kosong" khusus', () => {
    expect(sisiDariMatriks([[false, true], [true, false]], 'boolean').sisi).toHaveLength(2)
    expect(sisiDariMatriks([[-1, 5], [5, -1]], 'int', -1).sisi).toHaveLength(2)
  })
})
