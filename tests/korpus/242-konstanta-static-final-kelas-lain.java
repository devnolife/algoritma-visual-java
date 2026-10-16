// Konstanta public static final di kelas lain dipakai lewat NamaKelas.KONSTANTA; array static final tetap bisa diubah isinya
public class Main {
    public static void main(String[] args) {
        System.out.println("PI kira-kira " + Konstanta.PI_KASAR + ", gravitasi " + Konstanta.GRAVITASI);
        System.out.println("Nama aplikasi: " + Konstanta.NAMA_APLIKASI + " v" + Konstanta.VERSI);
        double t = 3.0;
        double jarak = 0.5 * Konstanta.GRAVITASI * t * t;
        System.out.println("Benda jatuh " + t + " detik menempuh " + jarak + " meter");
        System.out.println("Luas lingkaran r=10: " + Konstanta.PI_KASAR * 10 * 10);
        System.out.println("Hari kerja: " + Konstanta.HARI_KERJA.length + " hari, pertama " + Konstanta.HARI_KERJA[0]);
        Konstanta.HARI_KERJA[0] = "Minggu";
        System.out.println("Isi array final diubah: pertama sekarang " + Konstanta.HARI_KERJA[0]);
        System.out.println("Batas: " + Konstanta.MIN_NILAI + ".." + Konstanta.MAKS_NILAI + ", lulus >= " + Konstanta.BATAS_LULUS);
        int[] nilai = {45, 60, 59, 100, 101, -3};
        for (int n : nilai) {
            String status;
            if (n < Konstanta.MIN_NILAI || n > Konstanta.MAKS_NILAI) {
                status = "tidak valid";
            } else if (n >= Konstanta.BATAS_LULUS) {
                status = "lulus";
            } else {
                status = "mengulang";
            }
            System.out.println("  " + n + ": " + status);
        }
    }
}

class Konstanta {
    public static final double PI_KASAR = 3.14;
    public static final double GRAVITASI = 9.8;
    public static final String NAMA_APLIKASI = "Kalkulus Mini";
    public static final int VERSI = 2;
    public static final int MIN_NILAI = 0;
    public static final int MAKS_NILAI = 100;
    public static final int BATAS_LULUS = MAKS_NILAI * 6 / 10;
    public static final String[] HARI_KERJA = {"Senin", "Selasa", "Rabu", "Kamis", "Jumat"};
}
