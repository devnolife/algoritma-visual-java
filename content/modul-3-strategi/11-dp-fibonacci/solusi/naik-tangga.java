public class Main {
    static int panggilan = 0;
    static long[] memo;
    static long[] memoCara;

    public static void main(String[] args) {
        int n = 6;
        boolean pakaiMemo = true;
        memo = new long[n + 1];
        long hasil = pakaiMemo ? fibMemo(n) : fib(n);
        System.out.println("fib(" + n + ") = " + hasil);
        System.out.println("Panggilan: " + panggilan);
        memoCara = new long[31];
        System.out.println("Cara naik 30 anak tangga: " + cara(30));
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

    static long cara(int n) {
        if (n < 0) return 0;
        if (n == 0) return 1;
        if (memoCara[n] != 0) return memoCara[n];
        memoCara[n] = cara(n - 1) + cara(n - 2) + cara(n - 3);
        return memoCara[n];
    }
}
