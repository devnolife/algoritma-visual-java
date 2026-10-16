// HashMap<Integer, ...> dengan banyak entri: tabel membesar (16 -> 32 -> 64 -> 128) saat size melewati 0.75 kapasitas, urutan iterasi ikut berubah
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<Integer, Integer> peta = new HashMap<>();
        int[] cetakSaat = {12, 13, 24, 25, 48, 49, 96, 97};
        int idx = 0;
        for (int i = 1; i <= 97; i++) {
            int kunci = (i * 37) % 211;
            peta.put(kunci, i);
            if (idx < cetakSaat.length && i == cetakSaat[idx]) {
                System.out.println("size " + i + ": " + peta.keySet());
                idx++;
            }
        }
        System.out.println("get(37) = " + peta.get(37) + ", get(74) = " + peta.get(74) + ", get(200) = " + peta.get(200));
        int jumlahKunci = 0;
        for (int k : peta.keySet()) {
            jumlahKunci += k;
        }
        System.out.println("jumlah semua kunci = " + jumlahKunci);
    }
}
