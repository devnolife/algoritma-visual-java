// Array 2D: inisialisasi, deepToString, jumlah baris/kolom, dan nilai maksimum
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] nilai = {
            {80, 90, 70, 60},
            {55, 65, 75, 85},
            {100, 95, 90, 85}
        };
        System.out.println(Arrays.deepToString(nilai));
        System.out.println("Baris: " + nilai.length + ", kolom: " + nilai[0].length);
        for (int i = 0; i < nilai.length; i++) {
            int jumlah = 0;
            for (int j = 0; j < nilai[i].length; j++) {
                jumlah += nilai[i][j];
            }
            System.out.println("Jumlah baris " + i + " = " + jumlah);
        }
        for (int j = 0; j < nilai[0].length; j++) {
            int jumlah = 0;
            for (int i = 0; i < nilai.length; i++) {
                jumlah += nilai[i][j];
            }
            System.out.print("kolom" + j + "=" + jumlah + " ");
        }
        System.out.println();
        int maks = nilai[0][0], bMaks = 0, kMaks = 0;
        for (int i = 0; i < nilai.length; i++) {
            for (int j = 0; j < nilai[i].length; j++) {
                if (nilai[i][j] > maks) {
                    maks = nilai[i][j];
                    bMaks = i;
                    kMaks = j;
                }
            }
        }
        System.out.println("Maks " + maks + " di [" + bMaks + "][" + kMaks + "]");
        int[][] papan = new int[3][3];
        int isi = 1;
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                papan[i][j] = isi++;
            }
        }
        papan[1][1] = 0;
        System.out.println(Arrays.deepToString(papan));
        System.out.println(Arrays.toString(papan[2]));
        int[] baris = papan[0];
        baris[0] = 42;
        System.out.println("Baris adalah referensi: papan[0][0] = " + papan[0][0]);
        double[][] koordinat = {{1.5, -2.0}, {0.0, 3.25}};
        System.out.println(Arrays.deepToString(koordinat));
    }
}
