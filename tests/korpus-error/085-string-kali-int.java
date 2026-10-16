// Error: mengalikan String dengan int (bad operand types for binary operator '*')
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        String garis = "-";
        String panjang = garis * 10;
        System.out.println(panjang);
    }
}
