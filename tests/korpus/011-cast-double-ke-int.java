// Cast double ke int/long: pemotongan, NaN, Infinity, dan nilai di luar jangkauan
public class Main {
    public static void main(String[] args) {
        System.out.println("(int) 3.99      = " + (int) 3.99);
        System.out.println("(int) -3.99     = " + (int) -3.99);
        System.out.println("(int) 0.9999    = " + (int) 0.9999);
        System.out.println("(int) NaN       = " + (int) Double.NaN);
        System.out.println("(long) NaN      = " + (long) Double.NaN);
        System.out.println("(int) +Inf      = " + (int) Double.POSITIVE_INFINITY);
        System.out.println("(int) -Inf      = " + (int) Double.NEGATIVE_INFINITY);
        System.out.println("(long) +Inf     = " + (long) Double.POSITIVE_INFINITY);
        System.out.println("(int) 1e10      = " + (int) 1e10);
        System.out.println("(int) -1e10     = " + (int) -1e10);
        System.out.println("(long) 1e19     = " + (long) 1e19);
        System.out.println("(long) -1e19    = " + (long) -1e19);
        System.out.println("(short) 1e10    = " + (short) 1e10);
        System.out.println("(byte) 300.7    = " + (byte) 300.7);
        System.out.println("(char) 65.9     = " + (char) 65.9);
        System.out.println("(int) 2.5f      = " + (int) 2.5f);
        System.out.println("(int) -0.5      = " + (int) -0.5);
        System.out.println("(long) 1e18 + 1 = " + ((long) 1e18 + 1));
        double nilai = 87.65;
        int bulat = (int) nilai;
        int dibulatkan = (int) Math.round(nilai);
        System.out.println("Nilai " + nilai + " -> potong " + bulat + ", bulatkan " + dibulatkan);
        double persen = 0.29;
        System.out.println("(int) (0.29 * 100) = " + (int) (persen * 100));
        System.out.println("(int) 0.29 * 100   = " + (int) persen * 100);
        float f = 1e10f;
        System.out.println("(int) 1e10f     = " + (int) f);
        System.out.println("(int) (char) -1 = " + (int) (char) -1);
        double nol = 0;
        System.out.println("(int) (1 / nol) = " + (int) (1 / nol));
        System.out.println("(int) 'A' / 2.0 = " + (int) 'A' / 2.0);
    }
}
