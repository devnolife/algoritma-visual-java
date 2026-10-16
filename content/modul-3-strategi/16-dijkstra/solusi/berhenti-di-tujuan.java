import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] graf = {
            {0, 6, 2, 0, 0},
            {6, 0, 3, 1, 0},
            {2, 3, 0, 7, 9},
            {0, 1, 7, 0, 2},
            {0, 0, 9, 2, 0}
        };
        int n = graf.length;
        int tujuan = 1;
        int[] jarak = new int[n];
        boolean[] selesai = new boolean[n];
        Arrays.fill(jarak, Integer.MAX_VALUE);   // #awal
        jarak[0] = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!selesai[i] && (u == -1 || jarak[i] < jarak[u])) {
                    u = i;
                }
            }
            selesai[u] = true;   // #pilih
            if (u == tujuan) break;
            for (int v = 0; v < n; v++) {
                if (graf[u][v] != 0 && !selesai[v] && jarak[u] + graf[u][v] < jarak[v]) {   // #relaksasi
                    jarak[v] = jarak[u] + graf[u][v];
                }
            }
        }
        System.out.println("Jarak terpendek ke 1: " + jarak[tujuan]);
    }
}