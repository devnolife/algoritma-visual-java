import { describe, expect, it } from 'vitest'
import { visualOtomatis } from '@/viz/otomatis'
import { PembangunTrace, simpulInt, simpulPohon } from '@/viz/uji/pembangunTrace'

const jenis = (t: PembangunTrace) => visualOtomatis(t.selesai()).map((k) => k.jenis)

describe('visualOtomatis: struktur berantai dan koleksi (Ruang Coba)', () => {
  it('class dengan satu field bertipe dirinya sendiri → rantai, variabel simpul lain menjadi penunjuk', () => {
    const t = new PembangunTrace()
    const main = t.frame('main', [{ nama: 'args', tipe: 'String[]', nilai: null }])
    const b = simpulInt(t, 2)
    const a = simpulInt(t, 1, b)
    t.deklarasi(main, 'head', 'Node', a)
    t.catat()
    t.deklarasi(main, 'cur', 'Node', a)
    const cetak = t.frame('cetak', [{ nama: 'n', tipe: 'Node', nilai: a }])
    t.catat()
    t.buangFrame(cetak)
    expect(visualOtomatis(t.selesai())[0]).toEqual({ jenis: 'rantai', kepala: 'head', penunjuk: ['cur', 'n'] })
  })

  it('nama lazim (head/root) diutamakan sebagai akar; field prev menjadi rantai dua arah', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    const tipe = { data: 'int', prev: 'Node', next: 'Node' }
    const a = t.objek('Main$Node', { data: 1, prev: null, next: null }, tipe)
    t.deklarasi(main, 'baru', 'Node', a)
    t.deklarasi(main, 'head', 'Node', a)
    expect(visualOtomatis(t.selesai())[0]).toEqual({ jenis: 'rantai', kepala: 'head', sebelum: 'prev', penunjuk: ['baru'] })
  })

  it('dua field bertipe dirinya sendiri → pohon; field parent tidak dihitung', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    const akar = simpulPohon(t, 5, simpulPohon(t, 3))
    t.deklarasi(main, 'root', 'Node', akar)
    t.frame('cari', [{ nama: 'node', tipe: 'Node', nilai: akar }])
    expect(visualOtomatis(t.selesai())[0]).toEqual({ jenis: 'pohon', akar: 'root', penunjuk: ['node'] })

    const u = new PembangunTrace()
    const m = u.frame('main')
    const s = u.objek('Main$Simpul', { nilai: 1, kiri: null, kanan: null, induk: null }, { nilai: 'int', kiri: 'Simpul', kanan: 'Simpul', induk: 'Simpul' })
    u.deklarasi(m, 'akar', 'Simpul', s)
    expect(visualOtomatis(u.selesai())[0]).toEqual({ jenis: 'pohon', akar: 'akar', penunjuk: [] })

    const v = new PembangunTrace()
    const mv = v.frame('main')
    const p = v.objek('Main$Node', { data: 1, next: null, parent: null }, { data: 'int', next: 'Node', parent: 'Node' })
    v.deklarasi(mv, 'head', 'Node', p)
    expect(visualOtomatis(v.selesai())[0]).toMatchObject({ jenis: 'rantai', kepala: 'head' })
  })

  it('akar lewat objek pembungkus (daftar.head) dan lewat field static', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    const n = simpulInt(t, 7)
    const d = t.objek('Main$DaftarBerantai', { head: n, ukuran: 1 }, { head: 'Node', ukuran: 'int' })
    t.deklarasi(main, 'daftar', 'DaftarBerantai', d)
    t.frame('tambah', [{ nama: 'this', tipe: 'DaftarBerantai', nilai: d, slot: -1 }, { nama: 'baru', tipe: 'Node', nilai: n }], undefined)
    expect(visualOtomatis(t.selesai())[0]).toEqual({ jenis: 'rantai', kepala: 'daftar.head', penunjuk: ['baru'] })

    const u = new PembangunTrace()
    u.statik('kepala', 'Node', null)
    u.frame('main')
    u.tulisStatik('kepala', simpulInt(u, 1))
    expect(visualOtomatis(u.selesai())[0]).toEqual({ jenis: 'rantai', kepala: 'kepala', penunjuk: [] })
  })

  it('class generik Node<T> tetap dikenali', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    const n = t.objek('Main$Node', { isi: null, next: null }, { isi: 'T', next: 'Node<T>' })
    t.deklarasi(main, 'head', 'Node<String>', n)
    expect(visualOtomatis(t.selesai())[0]).toEqual({ jenis: 'rantai', kepala: 'head', penunjuk: [] })
  })

  it('tanpa variabel akar (simpul hanya ada di dalam koleksi) tidak menghasilkan rantai', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    simpulInt(t, 1)
    t.deklarasi(main, 'daftar', 'List<Node>', null)
    expect(visualOtomatis(t.selesai())).toEqual([
      { jenis: 'koleksi', variabel: 'daftar' },
      { jenis: 'evaluasi' },
      { jenis: 'memori' },
      { jenis: 'konsol' },
    ])
  })

  it('koleksi java.util di main dan field static menjadi visual koleksi (paling banyak dua)', () => {
    const t = new PembangunTrace()
    t.statik('cache', 'HashMap<Integer,Long>', null)
    const main = t.frame('main')
    t.deklarasi(main, 'daftar', 'ArrayList<Integer>', null)
    t.deklarasi(main, 'antre', 'Deque<String>', null)
    t.deklarasi(main, 'x', 'int', 1)
    const hasil = visualOtomatis(t.selesai())
    expect(hasil.filter((k) => k.jenis === 'koleksi')).toEqual([
      { jenis: 'koleksi', variabel: 'cache' },
      { jenis: 'koleksi', variabel: 'daftar' },
    ])
  })

  it('variabel koleksi di method lain tidak ditambahkan', () => {
    const t = new PembangunTrace()
    t.frame('main')
    const f = t.frame('bantu')
    t.deklarasi(f, 'sementara', 'ArrayList<Integer>', null)
    expect(jenis(t)).toEqual(['evaluasi', 'memori', 'konsol'])
  })

  it('class mahasiswa bernama Stack bukan koleksi java.util', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    const isi = t.array('int', [0, 0, 0])
    const s = t.objek('Main$Stack', { data: isi, top: -1 }, { data: 'int[]', top: 'int' })
    t.deklarasi(main, 's', 'Stack', s)
    expect(jenis(t)).toEqual(['evaluasi', 'memori', 'konsol'])
  })

  it('Deque/Queue: push/pop → tumpukan, offer/poll atau tipe Queue → antrean, campuran → tampilan bawaan', () => {
    const buat = (tipe: string, metode: string[], kelas = 'java.util.ArrayDeque') => {
      const t = new PembangunTrace()
      const main = t.frame('main')
      t.deklarasi(main, 'd', tipe, null)
      const d = t.objek(kelas, { head: 0, tail: 0 }, { head: 'int', tail: 'int' })
      t.tulis(main, 'd', d)
      for (const m of metode) t.emit({ k: 'pustaka', id: d, kelas, metode: m })
      return visualOtomatis(t.selesai())[0]
    }
    expect(buat('Deque<Integer>', ['push(1)', 'push(2)', 'pop()', 'peek()'])).toEqual({ jenis: 'koleksi', variabel: 'd', sebagai: 'tumpukan' })
    expect(buat('LinkedList<Integer>', ['push(1)', 'pop()'], 'java.util.LinkedList')).toEqual({ jenis: 'koleksi', variabel: 'd', sebagai: 'tumpukan' })
    expect(buat('ArrayDeque<Integer>', ['offer(1)', 'poll()'])).toEqual({ jenis: 'koleksi', variabel: 'd', sebagai: 'antrian' })
    expect(buat('Queue<Integer>', ['add(1)', 'remove()'], 'java.util.LinkedList')).toEqual({ jenis: 'koleksi', variabel: 'd', sebagai: 'antrian' })
    expect(buat('Deque<Integer>', ['push(1)', 'offerLast(2)', 'pollLast()'])).toEqual({ jenis: 'koleksi', variabel: 'd' })
    expect(buat('LinkedList<Integer>', ['add(1)', 'get(0)'], 'java.util.LinkedList')).toEqual({ jenis: 'koleksi', variabel: 'd' })
    expect(buat('ArrayList<Integer>', ['add(1)'], 'java.util.ArrayList')).toEqual({ jenis: 'koleksi', variabel: 'd' })
  })

  it('struktur + koleksi + array dibatasi tiga visual di atas panel dasar', () => {
    const t = new PembangunTrace()
    const main = t.frame('main')
    t.deklarasi(main, 'head', 'Node', simpulInt(t, 1))
    t.deklarasi(main, 'daftar', 'ArrayList<Integer>', null)
    t.deklarasi(main, 'peta', 'TreeMap<String,Integer>', null)
    t.deklarasi(main, 'a', 'int[]', t.array('int', [1]))
    t.deklarasi(main, 'b', 'int[]', t.array('int', [2]))
    expect(jenis(t)).toEqual(['rantai', 'koleksi', 'array', 'evaluasi', 'memori', 'konsol'])
  })
})
