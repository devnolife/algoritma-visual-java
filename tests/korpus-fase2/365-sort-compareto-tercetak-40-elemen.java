// compareTo mencetak pasangan saat Collections.sort mengurutkan 40 elemen: run menurun di awal dibalik, dua run (minRun 20) lalu digabung
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static int banding = 0;
    static StringBuilder log = new StringBuilder();

    static class Nilai implements Comparable<Nilai> {
        int v;

        Nilai(int v) {
            this.v = v;
        }

        @Override
        public int compareTo(Nilai o) {
            banding++;
            log.append(v).append(':').append(o.v).append(banding % 12 == 0 ? "\n" : " ");
            return Integer.compare(v, o.v);
        }

        @Override
        public String toString() {
            return "" + v;
        }
    }

    public static void main(String[] args) {
        ArrayList<Nilai> data = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            data.add(new Nilai(90 - i * 5));
        }
        for (int i = 0; i < 32; i++) {
            data.add(new Nilai((i * 17 + 3) % 41));
        }
        System.out.println("awal  " + data);
        Collections.sort(data);
        System.out.println(log.toString().trim());
        System.out.println("hasil " + data + ", " + banding + " perbandingan");
    }
}
