// PriorityQueue<int[]> dengan comparator (a, b) -> a[1] - b[1] seperti pada Dijkstra, dan comparator dua kunci dengan Integer.compare
import java.util.Arrays;
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        int[][] masuk = {{0, 7}, {1, 2}, {2, 9}, {3, 2}, {4, 5}, {5, 1}, {6, 7}};
        for (int[] m : masuk) {
            pq.offer(m);
            int[] puncak = pq.peek();
            System.out.println("offer " + Arrays.toString(m) + " -> puncak " + Arrays.toString(puncak) + ", size " + pq.size());
        }
        while (!pq.isEmpty()) {
            int[] e = pq.poll();
            System.out.println("poll simpul " + e[0] + " jarak " + e[1]);
        }
        PriorityQueue<int[]> duaKunci = new PriorityQueue<>((a, b) -> {
            if (a[0] != b[0]) {
                return Integer.compare(a[0], b[0]);
            }
            return Integer.compare(b[1], a[1]);
        });
        duaKunci.add(new int[] {2, 10});
        duaKunci.add(new int[] {1, 5});
        duaKunci.add(new int[] {2, 30});
        duaKunci.add(new int[] {1, 50});
        StringBuilder sb = new StringBuilder();
        while (!duaKunci.isEmpty()) {
            sb.append(Arrays.toString(duaKunci.poll())).append(' ');
        }
        System.out.println("dua kunci: " + sb.toString().trim());
    }
}
