import { describe, expect, it } from 'vitest'
import { kompilasiDanJalankan } from '@/engine'
import { visualOtomatis } from '@/viz/otomatis'

const trace = (badan: string, lain = '') =>
  kompilasiDanJalankan(`public class Main {\n${lain}    public static void main(String[] args) {\n${badan}\n    }\n}\n`).trace!

describe('visualOtomatis (Ruang Coba)', () => {
  it('tanpa array: evaluasi, memori, konsol', () => {
    expect(visualOtomatis(trace('int x = 1;')).map((k) => k.jenis)).toEqual(['evaluasi', 'memori', 'konsol'])
    expect(visualOtomatis(null).map((k) => k.jenis)).toEqual(['evaluasi', 'memori', 'konsol'])
  })

  it('array 1D di main tampil dengan penunjuk indeks, array 2D dengan baris/kolom', () => {
    const t = trace('int[] data = {3, 1};\nint[][] m = new int[2][2];\nfor (int i = 0; i < 2; i++) {\n    for (int j = 0; j < 2; j++) m[i][j] = data[i];\n}\nint jumlah = 0;')
    expect(visualOtomatis(t).slice(0, 2)).toEqual([
      { jenis: 'array2d', variabel: 'm', baris: 'i', kolom: 'j' },
      { jenis: 'array', variabel: 'data', penunjuk: ['i', 'j'] },
    ])
  })

  it('array parameter method lain tidak ditambahkan, tetapi indeksnya ikut menjadi penunjuk', () => {
    const t = trace(
      'int[] nilai = {5, 2, 9};\nurutkan(nilai);',
      '    static void urutkan(int[] arr) {\n        for (int k = 0; k < arr.length; k++) { }\n    }\n',
    )
    expect(visualOtomatis(t)[0]).toEqual({ jenis: 'array', variabel: 'nilai', penunjuk: ['k'] })
    expect(visualOtomatis(t).filter((k) => k.jenis === 'array')).toHaveLength(1)
  })

  it('paling banyak dua array', () => {
    const t = trace('int[] a = {1};\nint[] b = {2};\nint[] c = {3};')
    expect(visualOtomatis(t).filter((k) => k.jenis === 'array').map((k) => (k as { variabel: string }).variabel)).toEqual(['a', 'b'])
  })
})
