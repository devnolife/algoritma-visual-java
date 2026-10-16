// FPB dan KPK iteratif dengan jejak langkah algoritma Euclid
public class Main {
    static int fpb(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b != 0) {
            System.out.println("    " + a + " = " + (a / b) + " x " + b + " + " + (a % b));
            int sisa = a % b;
            a = b;
            b = sisa;
        }
        return a;
    }

    static long kpk(int a, int b) {
        return (long) a / fpb(a, b) * b;
    }

    public static void main(String[] args) {
        int[][] pasangan = {{252, 105}, {17, 5}, {12, 18}, {-24, 36}};
        for (int[] p : pasangan) {
            System.out.println("FPB(" + p[0] + ", " + p[1] + "):");
            int hasil = fpb(p[0], p[1]);
            System.out.println("  = " + hasil);
        }
        System.out.println("KPK(4, 6) = " + kpk(4, 6));
        System.out.println("KPK(21, 6) = " + kpk(21, 6));
        System.out.println("KPK(100000, 99999) = " + kpk(100000, 99999));
        int[] data = {12, 18, 30};
        int f = data[0];
        for (int d : data) {
            int a = f, b = d;
            while (b != 0) {
                int s = a % b;
                a = b;
                b = s;
            }
            f = a;
        }
        System.out.println("FPB dari 12, 18, 30 = " + f);
    }
}
