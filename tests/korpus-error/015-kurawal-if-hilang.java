// Error: kurung kurawal penutup blok if hilang di method terakhir (reached end of file while parsing)
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
        int x = 4;
        if (x > 0) {
            System.out.println(kuadrat(x));
        System.out.println("selesai");
    }
}
