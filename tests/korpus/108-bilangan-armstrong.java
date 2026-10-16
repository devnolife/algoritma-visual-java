// Bilangan Armstrong (narsistik): pangkat jumlah digit dengan perkalian berulang
public class Main {
    static int banyakDigit(int n) {
        int d = 0;
        do {
            d++;
            n /= 10;
        } while (n > 0);
        return d;
    }

    static int pangkat(int basis, int e) {
        int hasil = 1;
        for (int i = 0; i < e; i++) {
            hasil *= basis;
        }
        return hasil;
    }

    static boolean armstrong(int n) {
        int k = banyakDigit(n);
        int jumlah = 0;
        int sisa = n;
        while (sisa > 0) {
            jumlah += pangkat(sisa % 10, k);
            sisa /= 10;
        }
        return jumlah == n;
    }

    public static void main(String[] args) {
        System.out.print("Armstrong 1..9:");
        for (int i = 1; i <= 9; i++) {
            if (armstrong(i)) {
                System.out.print(" " + i);
            }
        }
        System.out.println();
        int[] kandidat = {153, 370, 371, 407, 100, 123, 1634, 8208, 9474, 9475, 54748};
        for (int k : kandidat) {
            System.out.println(k + (armstrong(k) ? " adalah" : " bukan") + " bilangan Armstrong");
        }
        System.out.print("Armstrong 360..410:");
        for (int i = 360; i <= 410; i++) {
            if (armstrong(i)) {
                System.out.print(" " + i);
            }
        }
        System.out.println();
    }
}
