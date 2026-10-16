// Error: operator && pada dua int (bad operand types for binary operator '&&')
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int a = 1;
        int b = 0;
        if (a && b) {
            System.out.println("keduanya benar");
        }
    }
}
