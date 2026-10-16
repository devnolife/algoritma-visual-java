// Error: Map hanya diberi satu argumen tipe (wrong number of type arguments; required 2)
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String> telepon = new HashMap<>();
        System.out.println(telepon.isEmpty());
    }
}
