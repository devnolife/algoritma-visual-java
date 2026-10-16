// Antarmuka Deque dan Queue dengan dua implementasi (ArrayDeque, LinkedList): operasi sama menghasilkan isi sama, kecuali null yang hanya diterima LinkedList
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedList;
import java.util.Queue;

public class Main {
    static void jalankan(String nama, Deque<Integer> d) {
        d.offerLast(3);
        d.offerFirst(2);
        d.push(1);
        d.addLast(4);
        System.out.println(nama + ": " + d + " first=" + d.peekFirst() + " last=" + d.peekLast());
        d.pollLast();
        d.removeFirst();
        System.out.println(nama + " setelah pollLast & removeFirst: " + d + ", size " + d.size());
    }

    public static void main(String[] args) {
        jalankan("ArrayDeque", new ArrayDeque<>());
        jalankan("LinkedList", new LinkedList<>());
        Queue<String> q1 = new ArrayDeque<>();
        Queue<String> q2 = new LinkedList<>();
        String[] isi = {"x", "y", "z"};
        for (String s : isi) {
            q1.offer(s);
            q2.offer(s);
        }
        System.out.println("q1 " + q1 + " peek " + q1.peek() + ", q2 " + q2 + " peek " + q2.peek());
        System.out.println("poll q1 " + q1.poll() + ", poll q2 " + q2.poll() + " -> " + q1 + " " + q2);
        q2.offer(null);
        System.out.println("LinkedList menerima null: " + q2 + ", size " + q2.size() + ", peek tetap " + q2.peek());
        System.out.println("ArrayDeque tidak meng-override equals: q1.equals(q1) " + q1.equals(q1) + ", q1.equals(q2) " + q1.equals(q2));
    }
}
