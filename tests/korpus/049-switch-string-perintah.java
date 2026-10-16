// switch pada String: memproses daftar perintah, fall-through, dan default
public class Main {
    public static void main(String[] args) {
        String[] perintah = {"tambah", "tambah", "kurang", "reset", "TAMBAH", "kali", "lihat", "keluar", "tambah"};
        int nilai = 0;
        for (String p : perintah) {
            switch (p) {
                case "tambah":
                    nilai += 5;
                    System.out.println("tambah -> " + nilai);
                    break;
                case "kurang":
                    nilai -= 2;
                    System.out.println("kurang -> " + nilai);
                    break;
                case "kali":
                    nilai *= 3;
                case "lihat":
                    System.out.println("nilai sekarang " + nilai);
                    break;
                case "reset":
                    nilai = 0;
                    System.out.println("reset");
                    break;
                case "keluar":
                    System.out.println("keluar (tapi loop tetap jalan)");
                    break;
                default:
                    System.out.println("perintah tidak dikenal: " + p);
            }
        }
        System.out.println("Nilai akhir = " + nilai);
        String hari = "Sabtu";
        switch (hari) {
            case "Sabtu":
            case "Minggu":
                System.out.println(hari + " adalah akhir pekan");
                break;
            default:
                System.out.println(hari + " adalah hari kerja");
        }
    }
}
