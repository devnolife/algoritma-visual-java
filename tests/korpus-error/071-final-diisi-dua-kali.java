// Error: variabel final diisi dua kali (variable batas might already have been assigned)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        final int batas;
        batas = 10;
        System.out.println(batas);
        batas = 20;
        System.out.println(batas);
    }
}
