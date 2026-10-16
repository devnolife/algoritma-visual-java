// Error: method diakhiri titik koma tanpa badan (missing method body, or declare abstract)
public class Main {
    static void cetakGaris();

    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        System.out.println("Laporan");
    }
}
