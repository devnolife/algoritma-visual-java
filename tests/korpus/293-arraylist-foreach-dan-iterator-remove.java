// Menelusuri ArrayList dengan for-each, for indeks, dan Iterator; Iterator.remove menghapus elemen dengan aman selama penelusuran
import java.util.ArrayList;
import java.util.Iterator;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> nilai = new ArrayList<>();
        int[] data = {55, 80, 42, 91, 67, 30, 78};
        for (int d : data) {
            nilai.add(d);
        }
        int total = 0;
        for (int n : nilai) {
            total += n;
        }
        System.out.println("nilai " + nilai + ", total " + total);
        for (int i = 0; i < nilai.size(); i++) {
            if (i % 2 == 0) {
                System.out.print("[" + i + "]=" + nilai.get(i) + " ");
            }
        }
        System.out.println();
        Iterator<Integer> it = nilai.iterator();
        while (it.hasNext()) {
            int n = it.next();
            if (n < 60) {
                it.remove();
                System.out.println("hapus " + n + " -> " + nilai);
            }
        }
        System.out.println("tersisa yang lulus: " + nilai + ", size " + nilai.size());
        Iterator<Integer> it2 = nilai.iterator();
        int urutan = 1;
        while (it2.hasNext()) {
            System.out.println(urutan + ". " + it2.next());
            urutan++;
        }
    }
}
