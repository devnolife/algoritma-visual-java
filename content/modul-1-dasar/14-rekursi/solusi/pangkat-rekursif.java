public class Main {
    public static void main(String[] args) {
        int angka = 4;
        int hasil = faktorial(angka);
        System.out.println(angka + "! = " + hasil);
        System.out.println("2^10 = " + pangkat(2, 10));
        System.out.println("3^4 = " + pangkat(3, 4));
    }

    static int faktorial(int n) {
        if (n == 0) return 1;   // #dasar
        return n * faktorial(n - 1);   // #rekursif
    }

    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    static int pangkat(int a, int n) {
        if (n == 0) return 1;
        return a * pangkat(a, n - 1);
    }
}
