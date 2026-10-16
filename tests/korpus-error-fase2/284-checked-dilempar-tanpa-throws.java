// Error: exception checked dilempar tanpa ditangkap dan tanpa throws (unreported exception Exception; must be caught or declared to be thrown)
public class Main {
    static void validasiUmur(int umur) {
        if (umur < 0) {
            throw new Exception("umur tidak boleh negatif");
        }
        System.out.println("umur valid: " + umur);
    }

    public static void main(String[] args) {
        validasiUmur(20);
    }
}
