// Exception buatan yang mewarisi exception bawaan (IllegalArgumentException, IllegalStateException) tertangkap lewat catch kelas induknya
public class Main {
    static class NimTidakValidException extends IllegalArgumentException {
        NimTidakValidException(String pesan) {
            super(pesan);
        }
    }

    static class KrsTerkunciException extends IllegalStateException {
        KrsTerkunciException(String pesan) {
            super(pesan);
        }
    }

    static boolean terkunci = false;
    static int sks = 0;

    static void ambilMatkul(String nim, int sksMatkul) {
        if (nim.length() != 10) {
            throw new NimTidakValidException("NIM " + nim + " harus 10 karakter");
        }
        if (terkunci) {
            throw new KrsTerkunciException("KRS sudah dikunci");
        }
        if (sksMatkul <= 0) {
            throw new IllegalArgumentException("SKS tidak valid: " + sksMatkul);
        }
        sks += sksMatkul;
        if (sks >= 9) {
            terkunci = true;
        }
        System.out.println("ambil " + sksMatkul + " SKS, total " + sks + (terkunci ? " (terkunci)" : ""));
    }

    public static void main(String[] args) {
        String[] nim = {"H071221001", "H07122", "H071221001", "H071221001", "H071221001", "H071221001"};
        int[] beban = {3, 3, 0, 4, 2, 3};
        for (int i = 0; i < nim.length; i++) {
            try {
                ambilMatkul(nim[i], beban[i]);
            } catch (IllegalArgumentException e) {
                System.out.println("argumen salah: " + e);
            } catch (IllegalStateException e) {
                System.out.println("status salah: " + e);
            }
        }
        ambilMatkul("H071221002", 2);
    }
}
