// Error: literal int melebihi jangkauan int (integer number too large)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int populasi = 3000000000;
        System.out.println(populasi);
    }
}
