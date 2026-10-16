// Sepuluh kunci dengan hashCode sama (gabungan blok "Aa"/"BB") dalam satu bucket: kunci ke-9 dan ke-10 memicu resize tabel (bukan treeify) karena kapasitas < 64
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> peta = new HashMap<>();
        String[] penanda = {"a", "q", "Q"};
        for (String p : penanda) {
            peta.put(p, 0);
        }
        System.out.println("penanda saja: " + peta);
        String[] blok = {"Aa", "BB"};
        int nomor = 0;
        for (int b = 0; b < 16 && nomor < 10; b++) {
            StringBuilder sb = new StringBuilder();
            for (int bit = 3; bit >= 0; bit--) {
                sb.append(blok[(b >> bit) & 1]);
            }
            String k = sb.toString();
            nomor++;
            peta.put(k, nomor);
            System.out.println(nomor + ". " + k + " (hash " + k.hashCode() + "), size " + peta.size() + ": " + peta);
        }
        System.out.println("get(BBAaAaBB) = " + peta.get("BBAaAaBB") + ", get(BBBBBBBB) = " + peta.get("BBBBBBBB"));
    }
}
