// Error: nilai String dimasukkan ke Map<String, Integer> (incompatible types: String cannot be converted to Integer)
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stok = new HashMap<>();
        stok.put("pensil", 12);
        stok.put("buku", "lima");
        System.out.println(stok);
    }
}
