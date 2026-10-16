// Scanner: membaca dua bilangan bulat dan satu pecahan lalu menghitung
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Masukkan dua bilangan: ");
        int a = input.nextInt();
        int b = input.nextInt();
        System.out.print("Masukkan faktor: ");
        double faktor = input.nextDouble();
        System.out.println();
        System.out.println(a + " + " + b + " = " + (a + b));
        System.out.println(a + " - " + b + " = " + (a - b));
        System.out.println(a + " / " + b + " = " + (a / b));
        System.out.println(a + " % " + b + " = " + (a % b));
        System.out.println("(" + a + " + " + b + ") * " + faktor + " = " + (a + b) * faktor);
        input.close();
    }
}
