// Error: argumen String untuk parameter int pada method tunggal (incompatible types: String cannot be converted to int)
public class Main {
    static int kuadrat(int n) {
        return n * n;
    }

    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        String masukan = "7";
        System.out.println(kuadrat(masukan));
    }
}
