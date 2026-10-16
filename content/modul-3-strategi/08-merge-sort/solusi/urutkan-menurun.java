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
        mergeSort(data, 0, n - 1);
        System.out.println("Terurut: " + Arrays.toString(data));
        System.out.println("Perbandingan: " + perbandingan);
    }

    static void mergeSort(int[] data, int kiri, int kanan) {
        if (kiri >= kanan) return;   // #dasar
        int tengah = (kiri + kanan) / 2;
        mergeSort(data, kiri, tengah);   // #pecah
        mergeSort(data, tengah + 1, kanan);
        gabung(data, kiri, tengah, kanan);
    }

    static void gabung(int[] data, int kiri, int tengah, int kanan) {
        int[] bantu = new int[kanan - kiri + 1];
        int i = kiri, j = tengah + 1, k = 0;
        while (i <= tengah && j <= kanan) {
            perbandingan++;
            if (data[i] >= data[j]) bantu[k++] = data[i++];   // #pilih
            else bantu[k++] = data[j++];
        }
        while (i <= tengah) bantu[k++] = data[i++];
        while (j <= kanan) bantu[k++] = data[j++];
        for (k = 0; k < bantu.length; k++) {
            data[kiri + k] = bantu[k];
        }
    }
}
