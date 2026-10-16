// try bersarang: finally dalam berjalan sebelum catch luar; exception ditangkap, dicetak, lalu dilempar ulang ke pemanggil
public class Main {
    static int[] data = {4, 0, 7};

    static int proses(int i) {
        try {
            System.out.println("  proses(" + i + ") mulai");
            try {
                int hasil = 100 / data[i];
                System.out.println("  100 / " + data[i] + " = " + hasil);
                return hasil;
            } finally {
                System.out.println("  finally dalam untuk i=" + i);
            }
        } catch (ArithmeticException e) {
            System.out.println("  catch tengah: " + e + " -> lempar ulang");
            throw e;
        } finally {
            System.out.println("  finally tengah untuk i=" + i);
        }
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 3; i++) {
            try {
                int r = proses(i);
                System.out.println("main menerima " + r);
            } catch (ArithmeticException e) {
                System.out.println("main menangkap ArithmeticException: " + e.getMessage());
            } catch (RuntimeException e) {
                System.out.println("main menangkap " + e);
            }
            System.out.println("--");
        }
    }
}
