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
        int[] jarak = new int[n];
        int[] asal = new int[n];
        boolean[] selesai = new boolean[n];
        Arrays.fill(jarak, Integer.MAX_VALUE);   // #awal
        Arrays.fill(asal, -1);
        jarak[0] = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!selesai[i] && (u == -1 || jarak[i] < jarak[u])) {
                    u = i;
                }
            }
            selesai[u] = true;   // #pilih
            for (int v = 0; v < n; v++) {
                if (graf[u][v] != 0 && !selesai[v] && jarak[u] + graf[u][v] < jarak[v]) {   // #relaksasi
                    jarak[v] = jarak[u] + graf[u][v];
                    asal[v] = u;
                }
            }
        }
        System.out.println("Jarak dari 0: " + Arrays.toString(jarak));

        String rute = "4";
        int t = asal[4];
        while (t != -1) {
            rute = t + " -> " + rute;
            t = asal[t];
        }
        System.out.println("Rute ke 4: " + rute);
    }
}