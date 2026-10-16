import { describe, expect, it } from 'vitest'
import { ArrayDequeModel, ArrayListModel, HashMapModel, StackModel } from '@/engine/pustaka/koleksi'
import {
  bangunAntrian,
  bangunPohon,
  bangunRantai,
  bangunTabelHash,
  bangunTumpukan,
  daftarKetetanggaan,
  isiRantai,
  pilihFieldAnak,
  pilihFieldBerikut,
  telusuriPohon,
} from '@/viz/dataStruktur'
import { PembangunTrace, simpulInt, simpulPohon } from '@/viz/uji/pembangunTrace'
import type { ObjekHeap } from '@/engine/trace'

type Objek = Extract<ObjekHeap, { k: 'objek' }>

/** head → 1 → 2 → 3 → null di main, dengan penunjuk curr. */
function daftarTiga() {
  const t = new PembangunTrace()
  const n3 = simpulInt(t, 3)
  const n2 = simpulInt(t, 2, n3)
  const n1 = simpulInt(t, 1, n2)
  const main = t.frame('main')
  t.deklarasi(main, 'head', 'Node', n1)
  t.deklarasi(main, 'curr', 'Node', n2)
  t.deklarasi(main, 'kosong', 'Node', null)
  return { t, n1, n2, n3, main }
}

describe('bangunRantai', () => {
  it('satu baris kiri→kanan, label penunjuk, ujung null', () => {
    const { t, n1, n2 } = daftarTiga()
    const r = bangunRantai(t.state, { kepala: 'head', penunjuk: ['curr', 'kosong', 'hilang'] })
    if (!r.ok) throw new Error(r.masalah)
    expect(r.kelas).toBe('Node')
    expect(r.fieldBerikut).toBe('next')
    expect(r.fieldData).toBe('data')
    expect(r.baris).toHaveLength(1)
    expect(r.baris[0]).toMatchObject({ asal: 'head', ujung: 'null' })
    expect(r.baris[0].simpul.map((id) => r.simpul[id].teks)).toEqual(['1', '2', '3'])
    expect(r.simpul[n2].label).toEqual(['curr'])
    expect(r.simpul[n1].label).toEqual([])
    expect(r.simpul[n1].berikut).toEqual({ k: 'simpul', id: n2, sebelah: true })
    expect(r.penunjukNull).toEqual(['kosong'])
    expect(r.penunjukBelumAda).toEqual(['hilang'])
  })

  it('rantai melingkar dideteksi; simpul yang terlepas tampil sebagai baris penunjuk', () => {
    const { t, n1, n2, n3, main } = daftarTiga()
    t.tulisField(n3, 'next', n1)
    const lingkar = bangunRantai(t.state, { kepala: 'head' })
    expect(lingkar.ok && lingkar.melingkar).toBe(true)
    expect(lingkar.ok && lingkar.baris[0]).toMatchObject({ ujung: 'melingkar', ke: n1 })
    expect(isiRantai(t.state, { kepala: 'head' })).toMatchObject({ ok: false })

    // Pembalikan setengah jalan: head → 1 → null, prev = 2 → 1, curr = 3 → null.
    t.tulisField(n3, 'next', null)
    t.tulisField(n1, 'next', null)
    t.tulisField(n2, 'next', n1)
    t.deklarasi(main, 'prev', 'Node', n2)
    t.tulis(main, 'curr', n3)
    const r = bangunRantai(t.state, { kepala: 'head', penunjuk: ['prev', 'curr'] })
    if (!r.ok) throw new Error(r.masalah)
    expect(r.baris.map((b) => [b.asal, b.simpul.length, b.ujung])).toEqual([
      ['head', 1, 'null'],
      ['prev', 1, 'gabung'],
      ['curr', 1, 'null'],
    ])
    expect(r.baris[1].ke).toBe(n1)
    expect(r.simpul[n2].berikut).toEqual({ k: 'simpul', id: n1, sebelah: false })
  })

  it('dua arah dengan sebelum, kepala null, dan field yang salah sebut', () => {
    const t = new PembangunTrace()
    const a = t.objek('Main$DNode', { data: 1, prev: null, next: null }, { data: 'int', prev: 'DNode', next: 'DNode' })
    const b = t.objek('Main$DNode', { data: 2, prev: a, next: null }, { data: 'int', prev: 'DNode', next: 'DNode' })
    t.tulisField(a, 'next', b)
    const main = t.frame('main')
    t.deklarasi(main, 'head', 'DNode', a)
    t.deklarasi(main, 'kosong', 'DNode', null)
    const r = bangunRantai(t.state, { kepala: 'head', sebelum: 'prev' })
    if (!r.ok) throw new Error(r.masalah)
    expect(r.simpul[b].sebelum).toEqual({ k: 'simpul', id: a, sebelah: true })
    expect(r.simpul[a].sebelum).toEqual({ k: 'null' })
    expect(pilihFieldBerikut(t.state.heap[a] as Objek)).toBe('next')
    const kosong = bangunRantai(t.state, { kepala: 'kosong' })
    expect(kosong.ok && kosong.baris[0]).toMatchObject({ asal: 'kosong', simpul: [], ujung: 'null' })
    expect(bangunRantai(t.state, { kepala: 'head', berikut: 'lanjut' })).toMatchObject({ ok: false })
    expect(isiRantai(t.state, { kepala: 'head' })).toEqual({ ok: true, nilai: [1, 2] })
  })
})

describe('bangunPohon dan telusuriPohon', () => {
  /** BST: 8 (3 (1, 6), 10 (-, 14)). */
  function bst() {
    const t = new PembangunTrace()
    const n1 = simpulPohon(t, 1)
    const n6 = simpulPohon(t, 6)
    const n3 = simpulPohon(t, 3, n1, n6)
    const n14 = simpulPohon(t, 14)
    const n10 = simpulPohon(t, 10, null, n14)
    const n8 = simpulPohon(t, 8, n3, n10)
    const main = t.frame('main')
    t.deklarasi(main, 'root', 'Node', n8)
    t.frame('cari', [{ nama: 'root', tipe: 'Node', nilai: n6 }])
    return { t, n1, n3, n6, n8, n10, n14 }
  }

  it('tata letak inorder, jalur akar → penunjuk, label', () => {
    const { t, n3, n6, n8 } = bst()
    const p = bangunPohon(t.state, { akar: 'root', penunjuk: ['root'] })
    if (!p.ok) throw new Error(p.masalah)
    expect([p.fieldKiri, p.fieldKanan, p.fieldData]).toEqual(['left', 'right', 'data'])
    expect(p.simpul.sort((a, b) => a.x - b.x).map((s) => s.teks)).toEqual(['1', '3', '6', '8', '10', '14'])
    expect(p.tinggi).toBe(3)
    expect(new Set(p.jalur)).toEqual(new Set([n8, n3, n6]))
    const akar = p.simpul.find((s) => s.id === n8)!
    expect(akar.label).toEqual(['root'])
    expect(p.simpul.find((s) => s.id === n6)!.label).toEqual(['root'])
  })

  it('traversal inorder/preorder/postorder dan deteksi siklus', () => {
    const { t, n14, n8 } = bst()
    expect(telusuriPohon(t.state, { akar: 'root' }, 'inorder')).toEqual({ ok: true, nilai: [1, 3, 6, 8, 10, 14] })
    expect(telusuriPohon(t.state, { akar: 'root' }, 'preorder')).toEqual({ ok: true, nilai: [8, 3, 1, 6, 10, 14] })
    expect(telusuriPohon(t.state, { akar: 'root' }, 'postorder')).toEqual({ ok: true, nilai: [1, 6, 3, 14, 10, 8] })
    t.tulisField(n14, 'left', n8)
    expect(telusuriPohon(t.state, { akar: 'root' }, 'inorder')).toMatchObject({ ok: false })
    const p = bangunPohon(t.state, { akar: 'root' })
    expect(p.ok && p.siklus).toBe(true)
  })

  it('field kiri/kanan berbahasa Indonesia dan subpohon lepas', () => {
    const t = new PembangunTrace()
    const tipe = { nilai: 'int', kiri: 'Simpul', kanan: 'Simpul' }
    const anak = t.objek('Main$Simpul', { nilai: 2, kiri: null, kanan: null }, tipe)
    const akar = t.objek('Main$Simpul', { nilai: 5, kiri: anak, kanan: null }, tipe)
    const baru = t.objek('Main$Simpul', { nilai: 9, kiri: null, kanan: null }, tipe)
    const main = t.frame('main')
    t.deklarasi(main, 'akar', 'Simpul', akar)
    t.deklarasi(main, 'baru', 'Simpul', baru)
    expect(pilihFieldAnak(t.state.heap[akar] as Objek)).toEqual(['kiri', 'kanan'])
    const p = bangunPohon(t.state, { akar: 'akar', penunjuk: ['baru'] })
    if (!p.ok) throw new Error(p.masalah)
    expect(p.jumlahUtama).toBe(2)
    expect(p.simpul.find((s) => s.id === baru)).toMatchObject({ kelompok: 1, x: 3 })
  })

  it('tinggi hanya menghitung pohon utama, bukan pohon lain yang ditunjuk penunjuk', () => {
    const t = new PembangunTrace()
    const akar = simpulPohon(t, 5, simpulPohon(t, 3))
    const miring = simpulPohon(t, 1, null, simpulPohon(t, 2, null, simpulPohon(t, 3, null, simpulPohon(t, 4))))
    const main = t.frame('main')
    t.deklarasi(main, 'akar', 'Node', akar)
    t.deklarasi(main, 'miring', 'Node', miring)
    const p = bangunPohon(t.state, { akar: 'akar', penunjuk: ['miring'] })
    if (!p.ok) throw new Error(p.masalah)
    expect([p.jumlahUtama, p.tinggi, p.simpul.length]).toEqual([2, 2, 6])
  })
})

describe('tumpukan, antrian, tabel hash, daftar ketetanggaan', () => {
  it('tumpukan array + puncak, Stack, ArrayDeque (puncak di depan)', () => {
    const t = new PembangunTrace()
    const arr = t.array('int', [4, 7, 9, 0, 0])
    const main = t.frame('main')
    t.deklarasi(main, 'data', 'int[]', arr)
    t.deklarasi(main, 'top', 'int', 1)
    const a = bangunTumpukan(t.state, { variabel: 'data', puncak: 'top' })
    expect(a.ok && [a.sumber, a.jumlah, a.puncak, a.kapasitas]).toEqual(['array', 2, 1, 5])
    expect(bangunTumpukan(t.state, { variabel: 'data' })).toMatchObject({ ok: false })

    const st = StackModel.baru(t.h)
    for (const x of [1, 2, 3]) StackModel.push(t.h, t.ops, st, t.int(x))
    const dq = ArrayDequeModel.baru(t.h)
    for (const x of [1, 2, 3]) ArrayDequeModel.addFirst(t.h, t.ops, dq, t.int(x))
    t.deklarasi(main, 'st', 'Stack<Integer>', st)
    t.deklarasi(main, 'dq', 'Deque<Integer>', dq)
    const s = bangunTumpukan(t.state, { variabel: 'st' })
    const d = bangunTumpukan(t.state, { variabel: 'dq' })
    // Dari dasar ke puncak: push 1, 2, 3 → puncak 3 pada keduanya.
    expect(s.ok && s.sel.map((x) => x.teks)).toEqual(['1', '2', '3'])
    expect(d.ok && d.sel.map((x) => x.teks)).toEqual(['1', '2', '3'])
  })

  it('antrian array melingkar dengan depan/belakang/ukuran, dan Queue koleksi', () => {
    const t = new PembangunTrace()
    const arr = t.array('int', [50, 0, 0, 20, 30])
    const main = t.frame('main')
    t.deklarasi(main, 'q', 'int[]', arr)
    t.deklarasi(main, 'depan', 'int', 3)
    t.deklarasi(main, 'belakang', 'int', 0)
    const a = bangunAntrian(t.state, { variabel: 'q', depan: 'depan', belakang: 'belakang' })
    if (!a.ok) throw new Error(a.masalah)
    expect(a.urutan.map((x) => x.teks)).toEqual(['20', '30', '50'])
    expect(a.melingkar).toBe(true)
    expect(a.larik?.map((x) => x.ke)).toEqual([2, undefined, undefined, 0, 1])
    t.deklarasi(main, 'n', 'int', 0)
    const kosong = bangunAntrian(t.state, { variabel: 'q', depan: 'depan', ukuran: 'n' })
    expect(kosong.ok && kosong.jumlah).toBe(0)

    const ll = ArrayDequeModel.baru(t.h)
    for (const x of [5, 6]) ArrayDequeModel.addLast(t.h, t.ops, ll, t.int(x))
    t.deklarasi(main, 'antre', 'Queue<Integer>', ll)
    const k = bangunAntrian(t.state, { variabel: 'antre' })
    expect(k.ok && k.urutan.map((x) => x.teks)).toEqual(['5', '6'])
  })

  it('tabel hash chaining manual: bucket, rantai, tabrakan, penunjuk indeks', () => {
    const t = new PembangunTrace()
    const tipe = { key: 'String', value: 'int', next: 'Entry' }
    const e2 = t.objek('Main$Entry', { key: t.str('apel'), value: 3, next: null }, tipe)
    const e1 = t.objek('Main$Entry', { key: t.str('ceri'), value: 7, next: e2 }, tipe)
    const e3 = t.objek('Main$Entry', { key: t.str('duku'), value: 1, next: null }, tipe)
    const tabel = t.array('Entry', [null, e1, null, e3])
    const main = t.frame('main')
    t.deklarasi(main, 'tabel', 'Entry[]', tabel)
    t.deklarasi(main, 'idx', 'int', 1)
    t.deklarasi(main, 'p', 'Entry', e2)
    const h = bangunTabelHash(t.state, { variabel: 'tabel', penunjuk: ['idx', 'p'] })
    if (!h.ok) throw new Error(h.masalah)
    expect([h.fieldKunci, h.fieldNilai, h.jumlahEntri, h.tabrakan]).toEqual(['key', 'value', 3, 1])
    expect(h.bucket.map((b) => b.jenis)).toEqual(['kosong', 'rantai', 'kosong', 'rantai'])
    expect(h.bucket[1].simpul.map((s) => `${s.teksKunci}:${s.teksNilai}`)).toEqual(['"ceri":7', '"apel":3'])
    expect(h.bucket[1].penunjuk).toEqual(['idx'])
    expect(h.bucket[1].simpul[1].label).toEqual(['p'])
  })

  it('tabel hash dari HashMap memakai table internal', () => {
    const t = new PembangunTrace()
    const hm = HashMapModel.baru(t.h)
    HashMapModel.put(t.h, t.ops, hm, t.str('a'), t.int(1))
    const main = t.frame('main')
    t.deklarasi(main, 'peta', 'HashMap<String,Integer>', hm)
    const h = bangunTabelHash(t.state, { variabel: 'peta' })
    if (!h.ok) throw new Error(h.masalah)
    expect(h.sumber).toBe('koleksi')
    expect(h.bucket).toHaveLength(16)
    expect(h.bucket[1].simpul[0]).toMatchObject({ teksKunci: '"a"', teksNilai: '1' })
  })

  it('daftar ketetanggaan dari ArrayList<ArrayList<Integer>>', () => {
    const t = new PembangunTrace()
    const adj = ArrayListModel.baru(t.h)
    for (const isi of [[1, 2], [0], [0]]) {
      const d = ArrayListModel.baru(t.h)
      for (const x of isi) ArrayListModel.add(t.h, t.ops, d, t.int(x))
      ArrayListModel.add(t.h, t.ops, adj, d)
    }
    const g = daftarKetetanggaan(t.state.heap, adj)!
    expect(g.tetangga).toEqual([[1, 2], [0], [0]])
    expect(g.teks).toEqual(['[1, 2]', '[0]', '[0]'])
    // Daftar berisi Integer (bukan daftar of daftar) bukan daftar ketetanggaan.
    const dalam = (t.state.heap[(t.state.heap[adj] as Objek).field.elementData as number] as { nilai: number[] }).nilai[0]
    expect(daftarKetetanggaan(t.state.heap, dalam)).toBeUndefined()
  })
})
