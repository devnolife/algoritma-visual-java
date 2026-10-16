// Rekursi: FPB Euclid, pangkat cepat, jumlah digit, hitung mundur, dan balik string
public class Main {
    static int fpb(int a, int b) {
        return b == 0 ? a : fpb(b, a % b);
    }

    static long pangkat(long basis, int eksponen) {
        if (eksponen == 0) {
            return 1;
        }
        long setengah = pangkat(basis, eksponen / 2);
        if (eksponen % 2 == 0) {
            return setengah * setengah;
        }
        return setengah * setengah * basis;
    }

    static int jumlahDigit(int n) {
        if (n < 10) {
            return n;
        }
        return n % 10 + jumlahDigit(n / 10);
    }

    static void hitungMundur(int n) {
        if (n < 0) {
            System.out.println("Selesai!");
            return;
        }
        System.out.print(n + " ");
        hitungMundur(n - 1);
    }

    static String balik(String s) {
        if (s.length() <= 1) {
            return s;
        }
        return balik(s.substring(1)) + s.charAt(0);
    }

    public static void main(String[] args) {
        System.out.println("fpb(48, 18) = " + fpb(48, 18));
        System.out.println("fpb(17, 5)  = " + fpb(17, 5));
        System.out.println("fpb(0, 9)   = " + fpb(0, 9));
        System.out.println("fpb(-12, 8) = " + fpb(-12, 8));
        int a = 21, b = 6;
        System.out.println("kpk(21, 6)  = " + a / fpb(a, b) * b);
        System.out.println("2^10 = " + pangkat(2, 10));
        System.out.println("3^13 = " + pangkat(3, 13));
        System.out.println("2^62 = " + pangkat(2, 62));
        System.out.println("2^63 = " + pangkat(2, 63));
        System.out.println("(-2)^5 = " + pangkat(-2, 5));
        System.out.println("jumlahDigit(98765) = " + jumlahDigit(98765));
        hitungMundur(5);
        System.out.println("balik(rekursi) = " + balik("rekursi"));
    }
}
