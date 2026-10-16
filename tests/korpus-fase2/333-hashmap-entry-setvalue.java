// Mengubah nilai saat menelusuri entrySet dengan Map.Entry.setValue, dan put ke kunci yang sudah ada selama iterasi (bukan perubahan struktural, aman)
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> harga = new HashMap<>();
        harga.put("buku", 20000);
        harga.put("pensil", 3000);
        harga.put("tas", 150000);
        harga.put("penggaris", 5000);
        System.out.println("awal: " + harga);
        for (Map.Entry<String, Integer> e : harga.entrySet()) {
            if (e.getValue() >= 10000) {
                int lama = e.setValue(e.getValue() * 90 / 100);
                System.out.println("diskon " + e.getKey() + ": " + lama + " -> " + e.getValue());
            }
        }
        System.out.println("setelah diskon: " + harga);
        for (String k : harga.keySet()) {
            harga.put(k, harga.get(k) + 500);
        }
        System.out.println("semua naik 500: " + harga);
        Map.Entry<String, Integer> termurah = null;
        for (Map.Entry<String, Integer> e : harga.entrySet()) {
            if (termurah == null || e.getValue() < termurah.getValue()) {
                termurah = e;
            }
        }
        System.out.println("termurah: " + termurah + " (getKey " + termurah.getKey() + ", getValue " + termurah.getValue() + ")");
        termurah.setValue(1);
        System.out.println("setValue lewat entry yang disimpan mengubah map: " + harga.get(termurah.getKey()) + " " + harga);
    }
}
