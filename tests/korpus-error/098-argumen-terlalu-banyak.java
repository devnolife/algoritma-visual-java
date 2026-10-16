// Error: argumen terlalu banyak (method luas in class Main cannot be applied to given types)
public class Main {
    static int luas(int panjang, int lebar) {
        return panjang * lebar;
    }

    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int hasil = luas(2, 3, 4);
        System.out.println(hasil);
    }
}
