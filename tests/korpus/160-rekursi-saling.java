// Rekursi saling (genap/ganjil), rekursi pada array, maksimum rekursif, dan fungsi Ackermann kecil
public class Main {
    static int panggilan = 0;

    static boolean genap(int n) {
        return n == 0 ? true : ganjil(n - 1);
    }

    static boolean ganjil(int n) {
        return n == 0 ? false : genap(n - 1);
    }

    static int jumlahArray(int[] a, int i) {
        if (i == a.length) {
            return 0;
        }
        return a[i] + jumlahArray(a, i + 1);
    }

    static int maks(int[] a, int i) {
        if (i == a.length - 1) {
            return a[i];
        }
        int sisanya = maks(a, i + 1);
        return a[i] > sisanya ? a[i] : sisanya;
    }

    static int ackermann(int m, int n) {
        panggilan++;
        if (m == 0) {
            return n + 1;
        }
        if (n == 0) {
            return ackermann(m - 1, 1);
        }
        return ackermann(m - 1, ackermann(m, n - 1));
    }

    static void cetakTerbalik(int[] a, int i) {
        if (i < 0) {
            System.out.println();
            return;
        }
        System.out.print(a[i] + " ");
        cetakTerbalik(a, i - 1);
    }

    public static void main(String[] args) {
        System.out.println("genap(10) = " + genap(10) + ", ganjil(7) = " + ganjil(7) + ", genap(99) = " + genap(99));
        int[] data = {4, 17, -3, 25, 8};
        System.out.println("jumlah = " + jumlahArray(data, 0));
        System.out.println("maks = " + maks(data, 0));
        cetakTerbalik(data, data.length - 1);
        System.out.println("ackermann(2, 2) = " + ackermann(2, 2) + " dengan " + panggilan + " panggilan");
        panggilan = 0;
        System.out.println("ackermann(1, 5) = " + ackermann(1, 5) + " dengan " + panggilan + " panggilan");
    }
}
