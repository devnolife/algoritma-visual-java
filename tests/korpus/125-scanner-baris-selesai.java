// Scanner: membaca baris demi baris sampai pengguna mengetik "selesai"
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int nomor = 0;
        int totalKata = 0;
        int totalKarakter = 0;
        while (true) {
            String baris = sc.nextLine();
            if (baris.equals("selesai")) {
                break;
            }
            nomor++;
            String bersih = baris.trim();
            int kata = bersih.isEmpty() ? 0 : bersih.split("\\s+").length;
            totalKata += kata;
            totalKarakter += baris.length();
            System.out.println(nomor + ". [" + baris + "] -> " + kata + " kata, " + baris.length() + " karakter");
        }
        System.out.println("Total baris: " + nomor + ", kata: " + totalKata + ", karakter: " + totalKarakter);
        System.out.println("Baris berikutnya masih ada? " + sc.hasNextLine());
    }
}
