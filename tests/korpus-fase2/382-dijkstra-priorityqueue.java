// Dijkstra dengan PriorityQueue<int[]> {simpul, jarak}: entri basi dilewati, setiap relaksasi dicetak, lalu jalur terpendek direkonstruksi
import java.util.ArrayList;
import java.util.Arrays;
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        int n = 6;
        String[] nama = {"A", "B", "C", "D", "E", "F"};
        ArrayList<ArrayList<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        int[][] sisi = {{0, 1, 7}, {0, 2, 9}, {0, 5, 14}, {1, 2, 10}, {1, 3, 15}, {2, 3, 11}, {2, 5, 2}, {3, 4, 6}, {4, 5, 9}};
        for (int[] s : sisi) {
            adj.get(s[0]).add(new int[] {s[1], s[2]});
            adj.get(s[1]).add(new int[] {s[0], s[2]});
        }
        int[] jarak = new int[n];
        int[] asal = new int[n];
        Arrays.fill(jarak, Integer.MAX_VALUE);
        Arrays.fill(asal, -1);
        jarak[0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[] {0, 0});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int u = cur[0];
            if (cur[1] > jarak[u]) {
                System.out.println("lewati entri basi " + nama[u] + "=" + cur[1]);
                continue;
            }
            System.out.println("proses " + nama[u] + " (jarak " + jarak[u] + ")");
            for (int[] e : adj.get(u)) {
                int v = e[0];
                int baru = jarak[u] + e[1];
                if (baru < jarak[v]) {
                    System.out.println("  relaksasi " + nama[v] + ": " + (jarak[v] == Integer.MAX_VALUE ? "inf" : "" + jarak[v]) + " -> " + baru);
                    jarak[v] = baru;
                    asal[v] = u;
                    pq.offer(new int[] {v, baru});
                }
            }
        }
        System.out.println("jarak akhir: " + Arrays.toString(jarak));
        StringBuilder jalur = new StringBuilder(nama[4]);
        for (int v = asal[4]; v != -1; v = asal[v]) {
            jalur.insert(0, nama[v] + " -> ");
        }
        System.out.println("jalur A ke E: " + jalur);
    }
}
