// Error: HashMap dengan tipe nilai primitif double (unexpected type)
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, double> ipk = new HashMap<>();
        ipk.put("Rina", 3.75);
        System.out.println(ipk);
    }
}
