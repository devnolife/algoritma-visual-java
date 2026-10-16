// BFS pada labirin grid dengan ArrayDeque<int[]>: jarak terpendek dari S ke E, lalu peta jarak setiap sel yang sudah dikunjungi dicetak
import java.util.ArrayDeque;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String[] peta = {"S.#.....", ".##.###.", "....#...", "#.#.#.#.", "..#...#E"};
        int baris = peta.length;
        int kolom = peta[0].length();
        int[][] jarak = new int[baris][kolom];
        for (int[] r : jarak) {
            Arrays.fill(r, -1);
        }
        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        ArrayDeque<int[]> q = new ArrayDeque<>();
        q.offer(new int[] {0, 0});
        jarak[0][0] = 0;
        int dikunjungi = 0;
        while (!q.isEmpty()) {
            int[] p = q.poll();
            dikunjungi++;
            if (peta[p[0]].charAt(p[1]) == 'E') {
                System.out.println("E ditemukan di (" + p[0] + "," + p[1] + ") dengan jarak " + jarak[p[0]][p[1]] + " setelah " + dikunjungi + " sel");
                break;
            }
            for (int k = 0; k < 4; k++) {
                int r = p[0] + dr[k];
                int c = p[1] + dc[k];
                if (r >= 0 && r < baris && c >= 0 && c < kolom && peta[r].charAt(c) != '#' && jarak[r][c] == -1) {
                    jarak[r][c] = jarak[p[0]][p[1]] + 1;
                    q.offer(new int[] {r, c});
                }
            }
        }
        for (int r = 0; r < baris; r++) {
            StringBuilder sb = new StringBuilder();
            for (int c = 0; c < kolom; c++) {
                if (peta[r].charAt(c) == '#') {
                    sb.append("  #");
                } else if (jarak[r][c] == -1) {
                    sb.append("  .");
                } else {
                    sb.append(String.format("%3d", jarak[r][c]));
                }
            }
            System.out.println(sb);
        }
        System.out.println("sisa antrian " + q.size());
    }
}
