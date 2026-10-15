public class Main {
    public static void main(String[] args) {
        int angka = 4;
        int hasil = faktorial(angka);
        System.out.println(angka + "! = " + hasil);
        int totalDigit = jumlahDigit(2024);
        System.out.println("Jumlah digit 2024 = " + totalDigit);
    }

    static int faktorial(int n) {
        if (n == 0) return 1;   // #dasar
        return n * faktorial(n - 1);   // #rekursif
    }

    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    static int jumlahDigit(int n) {
        if (n < 10) return n;
        return n % 10 + jumlahDigit(n / 10);
    }
}
