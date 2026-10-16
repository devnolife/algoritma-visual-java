// Error: memberi nilai String ke variabel int (incompatible types: String cannot be converted to int)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int umur = "20";
        System.out.println(umur + 1);
    }
}
