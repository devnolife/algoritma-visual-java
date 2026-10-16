// Error: membandingkan dua String dengan operator - (bad operand types for binary operator '-')
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        String nama1 = "Andi";
        String nama2 = "Budi";
        if (nama1 - nama2 < 0) {
            System.out.println(nama1 + " lebih dulu");
        }
    }
}
