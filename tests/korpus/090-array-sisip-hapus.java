// Menyisipkan dan menghapus elemen array dengan pergeseran dan Arrays.copyOf
import java.util.Arrays;

public class Main {
    static int[] sisip(int[] a, int indeks, int nilai) {
        int[] hasil = Arrays.copyOf(a, a.length + 1);
        for (int i = hasil.length - 1; i > indeks; i--) {
            hasil[i] = hasil[i - 1];
        }
        hasil[indeks] = nilai;
        return hasil;
    }

    static int[] hapus(int[] a, int indeks) {
        int[] hasil = new int[a.length - 1];
        for (int i = 0, j = 0; i < a.length; i++) {
            if (i != indeks) {
                hasil[j++] = a[i];
            }
        }
        return hasil;
    }

    static int[] sisipTerurut(int[] a, int nilai) {
        int posisi = 0;
        while (posisi < a.length && a[posisi] < nilai) {
            posisi++;
        }
        return sisip(a, posisi, nilai);
    }

    public static void main(String[] args) {
        int[] data = {10, 20, 30, 40};
        data = sisip(data, 2, 25);
        System.out.println("Sisip 25 di indeks 2: " + Arrays.toString(data));
        data = sisip(data, 0, 5);
        System.out.println("Sisip 5 di awal: " + Arrays.toString(data));
        data = sisip(data, data.length, 50);
        System.out.println("Sisip 50 di akhir: " + Arrays.toString(data));
        data = hapus(data, 3);
        System.out.println("Hapus indeks 3: " + Arrays.toString(data));
        data = hapus(data, 0);
        System.out.println("Hapus indeks 0: " + Arrays.toString(data));
        int[] urut = {};
        int[] masuk = {7, 3, 9, 1, 5};
        for (int m : masuk) {
            urut = sisipTerurut(urut, m);
            System.out.println("Masukkan " + m + " -> " + Arrays.toString(urut));
        }
    }
}
