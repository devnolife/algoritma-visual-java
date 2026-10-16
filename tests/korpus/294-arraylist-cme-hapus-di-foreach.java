// Menghapus elemen di dalam for-each mengubah modCount sehingga next() berikutnya melempar ConcurrentModificationException
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> antrian = new ArrayList<>();
        antrian.add("Ani");
        antrian.add("Budi");
        antrian.add("Cici");
        antrian.add("Dodi");
        antrian.add("Eka");
        System.out.println("antrian " + antrian);
        for (String nama : antrian) {
            System.out.println("memeriksa " + nama);
            if (nama.startsWith("B")) {
                antrian.remove(nama);
                System.out.println("  " + nama + " dihapus, antrian " + antrian);
            }
        }
        System.out.println("tidak tercetak");
    }
}
