public class Main {
    public static void main(String[] args) {
        String a = "IKAN";
        String b = "KAIN";
        int m = a.length();
        int n = b.length();
        int[][] dp = new int[m + 1][n + 1];   // #tabel
        int terpanjang = 0;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;   // #cocok
                    terpanjang = Math.max(terpanjang, dp[i][j]);
                } else {
                    dp[i][j] = 0;   // #beda
                }
            }
        }
        System.out.println("Substring bersama terpanjang: " + terpanjang);
    }
}
