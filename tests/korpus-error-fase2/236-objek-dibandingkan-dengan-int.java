// Error: objek dibandingkan langsung dengan angka (bad operand types for binary operator '==')
public class Main {
    static class Nilai {
        int angka;

        Nilai(int angka) {
            this.angka = angka;
        }
    }

    public static void main(String[] args) {
        Nilai n = new Nilai(100);
        if (n == 100) {
            System.out.println("sempurna");
        }
    }
}
