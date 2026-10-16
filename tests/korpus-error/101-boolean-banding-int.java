// Error: membandingkan boolean dengan angka 1 (incomparable types: boolean and int)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        boolean aktif = true;
        if (aktif == 1) {
            System.out.println("aktif");
        }
    }
}
