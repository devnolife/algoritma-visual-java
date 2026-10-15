import { describe, expect, it } from 'vitest'
import { kompilasi } from '@/engine'

/** Ringkas diagnostik menjadi `baris:kolom pesan` agar mudah dibandingkan dengan keluaran javac. */
function error(kode: string): string[] {
  return kompilasi(kode).diagnostik.map((d) => `${d.baris}:${d.kolom} ${d.pesan}`)
}

const main = (badan: string) => `public class Main {\n    public static void main(String[] args) {\n${badan}\n    }\n}\n`

// Semua harapan di bawah diambil dari keluaran javac 21 untuk program yang sama.
describe('analisis alur (setara javac Flow)', () => {
  it('error alur tidak dilaporkan bila ada error tipe', () => {
    expect(error(main('        int x;\n        System.out.println(x);\n        int y = 3.5;'))).toEqual([
      '5:17 incompatible types: possible lossy conversion from double to int',
    ])
  })

  it('kondisi konstan true, break, dan for tanpa kondisi', () => {
    const kode = main(
      '        int x;\n        if (true) x = 1;\n        System.out.println(x);\n        while (true) { break; }\n        int z;\n        for (;;) { z = 1; break; }\n        System.out.println(z);',
    )
    expect(error(kode)).toEqual([])
  })

  it('missing return dan unreachable setelah return', () => {
    const kode = `public class Main {
    static int f(int n) {
        while (true) { }
    }
    static int g(int n) {
        if (n > 0) return 1;
    }
    public static void main(String[] args) {
        return;
        System.out.println(1);
    }
}
`
    expect(error(kode)).toEqual(['7:5 missing return statement', '10:9 unreachable statement'])
  })

  it('badan while(false) dan pernyataan setelah continue tidak terjangkau', () => {
    const kode = main('        while (false) { System.out.println(1); }\n        for (int i = 0; i < 3; i++) { continue; System.out.println(i); }')
    expect(error(kode)).toEqual(['3:23 unreachable statement', '4:49 unreachable statement'])
  })

  it('variabel final: diisi di dalam loop dan diisi dua kali', () => {
    const kode = main('        final int a;\n        for (int i = 0; i < 3; i++) { a = i; }\n        final int b;\n        b = 1;\n        b = 2;')
    expect(error(kode)).toEqual(['4:39 variable a might be assigned in loop', '7:9 variable b might already have been assigned'])
  })

  it('final diisi lalu break tidak dianggap berulang', () => {
    expect(error(main('        final int a;\n        while (true) { a = 1; break; }\n        System.out.println(a);'))).toEqual([])
  })

  it('switch tanpa default: variabel belum pasti terisi', () => {
    const kode = main('        int k = 2; int x;\n        switch (k) { case 1: x = 1; break; case 2: x = 2; break; }\n        System.out.println(x);')
    expect(error(kode)).toEqual(['5:28 variable x might not have been initialized'])
  })

  it('urutan javac: error keterjangkauan dulu, lalu error penugasan; tiap variabel dilaporkan sekali', () => {
    const kode = main('        int x;\n        System.out.println(x);\n        System.out.println(x);\n        x++;\n        return;\n        System.out.println(2);')
    expect(error(kode)).toEqual(['8:9 unreachable statement', '4:28 variable x might not have been initialized'])
  })

  it('&& (assigned when true), elemen array, compound assignment, while', () => {
    const kode = main(
      '        int k = 3; boolean b; int y;\n        if (k > 0 && (b = true)) System.out.println(b);\n        int[] a;\n        a[0] = 1;\n        int z;\n        z += 1;\n        int w;\n        while (k > 0) { w = 1; k--; }\n        System.out.println(w);',
    )
    expect(error(kode)).toEqual([
      '6:9 variable a might not have been initialized',
      '8:9 variable z might not have been initialized',
      '11:28 variable w might not have been initialized',
    ])
  })

  it('switch dengan default, while(true) dengan return, do-while: semua sah', () => {
    const kode = `public class Main {
    static int f(int k) {
        switch (k) { case 1: return 10; default: return 20; }
    }
    static int g(int n) {
        while (true) { if (n > 3) return n; n++; }
    }
    public static void main(String[] args) {
        int k = 2; int x;
        switch (k) { case 1: x = 1; break; default: x = 2; }
        System.out.println(x + f(k) + g(1));
        switch (k) { case 1: break; }
        int q;
        do { q = 1; } while (k < 0);
        System.out.println(q);
        for (int i = 0; ; i++) { }
    }
}
`
    expect(error(kode)).toEqual([])
  })

  it('pernyataan setelah break di switch tidak terjangkau; for-each bisa tidak berjalan', () => {
    const kode = main(
      '        int k = 1;\n        switch (k) { case 1: break; k = 2; case 2: k = 3; }\n        int r;\n        for (int v : new int[]{1}) { r = v; }\n        System.out.println(r);',
    )
    expect(error(kode)).toEqual(['4:37 unreachable statement', '7:28 variable r might not have been initialized'])
  })

  it('posisi error unreachable untuk berbagai jenis pernyataan', () => {
    const kode = `public class Main {
    static void a() { return; int y = 2; }
    static void b() { return; if (true) { } }
    static void c(int x) { return; x++; }
    static void d() { return; { } }
    static void e() { return; ; }
    static void f() { while (true) { } int q; }
    static int g(int k) { for (int i = 0; i < k; i++) { return i; } }
    public static void main(String[] args) { }
}
`
    expect(error(kode)).toEqual([
      '2:35 unreachable statement',
      '3:31 unreachable statement',
      '4:36 unreachable statement',
      '5:31 unreachable statement',
      '6:31 unreachable statement',
      '7:44 unreachable statement',
      '8:69 missing return statement',
    ])
  })

  it('ternary dan negasi memakai aturan when-true/when-false', () => {
    const kode = main('        int k = 1; int x;\n        if (!(k > 0) || (x = k) > 0) { }\n        boolean ok = k > 0 ? (x = 1) > 0 : (x = 2) > 0;\n        System.out.println(x);')
    expect(error(kode)).toEqual([])
  })

  it('kode pelajaran yang benar tetap lolos', () => {
    const kode = main('        int[] nilai = {4, 9, 2};\n        int maks = nilai[0];\n        for (int i = 1; i < nilai.length; i++) {\n            if (nilai[i] > maks) maks = nilai[i];\n        }\n        System.out.println(maks);')
    expect(kompilasi(kode).ok).toBe(true)
  })
})
