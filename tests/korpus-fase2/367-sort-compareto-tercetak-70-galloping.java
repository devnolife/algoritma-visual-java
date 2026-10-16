// compareTo mencetak pasangan saat Collections.sort mengurutkan 70 elemen berpola blok: penggabungan run memicu mode galloping TimSort
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static int banding = 0;
    static StringBuilder log = new StringBuilder();

    static class Angka implements Comparable<Angka> {
        int v;

        Angka(int v) {
            this.v = v;
        }

        @Override
        public int compareTo(Angka o) {
            banding++;
            log.append(v).append(':').append(o.v).append(banding % 15 == 0 ? "\n" : " ");
            return v - o.v;
        }
    }

    public static void main(String[] args) {
        ArrayList<Angka> data = new ArrayList<>();
        StringBuilder awal = new StringBuilder();
        for (int i = 0; i < 70; i++) {
            int blok = i / 18;
            int p = i % 18;
            int v = (p % 2 == 0 ? 0 : 40) + blok * 9 + p / 2;
            data.add(new Angka(v));
            awal.append(v).append(' ');
        }
        System.out.println("awal  " + awal.toString().trim());
        Collections.sort(data);
        System.out.println(log.toString().trim());
        StringBuilder hasil = new StringBuilder();
        for (Angka a : data) {
            hasil.append(a.v).append(' ');
        }
        System.out.println("hasil " + hasil.toString().trim());
        System.out.println(banding + " perbandingan");
    }
}
