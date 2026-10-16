// BFS pada graf tak berarah dengan daftar ketetanggaan ArrayList<ArrayList<Integer>> dan antrian ArrayDeque: urutan kunjungan, jarak, dan jalur terpendek
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int n = 8;
        ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        int[][] sisi = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}, {2, 6}, {6, 5}};
        for (int[] s : sisi) {
            adj.get(s[0]).add(s[1]);
            adj.get(s[1]).add(s[0]);
        }
        System.out.println("ketetanggaan: " + adj);
        int[] jarak = new int[n];
        int[] asal = new int[n];
        Arrays.fill(jarak, -1);
        Arrays.fill(asal, -1);
        ArrayDeque<Integer> antrian = new ArrayDeque<>();
        antrian.offer(0);
        jarak[0] = 0;
        StringBuilder urutan = new StringBuilder();
        while (!antrian.isEmpty()) {
            int u = antrian.poll();
            urutan.append(u).append(' ');
            for (int v : adj.get(u)) {
                if (jarak[v] == -1) {
                    jarak[v] = jarak[u] + 1;
                    asal[v] = u;
                    antrian.offer(v);
                }
            }
            System.out.println("kunjungi " + u + ", antrian " + antrian);
        }
        System.out.println("urutan BFS: " + urutan.toString().trim());
        System.out.println("jarak: " + Arrays.toString(jarak));
        StringBuilder jalur = new StringBuilder();
        for (int v = 5; v != -1; v = asal[v]) {
            jalur.insert(0, v + (jalur.length() > 0 ? " -> " : ""));
        }
        System.out.println("jalur 0 ke 5: " + jalur);
        System.out.println("simpul 7 terjangkau? " + (jarak[7] != -1));
    }
}
