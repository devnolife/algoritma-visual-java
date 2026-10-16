import { floatKeString } from '@/engine/format'
import { LemparanJava, type Nilai } from '@/engine/nilai'
import {
  adalahEntri,
  adalahKoleksi,
  adalahMap,
  ArrayDequeModel,
  ArrayListModel,
  ArraysAsListModel,
  CollectionsModel,
  EntriModel,
  HashMapModel,
  HashSetModel,
  KELAS_NODE,
  LinkedHashMapModel,
  LinkedHashSetModel,
  LinkedListModel,
  ListOfModel,
  modelDari,
  modelMapDari,
  PriorityQueueModel,
  StackModel,
  TampilanHashMapModel,
  TampilanTreeMapModel,
  TreeMapModel,
  TreeSetModel,
  VectorModel,
  type HeapKoleksi,
  type OperasiElemen,
} from '@/engine/pustaka/koleksi'
import { HeapUji, OpsUji } from './heapUji'
import type { Arg, Langkah, Skenario } from './skenario'

/** Memutar skenario pada model dengan heap uji, menghasilkan struktur yang sama dengan harness Java. */

type Fungsi = (h: HeapKoleksi, ops: OperasiElemen, id: number, ...arg: Nilai[]) => Nilai | void
type TabelModel = Record<string, Fungsi | undefined>

const tabel = (m: object) => m as unknown as TabelModel

const MODEL_KELAS: Record<string, TabelModel> = {
  'java.util.ArrayList': tabel(ArrayListModel),
  'java.util.LinkedList': tabel(LinkedListModel),
  'java.util.ArrayDeque': tabel(ArrayDequeModel),
  'java.util.Stack': tabel(StackModel),
  'java.util.Vector': tabel(VectorModel),
  'java.util.PriorityQueue': tabel(PriorityQueueModel),
  'java.util.Arrays$ArrayList': tabel(ArraysAsListModel),
  'java.util.ImmutableCollections$ListN': tabel(ListOfModel),
  'java.util.HashMap': tabel(HashMapModel),
  'java.util.LinkedHashMap': tabel(LinkedHashMapModel),
  'java.util.TreeMap': tabel(TreeMapModel),
  'java.util.HashSet': tabel(HashSetModel),
  'java.util.LinkedHashSet': tabel(LinkedHashSetModel),
  'java.util.TreeSet': tabel(TreeSetModel),
}
for (const v of ['KeySet', 'Values', 'EntrySet']) {
  MODEL_KELAS[`java.util.HashMap$${v}`] = tabel(TampilanHashMapModel)
  MODEL_KELAS[`java.util.LinkedHashMap$Linked${v}`] = tabel(TampilanHashMapModel)
  MODEL_KELAS[`java.util.TreeMap$${v}`] = tabel(TampilanTreeMapModel)
}

/** Konstruktor per nama kelas skenario. */
const BARU: Record<string, (h: HeapUji, angka: number[], pembanding: number | null) => number> = {
  ArrayList: (h, a) => ArrayListModel.baru(h, a[0]),
  LinkedList: (h) => LinkedListModel.baru(h),
  ArrayDeque: (h, a) => ArrayDequeModel.baru(h, a[0]),
  Stack: (h) => StackModel.baru(h),
  Vector: (h, a) => VectorModel.baru(h, a[0], a[1]),
  PriorityQueue: (h, a, c) => PriorityQueueModel.baru(h, a[0], c),
  HashMap: (h, a) => HashMapModel.baru(h, a[0], a[1]),
  LinkedHashMap: (h, a) => LinkedHashMapModel.baru(h, a[0], a[1]),
  TreeMap: (h, _a, c) => TreeMapModel.baru(h, c),
  HashSet: (h, a) => HashSetModel.baru(h, a[0], a[1]),
  LinkedHashSet: (h, a) => LinkedHashSetModel.baru(h, a[0], a[1]),
  TreeSet: (h, _a, c) => TreeSetModel.baru(h, c),
}

const DARI: Record<string, (h: HeapKoleksi, ops: OperasiElemen, sumber: Nilai) => number> = {
  ArrayList: ArrayListModel.dariKoleksi,
  LinkedList: LinkedListModel.dariKoleksi,
  ArrayDeque: ArrayDequeModel.dariKoleksi,
  Vector: VectorModel.dariKoleksi,
  PriorityQueue: PriorityQueueModel.dariKoleksi,
  HashMap: HashMapModel.dariMap,
  LinkedHashMap: LinkedHashMapModel.dariMap,
  TreeMap: TreeMapModel.dariMap,
  HashSet: HashSetModel.dariKoleksi,
  LinkedHashSet: LinkedHashSetModel.dariKoleksi,
  TreeSet: TreeSetModel.dariKoleksi,
}

/** Op skenario yang namanya berbeda dari fungsi model. */
const NAMA_MODEL: Record<string, string> = {
  mGet: 'get',
  mRemove: 'remove',
  containsNilai: 'contains',
  removeNilai: 'removeObjek',
}

/** Jenis nilai kembali per op, untuk konversi ke JSON seperti `elemJson` di harness. */
type JenisHasil = 'void' | 'ref' | 'int' | 'bool' | 'str'

const HASIL_METODE: Record<string, JenisHasil> = {
  add: 'bool',
  addIndeks: 'void',
  addAll: 'bool',
  addAllIndeks: 'bool',
  get: 'ref',
  set: 'ref',
  removeIndeks: 'ref',
  removeObjek: 'bool',
  indexOf: 'int',
  lastIndexOf: 'int',
  contains: 'bool',
  size: 'int',
  isEmpty: 'bool',
  clear: 'void',
  addFirst: 'void',
  addLast: 'void',
  offerFirst: 'bool',
  offerLast: 'bool',
  offer: 'bool',
  removeFirst: 'ref',
  removeLast: 'ref',
  pollFirst: 'ref',
  pollLast: 'ref',
  getFirst: 'ref',
  getLast: 'ref',
  peekFirst: 'ref',
  peekLast: 'ref',
  pop: 'ref',
  peek: 'ref',
  poll: 'ref',
  element: 'ref',
  remove: 'ref',
  empty: 'bool',
  search: 'int',
  trimToSize: 'void',
  ensureCapacity: 'void',
  removeFirstOccurrence: 'bool',
  removeLastOccurrence: 'bool',
  elementAt: 'ref',
  removeElementAt: 'void',
  firstElement: 'ref',
  lastElement: 'ref',
  addElement: 'void',
  insertElementAt: 'void',
  put: 'ref',
  mGet: 'ref',
  getOrDefault: 'ref',
  containsKey: 'bool',
  containsValue: 'bool',
  mRemove: 'ref',
  putIfAbsent: 'ref',
  putAll: 'void',
  containsNilai: 'bool',
  removeNilai: 'bool',
  firstKey: 'ref',
  lastKey: 'ref',
  floorKey: 'ref',
  ceilingKey: 'ref',
  higherKey: 'ref',
  lowerKey: 'ref',
  firstEntry: 'ref',
  lastEntry: 'ref',
  pollFirstEntry: 'ref',
  pollLastEntry: 'ref',
  floorEntry: 'ref',
  ceilingEntry: 'ref',
  higherEntry: 'ref',
  lowerEntry: 'ref',
  first: 'ref',
  last: 'ref',
  floor: 'ref',
  ceiling: 'ref',
  higher: 'ref',
  lower: 'ref',
}

/** Jenis argumen per op: i = int, e = elemen/kunci (tipe skenario), n = nilai map, v = variabel. */
const ARG_METODE: Record<string, string> = {
  add: 'e',
  addIndeks: 'ie',
  addAll: 'v',
  addAllIndeks: 'iv',
  get: 'i',
  set: 'ie',
  removeIndeks: 'i',
  removeObjek: 'e',
  indexOf: 'e',
  lastIndexOf: 'e',
  contains: 'e',
  addFirst: 'e',
  addLast: 'e',
  offerFirst: 'e',
  offerLast: 'e',
  offer: 'e',
  search: 'e',
  ensureCapacity: 'i',
  removeFirstOccurrence: 'e',
  removeLastOccurrence: 'e',
  push: 'e',
  elementAt: 'i',
  removeElementAt: 'i',
  addElement: 'e',
  insertElementAt: 'ei',
  put: 'en',
  mGet: 'e',
  getOrDefault: 'en',
  containsKey: 'e',
  containsValue: 'n',
  mRemove: 'e',
  putIfAbsent: 'en',
  putAll: 'v',
  containsNilai: 'n',
  removeNilai: 'n',
  floorKey: 'e',
  ceilingKey: 'e',
  higherKey: 'e',
  lowerKey: 'e',
  floorEntry: 'e',
  ceilingEntry: 'e',
  higherEntry: 'e',
  lowerEntry: 'e',
  floor: 'e',
  ceiling: 'e',
  higher: 'e',
  lower: 'e',
}

export interface GalatJava {
  kelas: string
  pesan: string | null
}

export interface HasilLangkah {
  op: Langkah
  hasil?: unknown
  galat?: GalatJava
  log: string[]
  c?: { teks: string; dalam: unknown }
  d?: { teks: string; dalam: unknown }
  it?: Record<string, unknown>
  arr?: unknown[]
  w?: { teks: string; dalam: unknown }
  e?: unknown
}

const VOID = Symbol('void')
type Kembali = typeof VOID | { j: JenisHasil; v: unknown }

export function putar(s: Skenario): { langkah: HasilLangkah[]; heap: HeapUji } {
  const h = new HeapUji()
  const ops = new OpsUji(h)
  const tipe = s.elemen ?? 'Integer'
  const v: Record<string, number | null> = { c: null, d: null, w: null, e: null }
  let it: number | null = null
  let arr: number | null = null

  const elemen = (x: Arg): Nilai => {
    if (x === null) return null
    if (typeof x === 'number') return tipe === 'K' ? h.k(x) : tipe === 'H' ? h.hk(x) : h.integer(x)
    if (x === '!orang') return h.orang()
    if (x.startsWith('@')) return v[x.slice(1)]
    return h.string(x)
  }
  /** Literal nilai map: angka selalu Integer. */
  const nilaiLit = (x: Arg): Nilai => {
    if (x === null) return null
    if (typeof x === 'number') return h.integer(x)
    if (x.startsWith('@')) return v[x.slice(1)]
    return h.string(x)
  }
  const variabel = (x: Arg): Nilai => (x === null ? null : v[String(x).slice(1)])
  const pembanding = (x: Arg): number | null =>
    x === '#log'
      ? h.pembanding('log')
      : x === '#terbalik'
        ? h.pembanding('terbalik')
        : x === '#ubah'
          ? h.pembanding('ubah')
          : null
  // Pembanding 'ubah': `((Collection) c).add(Integer.valueOf(99))` pada panggilan pertama.
  ops.ubah = () => {
    const c = v.c as number
    modelDari(h, c).add(h, ops, c, h.integer(99))
  }

  // ---------- Dump (padanan harness Java) ----------
  const elemJson = (x: Nilai): unknown => {
    if (x === null) return null
    const b = h.boks(x)
    if (b)
      return b.kelas === 'K' || b.kelas === 'H'
        ? `${b.kelas}${b.nilai}`
        : b.kelas === 'Orang'
          ? 'Orang'
          : b.nilai
    if (ops.adalahPresent(x)) return 'PRESENT'
    if (adalahEntri(h, x)) {
      const e = x as number
      return {
        entri: [elemJson(EntriModel.getKey(h, e)), elemJson(EntriModel.getValue(h, e))],
        kelas: h.kelasDari(e),
      }
    }
    if (adalahMap(h, x)) return '@peta'
    if (adalahKoleksi(h, x)) return '@koleksi'
    return `?${h.kelasDari(x as number)}`
  }
  const arrJson = (a: number) => {
    const isi: unknown[] = []
    for (let i = 0; i < h.panjangArray(a); i++) isi.push(elemJson(h.bacaElemen(a, i)))
    return isi
  }
  const f = (x: number, n: string) => h.bacaField(x, n)

  const rantai = (kol: number | null): number[] => {
    const r: number[] = []
    if (kol === null || h.kelasDari(kol) !== 'java.util.LinkedList') return r
    for (
      let x = f(kol, 'first') as number | null;
      x !== null && r.length < 10000;
      x = f(x, 'next') as number | null
    ) {
      r.push(x)
    }
    return r
  }

  const diTabel = (tab: Nilai, x: number): boolean => {
    if (tab === null) return false
    for (let i = 0; i < h.panjangArray(tab as number); i++) {
      for (
        let n = h.bacaElemen(tab as number, i) as number | null;
        n !== null;
        n = f(n, 'next') as number | null
      ) {
        if (n === x) return true
      }
    }
    return false
  }

  // Cache view map (padanan CACHE_HM/CACHE_TM di harness).
  const namaCache = (m: number) =>
    h.kelasDari(m) === 'java.util.TreeMap'
      ? ['entrySet', 'navigableKeySet', 'descendingMap', 'keySet', 'values']
      : ['entrySet', 'keySet', 'values']
  const cacheJson = (m: number) =>
    namaCache(m)
      .filter((n) => f(m, n) !== null)
      .join(',')
  /** Map yang cache view-nya dicatat: HashMap/LinkedHashMap/TreeMap atau map penopang HashSet/TreeSet. */
  const petaCache = (x: number | null): number | null => {
    if (x === null) return null
    const kelas = h.kelasDari(x)
    if (/HashSet$/.test(kelas)) return f(x, 'map') as number
    if (kelas === 'java.util.TreeSet') return f(x, 'm') as number
    return /^java\.util\.(Linked)?HashMap$|^java\.util\.TreeMap$/.test(kelas) ? x : null
  }
  const simpanCache = (x: number | null) => {
    const m = petaCache(x)
    return m === null ? null : { m, nilai: namaCache(m).map((n) => f(m, n)) }
  }
  const pulihkanCache = (s: { m: number; nilai: Nilai[] } | null) => {
    if (s === null) return
    namaCache(s.m).forEach((n, i) => {
      if (f(s.m, n) !== s.nilai[i]) h.tulisField(s.m, n, s.nilai[i])
    })
  }

  const hashJson = (m: number): Record<string, unknown> => {
    const tab = f(m, 'table')
    let table: unknown = null
    if (tab !== null) {
      const slot: unknown[] = []
      for (let i = 0; i < h.panjangArray(tab as number); i++) {
        const rantaiBin: unknown[] = []
        for (
          let n = h.bacaElemen(tab as number, i) as number | null;
          n !== null;
          n = f(n, 'next') as number | null
        ) {
          rantaiBin.push([f(n, 'hash'), elemJson(f(n, 'key')), elemJson(f(n, 'value'))])
        }
        slot.push(rantaiBin.length === 0 ? null : rantaiBin)
      }
      table = slot
    }
    const hasil: Record<string, unknown> = {
      table,
      size: f(m, 'size'),
      threshold: f(m, 'threshold'),
      modCount: f(m, 'modCount'),
      loadFactor: Number(floatKeString(f(m, 'loadFactor') as number)),
      view: cacheJson(m),
    }
    if (h.kelasDari(m) === 'java.util.LinkedHashMap') {
      let ok = true
      let prev: number | null = null
      const tautan: unknown[] = []
      for (
        let x = f(m, 'head') as number | null;
        x !== null && tautan.length < 10000;
        x = f(x, 'after') as number | null
      ) {
        if (f(x, 'before') !== prev) ok = false
        if (!diTabel(tab, x)) ok = false
        prev = x
        tautan.push([elemJson(f(x, 'key')), elemJson(f(x, 'value'))])
      }
      if (f(m, 'tail') !== prev || tautan.length !== f(m, 'size')) ok = false
      hasil.tautan = tautan
      hasil.tautanOk = ok
    }
    return hasil
  }

  const pohonJson = (x: number | null, induk: number | null, ok: { nilai: boolean }): unknown => {
    if (x === null) return null
    if (f(x, 'parent') !== induk) ok.nilai = false
    return {
      k: elemJson(f(x, 'key')),
      v: elemJson(f(x, 'value')),
      w: f(x, 'color') ? 'B' : 'R',
      l: pohonJson(f(x, 'left') as number | null, x, ok),
      r: pohonJson(f(x, 'right') as number | null, x, ok),
    }
  }

  const treeJson = (m: number) => {
    const ok = { nilai: true }
    const root = pohonJson(f(m, 'root') as number | null, null, ok)
    return {
      root,
      parentOk: ok.nilai,
      size: f(m, 'size'),
      modCount: f(m, 'modCount'),
      comparator: f(m, 'comparator') === null ? null : 'ada',
      view: cacheJson(m),
    }
  }

  const diPohon = (x: number | null, cari: number): boolean =>
    x !== null &&
    (x === cari ||
      diPohon(f(x, 'left') as number | null, cari) ||
      diPohon(f(x, 'right') as number | null, cari))

  const dalam = (x: number): unknown => {
    const kelas = h.kelasDari(x)
    switch (kelas) {
      case 'java.util.ArrayList': {
        const ed = f(x, 'elementData') as number
        const bersama =
          ed === h.bacaStatik('java.util.ArrayList', 'DEFAULTCAPACITY_EMPTY_ELEMENTDATA')
            ? 'DEFAULTCAPACITY_EMPTY_ELEMENTDATA'
            : ed === h.bacaStatik('java.util.ArrayList', 'EMPTY_ELEMENTDATA')
              ? 'EMPTY_ELEMENTDATA'
              : null
        return { elementData: arrJson(ed), bersama, size: f(x, 'size'), modCount: f(x, 'modCount') }
      }
      case 'java.util.LinkedList': {
        const simpul = rantai(x)
        let ok = true
        let prev: number | null = null
        for (const s of simpul) {
          if (f(s, 'prev') !== prev) ok = false
          prev = s
        }
        if (f(x, 'last') !== prev) ok = false
        return {
          isi: simpul.map((s) => elemJson(f(s, 'item'))),
          prevOk: ok,
          size: f(x, 'size'),
          modCount: f(x, 'modCount'),
        }
      }
      case 'java.util.ArrayDeque':
        return { elements: arrJson(f(x, 'elements') as number), head: f(x, 'head'), tail: f(x, 'tail') }
      case 'java.util.Stack':
      case 'java.util.Vector':
        return {
          elementData: arrJson(f(x, 'elementData') as number),
          elementCount: f(x, 'elementCount'),
          capacityIncrement: f(x, 'capacityIncrement'),
          modCount: f(x, 'modCount'),
        }
      case 'java.util.PriorityQueue':
        return {
          queue: arrJson(f(x, 'queue') as number),
          size: f(x, 'size'),
          modCount: f(x, 'modCount'),
          comparator: f(x, 'comparator') === null ? null : 'ada',
        }
      case 'java.util.Arrays$ArrayList':
        return { a: arrJson(f(x, 'a') as number), modCount: f(x, 'modCount') }
      case 'java.util.ImmutableCollections$ListN':
        return { isi: arrJson(f(x, 'elements') as number) }
      case 'java.util.HashMap':
      case 'java.util.LinkedHashMap':
        return hashJson(x)
      case 'java.util.TreeMap':
        return treeJson(x)
      case 'java.util.HashSet':
      case 'java.util.LinkedHashSet':
        return { map: hashJson(f(x, 'map') as number) }
      case 'java.util.TreeSet':
        return { m: treeJson(f(x, 'm') as number) }
    }
    return /\$(Linked)?(KeySet|Values|EntrySet)$/.test(kelas) ? kelas : `?${kelas}`
  }

  const teksApaPun = (x: number) =>
    adalahMap(h, x) ? modelMapDari(h, x).teks(h, ops, x) : modelDari(h, x).teks(h, ops, x)

  const teksAman = (x: number) => {
    try {
      return teksApaPun(x)
    } catch (e) {
      if (!(e instanceof LemparanJava)) throw e
      return `!${e.kelas}`
    }
  }

  const simpulJson = (node: number, kol: number | null): unknown => {
    const i = rantai(kol).indexOf(node)
    if (i >= 0) return i
    const next = f(node, 'next') === null ? '' : '>'
    const prev = f(node, 'prev') === null ? '' : '<'
    return `lepas:${ops.nama(f(node, 'item'))}${next}${prev}`
  }

  /** Simpul map yang dirujuk iterator: masih terpasang di map penopang `c` atau sudah lepas. */
  const entriRefJson = (node: number, kol: number | null): unknown => {
    let m = kol
    if (m !== null && /HashSet$/.test(h.kelasDari(m))) m = f(m, 'map') as number
    else if (m !== null && h.kelasDari(m) === 'java.util.TreeSet') m = f(m, 'm') as number
    const kelas = m === null ? '' : h.kelasDari(m)
    const pasang =
      kelas === 'java.util.HashMap' || kelas === 'java.util.LinkedHashMap'
        ? diTabel(f(m as number, 'table'), node)
        : kelas === 'java.util.TreeMap'
          ? diPohon(f(m as number, 'root') as number | null, node)
          : false
    return `${pasang ? 'N:' : 'lepas:'}${ops.nama(f(node, 'key'))}=${ops.nama(f(node, 'value'))}`
  }

  const itJson = (iter: number, kol: number | null): Record<string, unknown> => {
    const o = h.ambil(iter)
    if (o.k !== 'objek') throw new Error('iterator bukan objek')
    const hasil: Record<string, unknown> = {}
    for (const [nama, nilai] of Object.entries(o.field)) {
      const t = o.tipe[nama]
      if (nama === 'this$0') continue
      if (t === 'int' || t === 'boolean') {
        hasil[nama] = nilai
        continue
      }
      if (nilai !== null && (t.endsWith('[]') || nilai === kol)) continue
      if (nilai === null) hasil[nama] = null
      else if (t === KELAS_NODE) hasil[nama] = simpulJson(nilai as number, kol)
      else if (adalahEntri(h, nilai)) hasil[nama] = entriRefJson(nilai as number, kol)
      else if (h.kelasDari(nilai as number) === 'java.util.ArrayDeque') {
        hasil[nama] = ArrayDequeModel.toString(h, ops, nilai as number)
      } else hasil[nama] = elemJson(nilai)
    }
    return hasil
  }

  const kembali = (j: JenisHasil, x: unknown): Kembali => (j === 'void' ? VOID : { j, v: x })

  function jalankan(l: Langkah): Kembali {
    const [opPenuh, ...a] = l
    const awalan = /^([dw])\./.exec(opPenuh)
    const nv = awalan ? awalan[1] : 'c'
    const op = awalan ? opPenuh.slice(2) : opPenuh
    const target = () => {
      const id = v[nv]
      if (id === null) throw new Error(`Variabel ${nv} masih null pada ${opPenuh}`)
      return id
    }
    const panggil = (id: number, metode: string, ...arg: Nilai[]): Nilai | void => {
      const t = MODEL_KELAS[h.kelasDari(id)]
      const fn = t?.[metode]
      if (!fn) throw new Error(`Model ${h.kelasDari(id)} tidak punya ${metode}`)
      return fn(h, ops, id, ...arg)
    }
    const entri = () => v.e as number

    switch (op) {
      case 'baru': {
        // '#NaN' = Float.NaN sebagai load factor; teks lain = pembanding.
        const argumen = a.slice(1).map((x) => (x === '#NaN' ? Number.NaN : x))
        const angka = argumen.filter((x): x is number => typeof x === 'number')
        const cmp = argumen.find((x) => typeof x === 'string') as string | undefined
        v[nv] = BARU[a[0] as string](h, angka, cmp ? pembanding(cmp) : null)
        return VOID
      }
      case 'baruDari':
        v[nv] = DARI[a[0] as string](h, ops, variabel(a[1]))
        return VOID
      case 'baruDariSorted':
        v[nv] =
          a[0] === 'TreeMap'
            ? TreeMapModel.dariSortedMap(h, ops, variabel(a[1]))
            : TreeSetModel.dariSortedSet(h, ops, variabel(a[1]))
        return VOID
      case 'asList': {
        const isi = a.map(elemen)
        const larik = h.baruArray('Object', isi.length)
        isi.forEach((x, i) => h.tulisElemen(larik, i, x))
        arr = larik
        v[nv] = ArraysAsListModel.asList(h, larik)
        return VOID
      }
      case 'listOf':
        v[nv] = ListOfModel.of(h, a.map(elemen))
        return VOID
      case 'asListNull':
        ArraysAsListModel.asList(h, null)
        return VOID
      case 'listOfSama':
        return kembali('bool', ListOfModel.of(h, []) === ListOfModel.of(h, []))
      case 'arrSet': {
        const x = elemen(a[1])
        h.tulisElemen(arr as number, a[0] as number, x)
        return VOID
      }
      case 'arrTeks': {
        const isi: string[] = []
        for (let i = 0; i < h.panjangArray(arr as number); i++)
          isi.push(ops.teks(h.bacaElemen(arr as number, i)))
        return kembali('str', `[${isi.join(', ')}]`)
      }
      case 'lihatKunci':
        v.w = modelMapDari(h, target()).keySet(h, ops, target())
        return VOID
      case 'lihatNilai':
        v.w = modelMapDari(h, target()).values(h, ops, target())
        return VOID
      case 'lihatEntri':
        v.w = modelMapDari(h, target()).entrySet(h, ops, target())
        return VOID
      case 'lihatKunciNav':
        v.w = TreeMapModel.navigableKeySet(h, ops, target())
        return VOID
      case 'eAmbil': {
        const k = jalankan([a[0] as string, ...a.slice(1)])
        v.e = k === VOID ? null : (k.v as number | null)
        return kembali('ref', v.e)
      }
      case 'eEqualsDari': {
        const k = jalankan([a[0] as string, ...a.slice(1)])
        return kembali('bool', EntriModel.equals(h, ops, entri(), k === VOID ? null : (k.v as Nilai)))
      }
      case 'iterator':
        it = modelDari(h, target()).iterator(h, ops, target())
        return VOID
      case 'itHasNext':
        return kembali('bool', modelDari(h, it as number).hasNext(h, ops, it as number))
      case 'itNext':
        return kembali('ref', modelDari(h, it as number).next(h, ops, it as number))
      case 'itNextEntri':
        v.e = modelDari(h, it as number).next(h, ops, it as number) as number
        return kembali('ref', v.e)
      case 'itRemove':
        modelDari(h, it as number).remove(h, ops, it as number)
        return VOID
      case 'eSetValue':
        return kembali('ref', EntriModel.setValue(h, ops, entri(), nilaiLit(a[0])))
      case 'eGetKey':
        return kembali('ref', EntriModel.getKey(h, entri()))
      case 'eGetValue':
        return kembali('ref', EntriModel.getValue(h, entri()))
      case 'eToString':
        return kembali('str', EntriModel.toString(h, ops, entri()))
      case 'eHashCode':
        return kembali('int', EntriModel.hashCode(h, ops, entri()))
      case 'eEquals':
        return kembali('bool', EntriModel.equals(h, ops, entri(), variabel(a[0])))
      case 'toString':
        return kembali('str', teksApaPun(target()))
      case 'hashCode': {
        const id = target()
        if (adalahMap(h, id)) return kembali('int', modelMapDari(h, id).hashCode(h, ops, id))
        const hash = modelDari(h, id).hashCode
        if (!hash) throw new Error(`hashCode identitas ${h.kelasDari(id)}`)
        return kembali('int', hash(h, ops, id))
      }
      case 'equals': {
        const id = target()
        const lain = variabel(a[0])
        if (adalahMap(h, id)) return kembali('bool', modelMapDari(h, id).equals(h, ops, id, lain))
        const m = modelDari(h, id)
        return kembali('bool', m.equals ? m.equals(h, ops, id, lain) : id === lain)
      }
      case 'containsElemen': {
        const id = target()
        return kembali('bool', panggil(id, 'contains', panggil(id, 'get', a[0] as number) as Nilai))
      }
      case 'equalsSalinan': {
        const id = target()
        const salinan = DARI[a[0] as string](h, ops, id)
        const m = modelDari(h, id)
        return kembali('bool', m.equals ? m.equals(h, ops, id, salinan) : id === salinan)
      }
      case 'sort':
        panggil(target(), 'sort', pembanding(a[0]))
        return VOID
      case 'push': {
        const id = target()
        const hasil = panggil(id, 'push', elemen(a[0]))
        return h.kelasDari(id) === 'java.util.Stack' ? kembali('ref', hasil) : VOID
      }
      case 'Collections.sort':
        CollectionsModel.sort(h, ops, variabel(a[0]), null)
        return VOID
      case 'Collections.sortC':
        CollectionsModel.sort(h, ops, variabel(a[0]), pembanding(a[1]))
        return VOID
      case 'Collections.reverse':
        CollectionsModel.reverse(h, ops, variabel(a[0]))
        return VOID
      case 'Collections.swap':
        CollectionsModel.swap(h, ops, variabel(a[0]), a[1] as number, a[2] as number)
        return VOID
      case 'Collections.max':
        return kembali('ref', CollectionsModel.max(h, ops, variabel(a[0])))
      case 'Collections.maxC':
        return kembali('ref', CollectionsModel.max(h, ops, variabel(a[0]), pembanding(a[1])))
      case 'Collections.min':
        return kembali('ref', CollectionsModel.min(h, ops, variabel(a[0])))
      case 'Collections.minC':
        return kembali('ref', CollectionsModel.min(h, ops, variabel(a[0]), pembanding(a[1])))
      case 'Collections.frequency': {
        const kol = variabel(a[0])
        return kembali('int', CollectionsModel.frequency(h, ops, kol, elemen(a[1])))
      }
      case 'Collections.addAllNull':
        return kembali('bool', CollectionsModel.addAll(h, ops, variabel(a[0]), null))
      case 'Collections.addAll': {
        const kol = variabel(a[0])
        const isi = a.slice(1).map(elemen)
        const larik = h.baruArray('Object', isi.length)
        isi.forEach((x, i) => h.tulisElemen(larik, i, x))
        return kembali('bool', CollectionsModel.addAll(h, ops, kol, larik))
      }
    }

    const makro = jalankanMakro(op, nv, a)
    if (makro !== undefined) return makro

    const jenis = HASIL_METODE[op]
    if (!jenis) throw new Error(`Op tidak dikenal: ${opPenuh}`)
    const pola = ARG_METODE[op] ?? ''
    const arg = a.map((x, i) =>
      pola[i] === 'e'
        ? elemen(x)
        : pola[i] === 'n'
          ? nilaiLit(x)
          : pola[i] === 'v'
            ? variabel(x)
            : (x as Nilai),
    )
    return kembali(jenis, panggil(target(), NAMA_MODEL[op] ?? op, ...arg))
  }

  /** Makro iterasi; padanan MAKRO di skrip fixture (termasuk batas 100 putaran). */
  function jalankanMakro(op: string, nv: string, a: Arg[]): Kembali | undefined {
    const kol = () => v[nv] as number
    const m = () => modelDari(h, kol())
    const hapusObjek = (x: Nilai) => (MODEL_KELAS[h.kelasDari(kol())].removeObjek as Fungsi)(h, ops, kol(), x)
    const tambahElemen = (x: Nilai) => m().add(h, ops, kol(), x)
    const ulangiForeach = (badan: (x: Nilai) => void): Kembali | undefined => {
      const iter = m().iterator(h, ops, kol())
      let n = 0
      while (modelDari(h, iter).hasNext(h, ops, iter)) {
        const x = modelDari(h, iter).next(h, ops, iter)
        if (++n > 100) return kembali('str', 'batas')
        badan(x)
      }
      return undefined
    }
    switch (op) {
      case 'foreachHapusNilai':
        return ulangiForeach((x) => ops.nilai(x) === a[0] && hapusObjek(x)) ?? VOID
      case 'foreachHapusGenap':
        return ulangiForeach((x) => ops.nilai(x) % 2 === 0 && hapusObjek(x)) ?? VOID
      case 'foreachTambah':
        return ulangiForeach(() => tambahElemen(elemen(a[0]))) ?? VOID
      case 'foreachKumpul': {
        let s = ''
        return ulangiForeach((x) => (s += `${ops.nama(x)} `)) ?? kembali('str', s)
      }
      case 'foreachPollFirst':
        return ulangiForeach(() => ArrayDequeModel.pollFirst(h, ops, kol())) ?? VOID
      case 'itHapusSemua':
      case 'itHapusGenap': {
        const iter = m().iterator(h, ops, kol())
        const mi = modelDari(h, iter)
        let n = 0
        while (mi.hasNext(h, ops, iter)) {
          if (++n > 100) return kembali('str', 'batas')
          const x = mi.next(h, ops, iter)
          if (op === 'itHapusSemua' || ops.nilai(x) % 2 === 0) mi.remove(h, ops, iter)
        }
        return VOID
      }
    }
    return undefined
  }

  const hasilJson = (k: Exclude<Kembali, typeof VOID>): unknown =>
    k.j === 'ref' ? elemJson(k.v as Nilai) : k.v

  const langkah: HasilLangkah[] = []
  for (const l of s.langkah) {
    ops.log = []
    ops.catat = true
    const hasil: HasilLangkah = { op: l, log: ops.log }
    try {
      const k = jalankan(l)
      if (k !== VOID) hasil.hasil = hasilJson(k)
    } catch (e) {
      if (!(e instanceof LemparanJava)) throw e
      hasil.galat = { kelas: e.kelas, pesan: e.pesanJava }
    }
    ops.catat = false
    // Seperti harness: isi dalam dulu, lalu toString() dengan cache view dipulihkan sesudahnya.
    const dc = v.c === null ? null : dalam(v.c)
    const dd = v.d === null ? null : dalam(v.d)
    const dw = v.w === null ? null : dalam(v.w)
    const sc = simpanCache(v.c)
    const sd = simpanCache(v.d)
    const tc = v.c === null ? null : teksAman(v.c)
    const td = v.d === null ? null : teksAman(v.d)
    const tw = v.w === null ? null : teksAman(v.w)
    pulihkanCache(sc)
    pulihkanCache(sd)
    if (tc !== null) hasil.c = { teks: tc, dalam: dc }
    if (td !== null) hasil.d = { teks: td, dalam: dd }
    if (it !== null) hasil.it = itJson(it, v.c)
    if (arr !== null) hasil.arr = arrJson(arr)
    if (tw !== null) hasil.w = { teks: tw, dalam: dw }
    if (v.e !== null) hasil.e = elemJson(v.e)
    langkah.push(hasil)
  }
  return { langkah, heap: h }
}
