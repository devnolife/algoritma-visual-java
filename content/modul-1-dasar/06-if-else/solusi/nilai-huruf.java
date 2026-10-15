import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int nilai = sc.nextInt();
        char huruf;

        if (nilai >= 85) {
            huruf = 'A';
        } else if (nilai >= 70) {
            huruf = 'B';
        } else if (nilai >= 55) {
            huruf = 'C';
        } else if (nilai >= 40) {
            huruf = 'D';
        } else {
            huruf = 'E';
        }
        System.out.println("Nilai huruf: " + huruf);
    }
}
