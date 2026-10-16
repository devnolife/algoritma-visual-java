// Scanner: menjumlahkan bilangan dengan hasNextInt() sampai token bukan bilangan
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int jumlah = 0;
        int banyak = 0;
        int maks = Integer.MIN_VALUE;
        while (sc.hasNextInt()) {
            int x = sc.nextInt();
            jumlah += x;
            banyak++;
            if (x > maks) {
                maks = x;
            }
        }
        System.out.println("Banyak bilangan: " + banyak);
        System.out.println("Jumlah: " + jumlah);
        System.out.println("Maksimum: " + maks);
        System.out.printf("Rata-rata: %.3f%n", (double) jumlah / banyak);
        if (sc.hasNext()) {
            String penutup = sc.next();
            System.out.println("Token penghenti: " + penutup);
        }
        System.out.println("Masih ada token? " + sc.hasNext());
    }
}
