// Scanner: nextLong, nextShort, nextByte, nextFloat, nextDouble (eksponen), nextInt dengan tanda +
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long jarak = sc.nextLong();
        short tahun = sc.nextShort();
        byte suhu = sc.nextByte();
        float berat = sc.nextFloat();
        double besar = sc.nextDouble();
        int positif = sc.nextInt();
        double bulat = sc.nextDouble();
        System.out.println("long  : " + jarak + " (x2 = " + jarak * 2 + ")");
        System.out.println("short : " + tahun);
        System.out.println("byte  : " + suhu);
        System.out.println("float : " + berat + " (/3 = " + berat / 3 + ")");
        System.out.println("double: " + besar);
        System.out.println("int   : " + positif);
        System.out.println("double dari token bulat: " + bulat);
        sc.close();
    }
}
