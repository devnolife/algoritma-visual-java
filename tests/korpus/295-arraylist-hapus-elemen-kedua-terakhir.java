// Kasus terkenal: menghapus elemen KEDUA TERAKHIR di dalam for-each tidak melempar exception karena hasNext() langsung false, sehingga elemen terakhir terlewat
import java.util.ArrayList;
import java.util.ConcurrentModificationException;

public class Main {
    static void coba(String target) {
        ArrayList<String> daftar = new ArrayList<>();
        daftar.add("apel");
        daftar.add("jeruk");
        daftar.add("mangga");
        daftar.add("pisang");
        int diperiksa = 0;
        try {
            for (String buah : daftar) {
                diperiksa++;
                if (buah.equals(target)) {
                    daftar.remove(buah);
                }
            }
            System.out.println("hapus " + target + ": selesai tanpa exception, diperiksa " + diperiksa + ", hasil " + daftar);
        } catch (ConcurrentModificationException e) {
            System.out.println("hapus " + target + ": " + e + " setelah memeriksa " + diperiksa + ", hasil " + daftar);
        }
    }

    public static void main(String[] args) {
        coba("apel");
        coba("jeruk");
        coba("mangga");
        coba("pisang");
        coba("durian");
    }
}
