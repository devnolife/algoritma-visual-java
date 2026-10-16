// Error: parameter method tanpa nama (<identifier> expected)
public class Main {
    static int kuadrat(int) {
        return 0;
    }

    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        System.out.println("Program kuadrat");
    }
}
