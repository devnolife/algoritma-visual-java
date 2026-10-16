// Aritmetika long: MAX_VALUE, overflow, 1L << 40, literal L, parseLong
public class Main {
    public static void main(String[] args) {
        long maks = Long.MAX_VALUE;
        long min = Long.MIN_VALUE;
        System.out.println("Long.MAX_VALUE     = " + maks);
        System.out.println("Long.MIN_VALUE     = " + min);
        System.out.println("MAX + 1            = " + (maks + 1));
        System.out.println("MIN - 1            = " + (min - 1));
        System.out.println("MIN / -1           = " + (min / -1));
        System.out.println("Math.abs(MIN)      = " + Math.abs(min));
        long jarak = 9_000_000_000L;
        System.out.println("Jarak * 2          = " + jarak * 2);
        System.out.println("Jarak / 7          = " + jarak / 7);
        System.out.println("Jarak % 7          = " + jarak % 7);
        System.out.println("1L << 40           = " + (1L << 40));
        System.out.println("1 << 40 (int)      = " + (1 << 40));
        long kuadrat = 3037000499L * 3037000499L;
        System.out.println("3037000499^2       = " + kuadrat);
        long lewat = 3037000500L * 3037000500L;
        System.out.println("3037000500^2       = " + lewat);
        long campur = Integer.MAX_VALUE + 1L;
        System.out.println("MAX int + 1L       = " + campur);
        long hasil = 1000000 * 1000000;
        System.out.println("1000000 * 1000000  = " + hasil);
        long benar = 1000000L * 1000000;
        System.out.println("1000000L * 1000000 = " + benar);
        System.out.println("Long.compare(5, 9) = " + Long.compare(5L, 9L));
        System.out.println("Long.parseLong     = " + Long.parseLong("-9223372036854775808"));
        System.out.println("Long.toString      = " + Long.toString(123456789012L));
        long a = 7, b = -2;
        System.out.println("7L / -2L = " + a / b + ", 7L % -2L = " + a % b);
    }
}
