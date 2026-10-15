import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner masukan = new Scanner(System.in);  // #scanner
        String nama = masukan.nextLine();
        double tinggi = masukan.nextDouble();
        int umur = masukan.nextInt();              // #token
        masukan.nextLine();                        // #sisaEnter
        String kota = masukan.nextLine();
        System.out.println("Halo, " + nama + "!");
        System.out.println(umur + " tahun, " + tinggi + " m");
        System.out.println("Asal: " + kota);
    }
}
