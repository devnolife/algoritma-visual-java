// Cache LRU buatan sendiri: HashMap<Integer, Simpul> untuk akses cepat dan linked list ganda untuk urutan pemakaian; entri terlama diusir saat penuh
import java.util.HashMap;

public class Main {
    static class Simpul {
        int kunci;
        String nilai;
        Simpul prev;
        Simpul next;

        Simpul(int kunci, String nilai) {
            this.kunci = kunci;
            this.nilai = nilai;
        }
    }

    static class CacheLRU {
        final int kapasitas;
        final HashMap<Integer, Simpul> peta = new HashMap<>();
        final Simpul kepala = new Simpul(-1, "kepala");
        final Simpul ekor = new Simpul(-1, "ekor");

        CacheLRU(int kapasitas) {
            this.kapasitas = kapasitas;
            kepala.next = ekor;
            ekor.prev = kepala;
        }

        void lepas(Simpul s) {
            s.prev.next = s.next;
            s.next.prev = s.prev;
        }

        void keDepan(Simpul s) {
            s.next = kepala.next;
            s.prev = kepala;
            kepala.next.prev = s;
            kepala.next = s;
        }

        String get(int k) {
            Simpul s = peta.get(k);
            if (s == null) {
                return null;
            }
            lepas(s);
            keDepan(s);
            return s.nilai;
        }

        void put(int k, String v) {
            Simpul s = peta.get(k);
            if (s != null) {
                s.nilai = v;
                lepas(s);
                keDepan(s);
                return;
            }
            if (peta.size() == kapasitas) {
                Simpul tua = ekor.prev;
                lepas(tua);
                peta.remove(tua.kunci);
                System.out.println("  usir " + tua.kunci + "=" + tua.nilai);
            }
            s = new Simpul(k, v);
            peta.put(k, s);
            keDepan(s);
        }

        String urutan() {
            StringBuilder sb = new StringBuilder("[");
            for (Simpul s = kepala.next; s != ekor; s = s.next) {
                sb.append(s.kunci).append('=').append(s.nilai).append(s.next == ekor ? "" : ", ");
            }
            return sb.append(']').toString();
        }
    }

    public static void main(String[] args) {
        CacheLRU c = new CacheLRU(3);
        c.put(1, "satu");
        c.put(2, "dua");
        c.put(3, "tiga");
        System.out.println("isi " + c.urutan());
        System.out.println("get 1 -> " + c.get(1) + ", isi " + c.urutan());
        c.put(4, "empat");
        System.out.println("put 4 -> isi " + c.urutan());
        System.out.println("get 2 -> " + c.get(2));
        c.put(3, "TIGA");
        System.out.println("put 3 (ubah) -> isi " + c.urutan());
        c.put(5, "lima");
        System.out.println("put 5 -> isi " + c.urutan() + ", ukuran peta " + c.peta.size());
    }
}
