// Exception tanpa pesan: toString hanya nama kelas dan getMessage null; stack trace direkam saat objek exception dibuat, bukan saat dilempar
public class Main {
    static class AntrianPenuh extends RuntimeException {
    }

    static class AksesDitolak extends Exception {
        AksesDitolak() {
            super();
        }
    }

    static RuntimeException siapkan(String jenis) {
        if (jenis.equals("penuh")) {
            return new AntrianPenuh();
        }
        return new IllegalStateException(jenis);
    }

    static void periksa(int level) throws AksesDitolak {
        if (level < 3) {
            throw new AksesDitolak();
        }
        System.out.println("akses level " + level + " diterima");
    }

    public static void main(String[] args) {
        RuntimeException e1 = siapkan("penuh");
        System.out.println("toString: " + e1 + ", getMessage: " + e1.getMessage());
        try {
            periksa(5);
            periksa(1);
        } catch (AksesDitolak e) {
            System.out.println("tertangkap: " + e);
            e.printStackTrace();
        }
        RuntimeException e2 = siapkan("rusak");
        System.out.println("dibuat di siapkan(), dilempar dari main:");
        throw e2;
    }
}
