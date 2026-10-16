public class Main {
    static int n = 5;
    static int[][] papan = new int[n][n];

    public static void main(String[] args) {
        int jumlahSolusi = hitung(0);
        System.out.println("Jumlah solusi: " + jumlahSolusi);
    }

    static int hitung(int baris) {
        if (baris == n) return 1;   // #selesai
        int jumlah = 0;
        for (int kol = 0; kol < n; kol++) {
            if (aman(baris, kol)) {
                papan[baris][kol] = 1;   // #coba
                jumlah += hitung(baris + 1);
                papan[baris][kol] = 0;   // #mundur
            }
        }
        return jumlah;
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
