import java.util.Arrays;

public class Main {
    static int n = 4;
    static int[][] papan = new int[n][n];
    static int mundur = 0;

    public static void main(String[] args) {
        if (letakkan(0)) {
            for (int i = 0; i < n; i++) {
                System.out.println(Arrays.toString(papan[i]));
            }
        }
        System.out.println("Ratu dicabut kembali: " + mundur + " kali");
    }

    static boolean letakkan(int baris) {
        if (baris == n) return true;   // #selesai
        for (int kol = 0; kol < n; kol++) {
            if (aman(baris, kol)) {
                papan[baris][kol] = 1;   // #coba
                if (letakkan(baris + 1)) return true;
                papan[baris][kol] = 0;   // #mundur
                mundur++;
            }
        }
        return false;
    }

    static boolean aman(int baris, int kol) {
        for (int i = 0; i < baris; i++) {
            int d = baris - i;
            if (papan[i][kol] == 1) return false;
            if (kol - d >= 0 && papan[i][kol - d] == 1) return false;
            if (kol + d < n && papan[i][kol + d] == 1) return false;
        }
        return true;
    }
}
