// Menghapus duplikat dari ArrayList dengan dua cara (list baru + contains, loop mundur + indexOf) lalu mencari elemen yang kembar
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        int[] isi = {4, 7, 4, 1, 7, 7, 9, 1, 4, 2};
        for (int x : isi) {
            data.add(x);
        }
        System.out.println("data       : " + data);
        ArrayList<Integer> unik = new ArrayList<>();
        for (Integer x : data) {
            if (!unik.contains(x)) {
                unik.add(x);
            }
        }
        System.out.println("cara 1     : " + unik);
        ArrayList<Integer> salin = new ArrayList<>(data);
        for (int i = salin.size() - 1; i >= 0; i--) {
            if (salin.indexOf(salin.get(i)) != i) {
                System.out.println("  hapus indeks " + i + " (" + salin.get(i) + ")");
                salin.remove(i);
            }
        }
        System.out.println("cara 2     : " + salin);
        System.out.println("sama? " + unik.equals(salin));
        ArrayList<Integer> kembar = new ArrayList<>();
        for (Integer x : unik) {
            int n = 0;
            for (Integer y : data) {
                if (x.equals(y)) {
                    n++;
                }
            }
            if (n > 1) {
                kembar.add(x);
                System.out.println(x + " muncul " + n + " kali");
            }
        }
        System.out.println("yang kembar: " + kembar);
    }
}
