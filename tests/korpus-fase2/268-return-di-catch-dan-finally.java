// return di dalam catch: nilai return dihitung dulu, finally berjalan sesudahnya, lalu nilai yang sudah dihitung itulah yang dikembalikan
public class Main {
    static int hitungan = 0;

    static int catat(String label, int nilai) {
        hitungan++;
        System.out.println("  [" + hitungan + "] " + label + " = " + nilai);
        return nilai;
    }

    static int konversi(String s) {
        int hasil = -1;
        try {
            hasil = catat("parse", Integer.parseInt(s));
            return catat("return dari try", hasil * 2);
        } catch (NumberFormatException e) {
            return catat("return dari catch", hasil);
        } finally {
            hasil = 1000;
            catat("finally mengubah hasil", hasil);
        }
    }

    static String status(int kode) {
        String pesan = "awal";
        try {
            if (kode < 0) {
                throw new IllegalArgumentException("negatif");
            }
            pesan = "ok " + kode;
        } catch (IllegalArgumentException e) {
            pesan = "error " + e.getMessage();
            return pesan;
        } finally {
            pesan = pesan + " (finally)";
            System.out.println("  finally melihat pesan = " + pesan);
        }
        return pesan;
    }

    public static void main(String[] args) {
        System.out.println("konversi(\"21\") -> " + konversi("21"));
        System.out.println("konversi(\"dua\") -> " + konversi("dua"));
        System.out.println("status(5) -> " + status(5));
        System.out.println("status(-1) -> " + status(-1));
    }
}
