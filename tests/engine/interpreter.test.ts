import { describe, expect, it } from 'vitest'
import { kompilasi, kompilasiDanJalankan, PembacaTrace } from '@/engine'

const bungkus = (isi: string) => `public class Main {\n    public static void main(String[] args) {\n${isi}\n    }\n}\n`

function jalan(kode: string, stdin = '') {
  const h = kompilasiDanJalankan(kode, { stdin })
  if (!h.ok) throw new Error(h.diagnostik.map((d) => `${d.baris}: ${d.pesan}`).join('\n'))
  return h.trace!
}

describe('interpreter: program dasar', () => {
  it('Hello world', () => {
    const t = jalan(bungkus('System.out.println("Halo, dunia!");'))
    expect(t.output).toBe('Halo, dunia!\n')
    expect(t.status).toBe('selesai')
  })

  it('nilai maksimum (irisan vertikal)', () => {
    const kode = `public class Main {
    public static void main(String[] args) {
        int[] nilai = {4, 9, 2, 7, 5};
        int maks = nilai[0];              // #awal
        for (int i = 1; i < nilai.length; i++) {
            if (nilai[i] > maks) {    // #banding
                maks = nilai[i];
            }
        }
        System.out.println("Nilai terbesar: " + maks);
    }
}
`
    const t = jalan(kode)
    expect(t.output).toBe('Nilai terbesar: 9\n')
    expect(t.akhirMain.maks).toEqual({ tipe: 'int', nilai: 9 })
    expect(t.akhirMain.nilai.nilai).toEqual([4, 9, 2, 7, 5])
    const r = new PembacaTrace(t)
    const akhir = r.stateDi(t.langkah.length - 1)
    expect(akhir.frames).toHaveLength(1)
    expect(akhir.frames[0].vars.map((v) => v.nama)).toEqual(['args', 'nilai', 'maks'])
    expect(kompilasi(kode).penanda).toEqual({ 4: 'awal', 6: 'banding' })
  })

  it('aritmetika, casting, dan konkatenasi seperti Java', () => {
    const t = jalan(
      bungkus(`
        char c = 'x';
        c += 2;
        int x = 10;
        x += 3.7;
        System.out.println(c + " " + x + " " + ('a' + 'b') + " " + 1 + 2 + " " + (1 + 2) + " " + 'a' + 1);
        System.out.println(7 / 2 + " " + 7 / 2.0 + " " + (double) 7 / 2 + " " + (int) 3.99 + " " + 0.1 + 0.2);
        System.out.println((0.1 + 0.2) + " " + 100.0 + " " + 1e7 + " " + 10 % 3 + " " + -7 / 2);
        long besar = Integer.MAX_VALUE + 1L;
        int luap = Integer.MAX_VALUE + 1;
        System.out.println(besar + " " + luap);`),
    )
    expect(t.output).toBe('z 13 195 12 3 a1\n3 3.5 3.5 3 0.10.2\n0.30000000000000004 100.0 1.0E7 1 -3\n2147483648 -2147483648\n')
  })

  it('method, rekursi, dan call stack', () => {
    const kode = `public class Main {
    static int faktorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * faktorial(n - 1);
    }
    public static void main(String[] args) {
        int hasil = faktorial(4);
        System.out.println(hasil);
    }
}`
    const t = jalan(kode)
    expect(t.output).toBe('24\n')
    const r = new PembacaTrace(t)
    const kedalamanMaks = Math.max(...t.langkah.map((l) => l.kedalaman))
    expect(kedalamanMaks).toBe(5)
    const iPanggil = t.langkah.findIndex((l) => l.jenis === 'panggil')
    expect(r.stateDi(iPanggil).frames.map((f) => f.method)).toEqual(['main', 'faktorial'])
  })

  it('exception runtime ala Java', () => {
    const t = jalan(bungkus('        int[] a = new int[3];\n        a[3] = 1;'))
    expect(t.status).toBe('exception')
    expect(t.output).toContain('Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3')
    expect(t.output).toContain('at Main.main(Main.java:4)')
  })

  it('infinite loop dihentikan batas langkah', () => {
    const t = jalan(bungkus('        int i = 0;\n        while (i < 10) {\n            System.out.print("");\n        }'))
    expect(t.status).toBe('batas-langkah')
    expect(t.pesanSimulator).toContain('infinite loop')
  })

  it('Scanner dan jebakan nextLine setelah nextInt', () => {
    const kode = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int umur = sc.nextInt();
        String sisa = sc.nextLine();
        String nama = sc.nextLine();
        System.out.println(umur + "|" + sisa + "|" + nama);
    }
}`
    const t = jalan(kode, '20\nBudi\n')
    expect(t.output).toBe('20||Budi\n')
  })

  it('String == vs equals', () => {
    const t = jalan(
      bungkus(`        String a = "halo";
        String b = "halo";
        String c = new String("halo");
        String d = "ha" + "lo";
        String e = "ha";
        String f = e + "lo";
        System.out.println((a == b) + " " + (a == c) + " " + a.equals(c) + " " + (a == d) + " " + (a == f));`),
    )
    expect(t.output).toBe('true false true true false\n')
  })

  it('switch dengan fall-through dan printf', () => {
    const t = jalan(
      bungkus(`        int hari = 2;
        switch (hari) {
            case 1:
                System.out.println("Senin");
            case 2:
                System.out.println("Selasa");
            case 3:
                System.out.println("Rabu");
                break;
            default:
                System.out.println("Lainnya");
        }
        System.out.printf("%.2f %d %s %5.1f|%-4s|%n", 3.14159, 42, "ok", 2.25, "ab");`),
    )
    expect(t.output).toBe('Selasa\nRabu\n3.14 42 ok   2.3|ab  |\n')
  })
})

describe('type checker: pesan ala javac', () => {
  const pesan = (kode: string) => kompilasi(kode).diagnostik.map((d) => `${d.baris}: ${d.pesan}`)
  it('lossy conversion', () => {
    expect(pesan(bungkus('        int x = 3.5;'))).toEqual(['3: incompatible types: possible lossy conversion from double to int'])
  })
  it('String ke int', () => {
    expect(pesan(bungkus('        int x = "5";'))).toEqual(['3: incompatible types: String cannot be converted to int'])
  })
  it('titik koma hilang', () => {
    expect(pesan(bungkus('        int x = 5\n        x++;'))).toEqual(["3: ';' expected"])
  })
  it('simbol tidak ditemukan', () => {
    const d = kompilasi(bungkus('        int total = 0;\n        System.out.println(totl);')).diagnostik
    expect(d[0].pesan).toBe('cannot find symbol')
    expect(d[0].detail).toEqual(['symbol:   variable totl', 'location: class Main'])
    expect(d[0].saran).toContain('total')
  })
  it('Sytem salah ketik', () => {
    expect(pesan(bungkus('        Sytem.out.println("x");'))).toEqual(['3: package Sytem does not exist'])
  })
  it('kondisi bukan boolean', () => {
    expect(pesan(bungkus('        int x = 1;\n        if (x = 5) { }'))).toEqual(['4: incompatible types: int cannot be converted to boolean'])
  })
  it('byte dari konstanta', () => {
    expect(pesan(bungkus('        byte b = 10;\n        byte c = 200;'))).toEqual(['4: incompatible types: possible lossy conversion from int to byte'])
  })
})
