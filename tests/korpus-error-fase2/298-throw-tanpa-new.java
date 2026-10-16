// Error: exception dilempar tanpa kata kunci new (cannot find symbol, symbol: method IllegalArgumentException(String))
public class Main {
    static void setNilai(int n) {
        if (n < 0 || n > 100) {
            throw IllegalArgumentException("nilai di luar 0-100: " + n);
        }
        System.out.println("nilai " + n);
    }

    public static void main(String[] args) {
        setNilai(85);
    }
}
