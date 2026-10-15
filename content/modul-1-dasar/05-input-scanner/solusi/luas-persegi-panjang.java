import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner masukan = new Scanner(System.in);
        int panjang = masukan.nextInt();
        int lebar = masukan.nextInt();
        int luas = panjang * lebar;
        System.out.println("Luas: " + luas);
    }
}
