// Scanner: hasNext, hasNextInt, hasNextDouble untuk memilah token angka dan kata
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int jumlahInt = 0;
        double jumlahDouble = 0;
        String kata = "";
        int banyakToken = 0;
        while (sc.hasNext()) {
            banyakToken++;
            if (sc.hasNextInt()) {
                int x = sc.nextInt();
                jumlahInt += x;
                System.out.println("int    : " + x);
            } else if (sc.hasNextDouble()) {
                double d = sc.nextDouble();
                jumlahDouble += d;
                System.out.println("double : " + d);
            } else {
                String w = sc.next();
                kata += w.toUpperCase() + " ";
                System.out.println("kata   : " + w);
            }
        }
        System.out.println("Token: " + banyakToken + ", jumlah int: " + jumlahInt + ", jumlah double: " + jumlahDouble);
        System.out.println("Kata: " + kata.trim());
    }
}
