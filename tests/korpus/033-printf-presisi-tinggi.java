// %f dengan presisi tinggi dan bilangan besar: Java memakai digit terpendek lalu menambah nol
public class Main {
    public static void main(String[] args) {
        System.out.printf("%.20f%n", 0.1);
        System.out.printf("%.17f%n", 1.0 / 3);
        System.out.printf("%.15f%n", 2.0 / 3);
        System.out.printf("%.10f%n", Math.PI);
        System.out.printf("%.18f%n", Math.E);
        System.out.printf("%f%n", 1e-7);
        System.out.printf("%.0f%n", 1e20);
        System.out.printf("%.3f%n", 1e15 + 0.3);
        System.out.printf("%f%n", 123456789.123456789);
        System.out.printf("%.1f%n", 0.95);
        System.out.printf("%.2f%n", 0.995);
        System.out.printf("%d%n", Long.MAX_VALUE);
        System.out.printf("%,d%n", Long.MIN_VALUE);
        System.out.printf("%.2f%n", (double) Long.MAX_VALUE);
        System.out.printf("%f%n", Double.MAX_VALUE);
        System.out.printf("%.3f%n", Double.MIN_VALUE);
        System.out.printf("%.12f%n", 1.0 / 7);
        System.out.printf("%.5f%n", 2.000005);
        System.out.printf("%.5f%n", 2.0000049999);
        System.out.printf("%.3f%n", 0.0005);
        System.out.printf("%.3f%n", 0.00049);
    }
}
