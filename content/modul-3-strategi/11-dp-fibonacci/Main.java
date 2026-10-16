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
}
