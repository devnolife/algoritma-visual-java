import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner masukan = new Scanner(System.in);
        String kata = masukan.next();
        String balik = "";
        for (int i = kata.length() - 1; i >= 0; i--) {
            balik += kata.charAt(i);   // #balik
        }
        if (kata.equals(balik)) {
            System.out.println(kata + " adalah palindrom");
        } else {
            System.out.println(kata + " bukan palindrom");
        }
    }
}
