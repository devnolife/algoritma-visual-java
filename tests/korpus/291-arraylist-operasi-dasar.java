// Operasi dasar ArrayList: add, get, set, remove, size, contains, indexOf, lastIndexOf, isEmpty, clear, dengan isi dicetak tiap langkah
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> kota = new ArrayList<>();
        System.out.println("baru: " + kota + ", size " + kota.size() + ", isEmpty " + kota.isEmpty());
        kota.add("Makassar");
        kota.add("Bandung");
        kota.add("Medan");
        kota.add("Bandung");
        System.out.println("setelah 4x add: " + kota);
        System.out.println("get(2) = " + kota.get(2));
        String lama = kota.set(1, "Surabaya");
        System.out.println("set(1, Surabaya) mengembalikan " + lama + ": " + kota);
        System.out.println("contains(Bandung) = " + kota.contains("Bandung") + ", contains(Jakarta) = " + kota.contains("Jakarta"));
        kota.add("Medan");
        System.out.println("indexOf(Medan) = " + kota.indexOf("Medan") + ", lastIndexOf(Medan) = " + kota.lastIndexOf("Medan") + ", indexOf(Ambon) = " + kota.indexOf("Ambon"));
        String dihapus = kota.remove(0);
        System.out.println("remove(0) -> " + dihapus + ": " + kota);
        boolean berhasil = kota.remove("Medan");
        System.out.println("remove(\"Medan\") -> " + berhasil + ": " + kota);
        System.out.println("remove(\"Ambon\") -> " + kota.remove("Ambon") + ", size " + kota.size());
        kota.add(1, "Palu");
        System.out.println("add(1, Palu): " + kota);
        kota.clear();
        System.out.println("clear: " + kota + ", size " + kota.size() + ", isEmpty " + kota.isEmpty());
    }
}
