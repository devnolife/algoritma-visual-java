// Error: melempar objek kelas biasa yang bukan Throwable (incompatible types: Peringatan cannot be converted to Throwable)
public class Main {
    static class Peringatan {
        String pesan;

        Peringatan(String pesan) {
            this.pesan = pesan;
        }
    }

    static void periksa(int suhu) {
        if (suhu > 40) {
            throw new Peringatan("suhu terlalu tinggi");
        }
        System.out.println("suhu aman");
    }

    public static void main(String[] args) {
        periksa(37);
    }
}
