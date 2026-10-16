// Hasil Math.sqrt, Math.pow, cbrt, hypot, exp, log, log10
public class Main {
    public static void main(String[] args) {
        System.out.println("sqrt(2)        = " + Math.sqrt(2));
        System.out.println("sqrt(16)       = " + Math.sqrt(16));
        System.out.println("sqrt(-1)       = " + Math.sqrt(-1));
        System.out.println("sqrt(0.25)     = " + Math.sqrt(0.25));
        System.out.println("sqrt(-0.0)     = " + Math.sqrt(-0.0));
        System.out.println("pow(2, 10)     = " + Math.pow(2, 10));
        System.out.println("pow(2, 0.5)    = " + Math.pow(2, 0.5));
        System.out.println("pow(10, -2)    = " + Math.pow(10, -2));
        System.out.println("pow(0, 0)      = " + Math.pow(0, 0));
        System.out.println("pow(-8, 1.0/3) = " + Math.pow(-8, 1.0 / 3));
        System.out.println("pow(-2, 3)     = " + Math.pow(-2, 3));
        System.out.println("pow(2, 64)     = " + Math.pow(2, 64));
        System.out.println("pow(1.1, 2)    = " + Math.pow(1.1, 2));
        System.out.println("pow(0, -1)     = " + Math.pow(0, -1));
        System.out.println("(int) pow(10, 9)  = " + (int) Math.pow(10, 9));
        System.out.println("(long) pow(3, 30) = " + (long) Math.pow(3, 30));
        System.out.println("cbrt(27)       = " + Math.cbrt(27));
        System.out.println("cbrt(-64)      = " + Math.cbrt(-64));
        System.out.println("cbrt(2)        = " + Math.cbrt(2));
        System.out.println("hypot(3, 4)    = " + Math.hypot(3, 4));
        System.out.println("hypot(1, 1)    = " + Math.hypot(1, 1));
        System.out.println("exp(1)         = " + Math.exp(1));
        System.out.println("exp(0)         = " + Math.exp(0));
        System.out.println("log(E)         = " + Math.log(Math.E));
        System.out.println("log(10)        = " + Math.log(10));
        System.out.println("log(0)         = " + Math.log(0));
        System.out.println("log(-1)        = " + Math.log(-1));
        System.out.println("log10(1000)    = " + Math.log10(1000));
        System.out.println("log10(2)       = " + Math.log10(2));
        double sisiMiring = Math.sqrt(Math.pow(5, 2) + Math.pow(12, 2));
        System.out.println("Sisi miring 5-12 = " + sisiMiring);
        double modal = 1_000_000;
        double bunga = 0.05;
        double akhir = modal * Math.pow(1 + bunga, 3);
        System.out.println("Modal setelah 3 tahun = " + akhir);
        int digit = (int) Math.log10(98765) + 1;
        System.out.println("Banyak digit 98765 = " + digit);
    }
}
