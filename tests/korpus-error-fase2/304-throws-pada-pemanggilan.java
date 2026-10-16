// Error: kata throws ditulis pada pemanggilan method, bukan pada deklarasi (';' expected)
public class Main {
    static int bagi(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        int hasil = bagi(10, 0) throws ArithmeticException;
        System.out.println(hasil);
    }
}
