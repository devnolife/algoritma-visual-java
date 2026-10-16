// Map sebagai tipe statis: putIfAbsent, remove(kunci), containsValue, values() untuk menjumlah, serta keySet/values sebagai view yang ikut berubah
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> skor = new HashMap<>();
        skor.put("tim merah", 10);
        skor.put("tim biru", 7);
        System.out.println("putIfAbsent(tim hijau, 0) -> " + skor.putIfAbsent("tim hijau", 0));
        System.out.println("putIfAbsent(tim merah, 0) -> " + skor.putIfAbsent("tim merah", 0));
        Set<String> tim = skor.keySet();
        Collection<Integer> angka = skor.values();
        System.out.println("tim " + tim + ", angka " + angka);
        skor.put("tim kuning", 12);
        System.out.println("setelah put tim kuning, view ikut berubah: " + tim + " " + angka);
        int total = 0;
        for (int a : angka) {
            total += a;
        }
        System.out.println("total skor " + total + ", containsValue(12) " + skor.containsValue(12));
        tim.remove("tim biru");
        System.out.println("hapus lewat keySet: " + skor);
        System.out.println("remove(tim ungu) -> " + skor.remove("tim ungu") + ", remove(tim hijau) -> " + skor.remove("tim hijau"));
        System.out.println("akhir " + skor + ", size " + skor.size());
    }
}
