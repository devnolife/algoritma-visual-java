// printf dengan argumen float (diperlebar ke double), flag gabungan, dan %o/%X pada long/short negatif
public class Main {
    public static void main(String[] args) {
        float f1 = 0.35f;
        double d1 = 0.35;
        System.out.printf("0.35f: %.1f | 0.35: %.1f | valueOf: %s%n", f1, d1, String.valueOf(f1));
        float f2 = 1.005f;
        System.out.printf("1.005f: %.2f | 1.005: %.2f%n", f2, 1.005);
        System.out.printf("%e | %.3e%n", 1.5e-7f, 123456.7f);
        System.out.printf("%s | %s | %s%n", 1e10f, -0.0, 100.0f / 3);
        System.out.printf("[%10.4f] [%-10.1e] [%08.3f]%n", Math.PI, -12345.678, -2.5);
        System.out.printf("[% ,d] [%+,.2f] [%,.3f]%n", 1234567, 9876.543, -1234.5678);
        System.out.printf("[%o] [%X] [%x]%n", -1L, (short) -2, (byte) 127);
        System.out.printf("[%.0e] [%.1e]%n", 0.5, 9.96);
        System.out.printf("[%-12s] [%12S]%n", "kiri", "kanan");
        System.out.printf("[%5.1f%%] [%-6d%%]%n", 99.95, 50);
        long besar = 9_876_543_210L;
        System.out.printf("[%,d] [%015d] [%-15d]%n", besar, besar, besar);
        double[] uang = {0.5, 1.5, 2.5, 1234.005, -0.005};
        for (double u : uang) {
            System.out.printf("%s -> [%.2f] [%.0f]%n", u, u, u);
        }
    }
}
