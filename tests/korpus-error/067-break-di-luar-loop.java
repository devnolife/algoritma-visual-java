// Error: break di dalam if tanpa loop atau switch (break outside switch or loop)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int saldo = 50;
        if (saldo < 100) {
            System.out.println("saldo kurang");
            break;
        }
        System.out.println("lanjut");
    }
}
