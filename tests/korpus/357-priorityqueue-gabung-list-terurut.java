// Menggabungkan beberapa list terurut dengan PriorityQueue<int[]> berisi {nilai, indeks list, indeks elemen}
import java.util.Arrays;
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        int[][] daftar = {{1, 4, 9, 12}, {2, 3, 10}, {5, 6, 7, 8, 20}, {}};
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        for (int i = 0; i < daftar.length; i++) {
            if (daftar[i].length > 0) {
                pq.offer(new int[] {daftar[i][0], i, 0});
            }
        }
        int[] hasil = new int[12];
        int n = 0;
        while (!pq.isEmpty()) {
            int[] e = pq.poll();
            hasil[n++] = e[0];
            int i = e[1];
            int j = e[2] + 1;
            if (j < daftar[i].length) {
                pq.offer(new int[] {daftar[i][j], i, j});
            }
            System.out.println("ambil " + e[0] + " dari list " + i + ", antrian berisi " + pq.size());
        }
        System.out.println("hasil gabungan: " + Arrays.toString(hasil));
    }
}
