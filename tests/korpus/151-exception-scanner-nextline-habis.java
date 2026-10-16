// NoSuchElementException: Scanner.nextLine() setelah baris terakhir ("No line found")
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int nomor = 1;
        System.out.println("Membaca semua baris tanpa memeriksa hasNextLine()");
        while (true) {
            String baris = sc.nextLine();
            System.out.println(nomor + ": " + baris.toUpperCase() + " (" + baris.length() + ")");
            nomor++;
        }
    }
}
