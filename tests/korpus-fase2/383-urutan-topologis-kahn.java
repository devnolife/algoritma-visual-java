// Urutan topologis mata kuliah prasyarat dengan algoritma Kahn: derajat masuk, antrian ArrayDeque, dan deteksi siklus
import java.util.ArrayDeque;
import java.util.ArrayList;

public class Main {
    static String urutkan(String[] matkul, int[][] prasyarat) {
        int n = matkul.length;
        ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        int[] masuk = new int[n];
        for (int[] p : prasyarat) {
            adj.get(p[0]).add(p[1]);
            masuk[p[1]]++;
        }
        ArrayDeque<Integer> siap = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (masuk[i] == 0) {
                siap.offer(i);
            }
        }
        StringBuilder hasil = new StringBuilder();
        int diambil = 0;
        while (!siap.isEmpty()) {
            int u = siap.poll();
            diambil++;
            hasil.append(matkul[u]).append(diambil < n ? ", " : "");
            for (int v : adj.get(u)) {
                masuk[v]--;
                if (masuk[v] == 0) {
                    siap.offer(v);
                }
            }
            System.out.println("  ambil " + matkul[u] + ", siap: " + siap);
        }
        return diambil == n ? hasil.toString() : "ada siklus! hanya " + diambil + " dari " + n + " bisa diambil";
    }

    public static void main(String[] args) {
        String[] matkul = {"Dasar Pemrograman", "Struktur Data", "Matematika Diskrit", "Algoritma", "Basis Data", "Kecerdasan Buatan"};
        int[][] prasyarat = {{0, 1}, {2, 3}, {1, 3}, {1, 4}, {3, 5}, {4, 5}};
        System.out.println("urutan: " + urutkan(matkul, prasyarat));
        int[][] siklus = {{0, 1}, {1, 2}, {2, 0}, {3, 4}};
        System.out.println("urutan: " + urutkan(new String[] {"A", "B", "C", "D", "E"}, siklus));
    }
}
