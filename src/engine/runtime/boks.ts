/**
 * Boxing wrapper persis JDK 21 (JLS 5.1.7 + cache `valueOf`):
 * - Integer, Long, Short, Byte: −128..127 memakai objek cache yang sama;
 * - Character: kode 0..127 di-cache;
 * - Boolean: selalu `Boolean.TRUE`/`Boolean.FALSE`;
 * - Float, Double: tidak pernah di-cache (setiap boxing membuat objek baru).
 * Objek cache dibuat saat pertama kali dibutuhkan, lalu identitasnya dipertahankan.
 */
import type { Nilai } from '../nilai'
import type { ObjekHeap } from '../trace'

export interface HasilBoks {
  id: number
  /** true bila nilainya termasuk rentang cache JDK (objek dipakai bersama, di JVM sudah ada sejak awal). */
  cache: boolean
}

function bisaDicache(kelas: string, nilai: Nilai): boolean {
  switch (kelas) {
    case 'Integer':
    case 'Short':
    case 'Byte':
      return (nilai as number) >= -128 && (nilai as number) <= 127
    case 'Long':
      return (nilai as bigint) >= -128n && (nilai as bigint) <= 127n
    case 'Character':
      return (nilai as number) <= 127
    case 'Boolean':
      return true
    default:
      return false
  }
}

export class PenyimpanBoks {
  private readonly cache = new Map<string, number>()

  constructor(private readonly alokasi: (o: ObjekHeap) => number) {}

  /** `Kelas.valueOf(nilai)`: objek dari cache bila nilainya termasuk rentang cache JDK, selain itu objek baru. */
  boks(kelas: string, nilai: Nilai): HasilBoks {
    if (!bisaDicache(kelas, nilai)) return { id: this.alokasi({ k: 'boks', kelas, nilai }), cache: false }
    const kunci = `${kelas}:${String(nilai)}`
    const ada = this.cache.get(kunci)
    if (ada !== undefined) return { id: ada, cache: true }
    const id = this.alokasi({ k: 'boks', kelas, nilai })
    this.cache.set(kunci, id)
    return { id, cache: true }
  }
}
