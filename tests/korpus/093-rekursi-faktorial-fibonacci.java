// Rekursi: faktorial long (dengan overflow di 21!), fibonacci, dan jumlah pemanggilan
public class Main {
    static int panggilan = 0;

    static long faktorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * faktorial(n - 1);
    }

    static int fib(int n) {
        panggilan++;
        if (n < 2) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }

    static int jumlahSampai(int n) {
        return n == 0 ? 0 : n + jumlahSampai(n - 1);
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 20; i += 5) {
            System.out.println(i + "! = " + faktorial(i));
        }
        System.out.println("21! = " + faktorial(21) + " (meluap)");
        String deret = "";
        for (int n = 0; n <= 10; n++) {
            deret += fib(n) + " ";
        }
        System.out.println("Fibonacci: " + deret.trim());
        panggilan = 0;
        int f12 = fib(12);
        System.out.println("fib(12) = " + f12 + " dengan " + panggilan + " pemanggilan");
        System.out.println("jumlahSampai(100) = " + jumlahSampai(100));
        System.out.println("jumlahSampai(150) = " + jumlahSampai(150));
    }
}
