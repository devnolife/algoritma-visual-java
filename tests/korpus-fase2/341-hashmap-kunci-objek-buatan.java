// HashMap dengan kunci objek buatan (equals + hashCode di-override): pencarian dengan objek setara berhasil, tetapi mengubah field kunci setelah disimpan membuat entri "hilang"
import java.util.HashMap;

public class Main {
    static class Koordinat {
        int baris;
        int kolom;

        Koordinat(int baris, int kolom) {
            this.baris = baris;
            this.kolom = kolom;
        }

        @Override
        public boolean equals(Object o) {
            if (o == null) {
                return false;
            }
            Koordinat k = (Koordinat) o;
            return baris == k.baris && kolom == k.kolom;
        }

        @Override
        public int hashCode() {
            return baris * 100 + kolom;
        }

        @Override
        public String toString() {
            return "(" + baris + "," + kolom + ")";
        }
    }

    public static void main(String[] args) {
        HashMap<Koordinat, String> papan = new HashMap<>();
        papan.put(new Koordinat(0, 0), "benteng");
        papan.put(new Koordinat(0, 4), "raja");
        papan.put(new Koordinat(7, 4), "ratu");
        Koordinat kuda = new Koordinat(1, 2);
        papan.put(kuda, "kuda");
        System.out.println("papan " + papan);
        System.out.println("get(0,4) = " + papan.get(new Koordinat(0, 4)) + ", containsKey(5,5) = " + papan.containsKey(new Koordinat(5, 5)));
        papan.put(new Koordinat(7, 4), "ratu putih");
        System.out.println("put ulang (7,4): " + papan.get(new Koordinat(7, 4)) + ", size " + papan.size());
        kuda.baris = 3;
        System.out.println("setelah field kunci kuda diubah menjadi " + kuda + ":");
        System.out.println("  papan " + papan);
        System.out.println("  get(kuda) = " + papan.get(kuda) + ", get(1,2) = " + papan.get(new Koordinat(1, 2)) + ", containsValue(kuda) = " + papan.containsValue("kuda"));
        kuda.baris = 1;
        System.out.println("dikembalikan: get(kuda) = " + papan.get(kuda));
    }
}
