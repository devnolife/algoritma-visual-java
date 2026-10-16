// Error: memanggil method yang belum dibuat (cannot find symbol: method)
public class Main {
    static double luasLingkaran(double r) {
        return Math.PI * r * r;
    }

    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        System.out.println(luasLingkaran(2));
        System.out.println(kelilingLingkaran(2));
    }
}
