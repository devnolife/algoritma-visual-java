public class Main {
    public static void main(String[] args) {
        String[] nama = {"Senter", "Tenda", "Kompor", "Makanan"};
        int[] berat = {1, 3, 3, 4};
        int[] nilai = {1, 5, 6, 9};
        int kapasitas = 6;
        int n = nama.length;
        int[][] dp = new int[n + 1][kapasitas + 1];   // #tabel
        for (int i = 1; i <= n; i++) {
            int b = berat[i - 1];   // berat barang ke-i
            int v = nilai[i - 1];   // nilai barang ke-i
            for (int w = 0; w <= kapasitas; w++) {
                if (b > w) {
                    dp[i][w] = dp[i - 1][w];   // #tidakMuat
                } else {
                    dp[i][w] = Math.max(   // #pilih
                        dp[i - 1][w],   // tidak ambil
                        dp[i - 1][w - b] + v);   // ambil
                }
            }
        }
        System.out.println("Nilai maksimum: " + dp[n][kapasitas]);
    }
}
