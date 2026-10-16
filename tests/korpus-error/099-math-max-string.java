// Error: Math.max dengan argumen String (no suitable method found for max(String,int))
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        String masukan = "5";
        int terbesar = Math.max(masukan, 3);
        System.out.println(terbesar);
    }
}
