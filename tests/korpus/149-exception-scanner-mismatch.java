// InputMismatchException: Scanner.nextInt() menemukan token bukan bilangan
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int total = 0;
        for (int i = 1; i <= 4; i++) {
            System.out.print("Bilangan ke-" + i + ": ");
            int x = sc.nextInt();
            total += x;
            System.out.println(x + " (total " + total + ")");
        }
        System.out.println("Total " + total);
    }
}
