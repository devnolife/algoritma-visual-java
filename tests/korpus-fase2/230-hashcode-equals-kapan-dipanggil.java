// Cetakan di dalam hashCode dan equals menunjukkan kapan HashMap memanggilnya: put, get, containsKey, remove, dan saat resize (tidak dipanggil)
import java.util.HashMap;

public class Main {
    static class Kode {
        String teks;

        Kode(String teks) {
            this.teks = teks;
        }

        @Override
        public int hashCode() {
            int h = teks.length();
            System.out.println("    hashCode(" + teks + ") = " + h);
            return h;
        }

        @Override
        public boolean equals(Object o) {
            Kode lain = (Kode) o;
            System.out.println("    equals(" + teks + ", " + lain.teks + ")");
            return teks.equals(lain.teks);
        }

        @Override
        public String toString() {
            return teks;
        }
    }

    public static void main(String[] args) {
        HashMap<Kode, Integer> peta = new HashMap<>();
        Kode ab = new Kode("ab");
        System.out.println("put ab");
        peta.put(ab, 1);
        System.out.println("put cd (panjang sama dengan ab)");
        peta.put(new Kode("cd"), 2);
        System.out.println("put objek ab yang sama");
        peta.put(ab, 3);
        System.out.println("put ab baru (objek berbeda, isi sama)");
        peta.put(new Kode("ab"), 4);
        System.out.println("get cd");
        System.out.println("  -> " + peta.get(new Kode("cd")));
        System.out.println("containsKey xyz");
        System.out.println("  -> " + peta.containsKey(new Kode("xyz")));
        System.out.println("put 11 kunci dengan panjang berbeda (memicu resize)");
        for (int i = 3; i <= 13; i++) {
            peta.put(new Kode("k".repeat(i)), i);
        }
        System.out.println("size " + peta.size());
        System.out.println("remove cd");
        System.out.println("  -> " + peta.remove(new Kode("cd")));
        System.out.println("getOrDefault zz");
        System.out.println("  -> " + peta.getOrDefault(new Kode("zz"), -1));
        System.out.println("putIfAbsent ab");
        System.out.println("  -> " + peta.putIfAbsent(new Kode("ab"), 99));
        System.out.println("isi: " + peta);
    }
}
