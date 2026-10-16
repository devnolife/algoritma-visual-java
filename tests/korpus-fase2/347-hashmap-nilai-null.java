// Nilai null di HashMap: get mengembalikan null untuk kunci tak ada maupun kunci bernilai null; containsKey membedakannya, getOrDefault tetap null bila kunci ada, putIfAbsent menimpa null
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, String> ketua = new HashMap<>();
        ketua.put("HMJ Informatika", "Rani");
        ketua.put("HMJ Sipil", null);
        ketua.put(null, "tanpa organisasi");
        String[] cari = {"HMJ Informatika", "HMJ Sipil", "HMJ Mesin", null};
        for (String c : cari) {
            System.out.println(c + ": get=" + ketua.get(c) + ", containsKey=" + ketua.containsKey(c) + ", getOrDefault=" + ketua.getOrDefault(c, "(belum ada)"));
        }
        System.out.println("isi " + ketua);
        System.out.println("putIfAbsent(HMJ Sipil, Dimas) -> " + ketua.putIfAbsent("HMJ Sipil", "Dimas") + ", sekarang " + ketua.get("HMJ Sipil"));
        System.out.println("containsValue(null) " + ketua.containsValue(null) + ", remove(null) -> " + ketua.remove(null));
        System.out.println("akhir " + ketua);
    }
}
