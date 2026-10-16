// Error: variabel hanya diisi di cabang if lalu dipakai (might not have been initialized)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int nilai = 70;
        String predikat;
        if (nilai >= 80) {
            predikat = "A";
        } else if (nilai >= 60) {
            predikat = "B";
        }
        System.out.println("Predikat: " + predikat);
    }
}
