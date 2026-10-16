// equals dan hashCode di-override bersama: HashSet membuang duplikat, HashMap menemukan kunci dari objek baru yang setara
import java.util.HashMap;
import java.util.HashSet;

public class Main {
    static class Titik {
        final int x;
        final int y;

        Titik(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null) {
                return false;
            }
            Titik t = (Titik) o;
            return x == t.x && y == t.y;
        }

        @Override
        public int hashCode() {
            return 31 * x + y;
        }

        @Override
        public String toString() {
            return "(" + x + "," + y + ")";
        }
    }

    public static void main(String[] args) {
        HashSet<Titik> dikunjungi = new HashSet<>();
        int[][] langkah = {{0, 0}, {0, 1}, {1, 1}, {0, 1}, {2, 3}, {0, 0}, {1, 0}, {3, 2}};
        for (int[] l : langkah) {
            Titik t = new Titik(l[0], l[1]);
            boolean baru = dikunjungi.add(t);
            System.out.println("kunjungi " + t + " hash " + t.hashCode() + " -> " + (baru ? "baru" : "sudah pernah"));
        }
        System.out.println("himpunan: " + dikunjungi + " (" + dikunjungi.size() + " titik)");
        System.out.println("contains (2,3)? " + dikunjungi.contains(new Titik(2, 3)));
        System.out.println("contains (3,3)? " + dikunjungi.contains(new Titik(3, 3)));
        HashMap<Titik, String> label = new HashMap<>();
        label.put(new Titik(0, 0), "asal");
        label.put(new Titik(5, 5), "tujuan");
        label.put(new Titik(0, 31), "tabrakan hash dengan (1,0)");
        label.put(new Titik(1, 0), "kanan asal");
        System.out.println("label: " + label);
        System.out.println("get (5,5) = " + label.get(new Titik(5, 5)));
        System.out.println("get (1,0) = " + label.get(new Titik(1, 0)) + ", hash (0,31) = " + new Titik(0, 31).hashCode());
        label.put(new Titik(0, 0), "asal baru");
        System.out.println("setelah put ulang (0,0): " + label.get(new Titik(0, 0)) + ", size " + label.size());
        System.out.println("remove (5,5) -> " + label.remove(new Titik(5, 5)) + ", sisa " + label);
    }
}
