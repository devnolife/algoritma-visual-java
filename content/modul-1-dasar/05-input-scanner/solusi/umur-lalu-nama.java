import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner masukan = new Scanner(System.in);
        int umur = masukan.nextInt();
        masukan.nextLine();
        String nama = masukan.nextLine();
        System.out.println(nama + " (" + umur + " tahun)");
    }
}
