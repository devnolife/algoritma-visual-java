import { describe, expect, it } from 'vitest'
import { kompilasi } from '@/engine'

const error = (kode: string) => kompilasi(kode).diagnostik.map((d) => `${d.baris}:${d.kolom} ${d.pesan}`)
const main = (badan: string) => `public class Main {\n    public static void main(String[] args) {\n${badan}\n    }\n}\n`

// Harapan diambil dari keluaran javac 21.
describe('pesan error switch', () => {
  it('selector bertipe double/long/boolean tidak diizinkan', () => {
    expect(error(main('        double ipk = 3.5;\n        switch (ipk) { case 3.5: break; }'))).toEqual(['4:16 selector type double is not allowed'])
    expect(error(main('        long x = 3;\n        switch (x) { case 3: break; }'))).toEqual(['4:16 selector type long is not allowed'])
    expect(error(main('        boolean b = true;\n        switch (b) { case true: break; }'))).toEqual(['4:16 selector type boolean is not allowed'])
  })

  it('label boolean pada switch int: tipe dicek sebelum syarat konstanta', () => {
    expect(error(main('        int nilai = 80;\n        switch (nilai) { case nilai > 70: break; }'))[0]).toMatch(/^4:\d+ incompatible types: boolean cannot be converted to int$/)
    expect(error(main('        int nilai = 80; int batas = 70;\n        switch (nilai) { case batas: break; }'))).toEqual(['4:31 constant expression required'])
  })

  it('label case tanpa titik dua', () => {
    expect(error(main('        int k = 1;\n        switch (k) {\n            case 1\n                System.out.println(1);\n                break;\n        }'))).toEqual([
      '5:19 : or -> expected',
    ])
  })

  it('case dengan konstanta bernama dan bentuk panah bukan lambda', () => {
    const kode = `public class Main {
    static final char YA = 'Y';
    public static void main(String[] args) {
        char jawab = 'Y';
        switch (jawab) {
            case YA -> System.out.println("ya");
            default -> System.out.println("lain");
        }
    }
}
`
    expect(kompilasi(kode).ok).toBe(true)
  })
})
