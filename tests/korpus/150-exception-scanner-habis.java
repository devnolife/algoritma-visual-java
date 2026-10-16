// NoSuchElementException: Scanner.nextInt() saat masukan sudah habis
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Akan membaca " + n + " bilangan");
        int total = 0;
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            total += x;
            System.out.println("baca " + x + ", total " + total);
        }
        System.out.println("Total " + total);
    }
}
