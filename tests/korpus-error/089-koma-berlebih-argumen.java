// Error: koma berlebih dalam daftar argumen (illegal start of expression)
public class Main {
    static int tambah(int a, int b) {
        return a + b;
    }

    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        System.out.println(tambah(1, ));
    }
}
