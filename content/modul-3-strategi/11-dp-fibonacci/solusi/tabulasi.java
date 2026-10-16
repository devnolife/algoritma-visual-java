public class Main {
    static int panggilan = 0;
    static long[] memo;

    public static void main(String[] args) {
        int n = 6;
        boolean pakaiMemo = true;
        memo = new long[n + 1];
        long hasil = pakaiMemo ? fibMemo(n) : fib(n);
        System.out.println("fib(" + n + ") = " + hasil);
        System.out.println("Panggilan: " + panggilan);
        System.out.println("fib(90) = " + fibTabel(90));
    }

    static long fib(int n) {
        panggilan++;
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);   // #ulang
    }

    static long fibMemo(int n) {
        panggilan++;
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];   // #cek
        memo[n] = fibMemo(n - 1) + fibMemo(n - 2);   // #simpan
        return memo[n];
    }

    static long fibTabel(int n) {
        long[] tabel = new long[n + 1];
        tabel[1] = 1;
        for (int i = 2; i <= n; i++) {
            tabel[i] = tabel[i - 1] + tabel[i - 2];
        }
        return tabel[n];
    }
}
