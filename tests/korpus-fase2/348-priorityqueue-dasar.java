// PriorityQueue<Integer>: offer menyusun min-heap di dalam array, peek melihat yang terkecil, poll mengeluarkan berurutan dari yang terkecil
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        int[] masuk = {5, 1, 4, 2, 3, 9, 0, 7};
        for (int m : masuk) {
            pq.offer(m);
            System.out.println("offer " + m + " -> heap " + pq + ", peek " + pq.peek() + ", size " + pq.size());
        }
        StringBuilder keluar = new StringBuilder();
        while (!pq.isEmpty()) {
            int x = pq.poll();
            keluar.append(x).append(' ');
            System.out.println("poll " + x + " -> heap " + pq);
        }
        System.out.println("urutan keluar: " + keluar.toString().trim());
        System.out.println("poll pada antrian kosong: " + pq.poll() + ", peek: " + pq.peek());
        pq.add(10);
        pq.add(10);
        pq.add(-1);
        System.out.println("duplikat boleh: " + pq + ", contains(10) " + pq.contains(10));
    }
}
