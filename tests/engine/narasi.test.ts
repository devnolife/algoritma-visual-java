import { describe, expect, it } from 'vitest'
import { kompilasiDanJalankan, PembacaTrace } from '@/engine'
import { narasikan, tahapEvaluasi } from '@/engine/narasi'

const KODE = `public class Main {
    public static void main(String[] args) {
        int[] nilai = {4, 9, 2, 7, 5};
        int maks = nilai[0];              // #awal
        for (int i = 1; i < nilai.length; i++) {
            if (nilai[i] > maks) {    // #banding
                maks = nilai[i];
            }
        }
        System.out.println("Nilai terbesar: " + maks);
    }
}
`

describe('narasi', () => {
  it('menjelaskan setiap langkah program nilai maksimum', () => {
    const h = kompilasiDanJalankan(KODE)
    const t = h.trace!
    const r = new PembacaTrace(t)
    const semua = t.langkah.map((l, i) => {
      const n = narasikan(t, i, r.stateDi(i), { sumber: KODE, penanda: h.penanda, catatan: { banding: 'Catatan banding' } })
      return `${i} [${l.jenis} b${l.baris}] ${n.kalimat.join(' ')}${n.peringatan.length ? ' ⚠ ' + n.peringatan.join(' ') : ''}${n.catatan ? ' 📝 ' + n.catatan.nama : ''}`
    })
    if (process.env.TAMPIL) console.log(semua.join('\n'))
    expect(semua[0]).toContain('Program dimulai')
    expect(semua.some((s) => s.includes('Cek kondisi `nilai[i] > maks` → `9 > 4` bernilai **true**'))).toBe(true)
    expect(semua.some((s) => s.includes('`maks` berubah dari `4` menjadi `9`'))).toBe(true)
    expect(semua.some((s) => s.includes('Inisialisasi perulangan'))).toBe(true)
    expect(semua.some((s) => s.includes('Update perulangan: `i++`'))).toBe(true)
    expect(semua.some((s) => s.includes('📝 banding'))).toBe(true)
    expect(semua.at(-1)).toContain('Program selesai')
  })

  it('tahap evaluasi kondisi majemuk', () => {
    const h = kompilasiDanJalankan(`public class Main { public static void main(String[] args) { int i = 3; int n = 5; int[] a = {1,2,3,7,0}; if (i < n && a[i] != 0) { } } }`)
    const ev = h.trace!.langkah.flatMap((l) => l.peristiwa).find((p) => p.k === 'evaluasi')
    expect(ev && ev.k === 'evaluasi' && tahapEvaluasi(ev.pohon)).toEqual(['i < n && a[i] != 0', '3 < 5 && 7 != 0', 'true && true', 'true'])
  })

  it('jebakan nextLine menyebut method yang benar-benar dipanggil sebelumnya', () => {
    const kode = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        double ipk = in.nextDouble();
        String nama = in.nextLine();
    }
}
`
    const h = kompilasiDanJalankan(kode, { stdin: '3.5\nBudi\n' })
    const t = h.trace!
    const r = new PembacaTrace(t)
    const peringatan = t.langkah.flatMap((_, i) => narasikan(t, i, r.stateDi(i), { sumber: kode }).peringatan)
    expect(peringatan.some((p) => p.includes('`nextDouble()` sebelumnya'))).toBe(true)
    expect(peringatan.some((p) => p.includes('nextInt()'))).toBe(false)
  })

  it('compound assignment menampilkan kode aslinya', () => {
    const kode = `public class Main { public static void main(String[] args) { int[] data = {3, 1}; int jumlah = 0; jumlah += data[1]; } }`
    const h = kompilasiDanJalankan(kode)
    const t = h.trace!
    const r = new PembacaTrace(t)
    const teks = t.langkah.flatMap((_, i) => narasikan(t, i, r.stateDi(i), { sumber: kode }).kalimat)
    expect(teks).toContain('`jumlah += data[1]` berarti `jumlah` = 0 + 1 = `1`.')
  })

  it('overflow dan pembagian bulat dijelaskan', () => {
    const kode = `public class Main { public static void main(String[] args) { int a = 2147483647; a = a + 1; int b = 7 / 2; } }`
    const h = kompilasiDanJalankan(kode)
    const t = h.trace!
    const r = new PembacaTrace(t)
    const teks = t.langkah.map((_, i) => narasikan(t, i, r.stateDi(i), { sumber: kode })).flatMap((n) => [...n.kalimat, ...n.peringatan])
    expect(teks.some((s) => s.startsWith('Overflow!'))).toBe(true)
  })
})
