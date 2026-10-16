import { describe, expect, it } from 'vitest'
import { bacaKoleksi, adalahObjekKoleksi } from '@/engine/bacaKoleksi'
import type { Nilai } from '@/engine/nilai'
import { hashString } from '@/engine/pustaka/hash'
import { ArrayListModel, HashMapModel, type OperasiElemen } from '@/engine/pustaka/koleksi'
import { HeapMesin, type DasarHeap } from '@/engine/runtime/adaptorKoleksi'
import { PenyimpanBoks } from '@/engine/runtime/boks'
import { stateKosong, terapkan, type ObjekHeap, type Peristiwa } from '@/engine/trace'

function siapkan() {
  const state = stateKosong()
  const peristiwa: Peristiwa[] = []
  let idBerikut = 1
  const emit = (p: Peristiwa) => {
    peristiwa.push(p)
    terapkan(state, p)
  }
  const alokasi = (objek: ObjekHeap) => {
    const id = idBerikut++
    emit({ k: 'alokasi', id, objek })
    return id
  }
  const dasar: DasarHeap = {
    heap: state.heap,
    alokasi,
    baruArray: (tipeElemen, isi) => alokasi({ k: 'array', tipeElemen, nilai: isi }),
    emit,
    kelasLain: (id) => {
      const o = state.heap[id]
      return o?.k === 'string' ? 'java.lang.String' : o?.k === 'boks' ? `java.lang.${o.kelas}` : 'java.lang.Object'
    },
  }
  const h = new HeapMesin(dasar)
  const boks = new PenyimpanBoks(alokasi)
  const str = (s: string) => alokasi({ k: 'string', nilai: s })
  const nilaiDari = (x: Nilai): unknown => {
    if (x === null) return null
    const o = state.heap[x as number]
    return o?.k === 'boks' || o?.k === 'string' ? o.nilai : x
  }
  const ops: OperasiElemen = {
    hashCode: (x) => {
      const o = state.heap[x]
      return o?.k === 'string' ? hashString(o.nilai) : o?.k === 'boks' ? (o.nilai as number) : x
    },
    equals: (a, b) => b !== null && nilaiDari(a) === nilaiDari(b),
    compareTo: (a, b) => (nilaiDari(a) as number) - (nilaiDari(b) as number),
    compare: () => 0,
    teks: (x) => String(nilaiDari(x)),
    pastikanComparable: () => {},
  }
  return { state, peristiwa, h, boks, str, ops, nilaiDari }
}

describe('adaptor HeapKoleksi + pembaca koleksi', () => {
  it('ArrayList tumbuh dari 10 ke 15 lewat peristiwa trace, lalu terbaca urut', () => {
    const { state, peristiwa, h, boks, ops, nilaiDari } = siapkan()
    const id = ArrayListModel.baru(h)
    for (let i = 1; i <= 11; i++) ArrayListModel.add(h, ops, id, boks.boks('Integer', i * 10).id)
    const isi = bacaKoleksi(state.heap, id)
    expect(isi?.jenis).toBe('list')
    expect(isi && 'elemen' in isi ? isi.elemen.map(nilaiDari) : []).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110])
    const data = state.heap[(state.heap[id] as { field: Record<string, Nilai> }).field.elementData as number]
    expect(data?.k === 'array' && data.nilai.length).toBe(15)
    expect(peristiwa.some((p) => p.k === 'salin-elemen')).toBe(true)
    expect(adalahObjekKoleksi(state.heap, id)).toBe(true)
  })

  it('HashMap dibaca dalam urutan bucket JDK', () => {
    const { state, h, str, boks, ops, nilaiDari } = siapkan()
    const id = HashMapModel.baru(h)
    for (const [k, v] of [['pisang', 3], ['apel', 5], ['ceri', 7]] as const) HashMapModel.put(h, ops, id, str(k), boks.boks('Integer', v).id)
    const isi = bacaKoleksi(state.heap, id)
    expect(isi?.jenis).toBe('map')
    // Urutan iterasi HashMap JDK 21 untuk kunci ini (diverifikasi dengan java): {ceri=7, apel=5, pisang=3}.
    expect(isi && 'entri' in isi ? isi.entri.map(([k, v]) => `${String(nilaiDari(k))}=${String(nilaiDari(v))}`) : []).toEqual([
      'ceri=7',
      'apel=5',
      'pisang=3',
    ])
  })
})
