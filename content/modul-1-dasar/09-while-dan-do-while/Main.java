import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int jumlah = 0;

        int angka = sc.nextInt();
        while (angka != 0) {                // #cekAwal
            jumlah = jumlah + angka;
            angka = sc.nextInt();           // #maju
        }
        System.out.println("Jumlah: " + jumlah);

        int hitung = 3;
        do {
            System.out.println("Hitung mundur: " + hitung);
            hitung--;
        } while (hitung > 0);               // #cekAkhir
    }
}
