// Error: memakai Scanner tanpa import java.util.Scanner (cannot find symbol: class Scanner)
public class Main {
    static int bacaAngka(Scanner masukan) {
        return masukan.nextInt();
    }

    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        System.out.println("Program membaca angka");
    }
}
