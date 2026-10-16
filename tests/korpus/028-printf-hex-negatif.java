// %x %X %o pada bilangan negatif int, long, byte, short
public class Main {
    public static void main(String[] args) {
        System.out.printf("%x%n", -1);
        System.out.printf("%X%n", -255);
        System.out.printf("%o%n", -8);
        System.out.printf("%x%n", -1L);
        System.out.printf("%X%n", Long.MIN_VALUE);
        byte b = -1;
        short s = -2;
        System.out.printf("byte -1   -> %x%n", b);
        System.out.printf("short -2  -> %x%n", s);
        System.out.printf("byte -128 -> %X%n", (byte) -128);
        System.out.printf("%08x%n", 3054);
        System.out.printf("%-8x|%n", 3054);
        System.out.printf("%x %x %x%n", 0, 16, Integer.MAX_VALUE);
        System.out.printf("Kode hex 'A': %x%n", (int) 'A');
        int warna = 0x00FF8800;
        System.out.printf("Warna: #%06X%n", warna);
        int merah = (warna >> 16) & 0xFF;
        int hijau = (warna >> 8) & 0xFF;
        int biru = warna & 0xFF;
        System.out.printf("R=%d G=%d B=%d%n", merah, hijau, biru);
        System.out.println(Integer.toHexString(-256) + " " + Integer.toOctalString(-1));
        for (int i = 0; i < 4; i++) {
            int nilai = i * 85;
            System.out.printf("%3d = 0x%02X = 0%o%n", nilai, nilai, nilai);
        }
    }
}
