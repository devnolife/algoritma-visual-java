// Error: kondisi if berupa int (incompatible types: int cannot be converted to boolean)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int jumlah = 3;
        if (jumlah) {
            System.out.println("ada data");
        }
    }
}
