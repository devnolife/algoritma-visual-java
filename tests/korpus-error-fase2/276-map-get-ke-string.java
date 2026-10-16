// Error: nilai Integer dari map disimpan ke variabel String (incompatible types: Integer cannot be converted to String)
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> umur = new HashMap<>();
        umur.put("Budi", 21);
        String teks = umur.get("Budi");
        System.out.println("Umur Budi " + teks);
    }
}
