// Operator geser << >> >>> pada int dan long negatif, jarak geser di atas 31/63
public class Main {
    public static void main(String[] args) {
        int a = -16;
        System.out.println("-16 >> 2    = " + (a >> 2));
        System.out.println("-16 >>> 2   = " + (a >>> 2));
        System.out.println("-16 >>> 28  = " + (a >>> 28));
        System.out.println("-16 << 2    = " + (a << 2));
        System.out.println("-1 >>> 1    = " + (-1 >>> 1));
        System.out.println("-1 >> 31    = " + (-1 >> 31));
        System.out.println("1 << 31     = " + (1 << 31));
        System.out.println("1 << 32     = " + (1 << 32));
        System.out.println("1 << 33     = " + (1 << 33));
        System.out.println("8 >> -1     = " + (8 >> -1));
        System.out.println("-5 >> 1     = " + (-5 >> 1));
        System.out.println("-5 / 2      = " + (-5 / 2));
        long b = -16L;
        System.out.println("-16L >>> 60 = " + (b >>> 60));
        System.out.println("-1L >>> 1   = " + (-1L >>> 1));
        System.out.println("1L << 63    = " + (1L << 63));
        System.out.println("1L << 64    = " + (1L << 64));
        System.out.println("1L << 65    = " + (1L << 65));
        System.out.println("1 << 2L     = " + (1 << 2L));
        byte c = -128;
        System.out.println("byte -128 >>> 4 = " + (c >>> 4));
        System.out.println("(byte)(c >>> 4) = " + (byte) (c >>> 4));
        char d = 'A';
        System.out.println("'A' << 1    = " + (d << 1));
        int geser = 35;
        System.out.println("1 << 35     = " + (1 << geser));
        System.out.println("Biner -16   = " + Integer.toBinaryString(a));
        System.out.println("Biner >>> 28= " + Integer.toBinaryString(a >>> 28));
        int kali = 13;
        System.out.println("13 << 3 = " + (kali << 3) + " sama dengan 13 * 8 = " + (kali * 8));
        System.out.println("100 >> 2 = " + (100 >> 2) + " sama dengan 100 / 4 = " + (100 / 4));
    }
}
