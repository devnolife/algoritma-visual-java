// float vs double: pencetakan, presisi, dan pencampuran dalam konkatenasi
public class Main {
    public static void main(String[] args) {
        float f = 0.1f;
        double d = 0.1;
        System.out.println("0.1f            = " + f);
        System.out.println("0.1             = " + d);
        System.out.println("(double) 0.1f   = " + (double) f);
        System.out.println("(float) 0.1     = " + (float) d);
        System.out.println("1.0f / 3        = " + (1.0f / 3));
        System.out.println("1.0 / 3         = " + (1.0 / 3));
        System.out.println("0.1f + 0.2f     = " + (0.1f + 0.2f));
        System.out.println("0.1f + 0.2      = " + (0.1f + 0.2));
        System.out.println("1.1f * 1.1f     = " + (1.1f * 1.1f));
        System.out.println("16777216f + 1   = " + (16777216f + 1));
        System.out.println("(float) 16777217= " + (float) 16777217);
        System.out.println("1e10f           = " + 1e10f);
        System.out.println("3.4e38f * 10    = " + (3.4e38f * 10));
        System.out.println("100f            = " + 100f);
        System.out.println("1234567.0f      = " + 1234567.0f);
        System.out.println("12345678.0f     = " + 12345678.0f);
        System.out.println("0.001f          = " + 0.001f);
        System.out.println("0.0001f         = " + 0.0001f);
        System.out.println("f == d          = " + (f == d));
        System.out.println("f == (float) d  = " + (f == (float) d));
        float total = 0;
        for (int i = 0; i < 10; i++) {
            total += 0.1f;
        }
        System.out.println("Jumlah 10 x 0.1f = " + total);
        double totalD = 0;
        for (int i = 0; i < 10; i++) {
            totalD += 0.1;
        }
        System.out.println("Jumlah 10 x 0.1  = " + totalD);
        System.out.println("String.valueOf(2.5f) = " + String.valueOf(2.5f));
        float bagi = 10f / 4;
        System.out.println("10f / 4 = " + bagi);
        double luas = 3.14f * 2 * 2;
        System.out.println("3.14f * 2 * 2 sebagai double = " + luas);
        float kecil = 1.0f / 3 * 3;
        System.out.println("1.0f / 3 * 3 = " + kecil);
        System.out.println("(float) 1e40    = " + (float) 1e40);
        System.out.println("(float) 1e-50   = " + (float) 1e-50);
    }
}
