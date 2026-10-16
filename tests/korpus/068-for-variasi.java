// Variasi for: banyak variabel, langkah 3, mundur, for(;;) dengan break, badan kosong
public class Main {
    public static void main(String[] args) {
        for (int i = 0, j = 10; i < j; i++, j--) {
            System.out.print("(" + i + "," + j + ") ");
        }
        System.out.println();
        for (int i = 0; i <= 20; i += 3) {
            System.out.print(i + " ");
        }
        System.out.println();
        for (int i = 10; i > 0; i -= 4) {
            System.out.print(i + " ");
        }
        System.out.println();
        int k = 0;
        for (;;) {
            k++;
            if (k * k > 50) {
                break;
            }
        }
        System.out.println("k pertama dengan k*k > 50: " + k);
        int n;
        for (n = 1; n < 1000; n *= 2) {
        }
        System.out.println("Pangkat dua pertama >= 1000: " + n);
        int x = 0;
        for (; x < 3; ) {
            x++;
        }
        System.out.println("x = " + x);
        long hasil = 1;
        for (long p = 1; p <= 5; p++) {
            hasil *= p;
        }
        System.out.println("5! = " + hasil);
        for (char c = 'a'; c < 'f'; c += 2) {
            System.out.print(c);
        }
        System.out.println();
        for (double d = 0; d < 1; d += 0.25) {
            System.out.print(d + " ");
        }
        System.out.println();
        int jumlah = 0;
        for (int i = 1; i <= 100; i++) jumlah += i;
        System.out.println("Jumlah 1..100 = " + jumlah);
    }
}
