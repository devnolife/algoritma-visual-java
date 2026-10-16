// Error: kurung tutup println hilang setelah ekspresi berkurung
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int a = 3;
        int b = 4;
        System.out.println("Hasil: " + (a + b);
    }
}
