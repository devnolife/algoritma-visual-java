// TreeMap<String, Integer> nilai mahasiswa: iterasi terurut nama, pollFirstEntry sampai habis, lalu firstKey pada map kosong (NoSuchElementException)
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        TreeMap<String, Integer> nilai = new TreeMap<>();
        nilai.put("Rudi", 78);
        nilai.put("Ani", 91);
        nilai.put("Maya", 65);
        nilai.put("budi", 88);
        nilai.put("Dewi", 72);
        nilai.put("Ani", 95);
        int total = 0;
        for (Map.Entry<String, Integer> e : nilai.entrySet()) {
            total += e.getValue();
            System.out.printf("%-5s %3d %s%n", e.getKey(), e.getValue(), "*".repeat(e.getValue() / 10));
        }
        System.out.printf("rata-rata %.2f dari %d mahasiswa%n", (double) total / nilai.size(), nilai.size());
        System.out.println("pertama " + nilai.firstKey() + ", terakhir " + nilai.lastKey() + ", keySet " + nilai.keySet());
        while (!nilai.isEmpty()) {
            Map.Entry<String, Integer> e = nilai.pollFirstEntry();
            System.out.println("panggil " + e.getKey() + " (" + e.getValue() + "), sisa " + nilai.size());
        }
        System.out.println("map kosong: " + nilai + ", firstKey?");
        System.out.println(nilai.firstKey());
    }
}
