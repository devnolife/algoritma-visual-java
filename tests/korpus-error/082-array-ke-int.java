// Error: array disimpan ke variabel int (incompatible types: int[] cannot be converted to int)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int[] data = {3, 6, 9};
        int pertama = data;
        System.out.println(pertama);
    }
}
