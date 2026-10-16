// Array sebagai parameter: isi diubah method terlihat pemanggil, penugasan ulang tidak
import java.util.Arrays;

public class Main {
    static void gandakan(int[] data) {
        for (int i = 0; i < data.length; i++) {
            data[i] *= 2;
        }
    }

    static void gantiArray(int[] data) {
        data = new int[] {0, 0, 0};
        data[0] = 99;
        System.out.println("  di dalam gantiArray: " + Arrays.toString(data));
    }

    static void tukar(int[] data, int i, int j) {
        int tmp = data[i];
        data[i] = data[j];
        data[j] = tmp;
    }

    static void isiNama(String[] nama) {
        nama[0] = nama[0].toUpperCase();
        nama[1] = "Baru";
    }

    static int[] buatSalinanTerbalik(int[] data) {
        int[] hasil = new int[data.length];
        for (int i = 0; i < data.length; i++) {
            hasil[i] = data[data.length - 1 - i];
        }
        return hasil;
    }

    public static void main(String[] args) {
        int[] angka = {1, 2, 3};
        gandakan(angka);
        System.out.println("Setelah gandakan: " + Arrays.toString(angka));
        gantiArray(angka);
        System.out.println("Setelah gantiArray: " + Arrays.toString(angka));
        tukar(angka, 0, 2);
        System.out.println("Setelah tukar: " + Arrays.toString(angka));
        String[] nama = {"ani", "budi"};
        isiNama(nama);
        System.out.println("Nama: " + Arrays.toString(nama));
        int[] terbalik = buatSalinanTerbalik(angka);
        terbalik[0] = -1;
        System.out.println("Asli: " + Arrays.toString(angka) + ", salinan: " + Arrays.toString(terbalik));
        int[][] matriks = {{1, 2}, {3, 4}};
        gandakan(matriks[1]);
        System.out.println("Matriks: " + Arrays.deepToString(matriks));
    }
}
