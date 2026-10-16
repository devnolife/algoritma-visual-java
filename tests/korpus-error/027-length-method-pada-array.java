// Error: memanggil length() pada array (cannot find symbol: method length())
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int[] nilai = {80, 90, 70};
        int total = 0;
        for (int i = 0; i < nilai.length(); i++) {
            total += nilai[i];
        }
        System.out.println(total);
    }
}
