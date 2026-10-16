import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LemparanJava } from '@/engine/nilai'
import { urutkan } from '@/engine/pustaka/koleksi'
import { HeapUji, OpsUji } from './heapUji'
import { buatAcak, buatMasukan, KASUS_URUT, type KasusUrut } from './skenario'

/**
 * TimSort/ComparableTimSort terhadap JDK 21: urutan & argumen setiap perbandingan (hash seluruh deret,
 * deret lengkap untuk kasus kecil), hasil akhir (stabil), dan galat untuk pembanding tak konsisten.
 */
interface HasilJdk {
  hashMasukan: number
  jumlah: number
  hash: number
  hashHasil: number
  banding?: number[]
  hasil?: number[]
  galat?: { kelas: string; pesan: string | null }
}

const fixture = JSON.parse(readFileSync(new URL('./fixture/urut.json', import.meta.url), 'utf8')) as {
  jdk: string
  kasus: (KasusUrut & HasilJdk)[]
}

const hash31 = (h: number, x: number) => (Math.imul(31, h) + x) | 0

function urutkanModel(k: KasusUrut): HasilJdk {
  const nilai = buatMasukan(k.pola, k.n, k.benih)
  const h = new HeapUji()
  const ops = new OpsUji(h)
  const a = h.baruArray('Object', k.n)
  nilai.forEach((v, i) => h.tulisElemen(a, i, h.s(v, i)))

  let jumlah = 0
  let hash = 0
  const banding: number[] = []
  ops.rekam = (x, y) => {
    jumlah++
    hash = hash31(hash31(hash, x), y)
    if (banding.length < 400) banding.push(x, y)
  }
  ops.acak = buatAcak(k.benihKacau)
  const pembanding = k.mode === 'alami' ? null : h.pembanding(k.mode === 'kacau' ? 'kacau' : 'urut')

  let galat: HasilJdk['galat']
  try {
    urutkan(h, ops, a, k.dari, k.sampai, pembanding)
  } catch (e) {
    if (!(e instanceof LemparanJava)) throw e
    galat = { kelas: e.kelas, pesan: e.pesanJava }
  }

  const urutan: number[] = []
  for (let i = 0; i < k.n; i++) urutan.push(h.boks(h.bacaElemen(a, i))?.seri ?? -1)
  const hasil: HasilJdk = {
    hashMasukan: nilai.reduce(hash31, 0),
    jumlah,
    hash,
    hashHasil: urutan.reduce(hash31, 0),
  }
  if (jumlah <= 200) hasil.banding = banding
  if (k.n <= 64) hasil.hasil = urutan
  if (galat) hasil.galat = galat
  return hasil
}

describe(`TimSort identik JDK ${fixture.jdk}`, () => {
  it('fixture mencakup semua kasus', () => {
    expect(fixture.kasus.length).toBe(KASUS_URUT.length)
  })

  it.each(
    fixture.kasus.map((k, i) => [`${i} ${k.mode} ${k.pola} n=${k.n} [${k.dari}, ${k.sampai})`, k] as const),
  )('%s', (_, k) => {
    const { mode, pola, n, benih, dari, sampai, benihKacau, ...harapan } = k
    expect(urutkanModel({ mode, pola, n, benih, dari, sampai, benihKacau })).toEqual(harapan)
  })
})
