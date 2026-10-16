// Jumlah berjalan (prefix sum), jumlah subarray, dan rata-rata bergerak
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] penjualan = {12, 7, 3, 15, 9, 4, 20};
        int[] prefix = new int[penjualan.length + 1];
        for (int i = 0; i < penjualan.length; i++) {
            prefix[i + 1] = prefix[i] + penjualan[i];
        }
        System.out.println("Data   : " + Arrays.toString(penjualan));
        System.out.println("Prefix : " + Arrays.toString(prefix));
        int kiri = 2, kanan = 5;
        System.out.println("Jumlah indeks " + kiri + ".." + kanan + " = " + (prefix[kanan + 1] - prefix[kiri]));
        int berjalan = 0;
        for (int i = 0; i < penjualan.length; i++) {
            berjalan += penjualan[i];
            System.out.print(berjalan + (i < penjualan.length - 1 ? " -> " : "\n"));
        }
        int k = 3;
        double[] rataBergerak = new double[penjualan.length - k + 1];
        int jendela = 0;
        for (int i = 0; i < penjualan.length; i++) {
            jendela += penjualan[i];
            if (i >= k) {
                jendela -= penjualan[i - k];
            }
            if (i >= k - 1) {
                rataBergerak[i - k + 1] = jendela / (double) k;
            }
        }
        System.out.println("Rata bergerak 3: " + Arrays.toString(rataBergerak));
        int terbaik = Integer.MIN_VALUE, awalTerbaik = 0;
        for (int i = 0; i + k <= penjualan.length; i++) {
            int total = prefix[i + k] - prefix[i];
            if (total > terbaik) {
                terbaik = total;
                awalTerbaik = i;
            }
        }
        System.out.println("Jendela terbaik mulai indeks " + awalTerbaik + " dengan total " + terbaik);
    }
}
