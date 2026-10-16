// Error: variabel lokal bernama sama dengan parameter (variable n is already defined in method faktorial(int))
public class Main {
    static long faktorial(int n) {
        int n = 5;
        long hasil = 1;
        for (int i = 2; i <= n; i++) {
            hasil *= i;
        }
        return hasil;
    }

    public static void main(String[] args) {
        System.out.println(faktorial(5));
    }
}
