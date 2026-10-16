// PriorityQueue dengan Comparator lambda (a, b) -> b - a sebagai max-heap, dan min-heap berukuran k untuk mencari k nilai terbesar
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        int[] nilai = {67, 92, 45, 88, 73, 99, 51, 84, 60, 95};
        PriorityQueue<Integer> maks = new PriorityQueue<>((a, b) -> b - a);
        for (int n : nilai) {
            maks.offer(n);
        }
        System.out.println("max-heap: " + maks + ", peek " + maks.peek());
        System.out.print("3 terbesar lewat poll: ");
        for (int i = 0; i < 3; i++) {
            System.out.print(maks.poll() + " ");
        }
        System.out.println();
        int k = 4;
        PriorityQueue<Integer> topK = new PriorityQueue<>();
        for (int n : nilai) {
            topK.offer(n);
            if (topK.size() > k) {
                int buang = topK.poll();
                System.out.println("tambah " + n + ", buang " + buang + " -> " + topK);
            } else {
                System.out.println("tambah " + n + " -> " + topK);
            }
        }
        System.out.println(k + " nilai terbesar (heap min): " + topK);
        PriorityQueue<String> panjang = new PriorityQueue<>((a, b) -> b.length() - a.length());
        String[] kata = {"aku", "belajar", "struktur", "data", "di", "kampus"};
        for (String s : kata) {
            panjang.add(s);
        }
        System.out.println("kata terpanjang dulu: " + panjang.poll() + ", " + panjang.poll() + ", sisa " + panjang);
    }
}
