// Error: variabel int (bukan konstanta) disimpan ke char (possible lossy conversion from int to char)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int kode = 65;
        char huruf = kode;
        System.out.println(huruf);
    }
}
