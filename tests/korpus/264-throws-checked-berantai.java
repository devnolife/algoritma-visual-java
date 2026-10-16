// Exception checked merambat lewat tiga method yang masing-masing mendeklarasikan throws; finally tiap tingkat tetap berjalan
public class Main {
    static class BerkasTidakAdaException extends Exception {
        BerkasTidakAdaException(String pesan) {
            super(pesan);
        }
    }

    static String[] berkas = {"data.txt", "nilai.csv"};

    static String baca(String nama) throws BerkasTidakAdaException {
        try {
            for (String b : berkas) {
                if (b.equals(nama)) {
                    return "isi dari " + nama;
                }
            }
            throw new BerkasTidakAdaException(nama + " tidak ditemukan");
        } finally {
            System.out.println("    [baca] selesai mencari " + nama);
        }
    }

    static String muat(String nama) throws BerkasTidakAdaException {
        try {
            return baca(nama).toUpperCase();
        } finally {
            System.out.println("  [muat] selesai untuk " + nama);
        }
    }

    static void tampilkan(String nama) throws BerkasTidakAdaException {
        System.out.println("tampilkan " + nama);
        String isi = muat(nama);
        System.out.println("-> " + isi);
    }

    public static void main(String[] args) {
        String[] diminta = {"data.txt", "foto.png", "nilai.csv"};
        for (String d : diminta) {
            try {
                tampilkan(d);
            } catch (BerkasTidakAdaException e) {
                System.out.println("main: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
