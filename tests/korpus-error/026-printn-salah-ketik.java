// Error: salah ketik println menjadi printn (cannot find symbol: method printn(String))
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        System.out.println("Mulai");
        catat("Program dimulai");
        System.out.printn("Halo dunia");
    }
}
