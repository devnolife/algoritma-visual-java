// Kunci Integer negatif dan besar: indeks bucket dihitung dari (h ^ h >>> 16) & (n - 1), sehingga urutan iterasi tidak terurut menurut nilai
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        int[] kunci = {-1, 16, 65536, 1, -16, 100000, 15, 65537, Integer.MIN_VALUE, Integer.MAX_VALUE, 0, 31};
        HashMap<Integer, String> peta = new HashMap<>();
        for (int k : kunci) {
            int sebar = k ^ (k >>> 16);
            System.out.println(k + ": sebar " + sebar + ", bucket " + (sebar & 15));
            peta.put(k, "v" + k);
        }
        System.out.println(peta.keySet());
        System.out.println("get(65536) " + peta.get(65536) + ", get(-16) " + peta.get(-16) + ", size " + peta.size());
        peta.put(12345, "baru");
        System.out.println("setelah entri ke-13 (resize ke 32): " + peta.keySet());
    }
}
