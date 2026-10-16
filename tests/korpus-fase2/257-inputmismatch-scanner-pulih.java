// InputMismatchException dari Scanner.nextInt ditangkap; token salah dibuang dengan next() lalu pembacaan dilanjutkan
import java.util.InputMismatchException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int jumlah = 0;
        int total = 0;
        int salah = 0;
        while (sc.hasNext()) {
            try {
                int n = sc.nextInt();
                jumlah++;
                total += n;
                System.out.println("baca " + n + " (total " + total + ")");
            } catch (InputMismatchException e) {
                String buang = sc.next();
                salah++;
                System.out.println("lewati \"" + buang + "\": " + e);
            }
        }
        System.out.println(jumlah + " bilangan, total " + total + ", " + salah + " token salah");
    }
}
