// Error: compareTo ditulis dengan tipe parameter yang salah sehingga Comparable<Barang> tidak terpenuhi (Barang is not abstract and does not override abstract method compareTo(Barang) in Comparable)
public class Main {
    public static void main(String[] args) {
        Barang a = new Barang("Sabun", 4000);
        Barang b = new Barang("Odol", 9000);
        System.out.println(a.compareTo(b.nama));
    }
}

class Barang implements Comparable<Barang> {
    String nama;
    int harga;

    Barang(String nama, int harga) {
        this.nama = nama;
        this.harga = harga;
    }

    public int compareTo(String namaLain) {
        return nama.compareTo(namaLain);
    }
}
