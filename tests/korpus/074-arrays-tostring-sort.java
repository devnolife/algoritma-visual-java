// Arrays.toString dan Arrays.sort untuk int, double (NaN, -0.0), char, String
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] angka = {42, -7, 0, 15, -7, 100, 3};
        System.out.println("Sebelum: " + Arrays.toString(angka));
        Arrays.sort(angka);
        System.out.println("Sesudah: " + Arrays.toString(angka));
        double[] pecahan = {3.5, Double.NaN, -0.0, 0.0, -2.25, Double.NEGATIVE_INFINITY, 1e-3};
        Arrays.sort(pecahan);
        System.out.println("double terurut: " + Arrays.toString(pecahan));
        char[] huruf = {'d', 'A', 'z', 'a', 'Z', '0'};
        Arrays.sort(huruf);
        System.out.println("char terurut: " + Arrays.toString(huruf));
        String[] kata = {"pisang", "Apel", "ceri", "apel", "Banana", "10", "9"};
        Arrays.sort(kata);
        System.out.println("String terurut: " + Arrays.toString(kata));
        long[] besar = {5_000_000_000L, -1L, 3L};
        Arrays.sort(besar);
        System.out.println("long terurut: " + Arrays.toString(besar));
        boolean[] status = {true, false};
        System.out.println("boolean: " + Arrays.toString(status));
        float[] f = {2.5f, 0.1f};
        System.out.println("float: " + Arrays.toString(f));
        int[] satu = {9};
        Arrays.sort(satu);
        System.out.println("satu elemen: " + Arrays.toString(satu));
        int[] nilai = {70, 85, 60, 90, 75};
        int[] salinan = Arrays.copyOf(nilai, nilai.length);
        Arrays.sort(salinan);
        System.out.println("Asli tetap: " + Arrays.toString(nilai) + ", median: " + salinan[salinan.length / 2]);
    }
}
