// Scanner: token dipisah banyak spasi dan baris kosong, campuran next(), nextInt(), nextDouble()
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String terbaik = "";
        double ipkTerbaik = -1;
        int totalUmur = 0;
        for (int i = 0; i < 3; i++) {
            String nama = sc.next();
            int umur = sc.nextInt();
            double ipk = sc.nextDouble();
            totalUmur += umur;
            System.out.printf("%-6s umur %d, IPK %.2f%n", nama, umur, ipk);
            if (ipk > ipkTerbaik) {
                ipkTerbaik = ipk;
                terbaik = nama;
            }
        }
        System.out.println("IPK terbaik: " + terbaik + " (" + ipkTerbaik + ")");
        System.out.println("Rata-rata umur: " + totalUmur / 3.0);
        String sisa = sc.nextLine();
        System.out.println("Sisa baris: [" + sisa + "]");
        String kota = sc.nextLine();
        System.out.println("Baris berikut: [" + kota + "]");
    }
}
