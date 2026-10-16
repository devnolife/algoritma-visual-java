// Error: ekspresi penjumlahan berdiri sendiri (not a statement)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int x = 5;
        x + 1;
        System.out.println(x);
    }
}
