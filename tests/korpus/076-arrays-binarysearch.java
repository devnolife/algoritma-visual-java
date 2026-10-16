// Arrays.binarySearch: ditemukan, tidak ditemukan (-(titik sisip) - 1), int/String/char
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {3, 8, 15, 23, 42, 57, 91};
        int[] cari = {23, 3, 91, 1, 20, 100};
        for (int x : cari) {
            int hasil = Arrays.binarySearch(data, x);
            if (hasil >= 0) {
                System.out.println(x + " ditemukan di indeks " + hasil);
            } else {
                int titikSisip = -hasil - 1;
                System.out.println(x + " tidak ada, hasil " + hasil + ", titik sisip " + titikSisip);
            }
        }
        String[] nama = {"Ani", "Budi", "Citra", "Dedi", "Eka"};
        System.out.println("Citra -> " + Arrays.binarySearch(nama, "Citra"));
        System.out.println("Bayu  -> " + Arrays.binarySearch(nama, "Bayu"));
        System.out.println("Zaki  -> " + Arrays.binarySearch(nama, "Zaki"));
        char[] huruf = "aeiou".toCharArray();
        System.out.println("'i' -> " + Arrays.binarySearch(huruf, 'i'));
        System.out.println("'b' -> " + Arrays.binarySearch(huruf, 'b'));
        double[] skor = {1.5, 2.5, 3.5};
        System.out.println("2.5 -> " + Arrays.binarySearch(skor, 2.5));
        System.out.println("4.0 -> " + Arrays.binarySearch(skor, 4.0));
        int[] acak = {50, 10, 40, 20, 30};
        Arrays.sort(acak);
        System.out.println("Setelah sort " + Arrays.toString(acak) + ", 40 di indeks " + Arrays.binarySearch(acak, 40));
    }
}
