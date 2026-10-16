// switch dengan label konstanta static final int dan char
public class Main {
    static final int MENU_TAMBAH = 1;
    static final int MENU_HAPUS = 2;
    static final int MENU_CARI = 3;
    static final int MENU_KELUAR = 9;
    static final char HURUF_YA = 'Y';

    static String namaMenu(int kode) {
        String hasil;
        switch (kode) {
            case MENU_TAMBAH:
                hasil = "Tambah data";
                break;
            case MENU_HAPUS:
                hasil = "Hapus data";
                break;
            case MENU_CARI:
                hasil = "Cari data";
                break;
            case MENU_KELUAR:
                hasil = "Keluar";
                break;
            case MENU_TAMBAH + 10:
                hasil = "Tambah massal";
                break;
            default:
                hasil = "Tidak dikenal";
        }
        return hasil;
    }

    public static void main(String[] args) {
        int[] kode = {1, 3, 2, 11, 9, 4};
        for (int k : kode) {
            System.out.println(k + " = " + namaMenu(k));
        }
        final int LOKAL = 5;
        int pilihan = 5;
        switch (pilihan) {
            case LOKAL:
                System.out.println("Cocok dengan konstanta lokal final");
                break;
            default:
                System.out.println("Tidak cocok");
        }
        char jawab = 'Y';
        switch (jawab) {
            case HURUF_YA -> System.out.println("Jawaban ya");
            case 'N' -> System.out.println("Jawaban tidak");
            default -> System.out.println("Tidak jelas");
        }
    }
}
