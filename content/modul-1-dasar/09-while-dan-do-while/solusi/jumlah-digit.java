import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int bilangan = sc.nextInt();
        int jumlahDigit = 0;

        while (bilangan > 0) {
            jumlahDigit = jumlahDigit + bilangan % 10;
            bilangan = bilangan / 10;
        }
        System.out.println("Jumlah digit: " + jumlahDigit);
    }
}
