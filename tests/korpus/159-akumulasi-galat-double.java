// Akumulasi galat double: loop berlangkah 0.1, perbandingan dengan toleransi, dan pembulatan uang
public class Main {
    public static void main(String[] args) {
        int putaran = 0;
        double terakhir = 0;
        for (double d = 0; d <= 1.0; d += 0.1) {
            putaran++;
            terakhir = d;
        }
        System.out.println("Putaran loop 0..1 langkah 0.1: " + putaran + ", nilai terakhir " + terakhir);
        double jumlah = 0;
        for (int i = 0; i < 10; i++) {
            jumlah += 0.1;
        }
        System.out.println("jumlah == 1.0 ? " + (jumlah == 1.0));
        System.out.println("|jumlah - 1.0| < 1e-9 ? " + (Math.abs(jumlah - 1.0) < 1e-9));
        System.out.println("0.1 + 0.2 == 0.3 ? " + (0.1 + 0.2 == 0.3));
        System.out.println("0.1f + 0.2f == 0.3f ? " + (0.1f + 0.2f == 0.3f));
        System.out.println("(float) 0.1 == 0.1 ? " + ((float) 0.1 == 0.1));
        double harga = 2.675;
        System.out.println("2.675 * 100 = " + harga * 100);
        System.out.println("Math.round(2.675 * 100) / 100.0 = " + Math.round(harga * 100) / 100.0);
        System.out.printf("printf %%.2f dari 2.675 = %.2f%n", harga);
        double saldo = 0;
        for (int i = 0; i < 3; i++) {
            saldo += 0.07;
        }
        System.out.println("0.07 x 3 = " + saldo);
        System.out.println("1.1 * 1.1 = " + 1.1 * 1.1);
        System.out.println("1 - 0.9 = " + (1 - 0.9));
        System.out.println("3 * 0.1 = " + 3 * 0.1);
        System.out.println("0.3 / 0.1 = " + 0.3 / 0.1);
        System.out.println("(int) (0.3 / 0.1) = " + (int) (0.3 / 0.1));
        long sen = Math.round(19.99 * 100);
        System.out.println("19.99 dalam sen = " + sen);
        double besar = 1e16;
        System.out.println("1e16 + 1 = " + (besar + 1) + ", 1e16 + 2 = " + (besar + 2));
    }
}
