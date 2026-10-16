// Error: menjumlahkan boolean dengan int (bad operand types for binary operator '+')
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        boolean hadir = true;
        int poin = hadir + 1;
        System.out.println(poin);
    }
}
