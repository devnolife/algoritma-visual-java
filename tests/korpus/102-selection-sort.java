// Selection sort menaik dan menurun dengan jejak posisi minimum
import java.util.Arrays;

public class Main {
    static void selectionSort(int[] a, boolean menaik) {
        for (int i = 0; i < a.length - 1; i++) {
            int pilih = i;
            for (int j = i + 1; j < a.length; j++) {
                if (menaik ? a[j] < a[pilih] : a[j] > a[pilih]) {
                    pilih = j;
                }
            }
            if (pilih != i) {
                int tmp = a[i];
                a[i] = a[pilih];
                a[pilih] = tmp;
            }
            System.out.println("  i=" + i + " pilih indeks " + pilih + " -> " + Arrays.toString(a));
        }
    }

    public static void main(String[] args) {
        int[] data = {64, 25, 12, 22, 11, -3};
        System.out.println("Menaik:");
        selectionSort(data, true);
        System.out.println("Hasil: " + Arrays.toString(data));
        System.out.println("Menurun:");
        selectionSort(data, false);
        System.out.println("Hasil: " + Arrays.toString(data));
        double[] nilai = {3.5, -1.25, 2.0, 0.0};
        for (int i = 0; i < nilai.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < nilai.length; j++) {
                if (nilai[j] < nilai[min]) {
                    min = j;
                }
            }
            double t = nilai[i];
            nilai[i] = nilai[min];
            nilai[min] = t;
        }
        System.out.println("double terurut: " + Arrays.toString(nilai));
    }
}
