// Metode statis Integer: parseInt, valueOf, toBinaryString, toHexString, bitCount, reverse
public class Main {
    public static void main(String[] args) {
        int a = Integer.parseInt("-42");
        int b = Integer.parseInt("+7");
        int c = Integer.parseInt("0012");
        int d = Integer.valueOf("123");
        System.out.println("parseInt: " + a + " " + b + " " + c + " " + d);
        System.out.println("MAX_VALUE = " + Integer.MAX_VALUE + ", MIN_VALUE = " + Integer.MIN_VALUE);
        int[] uji = {10, 255, -1, 0, 1024};
        for (int x : uji) {
            System.out.println(x + ": bin=" + Integer.toBinaryString(x)
                    + " hex=" + Integer.toHexString(x)
                    + " okt=" + Integer.toOctalString(x)
                    + " bitCount=" + Integer.bitCount(x)
                    + " signum=" + Integer.signum(x));
        }
        System.out.println("reverse(1)        = " + Integer.reverse(1));
        System.out.println("reverse(0x0F)     = " + Integer.reverse(0x0F));
        System.out.println("compare(3, 9)     = " + Integer.compare(3, 9));
        System.out.println("compare(9, 3)     = " + Integer.compare(9, 3));
        System.out.println("compare(MIN, MAX) = " + Integer.compare(Integer.MIN_VALUE, Integer.MAX_VALUE));
        System.out.println("sum(40, 2)        = " + Integer.sum(40, 2));
        System.out.println("toString(-99)     = " + Integer.toString(-99));
        String teks = Integer.toString(2024) + 1;
        System.out.println("toString(2024) + 1 = " + teks);
        int dariTeks = Integer.parseInt("2024") + 1;
        System.out.println("parseInt(\"2024\") + 1 = " + dariTeks);
        System.out.println("Panjang biner MAX = " + Integer.toBinaryString(Integer.MAX_VALUE).length());
        System.out.println("Biner MIN = " + Integer.toBinaryString(Integer.MIN_VALUE));
        System.out.println("parseInt(\"-2147483648\") = " + Integer.parseInt("-2147483648"));
        System.out.println("valueOf(\"-0\") = " + Integer.valueOf("-0"));
    }
}
