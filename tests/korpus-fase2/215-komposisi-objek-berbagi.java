// Komposisi: objek berisi objek lain; dua mahasiswa berbagi satu objek Alamat sehingga perubahan terlihat di keduanya
public class Main {
    static class Alamat {
        String kota;
        String jalan;

        Alamat(String jalan, String kota) {
            this.jalan = jalan;
            this.kota = kota;
        }

        String teks() {
            return jalan + ", " + kota;
        }
    }

    static class Mahasiswa {
        String nama;
        Alamat alamat;

        Mahasiswa(String nama, Alamat alamat) {
            this.nama = nama;
            this.alamat = alamat;
        }

        String teks() {
            return nama + " tinggal di " + (alamat == null ? "(belum diisi)" : alamat.teks());
        }
    }

    public static void main(String[] args) {
        Alamat kos = new Alamat("Jl. Melati 5", "Makassar");
        Mahasiswa a = new Mahasiswa("Rina", kos);
        Mahasiswa b = new Mahasiswa("Sinta", kos);
        Mahasiswa c = new Mahasiswa("Tono", null);
        System.out.println(a.teks());
        System.out.println(b.teks());
        System.out.println(c.teks());
        b.alamat.jalan = "Jl. Mawar 12";
        System.out.println("Setelah b.alamat.jalan diubah:");
        System.out.println(a.teks());
        System.out.println(b.teks());
        b.alamat = new Alamat("Jl. Kenanga 3", "Gowa");
        System.out.println("Setelah b.alamat diganti objek baru:");
        System.out.println(a.teks());
        System.out.println(b.teks());
        c.alamat = a.alamat;
        a.alamat.kota = "Maros";
        System.out.println(c.teks());
        System.out.println("a.alamat == c.alamat: " + (a.alamat == c.alamat) + ", a.alamat == b.alamat: " + (a.alamat == b.alamat));
    }
}
