// Comparator lambda yang mencetak pasangan untuk TreeSet (elemen pertama dibandingkan dengan dirinya sendiri), Collections.max/min, dan PriorityQueue
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        Comparator<Integer> cetak = (a, b) -> {
            System.out.print(a + "?" + b + " ");
            return Integer.compare(a, b);
        };
        TreeSet<Integer> himpunan = new TreeSet<>(cetak);
        int[] masuk = {40, 20, 60, 10, 30, 20};
        for (int m : masuk) {
            System.out.print("add " + m + ": ");
            boolean baru = himpunan.add(m);
            System.out.println("-> " + baru);
        }
        System.out.println("himpunan " + himpunan);
        ArrayList<Integer> list = new ArrayList<>();
        for (int m : masuk) {
            list.add(m);
        }
        System.out.print("Collections.max: ");
        System.out.println("-> " + Collections.max(list, cetak));
        System.out.print("Collections.min: ");
        System.out.println("-> " + Collections.min(list, cetak));
        PriorityQueue<Integer> pq = new PriorityQueue<>(cetak);
        System.out.print("offer berurutan: ");
        for (int m : masuk) {
            pq.offer(m);
        }
        System.out.println("-> " + pq);
        System.out.print("poll: ");
        System.out.println("-> " + pq.poll() + ", heap " + pq);
    }
}
