// Deret Collatz dengan while dan kondisi majemuk, mencari langkah terpanjang
public class Main {
    static int langkahCollatz(long n) {
        int langkah = 0;
        while (n != 1 && langkah < 500) {
            if (n % 2 == 0) {
                n = n / 2;
            } else {
                n = 3 * n + 1;
            }
            langkah++;
        }
        return langkah;
    }

    public static void main(String[] args) {
        int n = 6;
        System.out.print("Collatz(" + n + "): " + n);
        while (n != 1) {
            n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
            System.out.print(" -> " + n);
        }
        System.out.println();
        int terbaik = 1;
        int maksLangkah = 0;
        for (int i = 1; i <= 30; i++) {
            int l = langkahCollatz(i);
            if (l > maksLangkah) {
                maksLangkah = l;
                terbaik = i;
            }
        }
        System.out.println("Langkah terpanjang di 1..30: n = " + terbaik + " dengan " + maksLangkah + " langkah");
        long puncak = 27;
        long tertinggi = puncak;
        while (puncak != 1) {
            puncak = puncak % 2 == 0 ? puncak / 2 : 3 * puncak + 1;
            if (puncak > tertinggi) {
                tertinggi = puncak;
            }
        }
        System.out.println("Nilai tertinggi dari 27 = " + tertinggi);
    }
}
