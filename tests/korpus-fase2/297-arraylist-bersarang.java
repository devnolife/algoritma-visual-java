// ArrayList bersarang ArrayList<ArrayList<Integer>>: segitiga Pascal, pengelompokan berdasarkan sisa bagi, dan toString bersarang
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<ArrayList<Integer>> pascal = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            ArrayList<Integer> baris = new ArrayList<>();
            for (int j = 0; j <= i; j++) {
                if (j == 0 || j == i) {
                    baris.add(1);
                } else {
                    ArrayList<Integer> atas = pascal.get(i - 1);
                    baris.add(atas.get(j - 1) + atas.get(j));
                }
            }
            pascal.add(baris);
        }
        for (ArrayList<Integer> baris : pascal) {
            System.out.println(baris);
        }
        System.out.println("pascal[6][3] = " + pascal.get(6).get(3) + ", jumlah baris = " + pascal.size());
        ArrayList<ArrayList<Integer>> grup = new ArrayList<>();
        for (int k = 0; k < 3; k++) {
            grup.add(new ArrayList<>());
        }
        int[] angka = {14, 3, 8, 21, 10, 5, 9, 12};
        for (int a : angka) {
            grup.get(a % 3).add(a);
        }
        System.out.println("kelompok sisa bagi 3: " + grup);
        grup.get(0).clear();
        grup.remove(1);
        System.out.println("setelah clear grup 0 dan remove grup 1: " + grup + ", ukuran " + grup.size());
        ArrayList<Integer> bersama = new ArrayList<>();
        ArrayList<ArrayList<Integer>> dua = new ArrayList<>();
        dua.add(bersama);
        dua.add(bersama);
        bersama.add(7);
        System.out.println("dua elemen menunjuk list yang sama: " + dua);
    }
}
