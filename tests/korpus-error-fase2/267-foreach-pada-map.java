// Error: for-each langsung pada HashMap, padahal Map bukan Iterable (for-each not applicable to expression type)
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> stok = new HashMap<>();
        stok.put("apel", 5);
        stok.put("jeruk", 3);
        for (String buah : stok) {
            System.out.println(buah);
        }
    }
}
