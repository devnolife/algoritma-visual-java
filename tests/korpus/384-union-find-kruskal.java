// Union-find dengan kompresi jalur untuk algoritma Kruskal: sisi diurutkan dengan Arrays.sort(int[][], lambda), sisi pembentuk siklus ditolak
import java.util.Arrays;

public class Main {
    static int[] induk;
    static int[] peringkat;

    static int cari(int x) {
        if (induk[x] != x) {
            induk[x] = cari(induk[x]);
        }
        return induk[x];
    }

    static boolean gabung(int a, int b) {
        int ra = cari(a);
        int rb = cari(b);
        if (ra == rb) {
            return false;
        }
        if (peringkat[ra] < peringkat[rb]) {
            induk[ra] = rb;
        } else if (peringkat[ra] > peringkat[rb]) {
            induk[rb] = ra;
        } else {
            induk[rb] = ra;
            peringkat[ra]++;
        }
        return true;
    }

    public static void main(String[] args) {
        int n = 7;
        induk = new int[n];
        peringkat = new int[n];
        for (int i = 0; i < n; i++) {
            induk[i] = i;
        }
        int[][] sisi = {{0, 1, 7}, {0, 3, 5}, {1, 2, 8}, {1, 3, 9}, {1, 4, 7}, {2, 4, 5}, {3, 4, 15}, {3, 5, 6}, {4, 5, 8}, {4, 6, 9}, {5, 6, 11}};
        Arrays.sort(sisi, (a, b) -> a[2] - b[2]);
        int total = 0;
        int dipakai = 0;
        for (int[] s : sisi) {
            if (gabung(s[0], s[1])) {
                total += s[2];
                dipakai++;
                System.out.println("pakai " + s[0] + "-" + s[1] + " (" + s[2] + "), induk " + Arrays.toString(induk));
            } else {
                System.out.println("tolak " + s[0] + "-" + s[1] + " (" + s[2] + ") karena membentuk siklus");
            }
        }
        System.out.println("MST: " + dipakai + " sisi, bobot total " + total);
        System.out.println("akar tiap simpul: " + cari(0) + " " + cari(3) + " " + cari(6));
    }
}
