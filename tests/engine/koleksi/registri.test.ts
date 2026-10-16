import { describe, expect, it } from 'vitest'
import type { Nilai } from '@/engine/nilai'
import {
  adalahKoleksi,
  adalahList,
  adalahMap,
  adalahSet,
  ArrayDequeModel,
  ArrayListModel,
  ArraysAsListModel,
  BelumDidukung,
  cariModel,
  cariModelMap,
  CollectionsModel,
  HashMapModel,
  HashSetModel,
  keArray,
  LinkedHashMapModel,
  LinkedHashSetModel,
  LinkedListModel,
  ListOfModel,
  modelDari,
  modelMapDari,
  PriorityQueueModel,
  StackModel,
  TreeMapModel,
  TreeSetModel,
  VectorModel,
} from '@/engine/pustaka/koleksi'
import { HeapUji, OpsUji } from './heapUji'

/** Satu koleksi berisi 3, 1, 2 untuk setiap kelas terdaftar. */
function semuaKoleksi(h: HeapUji, ops: OpsUji): Record<string, number> {
  const isi = [3, 1, 2].map((n) => h.integer(n))
  const al = ArrayListModel.baru(h)
  const ll = LinkedListModel.baru(h)
  const ad = ArrayDequeModel.baru(h)
  const st = StackModel.baru(h)
  const vc = VectorModel.baru(h)
  const pq = PriorityQueueModel.baru(h)
  for (const e of isi) {
    ArrayListModel.add(h, ops, al, e)
    LinkedListModel.add(h, ops, ll, e)
    ArrayDequeModel.add(h, ops, ad, e)
    StackModel.push(h, ops, st, e)
    VectorModel.add(h, ops, vc, e)
    PriorityQueueModel.offer(h, ops, pq, e)
  }
  const larik = h.baruArray('Object', 3)
  isi.forEach((e, i) => h.tulisElemen(larik, i, e))
  return {
    'java.util.ArrayList': al,
    'java.util.LinkedList': ll,
    'java.util.ArrayDeque': ad,
    'java.util.Stack': st,
    'java.util.Vector': vc,
    'java.util.PriorityQueue': pq,
    'java.util.Arrays$ArrayList': ArraysAsListModel.asList(h, larik),
    'java.util.ImmutableCollections$ListN': ListOfModel.of(h, isi),
  }
}

describe('registri koleksi', () => {
  it('setiap kelas dan kelas iteratornya terdaftar', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    for (const [kelas, id] of Object.entries(semuaKoleksi(h, ops))) {
      const m = cariModel(kelas)
      expect(m?.kelas).toBe(kelas)
      expect(adalahKoleksi(h, id)).toBe(true)
      const it = m!.iterator(h, ops, id)
      expect(m!.kelasIterator).toContain(h.kelasDari(it))
      expect(cariModel(h.kelasDari(it))).toBeDefined()
      expect(adalahKoleksi(h, it)).toBe(false)
    }
    expect(adalahKoleksi(h, h.integer(1))).toBe(false)
    expect(adalahKoleksi(h, null)).toBe(false)
  })

  it('instanceof List hanya untuk daftar', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const k = semuaKoleksi(h, ops)
    const list = Object.keys(k).filter((kelas) => adalahList(h, k[kelas]))
    expect(list.sort()).toEqual(
      [
        'java.util.ArrayList',
        'java.util.LinkedList',
        'java.util.Stack',
        'java.util.Vector',
        'java.util.Arrays$ArrayList',
        'java.util.ImmutableCollections$ListN',
      ].sort(),
    )
  })

  it('new ArrayList<>(c) dan iterasi berjalan lewat registri untuk semua kelas', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    for (const [kelas, id] of Object.entries(semuaKoleksi(h, ops))) {
      const salinan = ArrayListModel.dariKoleksi(h, ops, id)
      expect(keArray(h, ops, salinan), kelas).toEqual(keArray(h, ops, id))
      const m = modelDari(h, id)
      const it = m.iterator(h, ops, id)
      const isi: Nilai[] = []
      while (m.hasNext(h, ops, it)) isi.push(m.next(h, ops, it))
      expect(isi, kelas).toEqual(keArray(h, ops, id))
    }
  })

  it('operasi baca tidak menulis apa pun ke heap (tidak ada objek sampah di trace)', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const koleksi = semuaKoleksi(h, ops)
    const dua = h.integer(2)
    const sebelum = h.jumlahTulis
    for (const [kelas, id] of Object.entries(koleksi)) {
      const m = modelDari(h, id)
      m.size(h, ops, id)
      m.keArray(h, ops, id)
      m.teks(h, ops, id)
      m.hashCode?.(h, ops, id)
      m.equals?.(h, ops, id, koleksi['java.util.ArrayList'])
      const it = m.iterasi(h, ops, id)
      while (it.hasNext()) it.next()
      if (m.daftar) m.daftar.get(h, ops, id, 1)
      CollectionsModel.max(h, ops, id)
      CollectionsModel.min(h, ops, id)
      CollectionsModel.frequency(h, ops, id, dua)
      expect(h.jumlahTulis, kelas).toBe(sebelum)
    }
  })

  it('dua heap yang diselang-seling tidak saling memengaruhi (tanpa state tersembunyi)', () => {
    const jalankan = (urutan: 'berurutan' | 'selang') => {
      const a = new HeapUji()
      const b = new HeapUji()
      const oa = new OpsUji(a)
      const ob = new OpsUji(b)
      const la = ArrayListModel.baru(a)
      const da = ArrayDequeModel.baru(a, 1)
      let lb = 0
      const langkahA = (i: number) => {
        ArrayListModel.add(a, oa, la, a.integer(i))
        ArrayDequeModel.addFirst(a, oa, da, a.integer(i))
      }
      const langkahB = (i: number) => {
        if (i === 0) lb = ArrayListModel.baru(b, 0)
        ArrayListModel.add(b, ob, lb, b.integer(100 + i))
      }
      if (urutan === 'berurutan') {
        for (let i = 0; i < 20; i++) langkahA(i)
        for (let i = 0; i < 20; i++) langkahB(i)
      } else {
        for (let i = 0; i < 20; i++) {
          langkahB(i)
          langkahA(i)
        }
      }
      return [
        ArrayListModel.toString(a, oa, la),
        ArrayDequeModel.toString(a, oa, da),
        ArrayListModel.toString(b, ob, lb),
      ]
    }
    expect(jalankan('selang')).toEqual(jalankan('berurutan'))
  })
})

/** Map berisi 3=30, 1=10, 2=20 dan set berisi 3, 1, 2 untuk setiap kelas terdaftar, beserta semua view map. */
function semuaPetaDanSet(h: HeapUji, ops: OpsUji) {
  const peta: Record<string, number> = {
    'java.util.HashMap': HashMapModel.baru(h),
    'java.util.LinkedHashMap': LinkedHashMapModel.baru(h),
    'java.util.TreeMap': TreeMapModel.baru(h),
  }
  const himpunan: Record<string, number> = {
    'java.util.HashSet': HashSetModel.baru(h),
    'java.util.LinkedHashSet': LinkedHashSetModel.baru(h),
    'java.util.TreeSet': TreeSetModel.baru(h),
  }
  for (const n of [3, 1, 2]) {
    for (const id of Object.values(peta)) modelMapDari(h, id).put(h, ops, id, h.integer(n), h.integer(n * 10))
    for (const id of Object.values(himpunan)) modelDari(h, id).add(h, ops, id, h.integer(n))
  }
  const tampilan: Record<string, number> = {}
  for (const id of Object.values(peta)) {
    const m = modelMapDari(h, id)
    for (const v of [m.keySet(h, ops, id), m.values(h, ops, id), m.entrySet(h, ops, id)])
      tampilan[h.kelasDari(v)] = v
  }
  return { peta, himpunan, tampilan }
}

describe('registri map dan set', () => {
  it('setiap map, set, dan view terdaftar beserta kelas iteratornya', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const { peta, himpunan, tampilan } = semuaPetaDanSet(h, ops)
    for (const [kelas, id] of Object.entries(peta)) {
      expect(cariModelMap(kelas)?.kelas).toBe(kelas)
      expect(adalahMap(h, id)).toBe(true)
      expect(adalahKoleksi(h, id)).toBe(false)
      expect(adalahSet(h, id)).toBe(false)
    }
    const koleksi = { ...himpunan, ...tampilan }
    expect(Object.keys(tampilan)).toHaveLength(9)
    for (const [kelas, id] of Object.entries(koleksi)) {
      const m = cariModel(kelas)
      expect(m?.kelas, kelas).toBe(kelas)
      expect(adalahKoleksi(h, id)).toBe(true)
      expect(adalahSet(h, id), kelas).toBe(!kelas.endsWith('Values'))
      expect(adalahList(h, id)).toBe(false)
      expect(adalahMap(h, id)).toBe(false)
      const it = m!.iterator(h, ops, id)
      expect(m!.kelasIterator).toContain(h.kelasDari(it))
      expect(cariModel(h.kelasDari(it))).toBeDefined()
    }
    expect(adalahMap(h, null)).toBe(false)
    expect(adalahSet(h, null)).toBe(false)
    expect(cariModelMap('java.util.Hashtable')).toBeUndefined()
  })

  it('view di-cache: keySet()/values()/entrySet() mengembalikan objek yang sama', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const { peta } = semuaPetaDanSet(h, ops)
    for (const id of Object.values(peta)) {
      const m = modelMapDari(h, id)
      const sebelum = h.jumlahTulis
      expect(m.keySet(h, ops, id)).toBe(m.keySet(h, ops, id))
      expect(m.values(h, ops, id)).toBe(m.values(h, ops, id))
      expect(m.entrySet(h, ops, id)).toBe(m.entrySet(h, ops, id))
      expect(h.jumlahTulis).toBe(sebelum)
    }
    const tm = peta['java.util.TreeMap']
    expect(TreeMapModel.navigableKeySet(h, ops, tm)).toBe(TreeMapModel.keySet(h, ops, tm))
  })

  it('operasi baca tidak menulis apa pun selain cache view yang dibuat sekali (seperti JDK)', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const { peta, himpunan, tampilan } = semuaPetaDanSet(h, ops)
    // Iterasi pertama atas set membuat view keySet/navigableKeySet di map penopangnya, sekali saja.
    for (const [kelas, id] of Object.entries(himpunan)) {
      const pohon = kelas === 'java.util.TreeSet'
      const map = h.bacaField(id, pohon ? 'm' : 'map') as number
      const cache = pohon ? 'navigableKeySet' : 'keySet'
      expect(h.bacaField(map, cache), kelas).toBeNull()
      modelDari(h, id).teks(h, ops, id)
      expect(h.bacaField(map, cache), kelas).not.toBeNull()
    }
    const dua = h.integer(2)
    const lima = h.integer(5)
    const duaPuluh = h.integer(20)
    const sebelum = h.jumlahTulis
    for (const [kelas, id] of Object.entries(peta)) {
      const m = modelMapDari(h, id)
      m.size(h, ops, id)
      m.get(h, ops, id, dua)
      m.containsKey(h, ops, id, lima)
      m.teks(h, ops, id)
      m.hashCode(h, ops, id)
      for (const lain of Object.values(peta)) m.equals(h, ops, id, lain)
      const it = m.iterasiEntri(h, ops, id)
      while (it.hasNext()) it.next()
      expect(h.jumlahTulis, kelas).toBe(sebelum)
    }
    const tm = peta['java.util.TreeMap']
    TreeMapModel.containsValue(h, ops, tm, duaPuluh)
    TreeMapModel.getOrDefault(h, ops, tm, lima, dua)
    TreeMapModel.firstKey(h, ops, tm)
    TreeMapModel.floorKey(h, ops, tm, lima)
    TreeMapModel.higherKey(h, ops, tm, dua)
    HashMapModel.containsValue(h, ops, peta['java.util.HashMap'], duaPuluh)
    TreeSetModel.ceiling(h, ops, himpunan['java.util.TreeSet'], dua)
    expect(h.jumlahTulis).toBe(sebelum)
    for (const [kelas, id] of Object.entries({ ...himpunan, ...tampilan })) {
      const m = modelDari(h, id)
      m.size(h, ops, id)
      m.keArray(h, ops, id)
      m.teks(h, ops, id)
      m.contains(h, ops, id, dua)
      m.hashCode?.(h, ops, id)
      m.equals?.(h, ops, id, himpunan['java.util.HashSet'])
      const it = m.iterasi(h, ops, id)
      while (it.hasNext()) it.next()
      if (!kelas.endsWith('EntrySet')) {
        CollectionsModel.max(h, ops, id)
        CollectionsModel.min(h, ops, id)
      }
      CollectionsModel.frequency(h, ops, id, dua)
      expect(h.jumlahTulis, kelas).toBe(sebelum)
    }
  })

  it('toString() map membuat view entrySet sekali lalu memakai ulang cache-nya', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const daftar = [
      [HashMapModel.baru(h), HashMapModel.put, HashMapModel.toString],
      [LinkedHashMapModel.baru(h), LinkedHashMapModel.put, LinkedHashMapModel.toString],
      [TreeMapModel.baru(h), TreeMapModel.put, TreeMapModel.toString],
    ] as const
    for (const [m, put, toString] of daftar) {
      put(h, ops, m, h.integer(1), h.integer(2))
      expect(h.bacaField(m, 'entrySet')).toBeNull()
      expect(toString(h, ops, m)).toBe('{1=2}')
      const es = h.bacaField(m, 'entrySet') as number
      expect(h.kelasDari(es)).toMatch(/EntrySet$/)
      const sebelum = h.jumlahTulis
      toString(h, ops, m)
      expect(h.bacaField(m, 'entrySet')).toBe(es)
      expect(h.jumlahTulis).toBe(sebelum)
    }
  })

  it('new ArrayList<>(set) dan new TreeSet<>(view) berjalan lewat registri', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    const { himpunan, tampilan } = semuaPetaDanSet(h, ops)
    for (const [kelas, id] of Object.entries({ ...himpunan, ...tampilan })) {
      const salinan = ArrayListModel.dariKoleksi(h, ops, id)
      expect(keArray(h, ops, salinan), kelas).toEqual(keArray(h, ops, id))
    }
    const ts = TreeSetModel.dariKoleksi(h, ops, tampilan['java.util.HashMap$KeySet'])
    expect(TreeSetModel.toString(h, ops, ts)).toBe('[1, 2, 3]')
  })

  it('comparator() mengembalikan pembanding yang dipasang', () => {
    const h = new HeapUji()
    const cmp = h.pembanding('log')
    expect(PriorityQueueModel.comparator(h, PriorityQueueModel.baru(h, 11, cmp))).toBe(cmp)
    expect(PriorityQueueModel.comparator(h, PriorityQueueModel.baru(h))).toBeNull()
    expect(TreeMapModel.comparator(h, TreeMapModel.baru(h, cmp))).toBe(cmp)
    expect(TreeSetModel.comparator(h, TreeSetModel.baru(h, cmp))).toBe(cmp)
    expect(TreeSetModel.comparator(h, TreeSetModel.baru(h))).toBeNull()
  })

  it('bagian yang sengaja belum dimodelkan melempar BelumDidukung', () => {
    const h = new HeapUji()
    const ops = new OpsUji(h)
    for (const nama of ['headMap', 'tailMap', 'subMap', 'descendingMap', 'descendingKeySet'] as const) {
      expect(() => TreeMapModel[nama](), nama).toThrow(BelumDidukung)
    }
    const asing = h.baruObjek('java.util.Hashtable', {}, {})
    expect(() => modelDari(h, asing)).toThrow(BelumDidukung)
    expect(() => modelMapDari(h, asing)).toThrow(BelumDidukung)
    const al = ArrayListModel.baru(h)
    const ts = TreeSetModel.baru(h)
    const itTreeMap = TreeSetModel.iterator(h, ops, ts)
    expect(() => modelDari(h, al).hasNext(h, ops, itTreeMap)).toThrow(BelumDidukung)
  })
})

describe('heap uji', () => {
  it('salinArray menyalin wilayah tumpang-tindih seperti System.arraycopy', () => {
    const h = new HeapUji()
    const a = h.baruArray('Object', 6)
    const nilai = [1, 2, 3, 4, 5, 6].map((n) => h.integer(n))
    nilai.forEach((v, i) => h.tulisElemen(a, i, v))
    h.salinArray(a, 0, a, 1, 4)
    expect([0, 1, 2, 3, 4, 5].map((i) => h.boks(h.bacaElemen(a, i))?.nilai)).toEqual([1, 1, 2, 3, 4, 6])
    h.salinArray(a, 2, a, 0, 4)
    expect([0, 1, 2, 3, 4, 5].map((i) => h.boks(h.bacaElemen(a, i))?.nilai)).toEqual([2, 3, 4, 6, 4, 6])
  })

  it('Integer.valueOf di-cache -128..127 seperti JDK', () => {
    const h = new HeapUji()
    expect(h.integer(127)).toBe(h.integer(127))
    expect(h.integer(128)).not.toBe(h.integer(128))
    expect(h.string('a')).toBe(h.string('a'))
  })
})
