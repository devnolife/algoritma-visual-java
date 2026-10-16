import java.util.Arrays;

public class Main {
    static int perbandingan = 0;

    public static void main(String[] args) {
        int n = 7;
        boolean terurut = false;
        int[] data = new int[n];
        for (int k = 0; k < n; k++) {
            data[k] = terurut ? k + 1 : (k * 37 + 11) % 50 + 1;
        }
        quickSort(data, 0, n - 1);
        System.out.println(Arrays.toString(data));
        System.out.println("Perbandingan: " + perbandingan);
    }

    static void quickSort(int[] data, int kiri, int kanan) {
        if (kiri >= kanan) return;   // #dasar
        int p = partisi(data, kiri, kanan);
        quickSort(data, kiri, p - 1);
        quickSort(data, p + 1, kanan);
    }

    static int partisi(int[] data, int kiri, int kanan) {
        int tengah = (kiri + kanan) / 2;
        tukar(data, tengah, kanan);
        int pivot = data[kanan];   // #pivot
        int i = kiri;
        for (int j = kiri; j < kanan; j++) {
            perbandingan++;
            if (data[j] <= pivot) {
                tukar(data, i, j);
                i++;
            }
        }
        tukar(data, i, kanan);   // #taruh
        return i;
    }

    static void tukar(int[] data, int a, int b) {
        int sementara = data[a];
        data[a] = data[b];
        data[b] = sementara;
    }
}
