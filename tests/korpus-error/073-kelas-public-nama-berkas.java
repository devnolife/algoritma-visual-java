// Error: kelas public bernama Kalkulator di berkas Main.java (should be declared in a file named Kalkulator.java)
public class Kalkulator {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int a = 6;
        int b = 7;
        System.out.println(a * b);
    }
}
