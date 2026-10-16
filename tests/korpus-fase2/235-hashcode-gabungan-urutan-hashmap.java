// hashCode gabungan 31 * h + ... bisa overflow menjadi negatif; urutan iterasi HashMap mengikuti hash yang disebar (h ^ h >>> 16)
import java.util.HashMap;

public class Main {
    static class Mk {
        String kode;
        int kelas;

        Mk(String kode, int kelas) {
            this.kode = kode;
            this.kelas = kelas;
        }

        @Override
        public boolean equals(Object o) {
            if (o == null) {
                return false;
            }
            Mk m = (Mk) o;
            return kelas == m.kelas && kode.equals(m.kode);
        }

        @Override
        public int hashCode() {
            int h = 17;
            h = 31 * h + kode.hashCode();
            h = 31 * h + kelas;
            return h;
        }

        @Override
        public String toString() {
            return kode + "-" + kelas;
        }
    }

    public static void main(String[] args) {
        String[] kode = {"IF101", "IF202", "MA110", "FI120", "IF303", "BI100"};
        HashMap<Mk, Integer> peserta = new HashMap<>();
        int n = 25;
        for (String k : kode) {
            for (int kelas = 1; kelas <= 2; kelas++) {
                Mk m = new Mk(k, kelas);
                int h = m.hashCode();
                System.out.println(m + " hash " + h + " sebar " + (h ^ (h >>> 16)) + " indeks16 " + ((h ^ (h >>> 16)) & 15));
                peserta.put(m, n);
                n += 3;
            }
        }
        System.out.println(peserta);
        System.out.println("IF202-2 -> " + peserta.get(new Mk("IF202", 2)));
        System.out.println("BI100-3 -> " + peserta.get(new Mk("BI100", 3)));
        System.out.println("Ukuran " + peserta.size());
    }
}
