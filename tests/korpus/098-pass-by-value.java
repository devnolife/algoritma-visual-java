// Pass-by-value: primitif dan String tidak berubah, isi array berubah
import java.util.Arrays;

public class Main {
    static void ubahInt(int x) {
        x = x * 100;
        System.out.println("  di dalam ubahInt: x = " + x);
    }

    static void ubahString(String s) {
        s = s + " (diubah)";
        System.out.println("  di dalam ubahString: s = " + s);
    }

    static void ubahArray(int[] a) {
        a[0] = a[0] * 100;
    }

    static int tambahSatu(int x) {
        return x + 1;
    }

    static void tukar(int a, int b) {
        int t = a;
        a = b;
        b = t;
        System.out.println("  di dalam tukar: a = " + a + ", b = " + b);
    }

    static void tukarArray(int[] p) {
        int t = p[0];
        p[0] = p[1];
        p[1] = t;
    }

    public static void main(String[] args) {
        int angka = 5;
        ubahInt(angka);
        System.out.println("angka setelah ubahInt = " + angka);
        angka = tambahSatu(angka);
        System.out.println("angka setelah ditugaskan hasil = " + angka);
        String nama = "Budi";
        ubahString(nama);
        System.out.println("nama setelah ubahString = " + nama);
        int[] data = {5, 6};
        ubahArray(data);
        System.out.println("data setelah ubahArray = " + Arrays.toString(data));
        int x = 1, y = 2;
        tukar(x, y);
        System.out.println("x = " + x + ", y = " + y + " (tidak tertukar)");
        int[] pasangan = {1, 2};
        tukarArray(pasangan);
        System.out.println("pasangan = " + Arrays.toString(pasangan) + " (tertukar)");
        char c = 'a';
        c = (char) tambahSatu(c);
        System.out.println("c = " + c);
    }
}
