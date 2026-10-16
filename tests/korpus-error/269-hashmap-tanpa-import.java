// Error: HashMap dipakai tanpa import java.util.HashMap (cannot find symbol, symbol: class HashMap)
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> nilai = new HashMap<>();
        nilai.put("Ani", 90);
        System.out.println(nilai);
    }
}
