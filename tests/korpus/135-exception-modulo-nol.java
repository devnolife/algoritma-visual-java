// ArithmeticException: sisa bagi (%) int dengan nol, sedangkan double % 0 menghasilkan NaN
public class Main {
    static boolean habisDibagi(int a, int b) {
        return a % b == 0;
    }

    public static void main(String[] args) {
        int n = 17;
        System.out.println("17.0 % 0 = " + (17.0 % 0));
        System.out.println("17 habis dibagi 17? " + habisDibagi(n, 17));
        for (int m = 4; m >= 0; m--) {
            System.out.println(n + " % " + m + " = " + (n % m));
        }
        System.out.println("tidak tercetak");
    }
}
