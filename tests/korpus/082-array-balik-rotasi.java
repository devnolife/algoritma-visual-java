// Membalik array di tempat, rotasi kiri/kanan, dan memakai .length untuk elemen terakhir
import java.util.Arrays;

public class Main {
    static void balik(int[] a) {
        for (int i = 0; i < a.length / 2; i++) {
            int tmp = a[i];
            a[i] = a[a.length - 1 - i];
            a[a.length - 1 - i] = tmp;
        }
    }

    static void rotasiKiri(int[] a) {
        int pertama = a[0];
        for (int i = 0; i < a.length - 1; i++) {
            a[i] = a[i + 1];
        }
        a[a.length - 1] = pertama;
    }

    static void rotasiKanan(int[] a) {
        int terakhir = a[a.length - 1];
        for (int i = a.length - 1; i > 0; i--) {
            a[i] = a[i - 1];
        }
        a[0] = terakhir;
    }

    public static void main(String[] args) {
        int[] data = {1, 2, 3, 4, 5, 6};
        System.out.println("Elemen terakhir: " + data[data.length - 1]);
        balik(data);
        System.out.println("Dibalik: " + Arrays.toString(data));
        balik(data);
        rotasiKiri(data);
        System.out.println("Rotasi kiri: " + Arrays.toString(data));
        rotasiKanan(data);
        rotasiKanan(data);
        System.out.println("Rotasi kanan 2x: " + Arrays.toString(data));
        int[] ganjil = {7, 8, 9};
        balik(ganjil);
        System.out.println("Balik panjang ganjil: " + Arrays.toString(ganjil));
        int[] k = 3 > 2 ? new int[] {1} : new int[0];
        balik(k);
        System.out.println("Balik satu elemen: " + Arrays.toString(k));
        int geser = 8 % data.length;
        for (int i = 0; i < geser; i++) {
            rotasiKiri(data);
        }
        System.out.println("Rotasi kiri 8 kali (= 2): " + Arrays.toString(data));
    }
}
