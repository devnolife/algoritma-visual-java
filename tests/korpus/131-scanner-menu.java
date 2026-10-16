// Scanner: menu ATM berulang dengan do-while dan switch sampai pilihan 0
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long saldo = 100000;
        int pilihan;
        do {
            System.out.println("Menu: 1 Setor | 2 Tarik | 3 Saldo | 0 Keluar");
            System.out.print("Pilih: ");
            pilihan = sc.nextInt();
            System.out.println(pilihan);
            switch (pilihan) {
                case 1 -> {
                    int setor = sc.nextInt();
                    saldo += setor;
                    System.out.println("Setor " + setor + " berhasil");
                }
                case 2 -> {
                    int tarik = sc.nextInt();
                    if (tarik > saldo) {
                        System.out.println("Saldo tidak cukup untuk menarik " + tarik);
                    } else {
                        saldo -= tarik;
                        System.out.println("Tarik " + tarik + " berhasil");
                    }
                }
                case 3 -> System.out.println("Saldo: " + saldo);
                case 0 -> System.out.println("Terima kasih");
                default -> System.out.println("Pilihan tidak valid");
            }
        } while (pilihan != 0);
        System.out.println("Saldo akhir: " + saldo);
    }
}
