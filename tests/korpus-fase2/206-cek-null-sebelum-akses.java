// Pemeriksaan null sebelum memakai objek: short-circuit &&, null dalam konkatenasi, dan method yang mengembalikan null
public class Main {
    static class Buku {
        String judul;
        Buku lanjutan;

        Buku(String judul) {
            this.judul = judul;
        }
    }

    static Buku cari(Buku[] rak, String judul) {
        for (Buku b : rak) {
            if (b != null && b.judul.equals(judul)) {
                return b;
            }
        }
        return null;
    }

    public static void main(String[] args) {
        Buku[] rak = new Buku[4];
        rak[0] = new Buku("Dasar Java");
        rak[2] = new Buku("Struktur Data");
        rak[0].lanjutan = rak[2];
        String[] dicari = {"Struktur Data", "Algoritma", "Dasar Java"};
        for (String j : dicari) {
            Buku hasil = cari(rak, j);
            if (hasil == null) {
                System.out.println(j + ": tidak ada");
            } else {
                String lanjut = hasil.lanjutan == null ? "-" : hasil.lanjutan.judul;
                System.out.println(j + ": ditemukan, lanjutan = " + lanjut);
            }
        }
        Buku kosong = cari(rak, "Kalkulus");
        System.out.println("hasil = " + kosong);
        boolean aman = kosong != null && kosong.judul.length() > 0;
        System.out.println("aman = " + aman);
        int terisi = 0;
        for (int i = 0; i < rak.length; i++) {
            if (rak[i] != null) {
                terisi++;
            }
        }
        System.out.println("rak terisi " + terisi + " dari " + rak.length);
        String keterangan = null;
        keterangan = keterangan + " tambahan";
        System.out.println(keterangan);
    }
}
