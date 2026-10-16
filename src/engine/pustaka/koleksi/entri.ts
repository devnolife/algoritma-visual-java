import type { Nilai } from '../../nilai'
import { hashElemen, samaNullAman, samaObjek, uoe, type HeapKoleksi, type OperasiElemen } from './heap'

/**
 * Map.Entry. Di JDK entri sebuah map adalah simpulnya sendiri (HashMap$Node, LinkedHashMap$Entry,
 * TreeMap$Entry); TreeMap.firstEntry() dkk. mengekspor salinan AbstractMap$SimpleImmutableEntry.
 */
export const KELAS_NODE_HASH = 'java.util.HashMap$Node'
export const KELAS_ENTRI_LINKED = 'java.util.LinkedHashMap$Entry'
export const KELAS_ENTRI_TREE = 'java.util.TreeMap$Entry'
export const KELAS_ENTRI_IMUT = 'java.util.AbstractMap$SimpleImmutableEntry'

const KELAS_ENTRI = new Set([KELAS_NODE_HASH, KELAS_ENTRI_LINKED, KELAS_ENTRI_TREE, KELAS_ENTRI_IMUT])

type H = HeapKoleksi
type O = OperasiElemen

/** `x instanceof Map.Entry`. */
export function adalahEntri(h: H, x: Nilai): boolean {
  return typeof x === 'number' && KELAS_ENTRI.has(h.kelasDari(x))
}

const getKey = (h: H, id: number) => h.bacaField(id, 'key')
const getValue = (h: H, id: number) => h.bacaField(id, 'value')

/** new AbstractMap.SimpleImmutableEntry<>(e). */
function salinImut(h: H, e: number): number {
  return h.baruObjek(
    KELAS_ENTRI_IMUT,
    { key: getKey(h, e), value: getValue(h, e) },
    { key: 'Object', value: 'Object' },
  )
}

function setValue(h: H, _ops: O, id: number, nilai: Nilai): Nilai {
  if (h.kelasDari(id) === KELAS_ENTRI_IMUT) throw uoe()
  const lama = getValue(h, id)
  h.tulisField(id, 'value', nilai)
  return lama
}

/** toString(): `key + "=" + value`. */
function teks(h: H, ops: O, id: number): string {
  return `${ops.teks(getKey(h, id))}=${ops.teks(getValue(h, id))}`
}

/**
 * equals: HashMap$Node memakai `o == this` lalu Objects.equals; TreeMap$Entry dan SimpleImmutableEntry
 * memakai valEquals (`o1 == null ? o2 == null : o1.equals(o2)`) tanpa jalan pintas identitas.
 */
function equals(h: H, ops: O, id: number, o: Nilai): boolean {
  const kelas = h.kelasDari(id)
  if (kelas === KELAS_NODE_HASH || kelas === KELAS_ENTRI_LINKED) {
    if (o === id) return true
    return (
      adalahEntri(h, o) &&
      samaObjek(ops, getKey(h, id), getKey(h, o as number)) &&
      samaObjek(ops, getValue(h, id), getValue(h, o as number))
    )
  }
  return (
    adalahEntri(h, o) &&
    samaNullAman(ops, getKey(h, id), getKey(h, o as number)) &&
    samaNullAman(ops, getValue(h, id), getValue(h, o as number))
  )
}

/** hashCode(): hash(key) ^ hash(value), null = 0. */
function hashCode(h: H, ops: O, id: number): number {
  return hashElemen(ops, getKey(h, id)) ^ hashElemen(ops, getValue(h, id))
}

export const EntriModel = { getKey, getValue, setValue, toString: teks, equals, hashCode, salinImut }
