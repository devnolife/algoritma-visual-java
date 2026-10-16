// Error: hasil perbandingan boolean disimpan ke int (incompatible types: boolean cannot be converted to int)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int nilai = 75;
        int lulus = nilai >= 60;
        System.out.println(lulus);
    }
}
