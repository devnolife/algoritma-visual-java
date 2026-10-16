import { describe, expect, it } from 'vitest'
import { kompilasi } from '@/engine'

const program = (badan: string) => `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> angka = new ArrayList<>(List.of(3, 1, 2));
        ${badan}
    }
}
`

const pesanPertama = (badan: string) => {
  const k = kompilasi(program(badan))
  return k.ok ? null : k.diagnostik[0].pesan
}

describe('lambda selain Comparator: keterbatasan simulator, bukan error javac palsu', () => {
  it.each([
    ['angka.removeIf(x -> x % 2 == 0);', 'removeIf'],
    ['angka.forEach(x -> System.out.println(x));', 'forEach'],
    ['angka.sort(Comparator.comparing(x -> -x));', 'comparing'],
    ['Map<Integer, List<Integer>> g = new HashMap<>(); g.computeIfAbsent(1, k -> new ArrayList<>());', 'computeIfAbsent'],
  ])('%s', (badan, metode) => {
    expect(pesanPertama(badan)).toBe(`[Simulator] Method ${metode} belum didukung`)
  })
})

describe('Comparator.naturalOrder()/reverseOrder() sebagai argumen: tipe disimpulkan dari target seperti javac', () => {
  it.each([
    'angka.sort(Comparator.naturalOrder());',
    'angka.sort(Comparator.reverseOrder());',
    'Collections.sort(angka, Comparator.naturalOrder());',
    'TreeSet<String> t = new TreeSet<>(Comparator.reverseOrder());',
    'PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());',
  ])('%s', (badan) => {
    expect(pesanPertama(badan)).toBeNull()
  })

  it('target yang tidak memenuhi batas T extends Comparable<? super T> tetap ditolak', () => {
    expect(pesanPertama('List<Object> o = new ArrayList<>(); o.sort(Comparator.naturalOrder());')).toMatch(/^incompatible types/)
  })
})
