// final: isi array final boleh diubah, inisialisasi tertunda, konstanta waktu kompilasi untuk byte/char
import java.util.Arrays;

public class Main {
    static final int MAKS_SKS = 24;
    static final double PAJAK = 0.11;
    static final String NAMA_KAMPUS = "Universitas " + "Nusantara";
    static final int[] BOBOT = {4, 3, 2, 1, 0};

    public static void main(String[] args) {
        final int[] nilai = {70, 80};
        nilai[0] = 95;
        System.out.println("Isi array final boleh diubah: " + Arrays.toString(nilai));
        final String status;
        int sks = 21;
        if (sks > MAKS_SKS) {
            status = "melebihi batas";
        } else {
            status = "aman";
        }
        System.out.println("Status SKS: " + status);
        final int kuadrat;
        kuadrat = sks * sks;
        System.out.println("kuadrat = " + kuadrat);
        BOBOT[4] = -1;
        System.out.println("BOBOT: " + Arrays.toString(BOBOT));
        System.out.println(NAMA_KAMPUS + " (" + NAMA_KAMPUS.length() + " karakter)");
        System.out.println("Pajak dari 1.000.000 = " + 1_000_000 * PAJAK);
        final char NILAI_LULUS = 'C';
        char nilaiku = 'B';
        System.out.println("Lulus? " + (nilaiku <= NILAI_LULUS));
        for (final int x : nilai) {
            System.out.println("x final dalam for-each: " + x);
        }
        final byte KECIL = 10;
        byte hasil = KECIL + 5;
        System.out.println("byte hasil = KECIL + 5 -> " + hasil);
        final int BESAR = 100;
        byte b2 = BESAR;
        char c2 = BESAR;
        short s2 = BESAR * 300;
        System.out.println("b2 = " + b2 + ", c2 = " + c2 + ", s2 = " + s2);
        char huruf = 'a' + 2;
        byte negatif = -128;
        System.out.println("huruf = " + huruf + ", negatif = " + negatif);
        final long JUTA = 1_000_000L;
        System.out.println("JUTA * JUTA = " + JUTA * JUTA);
    }
}
