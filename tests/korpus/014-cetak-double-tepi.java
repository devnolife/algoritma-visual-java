// Pencetakan double: 0.1+0.2, 1e7, 1.0E-5, 1e21, -0.0, NaN, Infinity
public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        System.out.println(1.0 / 3);
        System.out.println(2.0 / 3);
        System.out.println(100.0);
        System.out.println(1e7);
        System.out.println(9999999.0);
        System.out.println(1e6);
        System.out.println(0.001);
        System.out.println(0.0001);
        System.out.println(1.0E-5);
        System.out.println(123456789.0);
        System.out.println(1e21);
        System.out.println(1e20);
        System.out.println(-0.0);
        System.out.println(0.0 == -0.0);
        System.out.println(0.0 / 0.0);
        System.out.println(1 / 0.0);
        System.out.println(-1 / 0.0);
        System.out.println(Double.MAX_VALUE);
        System.out.println(Double.MIN_VALUE);
        System.out.println(12345.6789e3);
        System.out.println(1.0);
        System.out.println(3.0 * 1.1);
        System.out.println(0.1 * 3);
        System.out.println(1.1 + 2.2);
        System.out.println(100.0 / 3.0);
        System.out.println(2e-3);
        System.out.println((double) Long.MAX_VALUE);
        System.out.println((double) Integer.MAX_VALUE);
        System.out.println(4.35 * 100);
        System.out.println(2.0 - 1.1);
        System.out.println(1e16);
        System.out.println(1.0e-300 * 1e-300);
        System.out.println(9007199254740993.0);
        double nan = Double.NaN;
        System.out.println("NaN == NaN : " + (nan == nan));
        System.out.println("NaN != NaN : " + (nan != nan));
        System.out.println("NaN < 1    : " + (nan < 1));
        System.out.println("isNaN      : " + Double.isNaN(nan));
        System.out.println("-0.0 + 0.0 : " + (-0.0 + 0.0));
        System.out.println("-0.0 * 5   : " + (-0.0 * 5));
        System.out.println("1 / -0.0   : " + (1 / -0.0));
        double nol = 0.0;
        System.out.println("-nol       : " + (-nol));
        System.out.println("0 - nol    : " + (0 - nol));
    }
}
