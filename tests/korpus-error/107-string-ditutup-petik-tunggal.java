// Error: string dibuka kutip ganda tetapi ditutup petik tunggal (unclosed string literal)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        String kota = "Makassar';
        System.out.println(kota);
    }
}
