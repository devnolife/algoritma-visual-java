// Operasi dasar HashMap: put (mengembalikan nilai lama), get, getOrDefault, containsKey, containsValue, putIfAbsent, remove, kunci null, clear
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> harga = new HashMap<>();
        System.out.println("put kopi -> " + harga.put("kopi", 15000));
        System.out.println("put teh -> " + harga.put("teh", 8000));
        System.out.println("put kopi lagi -> " + harga.put("kopi", 17000));
        harga.put("roti", 12000);
        System.out.println("isi " + harga + ", size " + harga.size());
        System.out.println("get(teh) " + harga.get("teh") + ", get(susu) " + harga.get("susu") + ", getOrDefault(susu, 0) " + harga.getOrDefault("susu", 0));
        System.out.println("containsKey(roti) " + harga.containsKey("roti") + ", containsValue(8000) " + harga.containsValue(8000) + ", containsValue(9999) " + harga.containsValue(9999));
        System.out.println("putIfAbsent(teh, 1) -> " + harga.putIfAbsent("teh", 1) + ", putIfAbsent(susu, 9000) -> " + harga.putIfAbsent("susu", 9000));
        System.out.println("isi " + harga);
        System.out.println("remove(roti) -> " + harga.remove("roti") + ", remove(roti) lagi -> " + harga.remove("roti"));
        harga.put("teh", harga.get("teh") + 500);
        System.out.println("teh naik 500 -> " + harga.get("teh"));
        harga.put(null, 0);
        System.out.println("kunci null boleh: " + harga + ", get(null) " + harga.get(null));
        harga.clear();
        System.out.println("clear -> " + harga + ", isEmpty " + harga.isEmpty());
    }
}
