// Cast penyempitan int/long ke byte, short, char: nilai membungkus (wrap)
public class Main {
    public static void main(String[] args) {
        int[] nilai = {127, 128, 200, 255, 256, -129, 70000, -1, 65601};
        for (int n : nilai) {
            byte b = (byte) n;
            short s = (short) n;
            char c = (char) n;
            System.out.println(n + " -> byte " + b + ", short " + s + ", kode char " + (int) c);
        }
        long besar = 4_294_967_297L;
        System.out.println("(int) 4294967297L  = " + (int) besar);
        long negatif = -4_294_967_296L;
        System.out.println("(int) -4294967296L = " + (int) negatif);
        System.out.println("(int) Long.MAX     = " + (int) Long.MAX_VALUE);
        System.out.println("(byte) 0xFF        = " + (byte) 0xFF);
        System.out.println("(byte) 0x80        = " + (byte) 0x80);
        System.out.println("(short) 0x8000     = " + (short) 0x8000);
        byte x = (byte) 200;
        int kembali = x & 0xFF;
        System.out.println("Byte 200 sebagai unsigned = " + kembali);
        char huruf = (char) ('A' + 25);
        System.out.println("(char) ('A' + 25) = " + huruf);
        int i = (char) -1;
        System.out.println("int i = (char) -1 -> " + i);
        short pendek = (short) 40000;
        int lebar = pendek;
        System.out.println("short 40000 -> " + pendek + " -> int " + lebar);
        byte b1 = 10;
        byte b2 = (byte) (b1 * 30);
        System.out.println("(byte) (10 * 30) = " + b2);
        char dariByte = (char) (byte) -56;
        System.out.println("(char) (byte) -56 -> kode " + (int) dariByte);
    }
}
