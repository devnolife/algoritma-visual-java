// Method isPrima dengan pembagi sampai akar, prima kembar, dan faktorisasi prima
public class Main {
    static boolean isPrima(int n) {
        if (n < 2) {
            return false;
        }
        if (n % 2 == 0) {
            return n == 2;
        }
        for (int i = 3; i * i <= n; i += 2) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }

    static String faktorisasi(int n) {
        String hasil = "";
        for (int p = 2; p * p <= n; p++) {
            while (n % p == 0) {
                hasil += (hasil.isEmpty() ? "" : " x ") + p;
                n /= p;
            }
        }
        if (n > 1) {
            hasil += (hasil.isEmpty() ? "" : " x ") + n;
        }
        return hasil;
    }

    public static void main(String[] args) {
        System.out.print("Prima kembar < 100:");
        for (int i = 3; i + 2 < 100; i += 2) {
            if (isPrima(i) && isPrima(i + 2)) {
                System.out.print(" (" + i + "," + (i + 2) + ")");
            }
        }
        System.out.println();
        int[] uji = {0, 1, 2, 17, 91, 97, 7919};
        for (int u : uji) {
            System.out.println(u + " prima? " + isPrima(u));
        }
        int[] angka = {360, 97, 1001, 1024, 9973};
        for (int a : angka) {
            System.out.println(a + " = " + faktorisasi(a));
        }
    }
}
