// Overflow tersembunyi: nilai tengah (a + b) / 2 vs a + (b - a) / 2, akumulasi int, dan wrap char
public class Main {
    public static void main(String[] args) {
        int a = 2_000_000_000;
        int b = 2_100_000_000;
        System.out.println("(a + b) / 2       = " + (a + b) / 2);
        System.out.println("a + (b - a) / 2   = " + (a + (b - a) / 2));
        System.out.println("(a + b) >>> 1     = " + ((a + b) >>> 1));
        System.out.println("((long) a + b) / 2 = " + ((long) a + b) / 2);
        int[] penjualan = {900_000_000, 800_000_000, 700_000_000};
        int totalInt = 0;
        long totalLong = 0;
        for (int p : penjualan) {
            totalInt += p;
            totalLong += p;
        }
        System.out.println("Total int  = " + totalInt);
        System.out.println("Total long = " + totalLong);
        System.out.println("MAX + MAX = " + (Integer.MAX_VALUE + Integer.MAX_VALUE));
        System.out.println("MIN + MIN = " + (Integer.MIN_VALUE + Integer.MIN_VALUE));
        System.out.println("MAX * MAX = " + Integer.MAX_VALUE * Integer.MAX_VALUE);
        char c = Character.MAX_VALUE;
        c++;
        System.out.println("char MAX + 1 = " + (int) c);
        byte b8 = 127;
        b8++;
        System.out.println("byte 127 + 1 = " + b8);
        short s16 = -32768;
        s16--;
        System.out.println("short -32768 - 1 = " + s16);
        int pangkat = 1;
        for (int i = 1; i <= 33; i++) {
            pangkat *= 2;
            if (i >= 30) {
                System.out.println("2^" + i + " (int) = " + pangkat);
            }
        }
        long hasilKali = 46341 * 46341;
        System.out.println("46341 * 46341 = " + hasilKali);
        System.out.println("Math.abs(MIN) < 0 ? " + (Math.abs(Integer.MIN_VALUE) < 0));
    }
}
