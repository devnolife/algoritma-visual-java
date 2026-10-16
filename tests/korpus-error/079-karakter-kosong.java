// Error: literal karakter kosong (empty character literal)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.println("Mulai");
        cetakInfo("Latihan " + 1, 2);
        char pemisah = '';
        System.out.println("a" + pemisah + "b");
    }
}
