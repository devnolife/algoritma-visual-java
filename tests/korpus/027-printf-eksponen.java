// Format notasi ilmiah %e dan %E dengan presisi dan lebar
public class Main {
    public static void main(String[] args) {
        double[] data = {12345.678, 0.000123, 1.0, 0.0, -98765.4321, 6.02e23, 1e-10, 9.9999999};
        for (double d : data) {
            System.out.printf("%e | %E | %.2e | %12.3e |%n", d, d, d, d);
        }
        System.out.printf("%.0e%n", 15000.0);
        System.out.printf("%.0e%n", 25000.0);
        System.out.printf("%e%n", 1.5f);
        System.out.printf("%e%n", 100.0);
        String s = String.format("%.3E", Math.PI * 1000);
        System.out.println("PI*1000 = " + s);
        System.out.println(String.format("Massa elektron = %.4e kg", 9.1093837e-31));
        System.out.printf("[%-14e]%n", 0.5);
        System.out.printf("[%+.1e]%n", 12.0);
    }
}
