// List.of menghasilkan list immutable: get dan contains boleh, add/set/remove melempar UnsupportedOperationException, contains(null) melempar NullPointerException
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> warna = List.of("merah", "kuning", "hijau");
        System.out.println("warna " + warna + ", get(1) " + warna.get(1) + ", size " + warna.size());
        System.out.println("contains(hijau) " + warna.contains("hijau") + ", indexOf(biru) " + warna.indexOf("biru"));
        try {
            warna.add("biru");
        } catch (UnsupportedOperationException e) {
            System.out.println("add    -> " + e + ", pesan " + e.getMessage());
        }
        try {
            warna.set(0, "jingga");
        } catch (UnsupportedOperationException e) {
            System.out.println("set    -> " + e);
        }
        try {
            warna.remove("merah");
        } catch (UnsupportedOperationException e) {
            System.out.println("remove -> " + e);
        }
        try {
            warna.get(3);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(3) -> " + e);
        }
        List<Integer> dua = List.of(4, 8);
        try {
            dua.get(2);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("List.of dua elemen get(2) -> " + e);
        }
        List<String> kosong = List.of();
        System.out.println("List.of() = " + kosong + ", isEmpty " + kosong.isEmpty());
        ArrayList<String> salinan = new ArrayList<>(warna);
        salinan.add("biru");
        System.out.println("salinan bisa diubah: " + salinan);
        for (String w : warna) {
            System.out.print(w.toUpperCase() + " ");
        }
        System.out.println();
        System.out.println("contains(null)?");
        System.out.println(warna.contains(null));
    }
}
