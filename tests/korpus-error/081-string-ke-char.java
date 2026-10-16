// Error: String dengan kutip ganda disimpan ke char (incompatible types: String cannot be converted to char)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        char nilai = "A";
        System.out.println(nilai);
    }
}
