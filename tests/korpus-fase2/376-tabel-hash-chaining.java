// Tabel hash buatan sendiri dengan chaining: indeks dari String.hashCode, sisip di kepala rantai, rehash saat jumlah melewati 3/4 kapasitas
public class Main {
    static class Entri {
        String kunci;
        int nilai;
        Entri next;

        Entri(String kunci, int nilai, Entri next) {
            this.kunci = kunci;
            this.nilai = nilai;
            this.next = next;
        }
    }

    static class TabelHash {
        Entri[] ember = new Entri[4];
        int jumlah;

        int indeks(String k, int panjang) {
            return Math.abs(k.hashCode() % panjang);
        }

        void put(String k, int v) {
            int i = indeks(k, ember.length);
            for (Entri e = ember[i]; e != null; e = e.next) {
                if (e.kunci.equals(k)) {
                    e.nilai = v;
                    return;
                }
            }
            ember[i] = new Entri(k, v, ember[i]);
            jumlah++;
            if (jumlah > ember.length * 3 / 4) {
                rehash();
            }
        }

        Integer get(String k) {
            for (Entri e = ember[indeks(k, ember.length)]; e != null; e = e.next) {
                if (e.kunci.equals(k)) {
                    return e.nilai;
                }
            }
            return null;
        }

        void rehash() {
            Entri[] lama = ember;
            ember = new Entri[lama.length * 2];
            for (Entri kepala : lama) {
                for (Entri e = kepala; e != null; e = e.next) {
                    int i = indeks(e.kunci, ember.length);
                    ember[i] = new Entri(e.kunci, e.nilai, ember[i]);
                }
            }
            System.out.println("  rehash: " + lama.length + " -> " + ember.length + " ember");
        }

        void cetak() {
            for (int i = 0; i < ember.length; i++) {
                StringBuilder sb = new StringBuilder("  [" + i + "]");
                for (Entri e = ember[i]; e != null; e = e.next) {
                    sb.append(" -> ").append(e.kunci).append('=').append(e.nilai);
                }
                System.out.println(sb);
            }
        }
    }

    public static void main(String[] args) {
        TabelHash t = new TabelHash();
        String[] kata = {"apel", "jeruk", "mangga", "pisang", "salak", "durian", "nanas", "apel"};
        for (int i = 0; i < kata.length; i++) {
            System.out.println("put " + kata[i] + " (hash " + kata[i].hashCode() + ")");
            t.put(kata[i], i);
        }
        t.cetak();
        System.out.println("get apel " + t.get("apel") + ", get kiwi " + t.get("kiwi") + ", jumlah " + t.jumlah);
    }
}
