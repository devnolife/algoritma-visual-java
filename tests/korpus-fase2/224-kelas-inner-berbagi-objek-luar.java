// Beberapa objek inner berbagi satu objek luar: menambah lagu mengubah total durasi milik playlist-nya sendiri
public class Main {
    public static void main(String[] args) {
        Playlist santai = new Playlist("Santai");
        Playlist semangat = new Playlist("Semangat");
        santai.tambah("Hujan", 215);
        santai.tambah("Senja", 187);
        semangat.tambah("Lari", 160);
        santai.tambah("Pagi", 240);
        santai.cetak();
        semangat.cetak();
        santai.putarSemua();
        semangat.putarSemua();
        System.out.println("Diputar: santai " + santai.diputar + ", semangat " + semangat.diputar);
    }
}

class Playlist {
    String nama;
    int totalDetik;
    int diputar;
    Lagu[] lagu = new Lagu[5];
    int banyak;

    Playlist(String nama) {
        this.nama = nama;
    }

    class Lagu {
        String judul;
        int detik;
        int urutan;

        Lagu(String judul, int detik) {
            this.judul = judul;
            this.detik = detik;
            totalDetik += detik;
            urutan = banyak + 1;
        }

        void putar() {
            diputar++;
            System.out.println("  memutar " + nama + " #" + urutan + ": " + judul + " (" + menitDetik(detik) + ")");
        }
    }

    void tambah(String judul, int detik) {
        lagu[banyak] = new Lagu(judul, detik);
        banyak++;
    }

    static String menitDetik(int d) {
        return d / 60 + ":" + (d % 60 < 10 ? "0" : "") + d % 60;
    }

    void cetak() {
        System.out.println(nama + ": " + banyak + " lagu, total " + menitDetik(totalDetik));
    }

    void putarSemua() {
        for (int i = 0; i < banyak; i++) {
            lagu[i].putar();
        }
    }
}
