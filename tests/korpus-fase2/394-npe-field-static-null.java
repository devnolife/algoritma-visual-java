// NPE dari field static yang belum diisi: pesan menyebut "Main.akar", rantai "Main.akar.kiri", atau kelas pemilik field static ("Konfigurasi.aktif")
public class Main {
    static class Simpul {
        int nilai;
        Simpul kiri;

        Simpul(int nilai) {
            this.nilai = nilai;
        }
    }

    static Simpul akar;
    static String judul;

    static void siapkan(boolean isi) {
        if (isi) {
            akar = new Simpul(10);
        }
    }

    public static void main(String[] args) {
        siapkan(false);
        try {
            System.out.println(akar.nilai);
        } catch (NullPointerException e) {
            System.out.println("1: " + e.getMessage());
        }
        try {
            System.out.println(judul.toUpperCase());
        } catch (NullPointerException e) {
            System.out.println("2: " + e.getMessage());
        }
        siapkan(true);
        System.out.println("akar.nilai = " + akar.nilai + ", akar.kiri = " + akar.kiri);
        try {
            System.out.println(akar.kiri.nilai);
        } catch (NullPointerException e) {
            System.out.println("3: " + e.getMessage());
        }
        System.out.println("mode = " + Konfigurasi.mode);
        System.out.println(Konfigurasi.aktif.length());
    }
}

class Konfigurasi {
    static String mode = "uji";
    static String aktif;
}
