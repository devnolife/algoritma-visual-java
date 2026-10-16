// ArrayDeque menolak null: offer/addLast/push(null) melempar NullPointerException tanpa pesan, berbeda dengan LinkedList yang menerima null
import java.util.ArrayDeque;
import java.util.LinkedList;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> daftar = new LinkedList<>();
        daftar.add(null);
        daftar.addFirst("awal");
        System.out.println("LinkedList menerima null: " + daftar + ", size " + daftar.size());
        ArrayDeque<String> deque = new ArrayDeque<>();
        deque.offer("satu");
        try {
            deque.offer(null);
        } catch (NullPointerException e) {
            System.out.println("offer(null) -> " + e + ", pesan " + e.getMessage());
        }
        try {
            deque.addLast(null);
        } catch (NullPointerException e) {
            System.out.println("addLast(null) -> " + e);
        }
        System.out.println("deque tetap " + deque + ", poll pada deque berisi satu: " + deque.poll() + ", poll lagi: " + deque.poll());
        String kosong = null;
        System.out.println("push(null)...");
        deque.push(kosong);
        System.out.println("tidak tercetak");
    }
}
