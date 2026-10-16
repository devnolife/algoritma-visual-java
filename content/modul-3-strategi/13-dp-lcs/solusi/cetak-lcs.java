public class Main {
    public static void main(String[] args) {
        String a = "IKAN";
        String b = "KAIN";
        int m = a.length();
        int n = b.length();
        int[][] dp = new int[m + 1][n + 1];   // #tabel
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;   // #cocok
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);   // #beda
                }
            }
        }
        System.out.println("Panjang LCS: " + dp[m][n]);

        String lcs = "";
        int i = m;
        int j = n;
        while (i > 0 && j > 0) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                lcs = a.charAt(i - 1) + lcs;
                i--;
                j--;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }
        System.out.println("LCS: " + lcs);
    }
}
