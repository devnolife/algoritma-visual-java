// Arrays.sort dengan lambda pada Integer[], String[], dan array objek; Arrays.sort tanpa comparator memakai urutan alami
import java.util.Arrays;

public class Main {
    static class Kota {
        String nama;
        int luas;

        Kota(String nama, int luas) {
            this.nama = nama;
            this.luas = luas;
        }

        @Override
        public String toString() {
            return nama + ":" + luas;
        }
    }

    public static void main(String[] args) {
        Integer[] angka = {42, -3, 17, 8, 99, 0, 17};
        Arrays.sort(angka, (a, b) -> b - a);
        System.out.println("Integer[] turun: " + Arrays.toString(angka));
        String[] kata = {"semangka", "apel", "kiwi", "jeruk", "nanas", "Duku"};
        Arrays.sort(kata);
        System.out.println("String[] alami: " + Arrays.toString(kata));
        Arrays.sort(kata, (a, b) -> a.length() - b.length());
        System.out.println("String[] panjang (stabil): " + Arrays.toString(kata));
        Arrays.sort(kata, (a, b) -> a.compareToIgnoreCase(b));
        System.out.println("String[] abaikan huruf besar: " + Arrays.toString(kata));
        Kota[] kota = {new Kota("Makassar", 199), new Kota("Parepare", 99), new Kota("Palopo", 247), new Kota("Gowa", 1883)};
        Arrays.sort(kota, (a, b) -> Integer.compare(b.luas, a.luas));
        System.out.println("Kota[] luas turun: " + Arrays.toString(kota));
        Arrays.sort(kota, (a, b) -> a.nama.compareTo(b.nama));
        System.out.println("Kota[] nama: " + Arrays.toString(kota));
        Integer[] sebagian = {9, 8, 7, 6, 5, 4};
        Arrays.sort(sebagian, 1, 4, (a, b) -> a - b);
        System.out.println("hanya indeks 1..3 diurutkan: " + Arrays.toString(sebagian));
    }
}
