// Pembulatan %.2f gaya Java (HALF_UP): 0.125, 2.675, 1.005, 0.5, 1.5, 2.5
public class Main {
    public static void main(String[] args) {
        double[] uji = {0.125, 0.135, 2.675, 1.005, 1.115, 0.5, 1.5, 2.5, -2.5, 0.045, 1.0 / 3, 2.0 / 3, 99.995};
        for (double x : uji) {
            System.out.printf("%-20s %%.2f=%.2f  %%.1f=%.1f  %%.0f=%.0f%n", x, x, x, x);
        }
        System.out.printf("%.3f%n", 1.0005);
        System.out.printf("%.2f%n", -0.001);
        System.out.printf("%.2f%n", 0.004999);
        System.out.printf("%.2f%n", 1e-10);
        System.out.printf("%.1f%n", 0.05);
        System.out.printf("%.1f%n", 0.15);
        System.out.printf("%.1f%n", 0.25);
        System.out.printf("%.1f%n", 0.35);
        System.out.printf("%f%n", 3.14159265358979);
        System.out.printf("%.4f%n", 2.0);
        System.out.printf("%.2f%n", 100.0);
        System.out.printf("%.2f%n", 1234567.891);
        System.out.printf("%.2f%n", 2.5f);
        System.out.printf("%.2f%n", 0.1f);
        System.out.printf("%.10f%n", 0.1f);
        System.out.printf("%.0f %.0f %.0f%n", 0.4, -0.4, -0.6);
        String teks = String.format("%.2f", 9.999);
        System.out.println("String.format(\"%.2f\", 9.999) = " + teks);
        double ipk = 3.4567;
        System.out.printf("IPK: %.2f, dibulatkan ke satu desimal: %.1f%n", ipk, ipk);
    }
}
