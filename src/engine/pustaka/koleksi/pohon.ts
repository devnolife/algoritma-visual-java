import type { Nilai } from '../../nilai'
import { EntriModel, KELAS_ENTRI_TREE } from './entri'
import {
  bacaInt,
  bacaRef,
  naikkan,
  npe,
  nsee,
  type HeapKoleksi,
  type IteratorLokal,
  type OperasiElemen,
} from './heap'

/**
 * java.util.TreeMap{comparator, root, size, modCount, entrySet, navigableKeySet, descendingMap, keySet, values}:
 * pohon merah-hitam dengan simpul TreeMap$Entry{key, value, left, right, parent, color} (color: true = BLACK).
 * Berkas ini memuat inti pohon; API publik, iterator, dan view ada di treeMap.ts.
 */
export const KELAS_TREEMAP = 'java.util.TreeMap'
export const MERAH = false
export const HITAM = true

export const TIPE_TREEMAP: Record<string, string> = {
  comparator: 'java.util.Comparator',
  root: KELAS_ENTRI_TREE,
  size: 'int',
  modCount: 'int',
  entrySet: 'java.util.TreeMap$EntrySet',
  navigableKeySet: 'java.util.TreeMap$KeySet',
  descendingMap: 'java.util.NavigableMap',
  keySet: 'java.util.Set',
  values: 'java.util.Collection',
}
const TIPE_ENTRI: Record<string, string> = {
  key: 'Object',
  value: 'Object',
  left: KELAS_ENTRI_TREE,
  right: KELAS_ENTRI_TREE,
  parent: KELAS_ENTRI_TREE,
  color: 'boolean',
}

type H = HeapKoleksi
type O = OperasiElemen
type Simpul = number | null

export const akar = (h: H, id: number) => bacaRef(h, id, 'root')
export const ukuranPohon = (h: H, id: number) => bacaInt(h, id, 'size')
export const pembandingPohon = (h: H, id: number) => bacaRef(h, id, 'comparator')
export const kunciE = (h: H, p: number) => h.bacaField(p, 'key')
export const nilaiE = (h: H, p: number) => h.bacaField(p, 'value')
const kiri = (h: H, p: number) => bacaRef(h, p, 'left')
const kanan = (h: H, p: number) => bacaRef(h, p, 'right')
const induk = (h: H, p: number) => bacaRef(h, p, 'parent')
const warna = (h: H, p: number) => h.bacaField(p, 'color') as boolean

// Pembantu aman-null milik JDK (colorOf, parentOf, leftOf, rightOf, setColor).
const colorOf = (h: H, p: Simpul) => (p === null ? HITAM : warna(h, p))
const parentOf = (h: H, p: Simpul) => (p === null ? null : induk(h, p))
const leftOf = (h: H, p: Simpul) => (p === null ? null : kiri(h, p))
const rightOf = (h: H, p: Simpul) => (p === null ? null : kanan(h, p))
function setColor(h: H, p: Simpul, c: boolean): void {
  if (p !== null) h.tulisField(p, 'color', c)
}

export function buatPohon(h: H, pembanding: Nilai): number {
  return h.baruObjek(
    KELAS_TREEMAP,
    {
      comparator: pembanding,
      root: null,
      size: 0,
      modCount: 0,
      entrySet: null,
      navigableKeySet: null,
      descendingMap: null,
      keySet: null,
      values: null,
    },
    TIPE_TREEMAP,
  )
}

/** new Entry<>(key, value, parent): warna awal BLACK. */
function entriBaru(h: H, key: Nilai, value: Nilai, parent: Simpul): number {
  return h.baruObjek(
    KELAS_ENTRI_TREE,
    { key, value, left: null, right: null, parent, color: HITAM },
    TIPE_ENTRI,
  )
}

/** TreeMap.compare(k1, k2): comparator, atau ((Comparable) k1).compareTo(k2). */
export function bandingkan(h: H, ops: O, id: number, k1: Nilai, k2: Nilai): number {
  const cmp = pembandingPohon(h, id)
  if (cmp !== null) return ops.compare(cmp, k1, k2)
  if (k1 === null) throw npe('Cannot invoke "java.lang.Comparable.compareTo(Object)" because "k1" is null')
  return ops.compareTo(k1 as number, k2)
}

function rotateLeft(h: H, id: number, p: Simpul): void {
  if (p === null) return
  const r = kanan(h, p) as number
  h.tulisField(p, 'right', kiri(h, r))
  if (kiri(h, r) !== null) h.tulisField(kiri(h, r) as number, 'parent', p)
  h.tulisField(r, 'parent', induk(h, p))
  const pp = induk(h, p)
  if (pp === null) h.tulisField(id, 'root', r)
  else if (kiri(h, pp) === p) h.tulisField(pp, 'left', r)
  else h.tulisField(pp, 'right', r)
  h.tulisField(r, 'left', p)
  h.tulisField(p, 'parent', r)
}

function rotateRight(h: H, id: number, p: Simpul): void {
  if (p === null) return
  const l = kiri(h, p) as number
  h.tulisField(p, 'left', kanan(h, l))
  if (kanan(h, l) !== null) h.tulisField(kanan(h, l) as number, 'parent', p)
  h.tulisField(l, 'parent', induk(h, p))
  const pp = induk(h, p)
  if (pp === null) h.tulisField(id, 'root', l)
  else if (kanan(h, pp) === p) h.tulisField(pp, 'right', l)
  else h.tulisField(pp, 'left', l)
  h.tulisField(l, 'right', p)
  h.tulisField(p, 'parent', l)
}

/** fixAfterInsertion (CLR): simpul baru merah, lalu perbaiki merah-merah dengan recolor/rotasi. */
function fixAfterInsertion(h: H, id: number, x: Simpul): void {
  h.tulisField(x as number, 'color', MERAH)
  while (x !== null && x !== akar(h, id) && warna(h, induk(h, x) as number) === MERAH) {
    if (parentOf(h, x) === leftOf(h, parentOf(h, parentOf(h, x)))) {
      const y = rightOf(h, parentOf(h, parentOf(h, x)))
      if (colorOf(h, y) === MERAH) {
        setColor(h, parentOf(h, x), HITAM)
        setColor(h, y, HITAM)
        setColor(h, parentOf(h, parentOf(h, x)), MERAH)
        x = parentOf(h, parentOf(h, x))
      } else {
        if (x === rightOf(h, parentOf(h, x))) {
          x = parentOf(h, x)
          rotateLeft(h, id, x)
        }
        setColor(h, parentOf(h, x), HITAM)
        setColor(h, parentOf(h, parentOf(h, x)), MERAH)
        rotateRight(h, id, parentOf(h, parentOf(h, x)))
      }
    } else {
      const y = leftOf(h, parentOf(h, parentOf(h, x)))
      if (colorOf(h, y) === MERAH) {
        setColor(h, parentOf(h, x), HITAM)
        setColor(h, y, HITAM)
        setColor(h, parentOf(h, parentOf(h, x)), MERAH)
        x = parentOf(h, parentOf(h, x))
      } else {
        if (x === leftOf(h, parentOf(h, x))) {
          x = parentOf(h, x)
          rotateRight(h, id, x)
        }
        setColor(h, parentOf(h, x), HITAM)
        setColor(h, parentOf(h, parentOf(h, x)), MERAH)
        rotateLeft(h, id, parentOf(h, parentOf(h, x)))
      }
    }
  }
  h.tulisField(akar(h, id) as number, 'color', HITAM)
}

/** fixAfterDeletion (CLR): pulihkan tinggi-hitam setelah simpul hitam dilepas. */
function fixAfterDeletion(h: H, id: number, x: Simpul): void {
  while (x !== akar(h, id) && colorOf(h, x) === HITAM) {
    if (x === leftOf(h, parentOf(h, x))) {
      let sib = rightOf(h, parentOf(h, x))
      if (colorOf(h, sib) === MERAH) {
        setColor(h, sib, HITAM)
        setColor(h, parentOf(h, x), MERAH)
        rotateLeft(h, id, parentOf(h, x))
        sib = rightOf(h, parentOf(h, x))
      }
      if (colorOf(h, leftOf(h, sib)) === HITAM && colorOf(h, rightOf(h, sib)) === HITAM) {
        setColor(h, sib, MERAH)
        x = parentOf(h, x)
      } else {
        if (colorOf(h, rightOf(h, sib)) === HITAM) {
          setColor(h, leftOf(h, sib), HITAM)
          setColor(h, sib, MERAH)
          rotateRight(h, id, sib)
          sib = rightOf(h, parentOf(h, x))
        }
        setColor(h, sib, colorOf(h, parentOf(h, x)))
        setColor(h, parentOf(h, x), HITAM)
        setColor(h, rightOf(h, sib), HITAM)
        rotateLeft(h, id, parentOf(h, x))
        x = akar(h, id)
      }
    } else {
      let sib = leftOf(h, parentOf(h, x))
      if (colorOf(h, sib) === MERAH) {
        setColor(h, sib, HITAM)
        setColor(h, parentOf(h, x), MERAH)
        rotateRight(h, id, parentOf(h, x))
        sib = leftOf(h, parentOf(h, x))
      }
      if (colorOf(h, rightOf(h, sib)) === HITAM && colorOf(h, leftOf(h, sib)) === HITAM) {
        setColor(h, sib, MERAH)
        x = parentOf(h, x)
      } else {
        if (colorOf(h, leftOf(h, sib)) === HITAM) {
          setColor(h, rightOf(h, sib), HITAM)
          setColor(h, sib, MERAH)
          rotateLeft(h, id, sib)
          sib = leftOf(h, parentOf(h, x))
        }
        setColor(h, sib, colorOf(h, parentOf(h, x)))
        setColor(h, parentOf(h, x), HITAM)
        setColor(h, leftOf(h, sib), HITAM)
        rotateRight(h, id, parentOf(h, x))
        x = akar(h, id)
      }
    }
  }
  setColor(h, x, HITAM)
}

export function successor(h: H, t: Simpul): Simpul {
  if (t === null) return null
  if (kanan(h, t) !== null) {
    let p = kanan(h, t) as number
    while (kiri(h, p) !== null) p = kiri(h, p) as number
    return p
  }
  let p = induk(h, t)
  let ch: number = t
  while (p !== null && ch === kanan(h, p)) {
    ch = p
    p = induk(h, p)
  }
  return p
}

export function getFirstEntry(h: H, id: number): Simpul {
  let p = akar(h, id)
  if (p !== null) while (kiri(h, p) !== null) p = kiri(h, p) as number
  return p
}

export function getLastEntry(h: H, id: number): Simpul {
  let p = akar(h, id)
  if (p !== null) while (kanan(h, p) !== null) p = kanan(h, p) as number
  return p
}

/** getEntry: dengan comparator, atau requireNonNull + cast Comparable (CCE walau pohon kosong). */
export function getEntry(h: H, ops: O, id: number, key: Nilai): Simpul {
  const cpr = pembandingPohon(h, id)
  let p = akar(h, id)
  if (cpr === null) {
    if (key === null) throw npe()
    ops.pastikanComparable(key as number)
  }
  while (p !== null) {
    const c = cpr !== null ? ops.compare(cpr, key, kunciE(h, p)) : ops.compareTo(key as number, kunciE(h, p))
    if (c < 0) p = kiri(h, p)
    else if (c > 0) p = kanan(h, p)
    else return p
  }
  return null
}

/** put(key, value, replaceOld): map kosong memanggil compare(key, key) dulu sebagai cek tipe/null. */
export function putPohon(h: H, ops: O, id: number, key: Nilai, value: Nilai, replaceOld: boolean): Nilai {
  let t = akar(h, id)
  if (t === null) {
    bandingkan(h, ops, id, key, key)
    h.tulisField(id, 'root', entriBaru(h, key, value, null))
    h.tulisField(id, 'size', 1)
    naikkan(h, id)
    return null
  }
  const cpr = pembandingPohon(h, id)
  if (cpr === null) {
    if (key === null) throw npe()
    ops.pastikanComparable(key as number)
  }
  let parent: number
  let c: number
  do {
    parent = t
    c = cpr !== null ? ops.compare(cpr, key, kunciE(h, t)) : ops.compareTo(key as number, kunciE(h, t))
    if (c < 0) {
      t = kiri(h, t)
    } else if (c > 0) {
      t = kanan(h, t)
    } else {
      const lama = nilaiE(h, t)
      if (replaceOld || lama === null) h.tulisField(t, 'value', value)
      return lama
    }
  } while (t !== null)
  const e = entriBaru(h, key, value, parent)
  if (c < 0) h.tulisField(parent, 'left', e)
  else h.tulisField(parent, 'right', e)
  fixAfterInsertion(h, id, e)
  h.tulisField(id, 'size', ukuranPohon(h, id) + 1)
  naikkan(h, id)
  return null
}

/** deleteEntry: simpul dengan dua anak menyalin key/value penerusnya, lalu penerus yang dilepas. */
export function deleteEntry(h: H, id: number, p: number): void {
  naikkan(h, id)
  h.tulisField(id, 'size', ukuranPohon(h, id) - 1)
  if (kiri(h, p) !== null && kanan(h, p) !== null) {
    const s = successor(h, p) as number
    h.tulisField(p, 'key', kunciE(h, s))
    h.tulisField(p, 'value', nilaiE(h, s))
    p = s
  }
  const pengganti = kiri(h, p) !== null ? kiri(h, p) : kanan(h, p)
  if (pengganti !== null) {
    h.tulisField(pengganti, 'parent', induk(h, p))
    const pp = induk(h, p)
    if (pp === null) h.tulisField(id, 'root', pengganti)
    else if (p === kiri(h, pp)) h.tulisField(pp, 'left', pengganti)
    else h.tulisField(pp, 'right', pengganti)
    h.tulisField(p, 'parent', null)
    h.tulisField(p, 'right', null)
    h.tulisField(p, 'left', null)
    if (warna(h, p) === HITAM) fixAfterDeletion(h, id, pengganti)
  } else if (induk(h, p) === null) {
    h.tulisField(id, 'root', null)
  } else {
    if (warna(h, p) === HITAM) fixAfterDeletion(h, id, p)
    const pp = induk(h, p)
    if (pp !== null) {
      if (p === kiri(h, pp)) h.tulisField(pp, 'left', null)
      else if (p === kanan(h, pp)) h.tulisField(pp, 'right', null)
      h.tulisField(p, 'parent', null)
    }
  }
}

/** Navigasi getCeilingEntry/getFloorEntry/getHigherEntry/getLowerEntry dengan compare(key, p.key). */
export function cariNavigasi(
  h: H,
  ops: O,
  id: number,
  key: Nilai,
  arah: 'ceiling' | 'floor' | 'higher' | 'lower',
): Simpul {
  let p = akar(h, id)
  const keKanan = arah === 'floor' || arah === 'lower'
  while (p !== null) {
    const c = bandingkan(h, ops, id, key, kunciE(h, p))
    if (c === 0 && (arah === 'ceiling' || arah === 'floor')) return p
    // ceiling/higher turun ke kiri bila key lebih kecil; floor/lower turun ke kanan bila key lebih besar.
    const turunKiri = keKanan ? !(c > 0) : c < 0
    if (turunKiri) {
      if (kiri(h, p) !== null) {
        p = kiri(h, p)
        continue
      }
      if (!keKanan) return p
      let parent = induk(h, p)
      let ch: number = p
      while (parent !== null && ch === kiri(h, parent)) {
        ch = parent
        parent = induk(h, parent)
      }
      return parent
    }
    if (kanan(h, p) !== null) {
      p = kanan(h, p)
      continue
    }
    if (keKanan) return p
    let parent = induk(h, p)
    let ch: number = p
    while (parent !== null && ch === kanan(h, parent)) {
      ch = parent
      parent = induk(h, parent)
    }
    return parent
  }
  return null
}

/** Kunci entri, atau NoSuchElementException bila null (TreeMap.key). */
export function kunciAtauGagal(h: H, e: Simpul): Nilai {
  if (e === null) throw nsee()
  return kunciE(h, e)
}

/**
 * buildFromSorted: pohon seimbang langsung dari sumber terurut; tengah = akar, level terbawah yang tidak
 * penuh diwarnai merah. `nilaiBawaan` ada → sumber berisi kunci (TreeSet), selainnya entri.
 */
export function buildFromSorted(
  h: H,
  id: number,
  ukuran: number,
  it: IteratorLokal,
  nilaiBawaan?: Nilai,
): void {
  h.tulisField(id, 'size', ukuran)
  const redLevel = 31 - Math.clz32(ukuran + 1)
  const bangun = (level: number, lo: number, hi: number): Simpul => {
    if (hi < lo) return null
    const mid = (lo + hi) >>> 1
    const left = lo < mid ? bangun(level + 1, lo, mid - 1) : null
    const x = it.next()
    const key = nilaiBawaan === undefined ? EntriModel.getKey(h, x as number) : x
    const value = nilaiBawaan === undefined ? EntriModel.getValue(h, x as number) : nilaiBawaan
    const tengah = entriBaru(h, key, value, null)
    if (level === redLevel) h.tulisField(tengah, 'color', MERAH)
    if (left !== null) {
      h.tulisField(tengah, 'left', left)
      h.tulisField(left, 'parent', tengah)
    }
    if (mid < hi) {
      const right = bangun(level + 1, mid + 1, hi) as number
      h.tulisField(tengah, 'right', right)
      h.tulisField(right, 'parent', tengah)
    }
    return tengah
  }
  h.tulisField(id, 'root', bangun(0, 0, ukuran - 1))
}
