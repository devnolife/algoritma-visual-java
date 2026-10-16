// Fisher-Yates dengan Random(99) pada array dan ArrayList (Collections.swap), jalan acak dengan nextBoolean, dan peluang dengan nextDouble
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random r = new Random(99);
        int[] kartu = new int[10];
        for (int i = 0; i < kartu.length; i++) {
            kartu[i] = i + 1;
        }
        for (int i = kartu.length - 1; i > 0; i--) {
            int j = r.nextInt(i + 1);
            int t = kartu[i];
            kartu[i] = kartu[j];
            kartu[j] = t;
        }
        System.out.println("kartu dikocok: " + Arrays.toString(kartu));
        ArrayList<String> peserta = new ArrayList<>();
        String[] nama = {"Ani", "Budi", "Cici", "Dodi", "Eka", "Fani"};
        for (String n : nama) {
            peserta.add(n);
        }
        for (int i = peserta.size() - 1; i > 0; i--) {
            Collections.swap(peserta, i, r.nextInt(i + 1));
        }
        System.out.println("urutan presentasi: " + peserta);
        int posisi = 0;
        StringBuilder jejak = new StringBuilder("0");
        for (int langkah = 0; langkah < 15; langkah++) {
            posisi += r.nextBoolean() ? 1 : -1;
            jejak.append(' ').append(posisi);
        }
        System.out.println("jalan acak: " + jejak);
        int hujan = 0;
        for (int hari = 0; hari < 30; hari++) {
            if (r.nextDouble() < 0.3) {
                hujan++;
            }
        }
        System.out.println("hari hujan dari 30 (peluang 0.3): " + hujan);
        System.out.println("nextLong terakhir: " + r.nextLong());
    }
}
