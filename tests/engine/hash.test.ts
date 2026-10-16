import { describe, expect, it } from 'vitest'
import { AcakJava, gabungHash, hashBoolean, hashDouble, hashFloat, hashLong, hashString } from '@/engine/pustaka/hash'

// Nilai acuan dari JDK 21 (javac/java asli).
describe('hash ala JDK', () => {
  it('String.hashCode', () => {
    expect(['', 'a', 'Aa', 'BB', 'Budi', 'algoritma', 'Struktur Data 2026', '\u00e9\u4e2d'].map(hashString)).toEqual([
      0, 97, 2112, 2112, 2081848, 225490174, 16555842, 27236,
    ])
  })

  it('Long, Double, Float, Boolean', () => {
    expect([0n, 1n, -1n, 123456789012345n, -(2n ** 63n), 2n ** 63n - 1n].map(hashLong)).toEqual([0, 1, 0, -2045923535, -2147483648, -2147483648])
    expect([0, -0, 1.5, 3.14159, NaN, Infinity, 1e-300].map(hashDouble)).toEqual([0, -2147483648, 1073217536, -1340954729, 2146959360, 2146435072, -1017275066])
    expect([0, -0, 2.5, NaN].map(hashFloat)).toEqual([0, -2147483648, 1075838976, 2143289344])
    expect([hashBoolean(true), hashBoolean(false)]).toEqual([1231, 1237])
  })

  it('gabungHash seperti List.hashCode', () => {
    // List.of(1, 2, 3).hashCode() == 30817
    expect(gabungHash([1, 2, 3])).toBe(30817)
  })
})

describe('java.util.Random', () => {
  const acuan: Record<string, string> = {
    '42': '30,63,48,84,70,-248792245,1190043011,-1255373459,6,3,3,7,5,6,592164476,482678025,995688456,0.762090173108902,0.998178600062844,0.15195824856297624,false,true,true,7130900098642117381,3272055439932147596',
    '-5': '11,21,53,28,52,-1322608526,1234022115,995770787,0,0,0,11,11,14,563232475,869915394,968263036,0.35114184880214105,0.48708580598751716,0.9470970489943334,false,false,true,5527645783017713502,-1860771658617458844',
    '0': '60,48,29,47,15,1327362106,-1930858313,502539523,6,2,1,4,6,9,888030077,49567875,377907320,0.27495396603548483,0.12889715087377673,0.14660165764651822,false,false,true,170168523965373507,-8062155292093192501',
    '20260101':
      '11,12,68,39,47,-1265939624,428137516,1000027666,5,4,4,7,9,14,456901442,199715186,930341107,0.6350215694609129,0.902355661658733,0.44330621369322354,false,false,false,-2660595601704772478,9050767159060210694',
  }

  for (const [seed, harapan] of Object.entries(acuan)) {
    it(`deret dari new Random(${seed}) identik dengan JDK`, () => {
      const r = AcakJava.dariSeed(BigInt(seed))
      const hasil: string[] = []
      for (let i = 0; i < 5; i++) hasil.push(String(r.nextInt(100)))
      for (let i = 0; i < 3; i++) hasil.push(String(r.nextInt()))
      for (let i = 0; i < 3; i++) hasil.push(String(r.nextInt(7)))
      for (let i = 0; i < 3; i++) hasil.push(String(r.nextInt(16)))
      for (let i = 0; i < 3; i++) hasil.push(String(r.nextInt(1_000_000_007)))
      const d = harapan.split(',').slice(17, 20).map(Number)
      for (let i = 0; i < 3; i++) expect(r.nextDouble()).toBe(d[i])
      hasil.push(...d.map(String))
      for (let i = 0; i < 3; i++) hasil.push(String(r.nextBoolean()))
      for (let i = 0; i < 2; i++) hasil.push(r.nextLong().toString())
      expect(hasil.join(',')).toBe(harapan)
    })
  }
})
