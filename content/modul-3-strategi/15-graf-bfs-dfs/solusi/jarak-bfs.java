import java.util.Arrays;

public class Main {
    static int[][] graf = {
        {0, 1, 1, 0, 0, 0},
        {1, 0, 0, 1, 1, 0},
        {1, 0, 0, 0, 0, 1},
        {0, 1, 0, 0, 0, 0},
        {0, 1, 0, 0, 0, 1},
        {0, 0, 1, 0, 1, 0}
    };
    static boolean[] dikunjungi = new boolean[graf.length];

    public static void main(String[] args) {
        System.out.print("BFS:");
        int[] jarak = bfs(0);
        System.out.println();
        System.out.println("Jarak: " + Arrays.toString(jarak));
        dikunjungi = new boolean[graf.length];
        System.out.print("DFS:");
        dfs(0);
        System.out.println();
    }

    static int[] bfs(int awal) {
        int[] antrean = new int[graf.length];
        int[] jarak = new int[graf.length];
        int depan = 0;
        int belakang = 0;
        antrean[belakang++] = awal;
        dikunjungi[awal] = true;
        while (depan < belakang) {
            int u = antrean[depan++];   // #ambil
            System.out.print(" " + u);
            for (int v = 0; v < graf.length; v++) {
                if (graf[u][v] == 1 && !dikunjungi[v]) {
                    dikunjungi[v] = true;   // #tandai
                    jarak[v] = jarak[u] + 1;
                    antrean[belakang++] = v;
                }
            }
        }
        return jarak;
    }

    static void dfs(int u) {
        dikunjungi[u] = true;
        System.out.print(" " + u);
        for (int v = 0; v < graf.length; v++) {
            if (graf[u][v] == 1 && !dikunjungi[v]) {
                dfs(v);   // #dalam
            }
        }
    }
}