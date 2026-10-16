// String.format membangun tabel: %-12.10s, %6d, %,15.2f, %.3s, dan %s untuk berbagai tipe
public class Main {
    public static void main(String[] args) {
        String[] nama = {"Budi", "Siti Aminah", "Joko", "Rina"};
        int[] jumlah = {3, 12, 7, 150};
        double[] harga = {15000.5, 2500.0, 99999.999, 0.5};
        String garis = "-".repeat(36);
        System.out.println(garis);
        System.out.println(String.format("%-12s|%6s|%15s", "Nama", "Qty", "Harga"));
        System.out.println(garis);
        for (int i = 0; i < nama.length; i++) {
            String baris = String.format("%-12.10s|%6d|%,15.2f", nama[i], jumlah[i], harga[i]);
            System.out.println(baris);
        }
        System.out.println(garis);
        System.out.println(String.format("%s %s %s %s", 1, 2.5, 'c', true));
        String kosong = null;
        System.out.println(String.format("[%s] [%5s] [%-6s]", kosong, true, 'x'));
        System.out.println(String.format("[%.3s] [%8.3s]", "abcdef", "abcdef"));
        System.out.println(String.format("%s|%s|%s", 1.0f, 100.0, 1e-5));
        String ringkas = String.format("%d item, total %.1f", 4, 172.0);
        System.out.println(ringkas + " (" + ringkas.length() + " karakter)");
        System.out.println(String.format("%s", 10L * 3) + String.format("%s", 7 / 2));
    }
}
