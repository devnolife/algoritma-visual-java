/**
 * Skenario fixture untuk harness visual pengembangan (`#/uji-visual`). Setiap skenario adalah trace sintetis
 * berisi beberapa langkah, sehingga sorotan per langkah ikut teruji. Koleksi dibuat dengan model JDK sungguhan.
 */
import type { Nilai } from '@/engine/nilai'
import {
  ArrayDequeModel,
  ArrayListModel,
  HashMapModel,
  HashSetModel,
  LinkedHashMapModel,
  LinkedListModel,
  PriorityQueueModel,
  StackModel,
  TreeMapModel,
} from '@/engine/pustaka/koleksi'
import type { Trace } from '@/engine/trace'
import type { KonfigVisual } from '@/viz/Panggung'
import { PembangunTrace, simpulInt, simpulPohon } from '@/viz/uji/pembangunTrace'

export interface Skenario {
  id: string
  judul: string
  konfig: KonfigVisual[]
  trace: Trace
}

const ARGS = { nama: 'args', tipe: 'String[]', nilai: null }

/** Nilai variabel `nama` di frame terbawah (main). */
const nilaiMain = (t: PembangunTrace, nama: string) => t.state.frames[0].vars.find((v) => v.nama === nama)?.nilai ?? null
const slotMain = (t: PembangunTrace, nama: string) => t.state.frames[0].vars.find((v) => v.nama === nama)!.slot
const field = (t: PembangunTrace, id: number, f: string) => (t.state.heap[id] as { field: Record<string, Nilai> }).field[f]

function memoriObjek(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  t.catat(3, 'mulai')
  const tipeMhs = { nama: 'String', ipk: 'double', alamat: 'Alamat' }
  const a = t.objek('Main$Mahasiswa', { nama: null, ipk: 0, alamat: null }, tipeMhs)
  const k = t.frame('Mahasiswa', [{ nama: 'this', tipe: 'Mahasiswa', nilai: a, slot: -1 }, { nama: 'nama', tipe: 'String', nilai: t.str('Ani') }, { nama: 'ipk', tipe: 'double', nilai: 3.5 }], 'konstruktor')
  t.catat(9, 'panggil')
  t.tulisField(a, 'nama', t.str('Ani'))
  t.catat(10)
  t.tulisField(a, 'ipk', 3.5)
  t.catat(11)
  t.emit({ k: 'kembali', frame: k, method: 'Mahasiswa', jenis: 'konstruktor' })
  t.buangFrame(k)
  t.deklarasi(main, 'a', 'Mahasiswa', a)
  t.catat(20)
  const al = t.objek('Main$Alamat', { kota: t.str('Makassar'), kodePos: 90222 }, { kota: 'String', kodePos: 'int' })
  t.tulisField(a, 'alamat', al)
  t.catat(21)
  t.deklarasi(main, 'b', 'Mahasiswa', a)
  t.catat(22)
  t.tulisField(a, 'ipk', 3.75)
  t.catat(23)
  t.deklarasi(main, 'c', 'Mahasiswa', null)
  t.catat(24)
  const tm = t.frame('tampilkan', [{ nama: 'this', tipe: 'Mahasiswa', nilai: a, slot: -1 }])
  t.bacaField(a, 'nama')
  t.catat(14, 'panggil')
  t.buangFrame(tm)
  t.catat(25, 'selesai')
  return { id: 'memori-objek', judul: 'Memori: objek, this, referensi bersama', konfig: [{ jenis: 'memori' }], trace: t.selesai() }
}

function memoriBoks(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  t.catat(3, 'mulai')
  t.deklarasi(main, 'a', 'Integer', t.int(127))
  t.catat(4)
  t.deklarasi(main, 'b', 'Integer', t.int(127))
  t.catat(5)
  t.deklarasi(main, 'c', 'Integer', t.int(128))
  t.catat(6)
  t.deklarasi(main, 'd', 'Integer', t.int(128))
  t.catat(7)
  const sb = t.alokasi({ k: 'pembangun', nilai: '' })
  t.deklarasi(main, 'sb', 'StringBuilder', sb)
  t.catat(8)
  t.emit({ k: 'tulis-pembangun', id: sb, lama: '', baru: 'Halo', metode: 'append' })
  t.catat(9)
  t.emit({ k: 'tulis-pembangun', id: sb, lama: 'Halo', baru: 'Halo, Dunia', metode: 'append' })
  t.catat(10)
  const daftar = ArrayListModel.baru(t.h)
  for (const x of [3, 1, 4]) ArrayListModel.add(t.h, t.ops, daftar, t.int(x))
  t.deklarasi(main, 'daftar', 'ArrayList<Integer>', daftar)
  t.catat(11)
  ArrayListModel.add(t.h, t.ops, daftar, t.int(1))
  t.catat(12)
  return { id: 'memori-boks', judul: 'Memori: cache Integer, StringBuilder, kartu koleksi', konfig: [{ jenis: 'memori' }], trace: t.selesai() }
}

function exception(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  t.catat(14, 'mulai')
  const gudang = t.objek('Main$Gudang', { stok: 0 }, { stok: 'int' })
  t.deklarasi(main, 'g', 'Gudang', gudang)
  t.catat(15)
  const proses = t.frame('proses', [{ nama: 'g', tipe: 'Gudang', nilai: gudang }])
  t.catat(9, 'panggil')
  const ambil = t.frame('ambil', [{ nama: 'this', tipe: 'Gudang', nilai: gudang, slot: -1 }, { nama: 'n', tipe: 'int', nilai: 2 }])
  t.catat(4, 'panggil')
  t.bacaField(gudang, 'stok')
  t.catat(5, 'kondisi')
  const jejak = ['\tat Main$Gudang.ambil(Main.java:5)', '\tat Main.proses(Main.java:9)', '\tat Main.main(Main.java:17)']
  const exc = t.objek('java.lang.IllegalStateException', { detailMessage: t.str('Stok habis') }, { detailMessage: 'String' }, jejak)
  t.emit({ k: 'lempar', kelas: 'java.lang.IllegalStateException', pesan: 'Stok habis', id: exc })
  t.catat(5)
  t.emit({ k: 'rambat', frame: ambil, method: 'ambil', kelas: 'java.lang.IllegalStateException' })
  t.buangFrame(ambil)
  t.emit({ k: 'rambat', frame: proses, method: 'proses', kelas: 'java.lang.IllegalStateException' })
  t.buangFrame(proses)
  t.emit({ k: 'tangkap', kelas: 'java.lang.IllegalStateException', tipe: 'IllegalStateException', variabel: 'e', id: exc })
  t.deklarasi(main, 'e', 'IllegalStateException', exc)
  t.catat(18)
  t.cetak('Gagal: Stok habis\n')
  t.catat(19)
  t.emit({ k: 'finally', sebab: 'exception' })
  t.catat(21)
  return { id: 'exception', judul: 'Alur exception: lempar → rambat → catch → finally', konfig: [{ jenis: 'memori' }, { jenis: 'konsol' }], trace: t.selesai() }
}

function rantai(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  t.catat(10, 'mulai')
  t.deklarasi(main, 'head', 'Node', null)
  t.catat(11)
  // Sisip depan 3, 2, 1.
  for (const x of [3, 2, 1]) {
    const n = simpulInt(t, x)
    t.deklarasi(main, 'baru', 'Node', n)
    t.catat(13)
    t.tulisField(n, 'next', nilaiMain(t, 'head'))
    t.catat(14)
    t.tulis(main, 'head', n)
    t.catat(15)
    t.emit({ k: 'hapus-var', frame: main, slot: slotMain(t, 'baru'), nama: 'baru' })
  }
  // Telusuri dengan curr.
  const head = nilaiMain(t, 'head') as number
  t.deklarasi(main, 'curr', 'Node', head)
  t.catat(18)
  let curr: Nilai = head
  while (curr !== null) {
    t.bacaField(curr as number, 'data')
    t.catat(19, 'kondisi')
    t.bacaField(curr as number, 'next')
    curr = field(t, curr as number, 'next')
    t.tulis(main, 'curr', curr)
    t.catat(20)
  }
  // Sisip setelah simpul kedua.
  const kedua = field(t, head, 'next') as number
  const baru = simpulInt(t, 9)
  t.deklarasi(main, 'baru', 'Node', baru)
  t.catat(23)
  t.tulisField(baru, 'next', field(t, kedua, 'next'))
  t.catat(24)
  t.tulisField(kedua, 'next', baru)
  t.catat(25)
  return {
    id: 'rantai',
    judul: 'rantai: sisip depan, telusuri dengan curr, sisip di tengah',
    konfig: [{ jenis: 'rantai', kepala: 'head', penunjuk: ['curr', 'baru'] }, { jenis: 'memori' }],
    trace: t.selesai(),
  }
}

function rantaiBalik(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const ns: number[] = []
  let berikut: Nilai = null
  for (const x of [4, 3, 2, 1]) {
    berikut = simpulInt(t, x, berikut)
    ns.unshift(berikut)
  }
  t.deklarasi(main, 'head', 'Node', ns[0])
  t.catat(5, 'mulai')
  const f = t.frame('balik', [{ nama: 'head', tipe: 'Node', nilai: ns[0] }])
  t.deklarasi(f, 'prev', 'Node', null)
  t.deklarasi(f, 'curr', 'Node', ns[0])
  t.catat(12, 'panggil')
  let prev: number | null = null
  for (let i = 0; i < 2; i++) {
    const c = ns[i]
    const nx = ns[i + 1] ?? null
    if (i === 0) t.deklarasi(f, 'next', 'Node', nx)
    else t.tulis(f, 'next', nx)
    t.catat(14)
    t.tulisField(c, 'next', prev)
    t.catat(15)
    t.tulis(f, 'prev', c)
    t.tulis(f, 'curr', nx)
    prev = c
    t.catat(16)
  }
  // Rantai melingkar: simpul terakhir menunjuk kembali ke simpul ketiga.
  t.tulisField(ns[3], 'next', ns[2])
  t.catat(30)
  return {
    id: 'rantai-balik',
    judul: 'rantai: pembalikan (beberapa baris) lalu rantai melingkar',
    konfig: [{ jenis: 'rantai', kepala: 'head', penunjuk: ['prev', 'curr', 'next'] }, { jenis: 'memori' }],
    trace: t.selesai(),
  }
}

function rantaiDua(): Skenario {
  const t = new PembangunTrace()
  const tipe = { data: 'String', prev: 'DNode', next: 'DNode' }
  const main = t.frame('main', [ARGS])
  const a = t.objek('Main$DNode', { data: t.str('A'), prev: null, next: null }, tipe)
  t.deklarasi(main, 'head', 'DNode', a)
  t.deklarasi(main, 'tail', 'DNode', a)
  t.catat(8, 'mulai')
  for (const s of ['B', 'C']) {
    const n = t.objek('Main$DNode', { data: t.str(s), prev: null, next: null }, tipe)
    t.deklarasi(main, 'baru', 'DNode', n)
    t.catat(10)
    const ekor = nilaiMain(t, 'tail') as number
    t.tulisField(ekor, 'next', n)
    t.catat(11)
    t.tulisField(n, 'prev', ekor)
    t.catat(12)
    t.tulis(main, 'tail', n)
    t.emit({ k: 'hapus-var', frame: main, slot: slotMain(t, 'baru'), nama: 'baru' })
    t.catat(13)
  }
  return {
    id: 'rantai-dua',
    judul: 'rantai dua arah (prev/next) dengan head dan tail',
    konfig: [{ jenis: 'rantai', kepala: 'head', sebelum: 'prev', penunjuk: ['tail', 'baru'] }, { jenis: 'memori' }],
    trace: t.selesai(),
  }
}

function pohon(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  t.deklarasi(main, 'root', 'Node', null)
  t.catat(20, 'mulai')
  const sisip = (x: number) => {
    const baru = simpulPohon(t, x)
    const root = nilaiMain(t, 'root') as number | null
    const f = t.frame('sisip', [{ nama: 'x', tipe: 'int', nilai: x }])
    t.deklarasi(f, 'baru', 'Node', baru)
    t.catat(8, 'panggil')
    if (root === null) {
      t.tulis(main, 'root', baru)
      t.catat(9)
      t.buangFrame(f)
      return
    }
    t.deklarasi(f, 'curr', 'Node', root)
    t.catat(10)
    let curr = root
    for (;;) {
      const kiri = x < (field(t, curr, 'data') as number)
      const anak = field(t, curr, kiri ? 'left' : 'right') as number | null
      t.bacaField(curr, 'data')
      t.catat(12, 'kondisi')
      if (anak === null) {
        t.tulisField(curr, kiri ? 'left' : 'right', baru)
        t.catat(kiri ? 13 : 15)
        break
      }
      t.bacaField(curr, kiri ? 'left' : 'right')
      t.tulis(f, 'curr', anak)
      curr = anak
      t.catat(kiri ? 14 : 16)
    }
    t.buangFrame(f)
  }
  for (const x of [8, 3, 10, 1, 6, 14, 4]) sisip(x)
  t.catat(25)
  return {
    id: 'pohon',
    judul: 'pohon: sisip BST dengan penunjuk curr dan simpul baru yang belum tersambung',
    konfig: [{ jenis: 'pohon', akar: 'root', penunjuk: ['curr', 'baru'] }, { jenis: 'memori' }],
    trace: t.selesai(),
  }
}

function tumpukan(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const data = t.array('int', [0, 0, 0, 0, 0])
  t.deklarasi(main, 'data', 'int[]', data)
  t.deklarasi(main, 'top', 'int', -1)
  const st = ArrayDequeModel.baru(t.h)
  t.deklarasi(main, 'st', 'Deque<Integer>', st)
  t.catat(5, 'mulai')
  for (const x of [4, 7, 9]) {
    const top = nilaiMain(t, 'top') as number
    t.tulis(main, 'top', top + 1)
    t.tulisElemen(data, top + 1, x)
    t.emit({ k: 'pustaka', id: st, kelas: 'java.util.ArrayDeque', metode: 'push' })
    ArrayDequeModel.addFirst(t.h, t.ops, st, t.int(x))
    t.catat(8)
  }
  t.tulis(main, 'top', 1)
  ArrayDequeModel.pollFirst(t.h, t.ops, st)
  t.catat(12)
  return {
    id: 'tumpukan',
    judul: 'tumpukan: array + top dan ArrayDeque push/pop',
    konfig: [
      { jenis: 'tumpukan', variabel: 'data', puncak: 'top' },
      { jenis: 'tumpukan', variabel: 'st' },
    ],
    trace: t.selesai(),
  }
}

function antrian(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const q = t.array('int', [0, 0, 0, 0, 0])
  t.deklarasi(main, 'q', 'int[]', q)
  t.deklarasi(main, 'depan', 'int', 0)
  t.deklarasi(main, 'belakang', 'int', -1)
  t.deklarasi(main, 'ukuran', 'int', 0)
  const dq = ArrayDequeModel.baru(t.h)
  t.deklarasi(main, 'loket', 'Queue<String>', dq)
  t.catat(6, 'mulai')
  const v = (n: string) => nilaiMain(t, n) as number
  const masuk = (x: number) => {
    const b = (v('belakang') + 1) % 5
    t.tulis(main, 'belakang', b)
    t.tulisElemen(q, b, x)
    t.tulis(main, 'ukuran', v('ukuran') + 1)
    t.catat(9)
  }
  const keluar = () => {
    t.baca(main, 'depan')
    t.tulis(main, 'depan', (v('depan') + 1) % 5)
    t.tulis(main, 'ukuran', v('ukuran') - 1)
    t.catat(14)
  }
  for (const x of [10, 20, 30, 40]) masuk(x)
  keluar()
  keluar()
  masuk(50)
  masuk(60)
  for (const s of ['Ani', 'Budi', 'Citra']) ArrayDequeModel.addLast(t.h, t.ops, dq, t.str(s))
  t.catat(20)
  ArrayDequeModel.pollFirst(t.h, t.ops, dq)
  t.catat(21)
  return {
    id: 'antrian',
    judul: 'antrian: array melingkar (depan/belakang/ukuran) dan Queue',
    konfig: [
      { jenis: 'antrian', variabel: 'q', depan: 'depan', belakang: 'belakang', ukuran: 'ukuran' },
      { jenis: 'antrian', variabel: 'loket' },
    ],
    trace: t.selesai(),
  }
}

function tabelHash(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const tabel = t.array('Entry', [null, null, null, null, null])
  t.deklarasi(main, 'tabel', 'Entry[]', tabel)
  t.catat(10, 'mulai')
  const tipe = { kunci: 'String', nilai: 'int', next: 'Entry' }
  const masuk = (k: string, n: number, idx: number) => {
    t.deklarasi(main, 'idx', 'int', idx)
    t.catat(12)
    const lama = (t.state.heap[tabel] as { nilai: Nilai[] }).nilai[idx]
    const e = t.objek('Main$Entry', { kunci: t.str(k), nilai: n, next: lama }, tipe)
    t.tulisElemen(tabel, idx, e)
    t.catat(13)
    t.emit({ k: 'hapus-var', frame: main, slot: slotMain(t, 'idx'), nama: 'idx' })
  }
  masuk('apel', 3, 1)
  masuk('ceri', 7, 3)
  masuk('duku', 1, 1)
  masuk('jeruk', 4, 1)
  t.deklarasi(main, 'p', 'Entry', (t.state.heap[tabel] as { nilai: Nilai[] }).nilai[1])
  t.catat(20)
  const hm = HashMapModel.baru(t.h)
  for (const [k, n] of [['apel', 3], ['ceri', 7], ['duku', 1]] as const) HashMapModel.put(t.h, t.ops, hm, t.str(k), t.int(n))
  t.deklarasi(main, 'peta', 'HashMap<String,Integer>', hm)
  t.catat(22)
  return {
    id: 'tabel-hash',
    judul: 'tabelHash: chaining manual (tabrakan) dan table HashMap',
    konfig: [
      { jenis: 'tabelHash', variabel: 'tabel', penunjuk: ['idx', 'p'] },
      { jenis: 'tabelHash', variabel: 'peta' },
    ],
    trace: t.selesai(),
  }
}

function koleksiList(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const daftar = ArrayListModel.baru(t.h)
  t.deklarasi(main, 'daftar', 'ArrayList<Integer>', daftar)
  t.catat(4, 'mulai')
  for (let i = 1; i <= 11; i++) {
    t.emit({ k: 'pustaka', id: daftar, kelas: 'java.util.ArrayList', metode: 'add' })
    ArrayListModel.add(t.h, t.ops, daftar, t.int(i * 10))
    t.catat(6)
  }
  ArrayListModel.removeIndeks(t.h, t.ops, daftar, 1)
  t.catat(8)
  return {
    id: 'koleksi-list',
    judul: 'koleksi: ArrayList tumbuh 10 → 15 (isi dalam: elementData)',
    konfig: [{ jenis: 'koleksi', variabel: 'daftar', isiDalam: true }, { jenis: 'memori' }],
    trace: t.selesai(),
  }
}

function koleksiMap(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const hm = HashMapModel.baru(t.h)
  t.deklarasi(main, 'frekuensi', 'HashMap<String,Integer>', hm)
  t.catat(4, 'mulai')
  for (const kata of ['apel', 'ceri', 'apel', 'duku', 'ceri', 'apel']) {
    const ada = HashMapModel.get(t.h, t.ops, hm, t.str(kata))
    const n = ada === null ? 0 : ((t.state.heap[ada as number] as { nilai: number }).nilai as number)
    HashMapModel.put(t.h, t.ops, hm, t.str(kata), t.int(n + 1))
    t.catat(7)
  }
  return {
    id: 'koleksi-map',
    judul: 'koleksi: HashMap frekuensi kata (isi dalam: table + Node)',
    konfig: [{ jenis: 'koleksi', variabel: 'frekuensi', isiDalam: true }],
    trace: t.selesai(),
  }
}

function koleksiLain(dalam: boolean): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const ll = LinkedListModel.baru(t.h)
  for (const x of [5, 6, 7]) LinkedListModel.addLast(t.h, t.ops, ll, t.int(x))
  t.deklarasi(main, 'll', 'LinkedList<Integer>', ll)
  const dq = ArrayDequeModel.baru(t.h, 4)
  for (const x of [1, 2, 3, 4]) ArrayDequeModel.addLast(t.h, t.ops, dq, t.int(x))
  ArrayDequeModel.pollFirst(t.h, t.ops, dq)
  ArrayDequeModel.pollFirst(t.h, t.ops, dq)
  ArrayDequeModel.addLast(t.h, t.ops, dq, t.int(5))
  ArrayDequeModel.addLast(t.h, t.ops, dq, t.int(6))
  t.deklarasi(main, 'dq', 'ArrayDeque<Integer>', dq)
  const pq = PriorityQueueModel.baru(t.h)
  for (const x of [5, 1, 8, 3, 2]) PriorityQueueModel.offer(t.h, t.ops, pq, t.int(x))
  t.deklarasi(main, 'pq', 'PriorityQueue<Integer>', pq)
  const tm = TreeMapModel.baru(t.h)
  for (const [k, v] of [[50, 'e'], [20, 'b'], [70, 'g'], [10, 'a'], [30, 'c'], [60, 'f']] as const) TreeMapModel.put(t.h, t.ops, tm, t.int(k), t.str(v))
  t.deklarasi(main, 'tm', 'TreeMap<Integer,String>', tm)
  const hs = HashSetModel.baru(t.h)
  for (const s of ['kucing', 'anjing', 'ikan']) HashSetModel.add(t.h, t.ops, hs, t.str(s))
  t.deklarasi(main, 'hs', 'HashSet<String>', hs)
  const lhm = LinkedHashMapModel.baru(t.h)
  for (const [k, v] of [['z', 1], ['a', 2], ['m', 3]] as const) LinkedHashMapModel.put(t.h, t.ops, lhm, t.str(k), t.int(v))
  t.deklarasi(main, 'lhm', 'LinkedHashMap<String,Integer>', lhm)
  const st = StackModel.baru(t.h)
  for (const x of [1, 2, 3]) StackModel.push(t.h, t.ops, st, t.int(x))
  t.deklarasi(main, 'st', 'Stack<Integer>', st)
  t.catat(4, 'mulai')
  PriorityQueueModel.offer(t.h, t.ops, pq, t.int(0))
  TreeMapModel.put(t.h, t.ops, tm, t.int(25), t.str('x'))
  LinkedListModel.addFirst(t.h, t.ops, ll, t.int(4))
  t.catat(9)
  const nama = ['ll', 'dq', 'pq', 'tm', 'hs', 'lhm', 'st']
  return {
    id: dalam ? 'koleksi-dalam' : 'koleksi-abstrak',
    judul: dalam ? 'koleksi: isi dalam semua jenis' : 'koleksi: tampilan abstrak semua jenis',
    konfig: nama.map((n) => ({ jenis: 'koleksi' as const, variabel: n, isiDalam: dalam })),
    trace: t.selesai(),
  }
}

function grafDaftar(): Skenario {
  const t = new PembangunTrace()
  const main = t.frame('main', [ARGS])
  const adj = ArrayListModel.baru(t.h)
  for (const isi of [[1, 2], [0, 3], [0, 3, 4], [1, 2], [2]]) {
    const d = ArrayListModel.baru(t.h)
    for (const x of isi) ArrayListModel.add(t.h, t.ops, d, t.int(x))
    ArrayListModel.add(t.h, t.ops, adj, d)
  }
  t.deklarasi(main, 'adj', 'ArrayList<ArrayList<Integer>>', adj)
  const dikunjungi = t.array('boolean', [true, false, false, false, false])
  t.deklarasi(main, 'dikunjungi', 'boolean[]', dikunjungi)
  const antre = ArrayDequeModel.baru(t.h)
  ArrayDequeModel.addLast(t.h, t.ops, antre, t.int(0))
  t.deklarasi(main, 'antre', 'Queue<Integer>', antre)
  t.catat(10, 'mulai')
  ArrayDequeModel.pollFirst(t.h, t.ops, antre)
  t.deklarasi(main, 'u', 'int', 0)
  t.catat(12)
  for (const v of [1, 2]) {
    t.deklarasi(main, 'v', 'int', v)
    t.catat(13)
    t.tulisElemen(dikunjungi, v, true)
    ArrayDequeModel.addLast(t.h, t.ops, antre, t.int(v))
    t.catat(15)
    t.emit({ k: 'hapus-var', frame: main, slot: slotMain(t, 'v'), nama: 'v' })
  }
  return {
    id: 'graf-daftar',
    judul: 'graf: daftar ketetanggaan ArrayList<ArrayList<Integer>> + BFS',
    konfig: [
      { jenis: 'graf', variabel: 'adj', dikunjungi: 'dikunjungi', simpul: ['u', 'v'] },
      { jenis: 'koleksi', variabel: 'antre' },
    ],
    trace: t.selesai(),
  }
}

let cache: Skenario[] | null = null

export function semuaSkenario(): Skenario[] {
  cache ??= [
    memoriObjek(),
    memoriBoks(),
    exception(),
    rantai(),
    rantaiBalik(),
    rantaiDua(),
    pohon(),
    tumpukan(),
    antrian(),
    tabelHash(),
    koleksiList(),
    koleksiMap(),
    koleksiLain(false),
    koleksiLain(true),
    grafDaftar(),
  ]
  return cache
}
