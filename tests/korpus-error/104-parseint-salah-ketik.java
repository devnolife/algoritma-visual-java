// Error: salah ketik Integer.parseInt menjadi parseint (cannot find symbol: method parseint(String))
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        String teks = "42";
        int angka = Integer.parseint(teks);
        System.out.println(angka + 1);
    }
}
