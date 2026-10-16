// Error: titik koma hilang setelah System.out.println (';' expected)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        String nama = "Budi";
        System.out.println("Halo, " + nama)
        System.out.println("Selamat belajar");
    }
}
