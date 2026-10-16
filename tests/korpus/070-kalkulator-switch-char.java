// Kalkulator sederhana: switch char operator, pemeriksaan pembagian nol, int vs double
public class Main {
    static double hitung(double a, char op, double b) {
        switch (op) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case 'x':
            case '*':
                return a * b;
            case '/':
                if (b == 0) {
                    System.out.println("  peringatan: pembagian dengan nol");
                }
                return a / b;
            case '%':
                return a % b;
            case '^':
                return Math.pow(a, b);
            default:
                System.out.println("  operator '" + op + "' tidak dikenal");
                return Double.NaN;
        }
    }

    static int hitungInt(int a, char op, int b) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b == 0 ? 0 : a / b;
            default: return 0;
        }
    }

    public static void main(String[] args) {
        char[] ops = {'+', '-', '*', 'x', '/', '%', '^', '?'};
        for (char op : ops) {
            System.out.println("17 " + op + " 5 = " + hitung(17, op, 5));
        }
        System.out.println("1 / 0 = " + hitung(1, '/', 0));
        System.out.println("-1 / 0 = " + hitung(-1, '/', 0));
        System.out.println("0 / 0 = " + hitung(0, '/', 0));
        System.out.println("Int: 17 / 5 = " + hitungInt(17, '/', 5) + ", 17 / 0 = " + hitungInt(17, '/', 0));
        System.out.println("Int: 7 * 6 = " + hitungInt(7, '*', 6));
    }
}
