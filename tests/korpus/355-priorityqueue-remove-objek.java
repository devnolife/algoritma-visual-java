// PriorityQueue.remove(Object) dan contains: elemen di tengah heap dihapus lalu heap disusun ulang; remove() tanpa argumen pada antrian kosong melempar
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : new int[] {10, 20, 15, 40, 50, 17, 16, 45}) {
            pq.add(x);
        }
        System.out.println("heap " + pq);
        System.out.println("contains(17) " + pq.contains(17) + ", contains(99) " + pq.contains(99));
        System.out.println("remove(Integer 20) " + pq.remove(Integer.valueOf(20)) + " -> " + pq);
        System.out.println("remove(Integer 10) " + pq.remove(Integer.valueOf(10)) + " -> " + pq);
        System.out.println("remove(Integer 99) " + pq.remove(Integer.valueOf(99)) + " -> " + pq);
        System.out.println("remove() " + pq.remove() + " -> " + pq);
        System.out.println("element() " + pq.element());
        pq.clear();
        System.out.println("setelah clear: " + pq + ", poll " + pq.poll());
        pq.remove();
    }
}
