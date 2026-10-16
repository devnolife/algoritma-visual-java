// Inisialisasi field static: urutan tekstual, nilai default, dan efek samping sebelum main
public class Main {
    static int a = catat("a", 10);
    static int b = catat("b", a * 2);
    static int c = bacaD();
    static int d = 7;
    static final int KONSTAN = 100;
    static int e = bacaKonstan();
    static int hitungPanggilan;
    static int jumlahReset = 0;
    static String teks;
    static boolean aktif;
    static double rasio;
    static char huruf;
    static long besar = 1L << 40;
    static int[] data = {d, d + 1};
    static String salam = "Halo " + KONSTAN;

    static int catat(String nama, int nilai) {
        System.out.println("inisialisasi " + nama + " = " + nilai);
        hitungPanggilan++;
        jumlahReset++;
        return nilai;
    }

    static int bacaD() {
        return d;
    }

    static int bacaKonstan() {
        return KONSTAN;
    }

    public static void main(String[] args) {
        System.out.println("main dimulai");
        System.out.println("a = " + a + ", b = " + b);
        System.out.println("c (membaca d sebelum diinisialisasi) = " + c);
        System.out.println("d = " + d + ", e = " + e);
        System.out.println("hitungPanggilan (tanpa penginisialisasi) = " + hitungPanggilan);
        System.out.println("jumlahReset (diinisialisasi ulang = 0) = " + jumlahReset);
        System.out.println("default: teks = " + teks + ", aktif = " + aktif + ", rasio = " + rasio
                + ", kode huruf = " + (int) huruf);
        System.out.println("besar = " + besar + ", data = " + data[0] + "," + data[1]);
        System.out.println(salam);
        catat("x", 1);
        System.out.println("hitungPanggilan sekarang = " + hitungPanggilan);
    }
}
