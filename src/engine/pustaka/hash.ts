/**
 * Fungsi hash dan generator acak dengan hasil yang sama persis dengan JDK 21.
 * Murni (tanpa heap) agar bisa dipakai model koleksi dan pustaka.
 */

/** String.hashCode(): s[0]*31^(n-1) + … + s[n-1], aritmetika int. */
export function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

/** Long.hashCode(): (int)(value ^ (value >>> 32)). */
export function hashLong(v: bigint): number {
  const u = BigInt.asUintN(64, v)
  return Number(BigInt.asIntN(32, u ^ (u >> 32n)))
}

const buf = new DataView(new ArrayBuffer(8))

/** Double.doubleToLongBits: semua NaN dinormalkan ke 0x7ff8000000000000L. */
export function bitDouble(d: number): bigint {
  if (Number.isNaN(d)) return 0x7ff8000000000000n
  buf.setFloat64(0, d)
  return buf.getBigInt64(0)
}

/** Double.hashCode(): hash dari doubleToLongBits. */
export function hashDouble(d: number): number {
  return hashLong(bitDouble(d))
}

/** Float.hashCode(): floatToIntBits (NaN dinormalkan ke 0x7fc00000). */
export function hashFloat(f: number): number {
  if (Number.isNaN(f)) return 0x7fc00000
  buf.setFloat32(0, f)
  return buf.getInt32(0)
}

/** Boolean.hashCode(): 1231 untuk true, 1237 untuk false. */
export const hashBoolean = (b: boolean): number => (b ? 1231 : 1237)

/** Arrays.hashCode / List.hashCode: 31*h + hash(elemen), dimulai dari 1. */
export function gabungHash(hashElemen: number[]): number {
  let h = 1
  for (const e of hashElemen) h = (Math.imul(31, h) + e) | 0
  return h
}

const PENGALI = 0x5deece66dn
const TAMBAH = 0xbn
const MASKER = (1n << 48n) - 1n

/**
 * java.util.Random: LCG 48-bit. Status disimpan sebagai bigint agar bisa direkam di heap (deterministik).
 * `new Random(seed)` → status awal (seed ^ 0x5DEECE66D) & ((1 << 48) - 1).
 */
export class AcakJava {
  constructor(public status: bigint) {}

  static dariSeed(seed: bigint): AcakJava {
    return new AcakJava((BigInt.asUintN(64, seed) ^ PENGALI) & MASKER)
  }

  /** next(bits): bilangan acak `bits` bit, hasil int bertanda. */
  next(bits: number): number {
    this.status = (this.status * PENGALI + TAMBAH) & MASKER
    return Number(BigInt.asIntN(32, this.status >> BigInt(48 - bits)))
  }

  nextInt(batas?: number): number {
    if (batas === undefined) return this.next(32)
    // Batas tidak positif sudah dicek pemanggil (IllegalArgumentException: bound must be positive).
    let r = this.next(31)
    const m = batas - 1
    if ((batas & m) === 0) return Number((BigInt(batas) * BigInt(r)) >> 31n)
    // Kandidat ditolak bila u - r + m meluap dari int (JDK: hasilnya negatif).
    for (let u = r; u - (r = u % batas) + m > 0x7fffffff; u = this.next(31));
    return r
  }

  nextLong(): bigint {
    return BigInt.asIntN(64, (BigInt(this.next(32)) << 32n) + BigInt(this.next(32)))
  }

  nextBoolean(): boolean {
    return this.next(1) !== 0
  }

  nextDouble(): number {
    return (Number(BigInt(this.next(26)) << 27n) + this.next(27)) * 2 ** -53
  }
}
