// Error: field dengan nama sama dideklarasikan dua kali di kelas (variable harga is already defined in class Produk)
public class Main {
    public static void main(String[] args) {
        Produk p = new Produk();
        System.out.println(p.harga);
    }
}

class Produk {
    String nama;
    int harga;
    double harga;
}
