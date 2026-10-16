// Urutan iterasi HashMap untuk kunci String mengikuti indeks bucket (hash), bukan urutan sisip; keySet, values, dan entrySet konsisten
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> populasi = new HashMap<>();
        String[] kota = {"Makassar", "Parepare", "Palopo", "Gowa", "Maros", "Bone", "Sinjai", "Takalar"};
        int[] jiwa = {1423, 151, 184, 765, 391, 801, 259, 300};
        for (int i = 0; i < kota.length; i++) {
            int h = kota[i].hashCode();
            populasi.put(kota[i], jiwa[i]);
            System.out.println("sisip " + kota[i] + " (hash " + h + ", bucket " + ((h ^ (h >>> 16)) & 15) + ") -> " + populasi.keySet());
        }
        System.out.println("keySet  : " + populasi.keySet());
        System.out.println("values  : " + populasi.values());
        System.out.println("entrySet: " + populasi.entrySet());
        int total = 0;
        for (Map.Entry<String, Integer> e : populasi.entrySet()) {
            total += e.getValue();
            System.out.println("  " + e.getKey() + " = " + e.getValue());
        }
        System.out.println("total " + total + " ribu jiwa");
        for (String k : populasi.keySet()) {
            if (k.startsWith("P")) {
                System.out.println("berawalan P: " + k);
            }
        }
    }
}
