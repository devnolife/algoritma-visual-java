// ArithmeticException: pembagian int dengan nol di dalam method setelah beberapa keluaran
public class Main {
    static int bagi(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        int[] penyebut = {4, 2, 1, 0, 5};
        int total = 100;
        System.out.println("100.0 / 0 = " + (100.0 / 0));
        for (int p : penyebut) {
            System.out.println(total + " / " + p + " = " + bagi(total, p));
        }
        System.out.println("baris ini tidak pernah tercetak");
    }
}
