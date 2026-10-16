// Error: tipe kembalian method lupa ditulis (invalid method declaration; return type required)
public class Main {
    static hitungLuas(int sisi) {
        return sisi * sisi;
    }

    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        System.out.println("Luas persegi");
    }
}
