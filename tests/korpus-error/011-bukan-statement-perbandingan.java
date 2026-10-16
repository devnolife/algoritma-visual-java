// Error: perbandingan == dipakai sebagai pernyataan (not a statement)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int nilai = 80;
        nilai == 100;
        System.out.println(nilai);
    }
}
