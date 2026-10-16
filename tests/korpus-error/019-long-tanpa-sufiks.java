// Error: literal besar untuk long tanpa sufiks L (integer number too large)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.println("Mulai");
        cetakInfo("Latihan " + 1, 2);
        long jarakKeMatahari = 149600000000;
        System.out.println(jarakKeMatahari + " meter");
    }
}
