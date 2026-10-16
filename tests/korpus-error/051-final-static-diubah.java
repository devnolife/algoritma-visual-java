// Error: menaikkan field static final dengan ++ (cannot assign a value to final variable)
public class Main {
    static final double PAJAK = 0.11;
    static final int TAHUN = 2024;

    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        System.out.println(PAJAK);
        TAHUN++;
        System.out.println(TAHUN);
    }
}
