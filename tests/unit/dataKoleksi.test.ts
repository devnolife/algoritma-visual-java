import { describe, expect, it } from 'vitest'
import {
  ArrayDequeModel,
  ArrayListModel,
  HashMapModel,
  HashSetModel,
  LinkedListModel,
  PriorityQueueModel,
  StackModel,
  TreeMapModel,
} from '@/engine/pustaka/koleksi'
import type { ObjekHeap } from '@/engine/trace'
import {
  adalahEntri,
  adalahException,
  isiDalam,
  namaKoleksi,
  objekInternal,
  ringkasKoleksi,
  ringkasObjek,
  teksElemen,
  teksRingkasKoleksi,
  ukuranKoleksi,
} from '@/viz/dataKoleksi'
import { PembangunTrace, simpulInt } from '@/viz/uji/pembangunTrace'

const objek = (t: PembangunTrace, id: number) => t.state.heap[id] as Extract<ObjekHeap, { k: 'objek' }>

describe('ringkasKoleksi', () => {
  it('ArrayList: elemen berindeks, kunci sorotan ke sel elementData, tumbuh 10 → 15', () => {
    const t = new PembangunTrace()
    const id = ArrayListModel.baru(t.h)
    for (let i = 1; i <= 11; i++) ArrayListModel.add(t.h, t.ops, id, t.int(i * 10))
    const r = ringkasKoleksi(t.state.heap, id)!
    expect(r.jenis).toBe('list')
    expect(r.nama).toBe('ArrayList')
    expect(r.ukuran).toBe(11)
    if (r.jenis === 'map') throw new Error()
    expect(r.elemen.map((e) => e.teks)).toEqual(['10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110'])
    const data = objek(t, id).field.elementData as number
    expect(r.elemen[3].kunci).toEqual([`el:${data}:3`])
    expect((t.state.heap[data] as { nilai: unknown[] }).nilai).toHaveLength(15)
    expect(teksRingkasKoleksi(r, 4)).toBe('[10, 20, 30, 40, …]')
  })

  it('HashMap: entri dalam urutan bucket JDK dengan kunci sorotan simpul', () => {
    const t = new PembangunTrace()
    const id = HashMapModel.baru(t.h)
    for (const [k, v] of [['pisang', 3], ['apel', 5], ['ceri', 7]] as const) HashMapModel.put(t.h, t.ops, id, t.str(k), t.int(v))
    const r = ringkasKoleksi(t.state.heap, id)!
    if (r.jenis !== 'map') throw new Error('harus map')
    expect(r.entri.map((e) => `${e.teksKunci}=${e.teksNilai}`)).toEqual(['"ceri"=7', '"apel"=5', '"pisang"=3'])
    expect(r.entri[0].sumber[0]).toMatch(/^obj:\d+$/)
    expect(teksRingkasKoleksi(r)).toBe('{"ceri"=7, "apel"=5, "pisang"=3}')
  })

  it('LinkedList, ArrayDeque melingkar, Stack, PriorityQueue, TreeMap', () => {
    const t = new PembangunTrace()
    const ll = LinkedListModel.baru(t.h)
    for (const x of [4, 5, 6]) LinkedListModel.addLast(t.h, t.ops, ll, t.int(x))
    const rl = ringkasKoleksi(t.state.heap, ll)!
    if (rl.jenis === 'map') throw new Error()
    expect(rl.elemen.map((e) => e.teks)).toEqual(['4', '5', '6'])
    expect(rl.elemen[0].kunci[0]).toBe(`obj:${objek(t, ll).field.first}`)

    // ArrayDeque kapasitas 3+1: isi berputar melewati ujung array.
    const dq = ArrayDequeModel.baru(t.h, 3)
    for (const x of [1, 2, 3]) ArrayDequeModel.addLast(t.h, t.ops, dq, t.int(x))
    ArrayDequeModel.pollFirst(t.h, t.ops, dq)
    ArrayDequeModel.pollFirst(t.h, t.ops, dq)
    ArrayDequeModel.addLast(t.h, t.ops, dq, t.int(4))
    ArrayDequeModel.addLast(t.h, t.ops, dq, t.int(5))
    const rd = ringkasKoleksi(t.state.heap, dq)!
    if (rd.jenis === 'map') throw new Error()
    expect(rd.jenis).toBe('deque')
    expect(rd.elemen.map((e) => e.teks)).toEqual(['3', '4', '5'])
    const el = objek(t, dq).field.elements as number
    expect(rd.elemen.map((e) => e.kunci[0])).toEqual([`el:${el}:2`, `el:${el}:3`, `el:${el}:0`])
    expect(ukuranKoleksi(t.state.heap, dq)).toBe(3)
    const dalam = isiDalam(t.state.heap, dq)!
    expect(dalam.k).toBe('melingkar')
    if (dalam.k === 'melingkar') expect([dalam.head, dalam.tail]).toEqual([2, 1])

    const st = StackModel.baru(t.h)
    for (const x of [7, 8]) StackModel.push(t.h, t.ops, st, t.int(x))
    expect(ringkasKoleksi(t.state.heap, st)?.jenis).toBe('tumpukan')
    const ds = isiDalam(t.state.heap, st)!
    expect(ds.k === 'larik' && [ds.namaUkuran, ds.ukuran, ds.sel.length]).toEqual(['elementCount', 2, 10])

    const pq = PriorityQueueModel.baru(t.h)
    for (const x of [5, 1, 4, 2]) PriorityQueueModel.offer(t.h, t.ops, pq, t.int(x))
    const rp = ringkasKoleksi(t.state.heap, pq)!
    if (rp.jenis === 'map') throw new Error()
    expect(rp.jenis).toBe('pq')
    expect(rp.elemen.map((e) => e.teks)).toEqual(['1', '2', '4', '5'])

    const tm = TreeMapModel.baru(t.h)
    for (const k of [5, 2, 8, 1]) TreeMapModel.put(t.h, t.ops, tm, t.int(k), t.str(`v${k}`))
    const rt = ringkasKoleksi(t.state.heap, tm)!
    if (rt.jenis !== 'map') throw new Error()
    expect(rt.entri.map((e) => e.teksKunci)).toEqual(['1', '2', '5', '8'])
    const dt = isiDalam(t.state.heap, tm)!
    if (dt.k !== 'pohon') throw new Error()
    const akar = dt.simpul.find((s) => s.id === dt.akar)!
    expect(akar.merah).toBe(false)
    expect(dt.simpul).toHaveLength(4)
  })

  it('HashSet: isi dalam membungkus HashMap dengan nilai PRESENT', () => {
    const t = new PembangunTrace()
    const hs = HashSetModel.baru(t.h)
    for (const s of ['b', 'a']) HashSetModel.add(t.h, t.ops, hs, t.str(s))
    const r = ringkasKoleksi(t.state.heap, hs)!
    expect(r.jenis).toBe('set')
    const d = isiDalam(t.state.heap, hs)!
    if (d.k !== 'bungkus' || d.dalam?.k !== 'tabel') throw new Error('harus bungkus tabel')
    expect(d.namaField).toBe('map')
    const simpul = d.dalam.bucket.flatMap((b) => b.simpul)
    expect(simpul.map((s) => s.isi.find((f) => f.nama === 'value')?.teks)).toEqual(['PRESENT', 'PRESENT'])
    expect(simpul.map((s) => s.isi.find((f) => f.nama === 'key')?.teks).sort()).toEqual(['"a"', '"b"'])
  })

  it('objek internal tidak memuat elemen (data) koleksi', () => {
    const t = new PembangunTrace()
    const id = ArrayListModel.baru(t.h)
    const lima = t.int(5)
    ArrayListModel.add(t.h, t.ops, id, lima)
    const internal = objekInternal(t.state.heap, id)
    expect(internal).toContain(id)
    expect(internal).toContain(objek(t, id).field.elementData)
    expect(internal).not.toContain(lima)

    const hm = HashMapModel.baru(t.h)
    HashMapModel.put(t.h, t.ops, hm, t.str('k'), lima)
    const dalamMap = objekInternal(t.state.heap, hm)
    expect(dalamMap).toContain(objek(t, hm).field.table)
    expect(dalamMap.some((x) => adalahEntri(t.state.heap[x]))).toBe(true)
    expect(dalamMap).not.toContain(lima)
  })
})

describe('teks ringkas', () => {
  it('list bersarang, objek mahasiswa, exception, nama view', () => {
    const t = new PembangunTrace()
    const luar = ArrayListModel.baru(t.h)
    for (const isi of [[1, 2], [0]]) {
      const d = ArrayListModel.baru(t.h)
      for (const x of isi) ArrayListModel.add(t.h, t.ops, d, t.int(x))
      ArrayListModel.add(t.h, t.ops, luar, d)
    }
    expect(teksElemen(luar, t.state.heap)).toBe('[[1, 2], [0]]')
    const n2 = simpulInt(t, 7)
    const n1 = simpulInt(t, 3, n2)
    expect(ringkasObjek(t.state.heap, n1)).toBe('Node{data=3, next=Node#' + n2 + '}')
    const e = t.objek('java.lang.IllegalStateException', { detailMessage: t.str('Stok habis') }, { detailMessage: 'String' }, ['\tat Main.main(Main.java:5)'])
    expect(adalahException(t.state.heap[e])).toBe(true)
    expect(teksElemen(e, t.state.heap)).toBe('IllegalStateException("Stok habis")')
    expect(namaKoleksi('java.util.HashMap$KeySet')).toBe('HashMap.keySet()')
    expect(namaKoleksi('java.util.ImmutableCollections$ListN')).toBe('List.of')
  })
})
