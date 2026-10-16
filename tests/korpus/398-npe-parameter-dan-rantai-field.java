// NPE pada parameter null dan rantai field: pesan menyebut nama parameter ("o"), rantai "o.alamat.kota", dan elemen List dari get(int)
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Kota {
        String nama;

        Kota(String nama) {
            this.nama = nama;
        }
    }

    static class Alamat {
        Kota kota;
    }

    static class Orang {
        String nama;
        Alamat alamat;

        Orang(String nama) {
            this.nama = nama;
        }
    }

    static int panjangNama(Orang o) {
        return o.nama.length();
    }

    static String namaKota(Orang o) {
        return o.alamat.kota.nama;
    }

    public static void main(String[] args) {
        Orang ani = new Orang("Ani");
        System.out.println("panjang nama Ani = " + panjangNama(ani));
        try {
            panjangNama(null);
        } catch (NullPointerException e) {
            System.out.println("1: " + e.getMessage());
        }
        try {
            panjangNama(new Orang(null));
        } catch (NullPointerException e) {
            System.out.println("2: " + e.getMessage());
        }
        try {
            namaKota(ani);
        } catch (NullPointerException e) {
            System.out.println("3: " + e.getMessage());
        }
        ani.alamat = new Alamat();
        try {
            namaKota(ani);
        } catch (NullPointerException e) {
            System.out.println("4: " + e.getMessage());
        }
        ani.alamat.kota = new Kota("Makassar");
        System.out.println("kota Ani = " + namaKota(ani));
        List<Orang> antrean = new ArrayList<>();
        antrean.add(ani);
        antrean.add(null);
        for (int i = 0; i < antrean.size(); i++) {
            System.out.println("antrean " + i + ": " + antrean.get(i).nama);
        }
    }
}
