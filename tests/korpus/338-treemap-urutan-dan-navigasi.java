// TreeMap menjaga kunci terurut: firstKey, lastKey, floorKey, ceilingKey, higherKey, lowerKey (termasuk hasil null) dan pollFirstEntry
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        TreeMap<Integer, String> nilaiHuruf = new TreeMap<>();
        nilaiHuruf.put(85, "A");
        nilaiHuruf.put(0, "E");
        nilaiHuruf.put(70, "B");
        nilaiHuruf.put(55, "C");
        nilaiHuruf.put(40, "D");
        System.out.println("peta " + nilaiHuruf);
        System.out.println("firstKey " + nilaiHuruf.firstKey() + ", lastKey " + nilaiHuruf.lastKey());
        int[] skor = {92, 85, 71, 55, 39, 0, -5};
        for (int s : skor) {
            Integer batas = nilaiHuruf.floorKey(s);
            System.out.println("skor " + s + ": floorKey " + batas + " -> " + (batas == null ? "tidak valid" : nilaiHuruf.get(batas)));
        }
        System.out.println("ceilingKey(56) " + nilaiHuruf.ceilingKey(56) + ", ceilingKey(86) " + nilaiHuruf.ceilingKey(86));
        System.out.println("higherKey(70) " + nilaiHuruf.higherKey(70) + ", lowerKey(70) " + nilaiHuruf.lowerKey(70) + ", lowerKey(0) " + nilaiHuruf.lowerKey(0));
        while (!nilaiHuruf.isEmpty()) {
            System.out.println("pollFirstEntry " + nilaiHuruf.pollFirstEntry() + " -> sisa " + nilaiHuruf);
        }
        System.out.println("pollFirstEntry pada map kosong: " + nilaiHuruf.pollFirstEntry());
    }
}
