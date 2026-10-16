// Error: titik koma hilang di akhir deklarasi variabel (';' expected)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int panjang = 12;
        int lebar = 5
        int luas = panjang * lebar;
        System.out.println("Luas = " + luas);
    }
}
