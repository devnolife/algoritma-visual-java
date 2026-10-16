// Error: pernyataan ditulis setelah throw sehingga tidak pernah tercapai (unreachable statement)
public class Main {
    static int bagi(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("pembagi nol");
            System.out.println("tidak akan tercetak");
        }
        return a / b;
    }

    public static void main(String[] args) {
        System.out.println(bagi(10, 2));
    }
}
