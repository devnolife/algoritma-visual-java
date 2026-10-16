// this.nama vs nama: parameter yang menutupi field membuat penugasan tanpa this tidak mengubah field
public class Main {
    public static void main(String[] args) {
        Produk salah = new Produk("Pensil", 2500, true);
        Produk benar = new Produk("Pensil", 2500);
        System.out.println("salah: " + salah.nama + ", " + salah.harga);
        System.out.println("benar: " + benar.nama + ", " + benar.harga);
        benar.ubahHarga(3000);
        System.out.println("setelah ubahHarga(3000): " + benar.harga);
        benar.naikkan(10);
        System.out.println("setelah naikkan(10%): " + benar.harga);
        System.out.println("bandingkan: " + benar.lebihMahalDari(salah) + " " + salah.lebihMahalDari(benar));
    }
}

class Produk {
    String nama;
    int harga;

    Produk(String nama, int harga, boolean lupaThis) {
        nama = nama;
        harga = harga;
        System.out.println("konstruktor tanpa this: parameter nama = " + nama + ", field nama = " + this.nama);
    }

    Produk(String nama, int harga) {
        this.nama = nama;
        this.harga = harga;
    }

    void ubahHarga(int harga) {
        this.harga = harga;
    }

    void naikkan(int persen) {
        int harga = this.harga * persen / 100;
        System.out.println("kenaikan lokal = " + harga);
        this.harga += harga;
    }

    boolean lebihMahalDari(Produk lain) {
        return this.harga > lain.harga;
    }
}
