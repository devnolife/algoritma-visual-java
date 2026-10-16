// toString kereta berantai dibangun dengan StringBuilder sambil menelusuri gerbong; toString gerbong dipanggil dari toString kereta
public class Main {
    static class Gerbong {
        String kode;
        int penumpang;
        Gerbong berikut;

        Gerbong(String kode, int penumpang) {
            this.kode = kode;
            this.penumpang = penumpang;
        }

        @Override
        public String toString() {
            return "[" + kode + ":" + penumpang + "]";
        }
    }

    static class Kereta {
        String nama;
        Gerbong kepala;
        int jumlah;

        Kereta(String nama) {
            this.nama = nama;
        }

        void sambung(String kode, int penumpang) {
            Gerbong g = new Gerbong(kode, penumpang);
            if (kepala == null) {
                kepala = g;
            } else {
                Gerbong p = kepala;
                while (p.berikut != null) {
                    p = p.berikut;
                }
                p.berikut = g;
            }
            jumlah++;
        }

        int totalPenumpang() {
            int t = 0;
            for (Gerbong g = kepala; g != null; g = g.berikut) {
                t += g.penumpang;
            }
            return t;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder(nama).append(" <loko>");
            for (Gerbong g = kepala; g != null; g = g.berikut) {
                sb.append(" - ").append(g);
            }
            return sb.append(" (").append(jumlah).append(" gerbong, ").append(totalPenumpang()).append(" orang)").toString();
        }
    }

    public static void main(String[] args) {
        Kereta k = new Kereta("Argo");
        System.out.println(k);
        k.sambung("A", 40);
        System.out.println(k);
        k.sambung("B", 38);
        k.sambung("M", 0);
        System.out.println(k);
        k.kepala.berikut.penumpang -= 8;
        System.out.println("Setelah 8 orang turun dari B: " + k);
        Gerbong kedua = k.kepala.berikut;
        System.out.println("Gerbong kedua: " + kedua + ", berikutnya " + kedua.berikut + ", setelah itu " + kedua.berikut.berikut);
    }
}
