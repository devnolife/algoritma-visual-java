// Error: Collections.sort pada list berisi objek yang tidak Comparable (no suitable method found for sort(ArrayList<Barang>))
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static class Barang {
        String nama;
        int harga;

        Barang(String nama, int harga) {
            this.nama = nama;
            this.harga = harga;
        }
    }

    public static void main(String[] args) {
        ArrayList<Barang> rak = new ArrayList<>();
        rak.add(new Barang("Sabun", 4000));
        rak.add(new Barang("Odol", 9000));
        Collections.sort(rak);
        System.out.println(rak.get(0).nama);
    }
}
