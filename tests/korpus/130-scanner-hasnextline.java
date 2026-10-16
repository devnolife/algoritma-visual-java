// Scanner: membaca semua baris dengan hasNextLine termasuk baris kosong dan spasi di ujung
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int nomor = 0;
        int kosong = 0;
        String terpanjang = "";
        while (sc.hasNextLine()) {
            String baris = sc.nextLine();
            nomor++;
            if (baris.isEmpty()) {
                kosong++;
            }
            if (baris.length() > terpanjang.length()) {
                terpanjang = baris;
            }
            System.out.printf("%2d|%s|%d%n", nomor, baris, baris.length());
        }
        System.out.println("Jumlah baris: " + nomor + ", baris kosong: " + kosong);
        System.out.println("Terpanjang (setelah trim): " + terpanjang.trim());
    }
}
