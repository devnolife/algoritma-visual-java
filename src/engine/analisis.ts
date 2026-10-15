import type * as A from './ast'
import type { ProgramTerperiksa } from './checker'

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

/**
 * Konstruksi Java yang dipakai program, untuk cek tantangan `harusMemakai`/`dilarangMemakai`.
 * Hasil: for, while, do-while, for-each, if, switch, casting, ternary, array, scanner, rekursi, method:<nama>.
 */
export function analisisKonstruksi(program: ProgramTerperiksa): string[] {
  const hasil = new Set<string>()
  const memanggil = new Map<string, Set<string>>()
  for (const m of program.kelas.method) {
    hasil.add(`method:${m.nama}`)
    const dipanggil = new Set<string>()
    telusuri(m.badan, (n) => {
      const k = NAMA_KONSTRUKSI[n.jenis]
      if (k) hasil.add(k)
      if (n.jenis === 'BaruObjek' && n.target?.k === 'pustaka' && n.target.id.startsWith('Scanner.')) hasil.add('scanner')
      if (n.jenis === 'PanggilMethod' && n.target?.k === 'user') dipanggil.add(n.target.method.nama)
      if (n.jenis === 'PanggilMethod' && n.target?.k === 'pustaka') hasil.add(`pustaka:${n.target.id.slice(0, n.target.id.indexOf('('))}`)
    })
    memanggil.set(m.nama, dipanggil)
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
