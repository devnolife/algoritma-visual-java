// Kelas bersarang static boleh memakai anggota private kelas luar, dan kelas luar boleh membaca private milik kelas bersarang
public class Main {
    private static int rahasia = 42;
    private static int jumlahAkses = 0;

    private static String sandi() {
        jumlahAkses++;
        return "S" + rahasia;
    }

    static class Brankas {
        private String isi;
        private int dibuka;

        Brankas(String isi) {
            this.isi = isi;
        }

        String buka(String kode) {
            if (!kode.equals(sandi())) {
                return "kode salah";
            }
            dibuka++;
            return isi;
        }
    }

    public static void main(String[] args) {
        Brankas b = new Brankas("emas 1 kg");
        System.out.println(b.buka("S41"));
        System.out.println(b.buka("S42"));
        rahasia = 7;
        System.out.println(b.buka("S42"));
        System.out.println(b.buka("S7"));
        System.out.println("isi dibaca langsung dari Main: " + b.isi);
        System.out.println("dibuka " + b.dibuka + " kali, sandi diakses " + jumlahAkses + " kali");
        b.isi = "kosong";
        System.out.println(b.buka("S7"));
    }
}
