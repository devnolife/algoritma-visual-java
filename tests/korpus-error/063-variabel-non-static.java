// Error: field tanpa static dipakai di main (non-static variable jumlah cannot be referenced from a static context)
public class Main {
    int jumlah = 0;

    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        jumlah = 10;
        System.out.println("selesai");
    }
}
