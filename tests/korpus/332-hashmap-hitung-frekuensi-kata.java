// Menghitung frekuensi kata dengan HashMap dan getOrDefault, mencari kata terbanyak, lalu menampilkan hasil terurut lewat TreeMap
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String teks = "Ani suka apel dan Budi suka jeruk tetapi Ani juga suka jeruk dan apel merah";
        HashMap<String, Integer> frekuensi = new HashMap<>();
        for (String kata : teks.toLowerCase().split(" ")) {
            frekuensi.put(kata, frekuensi.getOrDefault(kata, 0) + 1);
        }
        System.out.println("HashMap : " + frekuensi);
        String terbanyak = "";
        int maks = 0;
        for (Map.Entry<String, Integer> e : frekuensi.entrySet()) {
            if (e.getValue() > maks) {
                maks = e.getValue();
                terbanyak = e.getKey();
            }
        }
        System.out.println("terbanyak: " + terbanyak + " (" + maks + " kali)");
        TreeMap<String, Integer> urut = new TreeMap<>(frekuensi);
        System.out.println("TreeMap : " + urut);
        HashMap<Integer, String> kelompok = new HashMap<>();
        for (Map.Entry<String, Integer> e : urut.entrySet()) {
            String lama = kelompok.get(e.getValue());
            kelompok.put(e.getValue(), lama == null ? e.getKey() : lama + "," + e.getKey());
        }
        System.out.println("per frekuensi: " + kelompok);
        System.out.println("jumlah kata unik " + frekuensi.size() + ", kata 'pisang' " + frekuensi.getOrDefault("pisang", 0) + " kali");
    }
}
