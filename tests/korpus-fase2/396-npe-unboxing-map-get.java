// Unboxing hasil get yang null: dengan tipe statis Map pesannya menyebut "java.util.Map.get(Object)", dengan tipe HashMap menyebut "java.util.HashMap.get(Object)"
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stokMap = new HashMap<>();
        HashMap<String, Integer> stokHashMap = new HashMap<>();
        String[] barang = {"pensil", "buku"};
        for (String b : barang) {
            stokMap.put(b, 10);
            stokHashMap.put(b, 20);
        }
        int pensil = stokMap.get("pensil");
        System.out.println("pensil di Map: " + pensil);
        try {
            int penghapus = stokMap.get("penghapus");
            System.out.println(penghapus);
        } catch (NullPointerException e) {
            System.out.println("Map: " + e.getMessage());
        }
        try {
            int sisa = stokMap.get("spidol") - 1;
            System.out.println(sisa);
        } catch (NullPointerException e) {
            System.out.println("Map dalam aritmetika: " + e.getMessage());
        }
        Integer aman = stokHashMap.get("penghapus");
        System.out.println("disimpan ke Integer dulu aman: " + aman);
        int buku = stokHashMap.get("buku");
        System.out.println("buku di HashMap: " + buku);
        int penggaris = stokHashMap.get("penggaris");
        System.out.println("tidak tercetak " + penggaris);
    }
}
