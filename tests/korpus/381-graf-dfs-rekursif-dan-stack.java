// DFS rekursif dan DFS iteratif dengan ArrayDeque sebagai stack menghasilkan urutan berbeda; lalu menghitung komponen terhubung
import java.util.ArrayDeque;
import java.util.ArrayList;

public class Main {
    static ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
    static boolean[] dikunjungi;
    static StringBuilder jejak = new StringBuilder();

    static void dfs(int u, int kedalaman) {
        dikunjungi[u] = true;
        jejak.append(u).append(' ');
        System.out.println("  ".repeat(kedalaman) + "masuk " + u);
        for (int v : adj.get(u)) {
            if (!dikunjungi[v]) {
                dfs(v, kedalaman + 1);
            }
        }
    }

    public static void main(String[] args) {
        int n = 9;
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        int[][] sisi = {{0, 1}, {0, 4}, {1, 2}, {1, 3}, {4, 3}, {5, 6}, {6, 7}, {5, 7}};
        for (int[] s : sisi) {
            adj.get(s[0]).add(s[1]);
            adj.get(s[1]).add(s[0]);
        }
        dikunjungi = new boolean[n];
        dfs(0, 0);
        System.out.println("DFS rekursif dari 0: " + jejak.toString().trim());
        boolean[] lihat = new boolean[n];
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        stack.push(0);
        StringBuilder iteratif = new StringBuilder();
        while (!stack.isEmpty()) {
            int u = stack.pop();
            if (lihat[u]) {
                continue;
            }
            lihat[u] = true;
            iteratif.append(u).append(' ');
            for (int v : adj.get(u)) {
                if (!lihat[v]) {
                    stack.push(v);
                }
            }
        }
        System.out.println("DFS iteratif dari 0: " + iteratif.toString().trim());
        dikunjungi = new boolean[n];
        int komponen = 0;
        for (int i = 0; i < n; i++) {
            if (!dikunjungi[i]) {
                komponen++;
                jejak = new StringBuilder();
                System.out.println("komponen " + komponen + ":");
                dfs(i, 1);
                System.out.println("  anggota " + jejak.toString().trim());
            }
        }
        System.out.println("jumlah komponen " + komponen);
    }
}
