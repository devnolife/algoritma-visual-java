// Error: memanggil method pada nilai int (int cannot be dereferenced)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int angka = 12345;
        int digit = angka.length();
        System.out.println(digit);
    }
}
