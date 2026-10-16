// Autoboxing di koleksi: ArrayList<Integer> dijumlahkan, nilai HashMap diperbarui, dan ternary bercampur int memicu unboxing null
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> skor = new ArrayList<>();
        int[] mentah = {88, 92, 75, 92, 60, 100};
        for (int m : mentah) {
            skor.add(m);
        }
        int jumlah = 0;
        for (Integer s : skor) {
            jumlah += s;
        }
        System.out.println("skor " + skor + ", jumlah " + jumlah + ", maks " + Collections.max(skor) + ", min " + Collections.min(skor));
        System.out.println("frekuensi 92 = " + Collections.frequency(skor, 92));
        skor.set(0, skor.get(0) + 5);
        System.out.println("skor[0] + 5 -> " + skor);
        HashMap<String, Integer> stok = new HashMap<>();
        stok.put("apel", 10);
        stok.put("jeruk", 0);
        Integer apel = stok.get("apel");
        Integer mangga = stok.get("mangga");
        System.out.println("apel " + apel + ", mangga " + mangga);
        Integer aman = mangga != null ? mangga : Integer.valueOf(-1);
        System.out.println("dengan pengecekan: " + aman);
        boolean adaMangga = false;
        try {
            Integer hasil = adaMangga ? 0 : stok.get("mangga");
            System.out.println("ternary hasil " + hasil);
        } catch (NullPointerException e) {
            System.out.println("ternary memicu unboxing: " + e.getMessage());
        }
        stok.put("jeruk", stok.get("jeruk") + 3);
        System.out.println("stok " + stok);
    }
}
