// Error: InputMismatchException dipakai tanpa import java.util.InputMismatchException (cannot find symbol, symbol: class InputMismatchException)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            int umur = sc.nextInt();
            System.out.println(umur);
        } catch (InputMismatchException e) {
            System.out.println("harus angka");
        }
    }
}
