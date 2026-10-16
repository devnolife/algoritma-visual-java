// Salinan defensif: konstruktor dan getter menyalin array sehingga perubahan dari luar tidak merusak isi objek
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] skor = {70, 85, 90};
        Rapor bocor = new Rapor("bocor", skor, false);
        Rapor aman = new Rapor("aman", skor, true);
        skor[0] = 0;
        System.out.println("setelah array asal diubah:");
        System.out.println("  " + bocor.teks());
        System.out.println("  " + aman.teks());
        int[] dariGetterBocor = bocor.getSkor();
        int[] dariGetterAman = aman.getSkor();
        dariGetterBocor[1] = -1;
        dariGetterAman[1] = -1;
        System.out.println("setelah array hasil getter diubah:");
        System.out.println("  " + bocor.teks());
        System.out.println("  " + aman.teks());
        System.out.println("rata-rata bocor " + bocor.rataRata() + ", aman " + aman.rataRata());
        System.out.println("getter aman mengembalikan array baru tiap kali: " + (aman.getSkor() != aman.getSkor()));
    }
}

class Rapor {
    private final String nama;
    private final int[] skor;
    private final boolean salin;

    Rapor(String nama, int[] skor, boolean salin) {
        this.nama = nama;
        this.salin = salin;
        this.skor = salin ? Arrays.copyOf(skor, skor.length) : skor;
    }

    int[] getSkor() {
        return salin ? Arrays.copyOf(skor, skor.length) : skor;
    }

    double rataRata() {
        int total = 0;
        for (int s : skor) {
            total += s;
        }
        return (double) total / skor.length;
    }

    String teks() {
        return nama + " " + Arrays.toString(skor);
    }
}
