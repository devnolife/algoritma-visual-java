// Error: pernyataan setelah while (true) tanpa break (unreachable statement)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int hitung = 0;
        while (true) {
            hitung++;
            System.out.println(hitung);
        }
        System.out.println("selesai");
    }
}
