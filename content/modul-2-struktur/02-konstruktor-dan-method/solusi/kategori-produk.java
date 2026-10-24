class Produk {
    private String nama;
    private int harga;
    private int stok;
    private String kategori;

    Produk(String nama, int harga, int stok, String kategori) {
        this.nama = nama;   // #this
        this.harga = harga;
        this.stok = stok;
        this.kategori = kategori;
    }

    Produk(String nama, int harga, int stok) {
        this(nama, harga, stok, "Umum");
    }

    Produk(String nama, int harga) {
        this(nama, harga, 0);   // #delegasi
    }

    int getStok() {
        return stok;
    }

    void setHarga(int harga) {
        if (harga < 0) {   // #validasi
            System.out.println("Harga " + harga + " ditolak");
            return;
        }
        this.harga = harga;
    }

    void tambahStok(int jumlah) {
        stok += jumlah;
    }

    boolean jual(int jumlah) {
        if (jumlah > stok) {
            return false;
        }
        stok -= jumlah;
        return true;
    }

    @Override
    public String toString() {
        return "[" + kategori + "] " + nama + " Rp" + harga + " (stok " + stok + ")";
    }
}

public class Main {
    public static void main(String[] args) {
        Produk teh = new Produk("Es teh", 5000, 10, "Minuman");
        Produk roti = new Produk("Roti bakar", 12000);
        roti.tambahStok(4);
        System.out.println(teh.jual(3));
        System.out.println(roti.jual(5));
        teh.setHarga(-500);
        roti.setHarga(13000);
        System.out.println(teh);
        System.out.println(roti);
        System.out.println("Sisa teh: " + teh.getStok());
    }
}
