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
        bfs(0);
        System.out.println();
        dikunjungi = new boolean[graf.length];
        System.out.print("DFS:");
        dfs(0);
        System.out.println();
    }

    static void bfs(int awal) {
        int[] antrean = new int[graf.length];
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
                    antrean[belakang++] = v;
                }
            }
        }
    }

    // DFS dengan tumpukan buatan sendiri: yang terakhir masuk, diambil pertama.
    static void dfs(int awal) {
        int[] tumpukan = new int[graf.length * graf.length];
        int atas = 0;
        tumpukan[atas++] = awal;
        while (atas > 0) {
            int u = tumpukan[--atas];
            if (dikunjungi[u]) continue;
            dikunjungi[u] = true;
            System.out.print(" " + u);
            for (int v = graf.length - 1; v >= 0; v--) {
                if (graf[u][v] == 1 && !dikunjungi[v]) {
                    tumpukan[atas++] = v;
                }
            }
        }
    }
}