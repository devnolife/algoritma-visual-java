// for-each pada int[], String[], char[], 2D array; mengubah variabel loop tidak mengubah array
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nilai = {3, 1, 4, 1, 5};
        int jumlah = 0;
        for (int n : nilai) {
            jumlah += n;
        }
        System.out.println("Jumlah = " + jumlah);
        for (int n : nilai) {
            n = n * 10;
        }
        System.out.println("Setelah for-each mengubah n: " + Arrays.toString(nilai));
        for (int i = 0; i < nilai.length; i++) {
            nilai[i] = nilai[i] * 10;
        }
        System.out.println("Setelah for biasa: " + Arrays.toString(nilai));
        String[] kota = {"Makassar", "Bandung", "Medan"};
        for (String k : kota) {
            System.out.println(k + " (" + k.length() + " huruf)");
        }
        for (char c : "JAVA".toCharArray()) {
            System.out.print(c + "-");
        }
        System.out.println();
        int[][] matriks = {{1, 2}, {3, 4, 5}, {}};
        for (int[] baris : matriks) {
            int total = 0;
            for (int v : baris) {
                total += v;
            }
            System.out.println("Baris " + Arrays.toString(baris) + " total " + total);
        }
        double[] suhu = {30.5, 28.0, 31.25};
        double maks = suhu[0];
        for (double s : suhu) {
            if (s > maks) {
                maks = s;
            }
        }
        System.out.println("Suhu maksimum = " + maks);
        boolean[] hadir = {true, false, true, true};
        int jumlahHadir = 0;
        for (boolean h : hadir) {
            if (h) {
                jumlahHadir++;
            }
        }
        System.out.println("Hadir " + jumlahHadir + " dari " + hadir.length);
    }
}
