// Error: hasil method void disimpan ke variabel int
public class Main {
    static void cetakTotal(int a, int b) {
        System.out.println(a + b);
    }

    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int total = cetakTotal(2, 3);
        System.out.println(total);
    }
}
