// Error: literal char disimpan ke String (incompatible types: char cannot be converted to String)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        String inisial = 'B';
        System.out.println(inisial);
    }
}
