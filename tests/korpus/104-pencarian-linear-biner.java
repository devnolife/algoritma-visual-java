// Pencarian linear vs biner iteratif dengan jumlah langkah
public class Main {
    static int linear(int[] a, int target) {
        int langkah = 0;
        for (int i = 0; i < a.length; i++) {
            langkah++;
            if (a[i] == target) {
                System.out.print("[linear " + langkah + " langkah] ");
                return i;
            }
        }
        System.out.print("[linear " + langkah + " langkah] ");
        return -1;
    }

    static int biner(int[] a, int target) {
        int kiri = 0, kanan = a.length - 1, langkah = 0;
        while (kiri <= kanan) {
            langkah++;
            int tengah = kiri + (kanan - kiri) / 2;
            if (a[tengah] == target) {
                System.out.print("[biner " + langkah + " langkah] ");
                return tengah;
            } else if (a[tengah] < target) {
                kiri = tengah + 1;
            } else {
                kanan = tengah - 1;
            }
        }
        System.out.print("[biner " + langkah + " langkah] ");
        return -1;
    }

    public static void main(String[] args) {
        int[] data = new int[64];
        for (int i = 0; i < data.length; i++) {
            data[i] = i * 3 + 1;
        }
        int[] target = {1, 97, 190, 50, 200};
        for (int t : target) {
            int a = linear(data, t);
            int b = biner(data, t);
            System.out.println("target " + t + " -> " + a + " / " + b);
        }
    }
}
