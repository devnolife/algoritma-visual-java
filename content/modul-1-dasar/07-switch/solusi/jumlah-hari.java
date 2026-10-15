import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int bulan = sc.nextInt();

        switch (bulan) {
            case 2 -> System.out.println("28 hari");
            case 4, 6, 9, 11 -> System.out.println("30 hari");
            case 1, 3, 5, 7, 8, 10, 12 ->
                System.out.println("31 hari");
            default -> System.out.println("Bulan tidak valid");
        }
    }
}
