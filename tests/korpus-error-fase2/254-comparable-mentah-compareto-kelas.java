// Error: Comparable mentah (tanpa <Barang>) tetapi compareTo menerima Barang (Barang is not abstract and does not override abstract method compareTo(Object) in Comparable)
public class Main {
    public static void main(String[] args) {
        Barang a = new Barang(4000);
        Barang b = new Barang(9000);
        System.out.println(a.compareTo(b));
    }
}

class Barang implements Comparable {
    int harga;

    Barang(int harga) {
        this.harga = harga;
    }

    public int compareTo(Barang lain) {
        return harga - lain.harga;
    }
}
