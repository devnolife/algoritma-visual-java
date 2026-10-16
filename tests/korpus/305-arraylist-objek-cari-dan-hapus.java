// ArrayList berisi objek: mencari berdasarkan field, memperbarui objek di dalamnya, dan menghapus yang memenuhi syarat dengan loop mundur
import java.util.ArrayList;

public class Main {
    static class Buku {
        String judul;
        int tahun;
        boolean dipinjam;

        Buku(String judul, int tahun) {
            this.judul = judul;
            this.tahun = tahun;
        }

        @Override
        public String toString() {
            return judul + " (" + tahun + ")" + (dipinjam ? "*" : "");
        }
    }

    static Buku cari(ArrayList<Buku> rak, String judul) {
        for (Buku b : rak) {
            if (b.judul.equalsIgnoreCase(judul)) {
                return b;
            }
        }
        return null;
    }

    public static void main(String[] args) {
        ArrayList<Buku> rak = new ArrayList<>();
        rak.add(new Buku("Laskar Pelangi", 2005));
        rak.add(new Buku("Bumi Manusia", 1980));
        rak.add(new Buku("Ronggeng Dukuh Paruk", 1982));
        rak.add(new Buku("Cantik Itu Luka", 2002));
        rak.add(new Buku("Saman", 1998));
        String[] pinjam = {"saman", "Bumi manusia", "Harry Potter"};
        for (String p : pinjam) {
            Buku b = cari(rak, p);
            if (b == null) {
                System.out.println(p + ": tidak ada di rak");
            } else {
                b.dipinjam = true;
                System.out.println(p + ": dipinjam -> " + b);
            }
        }
        System.out.println("rak: " + rak);
        for (int i = rak.size() - 1; i >= 0; i--) {
            if (rak.get(i).tahun < 1990 && !rak.get(i).dipinjam) {
                System.out.println("arsipkan " + rak.remove(i));
            }
        }
        System.out.println("rak setelah arsip: " + rak);
        int jumlahDipinjam = 0;
        for (Buku b : rak) {
            if (b.dipinjam) {
                jumlahDipinjam++;
            }
        }
        System.out.println(jumlahDipinjam + " dari " + rak.size() + " buku sedang dipinjam");
    }
}
