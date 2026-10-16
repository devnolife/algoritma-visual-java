// Error: @Override pada method yang tidak ada di Object (method does not override or implement a method from a supertype)
public class Main {
    static class Laporan {
        String isi = "Penjualan naik 10%";

        @Override
        public void cetak() {
            System.out.println(isi);
        }
    }

    public static void main(String[] args) {
        new Laporan().cetak();
    }
}
