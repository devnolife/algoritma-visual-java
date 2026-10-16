// Error: return tanpa nilai di method bertipe int (missing return value)
public class Main {
    static int bagi(int a, int b) {
        if (b == 0) {
            return;
        }
        return a / b;
    }

    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        System.out.println(bagi(10, 2));
    }
}
