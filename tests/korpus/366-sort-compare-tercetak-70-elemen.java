// Comparator lambda mencetak pasangan saat Arrays.sort mengurutkan 70 objek: TimSort penuh (minRun 18, empat run, lalu digabung)
import java.util.Arrays;

public class Main {
    static int banding = 0;
    static StringBuilder log = new StringBuilder();

    static class Barang {
        String kode;
        int berat;

        Barang(String kode, int berat) {
            this.kode = kode;
            this.berat = berat;
        }

        @Override
        public String toString() {
            return kode;
        }
    }

    public static void main(String[] args) {
        Barang[] gudang = new Barang[70];
        for (int i = 0; i < gudang.length; i++) {
            gudang[i] = new Barang("B" + i, (i * 37 + 11) % 97);
        }
        Arrays.sort(gudang, (a, b) -> {
            banding++;
            log.append(a.berat).append(':').append(b.berat).append(banding % 15 == 0 ? "\n" : " ");
            return a.berat - b.berat;
        });
        System.out.println(log.toString().trim());
        StringBuilder hasil = new StringBuilder();
        for (Barang b : gudang) {
            hasil.append(b.berat).append(' ');
        }
        System.out.println("hasil " + hasil.toString().trim());
        System.out.println(banding + " perbandingan, pertama " + gudang[0] + ", terakhir " + gudang[69]);
    }
}
