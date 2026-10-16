// Fibonacci iteratif dengan int dan long: int meluap setelah suku ke-46
public class Main {
    public static void main(String[] args) {
        int a = 0, b = 1;
        long x = 0, y = 1;
        for (int i = 0; i <= 50; i++) {
            if (i <= 10 || i >= 44) {
                System.out.println("F(" + i + ") int = " + a + ", long = " + x + (a != x ? "  <- int meluap" : ""));
            }
            int c = a + b;
            a = b;
            b = c;
            long z = x + y;
            x = y;
            y = z;
        }
        long p = 0, q = 1;
        int suku = 0;
        while (q > 0) {
            long r = p + q;
            p = q;
            q = r;
            suku++;
        }
        System.out.println("long meluap pada iterasi ke-" + suku + ", nilai " + q);
        double rasio = 1;
        long f1 = 1, f2 = 1;
        for (int i = 0; i < 30; i++) {
            long f3 = f1 + f2;
            f1 = f2;
            f2 = f3;
            rasio = (double) f2 / f1;
        }
        System.out.println("Rasio emas mendekati " + rasio);
        System.out.println("(1 + sqrt(5)) / 2  = " + (1 + Math.sqrt(5)) / 2);
    }
}
