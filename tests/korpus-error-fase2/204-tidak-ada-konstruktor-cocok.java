// Error: dua konstruktor berparameter dua tetapi tidak ada yang menerima (String, String) (no suitable constructor found for Barang(String,String))
public class Main {
    public static void main(String[] args) {
        Barang a = new Barang("Pena", 10);
        Barang b = new Barang("Buku", 12000.0);
        Barang c = new Barang("Tas", "150000");
        System.out.println(a.nama + b.nama + c.nama);
    }
}

class Barang {
    String nama;
    int stok;
    double harga;

    Barang(String nama, int stok) {
        this.nama = nama;
        this.stok = stok;
    }

    Barang(String nama, double harga) {
        this.nama = nama;
        this.harga = harga;
    }
}
