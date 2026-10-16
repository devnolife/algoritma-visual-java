// Scanner: jebakan nextInt() lalu nextLine() mengembalikan sisa baris yang kosong
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Umur: ");
        int umur = sc.nextInt();
        System.out.print("Nama: ");
        String sisa = sc.nextLine();
        String nama = sc.nextLine();
        System.out.println();
        System.out.println("Sisa baris setelah nextInt: [" + sisa + "] panjang " + sisa.length());
        System.out.println("Nama: " + nama + ", umur " + umur);
        String kota = sc.next();
        int anak = sc.nextInt();
        System.out.println("Kota: " + kota + ", jumlah anak: " + anak);
        String akhir = sc.nextLine();
        System.out.println("nextLine setelah nextInt terakhir: [" + akhir + "]");
        String kalimat = sc.nextLine();
        System.out.println("Kalimat lengkap: [" + kalimat + "]");
        System.out.println("Masih ada baris? " + sc.hasNextLine());
        sc.close();
    }
}
