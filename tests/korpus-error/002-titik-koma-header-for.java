// Error: titik koma hilang di header for (';' expected)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int jumlah = 0;
        for (int i = 0 i < 5; i++) {
            jumlah += i;
        }
        System.out.println(jumlah);
    }
}
