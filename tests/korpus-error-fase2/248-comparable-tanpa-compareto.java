// Error: kelas implements Comparable<Barang> tetapi tidak menulis compareTo (Barang is not abstract and does not override abstract method compareTo(Barang) in Comparable)
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        ArrayList<Barang> rak = new ArrayList<>();
        rak.add(new Barang("Sabun", 4000));
        rak.add(new Barang("Odol", 9000));
        Collections.sort(rak);
        System.out.println(rak.get(0).nama);
    }
}

class Barang implements Comparable<Barang> {
    String nama;
    int harga;

    Barang(String nama, int harga) {
        this.nama = nama;
        this.harga = harga;
    }
}
