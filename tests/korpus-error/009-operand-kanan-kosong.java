// Error: operand kanan perbandingan di if kosong (illegal start of expression)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int x = 3;
        if (x > ) {
            System.out.println("x besar");
        }
    }
}
