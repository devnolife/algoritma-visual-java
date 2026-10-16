// list.sort dengan Comparator lambda: satu kriteria, kriteria bertingkat dalam lambda blok, parameter bertipe eksplisit, dan urutan terbalik
import java.util.ArrayList;

public class Main {
    static class Produk {
        String nama;
        int harga;
        int terjual;

        Produk(String nama, int harga, int terjual) {
            this.nama = nama;
            this.harga = harga;
            this.terjual = terjual;
        }

        @Override
        public String toString() {
            return nama + "(" + harga + "," + terjual + ")";
        }
    }

    public static void main(String[] args) {
        ArrayList<Produk> toko = new ArrayList<>();
        toko.add(new Produk("kopi", 25000, 40));
        toko.add(new Produk("teh", 15000, 55));
        toko.add(new Produk("susu", 18000, 40));
        toko.add(new Produk("jus", 15000, 12));
        toko.add(new Produk("air", 5000, 90));
        toko.sort((a, b) -> a.harga - b.harga);
        System.out.println("harga naik       : " + toko);
        toko.sort((a, b) -> b.terjual - a.terjual);
        System.out.println("terjual turun    : " + toko);
        toko.sort((a, b) -> {
            if (a.terjual != b.terjual) {
                return Integer.compare(b.terjual, a.terjual);
            }
            return a.nama.compareTo(b.nama);
        });
        System.out.println("terjual lalu nama: " + toko);
        toko.sort((Produk a, Produk b) -> b.nama.compareTo(a.nama));
        System.out.println("nama turun       : " + toko);
        toko.sort((a, b) -> Integer.compare(a.harga * a.terjual, b.harga * b.terjual));
        System.out.println("omzet naik       : " + toko);
    }
}
