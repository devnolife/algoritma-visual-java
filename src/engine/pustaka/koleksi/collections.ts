import type { Nilai } from '../../nilai'
import { npe, pesanNpePanggil, type HeapKoleksi, type OperasiElemen } from './heap'
import { iterasi, modelDari, type OperasiDaftar } from './registri'

/** Utilitas java.util.Collections. Semua bekerja lewat registri, jadi berlaku untuk semua model terdaftar. */

type H = HeapKoleksi
type O = OperasiElemen

const REVERSE_THRESHOLD = 18

function operasiDaftar(h: H, list: number): OperasiDaftar {
  const d = modelDari(h, list).daftar
  if (!d) throw new Error(`${h.kelasDari(list)} bukan List`)
  return d
}

/** Collections.sort(list) / sort(list, c) = list.sort(c). */
function sort(h: H, ops: O, list: Nilai, pembanding: number | null = null): void {
  if (list === null) throw npe(pesanNpePanggil('java.util.List.sort(java.util.Comparator)', 'list'))
  operasiDaftar(h, list as number).sort(h, ops, list as number, pembanding)
}

/** Collections.swap: `l.set(i, l.set(j, l.get(i)))`. */
function swap(h: H, ops: O, list: Nilai, i: number, j: number): void {
  if (list === null) throw npe(pesanNpePanggil('java.util.List.get(int)', 'l'))
  const d = operasiDaftar(h, list as number)
  const ei = d.get(h, ops, list as number, i)
  const ej = d.set(h, ops, list as number, j, ei)
  d.set(h, ops, list as number, i, ej)
}

/** Collections.reverse: tukar dari kedua ujung; daftar non-RandomAccess ≥ 18 elemen memakai dua ListIterator. */
function reverse(h: H, ops: O, list: Nilai): void {
  if (list === null) throw npe(pesanNpePanggil('java.util.List.size()', 'list'))
  const id = list as number
  const m = modelDari(h, id)
  const d = operasiDaftar(h, id)
  const size = m.size(h, ops, id)
  if (size < REVERSE_THRESHOLD || d.aksesAcak) {
    for (let i = 0, mid = size >> 1, j = size - 1; i < mid; i++, j--) swap(h, ops, id, i, j)
    return
  }
  if (!d.listIterator) throw new Error(`${m.kelas} tidak menyediakan listIterator`)
  const maju = d.listIterator(h, ops, id, 0)
  const mundur = d.listIterator(h, ops, id, size)
  for (let i = 0, mid = m.size(h, ops, id) >> 1; i < mid; i++) {
    const tmp = maju.next()
    maju.set(mundur.previous())
    mundur.set(tmp)
  }
}

/**
 * max/min: kandidat = elemen pertama, lalu `next.compareTo(candidate)` (atau `comp.compare(next, candidate)`)
 * untuk setiap elemen berikutnya. Koleksi kosong → NoSuchElementException dari iterator.
 */
function ekstrem(h: H, ops: O, coll: Nilai, pembanding: number | null, arah: 1 | -1): Nilai {
  if (coll === null) throw npe(pesanNpePanggil('java.util.Collection.iterator()', 'coll'))
  const it = iterasi(h, ops, coll as number)
  let kandidat = it.next()
  while (it.hasNext()) {
    const next = it.next()
    let hasil: number
    if (pembanding !== null) {
      hasil = ops.compare(pembanding, next, kandidat)
    } else {
      if (next === null) {
        throw npe(pesanNpePanggil('java.lang.Comparable.compareTo(Object)', 'next'))
      }
      hasil = ops.compareTo(next as number, kandidat)
    }
    if (arah > 0 ? hasil > 0 : hasil < 0) kandidat = next
  }
  return kandidat
}

function max(h: H, ops: O, coll: Nilai, pembanding: number | null = null): Nilai {
  return ekstrem(h, ops, coll, pembanding, 1)
}

function min(h: H, ops: O, coll: Nilai, pembanding: number | null = null): Nilai {
  return ekstrem(h, ops, coll, pembanding, -1)
}

/** Collections.frequency: `o.equals(e)` untuk setiap e (o sebagai penerima). */
function frequency(h: H, ops: O, c: Nilai, o: Nilai): number {
  if (c === null) throw npe(pesanNpePanggil('java.util.Collection.iterator()', 'c'))
  let hasil = 0
  const it = iterasi(h, ops, c as number)
  while (it.hasNext()) {
    const e = it.next()
    if (o === null ? e === null : ops.equals(o as number, e)) hasil++
  }
  return hasil
}

/** Collections.addAll(c, elements...): `elemen` = id array varargs. */
function addAll(h: H, ops: O, c: Nilai, elemen: Nilai): boolean {
  // for-each atas array memakai salinan lokal sintetis tanpa nama, sehingga pesannya "<local3>".
  if (elemen === null) throw npe('Cannot read the array length because "<local3>" is null')
  const a = elemen as number
  let hasil = false
  for (let i = 0, n = h.panjangArray(a); i < n; i++) {
    const e = h.bacaElemen(a, i)
    if (c === null) throw npe(pesanNpePanggil('java.util.Collection.add(Object)', 'c'))
    if (modelDari(h, c as number).add(h, ops, c as number, e)) hasil = true
  }
  return hasil
}

export const CollectionsModel = { sort, swap, reverse, max, min, frequency, addAll }
