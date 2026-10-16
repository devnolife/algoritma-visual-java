// Error: method toString dipanggil tanpa tanda kurung (cannot find symbol, symbol: variable toString)
public class Main {
    static class Buku {
        String judul = "Laskar Pelangi";

        @Override
        public String toString() {
            return "Buku: " + judul;
        }
    }

    public static void main(String[] args) {
        Buku b = new Buku();
        String teks = b.toString;
        System.out.println(teks);
    }
}
