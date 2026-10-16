// Collections.sort, reverse, max, min, swap, dan frequency pada ArrayList<Integer> dan ArrayList<String>; max pada list kosong tidak ditangkap
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> angka = new ArrayList<>();
        int[] data = {42, -7, 19, 0, 42, 88, 3, 19, 42};
        for (int d : data) {
            angka.add(d);
        }
        System.out.println("awal      : " + angka);
        System.out.println("max " + Collections.max(angka) + ", min " + Collections.min(angka) + ", frekuensi 42 = " + Collections.frequency(angka, 42) + ", frekuensi 5 = " + Collections.frequency(angka, 5));
        Collections.sort(angka);
        System.out.println("sort      : " + angka);
        Collections.reverse(angka);
        System.out.println("reverse   : " + angka);
        Collections.swap(angka, 0, angka.size() - 1);
        System.out.println("swap(0, n-1): " + angka);
        ArrayList<String> nama = new ArrayList<>();
        String[] isi = {"budi", "Ani", "citra", "Budi", "ani", "Zaki", "eka"};
        for (String s : isi) {
            nama.add(s);
        }
        Collections.sort(nama);
        System.out.println("nama terurut (huruf besar dulu): " + nama);
        System.out.println("max nama " + Collections.max(nama) + ", min nama " + Collections.min(nama));
        Collections.reverse(nama);
        System.out.println("reverse: " + nama);
        System.out.println("frekuensi \"ani\" = " + Collections.frequency(nama, "ani"));
        ArrayList<Integer> kosong = new ArrayList<>();
        Collections.sort(kosong);
        Collections.reverse(kosong);
        System.out.println("list kosong tetap " + kosong);
        System.out.println("max list kosong: " + Collections.max(kosong));
    }
}
