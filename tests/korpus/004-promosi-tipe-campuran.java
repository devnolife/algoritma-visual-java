// Promosi numerik campuran int, long, float, double, char, byte, short
public class Main {
    public static void main(String[] args) {
        int a = 7;
        int b = 2;
        System.out.println("7 / 2         = " + (a / b));
        System.out.println("7 / 2.0       = " + (a / 2.0));
        System.out.println("(double) 7/2  = " + ((double) a / b));
        System.out.println("(double)(7/2) = " + (double) (a / b));
        System.out.println("1 / 2 * 2.0   = " + (1 / 2 * 2.0));
        System.out.println("2.0 * 1 / 2   = " + (2.0 * 1 / 2));
        long panjang = 10L;
        float f = 2.5f;
        System.out.println("long * float  = " + (panjang * f));
        System.out.println("int + float   = " + (a + f));
        System.out.println("float + double= " + (f + 0.1));
        char huruf = 'A';
        System.out.println("'A' * 2       = " + (huruf * 2));
        System.out.println("'A' + 0.5     = " + (huruf + 0.5));
        byte x = 100;
        byte y = 100;
        int jumlah = x + y;
        System.out.println("byte + byte   = " + jumlah);
        short s = 30000;
        System.out.println("short * 2     = " + (s * 2));
        double d = 10;
        System.out.println("double d = 10 -> " + d);
        float g = 7;
        System.out.println("float g = 7   -> " + g);
        long l = 'z';
        System.out.println("long l = 'z'  -> " + l);
        double rata = (a + b) / 2;
        System.out.println("Rata salah    = " + rata);
        double rataBenar = (a + b) / 2.0;
        System.out.println("Rata benar    = " + rataBenar);
        System.out.println("0.1f + 0.2f   = " + (0.1f + 0.2f));
        System.out.println("10 / 3 * 3    = " + (10 / 3 * 3));
        System.out.println("10 * 3 / 3    = " + (10 * 3 / 3));
        System.out.println("1e2 + 1       = " + (1e2 + 1));
        System.out.println("5 + 2L        = " + (5 + 2L));
        System.out.println("100L / 3.0f   = " + (100L / 3.0f));
    }
}
