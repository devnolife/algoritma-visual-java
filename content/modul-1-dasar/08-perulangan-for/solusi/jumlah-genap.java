import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int jumlah = 0;

        for (int i = 1; i <= n; i++) {
            if (i % 2 == 0) {
                jumlah = jumlah + i;
            }
        }
        System.out.println("Total: " + jumlah);
    }
}
