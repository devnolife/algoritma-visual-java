// Error: jumlah argumen tidak sesuai parameter (method luas in class Main cannot be applied to given types)
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
        System.out.println(luas(5));
    }
}
