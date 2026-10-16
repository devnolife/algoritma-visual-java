// Uang kembalian dengan algoritma greedy pecahan rupiah
public class Main {
    public static void main(String[] args) {
        int[] pecahan = {100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100};
        int[] kembalian = {187600, 3900, 100, 0, 99999};
        for (int k : kembalian) {
            System.out.println("Kembalian Rp" + k + ":");
            int sisa = k;
            int lembar = 0;
            for (int p : pecahan) {
                if (sisa >= p) {
                    int n = sisa / p;
                    sisa %= p;
                    lembar += n;
                    System.out.println("  " + n + " x " + p);
                }
            }
            if (sisa > 0) {
                System.out.println("  sisa tidak bisa dibayar: " + sisa);
            }
            System.out.println("  total keping/lembar: " + lembar);
        }
    }
}
