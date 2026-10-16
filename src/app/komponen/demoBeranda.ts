/** Program contoh untuk Beranda. Keduanya dijalankan sungguhan oleh mesin Java Mini di Web Worker. */

/** Demo hero: bubble sort lima angka. */
export const KODE_DEMO = `public class Main {
    public static void main(String[] args) {
        int[] data = {5, 2, 8, 1, 4};
        for (int i = 0; i < data.length - 1; i++) {
            for (int j = 0; j < data.length - 1 - i; j++) {
                if (data[j] > data[j + 1]) {
                    int tmp = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = tmp;
                }
            }
        }
    }
}
`

/** Baris yang bisa dihapus pengunjung: tanpa baris ini, pertukaran menghilangkan angka. */
export const BARIS_HAPUS = 9

/** Contoh error: kesalahan tipe yang paling sering ditemui pemula. */
export const KODE_GALAT = `public class Main {
    public static void main(String[] args) {
        int total = 250;
        int rataRata = total / 3.0;
        System.out.println(rataRata);
    }
}
`
export const BARIS_GALAT = 4

/** Sumber program dengan satu baris dikosongkan (nomor baris lain tetap sama). */
export function sumberTanpaBaris(kode: string, baris: number): string {
  const isi = kode.split('\n')
  isi[baris - 1] = ''
  return isi.join('\n')
}
