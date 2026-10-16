import type * as A from './ast'
import type { ProgramTerperiksa } from './checker'
import type { Span, Sumber } from './sumber'

/** Daftar anak langsung sebuah node pernyataan/ekspresi (untuk penelusuran AST). */
export function anakNode(n: A.Pernyataan | A.Ekspresi): (A.Pernyataan | A.Ekspresi)[] {
  switch (n.jenis) {
    case 'Blok':
      return n.pernyataan
    case 'DeklarasiLokal':
      return n.deklarator.flatMap((d) => (d.init ? [d.init] : []))
    case 'PernyataanEkspresi':
      return [n.ekspresi]
    case 'If':
      return [n.kondisi, n.maka, ...(n.lain ? [n.lain] : [])]
    case 'While':
      return [n.kondisi, n.badan]
    case 'DoWhile':
      return [n.badan, n.kondisi]
    case 'For':
      return [...n.init, ...(n.kondisi ? [n.kondisi] : []), ...n.update, n.badan]
    case 'ForEach':
      return [n.iterable, n.badan]
    case 'Switch':
      return [n.selektor, ...n.grup.flatMap((g) => [...g.label.filter((l): l is A.Ekspresi => l !== 'default'), ...g.pernyataan])]
    case 'Return':
      return n.ekspresi ? [n.ekspresi] : []
    case 'Break':
    case 'Continue':
    case 'Kosong':
    case 'Literal':
    case 'Nama':
      return []
    case 'AksesField':
      return [n.objek]
    case 'AksesArray':
      return [n.array, n.indeks]
    case 'PanggilMethod':
      return [...(n.objek ? [n.objek] : []), ...n.argumen]
    case 'InisialisasiArray':
      return n.elemen
    case 'BaruArray':
      return [...n.dimensi, ...(n.init ? [n.init] : [])]
    case 'BaruObjek':
      return n.argumen
    case 'Unary':
      return [n.operand]
    case 'IncDec':
      return [n.target]
    case 'Biner':
      return [n.kiri, n.kanan]
    case 'Assign':
      return [n.target, n.nilai]
    case 'Kondisional':
      return [n.kondisi, n.ya, n.tidak]
    case 'Cast':
      return [n.ekspresi]
    case 'This':
      return []
    case 'Lambda':
      return [n.badan]
    case 'PanggilKonstruktor':
      return n.argumen
    case 'Try':
      return [n.blok, ...n.tangkap.map((t) => t.badan), ...(n.akhirnya ? [n.akhirnya] : [])]
    case 'Throw':
      return [n.ekspresi]
  }
}

function telusuri(n: A.Pernyataan | A.Ekspresi, kunjungi: (n: A.Pernyataan | A.Ekspresi) => void): void {
  kunjungi(n)
  for (const a of anakNode(n)) telusuri(a, kunjungi)
}

const NAMA_KONSTRUKSI: Partial<Record<string, string>> = {
  For: 'for',
  ForEach: 'for-each',
  While: 'while',
  DoWhile: 'do-while',
  If: 'if',
  Switch: 'switch',
  Cast: 'casting',
  Kondisional: 'ternary',
  BaruArray: 'array',
  InisialisasiArray: 'array',
  Break: 'break',
  Continue: 'continue',
}

/** Semua deklarasi class (top-level dan bersarang) dalam program. */
export function semuaDeklarasiKelas(program: ProgramTerperiksa): A.DeklarasiKelas[] {
  const hasil: A.DeklarasiKelas[] = []
  const kunjungi = (k: A.DeklarasiKelas) => {
    hasil.push(k)
    for (const x of k.kelas ?? []) kunjungi(x)
  }
  for (const k of program.unit.kelas.length ? program.unit.kelas : [program.kelas]) kunjungi(k)
  return hasil
}

const KELAS_KOLEKSI = new Set([
  'ArrayList', 'LinkedList', 'ArrayDeque', 'Stack', 'Vector', 'PriorityQueue', 'HashMap', 'LinkedHashMap', 'TreeMap',
  'HashSet', 'LinkedHashSet', 'TreeSet',
])

/**
 * Konstruksi Java yang dipakai program, untuk cek tantangan `harusMemakai`/`dilarangMemakai`.
 * Hasil: for, while, do-while, for-each, if, switch, casting, ternary, array, scanner, rekursi, method:<nama>,
 * pustaka:<Kelas.method>, dan (Fase 2) class:<Nama>, konstruktor, objek, try, throw, lambda, koleksi:<Kelas>.
 */
export function analisisKonstruksi(program: ProgramTerperiksa): string[] {
  const hasil = new Set<string>()
  const memanggil = new Map<string, Set<string>>()
  const telusuriMethod = (m: A.DeklarasiMethod) => {
    if (!m.konstruktor) hasil.add(`method:${m.nama}`)
    else hasil.add('konstruktor')
    const dipanggil = memanggil.get(m.nama) ?? new Set<string>()
    telusuri(m.badan, (n) => kunjungiNode(n, dipanggil))
    if (!m.konstruktor) memanggil.set(m.nama, dipanggil)
  }
  const kunjungiNode = (n: A.Pernyataan | A.Ekspresi, dipanggil?: Set<string>) => {
    const k = NAMA_KONSTRUKSI[n.jenis]
    if (k) hasil.add(k)
    if (n.jenis === 'BaruObjek') {
      const t = n.target
      if (t?.k === 'pustaka' && t.id.startsWith('Scanner.')) hasil.add('scanner')
      if (t?.k === 'user') hasil.add('objek')
      if (t?.k === 'pustaka') {
        const kelas = t.id.slice(0, t.id.indexOf('.'))
        if (KELAS_KOLEKSI.has(kelas)) hasil.add(`koleksi:${kelas}`)
      }
    }
    if (n.jenis === 'PanggilMethod' && n.target?.k === 'user') dipanggil?.add(n.target.method.nama)
    if (n.jenis === 'PanggilMethod' && n.target?.k === 'pustaka') {
      hasil.add(`pustaka:${n.target.id.slice(0, n.target.id.indexOf('('))}`)
      // Juga menurut tipe statis penerimanya, mis. `daftar.add(x)` dengan `ArrayList<Integer> daftar` → pustaka:ArrayList.add.
      const t = n.objek?.tipe
      if (t?.k === 'kelas') hasil.add(`pustaka:${t.nama}.${n.nama}`)
    }
    if (n.jenis === 'Try') hasil.add('try')
    if (n.jenis === 'Throw') hasil.add('throw')
    if (n.jenis === 'Lambda') hasil.add('lambda')
  }
  for (const kelas of semuaDeklarasiKelas(program)) {
    if (kelas !== program.kelas) hasil.add(`class:${kelas.nama}`)
    for (const m of kelas.method) telusuriMethod(m)
    for (const m of kelas.konstruktor ?? []) telusuriMethod(m)
    for (const f of kelas.field) for (const d of f.deklarator) if (d.init) telusuri(d.init, (n) => kunjungiNode(n))
  }
  // Rekursi: ada method yang (langsung/tidak langsung) memanggil dirinya sendiri.
  for (const awal of memanggil.keys()) {
    const dikunjungi = new Set<string>()
    const tumpukan = [...(memanggil.get(awal) ?? [])]
    while (tumpukan.length) {
      const x = tumpukan.pop()!
      if (x === awal) {
        hasil.add('rekursi')
        break
      }
      if (dikunjungi.has(x)) continue
      dikunjungi.add(x)
      tumpukan.push(...(memanggil.get(x) ?? []))
    }
  }
  return [...hasil].sort()
}

/**
 * Baris yang bisa mendapat langkah saat program berjalan (pernyataan, kondisi, header method).
 * Baris seperti `} else {`, `case 1:`, `do {`, atau lanjutan pernyataan multi-baris tidak termasuk,
 * jadi editor hanya meredupkan baris yang memang bisa dijalankan tetapi tidak pernah dijalankan.
 */
export function barisBisaDijalankan(program: ProgramTerperiksa, sumber: Sumber): number[] {
  const hasil = new Set<number>()
  const tambah = (span: Span) => hasil.add(sumber.baris(span.awal))
  const kunjungi = (p: A.Pernyataan): void => {
    switch (p.jenis) {
      case 'Blok':
        p.pernyataan.forEach(kunjungi)
        return
      case 'Kosong':
        return
      case 'DeklarasiLokal':
      case 'PernyataanEkspresi':
      case 'Break':
      case 'Continue':
      case 'Return':
        tambah(p.span)
        return
      case 'If':
        tambah(p.kondisi.span)
        kunjungi(p.maka)
        if (p.lain) kunjungi(p.lain)
        return
      case 'While':
        tambah(p.kondisi.span)
        kunjungi(p.badan)
        return
      case 'DoWhile':
        tambah(p.spanKondisi)
        kunjungi(p.badan)
        return
      case 'For':
        if (p.init.length) tambah(p.init[0].span)
        if (p.kondisi) tambah(p.kondisi.span)
        if (p.update.length) tambah(p.update[0].span)
        kunjungi(p.badan)
        return
      case 'ForEach':
        tambah(p.span)
        kunjungi(p.badan)
        return
      case 'Switch':
        tambah(p.span)
        for (const g of p.grup) g.pernyataan.forEach(kunjungi)
        return
      case 'Throw':
        tambah(p.span)
        return
      case 'Try':
        kunjungi(p.blok)
        for (const c of p.tangkap) {
          tambah(c.span)
          kunjungi(c.badan)
        }
        if (p.akhirnya) kunjungi(p.akhirnya)
        return
    }
  }
  for (const kelas of semuaDeklarasiKelas(program)) {
    for (const m of [...kelas.method, ...(kelas.konstruktor ?? [])]) {
      tambah(m.spanNama)
      kunjungi(m.badan)
    }
    // Initializer field instance dijalankan sebagai langkah di dalam konstruktor.
    for (const f of kelas.field) {
      if (f.modifier.includes('static')) continue
      for (const d of f.deklarator) if (d.init) tambah(d.span)
    }
  }
  return [...hasil].sort((a, b) => a - b)
}
