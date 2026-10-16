// NPE dari nilai kembalian method yang null: 'because the return value of "Main.cari(int)" is null', method instance kelas lain, dan ArrayList.get
import java.util.ArrayList;

public class Main {
    static class Produk {
        int kode;
        int harga;

        Produk(int kode, int harga) {
            this.kode = kode;
            this.harga = harga;
        }
    }

    static Produk[] katalog = {new Produk(1, 5000), new Produk(2, 12000)};

    static Produk cari(int kode) {
        for (Produk p : katalog) {
            if (p.kode == kode) {
                return p;
            }
        }
        return null;
    }

    public static void main(String[] args) {
        System.out.println("harga kode 2 = " + cari(2).harga);
        try {
            System.out.println(cari(5).harga);
        } catch (NullPointerException e) {
            System.out.println("1: " + e.getMessage());
        }
        Toko toko = new Toko();
        toko.tambah("pena", 3000);
        try {
            System.out.println(toko.cariBarang("buku").length());
        } catch (NullPointerException e) {
            System.out.println("2: " + e.getMessage());
        }
        ArrayList<Produk> keranjang = new ArrayList<>();
        keranjang.add(cari(1));
        keranjang.add(cari(9));
        System.out.println("keranjang berisi " + keranjang.size() + " entri");
        int total = 0;
        for (int i = 0; i < keranjang.size(); i++) {
            total += keranjang.get(i).harga;
            System.out.println("subtotal " + total);
        }
    }
}

class Toko {
    ArrayList<String> barang = new ArrayList<>();

    void tambah(String nama, int harga) {
        barang.add(nama + ":" + harga);
    }

    String cariBarang(String nama) {
        for (String b : barang) {
            if (b.startsWith(nama + ":")) {
                return b;
            }
        }
        return null;
    }
}
