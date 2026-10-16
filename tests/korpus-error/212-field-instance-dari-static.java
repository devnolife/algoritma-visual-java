// Error: field instance dipakai dari method static (non-static variable jumlahPeserta cannot be referenced from a static context)
public class Main {
    int jumlahPeserta = 0;

    static void daftar(String nama) {
        jumlahPeserta++;
        System.out.println(nama + " terdaftar");
    }

    public static void main(String[] args) {
        daftar("Ani");
    }
}
