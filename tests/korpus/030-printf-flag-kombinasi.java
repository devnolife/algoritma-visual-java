// Kombinasi flag printf: -+, +, , 0 dengan lebar dan presisi, serta NaN/Infinity
public class Main {
    public static void main(String[] args) {
        System.out.printf("[%-+8d]%n", 42);
        System.out.printf("[%+,d]%n", 1234567);
        System.out.printf("[%0,12d]%n", 1234567);
        System.out.printf("[%+d]%n", 0);
        System.out.printf("[%+.2f]%n", 3.14159);
        System.out.printf("[% .2f]%n", 3.14159);
        System.out.printf("[%-8.2f]%n", 3.14159);
        System.out.printf("[%08.2f]%n", -3.5);
        System.out.printf("[%,.2f]%n", 1234567.891);
        System.out.printf("[%,f]%n", 9876.5);
        System.out.printf("[%+,10.1f]%n", -12345.67);
        System.out.printf("[%010d]%n", -42);
        System.out.printf("[%-10b]%n", true);
        System.out.printf("[%10.4s]%n", "Indonesia");
        System.out.printf("[%,d]%n", 999);
        System.out.printf("[%,d]%n", -1000);
        System.out.printf("[%,d]%n", Long.MAX_VALUE);
        System.out.printf("[%.0f]%n", 1e20);
        System.out.printf("[%,.0f]%n", 1e15);
        System.out.printf("[%e]%n", -0.0);
        System.out.printf("[%f]%n", -0.0);
        System.out.printf("[%f] [%f] [%f]%n", Double.NaN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY);
        System.out.printf("[%8.2f] [%-10.2f] [%+f]%n", Double.NaN, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY);
        System.out.printf("[%5.1f%%]%n", 45.678);
    }
}
