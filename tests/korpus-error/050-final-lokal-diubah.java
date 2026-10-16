// Error: mengubah konstanta lokal final (cannot assign a value to final variable MAKS)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        final int MAKS = 10;
        System.out.println("Maks: " + MAKS);
        MAKS = 20;
        System.out.println("Maks baru: " + MAKS);
    }
}
