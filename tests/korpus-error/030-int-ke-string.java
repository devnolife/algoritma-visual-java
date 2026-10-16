// Error: memberi nilai int ke variabel String (incompatible types: int cannot be converted to String)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int nomor = 123;
        String kode = nomor;
        System.out.println(kode);
    }
}
