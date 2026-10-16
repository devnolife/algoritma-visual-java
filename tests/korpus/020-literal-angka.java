// Literal angka: hex, biner, oktal, garis bawah, sufiks L/f/d, eksponen, escape
public class Main {
    public static void main(String[] args) {
        int hex = 0xFF;
        int hexBesar = 0x7FFFFFFF;
        int hexNegatif = 0xFFFFFFFF;
        int biner = 0b1010_1010;
        int oktal = 017;
        int sejuta = 1_000_000;
        long panjang = 0xFFFFFFFFL;
        long miliar = 3_000_000_000L;
        float f = 2f;
        double d = 3d;
        double setengah = .5;
        double lima = 5.;
        double eksponen = 1.5e-3;
        double besar = 6.02e23;
        float fe = 1e3f;
        System.out.println("0xFF        = " + hex);
        System.out.println("0x7FFFFFFF  = " + hexBesar);
        System.out.println("0xFFFFFFFF  = " + hexNegatif);
        System.out.println("0b1010_1010 = " + biner);
        System.out.println("017         = " + oktal);
        System.out.println("1_000_000   = " + sejuta);
        System.out.println("0xFFFFFFFFL = " + panjang);
        System.out.println("3_000_000_000L = " + miliar);
        System.out.println("2f = " + f + ", 3d = " + d + ", .5 = " + setengah + ", 5. = " + lima);
        System.out.println("1.5e-3 = " + eksponen + ", 6.02e23 = " + besar + ", 1e3f = " + fe);
        System.out.println("0x10 + 010 + 10 = " + (0x10 + 010 + 10));
        System.out.println("0b11 * 0B11 = " + (0b11 * 0B11));
        System.out.println("0XAbC = " + 0XAbC);
        System.out.println("Escape: tab[\t] kutip[\"] garis[\\] petik['] [\']");
        System.out.println("Unicode: \u0048\u0061\u006C\u006F");
        char tab = '\t';
        System.out.println("Kode tab = " + (int) tab + ", kode newline = " + (int) '\n');
        System.out.println("Baris1\nBaris2");
        System.out.println('\\');
        System.out.println('\'');
        System.out.println("\"Kutipan\"");
        System.out.println(-2147483648);
        System.out.println(-9223372036854775808L);
        System.out.println(0x8000_0000);
        System.out.println(1e0 + " " + 1E1 + " " + 1e-1);
        System.out.println(0.0f + " " + 0d + " " + 00 + " " + 0L);
        System.out.println(1_0.5_0 + " " + 0x1_F + " " + 0b1_1L);
    }
}
