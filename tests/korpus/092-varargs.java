// Varargs: nol argumen, satu argumen, array langsung, dan parameter tetap + varargs
import java.util.Arrays;

public class Main {
    static int jumlah(int... angka) {
        int total = 0;
        for (int a : angka) {
            total += a;
        }
        return total;
    }

    static String gabung(String pemisah, String... bagian) {
        return "[" + String.join(pemisah, bagian) + "]";
    }

    static double rataRata(double pertama, double... sisanya) {
        double total = pertama;
        for (double s : sisanya) {
            total += s;
        }
        return total / (1 + sisanya.length);
    }

    static void info(String label, int... data) {
        System.out.println(label + ": panjang " + data.length + " isi " + Arrays.toString(data));
    }

    static void nolkan(int... data) {
        if (data.length > 0) {
            data[0] = 0;
        }
    }

    public static void main(String[] args) {
        System.out.println("jumlah()          = " + jumlah());
        System.out.println("jumlah(5)         = " + jumlah(5));
        System.out.println("jumlah(1, 2, 3, 4)= " + jumlah(1, 2, 3, 4));
        System.out.println("jumlah(array)     = " + jumlah(new int[] {10, 20}));
        System.out.println(gabung("-"));
        System.out.println(gabung(", ", "a"));
        System.out.println(gabung("/", "2024", "01", "15"));
        System.out.println("rata(4)           = " + rataRata(4));
        System.out.println("rata(1, 2, 3, 4)  = " + rataRata(1, 2, 3, 4));
        info("kosong");
        info("tiga", 1, 2, 3);
        int[] arr = {9, 8};
        info("array", arr);
        nolkan(arr);
        System.out.println("Setelah nolkan(arr): " + Arrays.toString(arr));
        nolkan(5, 6);
        System.out.println("nolkan(5, 6) tidak memengaruhi apa pun");
        char[] huruf = {'o', 'k'};
        System.out.printf("%s %d %s%n", "printf juga varargs:", jumlah(huruf[0], huruf[1]), String.valueOf(huruf));
    }
}
