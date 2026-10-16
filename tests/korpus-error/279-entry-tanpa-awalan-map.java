// Error: Entry dipakai tanpa awalan Map. dan tanpa import Map.Entry (cannot find symbol, symbol: class Entry)
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> nilai = new HashMap<>();
        nilai.put("Ani", 88);
        nilai.put("Budi", 75);
        for (Entry<String, Integer> e : nilai.entrySet()) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }
    }
}
