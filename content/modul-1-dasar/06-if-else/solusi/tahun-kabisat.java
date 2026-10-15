import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int tahun = sc.nextInt();
        boolean kabisat = (tahun % 4 == 0 && tahun % 100 != 0)
                || tahun % 400 == 0;

        if (kabisat) {
            System.out.println(tahun + " tahun kabisat");
        } else {
            System.out.println(tahun + " bukan tahun kabisat");
        }
    }
}
