// Konstruktor salinan: salinan dangkal berbagi array nilai, salinan dalam membuat array baru, alias berbagi seluruh objek
import java.util.Arrays;

public class Main {
    static class Rapor {
        String nama;
        int[] nilai;

        Rapor(String nama, int[] nilai) {
            this.nama = nama;
            this.nilai = nilai;
        }

        Rapor(Rapor lain, boolean dalam) {
            this.nama = lain.nama;
            this.nilai = dalam ? Arrays.copyOf(lain.nilai, lain.nilai.length) : lain.nilai;
        }

        String teks() {
            return nama + " " + Arrays.toString(nilai);
        }
    }

    public static void main(String[] args) {
        Rapor asli = new Rapor("Dina", new int[] {80, 75, 90});
        Rapor dangkal = new Rapor(asli, false);
        Rapor dalam = new Rapor(asli, true);
        Rapor alias = asli;
        System.out.println("asli    : " + asli.teks());
        dangkal.nilai[0] = 100;
        dalam.nilai[1] = 0;
        dangkal.nama = "Dina (dangkal)";
        System.out.println("asli    : " + asli.teks());
        System.out.println("dangkal : " + dangkal.teks());
        System.out.println("dalam   : " + dalam.teks());
        alias.nama = "Dina (alias)";
        System.out.println("asli    : " + asli.teks());
        System.out.println("asli.nilai == dangkal.nilai: " + (asli.nilai == dangkal.nilai));
        System.out.println("asli.nilai == dalam.nilai: " + (asli.nilai == dalam.nilai));
        System.out.println("Arrays.equals(asli.nilai, dalam.nilai): " + Arrays.equals(asli.nilai, dalam.nilai));
    }
}
