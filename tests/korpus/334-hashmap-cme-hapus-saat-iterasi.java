// Menghapus kunci HashMap saat menelusuri keySet: lewat Iterator.remove aman, lewat map.remove memicu ConcurrentModificationException
import java.util.HashMap;
import java.util.Iterator;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> stok = new HashMap<>();
        String[] barang = {"apel", "jeruk", "mangga", "pisang", "salak", "durian"};
        int[] jumlah = {5, 0, 12, 0, 7, 0};
        for (int i = 0; i < barang.length; i++) {
            stok.put(barang[i], jumlah[i]);
        }
        System.out.println("stok " + stok);
        Iterator<String> it = stok.keySet().iterator();
        while (it.hasNext()) {
            String k = it.next();
            if (stok.get(k) == 0) {
                it.remove();
                System.out.println("hapus " + k + " lewat iterator -> " + stok);
            }
        }
        stok.put("nanas", 0);
        stok.put("anggur", 3);
        System.out.println("stok baru " + stok);
        for (String k : stok.keySet()) {
            System.out.println("periksa " + k);
            if (stok.get(k) == 0) {
                stok.remove(k);
                System.out.println("hapus " + k + " langsung dari map");
            }
        }
        System.out.println("tidak tercetak");
    }
}
