// Bug klasik: membandingkan elemen ArrayList<Integer> dengan == hanya benar untuk -128..127; equals atau intValue memberi hasil benar
import java.util.ArrayList;

public class Main {
    static int hitungKembarSalah(ArrayList<Integer> data) {
        int n = 0;
        for (int i = 0; i < data.size(); i++) {
            for (int j = i + 1; j < data.size(); j++) {
                if (data.get(i) == data.get(j)) {
                    n++;
                }
            }
        }
        return n;
    }

    static int hitungKembarBenar(ArrayList<Integer> data) {
        int n = 0;
        for (int i = 0; i < data.size(); i++) {
            for (int j = i + 1; j < data.size(); j++) {
                if (data.get(i).equals(data.get(j))) {
                    n++;
                }
            }
        }
        return n;
    }

    public static void main(String[] args) {
        ArrayList<Integer> kecil = new ArrayList<>();
        ArrayList<Integer> besar = new ArrayList<>();
        int[] pola = {5, 9, 5, 7, 9, 5};
        for (int p : pola) {
            kecil.add(p);
            besar.add(p * 100);
        }
        System.out.println("kecil " + kecil + ": salah " + hitungKembarSalah(kecil) + ", benar " + hitungKembarBenar(kecil));
        System.out.println("besar " + besar + ": salah " + hitungKembarSalah(besar) + ", benar " + hitungKembarBenar(besar));
        Integer pertama = besar.get(0);
        Integer ketiga = besar.get(2);
        System.out.println("besar[0] == besar[2]: " + (pertama == ketiga) + ", intValue sama: " + (pertama.intValue() == ketiga.intValue()));
        System.out.println("besar[0] == 500 (unboxing): " + (besar.get(0) == 500) + ", besar[0] < besar[1]: " + (besar.get(0) < besar.get(1)));
        Integer sama = besar.get(0);
        besar.add(sama);
        System.out.println("objek yang sama ditambahkan lagi: " + (besar.get(0) == besar.get(besar.size() - 1)));
    }
}
