// Error: @Override pada method toString yang salah ketik (method does not override or implement a method from a supertype)
public class Main {
    static class Produk {
        String nama;
        int harga;

        Produk(String nama, int harga) {
            this.nama = nama;
            this.harga = harga;
        }

        @Override
        public String toStrign() {
            return nama + " - Rp" + harga;
        }
    }

    public static void main(String[] args) {
        System.out.println(new Produk("Kopi", 15000));
    }
}
