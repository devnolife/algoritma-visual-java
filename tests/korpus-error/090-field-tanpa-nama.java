// Error: field static tanpa nama (<identifier> expected)
public class Main {
    static int = 100;

    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        System.out.println("nilai awal");
    }
}
