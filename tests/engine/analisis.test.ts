import { describe, expect, it } from 'vitest'
import { jalankan, kompilasi } from '@/engine'
import { barisBisaDijalankan } from '@/engine/analisis'

/** Baris yang diredupkan editor: bisa dijalankan tetapi tidak pernah dijalankan. */
function pudar(kode: string): number[] {
  const k = kompilasi(kode)
  if (!k.ok || !k.program) throw new Error(k.diagnostik[0]?.pesan)
  const t = jalankan(k)
  return barisBisaDijalankan(k.program, k.sumber).filter((b) => !t.hitunganBaris[b])
}

describe('barisBisaDijalankan', () => {
  it('cabang else yang berjalan tidak meredupkan baris `} else {`', () => {
    const kode = `public class Main {
    public static void main(String[] args) {
        int nilai = 45;
        String predikat;
        if (nilai >= 70) {
            predikat = "Baik";
        } else {
            predikat = "Kurang";
        }
        System.out.println(predikat);
    }
}
`
    expect(pudar(kode)).toEqual([6])
  })

  it('label case, default, do, dan lanjutan pernyataan multi-baris tidak pernah diredupkan', () => {
    const kode = `public class Main {
    public static void main(String[] args) {
        int k = 2;
        switch (k) {
            case 1:
                System.out.println("satu");
                break;
            case 2:
                System.out.println("dua"
                    + "!");
                break;
            default:
                System.out.println("lain");
        }
        int i = 0;
        do {
            i++;
        } while (i < 2);
    }
}
`
    expect(pudar(kode)).toEqual([6, 7, 13])
  })

  it('method yang tidak pernah dipanggil diredupkan seluruhnya, termasuk header', () => {
    const kode = `public class Main {
    static int kuadrat(int x) {
        return x * x;
    }
    public static void main(String[] args) {
        System.out.println(1);
    }
}
`
    expect(pudar(kode)).toEqual([2, 3])
  })
})
