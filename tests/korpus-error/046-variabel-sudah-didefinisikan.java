// Error: mendeklarasikan ulang variabel dengan nama sama (variable x is already defined in method main(String[]))
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int x = 1;
        System.out.println(x);
        int x = 2;
        System.out.println(x);
    }
}
