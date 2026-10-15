import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int nilai;
        int banyak = 0;

        do {
            nilai = sc.nextInt();
            banyak++;
        } while (nilai < 0 || nilai > 100);

        System.out.println("Nilai sah: " + nilai);
        System.out.println("Banyak input: " + banyak);
    }
}
