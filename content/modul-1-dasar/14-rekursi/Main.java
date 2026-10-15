public class Main {
    public static void main(String[] args) {
        int angka = 4;
        int hasil = faktorial(angka);
        System.out.println(angka + "! = " + hasil);
        // System.out.println("fib(5) = " + fib(5));
    }

    static int faktorial(int n) {
        if (n == 0) return 1;   // #dasar
        return n * faktorial(n - 1);   // #rekursif
    }

    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
}
